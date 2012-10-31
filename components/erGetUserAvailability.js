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

		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:GetUserAvailabilityRequest xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');

		/* WTF really?  Just give me UTC. */
		var timeZone = req.addChildTag("TimeZone", "nsTypes", null);
		timeZone.addChildTag("Bias", "nsTypes", "0");
		var standardTime = timeZone.addChildTag("StandardTime", "nsTypes", null);
		standardTime.addChildTag("Bias", "nsTypes", "0");
		standardTime.addChildTag("Time", "nsTypes", "00:00:00");
		standardTime.addChildTag("DayOrder", "nsTypes", "1");
		standardTime.addChildTag("Month", "nsTypes", "0");
		standardTime.addChildTag("DayOfWeek", "nsTypes", "Sunday");

		var daylightTime = timeZone.addChildTag("DaylightTime", "nsTypes", null);
		daylightTime.addChildTag("Bias", "nsTypes", "0");
		daylightTime.addChildTag("Time", "nsTypes", "00:00:00");
		daylightTime.addChildTag("DayOrder", "nsTypes", "1");
		daylightTime.addChildTag("Month", "nsTypes", "0");
		daylightTime.addChildTag("DayOfWeek", "nsTypes", "Sunday");

		var mailboxData = req.addChildTag("MailboxDataArray", "nsMessages", null).addChildTag("MailboxData", "nsTypes", null);
		mailboxData.addChildTag("Email", "nsTypes", null).addChildTag("Address", "nsTypes", this.email);
		mailboxData.addChildTag("AttendeeType", "nsTypes", this.attendeeType);
	
		var freeBusyViewOptions = req.addChildTag("FreeBusyViewOptions", "nsTypes", null);
		var timeWindow = freeBusyViewOptions.addChildTag("TimeWindow", "nsTypes", null);
		timeWindow.addChildTag("StartTime", "nsTypes", this.start);
		timeWindow.addChildTag("EndTime", "nsTypes", this.end);

		freeBusyViewOptions.addChildTag("MergedFreeBusyIntervalInMinutes", "nsTypes", "15");

		freeBusyViewOptions.addChildTag("RequestedView", "nsTypes", "DetailedMerged");

		this.parent.xml2jxon = true;

		//exchWebService.commonFunctions.LOG("erGetUserAvailabilityRequest.execute: "+String(this.parent.makeSoapMessage(req))+"\n");
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erGetUserAvailabilityRequest.onSendOk: "+String(aResp)+"\n");

		var rm = aResp.XPath("/s:Envelope/s:Body/m:GetUserAvailabilityResponse/m:FreeBusyResponseArray/m:FreeBusyResponse/m:ResponseMessage[@ResponseClass='Success' and m:ResponseCode='NoError']");


		if (rm.length == 0) {
			exchWebService.commonFunctions.LOG("erGetUserAvailabilityRequest.onSendOk: Respons does not contain expected field");
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_RESPONS_NOT_VALID, "Respons does not contain expected field");
			return;
		}
		rm = null;

		var items = aResp.XPath("/s:Envelope/s:Body/m:GetUserAvailabilityResponse/m:FreeBusyResponseArray/m:FreeBusyResponse/m:FreeBusyView/t:CalendarEventArray/t:CalendarEvent");

		// We also need to get the working hour period. But lightning cannot handle this.
		//exchWebService.commonFunctions.LOG("erGetUserAvailabilityRequest.onSendOk 2: We have '"+items.length+"' items.");
	
		if (this.mCbOk) {
			this.mCbOk(this, items);
		}
		this.isRunning = false;
		items = null;
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


