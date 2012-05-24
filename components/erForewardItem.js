/* ***** BEGIN LICENSE BLOCK *****
 * Version: GPL 3.0
 *
 * The contents of this file are subject to the General Public License
 * 3.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.gnu.org/licenses/gpl.html
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * -- Exchange 2007/2010 Calendar and Tasks Provider.
 * -- For Thunderbird with the Lightning add-on.
 *
 * This work is a combination of the Storage calendar, part of the default Lightning add-on, and 
 * the "Exchange Data Provider for Lightning" add-on currently, october 2011, maintained by Simon Schubert.
 * Primarily made because the "Exchange Data Provider for Lightning" add-on is a continuation 
 * of old code and this one is build up from the ground. It still uses some parts from the 
 * "Exchange Data Provider for Lightning" project.
 *
 * Author: Deepak Kumar
 * email: deepk2u@gmail.com
 *
 *
 * This code uses parts of the Microsoft Exchange Calendar Provider code on which the
 * "Exchange Data Provider for Lightning" was based.
 * The Initial Developer of the Microsoft Exchange Calendar Provider Code is
 *   Andrea Bittau <a.bittau@cs.ucl.ac.uk>, University College London
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
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

var EXPORTED_SYMBOLS = ["erForewardItemRequest"];

function erForewardItemRequest(aArgument, aCbOk, aCbError, aListener)
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

	this.isRunning = true;
	this.execute();
}

erForewardItemRequest.prototype = {

	execute: function _execute()
	{
		exchWebService.commonFunctions.LOG("erForewardItemRequest.execute\n");

		var req = <nsMessages:CreateItem xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;
		req.@MessageDisposition="SendAndSaveCopy"; 
		var consemail = new Array();
		
		for each (let emailId in this.argument.attendees) 
                { 
                        var email = new String(emailId); 
                        var start = email.indexOf('<'); 
                        var end = email.indexOf('>'); 
			let mailbox = <nsTypes:Mailbox xmlns:nsTypes={nsTypes}/>;
			if(start<0){
				mailbox.nsTypes::EmailAddress =email;				
			}
			else{
				mailbox.nsTypes::EmailAddress =email.slice(start+1,end);
			}
			consemail.push(mailbox);	
                }
		var arrLen = consemail.length ;
		for (let j=1; j<=arrLen ; j++)
		{		
   			req.nsMessages::Items.nsTypes::ForwardItem.nsTypes::ToRecipients.nsTypes += consemail.pop();
		}

		req.nsMessages::Items.nsTypes::ForwardItem.nsTypes::ReferenceItemId.@Id=this.argument.item.id; 
		req.nsMessages::Items.nsTypes::ForwardItem.nsTypes::ReferenceItemId.@ChangeKey=this.argument.changeKey; 
		req.nsMessages::Items.nsTypes::ForwardItem.nsTypes::NewBodyContent.@BodyType="Text"; 
		req.nsMessages::Items.nsTypes::ForwardItem.nsTypes::NewBodyContent=this.argument.description; 
		exchWebService.commonFunctions.LOG("erForewardItemRequest.execute>"+String(this.parent.makeSoapMessage(req)));
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
		
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		exchWebService.commonFunctions.LOG("erForewardItemRequest.onSendOk: "+String(aResp)+"\n");
		try {
			var responseCode = aResp..nsMessages::ResponseCode.toString();
		}
		catch(err) {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_RESPONS_NOT_VALID, "Response does not contain expected field");
			return;
		}
		var response;
		if (responseCode != "NoError") {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, "Error on creating item:("+responseCode+") "+String(aResp));
			response="Event forewarding not successful!";
		}
		else{
			response = "Event forewarding successful!";
		}
	
		if (this.mCbOk) {
			this.mCbOk(this, response);
		}
		this.isRunning = false;
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};


