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

function mivExchangeEvent() {

	this._calEvent = Cc["@mozilla.org/calendar/event;1"]
				.createInstance(Ci.calIEvent);

	this._exchangeCalendarItem;

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
		return this._calEvent.lastModifiedTime;
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
		return this._calEvent.id;
	},

	set id(aValue)
	{
		this._calEvent.id = aValue;
	},

	// event title
	//attribute AUTF8String title;
	get title()
	{
		return this._calEvent.title;
	},

	set title(aValue)
	{
		this._calEvent.title = aValue;
	},

	// event priority
	//attribute short priority;
	get priority()
	{
		return this._calEvent.priority;
	},

	set priority(aValue)
	{
		this._calEvent.priority = aValue;
	},

	//attribute AUTF8String privacy;
	get privacy()
	{
		return this._calEvent.privacy;
	},

	set privacy(aValue)
	{
		this._calEvent.privacy = aValue;
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
		this._calEvent.setProperty(name, value);
	},

	// will not throw an error if you delete a property that doesn't exist
	//void deleteProperty(in AString name);
	deleteProperty: function _deleteProperty(name)
	{
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
		return this._calEvent.organizer;
	},

	set organizer(aValue)
	{
		this._calEvent.organizer = aValue;
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
		return this._calEvent.getAttendeeById(id);
	},

	//void addAttendee(in calIAttendee attendee);
	addAttendee: function _addAttendee(attendee)
	{
		this._calEvent.addAttendee(attendee);
	},

	//void removeAttendee(in calIAttendee attendee);
	removeAttendee: function _removeAttendee(attendee)
	{
		this._calEvent.removeAttendee(attendee);
	},

	//void removeAllAttendees();
	removeAllAttendees: function _removeAllAttendees()
	{
		this._calEvent.removeAllAttendees();
	},

	//
	// Attachments
	//
	//void getAttachments(out PRUint32 count,
	//	      [array,size_is(count),retval] out calIAttachment attachments);
	getAttachments: function _getAttachments(count)
	{
		return this._calEvent.getAttachments(count);
	},

	//void addAttachment(in calIAttachment attachment);
	addAttachment: function _addAttachment(attachment)
	{
		this._calEvent.addAttachment(attachment);
	},

	//void removeAttachment(in calIAttachment attachment);
	removeAttachment: function _removeAttachment(attachment)
	{
		this._calEvent.removeAttachment(attachment);
	},

	//void removeAllAttachments();
	removeAllAttachments: function _removeAllAttachments()
	{
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
		return this._calEvent.getCategories(aCount);
	},

	/**
	* Sets the array of categories this item belongs to.
	*/
	//void setCategories(in PRUint32 aCount,
	//	     [array, size_is(aCount)] in wstring aCategories);
	setCategories: function _setCategories(aCount, aCategories)
	{
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
		return this._calEvent.startDate;
	},

	set startDate(aValue)
	{
		this._calEvent.startDate = aValue;
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
		return this._calEvent.endDate;
	},

	set endDate(aValue)
	{
		this._calEvent.endDate = aValue;
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
	//void init(in mivIxml2jxon aExchangeCalendarItem); 
	convertFromExchange: function _convertFromExchange(aExchangeCalendarItem) 
	{
		this.initialize();
		this._exchangeCalendarItem = aExchangeCalendarItem;
	},

	convertToExchange: function _convertToExchange() 
	{
	},

	// Internal methods.
	getTags: function _getTags(aTagName)
	{
		if (this._exchangeCalendarItem) {
			return this._exchangeCalendarItem.getTags(aTagName);
		}

		return null;
	},

	getTagValue: function _getTagValue(aTagName, aDefaultValue)
	{
		if (this._exchangeCalendarItem) {
			return this._exchangeCalendarItem.getTagValue(aTagName, aDefaultValue);
		}

		return aDefaultValue;
	},

	getAttributeByTag: function _getAttributeByTag(aTagName, aAttribute, aDefaultValue)
	{
		if (this._exchangeCalendarItem) {
			return this._exchangeCalendarItem.getAttributeByTag(aTagName, aAttribute, aDefaultValue);
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
		var prefB = Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefBranch);

		this.debug = this.globalFunctions.safeGetBoolPref(prefB, "extensions.1st-setup.authentication.debug", false, true);
		if (this.debug) {
			this.globalFunctions.LOG("mivExchangeAuthPrompt2: "+aMsg);
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

