/* ***** BEGIN LICENSE BLOCK *****
 * Version: GPL 3.0
 *
 * The contents of this file are subject to the General Public License
 * 3.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.gnu.org/licenses/gpl.html
 */

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils; 

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://interfaces/xml2json/xml2json.js");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource:///modules/iteratorUtils.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Cu.import("resource://exchangecalendar/erGetItems.js");
Cu.import("resource://exchangecalendar/erFindInboxFolder.js");
Cu.import("resource://exchangecalendar/erSubscribe.js"); 
Cu.import("resource://exchangecalendar/erGetEvents.js");
Cu.import("resource://exchangecalendar/erFindItems.js");
Cu.import("resource://exchangecalendar/erUpdateItem.js");


var eventTypes = ["NewMailEvent","ModifiedEvent","MovedEvent","CopiedEvent","CreatedEvent"];
 
if ( typeof (rtews) == "undefined") 
var rtews = {
    globalFunctions : Cc["@1st-setup.nl/global/functions;1"]
	             				.getService(Ci.mivFunctions),  
	calPrefs	: null,  
 	user 		: null,
 	mailbox  	: null,
 	serverUrl 	: null,	
 	identities  : null,
	session 	: {
					subscriptionId:"",
					watermark:"",
					},		
	
	pollOffset : 10000 ,//time for getevents
	
    folderByEwsId : {},
    folderByImapPath : {},
    foldersByIdentity : {}, 
}; 
/*
 * @Constructor
 * Message updater
 *
 */
rtews.UpdateMessage = function(updates) {
    this.updates = updates;
    this.pendingUpdates = [];
    this.pendingAttempts = 0;
};

rtews.UpdateMessage.prototype = {
    update : function() {
        var that = this;
        var messageId = this.updates[0].msgId;
        var tags = this.updates[0].tags;
        var folderPath = this.updates[0].path;

        that.searchGloda(messageId, folderPath, function(msgHdrs) {
            rtews.globalFunctions.LOG("UpdateMessage.update "+ folderPath + " : " + messageId);
            
            if (msgHdrs.length == 0) {
            	rtews.globalFunctions.LOG("UpdateMessage.update: Message not found in database with id " + messageId);
                that.pendingUpdates.push(that.updates[0]);
            } else {
                for (var x = 0; x < msgHdrs.length; x++) {
                    rtews.removeAllMessageTagsPostEwsUpdate(msgHdrs[x]);
                    if (tags.length > 0) {
                        that.addKeywordsToMessage(msgHdrs[x], tags);
                    }
                }
            }

            that.updates.shift();

            if (that.updates.length > 0) {
                that.update();
            } else {
                if (that.pendingUpdates.length > 0 && that.pendingAttempts < 60) {
                    setTimeout(function() {
                        that.updates = that.pendingUpdates;
                        that.pendingUpdates = [];
                        that.update();
                        that.pendingAttempts++;
                    }, 2000);
                }
            }
        });

    },

    /*
     * Upated message with categories received
     */
    addKeywordsToMessage : function(msgHdr, keywords) {
        try {
            var messages = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
            messages.appendElement(msgHdr, false);

            var toggler = "addKeywordsToMessages";
            for (var t = 0; t < keywords.length; t++) {
                msgHdr.folder[toggler](messages, keywords[t]);
            }
        } catch(e) {
        	rtews.globalFunctions.LOG("rtews.addKeywordsToMessage"+ e);
        }

        OnTagsChange();
    },

    /*
     * Search the GLODA for message
     *
     */
    searchGloda : function(messageId, folderPath, callback) {
        try {
            var query = Gloda.newQuery(Gloda.NOUN_MESSAGE);
            query.headerMessageID(messageId);

            var queryListener = {
                /* called when new items are returned by the database query or freshly indexed */
                onItemsAdded : function queryListener_onItemsAdded(aItems, aCollection) {
                },
                /* called when items that are already in our collection get re-indexed */
                onItemsModified : function queryListener_onItemsModified(aItems, aCollection) {
                },
                /* called when items that are in our collection are purged from the system */
                onItemsRemoved : function queryListener_onItemsRemoved(aItems, aCollection) {
                },
                /* called when our database query completes */
                onQueryCompleted : function queryListener_onQueryCompleted(aCollection) {
                    var msgHdrs = [];
                    try {
                        for (var j = 0; j < aCollection.items.length; j++) {
                            if (aCollection.items[j].folder.uri.toLowerCase().endsWith(folderPath.toLowerCase())) {
                                if (aCollection.items[j].folderMessage != null) {
                                    msgHdrs.push(aCollection.items[j].folderMessage);
                                }
                            }
                        }
                        callback(msgHdrs);
                    } catch (e) {
                    	rtews.globalFunctions.LOG("Gloda serch complete"+ e);
                        callback(msgHdrs);
                    }
                }
            };
            var collection = query.getCollection(queryListener);
        } catch(e) {
        	rtews.globalFunctions.LOG("Gloda serch"+ e);
        }
    }
};
 
rtews.Tags = {
    tagService : Cc["@mozilla.org/messenger/tagservice;1"].getService(Ci.nsIMsgTagService),

    getKeyForTag : function(name) {
        return this.tagService.getKeyForTag(name) ? this.tagService.getKeyForTag(name) : null;
    },

    getTagForKey : function(key) {
        try {
            return this.tagService.getTagForKey(key);
        } catch (e) {

        }
        return null;
    },

    getTagsForKeys : function(keys) {
        var tags = []; 
        for (var x = 0; x < keys.length; x++) {
            var tag = this.getTagForKey(keys[x]);
            if (tag != null) {
                tags.push(tag);
            }
        } 
        return tags;
    },

    addTag : function(name) {
        this.tagService.addTag(name, "", ""); 
        return this.getKeyForTag(name);
    }
};
/*
 * Fetch configured identity based on the email
 */
rtews.getIdentity = function(server) {
    var ids = rtews.identities;
    for (var x = 0, len = ids.length; x < len; x++) {
        if (ids[x] && ids[x].enabled == true && ids[x].server == server) {
            return ids[x];
        }
    }
    return null;
};

/*
 * Gets the ItemId element from response of the FindItem SOAP request
 *
 */

rtews.findFolders = function(identity){
    this.globalFunctions.LOG("findFolders:" ); 
	this.identity = identity;
	var self = this;
	var tmpObject = new  erFindInboxFolderRequest(
							{user:this.user, 
							mailbox: this.mailbox  ,
							serverUrl:this.serverUrl,
							folderBase: "msgfolderroot",
							folderPath: "",
							actionStart: Date.now()}, 
							function(erFindInboxFolderRequest, folders) { self.findFoldersOK(erFindInboxFolderRequest, folders);}, 
							function(erFindInboxFolderRequest, aCode, aMsg) { self.findFoldersError(erFindInboxFolderRequest, aCode, aMsg);},
							null);  
};

rtews.findFoldersOK = function(erFindInboxFolderRequest, folders){
	this.globalFunctions.LOG("findFoldersOK: " + folders );
	this.processFolders(folders,this.identity);
	var folders = this.getFoldersByIdentity(this.identity); 
     
	if (folders.length > 0) {
		   this.subscribe(folders); 
    } 
};
 
rtews.subscribe  = function(folders){
	this.globalFunctions.LOG("Subscribe: ");
  	var self = this;
  	var tmpObject = new erSubscribeRequest(
			   		{user: this.user, 
			   		mailbox: this.mailbox,
			   		serverUrl: this.serverUrl,
			   		folderBase: "",
		   			changeKey: "" ,
		   			folderIds : folders,
		   			actionStart: Date.now(),
		   			timeout: "10",
		   			eventTypes : eventTypes , }, 
		   			function(erSubscribeRequest, subscriptionId, watermark) { self.subscribeOK(erSubscribeRequest, subscriptionId, watermark);}, 
		   			function(erSubscribeRequest, aCode, aMsg) { self.subscribeError(erSubscribeRequest, aCode, aMsg);},
		   			null);
}; 

rtews.subscribeOK  = function(erSubscribeRequest, subscriptionId, watermark){
	this.globalFunctions.LOG("subscribeOK " + subscriptionId +  " watermark  " + watermark );
	this.session.subscriptionId=subscriptionId;
	this.session.watermark=watermark;
	this.poll();
};

rtews.poll = function() {
    var self = this;
    this.Running = false; 
    this.pollInterval = setInterval(function() { 
		if (self.session == null) {
	        return;
	    }  
		if ( self.Running == true )  {
	        	 self.globalFunctions.LOG("getEvents is in process..");
	        	 return; 
		} 
        //Check for new event on the mail box
		self.getEvents(); 
    }, this.pollOffset );
},
   
rtews.getItemsError = function(erGetItemsRequest, aCode, aMsg){ 
	this.globalFunctions.LOG("getItemsError: "+ aMsg);
};
 
rtews.getItemsOK = function(erGetItemsRequest, aItems, aItemErrors){ 
	this.globalFunctions.LOG("getItemsOK: Received items for update: " + aItems.length); 
 	if( aItems.length > 0 ){
	function getItem(aItem){ 
	   	let id = xml2json.getAttributeByTag(aItem,'t:ItemId','Id'); 
	   	let changeKey = xml2json.getAttributeByTag(aItem,'t:ItemId','ChangeKey');  
        return { "Id" : id , "ChangeKey": changeKey, };
	}  
	
	function getParentItem(aItem){ 
	   	let id = xml2json.getAttributeByTag(aItem,'t:ParentFolderId','Id'); 
	   	let changeKey = xml2json.getAttributeByTag(aItem,'t:ParentFolderId','ChangeKey');  
        return { "Id" : id , "ChangeKey": changeKey, };
	}  
	
	for(var item = 0 ; item < aItems.length ; item++ ){ 
 		var itemId = getItem(aItems[item]);  
        var parentItemId = getParentItem(aItems[item]);  
        
        var messageIdElm = xml2json.XPath(aItems[item],"/t:ExtendedProperty[t:ExtendedFieldURI/@PropertyTag = '0x1035']");
        var messageId;
        if (messageIdElm.length > 0) {
			 messageId =  xml2json.getTagValue(messageIdElm[0], "t:Value", null);
		} 
        
        messageId = messageId.replace('<', '').replace('>', '');

        if (!messageId) {
            continue;
        }
        
        var categories = [];
        var tags = []; 
       
        var categoriesElm = xml2json.XPath(aItems[item],'/t:Categories/t:String');
        for(var index = 0 ; index < categoriesElm.length ; index++ ) {  
        	categories.push(categoriesElm[index].c); 
        }
      
        if ( categories.length > 0 ) {
              var errCategory = [];
 
            for(var index = 0 ; index < categories.length ; index++ ) {  
            	var category = categories[index]; 
            	
            	if(category){
	                var tKey = rtews.Tags.getKeyForTag(category);
	
                     if (tKey != null) {
                        tags.push(tKey);
                    } 
                    else {
                        var newTagKey = rtews.Tags.addTag(category);

                        if (newTagKey != null) {
                             tags.push(newTagKey);
                        } 
                        else {
                             errCategory.push(category);
                        }
                    }
            	}
            }
             //Prompt categories that were not converted to tags.
            if (errCategory.length) {
                var stringBundle = document.getElementById("string-bundle");
                Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService).alert(null, stringBundle.getString("rtews.title"), stringBundle.getString("rtews.tagAddError") + " " + errCategory.join(", "));
            } 
        } 
 	}
	var updates = []; 
   	var folderEwsId = this.gerFolderByEwsId(parentItemId.Id);
	this.globalFunctions.LOG("getItemsOK: Going to tag update: " + messageId+  ":" +  folderEwsId.path  +  ":" +  tags);

	if ( folderEwsId != null) {
	        updates.push({
	            msgId : messageId,
	            tags : tags,
	            path : folderEwsId.path
	        }); 
	}
	
	if (updates.length) {
	    setTimeout(function() {
	        var updateMsg = new rtews.UpdateMessage(updates);
	        updateMsg.update();
	    }, 500);
	}  
 	}
};

rtews.getAndUpdateItems = function(aIds) { 
	
	var that = this;   
	var tmpObject = new erGetItemsRequest(
			{user: this.user, 
			 mailbox:  this.mailbox,
 			 serverUrl:  this.serverUrl,
			 ids:  aIds,
 			 folderClass: "IPM.Note",  }, 
			function(erGetItemsRequest, aIds, aItemErrors) { that.getItemsOK(erGetItemsRequest, aIds, aItemErrors);}, 
			function(erGetItemsRequest, aCode, aMsg) { that.getItemsError(erGetItemsRequest, aCode, aMsg);},
			null);  
};
 
rtews.getEvents = function(){ 
	var that = this;
	that.Running = true; 
	      
	var tmpObject = new erGetEventsRequest(
					{user: this.user, 
					mailbox: this.mailbox,
					serverUrl: this.serverUrl, 
					actionStart: Date.now(),
					subscriptionId :  that.session.subscriptionId ,
					watermark :  that.session.watermark , }, 
					function(erGetEventsRequest, aResp) {  getEventsOK(erGetEventsRequest, aResp);}, 
					function(erGetEventsRequest, aCode, aMsg) {  getEventsError(erGetEventsRequest, aCode, aMsg);},
					null);  
	    
	function getEventsOK(erGetEventsRequest, response){ 
		that.globalFunctions.LOG("getEventsOK:"); 
		if(response.length > 0 ){ 
			var note = response[0].XPath("/m:GetEventsResponseMessage/m:Notification");
			var subscriptionId  = note[0].getTagValue("t:SubscriptionId");
			var moreEvents  = note[0].getTagValue("t:MoreEvents");
			var previousWatermark = note[0].getTagValue("t:PreviousWatermark");  
			 
		    var _Watermark = response[0].XPath("/m:GetEventsResponseMessage/m:Notification/*/t:Watermark");  
		    var watermark =  _Watermark[_Watermark.length-1].value;
			 
			that.session.watermark = watermark;
		    that.Running = false; 
		    
			var itemIds = []; 
			var _itemIds = response[0].XPath("/m:GetEventsResponseMessage/m:Notification/*/t:ItemId"); 
   				if( _itemIds.length > 0) {
  					for ( var index = 0 ; index < _itemIds.length ; index++ ){ 
	  					itemIds.push(_itemIds[index]);
  					}
  				}  
  			    
  				if (itemIds.length == 0) {
  			        return;
  			    }
  
  				var  oldItemIds = [];
  				var _oldItemIds = response[0].XPath("/m:GetEventsResponseMessage/m:Notification/*/t:OldItemId"); 
			if( _oldItemIds.length > 0) {
				for ( var index = 0 ; index < _oldItemIds.length ; index++ ){ 
  					oldItemIds.push(_oldItemIds[index]);
				}
			}    
			var newItemIds = [];
			if (oldItemIds.length > 0) {
  		        for (var itemId = 0; itemId < itemIds.length; itemId++) {
  		            var id = itemIds[itemId].getAttribute("Id");
  		            
  		            for (var oldItemId = 0; oldItemId < oldItemIds.length; oldItemId++) {
  		                var oId = oldItemIds[oldItemId].getAttribute("Id");
  		                if (id != oId) {
  		                    newItemIds.push(itemIds[itemId]);
  		                }
  		            }
  		        }
  		    } 
  			else {
  				newItemIds = itemIds.splice(0);;
  		    }
			
			function getItem(aItem){ 
			   	let id = aItem.getAttribute('Id'); 
				let changeKey = aItem.getAttribute('ChangeKey');  
				return { "Id" : id , "ChangeKey": changeKey, };
			}  
			
		   if ( newItemIds.length == 0)  return;  
		   var itemList = []; 
		   for(var index = 0; index < newItemIds.length; index++) { 
			 itemList.push( getItem(newItemIds[index] ));
		   } 
		   try{
			   that.getAndUpdateItems(itemList);
		   }
		   catch(e){}
			  
		}
		else{ 
			that.Running = false;
		}
	};  
	   
    function getEventsError(erGetEventsRequest, aCode, aMsg){
		that.globalFunctions.LOG("getEventsError aCode:" + aCode + " aMsg: " +  aMsg );  
		that.Running = false ;  
	};  
};
  
rtews.subscribeError = function(erSubscribeRequest, aCode, aMsg){ 
	this.globalFunctions.LOG("subscribeError aCode:" + aCode + " aMsg: " +  aMsg ); 
};

rtews.getFoldersByIdentity = function(identity) {
    return this.foldersByIdentity[this.identity.email] != undefined ? this.foldersByIdentity[this.identity.email] : null;
};

rtews.gerFolderByEwsId = function(id) {
    return this.folderByEwsId[id] != undefined ? this.folderByEwsId[id] : null;
};

rtews.gerFolderByImapPath = function(path) {
    return this.folderByImapPath[path.toLowerCase()] != undefined ? this.folderByImapPath[path.toLowerCase()] : null;
};
 
rtews.findFoldersError = function(erFindInboxFolderRequest, aCode, aMsg){
	this.globalFunctions.LOG("findFoldersError aCode:" + aCode + " aMsg: " +  aMsg ); 
};

rtews.processFolders = function(response, identity) {  
	    
    function Folder(id, name, parentId, changeKey) {
       this.id = id;
       this.name = name;
       this.pId = parentId;
       this.changeKey = changeKey;
       this.path = "";
    };

    var folderElms = response;
    var folders = [];
    var obj = {};

    for (var x = 0, len = folderElms.length; x < len; x++) {
       var folderClass = folderElms[x].folderClass;
       if (folderClass == "IPF.Note") {
           var fId = folderElms[x].id;
           var fName = folderElms[x].name;
           var fPId = folderElms[x].pId;
           
           var fo = new Folder(fId, fName, fPId, fId.changeKey);

           obj[fId] = fo;
       }
    } 
   //Find path of the folder
    var __parents = [];
   //Find parent of the given objects. Loops parent of parent to build the path
    function getParent(o) {
       var parent = obj[o.pId]; 
       __parents.push(o.name); 
       if (parent) {
           getParent(parent);
       }
    } 
    this.foldersByIdentity[identity.email] = []; 
    for (var p in obj) {
       __parents = []; 
       getParent(obj[p]); 
       var path = [];
       path.push(identity.serverURI);
       path.push(__parents.reverse().join("/")); 
       obj[p].path = path.join("/").toLowerCase(); 
       folders.push(obj[p]); 
       this.folderByEwsId[obj[p].id] = obj[p];
       this.folderByImapPath[obj[p].path] = obj[p];
       this.foldersByIdentity[identity.email].push(obj[p]);
    }
};
 
/*
 * Initialize each identity. 
 *
 */
rtews.processIdentity = function(identity) {
    this.findFolders(identity); 
};

rtews.addSyncMenu = function(menuPopup) {
    var newMenuItem = document.createElement("menuitem");
    newMenuItem.setAttribute('oncommand', 'rtews.syncTags(event.target);');
    newMenuItem.setAttribute("label", "EWS Sync Tags");
    menuPopup.appendChild(newMenuItem);

    var newMenuSeperator = document.createElement("menuseparator");
    newMenuSeperator.setAttribute("id", "mailContext-sep-afterTagSync");
    menuPopup.appendChild(newMenuSeperator);
}; 
/*
 * Event handler for Sync Tags menu item.
 *
 */
rtews.syncTags = function() {
    var selectedMessages = gFolderDisplay.selectedMessages;
    var that = this;
    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];
        var messageId = '<' + msgHdr.messageId + '>';
        var folder = this.gerFolderByImapPath(msgHdr.folder.URI);

        this.globalFunctions.LOG("rtews.syncTags folder:" + JSON.stringify(folder) + " " + messageId);

        if (!folder) {
            continue;
        }
     
        var tmpObject = new erFindItemsRequest(
				{user: this.user, 
				mailbox: this.mailbox,
				serverUrl: this.serverUrl, 
				actionStart: Date.now(),
				folderID : folder.id ,
				messageId: messageId, }, 
				function(erFindItemsRequest, aIds) { findItemsOK(erFindItemsRequest, aIds);}, 
				function(erFindItemsRequest, aCode, aMsg) {  findItemsError(erFindItemsRequest, aCode, aMsg);},
				null);  
        
        function findItemsOK(erFindItemsRequest, aIds){
        	that.globalFunctions.LOG("findItemsOK: Fount items: " + aIds.length ); 
        	if( aIds.length > 0 ){  
    			   that.getAndUpdateItems(aIds); 
         	}
        	else{
        		that.globalFunctions.LOG("findItemsOK: no item found for the message id"); 
        	}
        } 
        
        function findItemsError(erFindItemsRequest, aCode, aMsg){
            that.globalFunctions.LOG("findItemsError:  aCode:" + aCode + " aMsg: " +  aMsg ); 
        }  
    } 
};   
/*
 * Updates the tags (categories) on exchange server before updating locally.
 *
 */
rtews.toggleTags = function(msgHdr, identity, toggleType, categories, key, addKey) {
    var ewsObj = identity.ewsObj;
    var folder = this.gerFolderByImapPath(msgHdr.folder.URI);
    var messageId = '<' + msgHdr.messageId + '>';

    this.globalFunctions.LOG("rtews.toggleTags folder:"+ JSON.stringify(folder) + " " + messageId);
    var that = this;
    if (!folder) {
        return;
    }
    
    var tmpObject = new erFindItemsRequest(
			{user: this.user, 
			mailbox: this.mailbox,
			serverUrl: this.serverUrl, 
			actionStart: Date.now(),
			folderID : folder.id ,
			messageId: messageId, }, 
			function(erFindItemsRequest, aIds) {  findItemsOK(erFindItemsRequest, aIds);}, 
			function(erFindItemsRequest, aCode, aMsg) {  findItemsError(erFindItemsRequest, aCode, aMsg);},
			null);  
    
    function findItemsOK(erFindItemsRequest, aIds){
    	that.globalFunctions.LOG("findItemsOK: Fount items: " + aIds.length ); 
    	if( aIds.length > 0 ){  
    		that.updateItem(aIds,msgHdr, identity, toggleType, categories, key, addKey); 
     	}
    	else{
        	 that.globalFunctions.LOG("findItemsOK: no item found for the message id"); 
    	}
    } 
    
    function findItemsError(erFindItemsRequest, aCode, aMsg){
        that.globalFunctions.LOG("findItemsError:  aCode:" + aCode + " aMsg: " +  aMsg ); 
    }  
}; 

rtews.updateItem = function(aIds, msgHdr, identity, toggleType, categories, key, addKey){  
	this.globalFunctions.LOG("updateItem: aIds " + aIds.length + " ,   toggleType " + toggleType );
	
	var that = this;
		
	var item = aIds[0]; 
	
	var changes =  '<nsTypes:ItemChange>';
		changes += '<nsTypes:ItemId Id="' + item.Id + '" ChangeKey="' + item.ChangeKey + '" />';
    	changes += '<nsTypes:Updates>';
		changes += '<nsTypes:SetItemField>';
		changes += '<nsTypes:FieldURI FieldURI="item:Categories"/>';
		changes += '<nsTypes:Message>';
		changes += '<nsTypes:Categories>'; 
		if( categories.length > 0 ){
		   for (var index  in  categories  ) {
				changes += '<nsTypes:String>' + categories[index] + '</nsTypes:String>';
		    } 
		}  
	    changes += '</nsTypes:Categories>'; 
	    changes += '</nsTypes:Message>';
	    changes += '</nsTypes:SetItemField>';
	    changes += '</nsTypes:Updates>';
	    changes += '</nsTypes:ItemChange>';
  
	this.globalFunctions.LOG("updateItem: changes " + changes);

    var tmpObject = new erUpdateItemRequest({user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: this.folderBase,
			 serverUrl: this.serverUrl,
  			 updateReq: changes,
 	 		 actionStart: Date.now(),
 			 onlySnoozeChanges:false, }, 
			function(erUpdateItemRequest, aId, aChangeKey) {  updateItemOK(erUpdateItemRequest, aId, aChangeKey);}, 
			function(erUpdateItemRequest, aCode, aMsg) {  updateItemError(erUpdateItemRequest, aCode, aMsg);},
			null);
	
	
	function updateItemOK(erUpdateItemRequest, aId, aChangeKey){
		that.globalFunctions.LOG("updateItem OK:" + aId + " : " +  aChangeKey );  
		if (toggleType == "removeAll") { 
	        that.removeAllMessageTagsPostEwsUpdate();
	    } else { 
	        that.toggleMessageTagPostEwsUpdate(key, addKey);
	    }
	}
	
	function updateItemError(erUpdateItemRequest, aCode, aMsg){
        that.globalFunctions.LOG("updateItemError:  aCode:" + aCode + " aMsg: " +  aMsg );   
	}
}; 
/*
 * Custom method to handle tag menu click event
 *
 */   
rtews.toggleMessageTagPostEwsUpdate = function(key, addKey) {
    var messages = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
    var msg = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
    var selectedMessages = gFolderDisplay.selectedMessages;
    var toggler = addKey ? "addKeywordsToMessages" : "removeKeywordsFromMessages";
    var prevHdrFolder = null;
    // this crudely handles cross-folder virtual folders with selected messages
    // that spans folders, by coalescing consecutive msgs in the selection
    // that happen to be in the same folder. nsMsgSearchDBView does this
    // better, but nsIMsgDBView doesn't handle commands with arguments,
    // and (un)tag takes a key argument.
    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];

        if (msgHdr.label) {
            // Since we touch all these messages anyway, migrate the label now.
            // If we don't, the thread tree won't always show the correct tag state,
            // because resetting a label doesn't update the tree anymore...
            msg.clear();
            msg.appendElement(msgHdr, false);
            msgHdr.folder.addKeywordsToMessages(msg, "$label" + msgHdr.label);
            msgHdr.label = 0;
            // remove legacy label
        }
        if (prevHdrFolder != msgHdr.folder) {
            if (prevHdrFolder)
                prevHdrFolder[toggler](messages, key);
            messages.clear();
            prevHdrFolder = msgHdr.folder;
        }
        messages.appendElement(msgHdr, false);
    }
    if (prevHdrFolder)
        prevHdrFolder[toggler](messages, key);
    OnTagsChange();
};

/*
 * Custom method for remove all tags menuitem
 *
 */
rtews.removeAllMessageTagsPostEwsUpdate = function(msgHdr) {
    //Check if a message header is passed
    //Else use the selected messages
    if (msgHdr == undefined) {
        var selectedMessages = gFolderDisplay.selectedMessages;
    } else {
        var selectedMessages = [msgHdr];
    }

    if (!selectedMessages.length)
        return;

    var messages = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
    var tagService = Cc["@mozilla.org/messenger/tagservice;1"].getService(Ci.nsIMsgTagService);
    var tagArray = tagService.getAllTags({});

    var allKeys = "";
    for (var j = 0; j < tagArray.length; ++j) {
        if (j)
            allKeys += " ";
        allKeys += tagArray[j].key;
    }

    var prevHdrFolder = null;
    // this crudely handles cross-folder virtual folders with selected messages
    // that spans folders, by coalescing consecutive messages in the selection
    // that happen to be in the same folder. nsMsgSearchDBView does this better,
    // but nsIMsgDBView doesn't handle commands with arguments, and untag takes a
    // key argument. Furthermore, we only delete legacy labels and known tags,
    // keeping other keywords like (non)junk intact.

    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];
        msgHdr.label = 0;
        // remove legacy label
        if (prevHdrFolder != msgHdr.folder) {
            if (prevHdrFolder)
                prevHdrFolder.removeKeywordsFromMessages(messages, allKeys);
            messages.clear();
            prevHdrFolder = msgHdr.folder;
        }
        messages.appendElement(msgHdr, false);
    }
    if (prevHdrFolder)
        prevHdrFolder.removeKeywordsFromMessages(messages, allKeys);
    OnTagsChange();
};  

/*
 *  Initialize 
 */
rtews.load = function() {
    var that = this; 
    this.identities = getAllAccounts(); 
    
    this.user = this.identities[0].domain +"\\"+this.identities[0].username ;
    this.mailbox = this.identities[0].email ;
    this.serverUrl = this.identities[0].ewsUrl ;
   
    
    var active = false;
    
    for (var account = 0, len = this.identities.length; account < len; account++) {
        if (that.identities[account].ewsUrl && that.identities[account].enabled) {
            if(!active){
            that.processIdentity(that.identities[account]);} 
            
            active = true; 
     //       that.globalFunctions.LOG("xxxxxxxxxxxxxxxxx account: " + that.identities[account].email +  JSON.stringify(that.identities[account]) );
        }
    } 
 };
 
function getAllAccounts(){
    
	var _accounts = [];
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                                     .getService(Components.interfaces.nsIXULAppInfo);
     var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                                .getService(Components.interfaces.nsIVersionComparator);
      var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
                         .getService(Components.interfaces.nsIMsgAccountManager);
     var accounts = acctMgr.accounts;
     if (versionChecker.compare(appInfo.version, "20.0") >= 0){
    	 for (var i = 0; i < accounts.length; i++) {
         	     
         	    	var account = accounts.queryElementAt(i, Components.interfaces.nsIMsgAccount);   
         			var identities = account.identities;
         			for (var index=0; index < identities.length; index++) {
         				var identity = identities.queryElementAt(index, Ci.nsIMsgIdentity);
         				var calAccount = getCalendarAccount(identity.email); 
         				 
         				var enabled = false;
         				
         				if(calAccount){
         					enabled = true;
         				} 
         			
         				try{
 						var details = {
	 						"server":account.incomingServer.prettyName,
							"serverURI":account.incomingServer.serverURI,
	                	  	"email":calAccount.getCharPref("ecMailbox"),
	                	  	"username":calAccount.getCharPref("ecUser"),
	                	  	"name":identity.fullName,
	                	  	"domain":calAccount.getCharPref("ecDomain"),
	                 	  	"enabled":enabled,
	                	  	"ewsUrl":calAccount.getCharPref("ecServer"),};
         				}catch(e){}
         				 
         				_accounts.push(details);  
          			} 
          }
     }
     else{
	 		for (let i = 0; i < accounts.Count(); i++) {  
        	     
     	    	var account = accounts.queryElementAt(i, Components.interfaces.nsIMsgAccount);   
     			var identities = account.identities;
     			for (let index=0; index < identities.length; index++) {
     				let identity = identities.queryElementAt(index, Ci.nsIMsgIdentity);
     				let calAccount = getCalendarAccount(identity.email);
     				 
     				let enabled = false;
     				
     				if(calAccount){
     					enabled = true;
     				} 
     			
     				try{
						let details = {
 						"server":account.incomingServer.prettyName,
						"serverURI":account.incomingServer.serverURI,
                	  	"email":calAccount.getCharPref("ecMailbox"),
                	  	"username":calAccount.getCharPref("ecUser"),
                	  	"name":identity.fullName,
                	  	"domain":calAccount.getCharPref("ecDomain"),
                 	  	"enabled":enabled,
                	  	"ewsUrl":calAccount.getCharPref("ecServer"),};
     				}catch(e){}
     				 
     				_accounts.push(details);  
      			}  
	 		}
     }  
	 return _accounts;
} 

function findAccountFromFolder(aFolder) {
    if (!aFolder)  
        return null;  
     var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                                     .getService(Components.interfaces.nsIXULAppInfo);
     var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                                .getService(Components.interfaces.nsIVersionComparator);
     var acctMgr = Components.classes["@mozilla.org/messenger/account-manager;1"]
                         .getService(Components.interfaces.nsIMsgAccountManager);
     var accounts = acctMgr.accounts;
     if (versionChecker.compare(appInfo.version, "20.0") >= 0){
    	 for (var i = 0; i < accounts.length; i++) {
         	    var account = accounts.queryElementAt(i, Components.interfaces.nsIMsgAccount); 

		        var rootFolder = account.incomingServer.rootFolder; // nsIMsgFolder  
		        if (rootFolder.hasSubFolders) {  
		            var subFolders = rootFolder.subFolders; // nsIMsgFolder  
		            while(subFolders.hasMoreElements()) {  
		                if (aFolder == subFolders.getNext().QueryInterface(Components.interfaces.nsIMsgFolder))  
		                    return account.QueryInterface(Components.interfaces.nsIMsgAccount);  
		            }  
		        }   
         }
     }
     else{
	 	for (let i = 0; i < accounts.Count(); i++) {
	 	    let account = accounts.QueryElementAt(i, Components.interfaces.nsIMsgAccount); 
	
	        let rootFolder = account.incomingServer.rootFolder; // nsIMsgFolder  
	        if (rootFolder.hasSubFolders) {  
	            let subFolders = rootFolder.subFolders; // nsIMsgFolder  
	            while(subFolders.hasMoreElements()) {  
	                if (aFolder == subFolders.getNext().QueryInterface(Components.interfaces.nsIMsgFolder))  
	                    return account.QueryInterface(Components.interfaces.nsIMsgAccount);  
	            }  
	    	}  
	     }
     }  
    return null;  
}

function getCalendarAccount(aEmail){ 
	if (!aEmail)  
		return null;
 
	///Get Calendar manager
	var calManager = Cc["@mozilla.org/calendar/manager;1"]
	        			.getService(Ci.calICalendarManager);
	var cals = calManager.getCalendars({});
	
	for( var i = 0; i < cals.length; i++ ){
		var cal = cals[i];
		if( cal.mailbox == aEmail ){  
			try{
				return Cc["@mozilla.org/preferences-service;1"]
				            .getService(Ci.nsIPrefService)
				            .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+  cal.id +".");
			}catch(e){}
			break;
		}
	} 
	return null;
 } 
/*
 * Overrides default method for applying tag.
 *
 */
function ToggleMessageTag(key, addKey) {
    var identity = rtews.getIdentity(gFolderDisplay.displayedFolder.server.prettyName);

    //if we don't have the id configured run the default toggle functionality
    if (identity == null) {
        rtews.toggleMessageTagPostEwsUpdate(key, addKey);
        return;
    }

    var selectedMessages = gFolderDisplay.selectedMessages;

    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];
        var keywords = Array.prototype.slice.call(msgHdr.getStringProperty('keywords').trim().split(" "));

        if (addKey) {
            keywords.push(key);
        } else {
            keywords.splice(keywords.indexOf(key), 1);
        }

        var categories = rtews.Tags.getTagsForKeys(keywords);

        rtews.toggleTags(msgHdr, identity, "single", categories, key, addKey);
    }
} 
/*
 * Overrides default remove all method.
 *
 */
function RemoveAllMessageTags() {
    var identity = rtews.getIdentity(gFolderDisplay.displayedFolder.server.prettyName);

    //if we don't have the id configured run the default toggle functionality
    if (identity == null) {
        rtews.removeAllMessageTagsPostEwsUpdate();
        return;
    }

    var selectedMessages = gFolderDisplay.selectedMessages;

    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];

        rtews.toggleTags(msgHdr, identity, "removeAll", []);
    }
} 
/*
 * Overrides default method for initialize tag menu
 *
 */
function InitMessageTags(menuPopup) {
    var tagService = Cc["@mozilla.org/messenger/tagservice;1"].getService(Ci.nsIMsgTagService);
    var tagArray = tagService.getAllTags({});
    var tagCount = tagArray.length;

    // Remove any existing non-static entries... (clear tags list before rebuilding it)
    // "5" is the number of menu items (including separators) on the top of the menu
    // that should not be cleared.
    for (var i = menuPopup.childNodes.length; i > 5; --i)
        menuPopup.removeChild(menuPopup.lastChild);

    // create label and accesskey for the static remove item
    var tagRemoveLabel = document.getElementById("bundle_messenger").getString("mailnews.tags.remove");
    SetMessageTagLabel(menuPopup.lastChild.previousSibling, 0, tagRemoveLabel);

    rtews.addSyncMenu(menuPopup);

    // now rebuild the list
    var msgHdr = gFolderDisplay.selectedMessage;
    var curKeys = msgHdr.getStringProperty("keywords");
    if (msgHdr.label)
        curKeys += " $label" + msgHdr.label;

    for (var i = 0; i < tagCount; ++i) {
        var taginfo = tagArray[i];
        // TODO we want to either remove or "check" the tags that already exist
        var newMenuItem = document.createElement("menuitem");
        SetMessageTagLabel(newMenuItem, i + 1, taginfo.tag);
        newMenuItem.setAttribute("value", taginfo.key);
        newMenuItem.setAttribute("type", "checkbox");
        var removeKey = (" " + curKeys + " ").indexOf(" " + taginfo.key + " ") > -1;
        newMenuItem.setAttribute('checked', removeKey);
        newMenuItem.setAttribute('oncommand', 'ToggleMessageTagMenu(event.target);');
        var color = taginfo.color;
        if (color)
            newMenuItem.setAttribute("class", "lc-" + color.substr(1));
        menuPopup.appendChild(newMenuItem);
    }
}


window.addEventListener("load", rtews.load());
