/*
 * This code uses parts of the Microsoft Exchange Calendar Provider code on which the
 * "Exchange Data Provider for Lightning" was based.
 * The Initial Developer of the Microsoft Exchange Calendar Provider Code is property of Ericsson. 
 * All Rights Reserved.
 * ***** BEGIN LICENSE BLOCK *****/
  
var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils; 

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js"); 
 
Cu.import("resource://exchangecalendar/erUpdateFolderPermission.js");
Cu.import("resource://exchangecalendar/erFindInboxFolder.js");
Cu.import("resource://exchangecalendar/erGetFolderPermission.js");

Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://interfaces/xml2json/xml2json.js"); 
  
function exchDelegateCalendarSettings(aDocument, aWindow)
{
	this._document = aDocument;
	this._window = aWindow; 
	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions); 
	this.loadBalancer = Cc["@1st-setup.nl/exchange/loadbalancer;1"]  
	                          .getService(Ci.mivExchangeLoadBalancer); 
	this.calId = null;
	this.calPrefs = null;
    this.delegatesList = []; 
    this.folderName = "";
    
    this.folderId = null;
	this.changeKey = null;
} 
 
exchDelegateCalendarSettings.prototype = {  

	findAccountFromFolder:function _findAccountFromFolder(theFolder) {
		    if (!theFolder)  
		        return null;  
		    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
		                                     .getService(Components.interfaces.nsIXULAppInfo);
             var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
                                        .getService(Components.interfaces.nsIVersionComparator);
             var passwd = "";
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
		                if (theFolder == subFolders.getNext().QueryInterface(Components.interfaces.nsIMsgFolder))  
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
		                if (theFolder == subFolders.getNext().QueryInterface(Components.interfaces.nsIMsgFolder))  
		                    return account.QueryInterface(Components.interfaces.nsIMsgAccount);  
		            }  
		        	}  
                     
                 }
             }  
		    return null;  
	},
		
	getCalendar: function _getCalendar(){
		let folder = window.arguments[0].folder; 
		
		///Get Selected Folder Account manager 
		var account = this.findAccountFromFolder(folder);
 		var accountEmail = "";
		if( account == null ) return;
		try{
			var  identities = account.identities;
			for (var index=0; index < identities.length; index++) {
				var identity = identities.queryElementAt(index, Ci.nsIMsgIdentity);
				accountEmail = identity.email;
				/*if (!this.name) {
					dump("aclEntry: index:"+index+", identitie:"+identity+"\n");
				}*/
			}
		}
		catch(e){}
 		
		///Get Calendar manager
		var calManager = Cc["@mozilla.org/calendar/manager;1"]
		        			.getService(Ci.calICalendarManager);
		var cals = calManager.getCalendars({});
		
		for( var i = 0; i < cals.length; i++ ){
			var cal=cals[i];
			if( cal.mailbox == accountEmail ){
				this.calId = cal.id;
				break;
			}
		} 
	 },
	 
	 onLoad:function _onLoad() { 
		 	this.getCalendar();  
 		    if( this.calId != null ){
 		      try{
 		    	  this.calPrefs = Cc["@mozilla.org/preferences-service;1"]
	    	    	            .getService(Ci.nsIPrefService)
	    	    	            .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+ this.calId +".");
 		      }catch(e){}
 		    	  this.refresh();
		    }  
 		    if( this.calId == null ){
 				this._document.getElementById("delegationPanel").hidden=true;
 				this._document.getElementById("fmessage").hidden=false;
 			}
 			else{
 				this._document.getElementById("delegationPanel").hidden=false; 
 				this._document.getElementById("fmessage").hidden=true; 
 			} 
	 },   
 
	 getFolderPermissionOK: function _getFolderPermissionOK( erGetFolderPermissionRequest,folderID,changeKey,folderName,delegatee,perms){
 
		 this.folderId = folderID;
		 this.changeKey = changeKey;
 		  if ( delegatee.length > 0 ){  
 			  this.delegatesList=delegatee;  
          }  
           this.updateDelegateView();  
	 },

 	removeDelegateCache :function _removeDelegateCache(email)
	{  
		 if(email){ 
			 for (var index=0;index < this.delegatesList.length ;index++ )
			 { 
				if ( email == this.delegatesList[index].emailId )
				{
					this.delegatesList.splice(index,1);
				}
			 }	 
		 }
 	},
	
	addDelegateCache :function _addDelegateCache(delegate)
	{
		 if(delegate){ 
			 var count=this.delegatesList.length;
			 if(!count){
				 count=0; 
			 }

			 this.delegatesList[count]=delegate;
		 } 
 	},
		
	 getFolderPermissionError: function _getFolderPermissionError(erGetFolderPermissionRequest, aCode, aMsg){
		this.globalFunctions.LOG("delegateFolder~getFolderPermissionError: aCode -  " + aCode +   ", aMsg - " + aMsg );
	 },
	 
	 erUpdateFolderPermissionRequestOK: function _erUpdateFolderPermissionRequestOK(erUpdateFolderPermissionRequest, folderId, changeKey) {
		 this.folderId = folderId;
		 this.changeKey = changeKey;
		 this.globalFunctions.LOG("delegateFolder~erUpdateFolderPermissionRequestOK: Updated Sucessfully!");
		 this.infoPopup(this._document.title, "Permission given for user." );
		 this.refresh(); 
	 },
	 
	 erUpdateFolderPermissionRequestError: function _erUpdateFolderPermissionRequestError(erUpdateFolderPermissionRequest, aCode, aMsg) {
		this.globalFunctions.LOG("delegateFolder~erUpdateFolderPermissionRequestError: aCode -  " + aCode +   ", aMsg - " + aMsg );
		this.infoPopup(this._document.title, "Error:- " + aMsg + " (" + aCode +")" ); 
	 },   
	 
	 addSharedUser: function _addSharedUser() {
		 var email=this.validateEmail(this._document.getElementById("customshareduser"));
		 if ( !email )
		 {
			 this._window.alert('Not Valid Email address! ' );
		     this.onActionLoadEnd();
			 this._window.sizeToContent() ; 
		 } 
		 else
		 {
			 var calendarEmailDomain=this.emailDomain(email);
			 var displayName =  email.replace('@'+calendarEmailDomain,"");
			 var cboxitem = this._document.createElement("treeitem"); 
	         var cboxrow = this._document.createElement("treerow");
	         var tree = this._document.getElementById("shared"); 
	         //add checkbox
	         var cboxcell = this._document.createElement("treecell");
	         
		     cboxcell.setAttribute("value","false");
	         cboxcell.setAttribute("editable",true);  
	         cboxcell.setAttribute("name", "checkbox"  );  
	         	 cboxrow.appendChild(cboxcell); 
	         	  
	         	 //add user
	         cboxcell = this._document.createElement("treecell");
	         cboxcell.setAttribute("label", displayName  ); 
	         cboxcell.setAttribute("name", "name"  ); 
	         cboxcell.setAttribute("value",  email  ); 
	         cboxcell.setAttribute("editable",false);
	         	 cboxrow.appendChild(cboxcell); 
         	 cboxitem.appendChild(cboxrow); 
	         tree.appendChild(cboxitem);
	         
		 }
	 },
	 
	 getDelegator : function _getDelegator() { },
	 
	 calendarEmail: function _calendarEmail()
	 {   
		 return this.globalFunctions.safeGetCharPref( this.calPrefs, "ecMailbox");
	 },
	 
	 emailDomain: function _emailDomain(email)
	 { 
	      if(email)
	      { 
	    	  return email.replace(/.*@/, "");;
	      }
	      return;
	      
	 },
	 
	 addToQueue: function _addToQueue(aRequest, aArgument, aCbOk, aCbError, aListener)
	 { 
			this.loadBalancer.addToQueue({ calendar: this,
					 ecRequest:aRequest,
					 arguments: aArgument,
					 cbOk: aCbOk,
					 cbError: aCbError,
					 listener: aListener});
	 },
	
	 getEmail: function _getEmail()
	 { 
			 var email=this._document.getElementById("email").value; 
			 if( email)
			 { 
				 var d1 = this.emailDomain(this.calendarEmail());
				 var d2;
				 var sValidEmail = /<(\S+@\S+\.\S+)>/;
				 var reValidEmail = new RegExp(sValidEmail);
				 var isEmail=null;
				 try{
					 isEmail = email.match(reValidEmail)[1] ;
					 d2 = this.emailDomain(isEmail); 
				 }
				 catch(e){
						 sValidEmail = /\S+@\S+\.\S+/;
						 reValidEmail = new RegExp(sValidEmail);
						 isEmail = email.match(reValidEmail)[0];
						 d2 = this.emailDomain(isEmail);
	 			 }
				 finally{   
					  if( d1  == d2 )
					  {
 						  return isEmail;
					  }
					  return;

	 			 } 
			 }
			 return;
	 },
	 
	 validateEmail: function _validateEmail(textbox)
	 { 
			 var email=textbox.value;
			 if( email)
			 { 
				 var d1 = this.emailDomain(this.calendarEmail());
				 var d2;
				 var sValidEmail = /<(\S+@\S+\.\S+)>/;
				 var reValidEmail = new RegExp(sValidEmail);
				 var isEmail=null;
				 try{
					 isEmail = email.match(reValidEmail)[1] ;
					 d2 = this.emailDomain(isEmail); 
				 }
				 catch(e){
						 sValidEmail = /\S+@\S+\.\S+/;
						 reValidEmail = new RegExp(sValidEmail);
						 isEmail = email.match(reValidEmail)[0];
						 d2 = this.emailDomain(isEmail);
	 			 }
				 finally{   
					  if( d1  == d2 )
					  {
 						  return isEmail;
					  }
					  return;

	 			 } 
			 }
			 return;
	 },
	 
	 changeDelegatorCalendar :function _changeDelegatorCalendar(event) { }, 
	 
	 deleteCalendar: function _deleteCalendar(checkBox)	 { },
	 
	 createCalendar: function _createCalendar(checkBox)	{ },
 
	 getDelegate: function _getDelegate() { 
		    var self=this;  
			this.onActionLoad();  
            var listBox = this._document.getElementById("delegatee"); 
            this.emptyList(listBox);   
 		    //Get Folders in Inbox includes hidden
 		    var tmpObject = new  erFindInboxFolderRequest( 
					{user: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref( this.calPrefs, "ecUser") , 
					 mailbox:this.globalFunctions.safeGetCharPref( this.calPrefs, "ecMailbox") ,
					 serverUrl:this.globalFunctions.safeGetCharPref( this.calPrefs, "ecServer"),
					 folderBase: "msgfolderroot",
					 folderPath: "",
					 actionStart: Date.now()}, 
					function(erFindInboxFolderRequest, folders) { self.checkFolderPathOk(erFindInboxFolderRequest, folders);}, 
					function(erFindInboxFolderRequest, aCode, aMsg) { self.checkFolderPathError(erFindInboxFolderRequest, aCode, aMsg);},
					null); 
          this.onActionLoadEnd();
	   	  this._window.sizeToContent() ;  
		 },
		 
		 checkFolderPathOk: function _checkFolderPathOk(erFindInboxFolderRequest, folders)
		 { 	
			  var self = this; 
		 			for(var i=0;i<folders.length;i++){ 
		 				if( folders[i].name == window.arguments[0].name ){
							this.folderId = folders[i].id ;
							this.folderName= folders[i].name ;
							this.changeKey = folders[i].changeKey; 
							
							//Get Total users and permissions
		 					var tmpObject = new erGetFolderPermissionRequest({
		 	   	   				user: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref( this.calPrefs, "ecUser"),	  
		 	   					mailbox : this.globalFunctions.safeGetCharPref( this.calPrefs, "ecMailbox") ,
		 	   					serverUrl: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecServer"),  
		 	   					folderID: this.folderId ,
		 	   					changeKey: this.changeKey ,
		 	   					actionStart: Date.now()}, 
		 						function(erGetFolderPermissionRequest,folderID,changeKey,folderName,delegatee,permissions) { self.getFolderPermissionOK(erGetFolderPermissionRequest,folderID,changeKey,folderName,delegatee,permissions);}, 
		 						function(erGetFolderPermissionRequest, aCode, aMsg) { self.getFolderPermissionError(erGetFolderPermissionRequest, aCode, aMsg);},
		 						null);  
		 					break;
						} 
					}  
	 	 },
	 	 
		 checkFolderPathError: function _checkFolderPathError(erFindInboxFolderRequest, aCode, aMsg) {
				this.globalFunctions.LOG("delegateFolder~checkFolderPathError: aCode -  " + aCode +   ", aMsg - " + aMsg ); 
		 },
		 
		 refresh: function _refresh() {
		      this.getDelegate(); 
 		 },
		  	 
		 fillDetails :function _fillDetails() { 
  			 try{
  			 			var node = this._document.getElementById("delegatee").getSelectedItem(0);  
 						var childNodes = node.childNodes;  
						var listName = childNodes[0].getAttribute("label");
						var regex = /[^()]+/g;
				        var email = listName.match(regex);
				        var listEmail=childNodes[0].getAttribute("value");  
  			  }  catch(e){}      
				        if( !listEmail ){ 
				        	listEmail = this.getEmail();
				        }
				        
				        for( var index=0;index<this.delegatesList.length;index++)
					 	{   			
				        	if( this.delegatesList[index].emailId == listEmail )
				        	{
	 					       // this._document.getElementById('email').value = listEmail;   
						       // this._document.getElementById('deliverMeetingRequestslist').value = '';
 						       this._document.getElementById('delegateCalendarpermission').value = this.delegatesList[index].permissions.permissionLevel;
 						        
 						       this._document.getElementById("canCreateItems-label").value = this.delegatesList[index].permissions.canCreateItems;
 						       this._document.getElementById("canCreateSubFolders-label").value = this.delegatesList[index].permissions.canCreateSubFolders;
 						       this._document.getElementById("isFolderOwner-label").value = this.delegatesList[index].permissions.isFolderOwner;
 						       this._document.getElementById("isFolderVisible-label").value = this.delegatesList[index].permissions.isFolderVisible;
 						       this._document.getElementById("isFolderContact-label").value = this.delegatesList[index].permissions.isFolderContact;
 						       this._document.getElementById("editItems-label").value = this.delegatesList[index].permissions.editItems;
 						       this._document.getElementById("deleteItems-label").value = this.delegatesList[index].permissions.deleteItems;
 						       this._document.getElementById("readItems-label").value = this.delegatesList[index].permissions.readItems; 
 						       break;
				        	}
					 	} 
			this._window.sizeToContent() ;
		 },  
		 
		updateDelegateView: function _updateDelegateView(){ 
			 var listBox = this._document.getElementById("delegatee"); 
             this.emptyList(listBox);   
			 for (var index=0;index<this.delegatesList.length;index++)
			 {   
				 	var row =   this._document.createElement("listitem"); 
				 	var cell =   this._document.createElement("listcell");
					 cell.setAttribute("label", this.delegatesList[index].name+" ("+this.delegatesList[index].emailId+")");
        	         cell.setAttribute("value", this.delegatesList[index].emailId);
        	         row.appendChild(cell);  
        	         listBox.appendChild(row);   
			 }	 
			 this.fillDetails();  
  		 },
		 
		removeDelegate   :function _removeDelegate() {
   			 var self=this;

			 this.onActionLoad(); 
				 var email = this.getEmail();  
				 if ( !email )
				 {
					 this._window.alert('Not Valid Email address! ' );
				     this.onActionLoadEnd();
					 this._window.sizeToContent() ; 
				 } 
				 else
				 {	  
					   var permissionSet = [];
					   var existing=false;
					   for(var i = 0; i < this.delegatesList.length; i++ ){
						   if(this.delegatesList[i].emailId){
							   if( this.getEmail() == this.delegatesList[i].emailId ){
								   existing=true; 
								   continue;  
							   }  
							   else{
								   permissionSet.push({"primarysmtpaddress":this.delegatesList[i].emailId ,
					   				 	"permissionlevel": this.delegatesList[i].permissions.permissionLevel}); 
							   }
						   }
					   }
					     
				       var tmpObject = new erUpdateFolderPermissionRequest({ 
		   	   		 		permissionSet : permissionSet,
				            folderId : this.folderId ,
				            changeKey : this.changeKey ,
			    	   		mailbox : this.globalFunctions.safeGetCharPref( this.calPrefs, "ecMailbox") ,
			    	   		user: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref( this.calPrefs, "ecUser"),	 		 
			    	   		serverUrl: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecServer"), },   
			 		 	 	function(erUpdateFolderPermissionRequest, folderId,changeKey){self.erUpdateFolderPermissionRequestOK(erUpdateFolderPermissionRequest, folderId, changeKey)},
			 		 	 	function(erUpdateFolderPermissionRequest, aCode, aMsg){self.erUpdateFolderPermissionRequestError(erUpdateFolderPermissionRequest, aCode, aMsg)},
			 		 	 	null );	 
				        
			        }	 
 		  this.onActionLoadEnd();
		  this._window.sizeToContent() ;  
	 }, 
	   
	 onActionLoad:function _onActionLoad() {
	  this._window.sizeToContent() ; 
	  this._document.getElementById("delegateCalendaractionadd").setAttribute("disabled", "true");
	  this._document.getElementById("delegateCalendaractionupdate").setAttribute("disabled", "true");
	  this._document.getElementById("delegateCalendaractiondelete" ).setAttribute("disabled", "true");
 	 },
	 
	 onActionLoadEnd:function _onActionLoadEnd() {
	  this._window.sizeToContent() ; 
 	  this._document.getElementById("delegateCalendaractionadd").removeAttribute("disabled");
	  this._document.getElementById("delegateCalendaractionupdate").removeAttribute("disabled");
	  this._document.getElementById("delegateCalendaractiondelete" ).removeAttribute("disabled");
 	 }, 
		
	 emptyList :function emptyList(listId)
	 {
	      var myListBox = listId;
	        var countrow = myListBox.itemCount;
	        while (countrow-- > 0) {
	            myListBox.removeItemAt(0);
	        } 
	 },
	  
	 addDelegate:function _addDelegate() {
		 var self=this;

	 	 this.onActionLoad(); 
		 var email = this.getEmail();  
		 if ( !email )
		 {
			 this._window.alert('Not Valid Email address! ' );
		     this.onActionLoadEnd();
			 this._window.sizeToContent() ; 
		 }  
	     else
	     {     
			    var permissionSet = [];
				   var existing=false;
				   for(var i = 0; i < this.delegatesList.length; i++ ){
					   if(this.delegatesList[i].emailId){
						   if( this.getEmail() == this.delegatesList[i].emailId ){
							   existing=true; 
							   try{
								   permissionSet.push({"primarysmtpaddress":this.getEmail(),
									   				 	"permissionlevel":this._document.getElementById('delegateCalendarpermission').selectedItem.value});
								   
							   }
							   catch(e){} 
							   continue;
						   }  
						   else{
							   permissionSet.push({"primarysmtpaddress":this.delegatesList[i].emailId ,
				   				 	"permissionlevel": this.delegatesList[i].permissions.permissionLevel}); 
						   }
					   }
				   }
				   
				   if(  existing != true ){
					   permissionSet.push({"primarysmtpaddress":this.getEmail(),
		   				 	"permissionlevel":this._document.getElementById('delegateCalendarpermission').selectedItem.value});
	    
					   existing = null; 
				   }
				   else{
					    this._window.alert('Already added! do Update');
			    	    this.onActionLoadEnd(); 
			    		this._window.sizeToContent();
			    		return; 
				   }
				   
			       var tmpObject = new erUpdateFolderPermissionRequest({ 
	   	   		 		permissionSet : permissionSet,
			            folderId : this.folderId ,
			            changeKey : this.changeKey ,
		    	   		mailbox : this.globalFunctions.safeGetCharPref( this.calPrefs, "ecMailbox") ,
		    	   		user: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref( this.calPrefs, "ecUser"),	 		 
		    	   		serverUrl: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecServer"), },   
		 		 	 	function(erUpdateFolderPermissionRequest, folderId,changeKey){self.erUpdateFolderPermissionRequestOK(erUpdateFolderPermissionRequest, folderId, changeKey)},
		 		 	 	function(erUpdateFolderPermissionRequest, aCode, aMsg){self.erUpdateFolderPermissionRequestError(erUpdateFolderPermissionRequest, aCode, aMsg)},
		 		 	 	null );	 
			        
	      }
	  	  this.onActionLoadEnd();
		  this._window.sizeToContent() ; 
	 }, 
  
	updateDelegate :function _updateDelegate() {
     		 var self=this; 
		 	 this.onActionLoad();  
			 var email = this.getEmail();  
			 if ( !email )
			 {
				 this._window.alert('Not Valid Email address! ' );
			     this.onActionLoadEnd();
				 this._window.sizeToContent() ; 
			 }  
			 else
			 { 
			   var permissionSet = [];
			   var existing=false;
			   for(var i = 0; i < this.delegatesList.length; i++ ){
				   if(this.delegatesList[i].emailId){
					   if( this.getEmail() == this.delegatesList[i].emailId ){
						   existing=true; 
						   try{
							   permissionSet.push({"primarysmtpaddress":this.getEmail(),
								   				 	"permissionlevel":this._document.getElementById('delegateCalendarpermission').selectedItem.value});
							   
						   }
						   catch(e){} 
						   continue;
					   }  
					   else{
						   permissionSet.push({"primarysmtpaddress":this.delegatesList[i].emailId ,
			   				 	"permissionlevel": this.delegatesList[i].permissions.permissionLevel}); 
					   }
				   }
			   }
		
			   if(  existing != true ){
				  /* permissionSet.push({"primarysmtpaddress":this.getEmail(),
	   				 	"permissionlevel":this._document.getElementById('delegateCalendarpermission').selectedItem.value});
    				*/
				   	existing = null;  
				   	this._window.alert('Already not added! do add');
		    	    this.onActionLoadEnd(); 
		    		this._window.sizeToContent();
		    		return; 
			   }
			   
		       var tmpObject = new erUpdateFolderPermissionRequest({ 
   	   		 		permissionSet : permissionSet,
		            folderId : this.folderId ,
		            changeKey : this.changeKey ,
	    	   		mailbox : this.globalFunctions.safeGetCharPref( this.calPrefs, "ecMailbox") ,
	    	   		user: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref( this.calPrefs, "ecUser"),	 		 
	    	   		serverUrl: this.globalFunctions.safeGetCharPref( this.calPrefs, "ecServer"), },   
	 		 	 	function(erUpdateFolderPermissionRequest, folderId,changeKey){self.erUpdateFolderPermissionRequestOK(erUpdateFolderPermissionRequest, folderId, changeKey)},
	 		 	 	function(erUpdateFolderPermissionRequest, aCode, aMsg){self.erUpdateFolderPermissionRequestError(erUpdateFolderPermissionRequest, aCode, aMsg)},
	 		 	 	null );	 
		        
	        }
	 
		  this.onActionLoadEnd();
		  this._window.sizeToContent() ;
	 },
	  
	permissionsSelectEvent :function _permissionsSelectEvent() {
	 return;
 		if (  this._document.getElementById('delegateCalendarpermission').selectedItem.value == 'Author') {
			 // this._document.getElementById('deliverMeetingRequestslist').setAttribute("disabled", "false");
 			  this._document.getElementById('delegateCalendarpermissiondiv').value = 'Read and create items in the Calendar folder.';
        }
        if (  this._document.getElementById('delegateCalendarpermission').selectedItem.value == 'Editor') {
         	  this._document.getElementById('delegateCalendarpermissiondiv').value = 'Read, create, and modify items in the Calendar folder.';
        	//  this._document.getElementById('deliverMeetingRequestslist').setAttribute("disabled", "false");
        }
        if (  this._document.getElementById('delegateCalendarpermission').selectedItem.value == 'Reviewer') {
 			  this._document.getElementById('delegateCalendarpermissiondiv').value = 'Read items in the Calendar folder.';
			//  this._document.getElementById('deliverMeetingRequestslist').setAttribute("disabled", "true");
        }
        if (this._document.getElementById('delegateCalendarpermission').selectedItem.value == 'None') {
 			 this._document.getElementById('delegateCalendarpermissiondiv').value = 'No access permissions to the Calendar folder.';
		//	this._document.getElementById('deliverMeetingRequestslist').setAttribute("disabled", "false");
        } 
        this._window.sizeToContent() ;
	}, 
               
	 	
	doCancel:function _doCancel() {
		this._window.sizeToContent() ;
	  	this._window.close(); 
	},
	
	infoPopup:function _infoPopup(title, msg) {
		 var image = "chrome://exchangecalendar/skin/notify-icon.png";
		  var win = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].
		                      getService(Components.interfaces.nsIWindowWatcher).
		                      openWindow(null, 'chrome://global/content/alerts/alert.xul',
		                                  '_blank', 'chrome,titlebar=no,popup=yes', null);
		  win.arguments = [image,  title, msg, true, ''];
	}, 
};


var tmpDelegateFolderSettings = new exchDelegateCalendarSettings(document, window);
window.addEventListener("load",function(){document.getElementById("folderPropertiesDialog").addEventListener("load",tmpDelegateFolderSettings.onLoad(),false);},false);
