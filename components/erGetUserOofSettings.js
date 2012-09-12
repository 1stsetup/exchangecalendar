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

Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://calendar/modules/calAlarmUtils.jsm");
Cu.import("resource://calendar/modules/calProviderUtils.jsm");
Cu.import("resource://calendar/modules/calAuthUtils.jsm");

Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");
Cu.import("resource://exchangecalendar/ecFunctions.js");

var EXPORTED_SYMBOLS = ["erGetUserOofSettingsRequest"];

function erGetUserOofSettingsRequest(aArgument, aCbOk, aCbError, aListener)
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

erGetUserOofSettingsRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erGetUserOofSettingsRequest.execute\n");

		//var req = <nsMessages:GetUserOofSettingsRequest xmlns:nsMessages={nsMessages}/>;
		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:GetUserOofSettingsRequest xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');

		//req.nsTypes::Mailbox.nsTypes::Address = this.mailbox;
		req.addChildTag("Mailbox", "nsTypes", null).addChildTag("Address", "nsTypes", this.mailbox);

		exchWebService.commonFunctions.LOG("erGetUserOofSettingsRequest.execute: "+String(this.parent.makeSoapMessage(req))+"\n");
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		exchWebService.commonFunctions.LOG("erGetUserOofSettingsRequest.onSendOk: "+String(aResp)+"\n");

		var rm = aResp.XPath("/s:Envelope/s:Body/m:GetUserOofSettingsResponse/m:ResponseMessage[@ResponseClass='Success' and m:ResponseCode='NoError']");
		if (rm.length == 0) {
			var responseCode = rm[0].getTagValue("m:ResponseCode");
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, "Error on getting user Oof Settings:"+responseCode);
			return;
		}

		var oofSettingsXML = aResp.XPath("/s:Envelope/s:Body/m:GetUserOofSettingsResponse/t:OofSettings");

		var oofSettings = { oofState: "Disabled",
				    startTime: null,
				    endTime: null,
				    externalAudience: "All",
				    internalReply: "",
				    externalReply: "",
				    allowExternalOof: "All"};

		if (oofSettingsXML.length == 0) {

			oofSettingsXML = oofSettingsXML[0];

			if (oofSettingsXML.nsTypes::OofState) {
				oofSettings.oofState = oofSettingsXML.nsTypes::OofState.toString();
			}
			if (oofSettingsXML.nsTypes::ExternalAudience) {
				oofSettings.externalAudience = oofSettingsXML.nsTypes::ExternalAudience.toString();
			}
			if (oofSettingsXML.nsTypes::Duration) {
				oofSettings.startTime = cal.fromRFC3339(oofSettingsXML.nsTypes::Duration.nsTypes::StartTime.toString(), exchWebService.commonFunctions.ecTZService().UTC).getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());
				oofSettings.endTime = cal.fromRFC3339(oofSettingsXML.nsTypes::Duration.nsTypes::EndTime.toString(), exchWebService.commonFunctions.ecTZService().UTC).getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());
			}
			if (oofSettingsXML.nsTypes::InternalReply) {
				oofSettings.internalReply = oofSettingsXML.nsTypes::InternalReply.nsTypes::Message.toString();
			}
			if (oofSettingsXML.nsTypes::ExternalReply) {
				oofSettings.externalReply = oofSettingsXML.nsTypes::ExternalReply.nsTypes::Message.toString();
			}
		}
		if (oofSettingsResponse.nsTypes::AllowExternalOof) {
			oofSettings.allowExternalOof = oofSettingsResponse.nsTypes::AllowExternalOof.toString();
		}

		if (this.mCbOk) {
			this.mCbOk(this, oofSettings);
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


