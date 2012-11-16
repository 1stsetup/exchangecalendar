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

Cu.import("resource://calendar/modules/calProviderUtils.jsm");

function mivExchangeEvent() {

	this._calEvent = Cc["@mozilla.org/calendar/event;1"]
				.createInstance(Ci.calIEvent);

	this._exchangeData = null;
	this.updatedItem = {};
	this.newItem = {};

	this._changesAttendees = new Array();
	this._changesAttachments = new Array();
	this._changesAlarm = new Array();
	this._changedProperties = new Array();

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

}

var PREF_MAINPART = 'extensions.1st-setup.exchangecalendar.abcard.';

var mivExchangeEventGUID = "4cd0469e-093f-4f7c-8ace-68f6ec76b36e";

mivExchangeEvent.prototype = {

	// methods from nsISupport

	/* void QueryInterface(
	  in nsIIDRef uuid,
	  [iid_is(uuid),retval] out nsQIResult result
	);	 */
	QueryInterface: XPCOMUtils.generateQI([Ci.mivExchangeEvent,
			Ci.calIEvent,
			Ci.calIItemBase,
			Ci.nsISupports]),

	// Attributes from nsIClassInfo

	classDescription: "Exchange calendar event.",
	classID: components.ID("{"+mivExchangeEventGUID+"}"),
	contractID: "@1st-setup.nl/exchange/calendarevent;1",
	flags: Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// External methods calIItemBase

	// returns true if this thing is able to be modified;
	// if the item is not mutable, attempts to modify
	// any data will throw CAL_ERROR_ITEM_IS_IMMUTABLE
	//readonly attribute boolean isMutable;
	get isMutable()
	{
		return this._calEvent.isMutable;
	},

	// makes this item immutable
	//void makeImmutable();
	makeImmutable: function _makeImmutable()
	{
		this._calEvent.makeImmutable();
	},

	// clone always returns a mutable event
	//calIItemBase clone();
	clone: function _clone()
	{
		this.logInfo("clone 1: title:"+this.title, -1);
		var result = Cc["@1st-setup.nl/exchange/calendarevent;1"]
				.createInstance(Ci.mivExchangeEvent);
		this.logInfo("clone 2: title:"+this.title, -1);
		result.exchangeData = this._exchangeData;
		this.logInfo("clone 3: title:"+this.title, -1);
		result.cloneToCalEvent(this._calEvent);
		this.logInfo("clone 4: title:"+this.title, -1);

		if (this._newStartDate) result.startDate = this.startDate.clone();
		this.logInfo("clone 5: title:"+this.title, -1);
		if (this._newEndDate) result.endDate = this.endDate.clone();
		this.logInfo("clone 6: title:"+this.title, -1);

		// We are going to replay all changes to clone
		if (this._newTitle) result.title = this.title;
		if (this._newPriority) result.priority = this.priority;
		if (this._newPrivacy) result.privacy = this.privacy;
		if (this._newStatus) result.status = this.status;
		if (this._changesAlarm) {
			result.clearAlarms();
			var alarms = this._calEvent.getAlarms({});
			for each(var alarm in alarms) {
				result.addAlarm(alarm);
			}
		}
		if (this._newRecurrenceInfo) result.recurrenceInfo = this.recurrenceInfo;
		if (this._newBody) result.setProperty("DESCRIPTION", this.getProperty("DESCRIPTION"));
		if (this._newLocation) result.setProperty("LOCATION", this.getProperty("LOCATION"));
		if (this._newLegacyFreeBusyStatus) result.setProperty("TRANSP", this.getProperty("TRANSP"));
		if (this._newMyResponseType) result.setProperty("STATUS", this.getProperty("STATUS")); 
		if (this._changedProperties) {
			for each(var change in this._changedProperties) {
				switch (change.action) {
				case "set": 
					result.setProperty(change.name, change.value);
					break;
				case "remove":
					result.deleteProperty(change.name);
					break;
				}
			}
		}
		if (this._newOrganizer) result.organizer = this.organizer.clone();

		if (this._changesAttendees) {
			for each(var attendee in this._changesAttendees) {
				switch (attendee.action) {
				case "add": 
					result.addAttendee(change.attendee);
					break;
				case "remove":
					result.removeAttendee(change.attendee);
					break;
				}
			}
		}

		if (this._changesAttachments) {
			for each(var attachment in this._changesAttachments) {
				switch (attachment.action) {
				case "add": 
					result.addAttachment(change.attachment);
					break;
				case "remove":
					result.removeAttachment(change.attachment);
					break;
				}
			}
		}
		if (this._changesCategories) {
			var categories = this.getCategories({});
			result.setCategories(categories.length, categories);
		}

		this.logInfo("clone 99: title:"+this.title+", startDate:"+result.startDate, -1);
		return result;
	},

	/**
	* Hash Id that incorporates the item's UID, RECURRENCE-ID and calendar.id
	* to be used for lookup of items that come from different calendars.
	* Setting either id, recurrenceId or the calendar attribute leads to
	* a recomputation of hashId.
	*
	* @attention Individual implementors of calIItemBase must stick to the
	*            same algorithm that base/src/calItemBase.js uses.
	*/
	//readonly attribute AUTF8String hashId;
	get hashId()
	{
		return this._calEvent.hashId;
	},

	/**
	* Checks whether the argument object refers the same calendar item as
	* this one, by testing both the id and recurrenceId property.  This
	*
	* @arg aItem     the item to compare against this one
	*
	* @return        true if both ids match, false otherwise
	*/
	//boolean hasSameIds(in calIItemBase aItem);
	hasSameIds: function _hasSameIds(aItem)
	{
		return this._calEvent.hasSameIds(aItem);
	},

	/**
	* Returns the acl entry associated to the item.
	*/
	//readonly attribute calIItemACLEntry aclEntry;
	get aclEntry()
	{
		return this._calEvent.aclEntry;
	},

	//
	// the generation number of this item
	//
	//attribute PRUint32 generation;
	get generation()
	{
		return this._calEvent.generation;
	},

	set generation(aValue)
	{
		this.logInfo("set generation: title:"+this.title);
		this._calEvent.generation = aValue;
	},

	// the time when this item was created
	//readonly attribute calIDateTime creationDate;
	get creationDate()
	{
		return this.dateTimeCreated;
	},

	// last time any attribute was modified on this item, in UTC
	//readonly attribute calIDateTime lastModifiedTime;
	get lastModifiedTime()
	{
		if (!this._lastModifiedTime) {
			this._lastModifiedTime = this.tryToSetDateValueUTC(this.getTagValue("t:LastModifiedTime", null), null);
		}
		return this._lastModifiedTime;
	},

	// last time a "significant change" was made to this item
	//readonly attribute calIDateTime stampTime;
	get stampTime()
	{
		return this._calEvent.stampTime;
	},

	// the calICalendar to which this event belongs
	//attribute calICalendar calendar;
	get calendar()
	{
		return this._calEvent.calendar;
	},

	set calendar(aValue)
	{
		this._calEvent.calendar = aValue;
	},

	// the ID of this event
	//attribute AUTF8String id;
	get id()
	{
		if (!this._id) {
			this._id = this.getAttributeByTag("t:ItemId", "Id", null);
			if (this._id) {
				this._calEvent.id = this._id;
			}
		}
		return this._calEvent.id;
	},

	set id(aValue) 
	{
		this.logInfo("set id: title:"+this.title);
		// Should never be done by any external app.
	},

	// event title
	//attribute AUTF8String title;
	get title()
	{
		if (!this._title) {
			this._title = this.subject;
			if (this._title) this._calEvent.title = this._title;
		}
		return this._calEvent.title;
	},

	set title(aValue)
	{
		this.logInfo("set title: oldTitle:"+this.title+", newTitle:"+aValue);
		if (aValue != this.title) {
			this._newTitle = aValue;
			this._calEvent.title = aValue;
		}
	},

	// event priority
	//attribute short priority;
	get priority()
	{
		if (!this._priority) {
			this._priority = this.getTagValue("t:Importance");
			switch(this._priority) {
				case "Low" : 
					this._calEvent.priority = 9;
					break;
				case "Normal" : 
					this._calEvent.priority = 5;
					break;
				case "High" : 
					this._calEvent.priority = 1;
					break;
			}
		}
		return this._calEvent.priority;
	},

	set priority(aValue)
	{
		this.logInfo("set priority: title:"+this.title+", aValue:"+aValue);
		if (aValue != this.Priority) {
			if (aValue > 5) {
				this._newPriority = "Low";
			}
			if (aValue == 5) {
				this._newPriority = "Normal";
			}
			if (aValue < 5) {
				this._newPriority = "High";
			}
			if (aValue == 0) {
				this._newPriority = "Normal";
			}
			this._calEvent.priority = aValue;
		}
	},

	//attribute AUTF8String privacy;
	get privacy()
	{
		if (!this._privacy) {
			this._privacy = this.getTagValue("t:Sensitivity");
			switch(this._privacy) {
				case "Normal" : 
					this._calEvent.privacy = "PUBLIC";
					break;
				case "Confidential" : 
					this._calEvent.privacy = "CONFIDENTIAL";
					break;
				case "Personal" : 
					this._calEvent.privacy = "PRIVATE";
					break;
				case "Private" : 
					this._calEvent.privacy = "PRIVATE";
					break;
				default :
					this._calEvent.privacy = "PUBLIC";
			}
		}
		return this._calEvent.privacy;
	},

	set privacy(aValue)
	{
		this.logInfo("set privacy: title:"+this.title+", aValue:"+aValue);
		if (aValue != this.privacy) {
			const privacies = { "PUBLIC": "Normal",
					"CONFIDENTIAL": "Confidential", 
					"PRIVATE" : "Private",
					null: "Normal" };
			this._newPrivacy = privacies[aValue];
			this._calEvent.privacy = aValue;
		}
	},

	// status of the event
	//attribute AUTF8String status;
	get status()
	{
		if (!this._status) {
			this._status = this.sensitivity;
			switch(this._status) {
				case "NotStarted" : 
					this._calEvent.status = "NONE";
					break;
				case "InProgress" : 
					this._calEvent.status = "IN-PROCESS";
					break;
				case "Completed" : 
					this._calEvent.status = "COMPLETED";
					break;
				case "WaitingOnOthers" : 
					this._calEvent.status = "NEEDS-ACTION";
					break;
				case "Deferred" : 
					this._calEvent.status = "CANCELLED";
					break;
			}
		}
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

	// ical interop; writing this means parsing
	// the ical string into this event
	//attribute AUTF8String icalString;
	get icalString()
	{
		return this._calEvent.icalString;
	},

	set icalString(aValue)
	{
		this.logInfo("set icalString: title:"+this.title+", aValue:"+aValue);
		this._calEvent.icalString = aValue;
	},

	// an icalComponent for this item, suitable for serialization.
	// the icalComponent returned is not live: changes in it or this
	// item will not be reflected in the other.
	//attribute calIIcalComponent icalComponent;
	get icalComponent()
	{
		return this._calEvent.icalComponent;
	},

	set icalComponent(aValue)
	{
		this._calEvent.icalComponent = aValue;
	},

	//
	// alarms
	//

	/**
	* Get all alarms assigned to this item
	*
	* @param count       The number of alarms
	* @param aAlarms     The array of calIAlarms
	*/
	//void getAlarms(out PRUint32 count, [array, size_is(count), retval] out calIAlarm aAlarms);
	getAlarms: function _getAlarms(count)
	{
		if (!this._alarm) {
			if (this.reminderIsSet) {
				var alarm = cal.createAlarm();
				alarm.action = "DISPLAY";
				alarm.repeat = 0;

				var alarmOffset = cal.createDuration();
				alarmOffset.minutes = -1 * this.reminderMinutesBeforeStart;

				// This is a bug fix for when the offset is more than a year)
				if (alarmOffset.minutes < (-60*24*365)) {
					alarmOffset.minutes = -5;
				}
				alarmOffset.normalize();

				alarm.related = Ci.calIAlarm.ALARM_RELATED_START;
				alarm.offset = alarmOffset;

				this.logInfo("Alarm set with an offset of "+alarmOffset.minutes+" minutes from the start");

				this._alarm = alarm.clone();
				this._calEvent.addAlarm(alarm);
			}
		}
		return this._calEvent.getAlarms(count);
	},

	/**
	* Add an alarm to the item
	*
	* @param aAlarm      The calIAlarm to add
	*/
	//void addAlarm(in calIAlarm aAlarm);
	addAlarm: function _addAlarm(aAlarm)
	{
		this.getAlarms({});

		if (this._newAlarm) {
			this._calEvent.deleteAlarm(this._newAlarm);
			this._changesAlarm.push({ action: "remove", alarm: this._newAlarm});
		}
		this._newAlarm = aAlarm.clone();
		this._changesAlarm.push({ action: "add", alarm: this._newAlarm});
		this._calEvent.addAlarm(aAlarm);
	},

	/**
	* Delete an alarm from the item
	*
	* @param aAlarm      The calIAlarm to delete
	*/
	//void deleteAlarm(in calIAlarm aAlarm);
	deleteAlarm: function _deleteAlarm(aAlarm)
	{
		this._changesAlarm.push({ action: "remove", alarm: this._newAlarm});
		this._newAlarm = null;
		this._calEvent.deleteAlarm(aAlarm);
	},

	/**
	* Clear all alarms from the item
	*/
	//void clearAlarms();
	clearAlarms: function _clearAlarms()
	{
		var oldAlarms = this.getAlarms({});
		for each(var alarm in oldAlarms) {
			this._changesAlarm.push({ action: "remove", alarm: alarm});
		}
		this._newAlarm = null;
		this._calEvent.clearAlarms();
	},

	// The last time this alarm was fired and acknowledged by the user; coerced to UTC.
	//attribute calIDateTime alarmLastAck;
	get alarmLastAck()
	{
		return this.tryToSetDateValueUTC("2030-01-01T00:00:00Z", null); // For now we snooze all old alarms.
		return this._calEvent.alarmLastAck;
	},

	set alarmLastAck(aValue)
	{
		if (aValue) {
			this.logInfo("set alarmLastAck: User snoozed alarm. Title:"+this.title+", aValue:"+aValue.toString());
		}
		else {
			this.logInfo("set alarmLastAck: set to null for Title:"+this.title);
		}
		this._calEvent.alarmLastAck = aValue;
	},

	//
	// recurrence
	//
	//attribute calIRecurrenceInfo recurrenceInfo;
	get recurrenceInfo()
	{
		if (!this._recurrenceInfo) {
			var recurrence = this._exchangeData.XPath("/t:Recurrence/*");
			var recrule = this.readRecurrenceRule(recurrence);
			recurrence = null;
	
			var recurrenceInfo = cal.createRecurrenceInfo(this);
			if (recrule) {
				recurrenceInfo.setRecurrenceItems(1, [recrule]);
			}
			this._recurrenceInfo = recurrenceInfo.clone();
			this._calEvent.recurrenceInfo = recurrenceInfo;
		}
		return this._calEvent.recurrenceInfo;
	},

	set recurrenceInfo(aValue)
	{
		this.logInfo("set recurrenceInfo: title:"+this.title+", aValue:"+aValue);
		if ((this.recurrenceInfo) && (aValue.toString() != this.recurrenceInfo.toString())) {
			this._newRecurrenceInfo = aValue.clone();
			this._calEvent.recurrenceInfo = aValue;
		}
	},

	//readonly attribute calIDateTime recurrenceStartDate;
	get recurrenceStartDate()
	{
		if ((this.recurrenceInfo) && (!this._newRecurrenceInfo)) {
			if (this._recurrenceStartDate) {
				return this._recurrenceStartDate;
			}
		}
		return this._calEvent.recurrenceStartDate;
	},

	//
	// All event properties are stored in a property bag;
	// some number of these are "promoted" to top-level
	// accessor attributes.  For example, "SUMMARY" is
	// promoted to the top-level "title" attribute.
	//
	// If you use the has/get/set/deleteProperty
	// methods, property names are case-insensitive.
	//
	// For purposes of ICS serialization, all property names in
	// the hashbag are in uppercase.
	//
	// The isPropertyPromoted() attribute can will indicate
	// if a particular property is promoted or not, for
	// serialization purposes.
	//

	// Note that if this item is a proxy, then any requests for
	// non-existant properties will be forward to the parent item.

	// some other properties that may exist:
	//
	// 'description' - description (string)
	// 'location' - location (string)
	// 'categories' - categories (string)
	// 'syncId' - sync id (string)
	// 'inviteEmailAddress' - string
	// alarmLength/alarmUnits/alarmEmailAddress/lastAlarmAck
	// recurInterval/recurCount/recurWeekdays/recurWeeknumber

	// these forward to an internal property bag; implemented here, so we can
	// do access control on set/delete to have control over mutability.
	//readonly attribute nsISimpleEnumerator propertyEnumerator;
	get propertyEnumerator()
	{
		this.getProperty("DESCRIPTION"); // To preload.
		this.getProperty("LOCATION"); // To preload.
		this.getProperty("TRANSP"); // To preload.
		this.getProperty("STATUS"); // To preload.
		this.getProperty("X-MOZ-SEND-INVITATIONS"); // To preload.
		return this._calEvent.propertyEnumerator;
	},

	//boolean hasProperty(in AString name);
	hasProperty: function _hasProperty(name)
	{
		this.getProperty(name); // To preload.
		return this._calEvent.hasProperty(name);
	},

	/**
	* Gets a particular property.
	* Objects passed back are still owned by the item, e.g. if callers need to
	* store or modify a calIDateTime they must clone it.
	*/
	//nsIVariant getProperty(in AString name);
	getProperty: function _getProperty(name)
	{
		this.logInfo("get property: title:"+this.title+", name:"+name);
		switch (name) {
		case "DESCRIPTION": 
			if (!this._body) {
				this._body = this.getTagValue("t:Body", null);
				if (this._body) this._calEvent.setProperty(name, this._body);
			}
			break;
		case "LOCATION": 
			if ((this.location) && (!this._newLocation)) this._calEvent.setProperty(name, this.location);
			break;
		case "TRANSP": 
			if (!this._newLegacyFreeBusyStatus) {
				switch (this.legacyFreeBusyStatus) {
				case "Free" : 
					this._calEvent.setProperty(name, "TRANSPARENT");
					break;
				case "Busy" : 
				case "Tentative" : 
				case "OOF" : 
					this._calEvent.setProperty(name, "OPAQUE");
					break;
				}
			}
			break;
		case "STATUS": 
			if (!this._myResponseType) {
				this._myResponseType = this.getTagValue("t:MyResponseType", null);
				switch (this._myResponseType) {
				case "Unknown" : 
					this._calEvent.setProperty(name, "NONE");
					break;
				case "Organizer" : 
					this._calEvent.setProperty(name, "CONFIRMED");
					break;
				case "Tentative" : 
					this._calEvent.setProperty(name, "TENTATIVE");
					break;
				case "Accept" : 
					this._calEvent.setProperty(name, "CONFIRMED");
					break;
				case "Decline" : 
					this._calEvent.setProperty(name, "CANCELLED");
					break;
				case "NoResponseReceived" : 
					this._calEvent.setProperty(name, "NONE");
					break;
				default:
					this._calEvent.setProperty(name, "NONE");
					break;
				}
			}
			break;
		case "X-MOZ-SEND-INVITATIONS": 
			if ((this.responseObjects.acceptItem) ||
			    (this.responseObjects.tentativelyAcceptItem) ||
			    (this.responseObjects.declineItem)) {
				this._calEvent.setProperty(name, true);
			}
			else {
				this._calEvent.setProperty(name, false);
			}
			break;

		}

		return this._calEvent.getProperty(name);
	},

	/**
	* Sets a particular property.
	* Ownership of objects gets passed to the item, e.g. callers must not
	* modify a calIDateTime after it's been passed to an item.
	*
	* @warning this reflects the current implementation
	*          xxx todo: rethink whether it's more sensible to store
	*                    clones in calItemBase.
	*/
	//void setProperty(in AString name, in nsIVariant value);
	setProperty: function _setProperty(name, value)
	{
		this.logInfo("set property: title:"+this.title+", name:"+name+", aValue:"+value);
		switch (name) {
		case "DESCRIPTION": 
			if (value != this.getProperty(name)) {
				this._newBody = value;
			}
			break;
		case "LOCATION": 
			if (value != this.getProperty(name)) {
				this._newLocation = value;
			}
			break;
		case "TRANSP": 
			if (value != this.getProperty(name)) {
				switch (value) {
				case "TRANSPARENT":
					this._newLegacyFreeBusyStatus = "Free";
					break;
				case "OPAQUE":		
					this._newLegacyFreeBusyStatus = "Busy";
					break;
				default	:	
					this._newLegacyFreeBusyStatus = "Busy";
					break;
				}
			}
			break;
		case "STATUS": 
			if (value != this.getProperty(name)) {
				switch (value) {
				case "NONE":
					this._newMyResponseType = "Unknown";
					break;
				case "CONFIRMED":
					this._newMyResponseType = "Accept";
					break;
				case "TENTATIVE":
					this._newMyResponseType = "Tentative";
					break;
				case "CANCELLED":
					this._newMyResponseType = "Decline";
					break;
				default:
					this._newMyResponseType = "Unknown";
					break;
				}
			}
			break;
		default:
			this._changedProperties.push({ action: "set", name: name, value: value});
		}

		this._calEvent.setProperty(name, value);
	},

	// will not throw an error if you delete a property that doesn't exist
	//void deleteProperty(in AString name);
	deleteProperty: function _deleteProperty(name)
	{
		this.logInfo("delete priority: title:"+this.title+", name:"+name);
		switch (name) {
		case "DESCRIPTION": 
			this._newBody = "";
			break;
		case "LOCATION": 
			this._newLocation = "";
			break;
		case "TRANSP": 
			this._newLegacyFreeBusyStatus = "";
			break;
		case "STATUS": 
			this._newMyResponseType = "";
			break;
		default:
			this._changedProperties.push({ action: "remove", name: name});
		}

		this._calEvent.deleteProperty(name);
	},

	// returns true if the given property is promoted to some
	// top-level attribute (e.g. id or title)
	//boolean isPropertyPromoted(in AString name);
	isPropertyPromoted: function _isPropertyPromoted(name)
	{
		return this._calEvent.isPropertyPromoted(name);
	},

	/**
	* Returns a particular parameter value for a property, or null if the
	* parameter does not exist.  If the property does not exist, throws.
	*
	* @param aPropertyName  the name of the property
	* @param aParameterName the name of the parameter on the property
	*/
	//AString getPropertyParameter(in AString aPropertyName,
	//	               in AString aParameterName);
	getPropertyParameter: function _getPropertyParameter(aPropertyName, aParameterName)
	{
		return this._calEvent.getPropertyParameter(aPropertyName, aParameterName);
	},

	/**
	* Checks if the given property has the given parameter.
	*
	* @param aPropertyName   The name of the property.
	* @param aParameterName  The name of the parameter on the property.
	* @return                True, if the parameter exists on the property
	*/
	//boolean hasPropertyParameter(in AString aPropertyName,
	//	              in AString aParameterName);
	hasPropertyParameter: function _hasPropertyParameter(aPropertyName, aParameterName)
	{
		return this._calEvent.hasPropertyParameter(aPropertyName, aParameterName);
	},

	/**
	* Sets a particular parameter value for a property, or unsets if null is
	* passed. If the property does not exist, throws.
	*
	* @param aPropertyName   The name of the property
	* @param aParameterName  The name of the parameter on the property
	* @param aParameterValue The value of the parameter to set
	*/
	//void setPropertyParameter(in AString aPropertyName,
	//	            in AString aParameterName,
	//	            in AUTF8String aParameterValue);
	setPropertyParameter: function _setPropertyParameter(aPropertyName, aParameterName, aParameterValue)
	{
		return this._calEvent.setPropertyParameter(aPropertyName, aParameterName, aParameterValue);
	},

	/**
	* Returns a property parameter enumerator for the given property name
	*
	* @param aPropertyName   The name of the property.
	* @return                The parameter enumerator.
	*/
	//nsISimpleEnumerator getParameterEnumerator(in AString aPropertyName);
	getParameterEnumerator: function _getParameterEnumerator(aPropertyName)
	{
		return this._calEvent.getParameterEnumerator(aPropertyName);
	},

	/**
	* The organizer (originator) of the item.  We will likely not
	* honour or preserve all fields in the calIAttendee passed around here.
	* A base class like calIPerson might be more appropriate here, if we ever
	* grow one.
	*/
	//attribute calIAttendee organizer;
	get organizer()
	{
		if (!this._organizer) {
			this._organizer = this.createAttendee(this.getTag("t:Organizer"), "CHAIR");
			this._organizer.isOrganizer = true;
			if (this._organizer) this._calEvent.organizer = this._organizer;
		}

		return this._calEvent.organizer;
	},

	set organizer(aValue)
	{
		this.logInfo("set organizer: title:"+this.title+", aValue:"+aValue);
		if ((!this.organizer) || (aValue.toString() != this.organizer.toString())) {
			this._newOrganizer = aValue.clone();
			this._calEvent.organizer = aValue;
		}
	},

	//
	// Attendees
	//

	// The array returned here is not live; it will not reflect calls to
	// removeAttendee/addAttendee that follow the call to getAttendees.
	//void getAttendees(out PRUint32 count,
	//	    [array,size_is(count),retval] out calIAttendee attendees);
	getAttendees: function _getAttendees(count)
	{
		if (!this._attendees) {
			this.attendees = new Array();
			var tmpAttendee;

			var attendees = this._exchangeData.XPath("/t:RequiredAttendees/t:Attendee")
			for each (var at in attendees) {
				tmpAttendee = this.createAttendee(at, "REQ-PARTICIPANT");
				this._calEvent.addAttendee(tmpAttendee);
				this.attendees.push(tmpAttendee.clone());
			}
			attendees = null;
			attendees = this._exchangeData.XPath("/t:OptionalAttendees/t:Attendee")
			for each (var at in attendees) {
				tmpAttendee = this.createAttendee(at, "OPT-PARTICIPANT");
				this._calEvent.addAttendee(tmpAttendee);
				this.attendees.push(tmpAttendee.clone());
			}
			attendees = null;
		}
		return this._calEvent.getAttendees(count);
	},

	/**
	* getAttendeeById's matching is done in a case-insensitive manner to handle
	* places where "MAILTO:" or similar properties are capitalized arbitrarily
	* by different calendar clients.
	*/
	//calIAttendee getAttendeeById(in AUTF8String id);
	getAttendeeById: function _getAttendeeById(id)
	{
		if (!this._attendees) this.getAttendees({});

		return this._calEvent.getAttendeeById(id);
	},

	//void addAttendee(in calIAttendee attendee);
	addAttendee: function _addAttendee(attendee)
	{
		if (!this._newAttendees) this._newAttendees = new Array();
		this._changesAttendees.push({ action: "add", attendee: attendee.clone()});
		this._calEvent.addAttendee(attendee);
	},

	//void removeAttendee(in calIAttendee attendee);
	removeAttendee: function _removeAttendee(attendee)
	{
		if (!this._removedAttendees) this._removedAttendees = new Array();
		this._changesAttendees.push({ action: "remove", attendee: attendee.clone()});
		this._calEvent.removeAttendee(attendee);
	},

	//void removeAllAttendees();
	removeAllAttendees: function _removeAllAttendees()
	{
		var allAttendees = this._calEvent.getAttendees({});
		for each(var attendee in allAttendees) {
			if (!this._removedAttendees) this._removedAttendees = new Array();
			this._changesAttendees.push({ action: "remove", attendee: attendee.clone()});
		}
		allAttendees = null;			
		this._calEvent.removeAllAttendees();
	},

	//
	// Attachments
	//
	//void getAttachments(out PRUint32 count,
	//	      [array,size_is(count),retval] out calIAttachment attachments);
	getAttachments: function _getAttachments(count)
	{
		if (!this._attachments) {
			this._attachments = new Array();
			if (this.getTagValue("t:HasAttachments") == "true") {
	//			if (this.debug) this.logInfo("Title:"+aItem.title+"Attachments:"+aExchangeItem.getTagValue("Attachments"));
				var fileAttachments = this._exchangeData.XPath("/t:Attachments/t:FileAttachment");
				for each(var fileAttachment in fileAttachments) {
	//				if (this.debug) this.logInfo(" -- Attachment: name="+fileAttachment.getTagValue("t:Name"));

					var newAttachment = createAttachment();
					newAttachment.setParameter("X-AttachmentId",fileAttachment.getAttributeByTag("t:AttachmentId","Id")); 
//					newAttachment.uri = makeURL(this.serverUrl+"/?id="+encodeURIComponent(fileAttachment.getAttributeByTag("t:AttachmentId","Id"))+"&name="+encodeURIComponent(fileAttachment.getTagValue("t:Name"))+"&size="+encodeURIComponent(fileAttachment.getTagValue("t:Size", ""))+"&user="+encodeURIComponent(this.user));
					newAttachment.uri = makeURL(this.serverUrl+"/?id="+encodeURIComponent(fileAttachment.getAttributeByTag("t:AttachmentId","Id"))+"&name="+encodeURIComponent(fileAttachment.getTagValue("t:Name"))+"&size="+encodeURIComponent(fileAttachment.getTagValue("t:Size", ""))+"&user="+encodeURIComponent("xx"));

					//if (this.debug) this.logInfo("New attachment URI:"+this.serverUrl+"/?id="+encodeURIComponent(fileAttachment.getAttributeByTag("t:AttachmentId","Id"))+"&name="+encodeURIComponent(fileAttachment.getTagValue("t:Name"))+"&size="+encodeURIComponent(fileAttachment.getTagValue("t:Size", ""))+"&user="+encodeURIComponent(this.user));

					this._attachments.push(newAttachment.clone());
					this._calEvent.addAttachment(newAttachment);
				}
				fileAttachments = null;
			} 
		}
		return this._calEvent.getAttachments(count);
	},

	//void addAttachment(in calIAttachment attachment);
	addAttachment: function _addAttachment(attachment)
	{
		if (!this._newAttachments) this._newAttachments = new Array();
		this._changesAttachments.push({ action: "add", attachment: attachment.clone()});
		this._calEvent.addAttachment(attachment);
	},

	//void removeAttachment(in calIAttachment attachment);
	removeAttachment: function _removeAttachment(attachment)
	{
		if (!this._removedAttachments) this._removedAttachments = new Array();
		this._changesAttachments.push({ action: "remove", attachment: attachment.clone()});
		this._calEvent.removeAttachment(attachment);
	},

	//void removeAllAttachments();
	removeAllAttachments: function _removeAllAttachments()
	{
		var allAttachments = this._calEvent.getAttachments({});
		for each(var attachment in allAttachments) {
			if (!this._removedAttachments) this._removedAttachments = new Array();
			this._changesAttachments.push({ action: "remove", attachment: attachment.clone()});
		}
		allAttachments = null;			
		this._calEvent.removeAllAttachments();
	},

	//
	// Categories
	//

	/**
	* Gets the array of categories this item belongs to.
	*/
	//void getCategories(out PRUint32 aCount,
	//	     [array, size_is(aCount), retval] out wstring aCategories);
	getCategories: function _getCategories(aCount)
	{
		if (!this._categories) {
			this._categories = new Array();
			if (this._exchangeData) {
				var strings = this._exchangeData.XPath("/t:Categories/t:String");
				for each (var cat in strings) {
					this._categories.push(cat.value);
				}
				strings = null;
			}
			this._calEvent.setCategories(this._categories.length, this._categories);
		}
		return this._calEvent.getCategories(aCount);
	},

	/**
	* Sets the array of categories this item belongs to.
	*/
	//void setCategories(in PRUint32 aCount,
	//	     [array, size_is(aCount)] in wstring aCategories);
	setCategories: function _setCategories(aCount, aCategories)
	{
		this.logInfo("set categories: title:"+this.title);
		this._changesCategories = true;
		this._calEvent.setCategories(aCount, aCategories);
	},

	//
	// Relations
	//

	/**
	* This gives back every relation where the item is neighter the owner of the
	* relation nor the referred relation
	*/
	//void getRelations(out PRUint32 count,
	//	    [array,size_is(count),retval] out calIRelation relations);
	getRelations: function _getRelations(count)
	{
		return this._calEvent.getRelations(count);
	},

	/**
	* Adds a relation to the item
	*/
	//void addRelation(in calIRelation relation);
	addRelation: function _addRelation(relation)
	{
		this._calEvent.addRelation(relation);
	},

	/**
	* Removes the relation for this item and the referred item
	*/
	//void removeRelation(in calIRelation relation);
	removeRelation: function _removeRelation(relation)
	{
		this._calEvent.removeRelation(relation);
	},

	/**
	* Removes every relation for this item (in this items and also where it is referred
	*/
	//void removeAllRelations();
	removeAllRelations: function _removeAllRelations()
	{
		this._calEvent.removeAllRelations();
	},

	// Occurrence querying
	//

	/**
	* Return a list of occurrences of this item between the given dates.  The items
	* returned are the same type as this one, as proxies.
	*/
	//void getOccurrencesBetween (in calIDateTime aStartDate, in calIDateTime aEndDate,
	//	              out PRUint32 aCount,
	//	              [array,size_is(aCount),retval] out calIItemBase aOccurrences);
	getOccurrencesBetween: function _getOccurrencesBetween(aStartDate, aEndDate, aCount)
	{
		return this._calEvent.getOccurrencesBetween(aStartDate, aEndDate, aCount);
	},

	/**
	* If this item is a proxy or overridden item, parentItem will point upwards
	* to our parent.  Otherwise, it will point to this.
	* parentItem can thus always be used for modifyItem() calls
	* to providers.
	*/
	//attribute calIItemBase parentItem;
	get parentItem()
	{
		return this._calEvent.parentItem;
	},

	set parentItem(aValue)
	{
		this._calEvent.parentItem = aValue;
	},

	/**
	* The recurrence ID, a.k.a. DTSTART-of-calculated-occurrence,
	* or null if this isn't an occurrence.
	* Be conservative about setting this. It isn't marked as such, but
	* consider it as readonly.
	*/
	//attribute calIDateTime recurrenceId;
	get recurrenceId()
	{
		if (!this._recurrenceId) {
			this._recurrenceId = this.tryToSetDateValueUTC(this.getTagValue("t:RecurrenceId", null), this._calEvent.recurrenceId);
			if (this._recurrenceId) this._calEvent.recurrenceId = this._recurrenceId;
		}
		return this._calEvent.recurrenceId;
	},

	set recurrenceId(aValue)
	{
		if (aValue) {
			this.logInfo("set recurrenceId: User tries to set recurrenceId to:"+aValue.toString()+", title:"+this.title);
		}
		else {
			this.logInfo("set recurrenceId: User tries to set recurrenceId to null, title:"+this.title);
		}
		this._calEvent.recurrenceId = aValue; 
	},

	// External methods calIEvent

	// these attributes are marked readonly, as the calIDates are owned
	// by the event; however, the actual calIDate objects are not read
	// only and are intended to be manipulated to adjust dates.

	/**
	* The (inclusive) start of the event.
	*/
	//attribute calIDateTime startDate;
	get startDate()
	{
		if (!this._startDate) {
			this._startDate = this.tryToSetDateValue(this.getTagValue("t:Start", null), this._calEvent.startDate);
			if (this.isAllDayEvent) this._startDate.isDate = true;
			if (this._startDate) {
				this._calEvent.startDate = this._startDate.clone();
				this.logInfo("get startdate 1: title:"+this.title+", startdate=="+this._calEvent.startDate.toString(), -1);
			}
			else {
				this.logInfo("get startdate 2: title:"+this.title+", startdate==null", -1);
			}
		}
		this.logInfo("get startdate 3: title:"+this.title+", startdate=="+this._calEvent.startDate, -1);
		return this._calEvent.startDate;
	},

	set startDate(aValue)
	{
		this.logInfo("set startdate: title:"+this.title+", aValue:"+aValue);
		if (aValue.toString() != this.startDate.toString()) {
			this._newStartDate = aValue;
			this._calEvent.startDate = aValue;
		}
	},

	/**
	* The (non-inclusive) end of the event.
	* Note that for all-day events, non-inclusive means that this will be set
	* to the day after the last day of the event.
	* If startDate.isDate is set, endDate.isDate must also be set.
	*/
	//attribute calIDateTime endDate;
	get endDate()
	{
		if (!this._endDate) {
			this._endDate = this.tryToSetDateValue(this.getTagValue("t:End", null), this._calEvent.endDate);
			if (this.isAllDayEvent) this._endDate.isDate = true;
			if (this._endDate) this._calEvent.endDate = this._endDate.clone();
		}
		return this._calEvent.endDate;
	},

	set endDate(aValue)
	{
		this.logInfo("set enddate: title:"+this.title+", aValue:"+aValue);
		if (aValue.toString() != this.endDate.toString()) {
			this._newEndDate = aValue;
			this._calEvent.endDate = aValue;
		}
	},

	/**
	* The duration of the event.
	* equal to endDate - startDate
	*/
	//readonly attribute calIDuration duration;
	get duration()
	{
		if ((!this._duration) && (!this._newEndDate) && (!this._newStartDate)) {
			this._duration = this.getTagValue("t:Duration", null);
			if (this._duration) {
				return cal.createDuration(this._duration);
			}
		}
		return this._calEvent.duration;
	},

	// New external methods

	cloneToCalEvent: function cloneToCalEvent(aCalEvent)
	{
		this._calEvent = aCalEvent.clone();
	},

	//readonly attribute AUTF8String subject;
	get subject()
	{
		if (!this._subject) {
			this._subject = this.getTagValue("t:Subject", null);
		}
		return this._subject;
	},

	//readonly attribute AUTF8String sensitivity;
	get sensitivity()
	{
		if (!this._sensitivity) {
			this._sensitivity = this.getTagValue("t:Sensitivity", null);
		}
		return this._sensitivity;
	},

	//readonly attribute calIDateTime dateTimeReceived;
	get dateTimeReceived()
	{
		if (!this._dateTimeReceived) {
			this._dateTimeReceived = this.tryToSetDateValueUTC(this.getTagValue("t:DateTimeReceived", null), null);
		}
		return this._dateTimeReceived;
	},

	//readonly attribute calIDateTime dateTimeSent;
	get dateTimeSent()
	{
		if (!this._dateTimeSent) {
			this._dateTimeSent = this.tryToSetDateValueUTC(this.getTagValue("t:DateTimeSent", null), null);
		}
		return this._dateTimeSent;
	},

	//readonly attribute calIDateTime dateTimeCreated;
	get dateTimeCreated()
	{
		if (!this._dateTimeCreated) {
			this._dateTimeCreated = this.tryToSetDateValueUTC(this.getTagValue("t:DateTimeCreated", null), null);
		}
		return this._dateTimeCreated;
	},

	//readonly attribute calIDateTime reminderDueBy;
	get reminderDueBy()
	{
		if (!this._reminderDueBy) {
			this._reminderDueBy = this.tryToSetDateValueUTC(this.getTagValue("t:ReminderDueBy", null), null);
		}
		return this._reminderDueBy;
	},

	//readonly attribute calIDateTime reminderSignalTime;
	get reminderSignalTime()
	{
		if (!this._reminderSignalTime) {
			var tmpObject = this._exchangeData.XPath("/t:ExtendedProperty[t:ExtendedFieldURI/@PropertyId = '34144']");
			if (tmpObject.length > 0) {
				this._reminderSignalTime = this.tryToSetDateValueUTC(tmpObject.getTagValue("t:Value", null), null);
			}
		}
		return this._reminderSignalTime;
	},

	//readonly attribute boolean reminderIsSet;
	get reminderIsSet()
	{
		if (!this._reminderIsSet) {
			this._reminderIsSet = (this.getTagValue("t:ReminderIsSet", "false") == "true");
		}
		return this._reminderIsSet;
	},

	//readonly attribute long reminderMinutesBeforeStart;
	get reminderMinutesBeforeStart()
	{
		if (!this._reminderMinutesBeforeStart) {
			this._reminderMinutesBeforeStart = this.getTagValue("t:ReminderMinutesBeforeStart", 0);
		}
		return this._reminderMinutesBeforeStart;
	},

	//readonly attribute long size;
	get size()
	{
		if (!this._size) {
			this._size = this.getTagValue("t:Size", 0);
		}
		return this._size;
	},

	//readonly attribute calIDateTime originalStart;
	get originalStart()
	{
		if (!this._originalStart) {
			this._originalStart = this.tryToSetDateValueUTC(this.getTagValue("t:OriginalStart", null), null);
		}
		return this._originalStart;
	},

	//readonly attribute boolean isAllDayEvent;
	get isAllDayEvent()
	{
		if (!this._isAllDayEvent) {
			this._isAllDayEvent = (this.getTagValue("t:IsAllDayEvent", "false") == "true");
		}
		return this._isAllDayEvent;
	},

	//readonly attribute AUTF8String legacyFreeBusyStatus;
	get legacyFreeBusyStatus()
	{
		if (!this._legacyFreeBusyStatus) {
			this._legacyFreeBusyStatus = this.getTagValue("t:LegacyFreeBusyStatus", null);
		}
		return this._legacyFreeBusyStatus;
	},

	//readonly attribute AUTF8String location;
	get location()
	{
		if (!this._location) {
			this._location = this.getTagValue("t:Location", null);
		}
		return this._location;
	},

	// the exchange changeKey of this event
	//readonly attribute AUTF8String changeKey;
	get changeKey()
	{
		if (!this._changeKey) {
			this._changeKey = this.getAttributeByTag("t:ItemId", "ChangeKey", null);
		}
		return this._changeKey;
	},

	// the exchange UID of this event
	//readonly attribute AUTF8String uid;
	get uid()
	{
		if (!this._uid) {
			this._uid = this.getTagValue("t:UID", null);
		}
		return this._uid;
	},

	// the exchange calendarItemType of this event
	//readonly attribute AUTF8String calendarItemType;
	get calendarItemType()
	{
		if (!this._calendarItemType) {
			this._calendarItemType = this.getTagValue("t:CalendarItemType", null);
		}
		return this._calendarItemType;
	},

	// the exchange ItemClass of this event
	//readonly attribute AUTF8String itemClass;
	get itemClass()
	{
		if (!this._itemClass) {
			this._itemClass = this.getTagValue("t:ItemClass", null);
		}
		return this._itemClass;
	},

	// the exchange isCancelled of this event
	//readonly attribute boolean isCancelled;
	get isCancelled()
	{
		if (!this._isCancelled) {
			this._isCancelled = (this.getTagValue("t:IsCancelled", "false") == "true");
		}
		return this._isCancelled;
	},

	// the exchange isMeeting of this event
	//readonly attribute boolean isMeeting;
	get isMeeting()
	{
		if (!this._isMeeting) {
			this._isMeeting = (this.getTagValue("t:IsMeeting", "false") == "true");
		}
		return this._isMeeting;
	},

	//readonly attribute boolean isRecurring;
	get isRecurring()
	{
		if (!this._isRecurring) {
			this._isRecurring = (this.getTagValue("t:IsRecurring", "false") == "true");
		}
		return this._isRecurring;
	},

	//readonly attribute boolean meetingRequestWasSent;
	get meetingRequestWasSent()
	{
		if (!this._meetingRequestWasSent) {
			this._meetingRequestWasSent = (this.getTagValue("t:MeetingRequestWasSent", "false") == "true");
		}
		return this._meetingRequestWasSent;
	},

	//readonly attribute boolean isResponseRequested;
	get isResponseRequested()
	{
		if (!this._isResponseRequested) {
			this._isResponseRequested = (this.getTagValue("t:IsResponseRequested", "false") == "true");
		}
		return this._isResponseRequested;
	},

	//readonly attribute AUTF8String myResponseType;
	get myResponseType()
	{
		if (!this._myResponseType) {
			this._myResponseType = this.getTagValue("t:MyResponseType", null);
		}
		return this._myResponseType;
	},

	//readonly attribute AUTF8String timeZone;
	get timeZone()
	{
		if (!this._timeZone) {
			this._timeZone = this.getTagValue("t:TimeZone", null);
		}
		return this._timeZone;
	},

	//readonly attribute AUTF8String startTimeZoneName;
	get startTimeZoneName()
	{
		if (!this._startTimeZoneName) {
			this._startTimeZoneName = this.getAttributeByTag("t:StartTimeZone", "Name", null);
		}
		return this._startTimeZoneName;
	},

	//readonly attribute AUTF8String startTimeZoneId;
	get startTimeZoneId()
	{
		if (!this._startTimeZoneId) {
			this._startTimeZoneId = this.getAttributeByTag("t:StartTimeZone", "Id", null);
		}
		return this._startTimeZoneId;
	},

	//readonly attribute AUTF8String endTimeZoneName;
	get endTimeZoneName()
	{
		if (!this._endTimeZoneName) {
			this._endTimeZoneName = this.getAttributeByTag("t:EndTimeZone", "Name", null);
		}
		return this._endTimeZoneName;
	},

	//readonly attribute AUTF8String endTimeZoneId;
	get endTimeZoneId()
	{
		if (!this._endTimeZoneId) {
			this._endTimeZoneId = this.getAttributeByTag("t:EndTimeZone", "Id", null);
		}
		return this._endTimeZoneId;
	},

	//readonly attribute AUTF8String conferenceType;
	get conferenceType()
	{
		if (!this._conferenceType) {
			this._conferenceType = this.getTagValue("t:ConferenceType", null);
		}
		return this._conferenceType;
	},

	//readonly attribute boolean allowNewTimeProposal;
	get allowNewTimeProposal()
	{
		if (!this._allowNewTimeProposal) {
			this._allowNewTimeProposal = (this.getTagValue("t:AllowNewTimeProposal", "false") == "true");
		}
		return this._allowNewTimeProposal;
	},


	// the tagName of the object of this event
	//readonly attribute AUTF8String type;
	get type()
	{
		if (!this._type) {
			this._type = this._exchangeData.tagName;
		}
		return this._type;
	},

	// New external methods
	// the exchange ParentFolderId.Id of this event
	//readonly attribute AUTF8String parentId;
	get parentId()
	{
		if (!this._parentId) {
			this._parentId = this.getAttributeByTag("t:ParentFolderId", "Id", null);
		}
		return this._parentId;
	},

	// New external methods
	// the exchange ParentFolderId.ChangeKey of this event
	//readonly attribute AUTF8String parentChangeKey;
	get parentChangeKey()
	{
		if (!this._parentChangeKey) {
			this._parentChangeKey = this.getAttributeByTag("t:ParentFolderId", "ChangeKey", null);
		}
		return this._parentChangeKey;
	},

	// the exchange responseObjects of this event
	//readonly attribute jsval responseObjects;

	/*
	  <t:ResponseObjects>
	    <t:AcceptItem/>
	    <t:TentativelyAcceptItem/>
	    <t:DeclineItem/>
	    <t:ReplyToItem/>
	    <t:ReplyAllToItem/>
	    <t:ForwardItem/>
	    <t:CancelCalendarItem/>  // part of my own items.
	  </t:ResponseObjects>

	*/
	get responseObjects()
	{
		if (!this._responseObjects) {
			this._responseObjects = {};

			if (this._exchangeData) {
				var responseObjects = this._exchangeData.XPath("/t:ResponseObjects/*");
				for each (var prop in responseObjects) {
					this._responseObjects[prop.tagName] = true;
				}
				responseObjects = null;
			}
		}

		return this._responseObjects;
	},

	//attribute mivIxml2jxon exchangeData;
	get exchangeData()
	{
		return this._exchangeData;
	},

	set exchangeData(aValue)
	{
//		this.logInfo("exchangeData:"+aValue.toString());
		//dump("exchangeData:"+aValue.toString()+"\n\n");
		this.initialize();
		this._exchangeData = aValue;
	},

	convertToExchange: function _convertToExchange() 
	{
	},

	// Internal methods.
	readRecurrenceRule: function _readRecurrenceRule(aElement)
	{
		/*
		 * The Mozilla recurrence API is bothersome and dictated by libical.
		 *
		 * We need to obey and build an iCalendar string which we feed in
		 * to get the proper recurrence info.
		 */
		const dayMap = {
			'Monday'	: 'MO',
			'Tuesday'	: 'TU',
			'Wednesday'	: 'WE',
			'Thursday'	: 'TH',
			'Friday'	: 'FR',
			'Saturday'	: 'SA',
			'Sunday'	: 'SU',
			'Weekday'	: ['MO', 'TU', 'WE', 'TH', 'FR'],
			'WeekendDay'	: ['SA', 'SO'],
			'Day'		: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SO']
		};

		var comps = {};
	
		for each (var rec in aElement) {
			switch (rec.tagName) {
			case "RelativeYearlyRecurrence":
			case "AbsoluteYearlyRecurrence":
				comps['FREQ'] = "YEARLY";
				break;
			case "RelativeMonthlyRecurrence":
			case "AbsoluteMonthlyRecurrence":
				comps['FREQ'] = "MONTHLY";
				break;
			case "WeeklyRecurrence":
				comps['FREQ'] = "WEEKLY";
				break;
			case "DailyRecurrence":
				comps['FREQ'] = "DAILY";
				break;
			case "NoEndRecurrence":
			case "EndDateRecurrence":
			case "NumberedRecurrence":
				break;
			default:
				if (this.debug) this.logInfo("skipping " + rec.tagName);
				continue;
			}
	
			var weekdays = [];
			var week = [];
			var comps2 = rec.XPath("/*");
			for each (var comp in comps2) {
				switch (comp.tagName) {
				case 'DaysOfWeek':
					for each (let day in comp.value.split(" ")) {
						weekdays = weekdays.concat(dayMap[day]);
					}
					break;
				case 'DayOfWeekIndex':
					week = weekMap[comp.value];
					break;
				case 'Month':
					comps['BYMONTH'] = monthMap[comp.value];
					break;
				case 'DayOfMonth':
					comps['BYMONTHDAY'] = comp.value;
					break;
				case 'FirstDayOfWeek':
					comps['WKST'] = dayMap[comp.value];
					break;
				case 'Interval':
					comps['INTERVAL'] = comp.value;
					break;
				case 'StartDate':
					/* Dunno what to do with this for iCal; no place to set */
					this._recurrenceStartDate = cal.fromRFC3339(comp.value.substr(0,10)+"T00:00:00Z", this.globalFunctions.ecTZService().UTC);
					this._recurrenceStartDate.isDate = true;
					break;
				case 'EndDate':
					comps['UNTIL'] = comp.value.replace(/Z$/, '');
					break;
				case 'NumberOfOccurrences':
					comps['COUNT'] = comp.value;
					break;
				}
			}
			comps2 = null;

			let wdtemp = weekdays;
			weekdays = [];
			for each (let day in wdtemp) {
				weekdays.push(week + day);
			}
			if (weekdays.length > 0) {
				comps['BYDAY'] = weekdays.join(',');
			}
		}

		var compstrs = [];
		for (var k in comps) {
			compstrs.push(k + "=" + comps[k]);
		}
	
		if (compstrs.length == 0) {
			return null;
		}
	
		var recrule = cal.createRecurrenceRule();
	
		/* need to do this re-assign game so that the string gets parsed */
		var prop = recrule.icalProperty;
		prop.value = compstrs.join(';');
		recrule.icalProperty = prop;
		return recrule;
	},

	createAttendee: function _createAttendee(aElement, aType) 
	{
		if (!aElement) return null;

		const participationMap = {
			"Unknown"	: "NEEDS-ACTION",
			"NoResponseReceived" : "NEEDS-ACTION",
			"Tentative"	: "TENTATIVE",
			"Accept"	: "ACCEPTED",
			"Decline"	: "DECLINED",
			"Organizer"	: "ACCEPTED"
		};

		let mbox = aElement.getTag("t:Mailbox");
		let attendee = cal.createAttendee();

		if (!aType) {
			aType = "REQ-PARTICIPANT";
		}

		switch (mbox.getTagValue("t:RoutingType","unknown")) {
			case "SMTP" :
				attendee.id = 'mailto:' + mbox.getTagValue("t:EmailAddress","unknown");
				break;
			case "EX" :
				attendee.id = 'ldap:' + mbox.getTagValue("t:EmailAddress","unknown");
				break;
			default:
				this.logInfo("createAttendee: Unknown RoutingType:'"+mbox.getTagValue("t:RoutingType")+"'");
				attendee.id = 'mailto:' + mbox.getTagValue("t:EmailAddress","unknown");
				break;
		}
		attendee.commonName = mbox.getTagValue("t:Name");
		attendee.rsvp = "FALSE";
		attendee.userType = "INDIVIDUAL";
		attendee.role = aType;

		if (aElement.getTagValue("t:ResponseType", "") != "") {
			attendee.participationStatus = participationMap[aElement.getTagValue("t:ResponseType")];

		}

		return attendee;
	},

	tryToSetDateValueUTC: function _tryToSetDateValueUTC(ewsvalue, aDefault)
	{
		if ((ewsvalue) && (ewsvalue.toString().length)) {
			return cal.fromRFC3339(ewsvalue, this.globalFunctions.ecTZService().UTC);
		}

		return aDefault;
	},

	tryToSetDateValue: function _TryToSetDateValue(ewsvalue, aDefault)
	{
		if ((ewsvalue) && (ewsvalue.toString().length)) {
			return cal.fromRFC3339(ewsvalue, this.globalFunctions.ecTZService().UTC).getInTimezone(this.globalFunctions.ecDefaultTimeZone());
		}

		return aDefault;
	},

	getTag: function _getTag(aTagName)
	{
		if (this._exchangeData) {
			return this._exchangeData.getTag(aTagName);
		}

		return null;
	},

	getTags: function _getTags(aTagName)
	{
		if (this._exchangeData) {
			return this._exchangeData.getTags(aTagName);
		}

		return null;
	},

	getTagValue: function _getTagValue(aTagName, aDefaultValue)
	{
		if (this._exchangeData) {
			return this._exchangeData.getTagValue(aTagName, aDefaultValue);
		}

		return aDefaultValue;
	},

	getAttributeByTag: function _getAttributeByTag(aTagName, aAttribute, aDefaultValue)
	{
		//this.logInfo("getAttributeByTag 1: title:"+this.title+", aTagName:"+aTagName+", aAttribute:"+aAttribute);
		if (this._exchangeData) {
		//this.logInfo("getAttributeByTag 2: title:"+this.title+", aTagName:"+aTagName+", aAttribute:"+aAttribute);
			return this._exchangeData.getAttributeByTag(aTagName, aAttribute, aDefaultValue);
		}
		//this.logInfo("getAttributeByTag 3: title:"+this.title+", aTagName:"+aTagName+", aAttribute:"+aAttribute);

		return aDefaultValue;
	},

	initialize: function _initialize()
	{
		this._calEvent = null;
		this._calEvent = Cc["@mozilla.org/calendar/event;1"]
					.createInstance(Ci.calIEvent);
	},

	logInfo: function _logInfo(aMsg, aDebugLevel) 
	{
		return;
		if (!aDebugLevel) aDebugLevel = 1;

		var prefB = Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefBranch);

		this.debugLevel = this.globalFunctions.safeGetBoolPref(prefB, "extensions.1st-setup.core.debuglevel", 0, true);
		if (aDebugLevel <= this.debugLevel) {
			this.globalFunctions.LOG("mivExchangeEvent: "+aMsg);
		}
	},

}

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

