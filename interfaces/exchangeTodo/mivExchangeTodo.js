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

Cu.import("resource://interfaces/exchangeBaseItem/mivExchangeBaseItem.js");

function mivExchangeTodo() {

	this.initialize();

	this.initExchangeBaseItem();

	//this.logInfo("mivExchangeTodo: init");

}

var mivExchangeTodoGUID = "95dac4fd-58c7-44f9-80ad-1448558fc460";

mivExchangeTodo.prototype = {

	__proto__ : mivExchangeBaseItem.prototype,

	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeTodo,
				Ci.mivExchangeBaseItem,
				Ci.calIInternalShallowCopy,
				Ci.calITodo,
				Ci.calIItemBase,
				Ci.nsIClassInfo,
				Ci.nsISupports]),

	_className : "mivExchangeTodo",

	classDescription : "Exchange calendar todo/task.",

	classID : components.ID("{"+mivExchangeTodoGUID+"}"),
	contractID : "@1st-setup.nl/exchange/calendartodo;1",
	flags : Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

	getInterfaces : function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeTodo,
			Ci.mivExchangeBaseItem,
			Ci.calIInternalShallowCopy,
			Ci.calITodo,
			Ci.calIItemBase,
			Ci.nsIClassInfo,
			Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

	initialize : function _initialize()
	{
		this._calEvent = null;
		this._calEvent = Cc["@mozilla.org/calendar/todo;1"]
					.createInstance(Ci.calITodo);
	},

	get startDate()
	{
		return this.entryDate;
	},

	//attribute calIDateTime entryDate;
	get entryDate()
	{
		//this.logInfo("get entryDate 1: title:"+this.title);
		if (!this._entryDate) {
			this._entryDate = this.tryToSetDateValue(this.getTagValue("t:StartDate", null), this._calEvent.entryDate);
			if (this._entryDate) {
				if (this.isAllDayEvent) this._entryDate.isDate = true;

				var timezone = this.timeZones.getCalTimeZoneByExchangeTimeZone(this.getTag("t:StartTimeZone"), "");
				if (timezone) {
					this._entryDate = this._entryDate.getInTimezone(timezone);
				}
				this._calEvent.entryDate = this._entryDate.clone();
			}
		}
		this.logInfo("get entryDate 2: title:"+this.title+", startdate=="+this._calEvent.entryDate);
		return this._calEvent.entryDate;
	},

	set entryDate(aValue)
	{
		//this.logInfo("set entryDate: title:"+this.title+", aValue:"+aValue);
		if (aValue.toString() != this.entryDate.toString()) {
			this._newEntryDate = aValue;
			this._calEvent.entryDate = aValue;
		}
	},

	get endDate()
	{
		return this.dueDate;
	},

	//attribute calIDateTime dueDate;
	get dueDate()
	{
		//this.logInfo("get dueDate 1: title:"+this.title);
		if (!this._dueDate) {
			this._dueDate = this.tryToSetDateValue(this.getTagValue("t:DueDate", null), this._calEvent.dueDate);
			if (this._dueDate) {
				if (this.isAllDayEvent) this._dueDate.isDate = true;

				var timezone = this.timeZones.getCalTimeZoneByExchangeTimeZone(this.getTag("t:StartTimeZone"), "");
				if (timezone) {
					this._dueDate = this._dueDate.getInTimezone(timezone);
				}
				this._calEvent.dueDate = this._dueDate.clone();
			}
		}
		this.logInfo("get dueDate 2: title:"+this.title+", startdate=="+this._calEvent.dueDate);
		return this._calEvent.dueDate;
	},

	set dueDate(aValue)
	{
		//this.logInfo("set dueDate: title:"+this.title+", aValue:"+aValue);
		if (aValue.toString() != this.dueDate.toString()) {
			this._newDueDate = aValue;
			this._calEvent.dueDate = aValue;
		}
	},

	//attribute calIDateTime completedDate;
	get completedDate()
	{
		//this.logInfo("get completedDate 1: title:"+this.title);
		if (!this._completedDate) {
			this._completedDate = this.tryToSetDateValue(this.getTagValue("t:CompleteDate", null), this._calEvent.completedDate);
			if (this._completedDate) {
				if (this.isAllDayEvent) this._completedDate.isDate = true;

				var timezone = this.timeZones.getCalTimeZoneByExchangeTimeZone(this.getTag("t:StartTimeZone"), "");
				if (timezone) {
					this._completedDate = this._completedDate.getInTimezone(timezone);
				}
				this._calEvent.completedDate = this._completedDate.clone();
			}
		}
		//this.logInfo("get completedDate 2: title:"+this.title+", startdate=="+this._calEvent.completedDate);
		return this._calEvent.dueDate;
	},

	set completedDate(aValue)
	{
		//this.logInfo("set completedDate: title:"+this.title+", aValue:"+aValue);
		if (aValue.toString() != this.completedDate.toString()) {
			this._newCompletedDate = aValue;
			this._calEvent.completedDate = aValue;
		}
	},

	//attribute short percentComplete;
	get percentComplete()
	{
		//this.logInfo("get percentComplete 1: title:"+this.title);
		if (!this._percentComplete) {
			this._percentComplete = this.getTagValue("t:PercentComplete", 0);
			if (this._completedDate) {
				this._calEvent.completedDate = this._completedDate.clone();
			}
		}
		return this._calEvent.completedDate;
	},

	set percentComplete(aValue)
	{
		//this.logInfo("set percentComplete: title:"+this.title+", aValue:"+aValue);
		if (aValue != this.percentComplete) {
			this._newPercentComplete = aValue;
			this._calEvent.percentComplete = aValue;
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

	set duration(aValue)
	{
		if (aValue.toString() != this.duration.toString()) {
			this._newDuration = aValue;
			this._calEvent.duration = aValue;
		}
	},

	// status of the event
	//attribute AUTF8String status;
	get status()
	{
		if (!this._status) {
			this._status = this.getTagValue("t:Status", null);


			const statusMap = {
				"NotStarted"	: "NONE",
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

			const statuses = { "NONE": "NotStarted",
					"IN-PROCESS": "InProgress", 
					"COMPLETED" : "Completed",
					"NEEDS-ACTION" : "WaitingOnOthers",
					"CANCELLED" : "Deferred",
					null: "NotStarted" };

			this._newStatus = statuses[aValue];
			this._calEvent.status = aValue;
		}
	},

};

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeTodo) {
			// Load main script from lightning that we need.
			NSGetFactory.mivExchangeTodo = XPCOMUtils.generateNSGetFactory([mivExchangeTodo]);

	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeTodo(cid);
} 

