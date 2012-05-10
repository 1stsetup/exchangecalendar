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

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");

var EXPORTED_SYMBOLS = ["erGetUserAvailabilityRequest"];

function erGetUserAvailabilityRequest(aArgument, aCbOk, aCbError, aListener)
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
	this.email = aArgument.email;
	this.attendeeType = aArgument.attendeeType;
	this.start = aArgument.start;
	this.end = aArgument.end;

	this.isRunning = true;
	this.execute();
}

erGetUserAvailabilityRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erGetUserAvailabilityRequest.execute\n");

		var req = <nsMessages:GetUserAvailabilityRequest xmlns:nsMessages={nsMessages}/>;

		/* WTF really?  Just give me UTC. */
		req.nsTypes::TimeZone.nsTypes::Bias = 0;
		req.nsTypes::TimeZone.nsTypes::StandardTime.nsTypes::Bias = 0;
		req.nsTypes::TimeZone.nsTypes::StandardTime.nsTypes::Time = '00:00:00';
		req.nsTypes::TimeZone.nsTypes::StandardTime.nsTypes::DayOrder = 1;
		req.nsTypes::TimeZone.nsTypes::StandardTime.nsTypes::Month = 0;
		req.nsTypes::TimeZone.nsTypes::StandardTime.nsTypes::DayOfWeek = "Sunday";
		req.nsTypes::TimeZone.nsTypes::DaylightTime.content = req.nsTypes::TimeZone.nsTypes::StandardTime.children();
	
		req.nsMessages::MailboxDataArray.nsTypes::MailboxData.nsTypes::Email.nsTypes::Address = this.email
		req.nsMessages::MailboxDataArray.nsTypes::MailboxData.nsTypes::AttendeeType = this.attendeeType;
	
		req.nsTypes::FreeBusyViewOptions.nsTypes::TimeWindow.nsTypes::StartTime = this.start;
		req.nsTypes::FreeBusyViewOptions.nsTypes::TimeWindow.nsTypes::EndTime = this.end;

		req.nsTypes::FreeBusyViewOptions.nsTypes::MergedFreeBusyIntervalInMinutes = 15;

		req.nsTypes::FreeBusyViewOptions.nsTypes::RequestedView = "DetailedMerged";

		//exchWebService.commonFunctions.LOG("erGetUserAvailabilityRequest.execute: "+String(this.parent.makeSoapMessage(req))+"\n");
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erGetUserAvailabilityRequest.onSendOk: "+String(aResp)+"\n");
		try {
			var responseCode = aResp.nsSoap::Body..nsMessages::ResponseCode.toString();
		}
		catch(err) {
			onSendError(aExchangeRequest, this.parent.ER_ERROR_RESPONS_NOT_VALID, "Respons does not contain expected field");
			return;
		}

		if (responseCode != "NoError") {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, "Error on getting user availability:"+responseCode);
			return;
		}
		
		var items = [];
		for each (var e in aResp..nsTypes::CalendarEvent) {
			items.push(e);
		} 
		// We also need to get the working hour period. But lightning cannot handle this.
	
		if (this.mCbOk) {
			this.mCbOk(this, items);
		}
		this.isRunning = false;
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		//exchWebService.commonFunctions.LOG("erGetUserAvailabilityRequest.onSendError: "+aCode+", "+aMsg+"\n");
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};


