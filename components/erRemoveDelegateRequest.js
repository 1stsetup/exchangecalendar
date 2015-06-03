/* ***** BEGIN LICENSE BLOCK *****
 * Version: GPL 3.0
 *
 * The contents of this file are subject to the General Public License
 * 3.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.gnu.org/licenses/gpl.html 
 * ***** BEGIN LICENSE BLOCK *****/

var Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://calendar/modules/calAlarmUtils.jsm");
Cu.import("resource://calendar/modules/calProviderUtils.jsm");
Cu.import("resource://calendar/modules/calAuthUtils.jsm");

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js"); 
 
Cu.import("resource://interfaces/xml2json/xml2json.js");

var EXPORTED_SYMBOLS = ["erRemoveDelegateRequest"];
function erRemoveDelegateRequest(aArgument, aCbOk, aCbError, aListener)
{
	this.mCbOk = aCbOk;
	this.mCbError = aCbError;

	var self = this;

	this.parent = new ExchangeRequest(aArgument, 
		function(aExchangeRequest, aResp) { self.onSendOk(aExchangeRequest, aResp);},
		function(aExchangeRequest, aCode, aMsg) { self.onSendError(aExchangeRequest, aCode, aMsg);},
		aListener);

	this.argument = aArgument;
	this.serverUrl = aArgument.serverUrl;
	this.listener = aListener;
	this.mailbox = aArgument.mailbox;
	this.DelegateEmail=aArgument.DelegateEmail;
	this.delegatingItem = aArgument.delegatingItem;

    this.permission = ""; 
	switch( this.delegatingItem ){
		case "calendar":
			 this.permission = "CalendarFolderPermissionLevel";
			break;
		case  "tasks":
			 this.permission = "TasksFolderPermissionLevel";
			break;
		case  "inbox":
			 this.permission = "InboxFolderPermissionLevel";
			break;
		case "contacts":
			 this.permission = "ContactsFolderPermissionLevel";  
			break;
		case "notes":
			 this.permission = "NotesFolderPermissionLevel";
			break;
		case "journal":
			 this.permission = "JournalFolderPermissionLevel";
			break;
		default:
 	}
	
	this.isRunning = true;
	this.execute();
}

erRemoveDelegateRequest.prototype = {

	execute: function _execute()
	{
 		exchWebService.commonFunctions.LOG("erRemoveDelegateRequest.execute\n");

 		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:RemoveDelegate xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
 		var mailBox = req.addChildTag("Mailbox", "nsMessages", null);  
		mailBox.addChildTag("EmailAddress", "nsTypes", this.mailbox );  
 		   
		var userids=req.addChildTag("UserIds","nsMessages", null);  
		var userid=userids.addChildTag("UserId","nsTypes", null);  
		userid.addChildTag("PrimarySmtpAddress","nsTypes",this.DelegateEmail);   
	
		exchWebService.commonFunctions.LOG("erRemoveDelegateRequest.execute2 " + req + "\n" );
		
		this.parent.xml2jxon = true;
        this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
		req = null;
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		exchWebService.commonFunctions.LOG("erRemoveDelegateRequest.onSendOk: " + aResp +"\n");

		var rm = aResp.XPath("/s:Envelope/s:Body/m:RemoveDelegateResponse/m:ResponseMessages/m:DelegateUserResponseMessageType[@ResponseClass='Success']");
		if (rm.length == 0) {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, "Error on sending meeting respons.");
			return;
		}

		var responseCode = rm[0].getTagValue("m:ResponseCode");
		if (responseCode != "NoError") {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, "Error on sending meeting respons:"+responseCode);
			return;
		}
		
		rm = null;
		var  delegate=[];
		delegate[0]={PrimarySmtpAddress:this.DelegateEmail};
		if (this.mCbOk) {
			this.mCbOk(this,delegate); 
		}
		this.isRunning = false;
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		 exchWebService.commonFunctions.LOG("erRemoveDelegateRequest.onSendError: "+aMsg+"\n");
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};

/*
 <?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
  <soap:Header>
    <t:RequestServerVersion Version="Exchange2007_SP1"/>
  </soap:Header>
  <soap:Body>
    <RemoveDelegate xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"
                    xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
      <Mailbox>
        <t:EmailAddress>user1@example.com</t:EmailAddress>
      </Mailbox>
      <UserIds>
        <t:UserId>
          <t:PrimarySmtpAddress>user2@example.com</t:PrimarySmtpAddress>
        </t:UserId>
        <t:UserId>
          <t:SID>S-1-5-21-1333220396-2200287332-232816053-1118</t:SID>
        </t:UserId>
      </UserIds>
    </RemoveDelegate>
  </soap:Body>
</soap:Envelope>

*
**/
