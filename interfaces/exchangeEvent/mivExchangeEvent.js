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
 * Author: Michel Verbraak (info@1st-setup.nl)
 * Website: http://www.1st-setup.nl/
 *
 * This interface/service is used for loadBalancing Request to Exchange
 *
 * ***** BEGIN LICENSE BLOCK *****/

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var Cr = Components.results;
var components = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://exchangecalendar/ecExchangeRequest.js");

//Cu.import("resource://calendar/modules/calProviderUtils.jsm");

Cu.import("resource://interfaces/exchangeBaseItem/mivExchangeBaseItem.js");

//var EXPORTED_SYMBOLS = ["mivExchangeEvent"];

function mivExchangeEvent() {

	this.initialize();

	this.initExchangeBaseItem();

	//this.logInfo("mivExchangeEvent: init");

}

var mivExchangeEventGUID = "4cd0469e-093f-4f7c-8ace-68f6ec76b36e";

mivExchangeEvent.prototype = {

	__proto__ : mivExchangeBaseItem.prototype,

	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeEvent,
				Ci.mivExchangeBaseItem,
				Ci.calIInternalShallowCopy,
				Ci.calIEvent,
				Ci.calIItemBase,
				Ci.nsIClassInfo,
				Ci.nsISupports]),

	_className : "mivExchangeEvent",

	classDescription : "Exchange calendar event.",

	classID : components.ID("{"+mivExchangeEventGUID+"}"),
	contractID : "@1st-setup.nl/exchange/calendarevent;1",
	flags : Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

	getInterfaces : function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeEvent,
			Ci.mivExchangeBaseItem,
			Ci.calIInternalShallowCopy,
			Ci.calIEvent,
			Ci.calIItemBase,
			Ci.nsIClassInfo,
			Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

	initialize : function _initialize()
	{
		this._calEvent = null;
		this._calEvent = Cc["@mozilla.org/calendar/event;1"]
					.createInstance(Ci.calIEvent);
	},

	get startDate()
	{
		//this.logInfo("get startdate 1: title:"+this.title);
		if (!this._startDate) {
			this._startDate = this.tryToSetDateValue(this.getTagValue("t:Start", null), this._calEvent.startDate);
			if (this._startDate) {
				if (this.isAllDayEvent) this._startDate.isDate = true;

				var timezone = this.timeZones.getCalTimeZoneByExchangeTimeZone(this.getTag("t:StartTimeZone"), "");
				if (timezone) {
					this._startDate = this._startDate.getInTimezone(timezone);
				}
				this._calEvent.startDate = this._startDate.clone();
			}
		}
		//this.logInfo("get startdate 2: title:"+this.title+", startdate=="+this._calEvent.startDate);
		return this._calEvent.startDate;
	},

	set startDate(aValue)
	{
		//this.logInfo("set startdate: title:"+this.title+", aValue:"+aValue);
		if (aValue.toString() != this.startDate.toString()) {
			this._newStartDate = aValue;
			this._calEvent.startDate = aValue;
		}
	},

	get endDate()
	{
		if (!this._endDate) {
			this._endDate = this.tryToSetDateValue(this.getTagValue("t:End", null), this._calEvent.endDate);
			if (this._endDate) {
				if (this.isAllDayEvent) this._endDate.isDate = true;
				var timezone = this.timeZones.getCalTimeZoneByExchangeTimeZone(this.getTag("t:EndTimeZone"), "");
				if (timezone) {
					this._endDate = this._endDate.getInTimezone(timezone);
				}
				this._calEvent.endDate = this._endDate.clone();
			}
		}
		//this.logInfo("get endDate: title:"+this.title+", endDate=="+this._calEvent.endDate, -1);
		return this._calEvent.endDate;
	},

	set endDate(aValue)
	{
		//this.logInfo("set enddate: title:"+this.title+", aValue:"+aValue);
		if (aValue.toString() != this.endDate.toString()) {
			this._newEndDate = aValue;
			this._calEvent.endDate = aValue;
		}
	},

	get duration()
	{
		if ((!this._duration) && (!this._newEndDate) && (!this._newStartDate)) {
			this._duration = this.getTagValue("t:Duration", null);
			if (this._duration) {
				//this.logInfo("get duration: title:"+this.title+", value:"+cal.createDuration(this._duration));
				return cal.createDuration(this._duration);
			}
		}
		//this.logInfo("get duration: title:"+this.title+", value:"+this._calEvent.duration);
		return this._calEvent.duration;
	},

	// status of the event
	//attribute AUTF8String status;
	get status()
	{
		if (!this._status) {
			this._status = this.myResponseType;

			const statusMap = {
				"Unknown"	: "NONE",
				"NoResponseReceived" : "NONE",
				"Tentative"	: "TENTATIVE",
				"Accept"	: "CONFIRMED",
				"Decline"	: "CANCELLED",
				"Organizer"	: "CONFIRMED",
				null: null
			};

			this._calEvent.status = statusMap[this._status];
		}
		//this.logInfo("get status: title:"+this.title+", value:"+this._calEvent.status+", this._status:"+this._status);
		return this._calEvent.status;
	},

	set status(aValue)
	{
		this.logInfo("set status: title:"+this.title+", aValue:"+aValue);
		if (aValue != this.status) {
			const statuses = { "NONE": "NoResponseReceived",
					"TENTATIVE": "Tentative", 
					"CONFIRMED" : "Accept",
					"CANCELLED" : "Decline",
					null: null };

			this._newStatus = statuses[aValue];
			this._calEvent.status = aValue;
		}
	},

};

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeEvent) {
			// Load main script from lightning that we need.
			NSGetFactory.mivExchangeEvent = XPCOMUtils.generateNSGetFactory([mivExchangeEvent]);

	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeEvent(cid);
} 

