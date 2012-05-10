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
 * Author: Michel Verbraak (info@1st-setup.nl)
 * Website: http://www.1st-setup.nl/wordpress/?page_id=133
 * email: exchangecalendar@extensions.1st-setup.nl
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

Cu.import("resource://1st-setup/ecFunctions.js");
Cu.import("resource://1st-setup/soapFunctions.js");

/*Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://calendar/modules/calAlarmUtils.jsm");
Cu.import("resource://calendar/modules/calProviderUtils.jsm");
Cu.import("resource://calendar/modules/calAuthUtils.jsm");*/

Cu.import("resource://exchangecalendar/ecExchangeRequest.js");

var EXPORTED_SYMBOLS = ["erPrimarySMTPCheckRequest"];

function erPrimarySMTPCheckRequest(aArgument, aCbOk, aCbError, aListener)
{
	this.mCbOk = aCbOk;
	this.mCbError = aCbError;

	var self = this;

	this.parent = new ExchangeRequest(aArgument, 
		function(aExchangeRequest, aResp) { self.onSendOk(aExchangeRequest, aResp);},
		function(aExchangeRequest, aCode, aMsg) { self.onSendError(aExchangeRequest, aCode, aMsg);},
		aListener);

	this.argument = aArgument;
	this.mailbox = aArgument.mailbox;
	this.serverUrl = aArgument.serverUrl;

	this.isRunning = true;
	this.execute();
}

erPrimarySMTPCheckRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("sendPrimarySmtpCheck\n");
		// We are going to do a dummy FindItem. It will return the real primarySMTP
		var req = <nsMessages:FindItem xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;
		req.@Traversal = "Shallow";

		req.nsMessages::ItemShape.nsTypes::BaseShape = "IdOnly";

		var view = <nsMessages:CalendarView xmlns:nsMessages={nsMessages}/>;
		// Dummy date range to limit result
		view.@StartDate = "2011-01-30T11:34:00Z";
		view.@EndDate = "2011-01-30T11:35:00Z";
		view.@MaxEntriesReturned = 1;

		req.appendChild(view);

		/*var ParentFolderIds = <nsMessages:ParentFolderIds xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;

		var DistinguishedFolderId = <nsTypes:DistinguishedFolderId xmlns:nsTypes={nsTypes}/>;
		DistinguishedFolderId.@Id = "calendar";
		DistinguishedFolderId.nsTypes::Mailbox.nsTypes::EmailAddress = this.mailbox; 

		ParentFolderIds.appendChild(DistinguishedFolderId);
		req.nsMessages::ParentFolderIds = ParentFolderIds;	*/	

		req.nsMessages::ParentFolderIds = makeParentFolderIds("ParentFolderIds", this.argument);

		//exchWebService.commonFunctions.LOG("erPrimarySMTPCheckRequest.execute: "+String(this.parent.makeSoapMessage(req)));
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erPrimarySMTPCheckRequest.onSendOk: "+String(aResp));

		var aContinue = true;
		var aError = false;
		var aCode = 0;
		var aMsg = "";
		var aResult = undefined;

		try {
			var responseCode = aResp.nsSoap::Body..nsMessages::ResponseCode;
		}
		catch(err) {
			aMsg = err;
			aCode = this.parent.ER_ERROR_SOAP_RESPONSECODE_NOTFOUND;
			aContinue = false;
			aError = true;
		}

		if (aContinue) {
			if (responseCode == "NoError") {
				aContinue = false;
				//gecDetailsChecked = true;
			}
		}

		if (aContinue) {
			if (responseCode == "ErrorNonPrimarySmtpAddress") {
	
				try {
					aResult = aResp.nsSoap::Body..nsMessages::MessageXml.nsTypes::Value.(@Name == "Primary");
				}
				catch(err) {
					aMsg = "Warning: Could not find Primary value. Err="+err;
					aCode = this.parent.ER_ERROR_PRIMARY_SMTP_NOTFOUND;
					aError = true;
					aContinue = false;
				}
	
				if (aContinue) {
					aContinue = false;
					//gecDetailsChecked = true;
				}
			}
		}

		if (aContinue) {
			aError = true;
			aCode = this.parent.ER_ERROR_PRIMARY_SMTP_UNKNOWN;
			try {
				aMsg = "Warning during servercheck: responseCode: " + responseCode + "\nmsg: " + aResp.nsSoap::Body..nsMessages::MessageText;
			}
			catch(err) {
				aMsg = "Warning during servercheck: responseCode: " + responseCode + "\nmsg: Could not retreive MessageText!!";
			}
		}

		if (aError) {
			this.onSendError(aExchangeRequest, aCode, aMsg);
		}
		else {
			if (this.mCbOk) {
				this.mCbOk(aResult);
			}
			this.isRunning = false;
		}
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};


