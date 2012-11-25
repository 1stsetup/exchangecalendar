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

Cu.import("resource://calendar/modules/calProviderUtils.jsm");

const participationMap = {
	"Unknown"	: "NEEDS-ACTION",
	"NoResponseReceived" : "NEEDS-ACTION",
	"Tentative"	: "TENTATIVE",
	"Accept"	: "ACCEPTED",
	"Decline"	: "DECLINED",
	"Organizer"	: "ACCEPTED"
};

const fieldPathMap = {
	'ActualWork'			: 'task',
	'AdjacentMeetingCount'		: 'calendar',
	'AdjacentMeetings'		: 'calendar',
	'AllowNewTimeProposal'		: 'calendar',
	'AppointmentReplyTime'		: 'calendar',
	'AppointmentSequenceNumber'	: 'calendar',
	'AppointmentState'		: 'calendar',
	'AssignedTime'			: 'task',
	'AssociatedCalendarItemId'	: 'meeting',
	'Attachments'			: 'item',
	'BillingInformation'		: 'task',
	'Body'				: 'item',
	'CalendarItemType'		: 'calendar',
	'Categories'			: 'item',
	'ChangeCount'			: 'task',
	'Companies'			: 'task',
	'CompleteDate'			: 'task',
	'ConferenceType'		: 'calendar',
	'ConflictingMeetingCount'	: 'calendar',
	'ConflictingMeetings'		: 'calendar',
	'Contacts'			: 'task',
	'ConversationId'		: 'item',
	'Culture'			: 'item',
	'DateTimeCreated'		: 'item',
	'DateTimeReceived'		: 'item',
	'DateTimeSent'			: 'item',
	'DateTimeStamp'			: 'calendar',
	'DelegationState'		: 'task',
	'Delegator'			: 'task',
	'DeletedOccurrences'		: 'calendar',
	'DisplayCc'			: 'item',
	'DisplayTo'			: 'item',
	'DueDate'			: 'task',
	'Duration'			: 'calendar',
	'EffectiveRights'		: 'item',
	'End'				: 'calendar',
	'EndTimeZone'			: 'calendar',
	'FirstOccurrence'		: 'calendar',
	'FolderClass'			: 'folder',
	'FolderId'			: 'folder',
	'HasAttachments'		: 'item',
	'HasBeenProcessed'		: 'meeting',
	'Importance'			: 'item',
	'InReplyTo'			: 'item',
	'IntendedFreeBusyStatus'	: 'meetingRequest',
	'InternetMessageHeaders'	: 'item',
	'IsAllDayEvent'			: 'calendar',
	'IsAssignmentEditable'		: 'task',
	'IsAssociated'			: 'item',
	'IsCancelled'			: 'calendar',
	'IsComplete'			: 'task',
	'IsDelegated'			: 'meeting',
	'IsDraft'			: 'item',
	'IsFromMe'			: 'item',
	'IsMeeting'			: 'calendar',
	'IsOnlineMeeting'		: 'calendar',
	'IsOutOfDate'			: 'meeting',
	'IsRecurring'			: 'calendar',
	'IsResend'			: 'item',
	'IsResponseRequested'		: 'calendar',
	'IsSubmitted'			: 'item',
	'IsTeamTask'			: 'task',
	'IsUnmodified'			: 'item',
	'ItemClass'			: 'item',
	'ItemId'			: 'item',
	'LastModifiedName'		: 'item',
	'LastModifiedTime'		: 'item',
	'LastOccurrence'		: 'calendar',
	'LegacyFreeBusyStatus'		: 'calendar',
	'Location'			: 'calendar',
	'MeetingRequestType'		: 'meetingRequest',
	'MeetingRequestWasSent'		: 'calendar',
	'MeetingTimeZone'		: 'calendar',
	'MeetingWorkspaceUrl'		: 'calendar',
	'Mileage'			: 'task',
	'MimeContent'			: 'item',
	'ModifiedOccurrences'		: 'calendar',
	'MyResponseType'		: 'calendar',
	'NetShowUrl'			: 'calendar',
	'OptionalAttendees'		: 'calendar',
	'Organizer'			: 'calendar',
	'OriginalStart'			: 'calendar',
	'Owner'				: 'task',
	'ParentFolderId'		: 'item',
	'PercentComplete'		: 'task',
	'Recurrence'			: 'calendar',
	'RecurrenceId'			: 'calendar',
	'ReminderDueBy'			: 'item',
	'ReminderIsSet'			: 'item',
	'ReminderMinutesBeforeStart'	: 'item',
	'RequiredAttendees'		: 'calendar',
	'Resources'			: 'calendar',
	'ResponseObjects'		: 'item',
	'ResponseType'			: 'meeting',
	'SearchParameters'		: 'folder',
	'Sensitivity'			: 'item',
	'Size'				: 'item',
	'Start'				: 'calendar',
	'StartDate'			: 'task',
	'StartTimeZone'			: 'calendar',
	'StatusDescription'		: 'task',
	'Status'			: 'task',
	'Subject'			: 'item',
	'TimeZone'			: 'calendar',
	'TotalWork'			: 'task',
	'UID'				: 'calendar',
	'UniqueBody'			: 'item',
	'WebClientEditFormQueryString'	: 'item',
	'WebClientReadFormQueryString'	: 'item',
	'When'				: 'calendar'
};

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

	this._newBody = undefined;
	this._newLocation = undefined;
	this._newLegacyFreeBusyStatus = undefined;
	this._newMyResponseType = undefined; 
	this._newIsInvitation = undefined;

	this._occurrences = {};
	this._exceptions = {};

	this._isMutable = true;

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

	this.logInfo("mivExchangeEvent: init");

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
			Ci.calIInternalShallowCopy,
			Ci.calIEvent,
			Ci.calIItemBase,
			Ci.nsIClassInfo,
			Ci.nsISupports]),

	// Attributes from nsIClassInfo

	classDescription: "Exchange calendar event.",
	classID: components.ID("{"+mivExchangeEventGUID+"}"),
	contractID: "@1st-setup.nl/exchange/calendarevent;1",
	flags: Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// methods from nsIClassInfo

	// void getInterfaces(out PRUint32 count, [array, size_is(count), retval] out nsIIDPtr array);
	getInterfaces: function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeEvent,
			Ci.calIInternalShallowCopy,
			Ci.calIEvent,
			Ci.calIItemBase,
			Ci.nsIClassInfo,
			Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},

	// External methods calIInternalShallowCopy
	/**
	* create a proxy for this item; the returned item
	* proxy will have parentItem set to this instance.
	*
	* @param aRecurrenceId RECURRENCE-ID of the proxy to be created 
	*/
	//calIItemBase createProxy(in calIDateTime aRecurrenceId);
	createProxy: function _createProxy(aRecurrenceId)
	{
		var newItem = this.clone();
		newItem.recurrenceId = aRecurrenceId;
		return newItem;
	},

	// used by recurrenceInfo when cloning proxy objects to
	// avoid an infinite loop.  aNewParent is optional, and is
	// used to set the parent of the new item; it should be null
	// if no new parent is passed in.
	//calIItemBase cloneShallow(in calIItemBase aNewParent);
	cloneShallow: function _cloneShallow(aNewParent)
	{
		var newItem = this.clone();
		if (aNewParent) {
			newItem.parentItem = aNewParent;
		}
		else {
			newItem.parentItem = null;
		}
		return newItem;
	},

	// External methods calIItemBase

	// returns true if this thing is able to be modified;
	// if the item is not mutable, attempts to modify
	// any data will throw CAL_ERROR_ITEM_IS_IMMUTABLE
	//readonly attribute boolean isMutable;
	get isMutable()
	{
		this.logInfo("get isMutable: title:"+this.title+", value:"+this._calEvent.isMutable);
		return this._isMutable;
	},

	// makes this item immutable
	//void makeImmutable();
	makeImmutable: function _makeImmutable()
	{
		this.logInfo("makeImmutable: title:"+this.title);
		this._isMutable = false;
	},

	// clone always returns a mutable event
	//calIItemBase clone();
	clone: function _clone()
	{
		this.logInfo("clone: title:"+this.title, -1);
		var result = Cc["@1st-setup.nl/exchange/calendarevent;1"]
				.createInstance(Ci.mivExchangeEvent);
		result.exchangeData = this._exchangeData;
		result.cloneToCalEvent(this._calEvent);

		if (this._newStartDate) result.startDate = this.startDate.clone();
		if (this._newEndDate) result.endDate = this.endDate.clone();

		// We are going to replay all changes to clone
		if (this._newBody === null) result.deleteProperty("DESCRIPTION");
		if (this._newLocation === null) result.deleteProperty("LOCATION");
		if (this._newLegacyFreeBusyStatus === null) result.deleteProperty("TRANSP");
		if (this._newMyResponseType === null) result.deleteProperty("STATUS"); 
		if (this._newIsInvitation === null) result.deleteProperty("X-MOZ-SEND-INVITATIONS");

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
		if (this._newRecurrenceInfo) result.recurrenceInfo = this.recurrenceInfo.clone();
		if (this._newBody) result.setProperty("DESCRIPTION", this.getProperty("DESCRIPTION"));
		if (this._newLocation) result.setProperty("LOCATION", this.getProperty("LOCATION"));
		if (this._newLegacyFreeBusyStatus) result.setProperty("TRANSP", this.getProperty("TRANSP"));
		if (this._newMyResponseType) result.setProperty("STATUS", this.getProperty("STATUS")); 
		if (this._newIsInvitation) result.setProperty("X-MOZ-SEND-INVITATIONS", this.getProperty("X-MOZ-SEND-INVITATIONS"));

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
					result.addAttendee(attendee.attendee);
					break;
				case "remove":
					result.removeAttendee(attendee.attendee);
					break;
				}
			}
		}

		if (this._changesAttachments) {
			for each(var attachment in this._changesAttachments) {
				switch (attachment.action) {
				case "add": 
					result.addAttachment(attachment.attachment);
					break;
				case "remove":
					result.removeAttachment(attachment.attachment);
					break;
				}
			}
		}
		if (this._changesCategories) {
			var categories = this.getCategories({});
			result.setCategories(categories.length, categories);
		}

		if (this._newParentItem) result.parentItem =this.parentItem;
		if (this._newAlarmLastAck) result.alarmLastAck = this.alarmLastAck;

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
		 this._hashId = [encodeURIComponent(this.id),
			this.recurrenceId ? this.recurrenceId.getInTimezone(this.globalFunctions.ecUTC()).icalString : "",
			this.calendar ? encodeURIComponent(this.calendar.id) : ""].join("#");

		this.logInfo("get hashId: title:"+this.title+", value:"+this._hashId);
		return this._hashId;
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
		this.logInfo("hasSameIds: title:"+this.title);
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
		this.logInfo("get creationDate: title:"+this.title+", value:"+this.dateTimeCreated);
		return this.dateTimeCreated;
	},

	// last time any attribute was modified on this item, in UTC
	//readonly attribute calIDateTime lastModifiedTime;
	get lastModifiedTime()
	{
		if (!this._lastModifiedTime) {
			this._lastModifiedTime = this.tryToSetDateValueUTC(this.getTagValue("t:LastModifiedTime", null), null);
		}
		this.logInfo("get lastModifiedTime: title:"+this.title+", value:"+this._lastModifiedTime);
		return this._lastModifiedTime;
	},

	// last time a "significant change" was made to this item
	//readonly attribute calIDateTime stampTime;
	get stampTime()
	{
		this.logInfo("get stampTime: title:"+this.title+", value:"+this._calEvent.stampTime);
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
		this.logInfo("get id: title:"+this.title+", id:"+this._calEvent.id);
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
			if (this._title) {
				this._calEvent.title = this._title;
			}
			else {
				this._calEvent.title = "";
			}
		}
		this.logInfo("get title: title:"+this._calEvent.title);
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
		this.logInfo("get priority: title:"+this.title+", value:"+this._calEvent.priority);
		return this._calEvent.priority;
	},

	set priority(aValue)
	{
		this.logInfo("set priority: title:"+this.title+", aValue:"+aValue);
		if (aValue != this.priority) {
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
			this._privacy = this.sensitivity;
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
			this.setProperty("CLASS", this._calEvent.privacy);
		}
		this.logInfo("get privacy: title:"+this.title+", value:"+this._calEvent.privacy);
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
		this.logInfo("get status: title:"+this.title+", value:"+this._calEvent.status+", this._status:"+this._status);
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

	// ical interop; writing this means parsing
	// the ical string into this event
	//attribute AUTF8String icalString;
	get icalString()
	{
		this.logInfo("get icalString: title:"+this.title+", value:"+this._calEvent.icalString);
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
		this.logInfo("get icalComponent: title:"+this.title+", value:"+this._calEvent.icalComponent);
		return this._calEvent.icalComponent;
	},

	set icalComponent(aValue)
	{
		this.logInfo("set icalComponent: title:"+this.title+", aValue:"+aValue);
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
		this.logInfo("getAlarms: title:"+this.title);
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
		this.logInfo("addAlarm: title:"+this.title);
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
		this.logInfo("deleteAlarm: title:"+this.title);
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
		this.logInfo("clearAlarms: title:"+this.title);
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
		if (!this._alarmLastAck) {
			this._alarmLastAck = this.reminderSignalTime;
			if (!this._alarmLastAck) {
				this._alarmLastAck = this.tryToSetDateValueUTC("2030-01-01T00:00:00Z", null);
			}

			switch (this.calendarItemType) {
			case "Single":
				this._alarmLastAck.addDuration(cal.createDuration('-PT1S'));
				break;
			}
			this._calEvent.alarmLastAck = this._alarmLastAck;
		}
		this.logInfo("get alarmLastAck: title:"+this.title+", alarmLastAck:"+this._calEvent.alarmLastAck, -1);
		return this._calEvent.alarmLastAck;
	},

	set alarmLastAck(aValue)
	{
		if (aValue.compare(this.alarmLastAck) != 0) {

			this.logInfo("set alarmLastAck: User snoozed alarm. Title:"+this.title+", aValue:"+aValue.toString()+", alarmTime:"+this.getAlarmTime(), -1);
			this._newAlarmLastAck = aValue.clone();
		}
		this._calEvent.alarmLastAck = aValue;
	},

	//
	// recurrence
	//
	//attribute calIRecurrenceInfo recurrenceInfo;
	get recurrenceInfo()
	{
		if ((!this._recurrenceInfo) && (this._exchangeData)) {
			var recurrence = this._exchangeData.XPath("/t:Recurrence/*");
			var recrule = this.readRecurrenceRule(recurrence);
			recurrence = null;
	
			if (recrule) {
				this.logInfo("get recurrenceInfo 1: title:"+this.title+", recrule:"+recrule);
				var recurrenceInfo = cal.createRecurrenceInfo(this);
				recurrenceInfo.setRecurrenceItems(1, [recrule]);
				this._recurrenceInfo = recurrenceInfo.clone();
				this._calEvent.recurrenceInfo = recurrenceInfo;
			}
			else {
				this._recurrenceInfo = null;
				this.logInfo("get recurrenceInfo 2: title:"+this.title+", recrule:null");
			}
		}

		// For debugging
		var recurrenceInfo = this._calEvent.recurrenceInfo;
		if (recurrenceInfo) {
			this.logInfo("get recurrenceInfo 3: title:"+this.title+", this._calEvent.recurrenceInfo:"+this._calEvent.recurrenceInfo);
		}
		else {
			this.logInfo("get recurrenceInfo 4: title:"+this.title+", this._calEvent.recurrenceInfo:null");
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
		this.logInfo("get recurrenceStartDate: title:"+this.title+", value:"+this._calEvent.recurrenceStartDate);
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
		this.logInfo("get propertyEnumerator: title:"+this.title);
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
		this.logInfo("hasProperty: title:"+this.title+", name:"+name);
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
		this.logInfo("get property 1: title:"+this.title+", name:"+name);
		switch (name) {
		case "DESCRIPTION": 
			if (!this._body) {
				this._body = this.getTagValue("t:Body", null);
				if (this._body) {
					this._calEvent.setProperty(name, this._body);
				}
				else {
					this._calEvent.setProperty(name, "");
				}
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
				if (this.isCancelled) {
					this._calEvent.setProperty(name, "CANCELLED");
				}
				else {
					switch (this.myResponseType) {
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
			}
			break;
		case "X-MOZ-SEND-INVITATIONS": 
			if ((this.responseObjects.AcceptItem) ||
			    (this.responseObjects.TentativelyAcceptItem) ||
			    (this.responseObjects.DeclineItem) ||
			    (this.type == "MeetingRequest")) {
				this._calEvent.setProperty(name, true);
			}
			else {
				this._calEvent.setProperty(name, false);
			}
			break;
		case "CLASS":
			this.privacy; // preload
			break;

		}

		this.logInfo("get property 2: title:"+this.title+", name:"+name+", value:"+this._calEvent.getProperty(name)+", _newLocation:"+this._newLocation);
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
		this.logInfo("set property: title:"+this.title+", name:"+name+", aValue:"+value+"\n", -1);
		switch (name) {
		case "DESCRIPTION": 
			if (value != this._newBody) {
				this._newBody = value;
			}
			break;
		case "LOCATION": 
			if (value != this._newLocation) {
				this._newLocation = value;
			}
			break;
		case "PRIORITY":
			this.priority = value;
			break;
		case "CLASS":
			this.privacy = value;
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
		case "X-MOZ-SEND-INVITATIONS": 
			if (value != this.getProperty(name)) {
				this._newIsInvitation = value;
			}
			break;
		case "X-MOZ-SNOOZE-TIME":
				this._newXMozSnoozeTime = value;
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
		this.logInfo("deleteProperty: title:"+this.title+", name:"+name);
		switch (name) {
		case "DESCRIPTION": 
			this._newBody = null;
			break;
		case "LOCATION": 
			this._newLocation = null;
			break;
		case "TRANSP": 
			this._newLegacyFreeBusyStatus = null;
			break;
		case "STATUS": 
			this._newMyResponseType = null;
			break;
		case "X-MOZ-SEND-INVITATIONS": 
			this._newIsInvitation = null;
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
		this.logInfo("isPropertyPromoted: title:"+this.title+", name:"+name);
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
		this.logInfo("getPropertyParameter: title:"+this.title+", aPropertyName:"+aPropertyName+", aParameterName:"+aParameterName+", value:"+this._calEvent.getPropertyParameter(aPropertyName, aParameterName));
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
		this.logInfo("hasPropertyParameter: title:"+this.title+", aPropertyName:"+aPropertyName+", aParameterName:"+aParameterName+", value:"+this._calEvent.hasPropertyParameter(aPropertyName, aParameterName));
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
		this.logInfo("setPropertyParameter: title:"+this.title+", aPropertyName:"+aPropertyName+", aParameterName:"+aParameterName+", aParameterValue:"+aParameterValue);
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
		this.logInfo("getParameterEnumerator: title:"+this.title+", aPropertyName:"+aPropertyName);
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

		this.logInfo("get organizer: title:"+this.title+", value:"+this._calEvent.organizer);
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
		this.logInfo("getAttendees: title:"+this.title);
		if ((!this._attendees) && (this._exchangeData)) {
			this._attendees = new Array();
			var tmpAttendee;

			this._calEvent.removeAllAttendees();

			var attendees = this._exchangeData.XPath("/t:RequiredAttendees/t:Attendee")
			for each (var at in attendees) {
				tmpAttendee = this.createAttendee(at, "REQ-PARTICIPANT");
				this._calEvent.addAttendee(tmpAttendee);
				this._attendees.push(tmpAttendee.clone());
			}
			attendees = null;
			attendees = this._exchangeData.XPath("/t:OptionalAttendees/t:Attendee")
			for each (var at in attendees) {
				tmpAttendee = this.createAttendee(at, "OPT-PARTICIPANT");
				this._calEvent.addAttendee(tmpAttendee);
				this._attendees.push(tmpAttendee.clone());
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
		this.logInfo("getAttendeeById: title:"+this.title+", id:"+id);
		if (!this._attendees) this.getAttendees({});

		return this._calEvent.getAttendeeById(id);
	},

	//void addAttendee(in calIAttendee attendee);
	addAttendee: function _addAttendee(attendee)
	{
		this.logInfo("addAttendee: title:"+this.title);
		if(!attendee) return;

		if (!this._attendees) this.getAttendees({});
		this._changesAttendees.push({ action: "add", attendee: attendee.clone()});
		this._calEvent.addAttendee(attendee);
	},

	//void removeAttendee(in calIAttendee attendee);
	removeAttendee: function _removeAttendee(attendee)
	{
		this.logInfo("removeAttendee: title:"+this.title);
		this._changesAttendees.push({ action: "remove", attendee: attendee.clone()});
		this._calEvent.removeAttendee(attendee);
	},

	//void removeAllAttendees();
	removeAllAttendees: function _removeAllAttendees()
	{
		this.logInfo("removeAllAttendees: title:"+this.title);
		var allAttendees = this.getAttendees({});
		for each(var attendee in allAttendees) {
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
		this.logInfo("getAttachments: title:"+this.title);
		if ((!this._attachments) && (this._exchangeData)) {
			this._attachments = new Array();
			if (this.hasAttachments) {
	//			if (this.debug) this.logInfo("Title:"+aItem.title+"Attachments:"+aExchangeItem.getTagValue("Attachments"));
				var fileAttachments = this._exchangeData.XPath("/t:Attachments/t:FileAttachment");
				for each(var fileAttachment in fileAttachments) {
	//				if (this.debug) this.logInfo(" -- Attachment: name="+fileAttachment.getTagValue("t:Name"));
					var newAttachment = cal.createAttachment();
					newAttachment.setParameter("X-AttachmentId",fileAttachment.getAttributeByTag("t:AttachmentId","Id")); 
					newAttachment.uri = cal.makeURL("http://somewhere/?id="+encodeURIComponent(fileAttachment.getAttributeByTag("t:AttachmentId","Id"))+"&name="+encodeURIComponent(fileAttachment.getTagValue("t:Name"))+"&size="+encodeURIComponent(fileAttachment.getTagValue("t:Size", ""))+"&calendarid="+encodeURIComponent(this.calendar.id));

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
		this.logInfo("addAttachment: title:"+this.title);
		if (!this._newAttachments) this._newAttachments = new Array();
		this._changesAttachments.push({ action: "add", attachment: attachment.clone()});
		this._calEvent.addAttachment(attachment);
	},

	//void removeAttachment(in calIAttachment attachment);
	removeAttachment: function _removeAttachment(attachment)
	{
		this.logInfo("removeAttachment: title:"+this.title);
		if (!this._removedAttachments) this._removedAttachments = new Array();
		this._changesAttachments.push({ action: "remove", attachment: attachment.clone()});
		this._calEvent.removeAttachment(attachment);
	},

	//void removeAllAttachments();
	removeAllAttachments: function _removeAllAttachments()
	{
		this.logInfo("removeAllAttachments: title:"+this.title);
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
		this.logInfo("getCategories: title:"+this.title+"\n");
		if ((!this._categories) && (this._exchangeData)) {
			this._categories = new Array();
			var strings = this._exchangeData.XPath("/t:Categories/t:String");
			for each (var cat in strings) {
				this._categories.push(cat.value);
			}
			strings = null;
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
		this.logInfo("set categories: title:"+this.title+", aCategories.length:"+aCategories.length+"\n");
		this.getCategories({});
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
		this.logInfo("getRelations: title:"+this.title);
		return this._calEvent.getRelations(count);
	},

	/**
	* Adds a relation to the item
	*/
	//void addRelation(in calIRelation relation);
	addRelation: function _addRelation(relation)
	{
		this.logInfo("addRelation: title:"+this.title);
		this._calEvent.addRelation(relation);
	},

	/**
	* Removes the relation for this item and the referred item
	*/
	//void removeRelation(in calIRelation relation);
	removeRelation: function _removeRelation(relation)
	{
		this.logInfo("removeRelation: title:"+this.title);
		this._calEvent.removeRelation(relation);
	},

	/**
	* Removes every relation for this item (in this items and also where it is referred
	*/
	//void removeAllRelations();
	removeAllRelations: function _removeAllRelations()
	{
		this.logInfo("removeAllRelations: title:"+this.title);
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
		// for Debugging
		var occurrences = [];
		switch (this.calendarItemType) {
		case "Single":
		case "Occurrence":
		case "Exception":
			if ((this.startDate.compare(aStartDate) >= 0) && (this.endDate.compare(aEndDate) < 0)) {
				this.logInfo("getOccurrencesBetween 0a: inserting myself into list.");
				occurrences.push(this);
			}
			break;
		case "RecurringMaster":
			for each(var exception in this._exceptions) {
				if ((exception.compare(aStartDate) >= 0) && (exception.compare(aEndDate) < 0)) {
					this.logInfo("getOccurrencesBetween 0d: inserting myself into list.");
					occurrences.push(exception);
				}
			}
			for each(var occurrence in this._occurrences) {
				if ((occurrence.compare(aStartDate) >= 0) && (occurrence.compare(aEndDate) < 0)) {
					this.logInfo("getOccurrencesBetween 0e: inserting myself into list.");
					occurrences.push(occurrence);
				}
			}
			break;
		default:
			if (this.recurrenceInfo) {
				occurrences = this.recurrenceInfo.getOccurrences(aStartDate, aEndDate, 0, aCount);
				this.logInfo("getOccurrencesBetween 0b: title:"+this.title+", this.calendarItemType:"+this.calendarItemType+", aStartDate:"+aStartDate+", aEndDate:"+aEndDate+", occurrences.length:"+occurrences.length);
				return this.recurrenceInfo.getOccurrences(aStartDate, aEndDate, 0, aCount);
			}
		}
		this.logInfo("getOccurrencesBetween 1: title:"+this.title+", aStartDate:"+aStartDate+", aEndDate:"+aEndDate+", occurrences.length:"+occurrences.length);

		aCount.value = occurrences.length;
		return occurrences;
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
		this.logInfo("get parentItem: title:"+this.title);
		if ((!this._parentItem) && (!this._newParentItem)) {
			this._parenItem = this;
			this._calEvent.parentItem = this;
		}
		return this._calEvent.parentItem;
	},

	set parentItem(aValue)
	{
		this.logInfo("set parentItem: title:"+this.title);
		if (aValue != this.parentItem) {
			this._newParentItem = aValue;
			this._calEvent.parentItem = aValue;
		}
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
		this.logInfo("get recurrenceId: title:"+this.title+", value:"+this._calEvent.recurrenceId);
		return this._calEvent.recurrenceId;
	},

	set recurrenceId(aValue)
	{
		if (aValue != this.recurrenceId) {
			this._re
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
		this.logInfo("get startdate 1: title:"+this.title);
		if (!this._startDate) {
			this._startDate = this.tryToSetDateValue(this.getTagValue("t:Start", null), this._calEvent.startDate);
			if (this.isAllDayEvent) this._startDate.isDate = true;
			if (this._startDate) {
				this._calEvent.startDate = this._startDate.clone();
			}
		}
		this.logInfo("get startdate 2: title:"+this.title+", startdate=="+this._calEvent.startDate);
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
		this.logInfo("get endDate: title:"+this.title+", endDate=="+this._calEvent.endDate, -1);
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
				this.logInfo("get duration: title:"+this.title+", value:"+cal.createDuration(this._duration));
				return cal.createDuration(this._duration);
			}
		}
		this.logInfo("get duration: title:"+this.title+", value:"+this._calEvent.duration);
		return this._calEvent.duration;
	},

	// New external methods

	cloneToCalEvent: function cloneToCalEvent(aCalEvent)
	{
		this._calEvent = aCalEvent.clone();
		this.logInfo("cloneToCalEvent: title:"+this.title+",\nthis._calEvent.hashId:"+this._calEvent.hashId+"\naCalEvent.hashId:"+aCalEvent.hashId);
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
		if ((!this._reminderSignalTime) && (this._exchangeData)) {
			var tmpObject = this._exchangeData.XPath("/t:ExtendedProperty[t:ExtendedFieldURI/@PropertyId = '34144']");
			if (tmpObject.length > 0) {
				this._reminderSignalTime = this.tryToSetDateValueUTC(tmpObject[0].getTagValue("t:Value", null), null);
				this.logInfo("Setting X-MOZ-SNOOZE-TIME by data in exchangedata", -1);
				switch (this.calendarItemType) {
				case "Single":
					this.setProperty("X-MOZ-SNOOZE-TIME", this._reminderSignalTime.icalString);
					this._xMozSnoozeTime = this._reminderSignalTime.icalString;
					break;
				}
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
			this._location = this.getTagValue("t:Location", "");
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
		this.logInfo("get calendarItemType: title:"+this.title+", this._calendarItemType:"+this._calendarItemType);
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

	// the exchange hasAttachments of this event
	//readonly attribute boolean hasAttachments;
	get hasAttachments()
	{
		if (!this._hasAttachments) {
			this._hasAttachments = (this.getTagValue("t:HasAttachments", "false") == "true");
		}
		return this._hasAttachments;
	},

	//readonly attribute boolean isRecurring;
	get isRecurring()
	{
		if (!this._isRecurring) {
			this._isRecurring = (this.getTagValue("t:IsRecurring", "false") == "true");
		}
		return this._isRecurring;
	},

	//readonly attribute boolean isInvitation;
	get isInvitation()
	{
		if ((this.responseObjects.AcceptItem) ||
		    (this.responseObjects.TentativelyAcceptItem) ||
		    (this.responseObjects.DeclineItem) ||
		    (this.type == "MeetingRequest")) {
			return true;
		}
		else {
			return false;
		}
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
		if ((!this._type) && (this._exchangeData)) {
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
		if ((!this._responseObjects) && (this._exchangeData)) {
			this._responseObjects = {};

			var responseObjects = this._exchangeData.XPath("/t:ResponseObjects/*");
			for each (var prop in responseObjects) {
				this._responseObjects[prop.tagName] = true;
			}
			responseObjects = null;
		}

		return this._responseObjects;
	},

	//void getExceptions(out uint32_t count,
	//	      [array,size_is(count),retval] out mivExchangeEvent aException);
	getExceptions: function _getExceptions(aCount)
	{
		var result = [];
		for each(var exception in this._exceptions) {
			result.push(exception);
		}
		aCount.value = result.length;
		return result;
	},

	//void addException(in mivExchangeEvent aItem);
	addException: function _addException(aItem)
	{
		if ((aItem.calendarItemType == "Exception") && (this.calendarItemType == "RecurringMaster") && (aItem.isMutable)) {
			aItem.parentItem = this;
			this._exceptions[aItem.id] = aItem.clone();
			this.recurrenceInfo.modifyException(aItem, true);
		}
	},

	//void removeException(in mivExchangeEvent aItem);
	removeException: function _removeException(aItem)
	{
		if ((aItem.calendarItemType == "Exception") && (this.calendarItemType == "RecurringMaster")) {
			if (this._exceptions[aItem.id]) {
				this.recurrenceInfo.removeExceptionFor(aItem.recurrenceId);
				this._exceptions[aItem.id] = null;
				delete this._exceptions[aItem.id];
			}
		}
	},

	//void getOccurrences(out uint32_t count, [array,size_is(count),retval] out mivExchangeEvent aOccurrence);
	getOccurrences: function _getOccurrences(aCount)
	{
		var result = [];
		for each(var occurrence in this._occurrences) {
			result.push(occurrence);
		}
		aCount.value = result.length;
		return result;
	},

	//void addOccurrence(in mivExchangeEvent aItem);
	addOccurrence: function _addOccurrence(aItem)
	{
		if ((aItem.calendarItemType == "Occurrence") && (this.calendarItemType == "RecurringMaster") && (aItem.isMutable)) {
			aItem.parentItem = this;
			this._occurrences[aItem.id] = aItem.clone();
		}
	},

	//void removeOccurrence(in mivExchangeEvent aItem);
	removeOccurrence: function _removeOccurrence(aItem)
	{
		if ((aItem.calendarItemType == "Occurrence") && (this.calendarItemType == "RecurringMaster")) {
			if (this._occurrences[aItem.id]) {
				this._occurrences[aItem.id] = null;
				delete this._occurrences[aItem.id];
			}
		}
	},

	//attribute mivIxml2jxon exchangeData;
	get exchangeData()
	{
		return this._exchangeData;
	},

	set exchangeData(aValue)
	{
		//this.logInfo("exchangeData:"+aValue.toString());
		dump("exchangeData:"+aValue.toString()+"\n\n");
		this.initialize();
		this._exchangeData = aValue;
	},

	convertToExchange: function _convertToExchange() 
	{
	},

	//attribute long occurrenceIndex;
	get occurrenceIndex()
	{
		if (this._occurrenceIndex) {
			return this._occurrenceIndex;
		}

		return -1;
	},

	set occurrenceIndex(aValue)
	{
		if (aValue != this._occurrenceIndex) {
			this._occurrenceIndex = aValue;
		}
	},

	addSetItemField: function _addSetItemField(parentItem, aField, aValue, aAttributes)
	{
		var setItemField = parentItem.addChildTag("SetItemField", "t", null);
		if (aField != "ExtendedProperty") {
			var fieldURI = setItemField.addChildTag("FieldURI", "t", null);
			fieldURI.setAttribute("FieldURI", fieldPathMap[aField]+":"+aField);

			try {
				if (aValue.QueryInterface(Ci.mivIxml2jxon)) {
					var fieldValue = setItemField.addChildTag("CalendarItem", "t", null).addChildTag(aField, "t", null).addChildTagObject(aValue);
				}
				else {
					var fieldValue = setItemField.addChildTag("CalendarItem", "t", null).addChildTag(aField, "t", aValue);
				}
			}
			catch(err) {
				var fieldValue = setItemField.addChildTag("CalendarItem", "t", null).addChildTag(aField, "t", aValue);
			}

			if (aAttributes) {
				for (var attribute in aAttributes) {
					fieldValue.setAttribute(attribute, aAttributes[attribute]);
				}
			}
		}
		else {
			setItemField.addChildTagObject(aValue);
		}
	},

	getAlarmTime: function _getAlarmTime()
	{
		var alarms = this.getAlarms({});		
		var alarm = alarms[0];		
		if (!alarm) {
			return null;
		}

		switch (alarm.related) {
		case Ci.calIAlarm.ALARM_RELATED_ABSOLUTE:
			var alarmTime = alarm.alarmDate;
			break;
		case Ci.calIAlarm.ALARM_RELATED_START:
			var alarmTime = this.startDate.clone();
			alarmTime.addDuration(alarm.offset);
			break;
		case Ci.calIAlarm.ALARM_RELATED_END:
			var alarmTime = this.endDate.clone();
			alarmTime.addDuration(alarm.offset);
			break;
		}

		alarmTime = alarmTime.getInTimezone(cal.UTC());

		return alarmTime;
	},

	get updateXML()
	{
		var updates = this.globalFunctions.xmlToJxon('<t:Updates xmlns:m="'+nsMessagesStr+'" xmlns:t="'+nsTypesStr+'"/>');

		if (this.isInvitation) {
			// Only can accept/decline/tentative
			// Or change alarm.
			
		}
		else {
			if (this._newTitle) {
				this.addSetItemField(updates, "Subject", this._newTitle);
			}
			if (this._newPrivacy) {
				this.addSetItemField(updates, "Sensitivity", this._newPrivacy);
			}
			if (this._newBody) {
				this.addSetItemField(updates, "Body", this._newBody, { BodyType: "Text" });
			}
			// Categories
			if (this._changesCategories) {
				var categoriesXML = Cc["@1st-setup.nl/conversion/xml2jxon;1"]
							.createInstance(Ci.mivIxml2jxon);
				var categories = this.getCategories({});
				var first = true;
				for each(var category in categories) {
					if (first) {
						first = false;
						categoriesXML.processXMLString("<t:String>"+category+"</t:String>", 0, null);
					}
					else {
						categoriesXML.addSibblingTag("String", "t", category);
					}
				}
				if (categories.length > 0) {
					this.addSetItemField(updates, "Categories", categoriesXML);
				}
			}

			if (this._newPriority) {
				this.addSetItemField(updates, "Importance", this._newPriority);
			}


			if (this._newStartDate) {
				var tmpStart = this._newStartDate.clone();
				if (this._newStartDate.isDate) {
					tmpStart.isDate = false;

					// We make a non-UTC datetime value for this.globalFunctions.
					// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
					var exchStart = cal.toRFC3339(tmpStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
				}
				else {
					// We set in bias advanced to UCT datetime values for this.globalFunctions.
					var exchStart = cal.toRFC3339(tmpStart);
				}
				this.addSetItemField(updates, "Start", exchStart);
			}

			if (this._newEndDate) {
				var tmpEnd = this._newEndDate.clone();

				if (this._newEndDate.isDate) {
					tmpEnd.isDate = false;
					var tmpDuration = cal.createDuration();
					tmpDuration.minutes = -1;
					tmpEnd.addDuration(tmpDuration);

					// We make a non-UTC datetime value for this.globalFunctions.
					// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
					var exchEnd = cal.toRFC3339(tmpEnd).substr(0, 19); //cal.toRFC3339(tmpEnd).length-6);
				}
				else {
					// We set in bias advanced to UCT datetime values for this.globalFunctions.
					var exchEnd = cal.toRFC3339(tmpEnd);
				}
				this.addSetItemField(updates, "End", exchEnd);
			}

			if (this._newStartDate) {
				if (this._newStartDate.isDate) {
					this.addSetItemField(updates, "IsAllDayEvent", "true");
				}
				else {
					this.addSetItemField(updates, "IsAllDayEvent", "false");
				}
	
			}

			if (this._newLegacyFreeBusyStatus) {
				this.addSetItemField(updates, "LegacyFreeBusyStatus", this._newLegacyFreeBusyStatus);
			}

			if (this._newLocation) {
				this.addSetItemField(updates, "Location", this._newLocation);
			}

			// Attendees
			if (this._changesAttendees.length > 0) {
				var reqAttendeeCount = 0;
				var optAttendeeCount = 0;
				var attendees = this.getAttendees({});
				if (attendees.length > 0) {

					const attendeeStatus = {
						"NEEDS-ACTION"	: "Unknown",
						"TENTATIVE"	: "Tentative",
						"ACCEPTED"	: "Accept",
						"DECLINED"	: "Decline",
						null		: "Unknown"
					};

					for each(var attendee in attendees) {
						switch (attendee.role) {
						case "REQ-PARTICIPANT":
							if (reqAttendeeCount == 0) {
								var reqAttendees = this.globalFunctions.xmlToJxon('<t:Attendee xmlns:m="'+nsMessagesStr+'" xmlns:t="'+nsTypesStr+'"/>');
								var ae = reqAttendees;
							}
							else {
								var ae = reqAttendees.addSibblingTag("Attendee", "t", null);
							}
							reqAttendeeCount++;
							break;
						case "OPT-PARTICIPANT":
							if (optAttendeeCount == 0) {
								var optAttendees = this.globalFunctions.xmlToJxon('<t:Attendee xmlns:m="'+nsMessagesStr+'" xmlns:t="'+nsTypesStr+'"/>');
								var ae = optAttendees;
							}
							else {
								var ae = optAttendees.addSibblingTag("Attendee", "t", null);
							}
							optAttendeeCount++;
							break;
						}
						var mailbox = ae.addChildTag("Mailbox", "t", null);
						mailbox.addChildTag("Name", "t", attendee.commonName);

						var tmpEmailAddress = attendee.id.replace(/^mailto:/, '');
						if (tmpEmailAddress.indexOf("@") > 0) {
							mailbox.addChildTag("EmailAddress", "t", tmpEmailAddress);
						}
						else {
							mailbox.addChildTag("EmailAddress", "t", "unknown@somewhere.com");
						}
						ae.addChildTag("ResponseType", "t", attendeeStatus[attendee.participationStatus]);

					}
					if (reqAttendeeCount > 0) this.addSetItemField(updates, "RequiredAttendees", reqAttendees);
					if (optAttendeeCount > 0) this.addSetItemField(updates, "OptionalAttendees", optAttendees);
				}
			}


			// Recurrence rule.

			var reminderIsSetChanged = undefined;
			// Alarm
			if (this._newAlarm !== undefined) {
				// Alarm was changed.
				if (this._newAlarm === null) {
					// Alarm was removed.
					//this.addSetItemField(updates, "ReminderIsSet", "false");
					reminderIsSetChanged = "false";
				}
				else {
					// New alarm setting.
					var alarms = this.getAlarms({});
					if (alarms.length > 0) {
						//this.addSetItemField(updates, "ReminderIsSet", "true");
						reminderIsSetChanged = "true";
						// Calculate the alarm.

						var alarm = alarms[0];

						// Exchange alarm is always an offset to the start.
						switch (alarm.related) {
						case Ci.calIAlarm.ALARM_RELATED_ABSOLUTE:
							this.logInfo("ALARM_RELATED_ABSOLUTE we are going to calculate a offset from the start.");
							var newAlarmTime = alarm.alarmDate.clone();

							// Calculate offset from start of item.
							var offset = newAlarmTime.subtractDate(this.startDate);
							break;
						case Ci.calIAlarm.ALARM_RELATED_START:
							this.logInfo("ALARM_RELATED_START this is easy exchange does the same.");
							var newAlarmTime = this.startDate.clone();
							var offset = alarm.offset.clone();
							break;
						case Ci.calIAlarm.ALARM_RELATED_END:
							this.logInfo("ALARM_RELATED_END we are going to calculate the offset from the start.");
							var newAlarmTime = this.endDate.clone();
							newAlarmTime.addDuration(alarm.offset);

							var offset = newAlarmTime.subtractDate(alarmEvent.startDate);
							break;
						}

						this.addSetItemField(updates, "ReminderDueBy", cal.toRFC3339(this.startDate.getInTimezone(cal.UTC())));
						
						if (offset.inSeconds != 0) {
							this.addSetItemField(updates, "ReminderMinutesBeforeStart", String((offset.inSeconds / 60) * -1));
						}
						else {
							this.addSetItemField(updates, "ReminderMinutesBeforeStart", "0");
						}

					}
					else {
						// This should never happen.
						dump("mivExchangeEvent: updateXML: Weird error. We have a history of an alarm added but no alarms exist. This should never happen. please report to info@1st-setup.nl\n");
					}
				}

			}

			// Alarm snooze
			if (this._xMozSnoozeTime != this._newXMozSnoozeTime) {
				if (this._newAlarmLastAck) {
					if (this._newAlarmLastAck.compare(this.getAlarmTime()) > 0) {
						dump("------------ user set snooze for a certain time.\n");
						var newAlarmXML = this.globalFunctions.xmlToJxon('<t:ExtendedFieldURI xmlns:m="'+nsMessagesStr+'" xmlns:t="'+nsTypesStr+'"/>');
						newAlarmXML.setAttribute("DistinguishedPropertySetId", "Common");

						const MAPI_PidLidReminderSignalTime = "34144";

						newAlarmXML.setAttribute("PropertyId", MAPI_PidLidReminderSignalTime);
						newAlarmXML.setAttribute("PropertyType", "SystemTime");

						var newSnoozeTime = cal.createDateTime(this._newXMozSnoozeTime);
						newSnoozeTime = newSnoozeTime.getInTimezone(cal.UTC());
						newAlarmXML.addSibblingTag("Value", "t", cal.toRFC3339(newSnoozeTime));

						this.addSetItemField(updates, "ExtendedProperty", newAlarmXML);
					}
					else {
						dump("------------ user snoozed (1) but how?????????????.\n");
					}
				}
				else {
					dump("------------ user snoozed (2) but how?????????????.\n");
				}
			}
			else {
				if (this._newAlarmLastAck) {
					dump("---------- xmozsnoozetime DID not change. X-MOZ-SNOOZE-TIME:"+this.getProperty("X-MOZ-SNOOZE-TIME")+" And alarmLastAck was changed. User removed alarm.\n");
					reminderIsSetChanged = "false";
				}
				else {
					dump("---------- xmozsnoozetime DID not change. X-MOZ-SNOOZE-TIME:"+this.getProperty("X-MOZ-SNOOZE-TIME")+" but alarmLastAck was not changed. What did user do????.\n");
				}
			}

			if (reminderIsSetChanged) {
				this.addSetItemField(updates, "ReminderIsSet", reminderIsSetChanged);
			}
		}

		dump("updates:"+updates.toString()+"\n");
		return updates;
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

		const monthMap = {
			'January'	: 1,
			'February'	: 2,
			'March'		: 3,
			'April'		: 4,
			'May'		: 5,
			'June'		: 6,
			'July'		: 7,
			'August'	: 8,
			'September'	: 9,
			'October'	: 10,
			'November'	: 11,
			'December'	: 12
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
			//this.globalFunctions.LOG("mivExchangeEvent: "+aMsg);
		//return;

		if (!aDebugLevel) aDebugLevel = 1;

		var prefB = Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefBranch);

		this.debugLevel = this.globalFunctions.safeGetBoolPref(prefB, "extensions.1st-setup.core.debuglevel", 0, true);
		this.debugLevel = 0;
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

