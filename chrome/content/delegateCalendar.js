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

Cu.import("resource://exchangecalendar/erGetDelegateRequest.js");  
Cu.import("resource://exchangecalendar/erAddDelegateRequest.js"); 
Cu.import("resource://exchangecalendar/erRemoveDelegateRequest.js"); 
Cu.import("resource://exchangecalendar/erUpdateDelegateRequest.js");
 
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
	 this.delegatesList=null;
 
} 

exchDelegateCalendarSettings.prototype = {   
	 onLoad:function _onLoad() {  
  			this._window.sizeToContent() ;
	 },
 
	 getDelegate  :function _getDelegate() { 
			
			this.onActionLoad();  
            var listBox = this._document.getElementById("delegatee"); 
            this.emptyList(listBox);   
		    var self=this;
		    var calendar = this._window.arguments[0].calendar; 
			var calId = this._window.arguments[0].calendar.id;
		    var calPrefs = Cc["@mozilla.org/preferences-service;1"]
						            .getService(Ci.nsIPrefService)
							    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+ calId+"."); 
 
	       var tmpObject = new erGetDelegateRequest({ 
	    	   		mailbox : this.globalFunctions.safeGetCharPref(calPrefs, "ecMailbox") ,
	    	   		user: this.globalFunctions.safeGetCharPref(calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref(calPrefs, "ecUser"),	 		 
	    	   		serverUrl: this.globalFunctions.safeGetCharPref(calPrefs, "ecServer"), },  
	 		 	 	function(erGetDelegateRequest, aResp){self.erGetDelegateRequestOK(erGetDelegateRequest, aResp)},
	 		 	 	function(erGetDelegateRequest, aCode, aMsg){self.erGetDelegateRequestError(erGetDelegateRequest, aCode, aMsg)},
	 		 	 	null );	
	        
          this.onActionLoadEnd();
	   	  this._window.sizeToContent() ;  
		 },
		 
		 refresh: function _refresh() {
	         this.getDelegate(); 
             var listBox = this._document.getElementById("delegatee"); 
             var myListBox = listId;
 	         var countrow = myListBox.itemCount;
 	         var countList=this.delegatesList;
 	         if ( countList != countrow )
 	         { 
 	        	 this.delayRefresh();
 	         }
 		 },
		  		 
 		delayRefresh: function _delayRefresh() {
	         setTimeout( this.getDelegate(),4000); 
  		 },
 		 
		 listSelectEvent :function _listSelectEvent() { 
			 
			 	if(this.delegatesList.length>0)
			 	{  
			 	var node = this._document.getElementById("delegatee").getSelectedItem(0);  
		 			if(node)
	 				{
						var childNodes = node.childNodes;  
						var listName = childNodes[0].getAttribute("label");
						var regex = /[^()]+/g;
				        var email = listName.match(regex);
				        var listEmail=email[1];  
				        
				        for( var index=0;index<this.delegatesList.length;index++)
					 	{   			
				        	if( this.delegatesList[index].PrimarySmtpAddress == listEmail )
				        	{
	 					        this._document.getElementById('email').value = listEmail;  
						        if ( this.delegatesList[index].ReceiveCopiesOfMeetingMessages == 'true') {
						        	this._document.getElementById('ReceiveCopiesOfMeetingMessages').setAttribute("checked", "true");
						        } else {
						        	this._document.getElementById('ReceiveCopiesOfMeetingMessages').setAttribute("checked", "false");
						        }  
						        if ( this.delegatesList[index].ViewPrivateItems== 'true') { 
						        	this._document.getElementById('ViewPrivateItems').setAttribute("checked", "true");
						        } else {
						        	this._document.getElementById('ViewPrivateItems').setAttribute("checked", "false");
						        } 
						       // this._document.getElementById('deliverMeetingRequestslist').value = '';
						        this._document.getElementById('delegateCalendarpermission').value = this.delegatesList[index].DelegatePermissions;
				        	}
					 	}
				 	}
		 			
			 	} 
			this._window.sizeToContent() ;
		 },
		 
		 erGetDelegateRequestOK : function _erGetDelegateRequestOK(aGetDelegateRequest, aResp)
		 {  
 	               if ( aResp.length > 0 )
	               { 
	                   var listBox = this._document.getElementById("delegatee"); 
	                   this.emptyList(listBox);    
		               for( index=0;index<aResp.length;index++)
		               { 
		                 	 //dump("\n  "+ index + " Resp 1: " + aResp[index].SID );	
		                 	 //dump("\n  "+ index + " Resp 2: " + aResp[index].PrimarySmtpAddress );	
		                 	 //dump("\n  "+ index + " Resp 3: " + aResp[index].DisplayName );	
		                 	 //dump("\n  "+ index + " Resp 4: " + aResp[index].DelegatePermissions );	
		                 	 //dump("\n  "+ index + " Resp 5: " + aResp[index].ReceiveCopiesOfMeetingMessages );	
		                 	 //dump("\n  "+ index + " Resp 6: " + aResp[index].ViewPrivateItems ); 
		                 	 var row =   this._document.createElement("listitem"); 
		        	         var cell =   this._document.createElement("listcell");
		        	         cell.setAttribute("label", aResp[index].DisplayName+" ("+aResp[index].PrimarySmtpAddress+")");
		        	         row.appendChild(cell);  
		        	         listBox.appendChild(row);  
		    		   }	
		               this.delegatesList=aResp;
	               }
 		 },
 		 
		 erGetDelegateRequestError : function _erGetDelegateRequestError(aGetDelegateRequest, aCode, aMsg)
		 { 
			   alert( "erGetDelegateRequestError: "+ aCode+":"+aMsg);  
		 }, 
	
		removeDelegate   :function _removeDelegate() {
			 this.onActionLoad(); 
			 var email =   this._document.getElementById('email').value;  
			 var sValidEmail = /\S+@\S+\.\S+/;
			 var reValidEmail = new RegExp(sValidEmail);
			 var isEmail =  reValidEmail.test(email) ;
			 	if ( !isEmail && email )
			 	{
			 		 this._window.alert('Not Valid Email address! ' );
			 	} 
			 	else if ( !email )
			    { 
			        this._window.alert('Email address of Delegatee can not be empty! ' );
				}
				else
				{      
				    var self=this;
				    var calendar = this._window.arguments[0].calendar; 
					var calId = this._window.arguments[0].calendar.id;
				    var calPrefs = Cc["@mozilla.org/preferences-service;1"]
								            .getService(Ci.nsIPrefService)
									    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+ calId+".");  
				   
		            var tmpObject = new erRemoveDelegateRequest({ 
	    			DelegateEmail : email ,
	    	   		mailbox : this.globalFunctions.safeGetCharPref(calPrefs, "ecMailbox") ,
	    	   		user: this.globalFunctions.safeGetCharPref(calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref(calPrefs, "ecUser"),	 		 
	    	   		serverUrl: this.globalFunctions.safeGetCharPref(calPrefs, "ecServer"), },   
	 		 	 	function(erRemoveDelegateRequest, aResp){self.erRemoveDelegateRequestOK(erRemoveDelegateRequest)},
	 		 	 	function(erRemoveDelegateRequest, aCode, aMsg){self.erRemoveDelegateRequestError(erRemoveDelegateRequest, aCode, aMsg)},
	 		 	 	null );				        
		}		        
 		  this.onActionLoadEnd();
		  this._window.sizeToContent() ;  
	 },
	 
	 erRemoveDelegateRequestOK : function _erRemoveDelegateRequestOK(aRemoveDelegateRequest)
	 {	
		 this.refresh();
	 },
	 erRemoveDelegateRequestError : function _erRemoveDelegateRequestError(aRemoveDelegateRequest, aCode, aMsg)
	 {
		 this._window.alert( "erRemoveDelegateRequestError: "+ aCode+":"+aMsg);   
	 }, 
	 
	 onActionLoad:function _onActionLoad() {
	  this._window.sizeToContent() ; 
	  this._document.getElementById("delegateCalendaractionadd").setAttribute("disabled", "true");
	  this._document.getElementById("delegateCalendaractionupdate").setAttribute("disabled", "true");
	  this._document.getElementById("delegateCalendaractiondelete" ).setAttribute("disabled", "true");
	  this._document.getElementById("delegateCalendaractionrefresh").setAttribute("disabled", "true");
	 },
	 
	 onActionLoadEnd:function _onActionLoadEnd() {
	  this._window.sizeToContent() ; 
	  this._document.getElementById("email").setAttribute("Value","");

	  this._document.getElementById("delegateCalendaractionadd").removeAttribute("disabled");
	  this._document.getElementById("delegateCalendaractionupdate").removeAttribute("disabled");
	  this._document.getElementById("delegateCalendaractiondelete" ).removeAttribute("disabled");
	  this._document.getElementById("delegateCalendaractionrefresh").removeAttribute("disabled");
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
		 
	 this.onActionLoad(); 
	 var email =   this._document.getElementById('email').value; 
	 var sValidEmail = /\S+@\S+\.\S+/;
	 var reValidEmail = new RegExp(sValidEmail);
	 var isEmail =  reValidEmail.test(email) ;
	if ( !isEmail && email )
	{
		 this._window.alert('Not Valid Email address! ' );
	} 
	else if ( !email )
     {
     this._window.alert(' Email address of Delegatee can not be empty! ' + email );
     this.onActionLoadEnd();
		this._window.sizeToContent() ;
     }
     else
     { 
    	    var self=this;
		    var calendar = this._window.arguments[0].calendar; 
			var calId = this._window.arguments[0].calendar.id;
		    var calPrefs = Cc["@mozilla.org/preferences-service;1"]
						            .getService(Ci.nsIPrefService)
							    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+ calId+".");  
		   var delegateProperties={
				   DelegatePermissions: this._document.getElementById('delegateCalendarpermission').selectedItem.value  ,
				   ReceiveCopiesOfMeetingMessages:  this._document.getElementById('ReceiveCopiesOfMeetingMessages').checked ,
				   ViewPrivateItems: this._document.getElementById('ViewPrivateItems').checked ,
				   DeliverMeetingRequests:"DelegatesAndMe",
		   }; 
	       var tmpObject = new erAddDelegateRequest({ 
	    	   		delegateproperties : delegateProperties ,
	    			delegateemail : email ,
	    	   		mailbox : this.globalFunctions.safeGetCharPref(calPrefs, "ecMailbox") ,
	    	   		user: this.globalFunctions.safeGetCharPref(calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref(calPrefs, "ecUser"),	 		 
	    	   		serverUrl: this.globalFunctions.safeGetCharPref(calPrefs, "ecServer"), },   
	 		 	 	function(erAddDelegateRequest, aResp){self.erAddDelegateRequestOK(erAddDelegateRequest, aResp)},
	 		 	 	function(erAddDelegateRequest, aCode, aMsg){self.erAddDelegateRequestError(erAddDelegateRequest, aCode, aMsg)},
	 		 	 	null );		 
      }
  	  this.onActionLoadEnd();
	  this._window.sizeToContent() ; 
	 }, 
	 
	 erAddDelegateRequestOK : function _erAddDelegateRequestOK(aAddDelegateRequest, aResp)
	 {
		 if ( aResp.length > 0 )
         { 
             var listBox = this._document.getElementById("delegatee"); 
              for( index=0;index<aResp.length;index++)
             { 
               	 //dump("\n  "+ index + " Resp 1: " + aResp[index].SID );	
               	 //dump("\n  "+ index + " Resp 2: " + aResp[index].PrimarySmtpAddress );	
               	 //dump("\n  "+ index + " Resp 3: " + aResp[index].DisplayName );	
               	 //dump("\n  "+ index + " Resp 4: " + aResp[index].DelegatePermissions );	
               	 //dump("\n  "+ index + " Resp 5: " + aResp[index].ReceiveCopiesOfMeetingMessages );	
               	 //dump("\n  "+ index + " Resp 6: " + aResp[index].ViewPrivateItems ); 
               	 var row =   this._document.createElement("listitem"); 
      	         var cell =   this._document.createElement("listcell");
      	         cell.setAttribute("label", aResp[index].DisplayName+" ("+aResp[index].PrimarySmtpAddress+")");
      	         row.appendChild(cell);  
      	         listBox.appendChild(row);  
  		   }	
         
         }
		 this.delayRefresh();
		 this.delayRefresh();
	 },
	 
	 erAddDelegateRequestError : function _erAddDelegateRequestError(aAddDelegateRequest, aCode, aMsg)
	 {
		    this._window.alert( "erAddDelegateRequestError "+  aCode+":"+aMsg);  
	 }, 
	
	updateDelegate :function _updateDelegate() {
		
		 	this.onActionLoad();  
		    var email =   this._document.getElementById('email').value; 
		    var sValidEmail = /\S+@\S+\.\S+/;
			 var reValidEmail = new RegExp(sValidEmail);
			 var isEmail =  reValidEmail.test(email) ;
			 	if ( !isEmail && email )
			 	{
			 		 this._window.alert('Not Valid Email address! ' );
			 	} 
			 	else if ( !email )
	        {
		        this._window.alert(' Email address of Delegatee can not be empty! ');
		        this.onActionLoadEnd();
				this._window.sizeToContent() ;
	        }
	        else
	        {
	        	var self=this;
			    var calendar = this._window.arguments[0].calendar; 
				var calId = this._window.arguments[0].calendar.id;
			    var calPrefs = Cc["@mozilla.org/preferences-service;1"]
							            .getService(Ci.nsIPrefService)
								    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+ calId+"."); 
			    
			   var delegateProperties={
					   DelegatePermissions: this._document.getElementById('delegateCalendarpermission').selectedItem.value  ,
					   ReceiveCopiesOfMeetingMessages:  this._document.getElementById('ReceiveCopiesOfMeetingMessages').checked ,
					   ViewPrivateItems: this._document.getElementById('ViewPrivateItems').checked ,
					   DeliverMeetingRequests:"DelegatesAndMe",
			   };
			   
		       var tmpObject = new erUpdateDelegateRequest({ 
		    	   		delegateproperties : delegateProperties ,
		    			delegateemail : email ,
		    	   		mailbox : this.globalFunctions.safeGetCharPref(calPrefs, "ecMailbox") ,
		    	   		user: this.globalFunctions.safeGetCharPref(calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref(calPrefs, "ecUser"),	 		 
		    	   		serverUrl: this.globalFunctions.safeGetCharPref(calPrefs, "ecServer"), },   
		 		 	 	function(erUpdateDelegateRequest, aResp){self.erUpdateDelegateRequestOK(erUpdateDelegateRequest, aResp)},
		 		 	 	function(erUpdateDelegateRequest, aCode, aMsg){self.erUpdateDelegateRequestError(erUpdateDelegateRequest, aCode, aMsg)},
		 		 	 	null );	 
	        }
	 
		  this.onActionLoadEnd();
		  this._window.sizeToContent() ;
	 },
	 erUpdateDelegateRequestOK : function _erUpdateDelegateRequestOK(aUpdateDelegateRequest, aResp)
	 {
		 if ( aResp.length > 0 )
         { 
             var listBox = this._document.getElementById("delegatee"); 
              for( index=0;index<aResp.length;index++)
             { 
               	 //dump("\n  "+ index + " Resp 1: " + aResp[index].SID );	
               	 //dump("\n  "+ index + " Resp 2: " + aResp[index].PrimarySmtpAddress );	
               	 //dump("\n  "+ index + " Resp 3: " + aResp[index].DisplayName );	
               	 //dump("\n  "+ index + " Resp 4: " + aResp[index].DelegatePermissions );	
               	 //dump("\n  "+ index + " Resp 5: " + aResp[index].ReceiveCopiesOfMeetingMessages );	
               	 //dump("\n  "+ index + " Resp 6: " + aResp[index].ViewPrivateItems ); 
               	 var row =   this._document.createElement("listitem"); 
      	         var cell =   this._document.createElement("listcell");
      	         cell.setAttribute("label", aResp[index].DisplayName+" ("+aResp[index].PrimarySmtpAddress+")");
      	         row.appendChild(cell);  
      	         listBox.appendChild(row);  
  		   }	 
         }
		 this.delayRefresh();
	 },
	 
	 erUpdateDelegateRequestError : function _erUpdateDelegateRequestError(aUpdateDelegateRequest, aCode, aMsg)
	 {
		    this.globalFunctions.LOG( "erUpdateDelegateRequestError "+  aCode+":"+aMsg);  
	 }, 
 
	 emptyRow :function emptyRow(listId,email)
	 {
	      var myListBox = listId;
	        var countrow = myListBox.itemCount;
	        while (countrow-- > 0) {  
	        	if ( "babu.vincent@ericsson.com" == email )
	        	{
	        		myListBox.removeItemAt(0);
	        	} 
	        } 
	        this.load=false;
	 },
	 
	addToQueue: function _addToQueue(aRequest, aArgument, aCbOk, aCbError, aListener)
	{
		var args = this._window.arguments[0];
		var item = args.calendarEvent;

		this.loadBalancer.addToQueue({ calendar: item.calendar,
				 ecRequest:aRequest,
				 arguments: aArgument,
				 cbOk: aCbOk,
				 cbError: aCbError,
				 listener: aListener});
	},
	 
	deliverMeetingRequestsSelectEvent : function _deliverMeetingRequestsSelectEvent() {
	    if (this._document.getElementById('deliverMeetingRequestslist').selectedItem.value == 'DelegatesOnly') {
	    	this._document.getElementById('deliverMeetingRequestsDesc').value = 'Meeting requests are forwarded to the delegate and moved to the Deleted Items folder.';
	    } else if (this._document.getElementById('deliverMeetingRequestslist').selectedItem.value == 'DelegatesAndMe') {
	    	this._document.getElementById('deliverMeetingRequestsDesc').value = 'Meeting requests are forwarded to the delegate.';
	    } else if (this._document.getElementById('deliverMeetingRequestslist').selectedItem.value == 'DelegatesAndSendInformationToMe') {
	    	this._document.getElementById('deliverMeetingRequestsDesc').value = "Meeting requests are forwarded but the Accept, Tentative, and Decline buttons do not appear.";
	    } 
	},
	
	permissionsSelectEvent :function _permissionsSelectEvent() {
	 
 		if (  this._document.getElementById('delegateCalendarpermission').selectedItem.value == 'Author') {
			 // this._document.getElementById('deliverMeetingRequestslist').setAttribute("disabled", "false");
			  this._document.getElementById('ReceiveCopiesOfMeetingMessages').setAttribute("checked", "false");
			  this._document.getElementById('delegateCalendarpermissiondiv').value = 'Read and create items in the Calendar folder.';
        }
        if (  this._document.getElementById('delegateCalendarpermission').selectedItem.value == 'Editor') {
        	  this._document.getElementById('ReceiveCopiesOfMeetingMessages').setAttribute("disabled", "false");
        	  this._document.getElementById('delegateCalendarpermissiondiv').value = 'Read, create, and modify items in the Calendar folder.';
        	//  this._document.getElementById('deliverMeetingRequestslist').setAttribute("disabled", "false");
        }
        if (  this._document.getElementById('delegateCalendarpermission').selectedItem.value == 'Reviewer') {
			  this._document.getElementById('ReceiveCopiesOfMeetingMessages').setAttribute("disabled", "true");
			  this._document.getElementById('ReceiveCopiesOfMeetingMessages').setAttribute("checked", "false");
			  this._document.getElementById('delegateCalendarpermissiondiv').value = 'Read items in the Calendar folder.';
			//  this._document.getElementById('deliverMeetingRequestslist').setAttribute("disabled", "true");
        }
        if (this._document.getElementById('delegateCalendarpermission').selectedItem.value == 'None') {
			this._document.getElementById('ReceiveCopiesOfMeetingMessages').setAttribute("disabled", "true");
			this._document.getElementById('ReceiveCopiesOfMeetingMessages').setAttribute("checked", "false");
			 this._document.getElementById('delegateCalendarpermissiondiv').value = 'No access permissions to the Calendar folder.';
		//	this._document.getElementById('deliverMeetingRequestslist').setAttribute("disabled", "false");
        } 
        this._window.sizeToContent() ;
	}, 
               
	 	
	doCancel:function _doCancel() {
		this._window.sizeToContent() ;
	  	this._window.close(); 
	},
	     
	    
};

var tmpDelegateCalendarSettings = new exchDelegateCalendarSettings(document, window);
