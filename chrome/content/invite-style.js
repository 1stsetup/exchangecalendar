Components.utils.import("resource:///modules/gloda/mimemsg.js");  
 
function addInviteColumn()
{
	let threadcols=document.getElementById("threadCols");
	let threadcol=document.createElement("treecol"); 
 	threadcol.setAttribute("id","inviteCol"); 
 	threadcol.setAttribute("width","25"); 
	threadcols.appendChild(threadcol); 
}
    
function showIcons()
{   
    var extrasObserver = {
			observe: function(aMsgFolder, aTopic, aData) {  
 		    if (gDBView) {
	    			var columnHandler = {
	    					
	    			    getCellText: function(row, col) {}, 
	    			    getSortStringForRow: function(hdr) { 
 		    				var Subject  = hdr.mime2DecodedSubject; 
 	    				   	let isInviteMail= hdr.getStringProperty("isInviteMail"); 
 	    				  
    				         if( isInviteMail == "true" ){ 
	    				     var res = Subject.match(/Accepted:/);  
							 if(!res){
								 res = Subject.match(/Declined:/);  
							 }
							 else{   
								 return "accepted"; 
							 }
							  
							 if(!res){
								 res = Subject.match(/Tentative:/);  
							 }
							 else{ 	
								 return "declined"; 
							 } 
							 if(!res){
								 res = Subject.match(/Canceled:/);  
							 }
							 else{   
								 return "tentative"; 
							 }  
							 
							 if(!res){
								 res = Subject.match(/Updated:/);  
							 }
							 else{   
								 return "updated"; 
							 }  
							 
							 if(!res){
								 res = Subject.match(/Event Invitation:/);  
							 }
							 else{  
								 return "updated"; 
							 }   
						 	 return "invited";   
 	    				  } 
	    			    }, 
	    			    isString: function() { return true; }, 
	    			    _atoms: {}, 
	    			    _getAtom: function(aName) {}, 
	    			    setProperty: function(prop, value) {}, 
	    			    getExtensionProperties: function(row, props, which) {}, 
	    			    getCellProperties: function(row, col, props) {}, 
	    			    getRowProperties: function(row, props) { }, 
	    			    getImageSrc: function(row, col) { 
		    				var hdr = gDBView.getMsgHdrAt(row); 
		    				var Subject  = hdr.mime2DecodedSubject; 
 	    				   	var msgFolder=hdr.folder;
  	    				  let isInviteMail= hdr.getStringProperty("isInviteMail"); 
 	    				  if(   isInviteMail == ""  ){ 
 	    				   	
 	    				   	MsgHdrToMimeMessage(hdr, null, function (hdr, aMimeMessage) {  
    			              try {
  	    			             let attachments = aMimeMessage.allUserAttachments || aMimeMessage.allAttachments;
  	    			             if  ( attachments.length == 1){
 	    			                   for (let [index, att] in Iterator(attachments))
 	    			                   {
			 	    			             if ( att.name == "invite.ics" ){
			 	 	    					 	hdr.setStringProperty("isInviteMail","true");
			 	    			             }
 	    			                   }
 	    			            } 
    			              } catch (err) {
     			              } 
  	    				      }, true ,{examineEncryptedParts:true,}); // true means force the message into being downloaded... this might take some time! 	    				 
 	    				  }
 	    				   
    				         if( isInviteMail == "true" ){ 
	    				     var res = Subject.match(/Accepted:/);  
							 if(!res){
								 res = Subject.match(/Declined:/);  
							 }
							 else{   
								 return "chrome://exchangeCalendar/skin/accepted.png"; 
							 }
							  
							 if(!res){
								 res = Subject.match(/Tentative:/);  
							 }
							 else{ 	
								 return "chrome://exchangeCalendar/skin/declined.png"; 
							 } 
							 if(!res){
								 res = Subject.match(/Canceled:/);  
							 }
							 else{   
								 return "chrome://exchangeCalendar/skin/tentative.png"; 
							 }  
							 
							 if(!res){
								 res = Subject.match(/Updated:/);  
							 }
							 else{   
								 return "chrome://exchangeCalendar/skin/updated.png"; 
							 }  
							 
							 if(!res){
								 res = Subject.match(/Event Invitation:/);  
							 }
							 else{  
								 return "chrome://exchangeCalendar/skin/updated.png"; 
							 }   
						 	 return "chrome://exchangeCalendar/skin/invited.png";   
 	    				  }
	    			    }, 
	    			    getSortLongForRow: function(hdr) {}
	    			}; 
	    			
	    			try {
	    			    columnHandler.old = gDBView.getColumnHandler("inviteCol");
	    			}
	    			catch (ex) {}
	    			
	    			gDBView.addColumnHandler("inviteCol", columnHandler);  
    		    }//ifend
    		}
	    };
    
    	var ObserverService = Cc["@mozilla.org/observer-service;1"]
                     		.getService(Ci.nsIObserverService);
		ObserverService.addObserver( extrasObserver, "MsgCreateDBView", false);  
}

function getMessageBody(aMessageHeader)
{
	  var uri=aMessageHeader.folder.getUriForMsg(aMessageHeader);
 	  
	  var messageService = messenger.messageServiceFromURI(uri);
	   
	  var messageStream = Components.classes["@mozilla.org/network/sync-stream-listener;1"].createInstance().QueryInterface(Components.interfaces.nsIInputStream);
	   
	  var inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
	 
	  inputStream.init(messageStream);
	  
	  messageService.streamMessage(uri, messageStream, {}, null, false, null);  
	  var body = "";
	  inputStream.available();
	  while (inputStream.available()) {
	     body = body + inputStream.read(512);
	  }

	  messageStream.close();
	  inputStream.close();
      return body;
}

function inviteMail(aMsgHdr){
	
	var bodyPlain = getMessageBody(aMsgHdr); 
  	
  	var searchString = 'Content-Type: text/calendar;';
  	var result = bodyPlain.match(/Content-Type: text\/calendar;/g);
   
       if( result == searchString ){ 
    	   aMsgHdr.setStringProperty("isInviteMail","true");
        }  
}


function onMessageAdded(){
		
	var newMailListener = {
		    msgAdded: function(aMsgHdr) {	 
       				setTimeout(function(){inviteMail(aMsgHdr)},5000); 
			    }
		};

		    var notificationService = Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
                                     	.getService(Components.interfaces.nsIMsgFolderNotificationService);
		    notificationService.addListener(newMailListener, notificationService.msgAdded);  
	}


window.addEventListener("load",addInviteColumn(),false);
 window.addEventListener("load",showIcons(),false); 
window.addEventListener("load",onMessageAdded(),false);