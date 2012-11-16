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

	this._exchangeData;
	this.updatedItem = {};
	this.newItem = {};

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
		return this._calEvent.clone();
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
		this._calEvent.generation = aValue;
	},

	// the time when this item was created
	//readonly attribute calIDateTime creationDate;
	get creationDate()
	{
		return this._calEvent.creationDate;
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
			if (this._id) this._calEvent.id = this._id;
		}
		return this._calEvent.id;
	},

	set id(aValue) // Should never be done by any external app.
	{
		this._newId = aValue;
		this._calEvent.id = aValue;
	},

	// event title
	//attribute AUTF8String title;
	get title()
	{
		if (!this._title) {
			this._title = this.getTagValue("t:Subject", null);
			if (this._title) this._calEvent.title = this._title;
		}
		return this._calEvent.title;
	},

	set title(aValue)
	{
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
		return this._calEvent.status;
	},

	set status(aValue)
	{
		this._calEvent.status = aValue;
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
		this._calEvent.deleteAlarm(aAlarm);
	},

	/**
	* Clear all alarms from the item
	*/
	//void clearAlarms();
	clearAlarms: function _clearAlarms()
	{
		this._calEvent.clearAlarms();
	},

	// The last time this alarm was fired and acknowledged by the user; coerced to UTC.
	//attribute calIDateTime alarmLastAck;
	get alarmLastAck()
	{
		return this._calEvent.alarmLastAck;
	},

	set alarmLastAck(aValue)
	{
		this._calEvent.alarmLastAck = aValue;
	},

	//
	// recurrence
	//
	//attribute calIRecurrenceInfo recurrenceInfo;
	get recurrenceInfo()
	{
		return this._calEvent.recurrenceInfo;
	},

	set recurrenceInfo(aValue)
	{
		this._calEvent.recurrenceInfo = aValue;
	},

	//readonly attribute calIDateTime recurrenceStartDate;
	get recurrenceStartDate()
	{
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
		return this._calEvent.propertyEnumerator;
	},

	//boolean hasProperty(in AString name);
	hasProperty: function _hasProperty(name)
	{
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
		switch (name) {
		case "DESCRIPTION": 
			if (!this._body) {
				this._body = this.getTagValue("t:Body", null);
				if (this._body) this._calEvent.setProperty(name, this._body);
			}
			break;
		case "LOCATION": 
			if (!this._location) {
				this._location = this.getTagValue("t:Location", null);
				if (this._location) this._calEvent.setProperty(name, this._location);
			}
			break;
		case "TRANSP": 
			if (!this._legacyFreeBusyStatus) {
				this._legacyFreeBusyStatus = this.getTagValue("t:LegacyFreeBusyStatus", null);
				switch (this._legacyFreeBusyStatus) {
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
			this._changedProperties[name] = value;
		}

		this._calEvent.setProperty(name, value);
	},

	// will not throw an error if you delete a property that doesn't exist
	//void deleteProperty(in AString name);
	deleteProperty: function _deleteProperty(name)
	{
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
			if (this._newMyResponseType[name]) {
				delete this._newMyResponseType[name];
			}
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
			if (this._organizer) this._calEvent.organizer = this._organizer;
		}

		return this._calEvent.organizer;
	},

	set organizer(aValue)
	{
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
		this._newAttendees.push(attendee.clone());
		this._calEvent.addAttendee(attendee);
	},

	//void removeAttendee(in calIAttendee attendee);
	removeAttendee: function _removeAttendee(attendee)
	{
		if (!this._removedAttendees) this._removedAttendees = new Array();
		this._removedAttendees.push(attendee.clone());
		this._calEvent.removeAttendee(attendee);
	},

	//void removeAllAttendees();
	removeAllAttendees: function _removeAllAttendees()
	{
		var allAttendees = this._calEvent.getAttendees({});
		for each(var attendee in allAttendees) {
			if (!this._removedAttendees) this._removedAttendees = new Array();
			this._removedAttendees.push(attendee.clone());
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
		this._newAttachments.push(attachment.clone());
		this._calEvent.addAttachment(attachment);
	},

	//void removeAttachment(in calIAttachment attachment);
	removeAttachment: function _removeAttachment(attachment)
	{
		if (!this._removedAttachments) this._removedAttachments = new Array();
		this._removedAttachments.push(attachment.clone());
		this._calEvent.removeAttachment(attachment);
	},

	//void removeAllAttachments();
	removeAllAttachments: function _removeAllAttachments()
	{
		var allAttachments = this._calEvent.getAttachments({});
		for each(var attachment in allAttachments) {
			if (!this._removedAttachments) this._removedAttachments = new Array();
			this._removedAttachments.push(attachment.clone());
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
		var currentCategories = this.getCategories;
		// We are going to check if something changed.
		var changed = false;
		if (aCount != currentCategories.length) changed = true;
		var counter = 0;
		while ((!changed) && (counter < aCount)) {
			var counter2 = 0;
			var found = false;
			while ((!found) && (counter2 < currentCategories.length)) {
				if (currentCategories[counter2] == aCategories[counter]) {
					found = true;
				}
				counter2++;
			}
			if (!found) changed = true;
			counter++;
		}

		if (changed) {
			this._newCategories = new Array();
			for (var index in aCategories) {
				this._newCategories.push(aCategories[index]);
			}
			this._calEvent.setCategories(aCount, aCategories);
		}
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
		return this._calEvent.recurrenceId;
	},

	set recurrenceId(aValue)
	{
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
			if (this._startDate) this._calEvent.startDate = this._startDate;
		}
		return this._calEvent.startDate;
	},

	set startDate(aValue)
	{
		if (aValue != this.startDate) {
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
			if (this._endDate) this._calEvent.endDate = this._endDate;
		}
		return this._calEvent.endDate;
	},

	set endDate(aValue)
	{
		if (aValue != this.endDate) {
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
		return this._calEvent.duration;
	},

	// New external methods
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
			this._uid = this.getAttributeByTag("t:UID", null);
		}
		return this._uid;
	},

	// the exchange calendarItemType of this event
	//readonly attribute AUTF8String calendarItemType;
	get calendarItemType()
	{
		if (!this._calendarItemType) {
			this._calendarItemType = this.getAttributeByTag("t:CalendarItemType", null);
		}
		return this._calendarItemType;
	},

	// the exchange ItemClass of this event
	//readonly attribute AUTF8String itemClass;
	get itemClass()
	{
		if (!this._itemClass) {
			this._itemClass = this.getAttributeByTag("t:ItemClass", null);
		}
		return this._itemClass;
	},

	// the exchange isCancelled of this event
	//readonly attribute boolean isCancelled;
	get isCancelled()
	{
		if (!this._isCancelled) {
			this._isCancelled = this.getAttributeByTag("t:IsCancelled", false);
		}
		return this._isCancelled;
	},

	// the exchange isMeeting of this event
	//readonly attribute boolean isMeeting;
	get isMeeting()
	{
		if (!this._isMeeting) {
			this._isMeeting = this.getAttributeByTag("t:IsMeeting", false);
		}
		return this._isMeeting;
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
		dump("exchangeData:"+aValue.toString()+"\n\n");
		this.initialize();
		this._exchangeData = aValue;
	},

	convertToExchange: function _convertToExchange() 
	{
	},

	// Internal methods.
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
		let attendee = createAttendee();

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
		if (this._exchangeData) {
			return this._exchangeData.getAttributeByTag(aTagName, aAttribute, aDefaultValue);
		}

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

