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

	Object.defineProperty(this, "startDate", {get : function ()
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
		                       set : function (aValue)
		{
			//this.logInfo("set startdate: title:"+this.title+", aValue:"+aValue);
			if (aValue.toString() != this.startDate.toString()) {
				this._newStartDate = aValue;
				this._calEvent.startDate = aValue;
			}
		},
		                       enumerable : true,
		                       configurable : true});


	Object.defineProperty(this, "endDate", {get : function ()
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
		                       set : function (aValue)
		{
			//this.logInfo("set enddate: title:"+this.title+", aValue:"+aValue);
			if (aValue.toString() != this.endDate.toString()) {
				this._newEndDate = aValue;
				this._calEvent.endDate = aValue;
			}
		},
		                       enumerable : true,
		                       configurable : true});

	Object.defineProperty(this, "duration", {get : function ()
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
		                       enumerable : true,
		                       configurable : true});

//		this.logInfo("mivExchangeEvent: init");

}

var mivExchangeEventGUID = "4cd0469e-093f-4f7c-8ace-68f6ec76b36e";

mivExchangeEvent.prototype = new mivExchangeBaseItem();

mivExchangeEvent.constructor = mivExchangeEvent;

mivExchangeEvent.prototype.QueryInterface = XPCOMUtils.generateQI([Ci.mivExchangeEvent,
			Ci.mivExchangeBaseItem,
			Ci.calIInternalShallowCopy,
			Ci.calIEvent,
			Ci.calIItemBase,
			Ci.nsIClassInfo,
			Ci.nsISupports]);

mivExchangeEvent.prototype._className = "mivExchangeEvent";

mivExchangeEvent.prototype.classDescription = "Exchange calendar event.";

mivExchangeEvent.prototype.classID = components.ID("{"+mivExchangeEventGUID+"}");
mivExchangeEvent.prototype.contractID = "@1st-setup.nl/exchange/calendarevent;1";
mivExchangeEvent.prototype.flags = Ci.nsIClassInfo.THREADSAFE;
mivExchangeEvent.prototype.implementationLanguage = Ci.nsIProgrammingLanguage.JAVASCRIPT;

mivExchangeEvent.prototype.getInterfaces = function _getInterfaces(count) 
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
	};

mivExchangeEvent.prototype.initialize = function _initialize()
	{
		this._calEvent = null;
		this._calEvent = Cc["@mozilla.org/calendar/event;1"]
					.createInstance(Ci.calIEvent);
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

