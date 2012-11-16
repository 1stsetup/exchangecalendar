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
 * Contributor: Krzysztof Nowicki (krissn@op.pl)
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

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var Cr = Components.results;
var components = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://calendar/modules/calAlarmUtils.jsm");
Cu.import("resource://calendar/modules/calProviderUtils.jsm");
Cu.import("resource://calendar/modules/calAuthUtils.jsm");

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/erFindFolder.js");
Cu.import("resource://exchangecalendar/erGetFolder.js");
Cu.import("resource://exchangecalendar/erFindCalendarItems.js");
Cu.import("resource://exchangecalendar/erFindTaskItems.js");
Cu.import("resource://exchangecalendar/erGetItems.js");
Cu.import("resource://exchangecalendar/erGetMeetingRequestByUID.js");
Cu.import("resource://exchangecalendar/erGetOccurrenceIndex.js");
Cu.import("resource://exchangecalendar/erDeleteItem.js");
Cu.import("resource://exchangecalendar/erFindMasterOccurrences.js");
Cu.import("resource://exchangecalendar/erSyncFolderItems.js");
Cu.import("resource://exchangecalendar/erFindOccurrences.js");
Cu.import("resource://exchangecalendar/erUpdateItem.js");
Cu.import("resource://exchangecalendar/erGetUserAvailability.js");
Cu.import("resource://exchangecalendar/erCreateItem.js");
Cu.import("resource://exchangecalendar/erSendMeetingRespons.js");
Cu.import("resource://exchangecalendar/erSyncInbox.js");
Cu.import("resource://exchangecalendar/erGetTimeZones.js");
Cu.import("resource://exchangecalendar/erCreateAttachment.js");
Cu.import("resource://exchangecalendar/erDeleteAttachment.js");
//Cu.import("resource://interfaces/xml.js");

//Cu.import("resource://interfaces/exchangeEvent/mivExchangeEvent.js");

var globalStart = new Date().getTime();
var global_ews_2010_timezonedefinitions;
var globalTimeZoneDefinitions = {};

var tmpActivityManager = Cc["@mozilla.org/activity-manager;1"];

if (tmpActivityManager) {
	Cc["@1st-setup.nl/global/functions;1"].getService(Ci.mivFunctions).LOG("-- ActivityManger available. Enabeling it.");
	const nsIAP = Ci.nsIActivityProcess;  
	const nsIAE = Ci.nsIActivityEvent;  
	const nsIAM = Ci.nsIActivityManager;

	var gActivityManager = Cc["@mozilla.org/activity-manager;1"].getService(nsIAM);  
}
else {
	Cc["@1st-setup.nl/global/functions;1"].getService(Ci.mivFunctions).LOG("-- ActivityManger not available.");
}

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

const dayRevMap = {
	'MO' : 'Monday',
	'TU' : 'Tuesday',
	'WE' : 'Wednesday',
	'TH' : 'Thursday',
	'FR' : 'Friday',
	'SA' : 'Saturday',
	'SU' : 'Sunday'
};

const dayIdxMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

const weekRevMap = {
	'1' : 'First',
	'2' : 'Second',
	'3' : 'Third',
	'4' : 'Fourth',
	'-1': 'Last'
};

const monthIdxMap = ['January', 'February', 'March', 'April', 'May', 'June',
		     'July', 'August', 'September', 'October', 'November', 'December'];

const participationMap = {
	"Unknown"	: "NEEDS-ACTION",
	"NoResponseReceived" : "NEEDS-ACTION",
	"Tentative"	: "TENTATIVE",
	"Accept"	: "ACCEPTED",
	"Decline"	: "DECLINED",
	"Organizer"	: "ACCEPTED"
};

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

const weekMap = {
	'First'		: 1,
	'Second'	: 2,
	'Third'		: 3,
	'Fourth'	: 4,
	'Last'		: -1
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

const MAPI_PidLidTaskAccepted = "33032";
const MAPI_PidLidTaskLastUpdate = "33045";
const MAPI_PidLidTaskHistory = "33050";
const MAPI_PidLidTaskOwnership = "33065";
const MAPI_PidLidTaskMode = "34072";
const MAPI_PidLidTaskGlobalId = "34073";
const MAPI_PidLidTaskAcceptanceState = "33066";
const MAPI_PidLidReminderSignalTime = "34144";
const MAPI_PidLidReminderSet = "34051";

//
// calExchangeCalendar
//

var EXPORTED_SYMBOLS = ["calExchangeCalendar", "fixPrefBug", "removeOldPrefs"];

function urlToPath (aPath) {

    if (!aPath || !/^file:/.test(aPath))
      return ;
    var rv;
   var ph = Cc["@mozilla.org/network/protocol;1?name=file"]
        .createInstance(Ci.nsIFileProtocolHandler);
    rv = ph.getFileFromURLSpec(aPath).path;
    return rv;
}

function chromeToPath (aPath) {

   if (!aPath || !(/^chrome:/.test(aPath)))
      return; //not a chrome url
   var rv;
   
      var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci["nsIIOService"]);
        var uri = ios.newURI(aPath, "UTF-8", null);
        var cr = Cc['@mozilla.org/chrome/chrome-registry;1'].getService(Ci["nsIChromeRegistry"]);
        rv = cr.convertChromeURL(uri).spec;

        if (/^file:/.test(rv))
          rv = urlToPath(rv);
        else
          rv = urlToPath("file://"+rv);

      return rv;
}


function calExchangeCalendar() {

	this.myId = null;

	this.initProviderBase();

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

	this.setDoDebug();

	this.noDB = true;
	this.dbInit = false;

	this.folderPathStatus = 1;
	this.firstrun = true;
	this.mUri = "";
	this.mid = null;

//	this.initialized = false;

//	this.prefs = null;
	this.mUseOfflineCache = null;
	this.mNotConnected = true;

	this.myAvailable = false;

	this.mPrefs = null;

	this.itemCache = new Array;
	this.recurringMasterCache = new Array;
	this.newMasters = new Array;

	this.startDate = null;
	this.endDate = null;

	this.syncState = null;
	this.syncInboxState = null;
	this.syncBusy = false;
	this._weAreSyncing = false;
	this.firstSyncDone = false;

	this.meetingRequestsCache = [];
	this.meetingCancelationsCache = [];
	this.meetingrequestAnswered = [];
	this.meetingResponsesCache = [];

	this.getItemSyncQueue = [];
	this.processItemSyncQueueBusy = false;

	this.offlineTimer = null;
	this.offlineQueue = [];

	this.doReset = false;

	this.haveTimeZones = false;
	this.EWSTimeZones = null;

	this.shutdown = false;

	this.inboxPoller = Cc["@mozilla.org/timer;1"]
			.createInstance(Ci.nsITimer);

	this.cacheLoader = Cc["@mozilla.org/timer;1"]
			.createInstance(Ci.nsITimer);
	this.loadingFromCache = false;

	this.observerService = Cc["@mozilla.org/observer-service;1"]  
	                          .getService(Ci.nsIObserverService);  

	this.loadBalancer = Cc["@1st-setup.nl/exchange/loadbalancer;1"]  
	                          .getService(Ci.mivExchangeLoadBalancer); 

	this.exchangeStatistics = Cc["@1st-setup.nl/exchange/statistics;1"]
			.getService(Ci.mivExchangeStatistics);

	this.calendarPoller = null;

        this.mObserver = new ecObserver(this);

	this.supportsTasks = false;
	this.supportsEvents = false;

	this.folderProperties = null;
	this._readOnly = true;

	this.exporting = false;
	this.OnlyShowAvailability = false;

	this.updateCalendarItems = [];
	this.updateCalendarTimer = Cc["@mozilla.org/timer;1"]
			.createInstance(Ci.nsITimer); 
	this.updateCalendarTimerRunning = false;

	this.mIsOffline = Components.classes["@mozilla.org/network/io-service;1"]
                             .getService(Components.interfaces.nsIIOService).offline;

	//this.globalFunctions.LOG("Our offline status is:"+this.mIsOffline+".");

}

var calExchangeCalendarGUID = "720a458e-b6cd-4883-8a4d-5be27ec454d8";

calExchangeCalendar.prototype = {

	get timeStamp()
	{
		var elapsed = new Date().getTime() - globalStart;
		//dump("elapsed:"+elapsed);
		return elapsed;
	},

	__proto__: cal.ProviderBase.prototype,

// Begin nsIClassInfo
	classID: components.ID("{"+calExchangeCalendarGUID+"}"),
	contractID: "@mozilla.org/calendar/calendar;1?type=exchangecalendar",
	classDescription: "Exchange 2007/2010 Calendar and Tasks Provider",

	// void getInterfaces(out PRUint32 count, [array, size_is(count), retval] out nsIIDPtr array);
	getInterfaces: function _getInterfaces(count) 
	{
		var ifaces = [Ci.calICalendar,
			Ci.calICalendarProvider,
			Ci.calIFreeBusyService,
			Ci.calISchedulingSupport,
			Ci.calICalendarProvider,
			Ci.nsIClassInfo,
			Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

	// nsISupports getHelperForLanguage(in PRUint32 language);
	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},

	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,
	flags: 0,
// End nsIClassInfo

// Begin nsISupports
	// void QueryInterface(in nsIIDRef uuid, [iid_is(uuid),retval] out nsQIResult result);
	QueryInterface: function _QueryInterface(aIID) {
		return cal.doQueryInterface(this, calExchangeCalendar.prototype, aIID,null, this);
	},
// End nsISupports

// Begin calICalendarProvider
	// readonly attribute nsIURI prefChromeOverlay;
	get prefChromeOverlay() {
		if (this.debug) this.logInfo("get prefChromeOverlay()");
		return null;
	},

	get displayName() {
		if (this.debug) this.logInfo("get displayName()");
		return calGetString("calExchangeCalendar", "displayName", null, "exchangecalendar");
	},

	//  void createCalendar(in AUTF8String aName, in nsIURI aURL,
        //	            in calIProviderListener aListener);
	createCalendar: function calWcapCalendar_createCalendar(name, url, listener) {
		if (this.debug) this.logInfo("createCalendar");
		throw NS_ERROR_NOT_IMPLEMENTED;
	},

	//  void deleteCalendar(in calICalendar aCalendar,
        //  	            in calIProviderListener aListener);
	deleteCalendar: function calWcapCalendar_deleteCalendar(calendar, listener) {
		if (this.debug) this.logInfo("deleteCalendar");
		throw NS_ERROR_NOT_IMPLEMENTED;
	},

	//  calICalendar getCalendar(in nsIURI aURL);
	getCalendar: function calWcapCalendar_getCalendar(url) {
		if (this.debug) this.logInfo("getCalendar");
		throw NS_ERROR_NOT_IMPLEMENTED;
	},
// End calICalendarProvider

// Begin calICalendar

	//  attribute AUTF8String id;

	//   attribute AUTF8String name;

	//  readonly attribute AUTF8String type;
	get type()
	{
//		if (this.debug) this.logInfo("get type()");
		return "exchangecalendar";
	},

	//  readonly attribute AString providerID;
	get providerID()
	{
		return "exchangecalendar@extensions.1st-setup.nl";
	},

	//  attribute calICalendar superCalendar;

	get id()
	{
		return this.myId;
	},

	//  attribute nsIURI uri;
	get uri()
	{
	        return this.mUri;
	},

	set uri(aUri)
	{
		//if (this.debug) this.logInfo("set uri:"+aUri.path);
		this.myId = aUri.path.substr(1);
	        this.mUri = aUri;

		this.mPrefs = Cc["@mozilla.org/preferences-service;1"]
	                    .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+this.myId+".");
		if (this.exchangePrefVersion < 1) {
			this.mPrefs = null;
			this.myId = null;
		}

		if (this.name) {
			this.newCalendar = false;
			this.performStartup();
		}
		else {
			if (this.debug) this.logInfo("We are not going to perform a startup because we do not have a name yet and the calendar is probably still created.");
			this.newCalendar = true;
		}

	        return this.uri;
	},

	startupLoadFromOfflineCache: function _startupLoadFromOfflineCache()
	{

		if (this.loadingFromCache) return;

		this.loadingFromCache = true;

		var startTime = cal.createDateTime();

		if (!this.startDate) {
			this.startDate = this.offlineStartDate;
		}
		if (!this.endDate) {
			this.endDate = this.offlineEndDate;
		}
		var itemsFromCache = this.getItemsFromOfflineCache(this.startDate, this.endDate);
		if (itemsFromCache) {
			var endTime = cal.createDateTime();
			var duration = endTime.subtractDate(startTime);
			if (this.debug) this.logInfo("We got '"+itemsFromCache.length+"' items from offline cache.(took "+duration.inSeconds+" seconds)");
		}

		this.loadingFromCache = false;

	},

	performStartup: function _performStartup()
	{
		if (this.debug) this.logInfo("Performing startup.");

		if (this.getProperty("disabled")) {
			if (this.debug) this.logInfo("This calendar is disabled so not doing the startup.");
			return;
		}

		// Load from offline Cache into memory cache.
		if (this.useOfflineCache) {
			if (this.debug) this.logInfo("Getting items from offlineCache.");

			let self = this;
			this.cacheLoader.cancel();
			this.cacheLoader.initWithCallback({ notify: function setTimeout_notify() {self.startupLoadFromOfflineCache();	}}, 0, this.cacheLoader.TYPE_ONE_SHOT);

		}

		if (!this.isOffline) {
			// Start online processes.
			// 1. Check folder.
			// 2. Get timezone settings.
			// 3. Start pollers.
			if (this.debug) this.logInfo("Initialized:"+this.isInitialized);

			if (this.useOfflineCache) {
				this.syncExchangeToOfflineCache();
			}
		}

	},

	set readOnly(aValue)
	{

		if (this.folderProperties) {
			var effectiveRights = this.folderProperties.XPath("/s:Envelope/s:Body/m:GetFolderResponse/m:ResponseMessages/m:GetFolderResponseMessage/m:Folders/t:CalendarFolder/t:EffectiveRights");
			if (effectiveRights.length > 0) {
				if (((effectiveRights[0].getTagValue("t:Delete") == "false") || (effectiveRights[0].getTagValue("t:Modify") == "false")) &&
					(effectiveRights[0].getTagValue("t:CreateContents") == "false")) {
					aValue = true;
				}
			}
			effectiveRights = null;

		}

		var changed = false;
		if (aValue != this._readOnly) {
			if (this.debug) this.logInfo("readOnly property changed from "+this._readOnly+" to "+aValue);
			changed = true;
		}


		this._readOnly = aValue;

		if (changed) {
			this.observers.notify("onPropertyChanged", [this.superCalendar, "readOnly", aValue, !aValue]);
			this.observerService.notifyObservers(this, "onExchangeReadOnlyChange", this.name);  
		}
	},

	//  attribute boolean readOnly;
	get readOnly() {
		return ((this._readOnly) || (this.notConnected));
	},

	set notConnected(aValue)
	{
		if (aValue != this.mNotConnected) {
			this.mNotConnected = aValue;
			if (aValue) {
				this.observers.notify("onPropertyChanged", [this.superCalendar, "readOnly", true, false]);
				this.observerService.notifyObservers(this, "onExchangeReadOnlyChange", this.name);  
			}
			else {
				this.observers.notify("onPropertyChanged", [this.superCalendar, "readOnly", false, true]);
				this.observerService.notifyObservers(this, "onExchangeReadOnlyChange", this.name);  
			}
		}

	},

	get notConnected()
	{
		return this.mNotConnected;
	},

	//  readonly attribute boolean canRefresh;
	get canRefresh() {
		return true;
	},

	//  attribute boolean transientProperties;

	//  nsIVariant getProperty(in AUTF8String aName);
	getProperty: function _getProperty(aName) 
	{
	//	if (!this.isInitialized) {
	//		return;
	//	}

		//dump("2 getProperty("+aName+")\n");
		switch (aName) {
		case "exchWebService.offlineCacheDBHandle":
			return this.offlineCacheDB;

		case "exchWebService.offlineOrNotConnected":
			return ((this.notConnected) || (this.isOffline));

		case "exchWebService.useOfflineCache":
			return this.useOfflineCache;
		case "exchWebService.getFolderProperties":
			this.globalFunctions.LOG("Requesting exchWebService.getFolderProperties property.");
			if (this.folderProperties) {
				return this.folderProperties.toString();
			}
			return null;
			break;
		case "exchWebService.checkFolderPath":
			this.globalFunctions.LOG("Requesting exchWebService.checkFolderPath property.");
			this.checkFolderPath();
			return "ok";
			break;
		case "capabilities.tasks.supported" :
			return this.supportsTasks;
			break;
		case "capabilities.events.supported" :
			return this.supportsEvents;
			break;
		case "auto-enabled":
			return true;
		case "organizerId":
			//if (this.debug) this.logInfo("getProperty: organizerId");
			//return "exchangecalendar:" + this.mailbox;
			return "mailto:" + this.mailbox;
	                break;
		case "organizerCN":
			return this.userDisplayName;
	                break;
		case "cache.supported":
			return false;
		case "requiresNetwork":
                	return false;
		case "disabled":
			if (this.prefs) {
				this._disabled = this.globalFunctions.safeGetBoolPref(this.prefs, "disabled", false);
				if (this._disabled) return this._disabled;
			}

			return ((!this.isInitialized) && (this.folderPathStatus == 0));
		case "itip.notify-replies":
			return true;
		case "itip.transport":
			if (this.debug) this.logInfo("getProperty: itip.transport");
			break;
			//return true;
            	case "capabilities.autoschedule.supported":
			if (this.debug) this.logInfo("capabilities.autoschedule.supported");
                	return true;
/*		case "currentStatus":
			if (this.notConnected) {
				return Cr.NS_ERROR_FAILURE;
			}
			else {
				return Cr.NS_OK;
			}
			break;*/
	        }
		// itip.disableRevisionChecks

		// capabilities.events.supported
		// capabilities.tasks.supported

		//this.globalFunctions.LOG("1 getProperty("+aName+")");
	        return this.__proto__.__proto__.getProperty.apply(this, arguments);
	},

	//  void setProperty(in AUTF8String aName, in nsIVariant aValue);
	setProperty: function setProperty(aName, aValue)
	{

		if (this.debug) this.logInfo("setProperty. aName:"+aName+", aValue:"+aValue);
		switch (aName) {
		case "disabled" :
			var oldDisabledState = this._disabled;
			this._disabled = aValue;
			this.prefs.setBoolPref("disabled", aValue);
			if ((aValue) && (oldDisabledState != this._disabled)) {
				this.resetCalendar();
			}
			break;
		case "exchWebService.useOfflineCache":

			this.useOfflineCache = aValue;

			if (!aValue) {
				if (this.offlineCacheDB) {
					try {
						if (this.offlineCacheDB) this.offlineCacheDB.close();
						this.offlineCacheDB = null;
					} catch(exc) {}
				}

				// Remove the offline cache database when we delete the calendar.
				if (this.dbFile) {
					this.dbFile.remove(true);
					this.offlineCacheDB = null;
				}
			}
			return;
		}

		this.__proto__.__proto__.setProperty.apply(this, arguments);

		switch (aName) {
		case "disabled" :
			if ((!this._disabled) && (oldDisabledState != this._disabled)) {
				this.doReset = true;
				this.resetCalendar();
			}
			break;
		}
	},

	//  void deleteProperty(in AUTF8String aName);

	//  void addObserver( in calIObserver observer );
	//  void removeObserver( in calIObserver observer );

	//  calIOperation addItem(in calIItemBase aItem,
        //                in calIOperationListener aListener);
	addItem: function _addItem(aItem, aListener)
	{
		if (this.debug) this.logInfo("addItem id="+aItem.id);

		// if aItem.id == null then it is a newly created item in Lightning.
		// if aItem.id == "040000008200E00074C5B7101A82E008000000005D721F845633CD0100000000000000001000000006CC9AC20EA39441B863D6E454306174" it is from iTIP
		// if aItem.id == "31d9835f-1c29-4d18-ab39-7587c56e3982" paste in lightning after a copy in lightning.

	        if (this.OnlyShowAvailability) {
			this.readOnly = true;
			this.notifyOperationComplete(aListener,
        	                             Ci.calIErrors.OPERATION_CANCELLED,
                        	             Ci.calIOperationListener.ADD,
                        	             aItem.id,
                        	             aItem);

/*	            this.notifyOperationComplete(aListener,
	                                         Ci.calIErrors.CAL_IS_READONLY,
	                                         Ci.calIOperationListener.ADD,
	                                         null,
	                                         "Calendar is readonly");*/
			return null;
	        }


	        //let newItem = aItem.clone();
	        let newItem = aItem;
	
		// We check if we not allready have this item in Cache. If so we modify.
		// This will happen when someone pressed the accept,decline or tentative buttons
		// in the itip status bar on the header of an email message.
		if (this.itemCache[newItem.id]) {
			return this.modifyItem(newItem, this.itemCache[newItem.id]);
		}

		if ((aItem.id) && (aItem.id.indexOf("-") > 2)) {
			// This is added from a copy/paste procedure.
			aItem.id = null;
			aItem.deleteProperty("X-UID");

			// If I am invited. Remove myself.
			var attendees = aItem.getAttendees({});
			aItem.removeAllAttendees();
			for each (var attendee in attendees) {
				if ((attendee.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()) ||
					(attendee.id.replace(/^exchangecalendar:/, '').toLowerCase() == this.mailbox.toLowerCase()) ) {
					if (this.debug) this.logInfo("addItem: FOUND myself as an attendee and we are going to remove myself:"+aItem.title);
					aItem.removeAttendee(attendee);
				}
			}
		}

	        return this.adoptItem(newItem, aListener);
	},


	//  calIOperation adoptItem(in calIItemBase aItem,
        //                  in calIOperationListener aListener);
	adoptItem: function _adoptItem(aItem, aListener)
	{
		if (this.debug) this.logInfo("adoptItem()");

		if ((this.readOnly) || (this.OnlyShowAvailability)) {
			this.readOnly = true;
			if (this.OnlyShowAvailability) {
				this.notifyOperationComplete(aListener,
			                             Ci.calIErrors.OPERATION_CANCELLED,
		                	             Ci.calIOperationListener.ADD,
		                	             aItem.id,
		                	             aItem);
			}
			else {
				this.notifyOperationComplete(aListener,
		                                 Ci.calIErrors.CAL_IS_READONLY,
		                                 Ci.calIOperationListener.ADD,
		                                 null,
		                                 "Calendar is readonly");
			}
			return;
		}

		if (isEvent(aItem)) {	
			if (aItem.id) {
				// This is and item create through an iTIP response.

				var cachedItem = null;
				for (var index in this.meetingRequestsCache) {
					if (this.meetingRequestsCache[index]) {
						if (this.meetingRequestsCache[index].getProperty("X-UID") == aItem.id) {
							cachedItem = this.meetingRequestsCache[index];
							break;
						}
					}
				}

				if (cachedItem) {
					// We have meeting request in our cache.
					// Send meetingrespons base on status and remove message in inbox.
					if (this.debug) this.logInfo("BOA: iTIP action item with STATUS:"+aItem.getProperty("STATUS"));

					var aNewItem = this.cloneItem(aItem);
					aNewItem.setProperty("X-UID", cachedItem.getProperty("X-UID"));
					aNewItem.setProperty("X-ChangeKey", cachedItem.getProperty("X-ChangeKey"));
					aNewItem.setProperty("X-MEETINGREQUEST", cachedItem.getProperty("X-MEETINGREQUEST"));
					aNewItem.setProperty("X-IsInvitation" , cachedItem.getProperty("X-IsInvitation"));
					aNewItem.id = cachedItem.id;


					if ((aNewItem) && (this.sendMeetingRespons(aNewItem, null, "new"))) {
						this.notifyOperationComplete(aListener,
			        	                             Cr.NS_OK,
			                        	             Ci.calIOperationListener.ADD,
			                        	             aItem.id,
			                        	             aNewItem);
					}
					else {
						// User cancel.. How to respond!!
						this.notifyOperationComplete(aListener,
			        	                             Ci.calIErrors.OPERATION_CANCELLED,
			                        	             Ci.calIOperationListener.ADD,
			                        	             aItem.id,
			                        	             aItem);
					}
					return;
				}
				else {
					this.getMeetingRequestFromServer(aItem, aItem.id, Ci.calIOperationListener.ADD, aListener);
					return;

				}
			}
			var ewsItem = this.convertCalAppointmentToExchangeAppointment(aItem, "create", true);
		}
		if (isToDo(aItem)) {
			var ewsItem = this.convertCalTaskToExchangeTask(aItem, "create");
		}

		if (ewsItem) {

			// Create attachment create and delete object
			var attachmentsUpdates = null;

			var attachments = aItem.getAttachments({});
			if (attachments.length > 0) {
				if (this.debug) this.logInfo("  -- We have attachments:"+attachments.length);
				var attachmentsUpdates = { create: [], delete:[] };
				for (var index in attachments) {
					attachmentsUpdates.create.push(attachments[index]);
				}
			}

			var self = this;
			this.addToQueue( erCreateItemRequest,
				{user: this.user, 
				 mailbox: this.mailbox,
				 folderBase: this.folderBase,
				 serverUrl: this.serverUrl,
				 item: aItem,
				 folderID: this.folderID,
				 changeKey: this.changeKey,
				 createReq: ewsItem,
				 newItem: aItem,
				 attachmentsUpdates: attachmentsUpdates,
				 actionStart: Date.now(),
				 sendto: "sendtoall"}, 
				function(erCreateItemRequest, aId, aChangeKey) { self.createItemOk(erCreateItemRequest, aId, aChangeKey);}, 
				function(erCreateItemRequest, aCode, aMsg) { self.whichOccurrencegetOccurrenceIndexError(erCreateItemRequest, aCode, aMsg);},
				aListener);
		}
		else {
			// notify the listener
			this.notifyOperationComplete(aListener,
        	                             Ci.calIErrors.MODIFICATION_FAILED,
                        	             Ci.calIOperationListener.ADD,
                        	             aItem.id,
                        	             aItem);
		}

	},

	getMeetingRequestByUIDOk: function _getMeetingRequestByUIDOk(erGetMeetingRequestByUIDRequest, aMeetingRequests)
	{
		this.notConnected = false;
		this.saveCredentials(erGetMeetingRequestByUIDRequest.argument);
		if (this.debug) this.logInfo("getMeetingRequestByUIDOk: itemcount="+aMeetingRequests.length);

		if (erGetMeetingRequestByUIDRequest.argument.item.organizer) {
			if (this.debug) this.logInfo(" >>>>>>> 1 We have a organizer and SCHEDULE-AGENT="+erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT"));
		}
		else {
			if (this.debug) this.logInfo("item has not oranizer!!!!!!!!!!!!");
		}

		if (aMeetingRequests.length > 0) {
			// Convert list to CalAppointment and try to find the matching one
			var tmpList = [];
			for (var i=0; i<aMeetingRequests.length; i++) {
				var tmpItem = this.convertExchangeAppointmentToCalAppointment(aMeetingRequests[i], true);
				if (tmpItem) {
					tmpList.push(tmpItem);
				}
			}
			var ewsItem = this.findItemInListByDatesAndID(tmpList, erGetMeetingRequestByUIDRequest.argument.item);

			//var ewsItem = this.convertExchangeAppointmentToCalAppointment(aMeetingRequests[aMeetingRequests.length-1], true);
					
			if (this.debug) this.logInfo("getMeetingRequestByUIDOk: iTIP action item with STATUS:"+erGetMeetingRequestByUIDRequest.argument.item.getProperty("STATUS"));

			var me = this.getInvitedAttendee(erGetMeetingRequestByUIDRequest.argument.item);
			if (me) {
				if (this.debug) this.logInfo("getMeetingRequestByUIDOk: me.participationStatus:"+me.participationStatus);
				var tmpMe = this.getInvitedAttendee(ewsItem);
				if (tmpMe) {
					if (this.debug) this.logInfo("getMeetingRequestByUIDOk: tmpMe.participationStatus:"+tmpMe.participationStatus);
					tmpMe.participationStatus = me.participationStatus;

					switch (tmpMe.participationStatus) {
					case "ACCEPTED": 
						ewsItem.setProperty("STATUS", "CONFIRMED");
						break;
					case null:
					case "TENTATIVE": 
						ewsItem.setProperty("STATUS", "TENTATIVE");
						break;
					case "DECLINED": 
						ewsItem.setProperty("STATUS", "CANCELLED");
						break;
					}
				}
			}
			if (!me) {
				// I'm not directly invited. Just through distributionlist or mailgroup.
				if (this.debug) this.logInfo("getMeetingRequestByUIDOk: I'm not directly invited so we are going to create a dummy attendee for now.");
				me = cal.createAttendee();
				me.id = "mailto:"+this.mailbox;
				me.commonName = this.userDisplayName;
				me.rsvp = "FALSE";
				me.userType = "INDIVIDUAL";
				me.role = "NON-PARTICIPANT";
				switch (erGetMeetingRequestByUIDRequest.argument.item.getProperty("STATUS")) {
					case "CONFIRMED":
						me.participationStatus = "ACCEPTED";
						break;
					case "TENTATIVE":
						me.participationStatus = "TENTATIVE";
						break;
					case "CANCELLED":
						me.participationStatus = "DECLINED";
						break;
				}
				
			}

			if (this.debug) this.logInfo("getMeetingRequestByUIDOk: iTIP action item with ewsItem.STATUS:"+ewsItem.getProperty("STATUS"));

			ewsItem.setProperty("X-MEETINGREQUEST", true);
			if ((ewsItem) && (this.sendMeetingRespons(ewsItem, null, "new", me.participationStatus))) {
				if (erGetMeetingRequestByUIDRequest.listener) {
					this.notifyOperationComplete( erGetMeetingRequestByUIDRequest.listener,
		        	                             Cr.NS_OK,
		                        	             erGetMeetingRequestByUIDRequest.argument.operation,
		                        	             erGetMeetingRequestByUIDRequest.argument.item.id,
		                        	             ewsItem);
				}
				return;
			}
			// User cancel or other problem.
		}
		else {
			// inbox item has been removed between pressing iTIP button and requesting the info from the server.
			// Or it is an ICS import or a invitation from another mailbox... BUG 59
			if (this.debug) this.logInfo("Meeting request was removed from inbox after iTIP button was pressed and before Exchange server could be checked.");
			if (this.debug) this.logInfo("Someone else working in the same inbox?");
			if (this.debug) this.logInfo("OR We see this when someone imports an ICS file or imports a meeting request into another calendar.");
			// If it is an ICS we would like it to be added to the calendar as new item
			// If is a meeting request then we want it accepted and not added. This must produce an error
			// Problem is we cannot identify it as a ICS import or a acceptation of a meeting request.
			var doStop = false;

			if (erGetMeetingRequestByUIDRequest.argument.item.organizer) {
				if (this.debug) this.logInfo(" >>>>>>> 2 We have a organizer and SCHEDULE-AGENT="+erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT"));
				if (erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT") == "CLIENT") {
					// looks like iTIP because SCHEDULE-AGENT is set. 
					if (this.debug) this.logInfo(" >>>>>>> 2 We have a organizer and SCHEDULE-AGENT="+erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT"));
					if (this.debug) this.logInfo(" !!!!!!!!!!!!!! THIS SHOULD NEVER HAPPEN ON AN iTIP. DO WE HAVE AN iTIP");
					if (this.debug) this.logInfo("iCalString:"+erGetMeetingRequestByUIDRequest.argument.item.icalString);
					//if (this.debug) this.logInfo(" Stopping processing.. Report this problem to exchangecalendar@extensions.1st-setup.nl");
					//doStop = true;  // For now we going to clean out the UID and me as an attendee
					// We fake that we do a paste and that it is an invitation.
					
					if (this.debug) this.logInfo(" !!!>>  We are going to treat this as a copy/paste for a new event.");
					var tmpItem = erGetMeetingRequestByUIDRequest.argument.item.clone();
					tmpItem.id = "xxxx-xxxx-xxx-xxxx";
					tmpItem.setProperty("X-IsInvitation", "true");
					tmpItem.setProperty("X-exchangeITIP1", "true");
					tmpItem.setProperty("X-IsMeeting", true);
					this.addItem(tmpItem, erGetMeetingRequestByUIDRequest.listener);
					return;
					
				}

				if (erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT")) {
					if (this.debug) this.logInfo("Unknown SCHEDULE-AGENT property for item. SCHEDULE-AGENT:"+erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT"));
					if (this.debug) this.logInfo("Please mail the previous line to exchangecalendar@extensions.1st-setup.nl");
					return;
				}
				else {
					if (this.debug) this.logInfo("SCHEDULE-AGENT not set. We are going add the item. At a later stage we will want to have a proper restore.");
					var tmpItem = erGetMeetingRequestByUIDRequest.argument.item.clone();
					tmpItem.id = "xxxx-xxxx-xxx-xxxx";
					tmpItem.setProperty("X-exchangeITIP2", "true");
					tmpItem.removeAllAttendees();
					this.addItem(tmpItem, erGetMeetingRequestByUIDRequest.listener);
					return;
				}
			}

			if (!doStop) {
				if (erGetMeetingRequestByUIDRequest.argument.item.isMutable) {
					erGetMeetingRequestByUIDRequest.argument.item.id = undefined;
					this.adoptItem(erGetMeetingRequestByUIDRequest.argument.item, erGetMeetingRequestByUIDRequest.listener);
				}
				else {
					var tmpItem = erGetMeetingRequestByUIDRequest.argument.item.clone();
					tmpItem.id = undefined;
					this.adoptItem(tmpItem, erGetMeetingRequestByUIDRequest.listener);
				}
				return;
			}
		}

		// User cancel.. How to respond!!
		if (erGetMeetingRequestByUIDRequest.listener) {
			this.notifyOperationComplete(erGetMeetingRequestByUIDRequest.listener,
	       	                             Ci.calIErrors.OPERATION_CANCELLED, 
	                       	             erGetMeetingRequestByUIDRequest.argument.operation,
	                       	             erGetMeetingRequestByUIDRequest.argument.item.id,
	                       	             erGetMeetingRequestByUIDRequest.argument.item);
		}
	},

	getMeetingRequestByUIDError: function _getMeetingRequestByUIDError(erGetMeetingRequestByUIDRequest, aCode, aMsg)
	{
		this.saveCredentials(erGetMeetingRequestByUIDRequest.argument);
		this.notConnected = true;
		if (this.debug) this.logInfo("getMeetingRequestByUIDError: aCode:"+aCode+", aMsg:"+aMsg);

		this.notifyOperationComplete(erGetMeetingRequestByUIDRequest.listener,
       	                             Ci.calIErrors.OPERATION_CANCELLED,
                       	             Ci.calIOperationListener.ADD,
                       	             erGetMeetingRequestByUIDRequest.argument.item.id,
                       	             erGetMeetingRequestByUIDRequest.argument.item);

		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
		promptService.alert(null, "Error", aMsg+" ("+aCode+")");
	},

	singleModified: function _singleModified(aModifiedSingle, doNotify)
	{
		if (this.itemCache[aModifiedSingle.id]) {
			if (doNotify) {
if (this.debug) this.logInfo("singleModified doNotify");
				this.notifyTheObservers("onModifyItem", [aModifiedSingle, this.itemCache[aModifiedSingle.id]]);
			}
			this.itemCache[aModifiedSingle.id] = aModifiedSingle;
		}
	},

	masterModified: function _masterModified(aModifiedMaster)
	{
		//if (this.debug) this.logInfo("masterModified:"+aModifiedMaster.title);
		if (!this.recurringMasterCache[aModifiedMaster.getProperty("X-UID")]) {
			return null;
		}

		// Master was modified so tell the chidlren they have a new parent.
		for each(var item in this.itemCache) {
//			if ((item) && (item.parentItem.id != item.id) && (item.getProperty("X-UID") == aModifiedMaster.getProperty("X-UID"))) {
			if ((item) && (item.getProperty("X-UID") == aModifiedMaster.getProperty("X-UID"))) {
				//var newItem = item.clone();
				var newItem = this.cloneItem(item);
				newItem.parentItem = aModifiedMaster;
				this.singleModified(newItem, true);
				//this.notifyTheObservers("onModifyItem", [newItem, item]);
				//this.itemCache[newItem.id] = newItem;
			}
		}
		
		// We send a modify for the master. But we do not show the masters in the calendar 
//miv		this.notifyTheObservers("onModifyItem", [aModifiedMaster, this.recurringMasterCache[aModifiedMaster.getProperty("X-UID")]]);
		// Because we do not want it to be visible and the previous modify made it visible.
//miv		this.notifyTheObservers("onDeleteItem", [aModifiedMaster]);
		this.recurringMasterCache[aModifiedMaster.getProperty("X-UID")] = aModifiedMaster;
	},

	//  calIOperation modifyItem(in calIItemBase aNewItem,
        //                   in calIItemBase aOldItem,
        //                   in calIOperationListener aListener);

	modifyItem: function _modifyItem(aNewItem, aOldItem, aListener)
	{

		if (this.debug) this.logInfo("modifyItem");
		var result = Ci.calIErrors.MODIFICATION_FAILED;

	        if (this.OnlyShowAvailability) {
			this.readOnly = true;
			this.notifyOperationComplete(aListener,
        	                             Ci.calIErrors.OPERATION_CANCELLED,
                        	             Ci.calIOperationListener.MODIFY,
        	                             aNewItem.id,
        	                             aNewItem);
/*	            this.notifyOperationComplete(aListener,
	                                         Ci.calIErrors.CAL_IS_READONLY,
	                                         Ci.calIOperationListener.MODIFY,
	                                         null,
	                                         "Calendar is readonly");*/
			return null;
	        }

	        if (this.readOnly) {
			// When we hit this it probably is the change on a alarm. We will process this only in the local cache.
			if (this.debug) this.logInfo("modifyItem and this calendar is ReadOnly");
			this.notifyTheObservers("onModifyItem", [aNewItem, aOldItem]);
	        	this.notifyOperationComplete(aListener,
	        	                             Cr.NS_OK,
	        	                             Ci.calIOperationListener.MODIFY,
	        	                             aNewItem.id,
	        	                             aNewItem);
			return null;
	        }

	        if (!aNewItem) {
	            throw Cr.NS_ERROR_INVALID_ARG;
	        }

	        var this_ = this;
	        function reportError(errStr, errId) {
	            this_.notifyOperationComplete(aListener,
	                                          errId ? errId : Cr.NS_ERROR_FAILURE,
	                                          Ci.calIOperationListener.MODIFY,
	                                          aNewItem.id,
	                                          errStr);
	            return null;
	        }

	        if (aNewItem.id == null) {
	            // this is definitely an error
	            return reportError("ID for modifyItem item is null");
	        }

		var isMaster = false;

		// See if attachments changed.
		var newAttachments = aNewItem.getAttachments({});
		var attachments = {};

		var attachmentsUpdates = { create: [], delete:[] };
		if (newAttachments.length > 0) {
			if (this.debug) this.logInfo("  -- We have newAttachments:"+newAttachments.length);
			for (var index in newAttachments) {
				if (newAttachments[index].getParameter("X-AttachmentId")) {
					attachments[newAttachments[index].getParameter("X-AttachmentId")] = newAttachments[index];
				}
				else {
					attachmentsUpdates.create.push(newAttachments[index]);
					if (this.debug) this.logInfo("newAttachment:"+newAttachments[index].uri.spec);
				}
			}
		}
			// Check which have been removed.
			var oldAttachments = aOldItem.getAttachments({});
			for (var index in oldAttachments) {
				if (! attachments[oldAttachments[index].getParameter("X-AttachmentId")]) {
					attachmentsUpdates.delete.push(oldAttachments[index]);
					if (this.debug) this.logInfo("removedAttachment:"+oldAttachments[index].uri.spec);
				}
			}			
			
		//}

		if (isEvent(aNewItem)) {

			var invite = this.isInvitation(aOldItem, true);

			var doSendMeetingRespons = false;
			var meOld = this.getInvitedAttendee(aOldItem);
			if (!meOld) {
				meOld = cal.createAttendee();
				meOld.participationStatus = "NEEDS-ACTION";
			}

			var meNew = this.getInvitedAttendee(aNewItem);
			if (!meNew) {
				meNew = cal.createAttendee();
				meNew.participationStatus = "NEEDS-ACTION";
			}

			if (invite === true) {

				if (this.debug) this.logInfo("1 meOld.participationStatus="+meOld.participationStatus+", meNew.participationStatus="+meNew.participationStatus);
				if (this.debug) this.logInfo("1 aOldItem.status="+aOldItem.getProperty("STATUS")+", aNewItem.status="+aNewItem.getProperty("STATUS"));

				if ((meOld) && (meNew) && (meOld.participationStatus != meNew.participationStatus)) {
					doSendMeetingRespons = true;
				}

				if ((meNew) && (meNew.participationStatus == "NEEDS-ACTION") && (meOld.participationStatus != meNew.participationStatus)) {
					// They choose to confirm at a later state. Do not change this item.
			        	this.notifyOperationComplete(aListener,
			        	                             Cr.NS_OK,
			        	                             Ci.calIOperationListener.MODIFY,
			        	                             aNewItem.id,
			        	                             aNewItem);

			        	return null;
				}

				if ((meOld) && (meNew) && (aOldItem.getProperty("STATUS") != aNewItem.getProperty("STATUS")) && (!doSendMeetingRespons)) {
					switch (aNewItem.getProperty("STATUS")) {
					case "CONFIRMED": 
						meNew.participationStatus = "ACCEPTED";
						break;
					case null:
					case "TENTATIVE": 
						meNew.participationStatus = "TENTATIVE";
						break;
					case "CANCELLED": 
						meNew.participationStatus = "DECLINED";
						break;
					}
					doSendMeetingRespons = true;
				}

			}

			if (doSendMeetingRespons) {
				// The item is an invitation.
				// My status has changed. Send to this.globalFunctions.
				if (this.debug) this.logInfo("2 aOldItem.participationStatus="+meOld.participationStatus+", aNewItem.participationStatus="+(meNew ? meNew.participationStatus : ".."));
				if (this.debug) this.logInfo("3a aOldItem.id="+aOldItem.id);
				if (this.debug) this.logInfo("3b aNewItem.id="+aNewItem.id);

				var requestResponseItem = aNewItem;
				requestResponseItem.setProperty("X-MEETINGREQUEST", true);
				var aResponse = null;

				// Loop through meetingRequestsCache to find it.
				var cachedItem = null;
				for (var index in this.meetingRequestsCache) {
					if (this.meetingRequestsCache[index]) {
						if (this.meetingRequestsCache[index].getProperty("X-UID") == aNewItem.id) {
							cachedItem = this.meetingRequestsCache[index];
							break;
						}
					}
				}

				if (cachedItem) {
					if (this.debug) this.logInfo("___________ Found in meeting request cache.");
					var tmpItem = cachedItem;
					var tmpUID = aNewItem.id;
					requestResponseItem = this.cloneItem(aNewItem);
					requestResponseItem.id = tmpItem.id;
					requestResponseItem.setProperty("X-UID",  tmpItem.getProperty("X-UID"));
					requestResponseItem.setProperty("X-ChangeKey",  tmpItem.getProperty("X-ChangeKey"));
				}
				else {
					if (this.debug) this.logInfo("___________ NOT Found in meeting request cache. X-UID:"+aNewItem.getProperty("X-UID"));

					if (aNewItem.id == aNewItem.parentItem.id) {
						if (this.debug) this.logInfo("_________ it is a master.");
					}

					if ((!this.itemCache[aNewItem.id]) && (!this.recurringMasterCache[aNewItem.getProperty("X-UID")])) {
						this.getMeetingRequestFromServer(aNewItem, aOldItem.getProperty("X-UID"), Ci.calIOperationListener.MODIFY, aListener);
						return;
					}

				}

				if (this.sendMeetingRespons(requestResponseItem, null, "exisiting", aResponse)) {
					return;
					//result = Cr.NS_OK;
				}
				else {
					if (this.debug) this.logInfo("modifyItem: canceled by user.");
					result = Cr.NS_OK;
				}
			}
			else {

				var input= { item: aNewItem, 
					     response: "sendtonone"};

				if (aNewItem.organizer) {
					if (this.debug) this.logInfo("The organizer is:"+aNewItem.organizer.id);
				}
				else {
					if (this.debug) this.logInfo("We have no organizer!");
				}


				var changesObj = this.makeUpdateOneItem(aNewItem, aOldItem, null, null, null, invite);
				var changes;
				if (changesObj) {
					changes = changesObj.changes;
				}
				var weHaveChanges = (changes || (attachmentsUpdates.create.length > 0) || (attachmentsUpdates.delete.length > 0));
//				var weHaveChanges = (this.makeUpdateOneItem(aNewItem, aOldItem, null, null, null, invite) || (attachmentsUpdates.create.length > 0) || (attachmentsUpdates.delete.length > 0));

				var iAmOrganizer = ((aNewItem.organizer) && (aNewItem.organizer.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()));
				if (iAmOrganizer) {

					if (((changes) && ((changesObj) && (!changesObj.onlySnoozeChanged))) || (attachmentsUpdates.create.length > 0) || (attachmentsUpdates.delete.length > 0)) {

						input.response = "sendtoall";

						// Get the eventsummarywindow to attach dialog to.
						let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
						                  .getService(Ci.nsIWindowMediator);
						let calWindow = wm.getMostRecentWindow("Calendar:EventSummaryDialog") || cal.getCalendarWindow() || wm.getMostRecentWindow("mail:3pane") ;
	
						var attendees = aNewItem.getAttendees({}).length + aOldItem.getAttendees({}).length;
						if (this.debug) this.logInfo("  -- aOldItem.getAttendees({}).length="+aOldItem.getAttendees({}).length);
						if (this.debug) this.logInfo("  -- aNewItem.getAttendees({}).length="+aNewItem.getAttendees({}).length);
						if (this.getInvitedAttendee(aOldItem)) {
							attendees--;
						}
						if (this.getInvitedAttendee(aNewItem)) {
							attendees--;
						}

						if ((calWindow) && (attendees > 0) && (weHaveChanges)) {
							calWindow.openDialog("chrome://exchangecalendar/content/sendUpdateTo.xul",
								"sendUpdateTo",
								"chrome,titlebar,toolbar,centerscreen,dialog,modal=yes,resizable=yes",
								input); 
						}

						if ((attendees == 0) || (!weHaveChanges)) {
							if (this.debug) this.logInfo(" -- There are no attendees left");
							input.response = "sendtonone";
						}
					}
					else {
						if (this.debug) this.logInfo(" -- The user/organizer only dismissed or removed a reminder. We are not going to send this update to the invited people of the meeting.");
						input.response = "sendtonone";
					}
				}

				if (this.debug) this.logInfo("modifyItem: it is a event. aOldItem.CalendarItemType=:"+aOldItem.getProperty("X-CalendarItemType"));

				if (aOldItem.parentItem.id == aOldItem.id) {
					// We have a Single or master
					var master = this.recurringMasterCache[aOldItem.getProperty("X-UID")];
					if (master) {
						isMaster = true;
						// See if the aNewItem is also the master record.
						var masterChanged = (aNewItem.parentItem.id == aNewItem.id);

				if (this.debug) this.logInfo(" == aNewItem.id:"+aNewItem.id);
				if (this.debug) this.logInfo(" == aNewItem.parentItem.id:"+aNewItem.parentItem.id);
				if (this.debug) this.logInfo(" == aOldItem.id:"+aOldItem.id);
				if (this.debug) this.logInfo(" == aOldItem.parentItem.id:"+aOldItem.parentItem.id);
	
						// We need to find out wat has changed;
						if (this.debug) this.logInfo(" ==1 invite="+invite);

						var changesObj = this.makeUpdateOneItem(aNewItem, aOldItem, null, null, null, invite);
						var changes;
						if (changesObj) {
							changes = changesObj.changes;
						}

						if (changes) {
							if (this.debug) this.logInfo("modifyItem: changed:"+String(changes));

							this.removeChildrenFromMaster(this.recurringMasterCache[aOldItem.getProperty("X-UID")]);
							delete this.itemCache[aOldItem.id];
							delete this.recurringMasterCache[aOldItem.getProperty("X-UID")];

							if (this.debug) this.logInfo(" When CHANGED master arrives for '"+aNewItem.title+"' then it's children we all be downloaded.");
							this.newMasters[aOldItem.getProperty("X-UID")] = true;

							var self = this;
							this.addToQueue( erUpdateItemRequest,
								{user: this.user, 
								 mailbox: this.mailbox,
								 folderBase: this.folderBase,
								 serverUrl: this.serverUrl,
								 item: aOldItem,
								 folderID: this.folderID,
								 changeKey: this.changeKey,
								 updateReq: changes,
								 newItem: aNewItem,
						 		 actionStart: Date.now(),
								 attachmentsUpdates: attachmentsUpdates,
								 sendto: input.response}, 
								function(erUpdateItemRequest, aId, aChangeKey) { self.updateItemOk(erUpdateItemRequest, aId, aChangeKey);}, 
								function(erUpdateItemRequest, aCode, aMsg) { self.whichOccurrencegetOccurrenceIndexError(erUpdateItemRequest, aCode, aMsg);},
								aListener);
							return;
						}
						else {
							if (this.debug) this.logInfo("modifyItem: No changes for master.");
							// No changes to a master could means that one of the occurrences
							// was deleted. 
							var removedOccurrence = this.getRemovedOccurrence(aOldItem, aNewItem);
							if (removedOccurrence) {
								// Delete this occurrence;
								var self = this;
								this.addToQueue( erGetOccurrenceIndexRequest,
									{user: this.user, 
									 mailbox: this.mailbox,
									 folderBase: this.folderBase,
									 serverUrl: this.serverUrl,
									 masterItem: removedOccurrence,
									 item: removedOccurrence,
									 folderID: this.folderID,
									 changeKey: this.changeKey,
									 action: "deleteItem",
									 itemType: "occurrence",
									 whichOccurrence: "single_occurence" },//dialogArg.answer}, 
									function(erGetOccurrenceIndexRequest, aIndex, aMasterId, aMasterChangeKey) { self.getOccurrenceIndexOk(erGetOccurrenceIndexRequest, aIndex, aMasterId, aMasterChangeKey);}, 
									function(erGetOccurrenceIndexRequest, aCode, aMsg) { self.getOccurrenceIndexError(erGetOccurrenceIndexRequest, aCode, aMsg);},
									null);
							}
							else {
								// Could be an alarm dismiss or snooze
							}
							this.masterModified(aNewItem);
							result = Cr.NS_OK;
						}
					}
					else {
						if (this.debug) this.logInfo("modifyItem: Single event modification");
						// We need to find out wat has changed;
						if (this.debug) this.logInfo(" ==1 invite="+invite);

						var changesObj = this.makeUpdateOneItem(aNewItem, aOldItem, null, null, null, invite);
						var changes;
						if (changesObj) {
							changes = changesObj.changes;
						}
//						var changes = this.makeUpdateOneItem(aNewItem, aOldItem, null, null, null, invite);
						if (changes) {
							if (this.debug) this.logInfo("modifyItem: changed:"+String(changes));

							// We remove the item from cache and calendar because the update request will add
							// it again.
							// This is not true when we changed a single to a recurring item.
							if ((!aOldItem.recurrenceInfo) && (aNewItem.recurrenceInfo)) {
								// We need to request the children when the new master arrives.
								if (this.debug) this.logInfo(" When master arrives for '"+aNewItem.title+"' then it's children we all be downloaded.");
								this.newMasters[aOldItem.getProperty("X-UID")] = true;
							}

//							this.notifyTheObservers("onDeleteItem", [aOldItem]);
// removed this because item should not be removed.							delete this.itemCache[aOldItem.id];

							var self = this;
							this.addToQueue( erUpdateItemRequest,
								{user: this.user, 
								 mailbox: this.mailbox,
								 folderBase: this.folderBase,
								 serverUrl: this.serverUrl,
								 item: aOldItem,
								 folderID: this.folderID,
								 changeKey: this.changeKey,
								 updateReq: changes,
								 newItem: aNewItem,
						 		 actionStart: Date.now(),
								 attachmentsUpdates: attachmentsUpdates,
								 sendto: input.response}, 
								function(erUpdateItemRequest, aId, aChangeKey) { self.updateItemOk(erUpdateItemRequest, aId, aChangeKey);}, 
								function(erUpdateItemRequest, aCode, aMsg) { self.whichOccurrencegetOccurrenceIndexError(erUpdateItemRequest, aCode, aMsg);},
								aListener);
							//this.singleModified(aNewItem);
							return;
						}
						else {
							if (this.doAttachmentUpdates(attachmentsUpdates, aOldItem, input.response, aListener)) {
								// We are done
								if (this.debug) this.logInfo("modifyItem: No only attachment changes no other fields.");
								return;
							}
							else {
								if (this.debug) this.logInfo("modifyItem: No changes 1.");
								if (!invite) {
									//aNewItem.parentItem = aNewItem; move to storagecalendar
									this.singleModified(aNewItem, true);
								}
								result = Cr.NS_OK;
							}
						}
					}
				}
				else {
					if (this.debug) this.logInfo("modifyItem: Occurrence or exception modification");
					
					// We need to find the Index of this item.
					var self = this;
					if (aOldItem.hasProperty("X-OccurrenceIndex")) {
						if (this.debug) this.logInfo(" [[[[[[[[[[[[ We allready have an index for this occurrence ]]]]]]]]]]]]");
					}
						if (this.debug) this.logInfo(" [[[[[[[[[[[[ Index:"+aOldItem.getProperty("X-OccurrenceIndex")+" ]]]]]]]]]]]]");

					this.addToQueue( erGetOccurrenceIndexRequest,
						{user: this.user, 
						 mailbox: this.mailbox,
						 folderBase: this.folderBase,
						 serverUrl: this.serverUrl,
						 masterItem: aOldItem,
						 item: aOldItem,
						 folderID: this.folderID,
						 changeKey: this.changeKey,
						 newItem: aNewItem,
						 actionStart: Date.now(),
						 attachmentsUpdates: attachmentsUpdates,
						 sendto: input.response}, 
						function(erGetOccurrenceIndexRequest, aIndex, aMasterId, aMasterChangeKey) { self.modifyItemgetOccurrenceIndexOk(erGetOccurrenceIndexRequest, aIndex, aMasterId, aMasterChangeKey);}, 
						function(erGetOccurrenceIndexRequest, aCode, aMsg) { self.whichOccurrencegetOccurrenceIndexError(erGetOccurrenceIndexRequest, aCode, aMsg);},
						aListener);
					this.singleModified(aNewItem);
					return;
				}
			}
		}
		else {
			if (isToDo(aNewItem)) {
				if (this.debug) this.logInfo("modifyItem: it is a todo");

				var changesObj = this.makeUpdateOneItem(aNewItem, aOldItem);
				var changes;
				if (changesObj) {
					changes = changesObj.changes;
				}
//				var changes = this.makeUpdateOneItem(aNewItem, aOldItem);
				if (changes) {
					if (this.debug) this.logInfo("modifyItem: changed:"+String(changes));
					var self = this;
					this.addToQueue( erUpdateItemRequest,
						{user: this.user, 
						 mailbox: this.mailbox,
						 folderBase: this.folderBase,
						 serverUrl: this.serverUrl,
						 item: aOldItem,
						 folderID: this.folderID,
						 changeKey: this.changeKey,
						 updateReq: changes,
						 newItem: aNewItem,
						 attachmentsUpdates: attachmentsUpdates,
					 	 actionStart: Date.now()}, 
						function(erUpdateItemRequest, aId, aChangeKey) { self.updateItemOk(erUpdateItemRequest, aId, aChangeKey);}, 
						function(erUpdateItemRequest, aCode, aMsg) { self.whichOccurrencegetOccurrenceIndexError(erUpdateItemRequest, aCode, aMsg);},
						aListener);
					this.singleModified(aNewItem, true);
					return;
				}
				else {
					if (this.doAttachmentUpdates(attachmentsUpdates, aOldItem, "sendtonone", aListener)) {
						// We are done
						if (this.debug) this.logInfo("modifyItem: No only attachment changes no other fields.");
						return;
					}
					else {
						if (this.debug) this.logInfo("modifyItem: No changes 2.");
						//aNewItem.parentItem = aNewItem;
						this.singleModified(aNewItem, true);
						result = Cr.NS_OK;
					}
				}
			}
			else {
				return reportError("Unknown itemtype for modifyItem");
			}
		}

		//this.notifyTheObservers("onModifyItem", [aNewItem, aOldItem]);

        	this.notifyOperationComplete(aListener,
        	                             result,
        	                             Ci.calIOperationListener.MODIFY,
        	                             aNewItem.id,
        	                             aNewItem);

        	return null;
	},

	getChildByUIDandNativeTime: function _getChildByUIDandNativeTime(aUID, aNativeTime)
	{
		for (var index in this.itemCache) {
			if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aUID)) {
				// We found a child with the specified UID.
				if ((this.itemCache[index].recurrenceId) && (this.itemCache[index].recurrenceId.nativeTime == aNativeTime)) {
					return this.itemCache[index];
				} 
			}
		}

		return null;
	},

	//  calIOperation deleteItem(in calIItemBase aItem,
        //                   in calIOperationListener aListener);
	deleteItem: function _deleteItem(aItem, aListener) {
		if (this.debug) this.logInfo("deleteItem");

	        if (this.OnlyShowAvailability) {
			this.readOnly = true;
			this.notifyOperationComplete(aListener,
        	                             Ci.calIErrors.OPERATION_CANCELLED,
                        	             Ci.calIOperationListener.DELETE,
                        	             aItem.id,
                        	             aItem);
/*	            this.notifyOperationComplete(aListener,
	                                         Ci.calIErrors.CAL_IS_READONLY,
	                                         Ci.calIOperationListener.DELETE,
	                                         null,
	                                         "Calendar is readonly");*/
			return null;
	        }

		if (aItem.id == null) {
			this.notifyOperationComplete(aListener,
                                         Ci.calIErrors.MODIFICATION_FAILED,
                                         Ci.calIOperationListener.DELETE,
                                         null,
                                         "ID is null for deleteItem");
			return;
		}

		// Check if this item is still in cache
		if ((aItem.id == aItem.parentItem.id) && (!this.itemCache[aItem.id]) && (!this.recurringMasterCache[aItem.getProperty("X-UID")]))	 {
			if (this.debug) this.logInfo("Item is not in itemCache anymore. Probably not removed from view by Lightning..");
			this.notifyOperationComplete(aListener,
                                         Cr.NS_OK,
                                         Ci.calIOperationListener.DELETE,
                                         aItem.id,
                                         aItem);
			return;
		}

		var self = this;
		if (isEvent(aItem)) {
			if (this.debug) this.logInfo("deleteItem is calIEvent");

			var iAmOrganizer = ((aItem.organizer) && (aItem.organizer.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()));
			var isCancelled = aItem.getProperty("X-IsCancelled");
			var isInvitation = this.isInvitation(aItem, true);

			if ((isInvitation) && (!isCancelled)) {
//			if ((this.folderBase == "calendar") && (!this.folderID) && 
//			    (!iAmOrganizer) && (aItem.getProperty("STATUS") != "DECLINED") &&
//			    (aItem.getProperty("STATUS") != "NONE") && (!isCancelled)) {
				//var aOldItem = aItem.clone();
				var aOldItem = this.cloneItem(aItem);
				aOldItem.setProperty("STATUS", "DECLINED");

				if (!this.sendMeetingRespons(aOldItem, null, "exisiting", "DECLINED")) {
					if (this.debug) this.logInfo("deleteItem: canceled by user.");
					this.notifyOperationComplete(erDeleteItemRequest.listener,
					      Ci.calIErrors.OPERATION_CANCELLED,
					      Ci.calIOperationListener.DELETE,
					      aItem.id,
					      aItem);
					return;
				}
				else {
					this.notifyOperationComplete(erDeleteItemRequest.listener,
					      Cr.NS_OK,
					      Ci.calIOperationListener.DELETE,
					      aItem.id,
					      aItem);
					return;
				}

			}

			var input= { item: aItem, 
				     response: "sendtonone"};

			if (iAmOrganizer) {

				input.response = "sendtoall";

				// Get the eventsummarywindow to attach dialog to.
				let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
			                          .getService(Ci.nsIWindowMediator);
				let calWindow = wm.getMostRecentWindow("Calendar:EventSummaryDialog") || cal.getCalendarWindow() || wm.getMostRecentWindow("mail:3pane") ;

				var attendees = aItem.getAttendees({}).length;
				var meOld = this.getInvitedAttendee(aItem);

				if (meOld) {
					attendees--;
				}

				if ((calWindow) && (attendees > 0)) {
					calWindow.openDialog("chrome://exchangecalendar/content/sendUpdateTo.xul",
						"sendUpdateTo",
						"chrome,titlebar,toolbar,centerscreen,dialog,modal=yes,resizable=yes",
						input); 
				}

				if (attendees == 0) {
					input.response = "sendtonone";
				}

			}


			switch (aItem.getProperty("X-CalendarItemType")) {

				case "Single" :
					if (this.debug) this.logInfo("-- Single CalendarItemType");

					this.addToQueue( erDeleteItemRequest, 
						{user: this.user, 
						 mailbox: this.mailbox,
						 folderBase: this.folderBase,
						 serverUrl: this.serverUrl,
						 item: aItem,
						 folderID: this.folderID,
						 changeKey: this.changeKey,
						 itemType: "single"}, 
						function(erDeleteItemRequest) { self.deleteItemOk(erDeleteItemRequest);}, 
						function(erDeleteItemRequest, aCode, aMsg) { self.deleteItemError(erDeleteItemRequest, aCode, aMsg);},
						aListener);

					break;
				case "Occurrence" :
				case "Exception" :
					if (this.debug) this.logInfo("-- "+aItem.getProperty("X-CalendarItemType")+" CalendarItemType");

					this.addToQueue( erGetOccurrenceIndexRequest,
						{user: this.user, 
						 mailbox: this.mailbox,
						 folderBase: this.folderBase,
						 serverUrl: this.serverUrl,
						 masterItem: aItem,
						 item: aItem,
						 folderID: this.folderID,
						 changeKey: this.changeKey,
						 action: "deleteItem",
						 itemType: "occurrence",
						 whichOccurrence: "occurrence" },//dialogArg.answer}, 
						function(erGetOccurrenceIndexRequest, aIndex, aMasterId, aMasterChangeKey) { self.getOccurrenceIndexOk(erGetOccurrenceIndexRequest, aIndex, aMasterId, aMasterChangeKey);}, 
						function(erGetOccurrenceIndexRequest, aCode, aMsg) { self.getOccurrenceIndexError(erGetOccurrenceIndexRequest, aCode, aMsg);},
						aListener);

					break;
				case "RecurringMaster" :
					if (this.debug) this.logInfo("-- RecurringMaster CalendarItemType");

					this.addToQueue( erDeleteItemRequest,
						{user: this.user, 
						 mailbox: this.mailbox,
						 folderBase: this.folderBase,
						 serverUrl: this.serverUrl,
						 item: aItem,
						 folderID: this.folderID,
						 changeKey: this.changeKey,
						 itemType: "master",
						 whichOccurrence: "all_occurrences"}, 
						function(erDeleteItemRequest) { self.deleteItemOk(erDeleteItemRequest);}, 
						function(erDeleteItemRequest, aCode, aMsg) { self.deleteItemError(erDeleteItemRequest, aCode, aMsg);},
						aListener);
					break;
				default :
					// TODO: This will happen when the sync to/from EWS has not yet happened.
					if (this.debug) this.logInfo("WARNING: unknown CalendarItemType="+aItem.getProperty("X-CalendarItemType"));
			}
		}

		if (isToDo(aItem)) {
			if (this.debug) this.logInfo("deleteItem is calITask");
			this.addToQueue( erDeleteItemRequest,
				{user: this.user, 
				 mailbox: this.mailbox,
				 folderBase: this.folderBase,
				 serverUrl: this.serverUrl,
				 item: aItem,
				 folderID: this.folderID,
				 changeKey: this.changeKey,
				 itemType: "single"}, 
				function(erDeleteItemRequest) { self.deleteItemOk(erDeleteItemRequest);}, 
				function(erDeleteItemRequest, aCode, aMsg) { self.deleteItemError(erDeleteItemRequest, aCode, aMsg);},
				aListener);
		}


	},

	//  calIOperation getItem(in string aId, in calIOperationListener aListener);
	getItem: function _getItem(aId, aListener, aRetry) {
		if (this.debug) this.logInfo("getItem: aId:"+aId);

		if (!aListener)
			return;

		var item = null;


		if (!item) {
			for (var index in this.itemCache) {
				if (this.itemCache[index]) {
					if (this.itemCache[index].getProperty("X-UID") == aId) {
						var item = this.itemCache[index];
						break;
					}
				}
			}
		}

		if (!item) {
			var cachedRequest = null;
      			for (var index in this.meetingCancelationsCache) {
				if (this.meetingCancelationsCache[index]) {
					if (this.meetingCancelationsCache[index].getProperty("X-UID") == aId) {
						cachedRequest = this.meetingCancelationsCache[index];
						break;
					}
				}
			}

			if (cachedRequest) {
				//We have a meeting cancelation but not any calendaritem.
				if (this.debug) this.logInfo("This is odd we have a meeting cancelation but not any calendaritem. THIS SHOULD NOT HAPPEN");
				delete this.meetingCancelationsCache[cachedRequest.id];
				return;
			}

		}

	/*	if (!item) {
			for (var index in this.meetingRequestsCache) {
				if (this.meetingRequestsCache[index]) {
					if (this.meetingRequestsCache[index].getProperty("X-UID") == aId) {
						if (this.debug) this.logInfo("getItem is in meetingRequestsCache");
						if (this.debug) this.logInfo("  id="+index);
						var item = this.meetingRequestsCache[index];
						break;
					}
				}
			}  
		}*/

		if (!item) {
			// Wait with an answer until next sync. This could be an iTIP request
			// we could have received am email with a meetingrequest which was not
			// yet received through sync. Therefore we do not find it in cache. And
			// iTIP will show accept buttons and stuff. We do not want those buttons because
			// when pressed they will try to add the item to the calendar which gets synced to
			// EWS and we get an conflict...(item allready exists in EWS).
			// After next sync we can do this check again.
			if (!aRetry) {
				if (this.debug) this.logInfo("Not found putting it in ItemSyncQue");
				this.getItemSyncQueue.push( { id: aId,
							      listener: aListener } );
				this.refresh();
				return;
			}
			else {
				if (this.debug) this.logInfo("getItem not FOUND");
				// querying by id is a valid use case, even if no item is returned:
				this.notifyOperationComplete(aListener,
	                                         Cr.NS_OK,
	                                         Ci.calIOperationListener.GET,
	                                         aId,
	                                         null);
				return;
			}
		}

		var item_iid = null;
		if (isEvent(item))
			item_iid = Ci.calIEvent;
		else if (isToDo(item))
			item_iid = Ci.calITodo;
		else {
			this.notifyOperationComplete(aListener,
                                         Cr.NS_ERROR_FAILURE,
                                         Ci.calIOperationListener.GET,
                                         aId,
                                         "Can't deduce item type based on QI");
			return;
		}

		if (this.debug) this.logInfo("Found item in cache with Status:"+item.getProperty("STATUS"));

		aListener.onGetResult (this, 
                               Cr.NS_OK,
                               item_iid, null,
                               1, [item]);

		this.notifyOperationComplete(aListener,
                                     Cr.NS_OK,
                                     Ci.calIOperationListener.GET,
                                     aId,
                                     null);
	},

	//  calIOperation getItems(in unsigned long aItemFilter,
        //                 in unsigned long aCount,
        //                 in calIDateTime aRangeStart,
        //                 in calIDateTime aRangeEndEx,
        //                 in calIOperationListener aListener);
	getItems: function _getItems(aItemFilter, aCount,
                                    aRangeStart, aRangeEnd, aListener) 
	{
		if (this.debug) this.logInfo("getItems 1: aCount:"+aCount);

		if (aRangeStart)  { 
			if (this.debug) this.logInfo("getItems 2: aRangeStart:"+aRangeStart.toString()); 
		}
		else { 
			if (this.debug) this.logInfo("getItems 2: aRangeStart:null");
		}
		if (aRangeEnd) { 
			if (this.debug) this.logInfo("getItems 3: aRangeEnd:"+aRangeEnd.toString()); 
		}
		else { 
			if (this.debug) this.logInfo("getItems 3: aRangeEnd:null");
		}

		var wantEvents = ((aItemFilter & Ci.calICalendar
			.ITEM_FILTER_TYPE_EVENT) != 0);

		var wantTodos = ((aItemFilter & Ci.calICalendar
			.ITEM_FILTER_TYPE_TODO) != 0);

		if (wantEvents) if (this.debug) this.logInfo("Events are requested by calendar.");
		if (wantTodos) if (this.debug) this.logInfo("Tasks are requested by calendar.");

		if (this.newCalendar) {
			if (this.debug) this.logInfo("We are still creating this calendar. Ignore getItems for now.");
			if (aRangeStart) {
				if (wantEvents) {
					if (this.newCalRangeStartEvents) {
						if (aRangeStart.compare(this.newCalRangeStartEvents) < 0) {
							this.newCalRangeStartEvents = aRangeStart.clone();
						}
					}
					else {
						this.newCalRangeStartEvents = aRangeStart.clone();
					}
				}
				if (wantTodos) {
					if (this.newCalRangeStartTodos) {
						if (aRangeStart.compare(this.newCalRangeStartTodos) < 0) {
							this.newCalRangeStartTodos = aRangeStart.clone();
						}
					}
					else {
						this.newCalRangeStartTodos = aRangeStart.clone();
					}
				}
			}
		
			if (aRangeEnd) {
				if (wantEvents) {
					if (this.newCalRangeEndEvents) {
						if (aRangeEnd.compare(this.newCalRangeEndEvents) > 0) {
							this.newCalRangeEndEvents = aRangeEnd.clone();
						}
					}
					else {
						this.newCalRangeEndEvents = aRangeEnd.clone();
					}
				}
				if (wantTodos) {
					if (this.newCalRangeEndTodos) {
						if (aRangeEnd.compare(this.newCalRangeEndTodos) > 0) {
							this.newCalRangeEndTodos = aRangeEnd.clone();
						}
					}
					else {
						this.newCalRangeEndTodos = aRangeEnd.clone();
					}
				}
			}
		
			if (aListener) {
				this.notifyOperationComplete(aListener,
				      Cr.NS_OK,
				      Ci.calIOperationListener.GET,
				      null,
				      null);
			}
			return;
		}

		if (!this.isInitialized) {
			if (aListener) {
				this.notifyOperationComplete(aListener,
				      Cr.NS_OK,
				      Ci.calIOperationListener.GET,
				      null,
				      null);
			}
			return;
		}

		var validPeriod = false;
		if ((aRangeStart) && (aRangeEnd) && (aRangeStart.isDate) && (aRangeEnd.isDate)) {
			validPeriod = true;
			this.lastValidRangeStart = aRangeStart.clone();
			this.lastValidRangeEnd = aRangeEnd.clone();
		}

/*		if (this.OnlyShowAvailability) {
			var first = true;
			for (var index in this.itemCache) {
				if (first) {
					this.startDate = this.itemCache[index].startDate.clone();
					this.endDate = this.itemCache[index].endDate.clone();
					first = false;
				}
				else {
					if (this.itemCache[index].startDate.compare(this.startDate) < 0) {
						this.startDate = this.itemCache[index].startDate.clone();
					}
					if (this.itemCache[index].endDate.compare(this.endDate) > 0) {
						this.endDate = this.itemCache[index].endDate.clone();
					}
				}
			}
		}*/

		this.exporting = false;
		if ((aItemFilter == Ci.calICalendar.ITEM_FILTER_ALL_ITEMS) &&
		    (aCount == 0) &&
		    (aRangeStart == null) &&
		    (aRangeEnd == null)) {
			if (this.debug) this.logInfo("getItems: Request to get all Items in Calendar. Probably an export");
			this.exporting = true;
		}

		var asOccurrences = ((aItemFilter & Ci.calICalendar
			.ITEM_FILTER_CLASS_OCCURRENCES) != 0);

		var wantInvitations =  ((aItemFilter & Ci.calICalendar
	  		.ITEM_FILTER_REQUEST_NEEDS_ACTION) != 0);

		if (!wantEvents && !wantInvitations && !wantTodos) {
			this.notifyOperationComplete(aListener,
				Cr.NS_OK,
				Ci.calIOperationListener.GET,
				null, null);
			return;
		}

		if (wantInvitations) if (this.debug) this.logInfo("Invitations are requested by calendar.");

		if ((!this.supportsEvents) && (!this.supportsTasks)) {
			// Something requested we cannot fullfill.
			if (this.debug) this.logInfo("This folder currently is not able yet to support events or tasks.");
			this.notifyOperationComplete(aListener,
				Cr.NS_OK,
				Ci.calIOperationListener.GET,
				null, null);
			return;
		}

		var eventsRequestedAndPossible = ((wantEvents) && (this.supportsEvents));
		var tasksRequestedAndPossible = ((wantTodos) && (this.supportsTasks));
		if ((!eventsRequestedAndPossible) && (!tasksRequestedAndPossible)) {
			if (this.debug) this.logInfo("This folder is not able to support requested items.");
			this.notifyOperationComplete(aListener,
				Cr.NS_OK,
				Ci.calIOperationListener.GET,
				null, null);
			return;
		}
		if (eventsRequestedAndPossible) if (this.debug) this.logInfo("Events are requested and this is possible for this folder");
		if (tasksRequestedAndPossible) if (this.debug) this.logInfo("Tasks are requested and this is possible for this folder");

		if (!aRangeStart) {
			if (this.startDate) {
				aRangeStart = this.startDate.clone();
			}
			else {
				aRangeStart = cal.fromRFC3339("1900-01-01T00:00:00Z");
			}
		}

		if (!aRangeEnd) {
			if (this.endDate) {
				aRangeEnd = this.endDate.clone();
			}
			else {
				aRangeEnd = cal.fromRFC3339("3500-01-01T00:00:00Z");
			}
		} 

		var dateChanged = false;
		var startChanged = false;
		var endChanged = false;

		if (!this.startDate) {
			if (this.debug) this.logInfo("no startdate");
			this.startDate = aRangeStart.clone();
			dateChanged = true;
		}
		else {
			if (this.startDate.compare(aRangeStart) > 0) {
				if (this.debug) this.logInfo("aRangeStart ("+aRangeStart.toString()+") is before current startDate ("+this.startDate.toString()+")");
				// New start date is before old startdate. Period has grown.
				var oldStartDate = this.startDate.clone();
				this.startDate = aRangeStart.clone();
				dateChanged = true;
				startChanged = true;
			}
		}

		if (!this.endDate) {
			if (this.debug) this.logInfo("no enddate");
			this.endDate = aRangeEnd.clone();
			dateChanged = true;
		}
		else {
			if (this.endDate.compare(aRangeEnd) < 0) {
				if (this.debug) this.logInfo("aRangeEnd ("+aRangeEnd.toString()+") is after current endDate ("+this.endDate.toString()+")");
				// New end date is after old enddate. Period has grown.
				var oldEndDate = this.endDate.clone();
				this.endDate = aRangeEnd.clone();
				dateChanged = true;
				endChanged = true;
			}
		}


		if (aRangeStart)  { if (this.debug) this.logInfo("getItems 5a: aRangeStart:"+aRangeStart.toString()); }
		if (aRangeEnd) { if (this.debug) this.logInfo("getItems 5b: aRangeEnd:"+aRangeEnd.toString()); }

		this.getItemsFromMemoryCache(aRangeStart, aRangeEnd, aItemFilter, aListener, this.exporting);

 		if (this.OnlyShowAvailability) {
			if ((startChanged) || (endChanged)) {
				if (startChanged) {
					this.getOnlyFreeBusyInformation(aRangeStart, oldStartDate);
				}
				if (endChanged) {
					this.getOnlyFreeBusyInformation(oldEndDate, aRangeEnd);
				}
			}
			else {
				this.getOnlyFreeBusyInformation(aRangeStart, aRangeEnd);
			}

			return;
		}

		if (!dateChanged) {
			if (this.debug) this.logInfo("No dateChanged. Not going to request items from server.");
			return;
		}

		if (this.isOffline) {
			if (this.debug) this.logInfo("We are offline. Not going to request items from server.");
			return;
		}

      		var self = this;

		if ((this.syncInboxState) && (!this.weAreInboxSyncing)) {
			if ((this.folderBase == "calendar") && (!this.folderID)) {

				// Start the inbox poller to check for meetinginvitations or cancelations.
				this.checkInbox();
			}
		}

		if ((wantEvents) && (this.supportsEvents)) {
			if (this.debug) this.logInfo("Requesting events from exchange server.");
			if ((startChanged) || (endChanged)) {

//				this.getItemsFromMemoryCache(aRangeStart, aRangeEnd, aItemFilter, aListener, this.exporting);

				if (startChanged) {
					if (this.debug) this.logInfo("Startdate has changed to an earlier date. Requesting difference.");
					this.requestPeriod(aRangeStart, oldStartDate, aItemFilter, aCount, false);
				}
				if (endChanged) {
					if (this.debug) this.logInfo("Enddate has changed to a later date. Requesting difference.");
					this.requestPeriod(oldEndDate, aRangeEnd, aItemFilter, aCount, true);
				}

				// We need to get the period which did not change from memorycache.
			}
			else {
				if (this.debug) this.logInfo("New time period. Requesting items in period.");
				this.requestPeriod(aRangeStart, aRangeEnd, aItemFilter, aCount, false);
			}
		}
	
		if ((wantTodos) && (this.supportsTasks)) {
			if (this.debug) this.logInfo("Requesting tasks from exchange server.");
			this.addToQueue( erFindTaskItemsRequest, 
				{user: this.user, 
				 mailbox: this.mailbox,
				 serverUrl: this.serverUrl,
				 folderBase: this.folderBase,
				 itemFilter: aItemFilter,
				 folderID: this.folderID,
				 changeKey: this.changeKey,
				 actionStart: Date.now() }, 
				function(erFindTaskItemsRequest, aIds) { self.findTaskItemsOK(erFindTaskItemsRequest, aIds);}, 
				function(erFindTaskItemsRequest, aCode, aMsg) { self.findTaskItemsError(erFindTaskItemsRequest, aCode, aMsg);},
				null);
		}

	    },

	getItemsFromMemoryCache: function _getItemsFromMemoryCache(aRangeStart, aRangeEnd, aItemFilter, aListener, aExporting)
	{
		var events = [];
		var tasks = [];

		var wantEvents = ((aItemFilter & Ci.calICalendar
			.ITEM_FILTER_TYPE_EVENT) != 0);

		var wantTodos = ((aItemFilter & Ci.calICalendar
			.ITEM_FILTER_TYPE_TODO) != 0);

		for (var index in this.itemCache) {
			if (isEvent(this.itemCache[index])) {
				if ( ( (this.itemCache[index].startDate.compare(aRangeEnd) < 1) &&
				      (this.itemCache[index].endDate.compare(aRangeStart) > -1) ) ||
					(aExporting) ) {
					events.push(this.itemCache[index]);
				} 
			}
			else {
				if (isToDo(this.itemCache[index])) {
					if ( ((this.itemCache[index].status == "COMPLETED") && (aItemFilter & Ci.calICalendar.ITEM_FILTER_COMPLETED_YES)) ||
					     ((this.itemCache[index].status != "COMPLETED") && (aItemFilter & Ci.calICalendar.ITEM_FILTER_COMPLETED_NO)) ||
					     (aItemFilter & Ci.calICalendar.ITEM_FILTER_COMPLETED_ALL) ) {
						tasks.push(this.itemCache[index]);
					}
				}
			}
		}

		if (this.debug) this.logInfo("We got '"+events.length+"' events and  '"+tasks.length+"'  tasks from memory cache.");
		if (aListener) {
			if (this.debug) this.logInfo("We have a listener so going to inform it.(2)");
			if ((events.length > 0) && (wantEvents)) {
				aListener.onGetResult(this,
					     Cr.NS_OK,
					     Ci.calIEvent,
					     null,
					     events.length,
					     events);
			}
			
			if ((tasks.length > 0) && (wantTodos)) {
				aListener.onGetResult(this,
					     Cr.NS_OK,
					     Ci.calITodo,
					     null,
					     tasks.length,
					     tasks);
			}

			this.notifyOperationComplete(aListener,
			Cr.NS_OK,
			Ci.calIOperationListener.GET,
			null, null);
		}


	},

	requestPeriod: function _requestPeriod(aStartDate, aEndDate, aItemFilter, aCount, findReverse)
	{
		if (this.debug) this.logInfo("Getting period from: "+aStartDate.toString()+" until "+aEndDate.toString());

		if (findReverse) {
			var endDate = aEndDate.clone();
			var startDate = endDate.clone();

			var offset = cal.createDuration();
			offset.weeks = -4;
			startDate.addDuration(offset);
			if (startDate.compare(aStartDate) < 1) {
				startDate = aStartDate.clone();
			}
		}
		else {
			var startDate = aStartDate.clone();
			var endDate = startDate.clone();

			var offset = cal.createDuration();
			offset.weeks = 4;
			endDate.addDuration(offset);
			if (endDate.compare(aEndDate) > -1) {
				endDate = aEndDate.clone();
			}
		}

       		var self = this;
		var doStop = false;

		while (!doStop) {
			if (this.debug) this.logInfo("Getting period part of: "+startDate.toString()+" until "+endDate.toString());
			this.addToQueue( erFindCalendarItemsRequest, 
				{user: this.user, 
				 mailbox: this.mailbox,
				 serverUrl: this.serverUrl,
				 count: aCount,
				 rangeStart: startDate.clone(),
				 rangeEnd: endDate.clone(),
				 folderBase: this.folderBase,
				 itemFilter: aItemFilter,
				 folderID: this.folderID,
				 changeKey: this.changeKey,
				 actionStart: Date.now() }, 
				function(erFindCalendarItemsRequest, aIds, aOccurrences) { self.findCalendarItemsOK(erFindCalendarItemsRequest, aIds, aOccurrences);}, 
				function(erFindCalendarItemsRequest, aCode, aMsg) { self.findCalendarItemsError(erFindCalendarItemsRequest, aCode, aMsg);},
				null);

			if (findReverse) {
				endDate = startDate.clone();
				startDate.addDuration(offset);
				if (startDate.compare(aStartDate) < 1) {
					startDate = aStartDate.clone();
				}
				doStop = (endDate.compare(aStartDate) == 0);
			}
			else {
				startDate = endDate.clone();
				endDate.addDuration(offset);
				if (endDate.compare(aEndDate) > -1) {
					endDate = aEndDate.clone();
				}
				doStop = (startDate.compare(aEndDate) == 0);
			}
			
		}
		if (this.debug) this.logInfo("Getting period done.");
	},

	//  calIOperation refresh();
	refresh: function _refresh() {

		if (this.debug) this.logInfo("refresh");
		if (this.shutdown) {
			if (this.debug) this.logInfo("Shutting down. So no refresh.");
			return;
		}

		if ((!this.syncState) || (this.weAreSyncing)) {
			if (this.weAreSyncing) {
				if (this.debug) this.logInfo("weAreSyncing. So no refresh.");
			}
			else {
				if (this.debug) this.logInfo("No syncState yet. So no refresh.");
			}
			return;
		}

		if (!this.isInitialized) {	
			if (this.debug) this.logInfo("Not initialized yet. So no refresh.");
			return;
		}

		if (this.isOffline) {
			if (this.debug) this.logInfo("We are offline. So no refresh.");
			return;
		}

		if (this._disabled) {
			if (this.debug) this.logInfo("We are disabled. So no refresh.");
			return;
		}

		//if (this.debug) this.logInfo("Refresh. We start a sync.");
		var self = this;

		if (this.OnlyShowAvailability) {
			this.getOnlyFreeBusyInformation(this.lastValidRangeStart, this.lastValidRangeEnd);
		}		
		else {
			this.getSyncState();
		}

		return;

	},

	//  void startBatch();

	//  void endBatch();
// End calICalendar

// Begin calISchedulingSupport
	//  boolean isInvitation(in calIItemBase aItem);
	isInvitation: function _isInvitation(aItem, ignoreStatus)
	{

		if (ignoreStatus == undefined) {
			ignoreStatus = true;
		}

		if (!aItem) {
			return false;
		}

		if ((aItem.getProperty("X-IsInvitation")) && (aItem.getProperty("X-IsInvitation") == "true")) {
			if ((!ignoreStatus) && (aItem.getProperty("STATUS") != "NONE")) {
				return false;
			}
			return true;
		}

		// If this is not an personal calendar
		if ((this.folderBase != "calendar") || (this.folderPath != "/")) {
			return false;
		}

		// Check if we have attendees
		var attendees = aItem.getAttendees({});
		if (!attendees) {
			return false;
		}

		if (attendees.length == 0) {
			return false;
		}

		if (aItem.getProperty("X-IsCancelled")) {
			return false;
		}

		if ((!aItem.getProperty("X-IsMeeting")) || (aItem.getProperty("X-IsMeeting") === false)) {
			return false;
		}

		// When I'm not the organizer I'm invited if i am an attendee.
		let org = aItem.organizer;
		if ((!org) || (org.id.replace(/^mailto:/, '').toLowerCase() != this.mailbox.toLowerCase())) {
			
			// Check if I am an attendee
			var attendees = aItem.getAttendees({});
			for each (var attendee in attendees) {
				if (attendee.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()) {
				if (this.debug) this.logInfo("isInvitation FOUND myself");

					if (aItem.getProperty("STATUS") != "NONE") {
						return false;
					}
					return true;
				}
			}
			// I'm not directly invited. Could be through mailgroup.
			// TODO: How do we react. 
		}
/*		else {
			if ((org) && (org.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase())) {
				if (this.debug) this.logInfo("I'm the organiser");
			}
		}*/

		return false;
	},

	// boolean canNotify(in AUTF8String aMethod, in calIItemBase aItem);
	canNotify: function _canNotify(aMethod, aItem)
	{
		if (this.debug) this.logInfo("canNotify: aMethod="+aMethod+":"+aItem.title);

		return true;
	},

	// calIAttendee getInvitedAttendee(in calIItemBase aItem);
	getInvitedAttendee: function _getInvitedAttendee(aItem)
	{
		//if (this.debug) this.logInfo("getInvitedAttendee 1:"+aItem.title);
		if (!aItem) {
			return;
		}

		// Parse through the attendees
		var attendees = aItem.getAttendees({});
		for each (var attendee in attendees) {
			//if (this.debug) this.logInfo("getInvitedAttendee 2:"+attendee.id);
			if ((attendee.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()) ||
				(attendee.id.replace(/^exchangecalendar:/, '').toLowerCase() == this.mailbox.toLowerCase()) ) {
				//if (this.debug) this.logInfo("getInvitedAttendee FOUND myself:"+aItem.title);
				return attendee; //.clone();
			}
		}

		if (aItem.getProperty("X-IsInvitation") == "true") {
			//if (this.debug) this.logInfo("getInvitedAttendee  X-IsInvitation = true");
			var tmpAttendee = cal.createAttendee();
			tmpAttendee.id = "mailto:"+this.mailbox;
			tmpAttendee.commonName = this.userDisplayName;
			tmpAttendee.rsvp = "FALSE";
			tmpAttendee.userType = "INDIVIDUAL";
			tmpAttendee.role = "REQ-PARTICIPANT";
			tmpAttendee.participationStatus = "NEEDS-ACTION";
			return tmpAttendee;
		}

	},
// End calISchedulingSupport

// Begin calIFreeBusyProvider
	//    calIOperation getFreeBusyIntervals(in AUTF8String aCalId,
        //                               in calIDateTime aRangeStart,
        //                               in calIDateTime aRangeEnd,
        //                               in unsigned long aBusyTypes,
        //                               in calIGenericOperationListener aListener);

	getFreeBusyIntervals: function(aCalId, aRangeStart, aRangeEnd,
				       aBusyTypes, aListener)
	{
//		if (this.debug) this.logInfo("getFreeBusyIntervals: " + aCalId + ", aBusyTypes:"+aBusyTypes);

		if (aCalId.indexOf("@") < 0 || aCalId.indexOf(".") < 0) {
            		// No valid email, screw it
			if (aListener) {
				aListener.onResult(null, null);
			}
			return;
		}

		var tmpStartDate = aRangeStart.clone();
		tmpStartDate.isDate = false;
		var tmpEndDate = aRangeEnd.clone();
		tmpEndDate.isDate = false;

		var self = this;
		this.addToQueue( erGetUserAvailabilityRequest, 
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: this.folderBase,
			 serverUrl: this.serverUrl,
			 email: aCalId.replace(/^MAILTO:/, ""),
			 attendeeType: 'Required',
			 start: cal.toRFC3339(tmpStartDate.getInTimezone(this.globalFunctions.ecUTC())),
			 end: cal.toRFC3339(tmpEndDate.getInTimezone(this.globalFunctions.ecUTC())),
			 calId: aCalId,
			 folderID: this.folderID,
			 changeKey: this.changeKey }, 
			function(erGetUserAvailabilityRequest, aEvents) { self.getUserAvailabilityRequestOK(erGetUserAvailabilityRequest, aEvents);}, 
			function(erGetUserAvailabilityRequest, aCode, aMsg) { self.getUserAvailabilityRequestError(erGetUserAvailabilityRequest, aCode, aMsg);},
			aListener);

	},
// End calIFreeBusyProvider

// Begin calIItipTransport
	//    readonly attribute AUTF8String scheme;
	get scheme()
	{
		if (this.debug) this.logInfo("get scheme");
		return "";
	},

	//    attribute AUTF8String senderAddress;
	get senderAddress()
	{
		if (this.debug) this.logInfo("get senderAddress");
		return "hihi";
	},

	set senderAddress(aValue)
	{
		if (this.debug) this.logInfo("set senderAddress("+aValue+")");
	},

	//    readonly attribute AUTF8String type;
	//* IS DEFINED EARLIER AS PART OF calICalendar

    /**
     * Sends a calIItipItem to the recipients using the specified title and
     * alternative representation. If a calIItipItem is attached, then an ICS
     * representation of those objects are generated and attached to the email.
     * If the calIItipItem is null, then the item(s) is sent without any
     * text/calendar mime part.
     * @param count             size of recipient array
     * @param recipientArray    array of recipients
     * @param calIItipItem      set of calIItems encapsulated as calIItipItems
     */
	//    void sendItems(in PRUint32 count,
	//                   [array, size_is(count)] in calIAttendee recipientArray,
	//                   in calIItipItem item);
	sendItems: function _sendItems(count, recipientArray, item)
	{
		if (this.debug) this.logInfo("sendItems");
	},
// End calIItipTransport

	isRemoved: function _isRemoved(aItem)
	{
		if (!aItem) {
			return null;
		}

		if (this.debug) this.logInfo("isRemoved title:"+aItem.title+", status="+aItem.status);

		if (aItem.status == "") {
			return true;
		}

		return null;false;
	},

	getExceptions: function _getExceptions(aRecurrenceItems)
	{
		var tmpCount = 0;
		var exceptions = {};
		for each(var recurrenceItem in aRecurrenceItems) {
			tmpCount++;
			if (this.debug) this.logInfo("getExceptions: nr:"+tmpCount+", isNegative:"+recurrenceItem.isNegative);
			if (recurrenceItem.isNegative) {
				// A deletion is an exception and therefore isNegative === true
				var occurrences = recurrenceItem.getOccurrences(this.startDate, this.startDate, this.endDate, 0,  {});
				if (this.debug) this.logInfo("getExceptions: we have occurrences.length="+occurrences.length);
				for each(var occurrence in occurrences) {
					exceptions[occurrence.toString()] = occurrence;
				}				
			}
		}
		return exceptions;
	},

	getRemovedOccurrence: function _getRemovedOccurrence(aOldItem, aNewItem)
	{
		if (this.debug) this.logInfo("getRemovedOccurrence");
		// When an occurences gets removed from we get an extra occurenceitem in the recurrenceinfo list.

		var newRecurrenceItems;
		newRecurrenceItems = aNewItem.recurrenceInfo.getRecurrenceItems({});

		var oldRecurrenceItems;
		oldRecurrenceItems = aOldItem.recurrenceInfo.getRecurrenceItems({});

		if ((!newRecurrenceItems) || (newRecurrenceItems.length == 0)) {
			// No recurrenceItems in the new item
			// Nothing can be checked if it is removed.
			if (newRecurrenceItems) {
				if (this.debug) this.logInfo("newRecurrenceItems.length="+newRecurrenceItems.length);
			}
			if (this.debug) this.logInfo("getRemovedOccurrence: newItem has occurrenceInfo but no recurrenceItems. newCount="+newRecurrenceItems.length+",oldCount="+oldRecurrenceItems.length);
			return null;
		}

		if (newRecurrenceItems.length > oldRecurrenceItems.length) {
			if (this.debug) this.logInfo("getRemovedOccurrence: a New occurrence. newCount="+newRecurrenceItems.length+",  oldCount="+oldRecurrenceItems.length);
		}

		var newException = aNewItem.recurrenceInfo.getExceptionIds({});
		var oldException = aOldItem.recurrenceInfo.getExceptionIds({});
		if (newException.length != oldException.length) {
			if (this.debug) this.logInfo("getRemovedOccurrence: Exceptions count changed. newCount="+newException.length+",  oldCount="+oldException.length);
		}
		
		var oldExceptions = this.getExceptions(oldRecurrenceItems);

		var newExceptions = this.getExceptions(newRecurrenceItems);

		// Check if the newExceptions allready exists in the oldExceptions. If so remove it.
		for (var exceptionStr in newExceptions) {
			if (oldExceptions[exceptionStr]) {
				if (this.debug) this.logInfo("getRemovedOccurrence: '"+exceptionStr+"' also exists in the old occurrence list.");
				delete newExceptions[exceptionStr];
			}
		}

		// What we are left with is the removedOccurrence(s). It should be only one.
		for each(var exception in newExceptions) {
			if (exception) {
				// Go find the item in the cache
				for each(var item in this.itemCache) {
					if ((item) &&
					    (item.getProperty("X-UID") == aNewItem.getProperty("X-UID")) && 
					    (item.parentItem != item) &&
					    (item.recurrenceId.compare(exception) == 0)) {
						if (this.debug) this.logInfo("getRemovedOccurrence: we found our removed occurrence");
						return item;
					}
				}
			}
		}

		if (this.debug) this.logInfo("getRemovedOccurrence: we DID NOT FIND our removed occurrence");
		return null;
	},

	get prefs()
	{
		return this.mPrefs;
	},

	get exchangePrefVersion()
	{
		return this.globalFunctions.safeGetIntPref( this.prefs, "exchangePrefVersion", 0);
	},

	get isInitialized()
	{
		if (!this.id) {
			return false;
		}

		if (!this.mPrefs) {
			if (this.debug) this.logInfo("Found old version preferences. THIS IS A PROBLEM.");
			return false;
		}

		if (this.globalFunctions.safeGetBoolPref(this.prefs, "disabled", false)) {
			return false;
		}

		if (this.firstrun) {
			this.firstrun = false;

			getFreeBusyService().addProvider(this);

			// The first thing we want to do is check the folderbase and folderpath for their id & changekey.
			// It might have changed between restarts.
			this.checkFolderPath();

			this.syncState = this.globalFunctions.safeGetCharPref(this.prefs,"syncState", "");
			this.syncInboxState = this.globalFunctions.safeGetCharPref(this.prefs,"syncInboxState", "");

			this.getSyncState();
			//this.getTimeZones(); moved to setFolderProperties.

		}
		return true;

	},

	getCharPref: function(aName) {
		return this.globalFunctions.safeGetCharPref(this.prefs, aName, null);
	},

	setCharPref: function(aName, aValue) {
		if (this.prefs) {
			return this.prefs.setCharPref(aName, aValue);
		}
	},

	get user() {
		var username = this.globalFunctions.safeGetCharPref(this.prefs, "ecUser", "");
		if (username.indexOf("@") > -1) {
			return username;
		}
		else {
			if (this.domain == "") {
				return this.globalFunctions.safeGetCharPref(this.prefs, "ecUser", "");
			}
			else {
				return this.domain+"\\"+this.globalFunctions.safeGetCharPref(this.prefs, "ecUser", "");
			}
		}
	},

	set user(value) {
		if ((value.indexOf("\\") > -1) && (value.indexOf("@") == -1)) {
			this.domain = value.substr(0,value.indexOf("\\"));
			this.setCharPref("ecUser", value.substr(value.indexOf("\\")+1));
		}
		else {
			this.setCharPref("ecUser", value);
		}
	},

	get domain() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecDomain", "");
	},

	set domain(value) {
		return this.setCharPref("ecDomain", value);
	},

	get mailbox() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecMailbox", "");
	},

	get serverUrl() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecServer", "");
	},

	get userDisplayName() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecDisplayname", "");
	},

	get folderBase() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecFolderbase", "calendar");
	},

	get folderPath() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecFolderpath", "/");
	},

	get folderID() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecFolderID", null);
	},

	set folderID(aValue) {
		this.prefs.setCharPref("ecFolderID", aValue);
	},

	get changeKey() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecChangeKey", null);
	},

	set changeKey(aValue) {
		this.prefs.setCharPref("ecChangeKey", aValue);
	},

	get folderIDOfShare() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecFolderIDOfShare", "");
	},

	get isPublicFolder()
	{
		if (publicFoldersMap[this.folderBase]) {
			return true;
		}
		else {
			return false;
		}
	},

	get doPollInbox() {
		if (this.doReset) {
			return false;
		}

		return this.globalFunctions.safeGetBoolPref(this.prefs, "ecPollInbox", true);
	},

	get pollInboxInterval() {
		return this.globalFunctions.safeGetIntPref(this.prefs, "ecPollInboxInterval", 180);
	},

	get doAutoRespondMeeting() {
		return this.globalFunctions.safeGetBoolPref(this.prefs, "ecAutoRespondMeetingRequest", false);
	},

	get autoResponseAnswer() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecAutoRespondAnswer", "TENTATIVE");
	},

	get doAutoRemoveInvitationCancelation1() {
		return this.globalFunctions.safeGetBoolPref(this.prefs, "ecAutoRemoveInvitationCancellation1", false);
	},

	get doAutoRemoveInvitationCancelation2() {
		return this.globalFunctions.safeGetBoolPref(this.prefs, "ecAutoRemoveInvitationCancellation2", false);
	},

	get doAutoRemoveInvitationResponse1() {
		return this.globalFunctions.safeGetBoolPref(this.prefs, "ecAutoRemoveInvitationResponse1", true);
	},

	get sendAutoRespondMeetingRequestMessage() {
		return this.globalFunctions.safeGetBoolPref(this.prefs, "ecSendAutoRespondMeetingRequestMessage", false);
	},

	get autoRespondMeetingRequestMessage() {
		return this.globalFunctions.safeGetCharPref(this.prefs, "ecAutoRespondMeetingRequestMessage", "");
	},

	get cacheStartupBefore() {
		return this.globalFunctions.safeGetIntPref(null, "extensions.1st-setup.cache.startupBefore", 30, true);
	},

	get cacheStartupAfter() {
		return this.globalFunctions.safeGetIntPref(null, "extensions.1st-setup.cache.startupAfter", 30, true);
	},

	get startCacheDate() {
		var aDate = cal.now();
		var tmpDur = cal.createDuration();
		tmpDur.hours = -1 * 24 * this.cacheStartupBefore;
		aDate.addDuration(tmpDur);
		if (this.debug) this.logInfo("startCacheDate:"+aDate.toString());
		return aDate
	},

	get endCacheDate() 
	{
		var aDate = cal.now();
		var tmpDur = cal.createDuration();
		tmpDur.hours = 1 * 24 * this.cacheStartupAfter;
		aDate.addDuration(tmpDur);
		if (this.debug) this.logInfo("endCacheDate:"+aDate.toString());
		return aDate
	},

	checkInbox: function _checkInbox()
	{
		//if (this.debug) this.logInfo("checkInbox 1.");

		if (this.isOffline) return;

		if ((this.weAreInboxSyncing) || (!this.doPollInbox) || (this.OnlyShowAvailability)) {
			return;
		}

		this.weAreInboxSyncing = true;
		var self = this;

		//if (this.debug) this.logInfo("checkInbox 2.");
		this.addToQueue( erSyncInboxRequest,
			{user: this.user, 
			 mailbox: this.mailbox,
			 serverUrl: this.serverUrl,
			 folderBase: 'inbox',
			 folderID: null,
			 changeKey: null,
			 syncState: this.syncInboxState,
			 actionStart: Date.now() }, 
			function(erSyncInboxRequest, creations, updates, deletions, syncState) { self.syncInboxOK(erSyncInboxRequest, creations, updates, deletions, syncState);}, 
			function(erSyncInboxRequest, aCode, aMsg) { self.syncInboxError(erSyncInboxRequest, aCode, aMsg);},
			null);
	},

	syncInbox: function _syncInbox()
	{
		//if (this.debug) this.logInfo("syncInbox 1.");

		if (this.isOffline) return;

		if ((this.weAreInboxSyncing) || (!this.doPollInbox)) {
			return;
		}

		this.inboxPoller.cancel();

		var self = this;
		this.weAreInboxSyncing = true;

		//if (this.debug) this.logInfo("syncInbox 2.");
		this.addToQueue( erSyncInboxRequest,
			{user: this.user, 
			 mailbox: this.mailbox,
			 serverUrl: this.serverUrl,
			 folderBase: 'inbox',
			 folderID: null,
			 changeKey: null,
			 syncState: this.syncInboxState,
			 actionStart: Date.now() }, 
			function(erSyncInboxRequest, creations, updates, deletions, syncState) { self.syncInboxOK(erSyncInboxRequest, creations, updates, deletions, syncState);}, 
			function(erSyncInboxRequest, aCode, aMsg) { self.syncInboxError(erSyncInboxRequest, aCode, aMsg);},
			null);
	},

	removeMeetingItem: function _removeMeetingItem(aRequestItem)
	{
		var self = this;

		if (this.debug) this.logInfo("Going to remove meetingItem:"+aRequestItem.title);
		this.addToQueue( erDeleteItemRequest, 
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: 'inbox',
			 serverUrl: this.serverUrl,
			 item: null,
			 folderID: null,
			 id: aRequestItem.id,
			 changeKey: aRequestItem.getProperty("X-ChangeKey"),
			 itemType: "meeting"}, 
			function(erDeleteItemRequest) { self.removeMeetingItemOk(erDeleteItemRequest);}, 
			function(erDeleteItemRequest, aCode, aMsg) { self.removeMeetingItemError(erDeleteItemRequest, aCode, aMsg);},
			null);
	},

	removeResponseItem: function _removeResponseItem(aResponse)
	{
		var self = this;

		if (this.debug) this.logInfo("Going to remove responseItem:"+aResponse.getTagValue("t:Subject")+" from:"+aResponse.getTag("t:Sender").getTag("t:Mailbox").getTagValue("t:Name")+" ("+aResponse.getTag("t:Sender").getTag("t:Mailbox").getTagValue("t:EmailAddress")+")");
		this.addToQueue( erDeleteItemRequest, 
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: 'inbox',
			 serverUrl: this.serverUrl,
			 item: null,
			 folderID: null,
			 id: aResponse.getAttributeByTag("t:ItemId", "Id"),
			 changeKey: aResponse.getAttributeByTag("t:ItemId", "ChangeKey"),
			 itemType: "response"}, 
			function(erDeleteItemRequest) { self.removeMeetingItemOk(erDeleteItemRequest);}, 
			function(erDeleteItemRequest, aCode, aMsg) { self.removeMeetingItemError(erDeleteItemRequest, aCode, aMsg);},
			null);
	},

	removeMeetingItemOk: function _removeMeetingItemOk(erDeleteItemRequest)
	{
		this.notConnected = false;
		this.saveCredentials(erDeleteItemRequest.argument);
		if (this.debug) this.logInfo("removeItemOk: "+erDeleteItemRequest.argument.itemType);

	},

	removeMeetingItemError: function _removeMeetingItemError(erDeleteItemRequest, aCode, aMsg)
	{
		this.saveCredentials(erDeleteItemRequest.argument);
		this.notConnected = true;
		if (this.debug) this.logInfo("removeItemError: "+erDeleteItemRequest.argument.itemType+" msg:"+String(aMsg));
	},

	syncInboxOK: function _syncInboxOK(erSyncInboxRequest, creations, updates, deletions, syncState)
	{
		//if (this.debug) this.logInfo("syncInboxOk.");
		this.notConnected = false;
		this.saveCredentials(erSyncFolderItemsRequest.argument);

		if ((creations.meetingrequests.length > 0) || (updates.meetingrequests.length > 0) || (deletions.meetingrequests.length > 0)) {
			this.addActivity(calGetString("calExchangeCalendar", "syncInboxRequests", [creations.meetingrequests.length, updates.meetingrequests.length, deletions.meetingrequests.length, this.name], "exchangecalendar"), "", erSyncInboxRequest.argument.actionStart, Date.now());
			this.refresh();
		}

		if ((creations.meetingCancellations.length > 0) || (updates.meetingCancellations.length > 0) || (deletions.meetingCancellations.length > 0)) {
			this.addActivity(calGetString("calExchangeCalendar", "syncInboxCancelations", [creations.meetingCancellations.length, updates.meetingCancellations.length, deletions.meetingCancellations.length, this.name], "exchangecalendar"), "", erSyncInboxRequest.argument.actionStart, Date.now());
			this.refresh();
		}

		if ((creations.meetingResponses.length > 0) || (updates.meetingResponses.length > 0) || (deletions.meetingResponses.length > 0)) {
			this.addActivity(calGetString("calExchangeCalendar", "syncInboxResponses", [creations.meetingResponses.length, updates.meetingResponses.length, deletions.meetingResponses.length, this.name], "exchangecalendar"), "", erSyncInboxRequest.argument.actionStart, Date.now());
			this.refresh();
		}

		this.weAreInboxSyncing = false;

		// Do something with the output.
		if ((this.syncInboxState) && (syncState == this.syncInboxState)) {
			this.logError("Same syncState received.");
		}

		this.syncInboxState = syncState;
		this.prefs.setCharPref("syncInboxState", syncState);

		// Do something with the results.
//		if (this.debug) this.logInfo("syncInboxOK meetingrequests: Creation:"+creations.meetingrequests.length+", Updates:"+updates.meetingrequests.length+", Deletions:"+deletions.meetingrequests.length);
//		if (this.debug) this.logInfo("syncInboxOK meetingCancellations: Creation:"+creations.meetingCancellations.length+", Updates:"+updates.meetingCancellations.length+", Deletions:"+deletions.meetingCancellations.length);

		// Save requests into cache.
		for each (var request in creations.meetingrequests) {
			var meetingItem = this.convertExchangeAppointmentToCalAppointment(request, true);
			if (meetingItem) {
				if (this.debug) this.logInfo(" -- MeetingRequest creation:"+ meetingItem.title+", UID:"+request.getTagValue("t:UID")+",id:"+meetingItem.id+",changeKey:"+meetingItem.getProperty("X-ChangeKey"));
				meetingItem.setProperty("X-MEETINGREQUEST", true);
				meetingItem.setProperty("STATUS", "NONE")
				//this.meetingRequestsCache[request.getTagValue("t:UID")] = meetingItem;
				this.meetingRequestsCache[meetingItem.id] = meetingItem;
			}
		}

		for each (var update in updates.meetingrequests) {
			var meetingItem = this.convertExchangeAppointmentToCalAppointment(update, true);
			if (meetingItem) {
				if (this.debug) this.logInfo(" -- MeetingRequest update:"+ meetingItem.title+", UID:"+update.getTagValue("t:UID")+",id:"+meetingItem.id+",changeKey:"+meetingItem.getProperty("X-ChangeKey"));
				meetingItem.setProperty("X-MEETINGREQUEST", true);
				
				if ((this.meetingRequestsCache[update.id]) && (this.meetingRequestsCache[update.id].getProperty("X-UID") == meetingItem.getProperty("X-UID"))) {
					if (this.debug) this.logInfo("2 modifing  meeting request:"+update.id);
//					this.meetingRequestsCache[update.getTagValue("t:UID")] = meetingItem;
					this.meetingRequestsCache[meetingItem.id] = meetingItem;
				}
				else {
					if (this.debug) this.logInfo("WE DO NOT HAVE AN MEETING IN CACHE FOR THIS UPDATE!!!!. PLEASE REPORT");
				}
			}
		}

		for each (var deletion in deletions.meetingrequests) {
			var meetingItem = this.convertExchangeAppointmentToCalAppointment(deletion, true);
			if (meetingItem) {
				if (this.debug) this.logInfo(" -- MeetingRequest deletion:"+ meetingItem.title+", UID:"+deletion.getTagValue("t:UID")+",id:"+meetingItem.id+",changeKey:"+meetingItem.getProperty("X-ChangeKey"));
				meetingItem.setProperty("X-MEETINGREQUEST", true);
				this.removeFromMeetingRequestCache(deletion.id);			
				this.meetingrequestAnswered[deletion.id] = false;
			}
		}

		// Save cancelations into cache and remove request for which we received a cancelation.
		for each (var request in creations.meetingCancellations) {
			var cancelItem = this.convertExchangeAppointmentToCalAppointment(request, true);
			if (cancelItem) {
				cancelItem.setProperty("X-MEETINGCANCELATION", true);
				this.meetingCancelationsCache[request.id] = cancelItem;
			}
		}

		for each (var update in updates.meetingCancellations) {
			var cancelItem = this.convertExchangeAppointmentToCalAppointment(update, true);
			if (cancelItem) {
				cancelItem.setProperty("X-MEETINGCANCELATION", true);
				if (this.meetingCancelationsCache[update.id].getProperty("X-UID") == cancelItem.getProperty("X-UID")) {
					this.meetingCancelationsCache[update.id] = meetingItem;
				}
				else {
					if (this.debug) this.logInfo("WE DO NOT HAVE AN MEETING IN CACHE FOR THIS UPDATE!!!!. PLEASE REPORT");
				}
			}
		}

		for each (var deletion in deletions.meetingCancellations) {
			delete this.meetingCancelationsCache[deletion.id];
		}

		var requestCount = 0;
		var cancelationCount = 0;
		var tmpInCalendarCache = {};
		for each (var index in this.meetingRequestsCache) {
			if (index) {
				// Remove request for which we have an calendaritem which is confirmed
				var tmpID = index.id;
				var tmpUID = index.getProperty("X-UID");
				var inCalendar = null;

				// First check recurring Masters
				if (this.recurringMasterCache[tmpUID]) {
					inCalendar = this.recurringMasterCache[tmpUID];
				}

				// Check single items
				if (!inCalendar) {
					for each (var item in this.itemCache) {
						if ((item) && (item.getProperty("X-UID") == tmpUID)) {
							inCalendar = item;
							break;
						}
					}
				}				
				
				var confirmed = false;

				// We turn this off for now (10-12-2011) This so meeting update items in mailbox are not removed.
				/*if (inCalendar) {
					//if (this.debug) this.logInfo("request '"+inCalendar.title+"' allready in Calendar with status="+inCalendar.getProperty("STATUS"));
					//var newItem = 
					confirmed = (inCalendar.getProperty("STATUS") != "NONE");
					tmpInCalendarCache[tmpUID] = inCalendar;
				}*/

				if (confirmed) {	
					// Remove request. Meeting is in calendar and confirmed.
					this.removeMeetingItem(index);
					this.removeFromMeetingRequestCache(tmpID);
					//this.meetingRequestsCache[tmpUID] = null;
					this.meetingrequestAnswered[tmpID] = false;
				}
				else {
					// Keep this request
					requestCount++;
					//if (this.debug) this.logInfo("meetingRequest:"+index.getTagValue("t:Subject"));

					// This is a new request. Check if we should autorespond.
					if (!this.meetingrequestAnswered[tmpID]) {
						this.meetingrequestAnswered[tmpID] = false;
					}

					if ((this.doAutoRespondMeeting) && (this.meetingrequestAnswered[tmpID] === false)) {

						var bodyText = null;
						if (this.sendAutoRespondMeetingRequestMessage) {
							bodyText = this.autoRespondMeetingRequestMessage;
							this.addActivity(calGetString("calExchangeCalendar", "sendAutoRespondMeetingRequestMessage", [index.title, this.name], "exchangecalendar"), "", Date.now(), Date.now());

						}

						if (inCalendar) {
							//var aItem = inCalendar.clone();
							var aItem = this.cloneItem(inCalendar);
							this.sendMeetingRespons(aItem, null, "existing", this.autoResponseAnswer, bodyText);
						}
						else {
							//var aItem = index.clone();
							var aItem = this.cloneItem(index);
							this.sendMeetingRespons(aItem, null, "existing", this.autoResponseAnswer, bodyText); // TODO: might have to set new
						}
						this.meetingrequestAnswered[tmpID] = true;
					}
				}

				// We turn this off for now (10-12-2011) This so meeting update items in mailbox are not removed.
/*				if (inCalendar) {
					// remove our cached request from calendar otherwise it will appear twice.
					this.notifyTheObservers("onDeleteItem", [index]);
					this.removeFromMeetingRequestCache(tmpUID);
					//this.meetingRequestsCache[tmpUID] == null;
					this.meetingrequestAnswered[tmpUID] = false;
				}*/
			}
		}
		for each (var index in this.meetingCancelationsCache) {
			if (index) {
				// Remove cancelation for which we do not have an calendaritem.
				var tmpID = index.id;
				var tmpUID = index.getProperty("X-UID");
				var inCalendar = false;

				// First check recurring Masters
				if (this.recurringMasterCache[tmpUID]) {
					inCalendar = this.recurringMasterCache[tmpUID];
				}

				// Check single items
				if (!inCalendar) {
					for each (var item in this.itemCache) {
						if ((item) && (item.getProperty("X-UID") == tmpUID)) {
							inCalendar = item;
							break;
						}
					}
				}				

				// Check meetingrequest cache
				var inCache = false;					
				if (!inCalendar) {
					inCalendar = this.meetingRequestsCache[tmpID];
					if (inCalendar) {
						// We have a cancellation and a request but no item in the calendar
						inCache = true;
					}
				}
	
				if (inCalendar) {	
					// Keep this cancelation if it is allready confirmed. Or remove it when we we have it only in cache.
					if (((inCalendar.getProperty("STATUS") == "NONE") && (this.doAutoRemoveInvitationCancelation1)) ||
						(inCache)) {
						// We have an calendaritem for this cancelation but it is not yet confirmed.
						// We remove the cancelation and the meetingitem if it is not in cache
						// and user specified this in the EWS settings.
						if (inCache) {
							// We remove it from the cache
							if (this.meetingRequestsCache[tmpID]) {
								this.removeMeetingItem(this.meetingRequestsCache[tmpID]);
								this.removeFromMeetingRequestCache(tmpID);
								//this.meetingRequestsCache[tmpUID] = null;
							}
							this.removeMeetingItem(index);
							this.notifyTheObservers("onDeleteItem", [inCalendar]);
							this.removeFromMeetingRequestCache(tmpID);
							//this.meetingRequestsCache[tmpUID] = null;
							this.meetingrequestAnswered[tmpID] = false;
							delete this.meetingCancelationsCache[tmpID];
						}
						else {
							// We remove it from the real calendar.
							this.removeMeetingItem(index);
							this.deleteItem(inCalendar);
						}
					}
					else {
						if (! inCalendar.getProperty("X-IsCancelled")) {
							if (!this.doAutoRemoveInvitationCancelation2) {
								// It is in calendar and allready confirmed. We update the current calendaritem.
								// Change title of current calendaritem.
								//var newItem = inCalendar.clone();
								var newItem = this.cloneItem(inCalendar);
								newItem.setProperty("X-IsCancelled", true);
								newItem.title = index.title;
								// Set status in calendar as free.
								newItem.setProperty("TRANSP", "TRANSPARENT");
								if (inCache) {
									this.notifyTheObservers("onModifyItem", [newItem, inCalendar]);
									this.meetingRequestsCache[tmpID] = newItem;
								}
								else {
									this.modifyItem(inCalendar, newItem, null);
								}
								cancelationCount++;
							}
							else {
								// Remove calendar item and cancellation message
								// because user specified so in the EWS settings.
								// We remove it from the real calendar and in the inbox.
								this.addActivity(calGetString("calExchangeCalendar", "autoRemoveConfirmedInvitationOnCancellation", [inCalendar.title, this.name], "exchangecalendar"), "", Date.now(), Date.now());
								inCalendar.setProperty("X-IsCancelled", true);
								this.deleteItem(inCalendar);
								this.removeMeetingItem(index);
								this.removeFromMeetingRequestCache(tmpID);
								//this.meetingRequestsCache[tmpUID] = null;
							}
						}
						delete this.meetingCancelationsCache[tmpID];
						if (this.debug) this.logInfo("meetingCancelation:"+index.title);
					}
				}
				else {
					// Meeting is not in calendar yet. We remove it if user specified it
					// as a setting in EWS settings.
					if (this.doAutoRemoveInvitationCancelation1) {
						if (this.meetingRequestsCache[tmpID]) {
							this.removeMeetingItem(this.meetingRequestsCache[tmpID]);
							this.removeFromMeetingRequestCache(tmpID);
							//this.meetingRequestsCache[tmpUID] = null;
						}
						this.removeMeetingItem(index);
						delete this.meetingCancelationsCache[tmpID];
					}
				}
			}
		}

		// Process Meetingresponses
		// Save responses into cache and remove request for which we received a cancelation.
		for each (var response in creations.meetingResponses) {
			this.meetingResponsesCache[response.getAttributeByTag("t:ItemId","Id")] = response;
		}

		for each (var response in updates.meetingResponses) {
			if (this.meetingResponsesCache[response.getAttributeByTag("t:ItemId","Id")]) {
				this.meetingResponsesCache[response.getAttributeByTag("t:ItemId","Id")] = response;
			}
			else {
				if (this.debug) this.logInfo("WE DO NOT HAVE AN RESPONSE IN CACHE FOR THIS UPDATE!!!!. PLEASE REPORT");
			}
		}

		for each (var response in deletions.meetingResponses) {
			if (this.meetingResponsesCache[response.getAttributeByTag("t:ItemId","Id")]) {
				delete this.meetingResponsesCache[response.getAttributeByTag("t:ItemId","Id")];
			}
		}


		if (this.doAutoRemoveInvitationResponse1) {
			for each(var response in this.meetingResponsesCache) {
				// Check if we have this meeting 
				var tmpUID = response.getTagValue("t:UID");
				var inCalendar = false;

				// First check recurring Masters
				if (this.recurringMasterCache[tmpUID]) {
					inCalendar = this.recurringMasterCache[tmpUID];
				}

				// Check single items
				if (!inCalendar) {
					for each (var item in this.itemCache) {
						if ((item) && (item.getProperty("X-UID") == tmpUID)) {
							inCalendar = item;
							break;
						}
					}
				}

				if (inCalendar) {
					// Check if we are the organiser of this item.
					var iAmOrganizer = ((inCalendar.organizer) && (inCalendar.organizer.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()));
					if (!iAmOrganizer) {
						// Remove the response in the inbox. Do not update calendar.
						this.removeResponseItem(response);
						delete this.meetingResponsesCache[response.getAttributeByTag("t:ItemId","Id")];
					}
				}				
			}
		}

		if ((requestCount > 0) || (cancelationCount > 0)) {
			this.refresh();
		}

//		if (this.debug) this.logInfo("syncInboxOK: left with meetingRequests:"+requestCount+", meetingCancelations:"+cancelationCount);

		this.startSyncInboxPoller();
	},

	startSyncInboxPoller: function _startSyncInboxPoller()
	{
		if (!this.doPollInbox) {
			return;
		}

		this.inboxPoller.cancel();
	        let self = this;
		this.inboxPoller.initWithCallback({ notify: function setTimeout_notify() {self.syncInbox();	}}, this.pollInboxInterval * 1000, this.inboxPoller.TYPE_REPEATING_SLACK);
	},

	syncInboxError: function _syncInboxError(erSyncFolderItemsRequest, aCode, aMsg)
	{
		this.saveCredentials(erSyncFolderItemsRequest.argument);
		this.notConnected = true;
		this.weAreInboxSyncing = false;
		//this.processItemSyncQueue();
		
		this.startSyncInboxPoller();
	},

	doAvailability: function _doAvailability(aCalId, aCi)
	{
		const x = Ci.calIFreeBusyInterval;

		const types = {
			"Free" 		: x.FREE,
			"Tentative"	: x.BUSY_TENTATIVE,
			"Busy"		: x.BUSY,
			"OOF"		: x.BUSY_UNAVAILABLE,
			"NoData"	: x.UNKNOWN
		};

		var start = this.tryToSetDateValue(aCi.getTagValue("t:StartTime"));
		var end   = this.tryToSetDateValue(aCi.getTagValue("t:EndTime"));
		var type  = types[aCi.getTagValue("t:BusyType")];
		return new cal.FreeBusyInterval(aCalId, type,
					       	  start, end);
	},

	md5: function _md5(aString)
	{

		if (!aString) {
			return "";
		}

		var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
		    createInstance(Ci.nsIScriptableUnicodeConverter);
		 
		// we use UTF-8 here, you can choose other encodings.
		converter.charset = "UTF-8";
		// result is an out parameter,
		// result.value will contain the array length
		var result = {};
		// data is an array of bytes
		var data = converter.convertToByteArray(aString, result);
		var ch = Cc["@mozilla.org/security/hash;1"]
				   .createInstance(Ci.nsICryptoHash);
		ch.init(ch.MD5);
		ch.update(data, data.length);
		return ch.finish(true);
	},

	getUserAvailabilityRequestOK: function _getUserAvailabilityRequestOK(erGetUserAvailabilityRequest, aEvents)
	{
		this.notConnected = false;
		//if (this.debug) this.logInfo("getUserAvailabilityRequestOK");
		this.saveCredentials(erGetUserAvailabilityRequest.argument);

		var items = new Array();
		if (this.OnlyShowAvailability) {
			this.updateCalendar(erGetUserAvailabilityRequest, aEvents, true);
		}
		else {
			for (var index in aEvents) {
				var item = this.doAvailability(erGetUserAvailabilityRequest.argument.calId, aEvents[index]);
				items.push(item);
			}
		
			if (erGetUserAvailabilityRequest.listener) {
				erGetUserAvailabilityRequest.listener.onResult(null, items);
			}
		}
	},
	
	getUserAvailabilityRequestError: function _getUserAvailabilityRequestError(erGetUserAvailabilityRequest, aCode, aMsg)
	{
		this.saveCredentials(erGetUserAvailabilityRequest.argument);
		this.notConnected = true;

		if (this.OnlyShowAvailability) {
			this.OnlyShowAvailability = false;
		}
		else {
			if (erGetUserAvailabilityRequest.listener) {
				erGetUserAvailabilityRequest.listener.onResult(null, null);
			}
		}
	},

	resetCalendar: function _resetCalendar()
	{
		if (this.debug) this.logInfo(" resetCalendar 1a");

		try {

		// Clean the job queue.
		this.loadBalancer.clearQueueForCalendar(this.serverUrl, this);
		this.loadBalancer.stopRunningJobsForCalendar(this.serverUrl, this);

		this.offlineQueue = [];

		this.doReset = true;

		this.resetStart = Date.now();

		this.inboxPoller.cancel();

		if (this.offlineTimer) {
			this.offlineTimer.cancel();
		}
		this.offlineTimer = null;

		if (this.calendarPoller) {
			this.calendarPoller.cancel();
		}

dump("\resetCalendar\n");
			var myAuthPrompt2 = Cc["@1st-setup.nl/exchange/authprompt2;1"].getService(Ci.mivExchangeAuthPrompt2);
			myAuthPrompt2.removeUserCanceled(this.serverUrl);
		}catch(err) { dump("\n EROROR:"+err+"\n"); }

		if (this.getProperty("disabled")) {
			// Remove all items in cache from calendar.
			if (this.debug) this.logInfo("Calendar is disabled. So we are done resetting.");
			for (var index in this.itemCache) {
				if (this.itemCache[index]) {
					this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
					this.itemCache[index]= null;
				}
			}
			this.itemCache = [];
			this.recurringMasterCache = [];
			this.doReset = false;
		}
		else {
			this.performReset();
		}
	},

	performReset: function _performReset()
	{
		if (this.debug) this.logInfo(" performReset 1");

		if (!this.doReset) {
			return;
		}

		this.doReset = false;

		// Clean the job queue again.
		this.loadBalancer.clearQueueForCalendar(this.serverUrl, this);

		this.loadBalancer.stopRunningJobsForCalendar(this.serverUrl, this);

		this.offlineQueue = [];

		// Now we can initialize.
		this.syncState = null;
		this.prefs.deleteBranch("syncState");
		this.weAreSyncing = false;
		this.firstSyncDone = false;
		
		// Remove all items in cache from calendar.
		for (var index in this.itemCache) {
			if (this.itemCache[index]) {
				this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
			}
		}

		// Reset caches.
		this.itemCache = [];
		this.recurringMasterCache = [];

		if (this.startDate) {
			var oldBeginDate = this.startDate.clone();
		}
		else {
			if (this.debug) this.logInfo(" THIS IS STRANGE beginDate");
			var oldBeginDate = now();
		}
		if (this.endDate) {
			var oldEndDate = this.endDate.clone();
		}
		else {
			if (this.debug) this.logInfo(" THIS IS STRANGE endDate");
			var oldEndDate = now();
		}

		this.startDate = null;
		this.endDate = null;
	
		// Reload calendar on currently known dateRanges.
		for (var index in this.meetingRequestsCache) {
			if (this.meetingRequestsCache[index]) {
				this.notifyTheObservers("onDeleteItem", [this.meetingRequestsCache[index]]);
				this.removeFromMeetingRequestCache(index);
				//this.meetingRequestsCache[index] = null;
				this.meetingrequestAnswered[index] = false;
			}
		}
		this.meetingRequestsCache = [];
		this.meetingCancelationsCache = [];
		this.meetingrequestAnswered = [];
		this.meetingResponsesCache = [];
		this.syncInboxState = null;
		this.prefs.deleteBranch("syncInboxState");
		this.weAreInboxSyncing = false;

		this.supportsTasks = false;
		this.supportsEvents = false;

		//this.mUseOfflineCache = null;

		this.firstrun = true;

		this.performStartup();

/*		this.checkFolderPath();
		this.getSyncState();
		this.getTimeZones();
*/
		if (this.debug) this.logInfo("oldBeginDate:"+oldBeginDate.toString()+", oldEndDate:"+oldEndDate.toString());
		this.getItems(Ci.calICalendar.ITEM_FILTER_TYPE_TODO +
				Ci.calICalendar.ITEM_FILTER_TYPE_EVENT
				, 0, oldBeginDate, oldEndDate, null);

		// Make an event for thistory.
		this.addActivity(calGetString("calExchangeCalendar", "resetEventMessage", [this.name], "exchangecalendar"), "", this.resetStart, Date.now());
		if (this.debug) this.logInfo(" performReset 2");
	},

	addActivity: function _addActivity(aTitle, aText, aStartDate, aEndDate)
	{
		if (!gActivityManager) {
			return;
		}

		let event = Cc["@mozilla.org/activity-event;1"].createInstance(nsIAE);  
  
		event.init(aTitle,  
		           null,   
		           aText,   
		           aStartDate,     
		           aEndDate);          
  
		gActivityManager.addActivity(event);
	},

	makeRecurrenceRule: function _makeRecurrenceRule(aItem, e)
	{
		if (!aItem.parentItem) {
			return;
		}

		if (!aItem.recurrenceInfo || aItem.parentItem.id != aItem.id) {
			if (!aItem.recurrenceInfo) {
				if (this.debug) this.logInfo("makeRecurrenceRule: We have no recurrenceInfo");
			}
			if (aItem.parentItem.id != aItem.id) {
				if (this.debug) this.logInfo("makeRecurrenceRule: We have aItem.parentItem.id != aItem.id");
			}
			return;
		}

		var rrule = null;
		for each (var ritem in aItem.recurrenceInfo.getRecurrenceItems({})) {
			if (calInstanceOf(ritem, Ci.calIRecurrenceRule)) {
				rrule = ritem;
if (this.debug) this.logInfo(" ;;;; rrule:"+rrule.icalProperty.icalString);
				//break;
			}
		}

		if (!rrule) {
			// XXX exception?
			if (this.debug) this.logInfo("makeRecurrenceRule: We have no rrule");
			return;
		}

		var r = e.addChildTag("Recurrence", "nsTypes", null);

		/* can't get parameters of RRULEs... have to do it manually :/ */
		var prop = {};
		for each (let ps in rrule.icalProperty.value.split(';')) {
			let m = ps.split('=');
			prop[m[0]] = m[1];
		}

		var startDate;
		if (isEvent(aItem)) {
			startDate = aItem.startDate;
		}
		else {
			if (aItem.entryDate) {
				startDate = aItem.entryDate.clone();
				startDate.isDate = false;
			}
		}

		if (startDate) {
			var startDate = startDate.clone();
		}
		else {
			var startDate = cal.now();
		}
		startDate.isDate = true;
	
		prop["BYMONTHDAY"] = prop["BYMONTHDAY"] || startDate.day;
		prop["BYMONTH"] = prop["BYMONTH"] || (startDate.month + 1);

		switch (rrule.type) {
		case 'YEARLY':
			if (prop["BYDAY"]) {
				var m = prop["BYDAY"].match(/^(-?\d)(..)$/);
				var ryr = r.addChildTag("RelativeYearlyRecurrence", "nsTypes", null);
				ryr.addChildTag("DaysOfWeek", "nsTypes", dayRevMap[m[2]]);
				ryr.addChildTag("DayOfWeekIndex", "nsTypes", dayRevMap[m[1]]);
				ryr.addChildTag("Month", "nsTypes", monthIdxMap[prop["BYMONTH"] - 1]);
			} else {
				var ayr = r.addChildTag("AbsoluteYearlyRecurrence", "nsTypes", null);
				ayr.addChildTag("DayOfMonth", "nsTypes", prop["BYMONTHDAY"]);
				ayr.addChildTag("Month", "nsTypes", monthIdxMap[prop["BYMONTH"] - 1]);
			}
			break;
		case 'MONTHLY':
			if (prop["BYDAY"]) {
				var rmr = r.addChildTag("RelativeMonthlyRecurrence", "nsTypes", null);				
				rmr.addChildTag("Interval", "nsTypes", rrule.interval);
				var m = prop["BYDAY"].match(/^(-?\d)(..)$/);
				rmr.addChildTag("DaysOfWeek", "nsTypes", dayRevMap[m[2]]);
				rmr.addChildTag("DayOfWeekIndex", "nsTypes", weekRevMap[m[1]]);
			} else {
				var amr = r.addChildTag("AbsoluteMonthlyRecurrence", "nsTypes", null);
				amr.addChildTag("Interval", "nsTypes", rrule.interval);
				amr.addChildTag("DayOfMonth", "nsTypes", prop["BYMONTHDAY"]);
			}
			break;
		case 'WEEKLY':
			var wr = r.addChildTag("WeeklyRecurrence", "nsTypes", null);
			wr.addChildTag("Interval", "nsTypes", rrule.interval);
			var days = [];
			var daystr = prop["BYDAY"] || dayIdxMap[startDate.weekday];
			for each (let day in daystr.split(",")) {
				days.push(dayRevMap[day]);
			}
			wr.addChildTag("DaysOfWeek", "nsTypes", days.join(' '));
			break;
		case 'DAILY':
			var dr = r.addChildTag("DailyRecurrence", "nsTypes", null);
			dr.addChildTag("Interval", "nsTypes", rrule.interval);
			break;
		}

		if (isEvent(aItem)) {
			var startDateStr = cal.toRFC3339(startDate.getInTimezone(this.globalFunctions.ecUTC()));
		}
		else {
			// We make a non-UTC datetime value for this.globalFunctions.
			// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
			//LOG("  ==== tmpStart:"+cal.toRFC3339(tmpStart));
			var startDateStr = cal.toRFC3339(startDate).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
		}

		if (rrule.isByCount && rrule.count != -1) {
			var nr = r.addChildTag("NumberedRecurrence", "nsTypes", null);
			nr.addChildTag("StartDate", "nsTypes", startDateStr);
			nr.addChildTag("NumberOfOccurrences", "nsTypes", rrule.count);
		} else if (!rrule.isByCount && rrule.untilDate) {

			var endDate = rrule.untilDate.clone();
			if (isEvent(aItem)) {
				endDate.isDate = true;
				var endDateStr = cal.toRFC3339(endDate.getInTimezone(this.globalFunctions.ecUTC()));
			}
			else {
				if (!endDate.isDate) {
					endDate.isDate = true;
					endDate.isDate = false;
					var tmpDuration = cal.createDuration();
					tmpDuration.days = 1;
					endDate.addDuration(tmpDuration);

					endDate.isDate = true;
				}
				var endDateStr = cal.toRFC3339(endDate).substr(0, 19); //cal.toRFC3339(tmpEnd).length-6);
			}
			var edr = r.addChildTag("EndDateRecurrence", "nsTypes", null);
			edr.addChildTag("StartDate", "nsTypes", startDateStr);
			edr.addChildTag("EndDate", "nsTypes", endDateStr);
		} else {
			var ner = r.addChildTag("NoEndRecurrence", "nsTypes", null);
			ner.addChildTag("StartDate", "nsTypes", startDateStr);
		}

		/* We won't write WKST/FirstDayOfWeek for now because it is Exchange 2010 and up */
	},

	getAlarmTime: function _getAlarmTime(aItem)
	{
		if (!aItem) {
			return null;
		}

		var alarms = aItem.getAlarms({});		
		var alarm = alarms[0];		
		if (!alarm) {
			return null;
		}

		switch (alarm.related) {
		case Ci.calIAlarm.ALARM_RELATED_ABSOLUTE:
			var alarmTime = alarm.alarmDate;
			break;
		case Ci.calIAlarm.ALARM_RELATED_START:
			if (isEvent(aItem)) {
				var alarmTime = aItem.startDate.clone();
			}
			else {
				var alarmTime = aItem.entryDate.clone();
			}
			alarmTime.addDuration(alarm.offset);
			break;
		case Ci.calIAlarm.ALARM_RELATED_END:
			if (isEvent(aItem)) {
				var alarmTime = aItem.endDate.clone();
			}
			else {
				var alarmTime = aItem.dueDate.clone();
			}
			alarmTime.addDuration(alarm.offset);
			break;
		}

		alarmTime = alarmTime.getInTimezone(cal.UTC());

		return alarmTime;
	},

	getSingleSnoozeState: function _getSingleSnoozeState(e, aSingle)
	{
		if (this.debug) this.logInfo("getSingleSnoozeState");
		var tmpStr = null;
		var mozSnooze = aSingle.getProperty("X-MOZ-SNOOZE-TIME");
		if (mozSnooze) {
			if (aSingle.alarmLastAck) {
				// We have a X-MOZ-SNOOZE and an alarmLastAck. We are going to check if the LastAck is before the X-MOZ-SNOOZE or after
				if (this.debug) this.logInfo("We have a X-MOZ-SNOOZE and an alarmLastAck. We are going to check if the LastAck is before the X-MOZ-SNOOZE or after.");

				// if mozSnooze < alarmLastAck it means the last alarm has been Acked and it was a dismiss.
				// if mozSnooze >= alarmLastAck it means the last alarm was snoozed to a new alarm time in the future.
				var tmpMozSnooze = cal.createDateTime(mozSnooze);
				if (tmpMozSnooze.compare(aSingle.alarmLastAck) == -1) {
					if (this.debug) this.logInfo("The X-MOZ-SNOOZE is before alarmLastAck. The alarm has been dismissed.");
					tmpStr = "4501-01-01T00:00:00Z";
				}
				else {
					if (this.debug) this.logInfo("The X-MOZ-SNOOZE is after or equal to alarmLastAck. The alarm has been snoozed.");
					tmpStr = mozSnooze;
				}
			}
			else {
				// We have a X-MOZ-SNOOZE and no alarmLastAck. This means we use the X-MOZ-SNOOZE as the next reminder time.
				if (this.debug) this.logInfo("We have a X-MOZ-SNOOZE and no alarmLastAck. This means no snooze or dismiss yet and we use the X-MOZ-SNOOZE as the next reminder time.");
				tmpStr = mozSnooze;
			}
		}
		else {
			if (aSingle.alarmLastAck) {
				// The alarm has been snoozed or dismissed before and we do not have a X-MOZ-SNOOZE. So it is dismissed.
				if (this.debug) this.logInfo("The alarm has been snoozed or dismissed before and we do not have a X-MOZ-SNOOZE. So it is dismissed.");
				tmpStr = "4501-01-01T00:00:00Z";
			}
			else {
				// We have no snooze time and no alarmLastAck this means the alarm was never snoozed or dismissed
				// We set the next reminder to the alarm time.
				if (this.getAlarmTime(aSingle)) {
					if (this.debug) this.logInfo("We have no snooze time and no alarmLastAck this means the alarm was never snoozed or dismissed. We set the next reminder to the alarm time.");
					tmpStr = this.getAlarmTime(aSingle).icalString;
				}
				else {
					if (this.debug) this.logInfo("We have no snooze time and no alarmLastAck this means the alarm was never snoozed or dismissed AND we have no alarm time skipping PidLidReminderSignalTime.");
					tmpStr = null;
				}
			}
		}

		if (tmpStr) {
			if (this.debug) this.logInfo("We have a new PidLidReminderSignalTime:"+tmpStr);
			var eprop = e.addChildTag("ExtendedProperty", "nsTypes", null);
			var extField = eprop.addChildTag("ExtendedFieldURI", "nsTypes", null);
			extField.setAttribute("DistinguishedPropertySetId", "Common");
			extField.setAttribute("PropertyId", MAPI_PidLidReminderSignalTime);
			extField.setAttribute("PropertyType", "SystemTime");

			var newSnoozeTime = cal.createDateTime(tmpStr);
			newSnoozeTime = newSnoozeTime.getInTimezone(cal.UTC());
			eprop.addChildTag("Value", "nsTypes", cal.toRFC3339(newSnoozeTime));
		}

		if (this.debug) this.logInfo("getSingleSnoozeState END");
		return tmpStr;
	},

	getMasterSnoozeStates: function _getMasterSnoozeStates(e, aMaster, aItem)
	{
		if (this.debug) this.logInfo("getMasterSnoozeStates");
		var tmpStr = "";

		if ((aItem) && (aMaster)) {
			if (this.debug) this.logInfo("getMasterSnoozeStates: We have an item (occurrence/exception) and a master.");
			if (aMaster.hasProperty("X-MOZ-SNOOZE-TIME-"+aItem.recurrenceId.nativeTime)) {
				tmpStr = aMaster.getProperty("X-MOZ-SNOOZE-TIME-"+aItem.recurrenceId.nativeTime);
				if (this.debug) this.logInfo("getMasterSnoozeStates: Master has a X-MOZ-SNOOZE-TIME value for this occurrence. startDate:"+aItem.startDate.icalString+", X-MOZ-SNOOZE-TIME:"+tmpStr);
				
				// What value does alarmLastAck has?? This will determine what to send to 
			}
			else {
				if (this.debug) this.logInfo("getMasterSnoozeStates: Master has NO X-MOZ-SNOOZE-TIME value for this occurrence. startDate:"+aItem.startDate.icalString);

				// If alarmLastAck for this item is null then the item was dismissed.
				tmpStr = "";
			}
		}
		else {
			if (aMaster) {
				if (this.debug) this.logInfo("getMasterSnoozeStates: We only have a master and no item. We are going to see if a X-MOZ-SNOOZE-TIME- is set for a child event.");

				// We need to get the event for which the alarm is active.
				var props = aMaster.propertyEnumerator;
				while (props.hasMoreElements()) {
					var prop = props.getNext().QueryInterface(Components.interfaces.nsIProperty);
					if (prop.name.indexOf("X-MOZ-SNOOZE-TIME-") == 0) {
						if (this.debug) this.logInfo("getMasterSnoozeStates: "+prop.name+"="+prop.value);
						tmpStr = prop.value;
						if (this.debug) this.logInfo("getMasterSnoozeStates2: Master has a X-MOZ-SNOOZE-TIME- value. "+prop.name+":"+tmpStr);
						break;
					}
				}

				if (tmpStr == "") {
					if (this.debug) this.logInfo("We did not find a X-MOZ-SNOOZE-TIME- for one of the children.");

					// Nothing smoozed we are going to set it to the next alarm.
					if (this.debug) this.logInfo("We did not find a childEvent by using the X-MOZ-SNOOZE-TIME-. We are going to find the child by the alarmLastAck of the Master. alarmLastAck:"+aMaster.alarmLastAck);
					if (aMaster.alarmLastAck) {
						if (this.debug) this.logInfo("Master has an alarmLastAck. We set the alarm to the first child with an alarm after alarmLastAck.");
						var prevTime = aMaster.alarmLastAck.clone();
					}
					else {
						if (this.debug) this.logInfo("Master has no alarmLastAck. We set the alarm to the first child with an alarm in the future.");
						var prevTime = cal.createDateTime().getInTimezone(cal.UTC());
					}

					var childEvent = null;

					if (this.debug) this.logInfo("Trying to find a child event with an alarmdate after '"+prevTime.icalString+"'");
					var childAlarm = cal.createDateTime("4501-01-01T00:00:00Z");
					for (var index in this.itemCache) {
						if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aMaster.getProperty("X-UID"))) {
							var newChildAlarm = this.getAlarmTime(this.itemCache[index]);
							if ((newChildAlarm) && (newChildAlarm.compare(prevTime) == 1)) {
								if (childAlarm.compare(newChildAlarm) == 1) {
									childAlarm = newChildAlarm.clone();
									childEvent = this.itemCache[index];
									if (this.debug) this.logInfo("Found child event for which the alarmdate ("+childAlarm.icalString+") is set after '"+prevTime.icalString+"'");
								}
							}
						}
					}
					if ((childAlarm) && (childEvent)) {
						if (this.debug) this.logInfo("Found a child and we are going to calculate the alarmLastAck based on it.");
						tmpStr = this.getAlarmTime(childEvent);
						if (tmpStr) {
							tmpStr = tmpStr.icalString;
							if (this.debug) this.logInfo("This child has the following alarm:"+tmpStr);
						}
						else {
							tmpStr = "";
							if (this.debug) this.logInfo("Did not find an alarm time for the child. This is strange..!!");
						}

					}
					else {
						if (this.debug) this.logInfo("We did not find a child. Unable to set alarmLastAck... Maybe set it to 4501-01-01T00:00:00Z");
						tmpStr = "4501-01-01T00:00:00Z";
					}
				}
			}
			else {
				if (this.debug) this.logInfo("Only an item was specified. This is odd this should never happen. Bailing out.");
				return;
			}
		}

		if (tmpStr != "") {
			var eprop = e.addChildTag("ExtendedProperty", "nsTypes", null);

			var extField = eprop.addChildTag("ExtendedFieldURI", "nsTypes", null);
			extField.setAttribute("DistinguishedPropertySetId", "Common");
			extField.setAttribute("PropertyId", MAPI_PidLidReminderSignalTime);
			extField.setAttribute("PropertyType", "SystemTime");
			
			var newSnoozeTime = cal.createDateTime(tmpStr);
			newSnoozeTime = newSnoozeTime.getInTimezone(cal.UTC());
			eprop.addChildTag("Value", "nsTypes", cal.toRFC3339(newSnoozeTime));
		}
		if (this.debug) this.logInfo("getMasterSnoozeStates END");
		return tmpStr;
	},

	getAlarmLastAck: function _getAlarmLastAck(e, aItem)
	{
		if (this.debug) this.logInfo("getAlarmLastAck");
		var tmpStr = "";
		return tmpStr;
	},

	addSnoozeDismissState: function _addSnoozeDismissState(e, aItem, aAlarmTime)
	{
		// Check if we have a single item or not
		var tmpStr = this.getAlarmLastAck(e, aItem);

		if (this.debug) this.logInfo("addSnoozeDismissState: Start1");

		if (aAlarmTime) {
			if (this.debug) this.logInfo("addSnoozeDismissState: item has alarms");

			var tmpDateTime;
			var nextReminder = "";

			if ((aItem.id != aItem.parentItem.id) && (aItem.parentItem.recurrenceInfo)) {
				if (this.debug) this.logInfo("addSnoozeDismissState: Occurrence or Exception");
				// Find out which one got snoozed/dismisses
				tmpStr = tmpStr + this.getMasterSnoozeStates(e, aItem.parentItem, aItem);
			}
			else {
				if (aItem.recurrenceInfo) {
					if (this.debug) this.logInfo("addSnoozeDismissState: Master");
					tmpStr = tmpStr + this.getMasterSnoozeStates(e, aItem, null);
				}
				else {
					if (this.debug) this.logInfo("addSnoozeDismissState: Single");
					nextReminder = this.getSingleSnoozeState(e, aItem)
					tmpStr = tmpStr + nextReminder;
				}

			}

			var eprop = e.addChildTag("ExtendedProperty", "nsTypes", null);

			var extField = eprop.addChildTag("ExtendedFieldURI", "nsTypes", null);
			extField.setAttribute("DistinguishedPropertySetId", "Common");
			extField.setAttribute("PropertyId", MAPI_PidLidReminderSet);
			extField.setAttribute("PropertyType", "Boolean");
		//	if (nextReminder.indexOf("4501-01-01T00:00:00Z") > -1) {
				// Reminder is turned off.
		//		eprop.nsTypes::Value = "false";
		//	}
		//	else {
				eprop.addChildTag("Value", "nsTypes", "true");
		//	}
		}
		else {
			if (this.debug) this.logInfo("addSnoozeDismissState: item has no alarms");

			var eprop = e.addChildTag("ExtendedProperty", "nsTypes", null);
			
			var extField = eprop.addChildTag("ExtendedFieldURI", "nsTypes", null);
			extField.setAttribute("DistinguishedPropertySetId", "Common");
			extField.setAttribute("PropertyId", MAPI_PidLidReminderSet);
			extField.setAttribute("PropertyType", "Boolean");
			eprop.addChildTag("Value", "nsTypes", "false");
		}

		if (this.debug) this.logInfo("addSnoozeDismissState: End:"+tmpStr);

		return tmpStr;
	},

	convertCalAppointmentToExchangeAppointment: function _convertCalAppointmentToExchangeAppointment(aItem, aAction, isNew)
	{
		if (!aAction) {
			aAction = "modify";
		}

		// The order in which create items are specified is important.
		// EWS expects the right order.

		var e = this.globalFunctions.xmlToJxon('<nsTypes:CalendarItem xmlns:nsTypes="'+nsTypesStr+'" xmlns:nsMessages="'+nsMessagesStr+'"/>');

		e.addChildTag("Subject", "nsTypes", aItem.title);

		const privacies = { "PUBLIC": "Normal",
				"CONFIDENTIAL": "Confidential", 
				"PRIVATE" : "Private",
				null: "Normal" };
		
		if (privacies[aItem.privacy] == undefined) {
			e.addChildTag("Sensitivity", "nsTypes", "Normal");
		}
		else {
			e.addChildTag("Sensitivity", "nsTypes", privacies[aItem.privacy]);
		}

		var body = e.addChildTag("Body", "nsTypes", aItem.getProperty('DESCRIPTION') || "");
		body.setAttribute("BodyType", "Text");

		var categories = aItem.getCategories({});
		var categoriesTag = e.addChildTag("Categories", "nsTypes", null);
		for each (var category in categories) {
			categoriesTag.addChildTag("String", "nsTypes", category);
		}
	
		var importance = "Normal";
		if (aItem.priority > 5) {
			importance = "Low";
		}
		if (aItem.priority == 5) {
			importance = "Normal";
		}
		if (aItem.priority < 5) {
			importance = "High";
		}
		if (aItem.priority == 0) {
			importance = "Normal";
		}
		e.addChildTag("Importance", "nsTypes", importance);

		if (aItem.alarmLastAck) {
			if (this.debug) this.logInfo("[[[[[[[[[[[ alarmLastAck:"+aItem.alarmLastAck.icalString+"]]]]]]]]]]]]]]]]]]]");
		}
		else {
			if (this.debug) this.logInfo("[[[[[[[[[[[ alarmLastAck:null]]]]]]]]]]]]]]]]]]]");
		}

		// Precalculate right start and end time for exchange.
		// If not timezone specified set them to the lightning preference.
		if ((aItem.startDate.timezone.isFloating) && (!aItem.startDate.isDate)) {
			aItem.startDate = aItem.startDate.getInTimezone(this.globalFunctions.ecDefaultTimeZone());
		}

		if ((aItem.endDate.timezone.isFloating) && (!aItem.endDate.isDate)) {
			aItem.endDate = aItem.endDate.getInTimezone(this.globalFunctions.ecDefaultTimeZone());
		}

		var tmpStart = aItem.startDate.clone();
		var tmpEnd = aItem.endDate.clone();

		if (aItem.startDate.isDate) {
			tmpStart.isDate = false;
			tmpEnd.isDate = false;
			var tmpDuration = cal.createDuration();
			tmpDuration.minutes = -1;
			tmpEnd.addDuration(tmpDuration);

			// We make a non-UTC datetime value for this.globalFunctions.
			// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
			var exchStart = cal.toRFC3339(tmpStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
			var exchEnd = cal.toRFC3339(tmpEnd).substr(0, 19); //cal.toRFC3339(tmpEnd).length-6);
		}
		else {
			// We set in bias advanced to UCT datetime values for this.globalFunctions.
			var exchStart = cal.toRFC3339(tmpStart);
			var exchEnd = cal.toRFC3339(tmpEnd);
		}

		var masterAlarmOn = true;
		if ((aItem.id == aItem.parentItem.id) && (aItem.recurrenceInfo)) {
			// This is a master we need the alarm date for the active child
			// We get this by analyzing the X-MOZ-SNOOZE-STATE or the alarmLastAck date.
			if (this.debug) this.logInfo("We are converting a Cal master to an Exchange master");

			if (this.debug) this.logInfo("We are going to find for which child an alarm might have been snoozed (X-MOZ-SNOOZE-TIME- is set).");
			var childEvent = null;
			var props = aItem.propertyEnumerator;
			while (props.hasMoreElements()) {
				var prop = props.getNext().QueryInterface(Components.interfaces.nsIProperty);
				if (prop.name.indexOf("X-MOZ-SNOOZE-TIME-") == 0) {
					if (this.debug) this.logInfo("Cal Master has a X-MOZ-SNOOZE-TIME- value. "+prop.name+":"+prop.value);

					// We are going to find the child with specified recurrenId.nativeTime.
					if (this.debug) this.logInfo("We are going to find the child with specified recurrenId.nativeTime.");
					for (var index in this.itemCache) {
						if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aItem.getProperty("X-UID")) &&
						    (this.itemCache[index].recurrenceId.nativeTime == prop.name.substr(18))) {
							if (this.debug) this.logInfo("Found child event for which the X-MOZ-SNOOZE-TIME- is set on the master.");
							childEvent = this.itemCache[index];
							break;
						}
					}

					break;
				}
			}

			if (! childEvent) {
				if (this.debug) this.logInfo("We did not find a childEvent by using the X-MOZ-SNOOZE-TIME-. We are going to find the child by the alarmLastAck of the Master. alarmLastAck:"+aItem.alarmLastAck);
				if (aItem.alarmLastAck) {
					if (this.debug) this.logInfo("Master has an alarmLastAck. We set the alarm to the first child with an alarm after alarmLastAck.");
					var prevTime = aItem.alarmLastAck.clone();
				}
				else {
					if (this.debug) this.logInfo("Master has no alarmLastAck. We set the alarm to the first child with an alarm in the future.");
					var prevTime = cal.createDateTime().getInTimezone(cal.UTC());
				}

				if (this.debug) this.logInfo("Trying to find a child event with an alarmdate after '"+prevTime.icalString+"'");
				var childAlarm = cal.createDateTime("4501-01-01T00:00:00Z");
				for (var index in this.itemCache) {
					if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aItem.getProperty("X-UID"))) {
						var newChildAlarm = this.getAlarmTime(this.itemCache[index]);
						if ((newChildAlarm) && (newChildAlarm.compare(prevTime) == 1)) {
							if (childAlarm.compare(newChildAlarm) == 1) {
								childAlarm = newChildAlarm.clone();
								childEvent = this.itemCache[index];
								if (this.debug) this.logInfo("Found child event for which the alarmdate ("+childAlarm.icalString+") is set after '"+prevTime.icalString+"'");
							}
						}
					}
				}
			}
 
			if (childEvent) {
				if (this.debug) this.logInfo("We found a child event and we are going to use it's alarm settings for the master.");
				var alarmTime = this.getAlarmTime(childEvent);
				var childStart = childEvent.startDate.clone();
				masterAlarmOn = true;
				var alarmEvent = childEvent;
				if (childEvent.startDate.isDate) {
					
					childStart.isDate = false;
					// We make a non-UTC datetime value for this.globalFunctions.
					// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
					var exchAlarmStart = cal.toRFC3339(childStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
				}
				else {
					// We set in bias advanced to UCT datetime values for this.globalFunctions.
					var exchAlarmStart = cal.toRFC3339(childStart);
				}
			}
			else {
				// We did not find an child with an alarm active...!!!
				if (this.debug) this.logInfo("We did not find an child with an alarm active. Trying to find last child event with an alarmdate.");
				// We need to get the last child in line. Use that alarm and set alarmLastAck way into the futur...
				var childAlarm = cal.createDateTime("1970-01-01T00:00:00Z");
				for (var index in this.itemCache) {
					if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aItem.getProperty("X-UID"))) {

							if (this.debug) this.logInfo(" !!!! this.getAlarmTime(this.itemCache[index])="+this.getAlarmTime(this.itemCache[index]));

						var newChildAlarm = this.getAlarmTime(this.itemCache[index]);
						if ((newChildAlarm) && (newChildAlarm.compare(childAlarm) == 1)) {
							childAlarm = newChildAlarm.clone();
							childEvent = this.itemCache[index];
							if (this.debug) this.logInfo("Found child event with an alarm date. ("+childAlarm.icalString+")");
						}
					}
				}

				if (childEvent) {
					if (this.debug) this.logInfo("We found the last child in line which has an alarm.");
					var alarmTime = this.getAlarmTime(childEvent);
					var childStart = childEvent.startDate.clone();
					masterAlarmOn = true;
					var alarmEvent = childEvent;
					if (childEvent.startDate.isDate) {
					
						childStart.isDate = false;
						// We make a non-UTC datetime value for this.globalFunctions.
						// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
						var exchAlarmStart = cal.toRFC3339(childStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
					}
					else {
						// We set in bias advanced to UCT datetime values for this.globalFunctions.
						var exchAlarmStart = cal.toRFC3339(childStart);
					}
				}
				else {
					if (this.debug) this.logInfo("We did not find a child event with an alarm. This is odd. We are going to see if the master has the alarm set on and use that.");
					var masterAlarm = this.getAlarmTime(aItem);
					if (masterAlarm) {
						if (this.debug) this.logInfo("The master has an alarm. We are going to use this one.");
						var alarmTime = this.getAlarmTime(aItem);
						var childStart = aItem.startDate.clone();
						masterAlarmOn = true;
						var alarmEvent = aItem;
						if (aItem.startDate.isDate) {
					
							childStart.isDate = false;
							// We make a non-UTC datetime value for this.globalFunctions.
							// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
							var exchAlarmStart = cal.toRFC3339(childStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
						}
						else {
							// We set in bias advanced to UCT datetime values for this.globalFunctions.
							var exchAlarmStart = cal.toRFC3339(childStart);
						}
					}
					else {
						if (this.debug) this.logInfo("The master does not have an alarm. We are going to turn it off.");
						masterAlarmOn = false; 
					}
				}
			}
		}
		else {
			if (this.debug) this.logInfo("We are converting a Cal single/occurrence/exception to an Exchange single/occurrence/exception");
			var exchAlarmStart = exchStart;
			var alarmTime = this.getAlarmTime(aItem);
			masterAlarmOn = true;
			var alarmEvent = aItem;
		}

		if ((alarmTime) && (masterAlarmOn)) {
			if (this.debug) this.logInfo("alarmTime = "+alarmTime.toString());

			if (this.debug) this.logInfo("length="+alarmEvent.getAlarms({}).length);

			// Lightning event can have multiple alarms. Exchange only one.
			for each(var alarm in alarmEvent.getAlarms({})) {
				break;
			}

			// Exchange alarm is always an offset to the start.
			switch (alarm.related) {
			case Ci.calIAlarm.ALARM_RELATED_ABSOLUTE:
				if (this.debug) this.logInfo("ALARM_RELATED_ABSOLUTE we are going to calculate a offset from the start.");
				var newAlarmTime = alarm.alarmDate.clone();

				// Calculate offset from start of item.
				var offset = newAlarmTime.subtractDate(alarmEvent.startDate);
				break;
			case Ci.calIAlarm.ALARM_RELATED_START:
				if (this.debug) this.logInfo("ALARM_RELATED_START this is easy exchange does the same.");
				var newAlarmTime = alarmEvent.startDate.clone();
				var offset = alarm.offset.clone();
				break;
			case Ci.calIAlarm.ALARM_RELATED_END:
				if (this.debug) this.logInfo("ALARM_RELATED_END we are going to calculate the offset from the start.");
				var newAlarmTime = aItem.endDate.clone();
				newAlarmTime.addDuration(alarm.offset);

				var offset = newAlarmTime.subtractDate(alarmEvent.startDate);
				break;
			}
	
			e.addChildTag("ReminderDueBy", "nsTypes", exchAlarmStart);
			e.addChildTag("ReminderIsSet", "nsTypes", "true");
			if (offset.inSeconds != 0) {
				e.addChildTag("ReminderMinutesBeforeStart", "nsTypes", String((offset.inSeconds / 60) * -1));
			}
			else {
				e.addChildTag("ReminderMinutesBeforeStart", "nsTypes", "0");
			}

		}
		else {
			e.addChildTag("ReminderIsSet", "nsTypes", "false");
		}

		// Save snooze/dismiss state
		this.addSnoozeDismissState(e, aItem, alarmTime);

		if (aItem.getProperty("X-UID")) {
			e.addChildTag("UID", "nsTypes", aItem.getProperty("X-UID"));
		}
		else {
// TODO: Check if this is still valid..
			if (aItem.id) {
				// This is when we accept and an iTIP
				e.addChildTag("UID", "nsTypes", aItem.id);
				aItem.setProperty("X-UID", aItem.id);
				if (aItem.currenceInfo) {
					if (this.debug) this.logInfo("we have recurrence info");
					aItem.setProperty("X-CalendarItemType", "RecurringMaster");
					this.recurringMasterCache[aItem.id] = aItem;
				}
				else {
					aItem.setProperty("X-CalendarItemType", "Single");
				}
			}
		}

		const freeBusy = { "TRANSPARENT": "Free",
				  "OPAQUE": "Busy",
				  null: "Busy" };

		const attendeeStatus = {
			"NEEDS-ACTION"	: "Unknown",
			"TENTATIVE"	: "Tentative",
			"ACCEPTED"	: "Accept",
			"DECLINED"	: "Decline",
			null		: "Unknown"
		};

		if (!this.isInvitation(aItem, true)) {
			e.addChildTag("Start", "nsTypes", exchStart);
			e.addChildTag("End", "nsTypes", exchEnd);

			e.addChildTag("IsAllDayEvent", "nsTypes", aItem.startDate.isDate);
	
			e.addChildTag("LegacyFreeBusyStatus", "nsTypes", freeBusy[aItem.getProperty("TRANSP")]);
	
			e.addChildTag("Location", "nsTypes", aItem.getProperty("LOCATION") || "");

			var attendees = aItem.getAttendees({});
			var ae;
			
			for each (var attendee in attendees) {
				switch (attendee.role) {
				case "REQ-PARTICIPANT":
					if (!reqAttendees) {
						var reqAttendees = e.addChildTag("RequiredAttendees", "nsTypes", null);
					}
					ae = reqAttendees.addChildTag("Attendee", "nsTypes", null);
					break;
				case "OPT-PARTICIPANT":
					if (!optAttendees) {
						var optAttendees = e.addChildTag("OptionalAttendees", "nsTypes", null);
					}
					ae = optAttendees.addChildTag("Attendee", "nsTypes", null);
					break;
				}
				var mailbox = ae.addChildTag("Mailbox", "nsTypes", null);
				mailbox.addChildTag("Name", "nsTypes", attendee.commonName);

				var tmpEmailAddress = attendee.id.replace(/^mailto:/, '');
				if (tmpEmailAddress.indexOf("@") > 0) {
					mailbox.addChildTag("EmailAddress", "nsTypes", tmpEmailAddress);
				}
				else {
					mailbox.addChildTag("EmailAddress", "nsTypes", "unknown@somewhere.com");
				}
				ae.addChildTag("ResponseType", "nsTypes", attendeeStatus[attendee.participationStatus]);
			}

			this.makeRecurrenceRule(aItem, e);
	
			if (this.isVersion2007) {
				e.addChildTag("MeetingTimeZone", "nsTypes", null).setAttribute("TimeZoneName", this.getEWSTimeZoneId(tmpStart.timezone));
			}
			else {
				e.addChildTag("StartTimeZone", "nsTypes", null).setAttribute("Id", this.getEWSTimeZoneId(tmpStart.timezone));
				e.addChildTag("EndTimeZone", "nsTypes", null).setAttribute("Id", this.getEWSTimeZoneId(tmpEnd.timezone));
			}

		}
		else {
			//if (this.debug) this.logInfo("convertCalAppointmentToExchangeAppointment: "+String(e));

			//return e;
			
			if ((aItem.hasProperty("X-exchangeITIP1")) && (aItem.getProperty("X-exchangeITIP1") == "true")) {
				if (this.debug) this.logInfo("This is a message which came from an import or an copy/paste operation or is an invitation from an external party outside our Exchange.");

				e.addChildTag("Start", "nsTypes", exchStart);
				e.addChildTag("End", "nsTypes", exchEnd);

				e.addChildTag("IsAllDayEvent", "nsTypes", aItem.startDate.isDate);
	
				e.addChildTag("LegacyFreeBusyStatus", "nsTypes", freeBusy[aItem.getProperty("TRANSP")]);
					
				e.addChildTag("Location", "nsTypes", aItem.getProperty("LOCATION") || "");

				// Set if the item is from the user itself or not.
				if (aItem.organizer) {
					if (aItem.organizer.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()) {
						if (this.debug) this.logInfo(" ## I am the organizer of this meeting.");
					}
					else {
						if (this.debug) this.logInfo(" ## I am NOT the organizer of this meeting.'"+aItem.organizer.id.replace(/^mailto:/, '')+"' is the organizer.");
					}
				}
				else {
					if (this.debug) this.logInfo(" ## There is not organizer for this meeting.");
				}
		

				this.makeRecurrenceRule(aItem, e);
	
				if (this.isVersion2007) {
					e.addChildTag("MeetingTimeZone", "nsTypes", null).setAttribute("TimeZoneName", this.getEWSTimeZoneId(tmpStart.timezone));
				}
				else {
					e.addChildTag("StartTimeZone", "nsTypes", null).setAttribute("Id", this.getEWSTimeZoneId(tmpStart.timezone));
					e.addChildTag("EndTimeZone", "nsTypes", null).setAttribute("Id", this.getEWSTimeZoneId(tmpEnd.timezone));
				}

			}
		}

		if (this.debug) this.logInfo("convertCalAppointmentToExchangeAppointment: "+String(e));

		return e;
	},

	convertCalTaskToExchangeTask: function _convertCalTaskToExchangeTask(aItem, aAction)
	{
		if (!aAction) {
			aAction = "modify";
		}

		var e = this.globalFunctions.xmlToJxon('<nsTypes:Task xmlns:nsTypes="'+nsTypesStr+'" xmlns:nsMessages="'+nsMessagesStr+'"/>');

		e.addChildTag("Subject", "nsTypes", aItem.title);

		const privacies = { "PUBLIC": "Normal",
				"CONFIDENTIAL": "Confidential", 
				"PRIVATE" : "Private",
				null: "Normal" };
		if (!aItem.privacy) {
			e.addChildTag("Sensitivity", "nsTypes", "Normal");
		}
		else {
			e.addChildTag("Sensitivity", "nsTypes", privacies[aItem.privacy]);
		}

		var body = e.addChildTag("Body", "nsTypes", aItem.getProperty('DESCRIPTION') || "");
		body.setAttribute("BodyType", "Text");

		var categories = aItem.getCategories({});
		var categoriesTag = null;
		for each (var category in categories) {
			if (categoriesTag == null) {
				categoriesTag = e.addChildTag("Categories", "nsTypes", null);
			}
			categoriesTag.addChildTag("String", "nsTypes", category);
		}
	
		var importance = "Normal";
		if (aItem.priority > 5) {
			importance = "Low";
		}
		if (aItem.priority == 5) {
			importance = "Normal";
		}
		if (aItem.priority < 5) {
			importance = "High";
		}
		if (aItem.priority == 0) {
			importance = "Normal";
		}
		e.addChildTag("Importance", "nsTypes", importance);
		 

		var alarmTime = this.getAlarmTime(aItem);
		if (alarmTime) {
			if (this.debug) this.logInfo("alarmTime = "+alarmTime.toString());

			// For tasks in exchange we set the remindeminutebforestart always to 0 and reminderdueby to the alarm time.
			var alarm = aItem.getAlarms({})[0];
			switch (alarm.related) {
			case Ci.calIAlarm.ALARM_RELATED_ABSOLUTE:
				var newAlarmTime = alarm.alarmDate.clone();
				break;
			case Ci.calIAlarm.ALARM_RELATED_START:
				var newAlarmTime = aItem.entryDate.clone();
				newAlarmTime.addDuration(alarm.offset);
				break;
			case Ci.calIAlarm.ALARM_RELATED_END:
				var newAlarmTime = aItem.dueDate.clone();
				newAlarmTime.addDuration(alarm.offset);
				break;
			}
	
			if (newAlarmTime) {
				e.addChildTag("ReminderDueBy", "nsTypes", cal.toRFC3339(newAlarmTime));
			}

			e.addChildTag("ReminderIsSet", "nsTypes", "true");
			e.addChildTag("ReminderMinutesBeforeStart", "nsTypes", "0");
		}
		else {
			e.addChildTag("ReminderIsSet", "nsTypes", "false");
		}

		// Save snooze/dismiss state
		this.addSnoozeDismissState(e, aItem, alarmTime);

		// Delegation changes
		if (aItem.hasProperty("X-exchWebService-PidLidTaskLastUpdate")) {
			var eprop = e.addChildTag("ExtendedProperty", "nsTypes", null);
			var extField = eprop.addChildTag("ExtendedFieldURI", "nsTypes", null);
			extField.setAttribute("DistinguishedPropertySetId", "Task");
			extField.setAttribute("PropertyId", "33045");
			extField.setAttribute("PropertyType", "SystemTime");
			eprop.addChildTag("Value", "nsTypes", aItem.getProperty("X-exchWebService-PidLidTaskLastUpdate"));
		}

		if (aItem.hasProperty("X-exchWebService-PidLidTaskHistory")) {
			var eprop = e.addChildTag("ExtendedProperty", "nsTypes", null);
			var extField = eprop.addChildTag("ExtendedFieldURI", "nsTypes", null);
			extField.setAttribute("DistinguishedPropertySetId", "Task");
			extField.setAttribute("PropertyId", "33050");
			extField.setAttribute("PropertyType", "Integer");
			eprop.addChildTag("Value", "nsTypes", aItem.getProperty("X-exchWebService-PidLidTaskHistory"));
		}

		if (aItem.hasProperty("X-exchWebService-PidLidTaskAccepted")) {
			var eprop = e.addChildTag("ExtendedProperty", "nsTypes", null);
			var extField = eprop.addChildTag("ExtendedFieldURI", "nsTypes", null);
			extField.setAttribute("DistinguishedPropertySetId", "Task");
			extField.setAttribute("PropertyId", "33032");
			extField.setAttribute("PropertyType", "Boolean");
			eprop.addChildTag("Value", "nsTypes", aItem.getProperty("X-exchWebService-PidLidTaskAccepted"));
		}


		if (aItem.completedDate) {

			tmpStart = aItem.completedDate.clone();

			if (tmpStart.timezone.isFloating) {
				tmpStart = tmpStart.getInTimezone(this.globalFunctions.ecDefaultTimeZone());
			}

			tmpStart = tmpStart.getInTimezone(this.globalFunctions.ecUTC());

			tmpStart.isDate = true;
			tmpStart.isDate = false;
		/*	var tmpDuration = cal.createDuration();
			tmpDuration.minutes = -1;
			tmpStart.addDuration(tmpDuration);*/

			e.addChildTag("CompleteDate", "nsTypes", cal.toRFC3339(tmpStart));
		}


//		if ((!aItem.parentItem.id) ||
//		    (!aItem.recurrenceInfo)) {
		if (aItem.dueDate) {
			if (aItem.dueDate.timezone.isFloating) {
				aItem.dueDate = aItem.dueDate.getInTimezone(this.globalFunctions.ecDefaultTimeZone());
			}

			e.addChildTag("DueDate", "nsTypes", cal.toRFC3339(aItem.dueDate));
		}
		if (aItem.percentComplete) {
			e.addChildTag("PercentComplete", "nsTypes", aItem.percentComplete);
		}
//}

		this.makeRecurrenceRule(aItem, e);

//		if ((!aItem.parentItem.id) ||
//		    (!aItem.recurrenceInfo)) {

			if (aItem.entryDate) {
				if (aItem.entryDate.timezone.isFloating) {
					aItem.entryDate = aItem.entryDate.getInTimezone(this.globalFunctions.ecDefaultTimeZone());
				}

				e.addChildTag("StartDate", "nsTypes", cal.toRFC3339(aItem.entryDate));
			}
//		}

		const statuses = { "NONE": "NotStarted",
				"IN-PROCESS": "InProgress", 
				"COMPLETED" : "Completed",
				"NEEDS-ACTION" : "WaitingOnOthers",
				"CANCELLED" : "Deferred",
				null: "NotStarted" };
		if (!statuses[aItem.status]) {
			e.addChildTag("Status", "nsTypes", "NotStarted");
		}
		else {
			e.addChildTag("Status", "nsTypes", statuses[aItem.status]);
		}

		if (this.debug) this.logInfo("!!CHANGED:"+String(e));

		return e;
	},


	createItemOk: function _createItemOk(erCreateItemRequest, aId, aChangeKey)
	{
		this.notConnected = false;
		this.saveCredentials(erCreateItemRequest.argument);
		if (this.debug) this.logInfo("createItemOk 1");

		// Check if we have attachmentsUpdates
		if ((erCreateItemRequest.argument.attachmentsUpdates) && (erCreateItemRequest.argument.attachmentsUpdates.create.length > 0)) {
			if (this.debug) this.logInfo("createItemOk We have "+erCreateItemRequest.argument.attachmentsUpdates.create.length+" attachments to create.");
			var self = this;
			this.addToQueue( erCreateAttachmentRequest,
				{user: this.user, 
				 serverUrl: this.serverUrl,
				 item: erCreateItemRequest.argument.item,
				 parentItemId: aId,
				 parentItemChangeKey: aChangeKey, 
				 attachmentsUpdates: erCreateItemRequest.argument.attachmentsUpdates,
				 actionStart: Date.now(),
				 sendto: erCreateItemRequest.argument.sendto}, 
				function(erCreateAttachmentRequest, attachmentId, RootItemId, RootItemChangeKey) { self.createAttachmentOk(erCreateAttachmentRequest, attachmentId, RootItemId, RootItemChangeKey);}, 
				function(erCreateAttachmentRequest, aCode, aMsg) { self.createAttachmentError(erCreateAttachmentRequest, aCode, aMsg);},
				erCreateItemRequest.listener);
		}
		else {
			if (this.debug) this.logInfo("createItemOk We have no attachments to create.");

			if (erCreateItemRequest.listener) {
				this.notifyOperationComplete(erCreateItemRequest.listener,
				      Cr.NS_OK,
				      Ci.calIOperationListener.ADD,
				      erCreateItemRequest.argument.item.id,
				      erCreateItemRequest.argument.item);
			}

		}

		// Make an event for thistory.
		if (isEvent(erCreateItemRequest.argument.item)) {
			this.addActivity(calGetString("calExchangeCalendar", "addCalendarEventMessage", [erCreateItemRequest.argument.item.title, this.name], "exchangecalendar"), "", erCreateItemRequest.argument.actionStart, Date.now());
		}
		else {
			//this.notifyTheObservers("onAddItem", [newItem]);
			this.addActivity(calGetString("calExchangeCalendar", "addTaskEventMessage", [erCreateItemRequest.argument.item.title, this.name], "exchangecalendar"), "", erCreateItemRequest.argument.actionStart, Date.now());
		}


		// We do a refresh to get all details of the new item which EWS added.
		if ((! erCreateItemRequest.argument.attachmentsUpdates) || (erCreateItemRequest.argument.attachmentsUpdates.create.length == 0)) {
			this.refresh();
		}
	},

	createAttachmentOk: function _createAttachmentOk(erCreateAttachmentRequest, attachmentId, RootItemId, RootItemChangeKey)
	{
		if (this.debug) this.logInfo("createAttachmentOk");
		this.notConnected = false;

		if (erCreateAttachmentRequest.argument.attachmentsUpdates.delete.length > 0) {
			if (this.debug) this.logInfo("We also need to delete some attachments: count="+erCreateAttachmentRequest.argument.attachmentsUpdates.delete.length);
			var self = this;
			this.addToQueue( erDeleteAttachmentRequest,
				{user: this.user, 
				 serverUrl: this.serverUrl,
				 item: erCreateAttachmentRequest.argument.item,
				 parentItemId: RootItemId,
				 parentItemChangeKey: RootItemChangeKey, 
				 attachmentsUpdates: erCreateAttachmentRequest.argument.attachmentsUpdates,
				 sendto: erCreateAttachmentRequest.argument.sendto,
				 actionStart: Date.now()}, 
				function(erDeleteAttachmentRequest, aId, aChangeKey) { self.deleteAttachmentOk(erDeleteAttachmentRequest, aId, aChangeKey);}, 
				function(erDeleteAttachmentRequest, aCode, aMsg) { self.deleteAttachmentError(erDeleteAttachmentRequest, aCode, aMsg);},
				erCreateAttachmentRequest.listener);
			return;
		}
		else {
			if (this.debug) this.logInfo("We have no attachment deletions.");
			if ((erCreateAttachmentRequest.argument.sendto) && ((erCreateAttachmentRequest.argument.sendto != "sendtonone"))) {
				// The item we processed was a meeting of which I'm the organiser.
				// It contained new attachments and we need to send an item update to get it to the invited.
				if (this.debug) this.logInfo("We had attachment changes and it is a meeting for which we are the organiser send the changed item to the others as specified:"+erCreateAttachmentRequest.argument.sendto);
				this.doAttachmentUpdatesFinalize(erCreateAttachmentRequest.argument.attachmentsUpdates, erCreateAttachmentRequest.argument.item, RootItemId, RootItemChangeKey, erCreateAttachmentRequest.argument.sendto, erCreateAttachmentRequest.listener);
				return;
			}
			else {
				if (this.debug) this.logInfo("createAttachmentOk erCreateAttachmentRequest.argument.sendto is not set.");
				if (erCreateAttachmentRequest.listener) {
					this.notifyOperationComplete(erCreateAttachmentRequest.listener,
					      Cr.NS_OK,
					      Ci.calIOperationListener.MODIFY,
					      erCreateAttachmentRequest.argument.item.id,
					      erCreateAttachmentRequest.argument.item);
				}

				this.refresh();
			}
		}
	},

	createAttachmentError: function _createAttachmentError(erDeleteAttachmentRequest, aCode, aMsg)
	{
		if (this.debug) this.logInfo("createAttachmentError: aCode:"+aCode+", aMsg:"+aMsg);
		this.notConnected = true;

	},

	deleteAttachmentOk: function _deleteAttachmentOk(erDeleteAttachmentRequest, aId, aChangeKey)
	{
		if (this.debug) this.logInfo("deleteAttachmentOk");
		this.notConnected = false;

		// See if we need to update the item when it is an invitation to others
		// This to get the invitation uncluding the attachments send out.
		this.addAttachmentsToOfflineCache(erDeleteAttachmentRequest.argument.item);

		if ((erDeleteAttachmentRequest.argument.sendto) && ((erDeleteAttachmentRequest.argument.sendto != "sendtonone"))) {
			// The item we processed was a meeting of which I'm the organiser.
			// It contained new attachments and we need to send an item update to get it to the invited.
			if (this.debug) this.logInfo("We had attachment changes and it is a meeting for which we are the organiser send the changed item to the others as specified:"+erDeleteAttachmentRequest.argument.sendto);
			this.doAttachmentUpdatesFinalize(erDeleteAttachmentRequest.argument.attachmentsUpdates, erDeleteAttachmentRequest.argument.item, aId, aChangeKey, erDeleteAttachmentRequest.argument.sendto, erDeleteAttachmentRequest.listener);
			return;
		}
		else {
			if (erDeleteAttachmentRequest.listener) {
				this.notifyOperationComplete(erDeleteAttachmentRequest.listener,
				      Cr.NS_OK,
				      Ci.calIOperationListener.MODIFY,
				      erDeleteAttachmentRequest.argument.item.id,
				      erDeleteAttachmentRequest.argument.item);
			}

			this.refresh();
		}
	},

	deleteAttachmentError: function _deleteAttachmentError(erCreateAttachmentRequest, aCode, aMsg)
	{
		if (this.debug) this.logInfo("deleteAttachmentError");
		this.notConnected = true;
	},

	makeUpdateOneItem: function _makeUpdateOneItem(aNewItem, aOldItem, aIndex, aMasterId, aMasterChangeKey, aInvitation)
	{
		var upd = this.globalFunctions.xmlToJxon('<nsTypes:ItemChange xmlns:nsTypes="'+nsTypesStr+'"/>');

		if (!aIndex) {
			var itemId = upd.addChildTag("ItemId", "nsTypes", null);
			itemId.setAttribute("Id", aOldItem.id);
			itemId.setAttribute("ChangeKey", aOldItem.getProperty("X-ChangeKey"));			
		}
		else {
			var oItemId = upd.addChildTag("OccurrenceItemId", "nsTypes", null);
			oItemId.setAttribute("RecurringMasterId", aMasterId);
			oItemId.setAttribute("ChangeKey", aMasterChangeKey);
			oItemId.setAttribute("InstanceIndex", aIndex);
		}
	
		var isInvitation = aInvitation;
		if (! aInvitation) {
			isInvitation = false;
		}

		const noDelete = {
			'MeetingTimeZone'		: true,
			'ReminderIsSet'			: true,
			'ReminderMinutesBeforeStart'	: true,
			'ReminderDueBy'			: true,
			'PercentComplete'		: true
		};

		const noUpdateOnInvitation = {
			'RequiredAttendees'		: true,
			'OptionalAttendees'		: true,
			'Organizer'			: true,
		};
	
		var ce = upd.addChildTag("Updates", "nsTypes", null);

		if (isEvent(aOldItem)) {
			var oe = this.convertCalAppointmentToExchangeAppointment(aOldItem, null, false);
			var ne = this.convertCalAppointmentToExchangeAppointment(aNewItem, null, false);
		}
		if (isToDo(aOldItem)) {
			var oe = this.convertCalTaskToExchangeTask(aOldItem);
			var ne = this.convertCalTaskToExchangeTask(aNewItem);
		}
	
		var onlySnoozeChanged = true;
		var ceCount = 0;

		var oeprops = oe.XPath("*");
		var neprops = ne.XPath("*");
		for each (var prop in oeprops) {
			var fullTagName = prop.nameSpace+':'+prop.tagName;
			var neTags = ne.getTags(fullTagName);
			if (neTags.length > 0 || noDelete[prop.tagName]) {
				if (neTags.length > 0) { if (this.debug) this.logInfo("     -- ne.getTags("+fullTagName+").length > 0", 2) };
				if (noDelete[prop.tagName]) { if (this.debug) this.logInfo("     -- noDelete["+prop.tagName+"] == true", 2) };
				continue;
			}

			if ((isInvitation) && (neTags.length > 0 || noUpdateOnInvitation[prop.tagName])) {
				continue;
			}
			neTags = null;

			var de = ce.addChildTag("DeleteItemField", "nsTypes", null);
			if (prop.tagName == "ExtendedProperty") {
				de.addChildTagObject(prop.getTag("nsTypes:ExtendedFieldURI"));
			} else {
				if ((fieldPathMap[prop.tagName] == "calendar") && (isEvent(aOldItem))) {
					de.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", 'calendar:' + prop.tagName);
				}
				else {
					if ((fieldPathMap[prop.tagName] == "calendar") && (isToDo(aOldItem))) {
						de.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", 'task:' + prop.tagName);
					}
					else {
						de.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", fieldPathMap[prop.tagName] + ':' + prop.tagName);
					}
				}

			}
	
			onlySnoozeChanged = false;
			ceCount++;
		}

		var oeStr = oe.toString();
		for each (var prop in neprops) {
			var fullTagName = prop.nameSpace+':'+prop.tagName;
			//if (this.debug) this.logInfo("    ???: neprops: tagName:"+prop.tagName+","+prop.toString());

			if ((isInvitation) && (noUpdateOnInvitation[prop.tagName])) {
				continue;
			}
	
			// Always save lastLightningModified field
			var doSave = false;
			if ((prop.tagName == "ExtendedProperty") &&
				(prop.getAttributeByTag("nsTypes:ExtendedFieldURI", "PropertyName", "") == "lastLightningModified")) {
				//if (this.debug) this.logInfo("    ???: doSave = true for tagName:"+prop.tagName+","+prop.toString());
				doSave = true;
			}

			if (! doSave) {
				if (oeStr.indexOf(prop.toString()) > -1) {
					if (this.debug) this.logInfo( "       !!! Equal to old value:"+prop.toString(), 2);
					continue;
				}
				if (this.debug) this.logInfo( "       !!! NOT EQUAL to old value:"+prop.toString(), 2);
			}
	
			var se = ce.addChildTag("SetItemField", "nsTypes", null);
			if (prop.tagName == "ExtendedProperty") {
				se.addChildTagObject(prop.getTag("nsTypes:ExtendedFieldURI"));

				if ((prop.getAttributeByTag("nsTypes:ExtendedFieldURI", "PropertyId", "") != MAPI_PidLidReminderSignalTime) && 
				    (prop.getAttributeByTag("nsTypes:ExtendedFieldURI", "PropertyId", "") != "34051") &&
				    (prop.getAttributeByTag("nsTypes:ExtendedFieldURI", "PropertyId", "") != "34049")) {
					onlySnoozeChanged = false;
				}
			} else {

				if ((fieldPathMap[prop.tagName] == "calendar") && (isEvent(aOldItem))) {
					onlySnoozeChanged = false;
					se.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", 'calendar:' + prop.tagName);
				}
				else {
					if ((fieldPathMap[prop.tagName] == "calendar") && (isToDo(aOldItem))) {
						onlySnoozeChanged = false;
						se.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", 'task:' + prop.tagName);
					}
					else {
						if ((prop.tagName != "ReminderMinutesBeforeStart") && (prop.tagName != "ReminderIsSet")) {
							onlySnoozeChanged = false;
						}
						se.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", fieldPathMap[prop.tagName] + ':' + prop.tagName);
					}
				}
			}
			var parentTag = null;
			if (isEvent(aOldItem)) {
				parentTag = se.addChildTag("CalendarItem", "nsTypes", null);
			}
			if (isToDo(aOldItem)) {
				parentTag = se.addChildTag("Task", "nsTypes", null);
			}
			parentTag.addChildTagObject(prop);
			ceCount++;
		}
	
		if (onlySnoozeChanged) {
			if (this.debug) this.logInfo("onlySnoozeChanged Or reminder time before start.");
		}

		oeprops = null;
		neprops = null;

		if (ceCount == 0) {
			return {changes: null, onlySnoozeChanged: onlySnoozeChanged};
		}

		return {changes: upd, onlySnoozeChanged: onlySnoozeChanged};
	},

	sendMeetingRespons: function _sendMeetingRespons(aItem, aListener, aItemType, aResponse, aBodyText)
	{
		// Check if I'm the organiser. Do not send to myself.
		if (aItem.organizer) {
			if (aItem.organizer.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()) {
				return true;
			}
		}
		var me = this.getInvitedAttendee(aItem);
		if ((!me) && (!aResponse)) {
			return false;
		}

		if (aResponse) {
			var tmpResponse = aResponse;
		}
		else {
			var tmpResponse = me.participationStatus;
		}

		var messageDisposition = null;

		// First ask the user if he wans to send a response.
		// Get the eventsummarywindow to attach dialog to.
		let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
	                          .getService(Ci.nsIWindowMediator);
		let calWindow = wm.getMostRecentWindow("Calendar:EventSummaryDialog") || cal.getCalendarWindow();

		var preInput= { item: aItem, 
			     response: tmpResponse,
			     answer: ""};

		if (calWindow) {
			calWindow.openDialog("chrome://exchangecalendar/content/preInvitationResponse.xul",
				"preInvitationResponseId",
				"chrome,titlebar,toolbar,centerscreen,dialog,modal=yes,resizable=yes",
				preInput); 
		}

		if (preInput.answer != "send") {
			if (this.debug) this.logInfo("User canceled preInvitationDialog.");
			return false;
		}

		var input= { item: aItem, 
			     response: tmpResponse,
			     answer: "",
			     bodyText: ""};

		if (preInput.response == "edit") {
			// If the user would like to edit his response we show him the window for it.
			if (this.debug) this.logInfo("User indicated he would like to edit response.");
			if (aBodyText) {
				input.bodyText = aBodyText;
				input.answer = "send";
			}

			if ((calWindow) && (!aBodyText)) {
				calWindow.openDialog("chrome://exchangecalendar/content/invitationResponse.xul",
					"invitationResponseId",
					"chrome,titlebar,toolbar,centerscreen,dialog,modal=yes,resizable=yes",
					input); 
			}

			if (input.answer != "send") {
				if (this.debug) this.logInfo("User canceled invitationDialog.");
				return false;
			}

		}
		else {
			if (this.debug) this.logInfo("User indicated he does not want to edit the response.");
			if (preInput.response == "donotsend") {
				if (this.debug) this.logInfo("User indicated he does not want to send a response.");
				messageDisposition = "SaveOnly";
			}
		}
		if (this.debug) this.logInfo("  -------------- messageDisposition="+messageDisposition);

		var self = this;
		this.addToQueue( erSendMeetingResponsRequest,
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: this.folderBase,
			 serverUrl: this.serverUrl,
			 item: aItem,
			 folderID: this.folderID,
			 changeKey: this.changeKey,
			 response: input.response,
			 bodyText: input.bodyText,
			 senderMailbox: this.mailbox,
	 		 actionStart: Date.now(),
			 itemType: aItemType,
			 messageDisposition: messageDisposition}, 
			function(erSendMeetingResponsRequest) { self.sendMeetingResponsOk(erSendMeetingResponsRequest);}, 
			function(erSendMeetingResponsRequest, aCode, aMsg) { self.whichOccurrencegetOccurrenceIndexError(erSendMeetingResponsRequest, aCode, aMsg);},
			aListener);
		return true;
	},

	sendMeetingResponsOk: function _sendMeetingResponsOk(erSendMeetingResponsRequest)
	{
		if (this.debug) this.logInfo("sendMeetingResponsOk");
		this.saveCredentials(erSendMeetingResponsRequest.argument);
		this.notConnected = false;

		if (erSendMeetingResponsRequest.listener) {
		        this.notifyOperationComplete(erSendMeetingResponsRequest.listener,
		                                     Cr.NS_OK,
		                                     Ci.calIOperationListener.MODIFY,
		                                     erSendMeetingResponsRequest.argument.item.id,
		                                     erSendMeetingResponsRequest.argument.item);
		}
		
		if ( !erSendMeetingResponsRequest.argument.item.getProperty("X-MEETINGREQUEST")) {
			//this.notifyTheObservers("onModifyItem", [erSendMeetingResponsRequest.argument.item, this.itemCache[erSendMeetingResponsRequest.argument.item.id]]);
			this.itemCache[erSendMeetingResponsRequest.argument.item.id] = erSendMeetingResponsRequest.argument.item;
		}
		else {
			// From meetingrequest cache. Do not remove meetingrequest from cache this will be done when invitation is removed
			//this.removeFromMeetingRequestCache(erSendMeetingResponsRequest.argument.item.getProperty("X-UID"));
			//this.meetingrequestAnswered[erSendMeetingResponsRequest.argument.item.getProperty("X-UID")] = false;
		}

		this.addActivity(calGetString("calExchangeCalendar", "ewsMeetingResponsEventMessage", [erSendMeetingResponsRequest.argument.item.title, erSendMeetingResponsRequest.argument.response, this.name], "exchangecalendar"), erSendMeetingResponsRequest.argument.bodyText, erSendMeetingResponsRequest.argument.actionStart, Date.now());
		this.refresh();
	},

	modifyItemgetOccurrenceIndexOk: function _modifyItemgetOccurrenceIndexOk(erGetOccurrenceIndexRequest, aIndex, aMasterId, aMasterChangeKey)
	{
		if (this.debug) this.logInfo("modifyItemgetOccurrenceIndexOk");
		this.saveCredentials(erGetOccurrenceIndexRequest.argument);
		this.notConnected = false;

		var changesObj = this.makeUpdateOneItem(erGetOccurrenceIndexRequest.argument.newItem, erGetOccurrenceIndexRequest.argument.masterItem, aIndex, aMasterId, aMasterChangeKey);
		var changes;
		if (changesObj) {
			changes = changesObj.changes;
		}
		if (changes) {

			// We remove the item from cache and calendar because the update request will add
			// it again.

			// bug 13.o when we change an occurrence it will send an updated master
		//	this.notifyTheObservers("onDeleteItem", [this.itemCache[erGetOccurrenceIndexRequest.argument.newItem.id]]);
		//	delete this.itemCache[erGetOccurrenceIndexRequest.argument.newItem.id];
			this.notifyTheObservers("onModifyItem", [erGetOccurrenceIndexRequest.argument.newItem, this.itemCache[erGetOccurrenceIndexRequest.argument.newItem.id]]);
			this.itemCache[erGetOccurrenceIndexRequest.argument.newItem.id] = erGetOccurrenceIndexRequest.argument.newItem;


			var self = this;
			if (this.debug) this.logInfo("modifyItemgetOccurrenceIndexOk: changed:"+String(changes));
			this.addToQueue( erUpdateItemRequest,
				{user: this.user, 
				 mailbox: this.mailbox,
				 folderBase: this.folderBase,
				 serverUrl: this.serverUrl,
				 item: erGetOccurrenceIndexRequest.argument.masterItem,
				 folderID: this.folderID,
				 changeKey: this.changeKey,
				 updateReq: changes,
				 newItem: erGetOccurrenceIndexRequest.argument.newItem,
				 actionStart: Date.now(),
				 attachmentsUpdates: erGetOccurrenceIndexRequest.argument.attachmentsUpdates,
			         sendto: erGetOccurrenceIndexRequest.argument.sendto}, 
				function(erUpdateItemRequest, aId, aChangeKey) { self.updateItemOk(erUpdateItemRequest, aId, aChangeKey);}, 
				function(erUpdateItemRequest, aCode, aMsg) { self.whichOccurrencegetOccurrenceIndexError(erUpdateItemRequest, aCode, aMsg);},
				erGetOccurrenceIndexRequest.listener);
			return;
			
		}
		else {
			if (this.doAttachmentUpdates(erGetOccurrenceIndexRequest.argument.attachmentsUpdates, erGetOccurrenceIndexRequest.argument.masterItem, erGetOccurrenceIndexRequest.argument.sendto, erGetOccurrenceIndexRequest.listener)) {
				if (this.debug) this.logInfo("modifyItemgetOccurrenceIndexOk: Only attachment changes no field changes 3.");
				return;
			}
			else {
				if (this.debug) this.logInfo("modifyItemgetOccurrenceIndexOk: No changes 3.");
				if (!this.isInvitation(erGetOccurrenceIndexRequest.argument.newItem, true)) {
					this.singleModified(erGetOccurrenceIndexRequest.argument.newItem, true);
				}
			}
		}

		if (erGetOccurrenceIndexRequest.listener) {
		        this.notifyOperationComplete(erGetOccurrenceIndexRequest.listener,
		                                     Cr.NS_OK,
		                                     Ci.calIOperationListener.MODIFY,
		                                     erGetOccurrenceIndexRequest.argument.newItem.id,
		                                     erGetOccurrenceIndexRequest.argument.newItem);
		}
	},

	whichOccurrencegetOccurrenceIndexError: function _whichOccurrencegetOccurrenceIndexError(erGetOccurrenceIndexRequest, aCode, aMsg)
	{
		if (this.debug) this.logInfo("whichOccurrencegetOccurrenceIndexError:("+aCode+")"+aMsg);
		this.notConnected = true;
		this.saveCredentials(erGetOccurrenceIndexRequest.argument);

		if ((aCode == -8) && (aMsg="ErrorCalendarIsCancelledForDecline")) {
			if (erGetOccurrenceIndexRequest.listener) {
			        this.notifyOperationComplete(erGetOccurrenceIndexRequest.listener,
			                                     Cr.NS_OK,
			                                     Ci.calIOperationListener.MODIFY,
			                                     erGetOccurrenceIndexRequest.argument.newItem.id,
			                                     erGetOccurrenceIndexRequest.argument.newItem);
			}
			return;
		}

		// TODO: We need to retry when we get here from adoptItem.
//		if ((aCode == -8) && (this.itemCache[erGetOccurrenceIndexRequest.argument.item.id])) {
		if ((aCode == erGetOccurrenceIndexRequest.ER_ERROR_ER_ERROR_SOAP_ERROR) && (this.itemCache[erGetOccurrenceIndexRequest.argument.item.id])) {
			// Probably the item on the EWS server was changed and that
			// update was not received by us yet.
			// Do a refresh en retry modification.
			if (this.debug) this.logInfo("We have a conflict with the server for this update. We are going to refresh and then retry.");
			this.refresh();
			//var newItem = erGetOccurrenceIndexRequest.argument.newItem.clone();
			var newItem = this.cloneItem(erGetOccurrenceIndexRequest.argument.newItem);
			//var oldItem = this.itemCache[erGetOccurrenceIndexRequest.argument.item.id].clone();
			var oldItem = this.cloneItem(this.itemCache[erGetOccurrenceIndexRequest.argument.item.id]);
			if (erGetOccurrenceIndexRequest.argument.item.getProperty("X-RetryCount")) {
				oldItem.setProperty("X-RetryCount", erGetOccurrenceIndexRequest.argument.item.getProperty("X-RetryCount")+1);
			}
			else {
				oldItem.setProperty("X-RetryCount", 1);
			}

			if (this.debug) this.logInfo("X-RetryCount="+oldItem.getProperty("X-RetryCount"));

			if (oldItem.getProperty("X-RetryCount") < 25) {
				this.modifyItem(newItem, oldItem, erGetOccurrenceIndexRequest.listener);
			}
			else {
				if (this.debug) this.logInfo("To many update retries. Giving up.");
				if (erGetOccurrenceIndexRequest.listener) {
				        this.notifyOperationComplete(erGetOccurrenceIndexRequest.listener,
				                                     Ci.calIErrors.READ_FAILED,
				                                     Ci.calIOperationListener.MODIFY,
				                                     erGetOccurrenceIndexRequest.argument.newItem.id,
				                                     erGetOccurrenceIndexRequest.argument.newItem);
				}
			}
		}
		else {
			this.addActivity(calGetString("calExchangeCalendar", "ewsErrorEventMessage", [this.name, aMsg, aCode], "exchangecalendar"), aMsg, erGetOccurrenceIndexRequest.argument.actionStart, Date.now());

			var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
			if (aMsg.indexOf(":") > -1) {
				var msgStr = aMsg.substr(aMsg.indexOf(":")+1);
				switch (msgStr) {
					case "ErrorCalendarMeetingRequestIsOutOfDate" :
						msgStr = "Meeting request is Out Of Date. You cannot use it anymore. ("+msgStr+")";
						break;
					case "ErrorItemNotFound" :
						msgStr = "Calendar item is not available anymore in the exchange database. ("+msgStr+")";
						break;
				}
				promptService.alert(null, "Info", msgStr);
			}
			else {
				promptService.alert(null, "Info", aMsg);
			}

			if (erGetOccurrenceIndexRequest.listener) {
			        this.notifyOperationComplete(erGetOccurrenceIndexRequest.listener,
			                                     Ci.calIErrors.MODIFICATION_FAILED,
			                                     Ci.calIOperationListener.MODIFY,
			                                     erGetOccurrenceIndexRequest.argument.newItem.id,
			                                     erGetOccurrenceIndexRequest.argument.newItem);
			}
		}
	},

	doAttachmentUpdates: function _doAttachmentUpdates(aAttachmentsUpdates, aItem, aSendTo, aListener)
	{
		var result = false;
		if ((aAttachmentsUpdates) && ( (aAttachmentsUpdates.create.length > 0) || (aAttachmentsUpdates.delete.length > 0) )) {
			result = true;
			if (aAttachmentsUpdates.create.length > 0) {
				if (this.debug) this.logInfo("doAttachmentUpdates We have "+aAttachmentsUpdates.create.length+" attachments to create.");
				var self = this;
				this.addToQueue( erCreateAttachmentRequest,
					{user: this.user, 
					 serverUrl: this.serverUrl,
					 item: aItem,
					 parentItemId: aItem.id,
					 parentItemChangeKey: aItem.getProperty("X-ChangeKey"), 
					 attachmentsUpdates: aAttachmentsUpdates,
					 sendto: aSendTo,
					 actionStart: Date.now()}, 
					function(erCreateAttachmentRequest, attachmentId, RootItemId, RootItemChangeKey) { self.createAttachmentOk(erCreateAttachmentRequest, attachmentId, RootItemId, RootItemChangeKey);}, 
					function(erCreateAttachmentRequest, aCode, aMsg) { self.createAttachmentError(erCreateAttachmentRequest, aCode, aMsg);},
					aListener);
			}
			else {
				if (this.debug) this.logInfo("updateItemOk We have "+aAttachmentsUpdates.delete.length+" attachments to delete.");
				var self = this;
				this.addToQueue( erDeleteAttachmentRequest,
					{user: this.user, 
					 serverUrl: this.serverUrl,
					 item: aItem,
					 parentItemId: aItem.id,
					 parentItemChangeKey: aItem.getProperty("X-ChangeKey"), 
					 attachmentsUpdates: aAttachmentsUpdates,
					 sendto: aSendTo,
					 actionStart: Date.now()}, 
					function(erDeleteAttachmentRequest, aId, aChangeKey) { self.deleteAttachmentOk(erDeleteAttachmentRequest, aId, aChangeKey);}, 
					function(erDeleteAttachmentRequest, aCode, aMsg) { self.deleteAttachmentError(erDeleteAttachmentRequest, aCode, aMsg);},
					aListener);
			}
		}
		return result;
	},

	doAttachmentUpdatesFinalize: function _doAttachmentUpdatesFinalize(aAttachmentsUpdates, aItem, aId, aChangeKey, aSendTo, aListener)
	{
		if (this.debug) this.logInfo("doAttachmentUpdatesFinalize: item:"+aItem.title+", aSendTo:"+aSendTo);

		/*var req = <nsTypes:ItemChange xmlns:nsTypes="http://schemas.microsoft.com/exchange/services/2006/types">
			  <nsTypes:ItemId Id={aId} ChangeKey={aChangeKey}/>
			  <nsTypes:Updates>
			    <nsTypes:SetItemField>
			      <nsTypes:FieldURI FieldURI="item:Subject"/>
			      <nsTypes:CalendarItem>
				<nsTypes:Subject>{aItem.title}</nsTypes:Subject>
			      </nsTypes:CalendarItem>
			    </nsTypes:SetItemField>
			  </nsTypes:Updates>
			</nsTypes:ItemChange>;*/

		var req = this.globalFunctions.xmlToJxon('<nsTypes:ItemChange xmlns:nsTypes="'+nsTypesStr+'"/>');
		var itemId = req.addChildTag("ItemId", "nsTypes", null);
		itemId.setAttribute("Id", aId);
		itemId.setAttribute("ChangeKey", aChangeKey);
		var setItemField = req.addChildTag("Updates", "nsTypes", null).addChildTag("SetItemField", "nsTypes", null);
		setItemField.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "item:Subject");
		setItemField.addChildTag("CalendarItem", "nsTypes", null).addChildTag("Subject", "nsTypes", aItem.title);

		var self = this;
		this.addToQueue( erUpdateItemRequest,
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: this.folderBase,
			 serverUrl: this.serverUrl,
			 item: aItem,
			 folderID: this.folderID,
			 changeKey: this.changeKey,
			 updateReq: req,
			 newItem: aItem,
			 actionStart: Date.now(),
			 attachmentsUpdates: null,
		         sendto: aSendTo}, 
			function(erUpdateItemRequest, aId, aChangeKey) { self.updateItemOk(erUpdateItemRequest, aId, aChangeKey);}, 
			function(erUpdateItemRequest, aCode, aMsg) { self.whichOccurrencegetOccurrenceIndexError(erUpdateItemRequest, aCode, aMsg);},
			aListener);
		
	},

	updateItemOk: function _updateItemOk(erUpdateItemRequest, aId, aChangeKey)
	{
		if (this.debug) this.logInfo("updateItemOk: aId"+aId);

		this.saveCredentials(erUpdateItemRequest.argument);
		this.notConnected = false;

		// Make an event for thistory.
		if (isEvent(erUpdateItemRequest.argument.newItem)) {
			this.addActivity(calGetString("calExchangeCalendar", "updateCalendarEventMessage", [erUpdateItemRequest.argument.newItem.title, this.name], "exchangecalendar"), "", erUpdateItemRequest.argument.actionStart, Date.now());
		}
		else {
			this.addActivity(calGetString("calExchangeCalendar", "updateTaskEventMessage", [erUpdateItemRequest.argument.newItem.title, this.name], "exchangecalendar"), "", erUpdateItemRequest.argument.actionStart, Date.now());
		}

		if (! this.doAttachmentUpdates(erUpdateItemRequest.argument.attachmentsUpdates, erUpdateItemRequest.argument.item, erUpdateItemRequest.argument.sendto, erUpdateItemRequest.listener)) {
			if (erUpdateItemRequest.listener) {
				this.notifyOperationComplete(erUpdateItemRequest.listener,
				                             Cr.NS_OK,
				                             Ci.calIOperationListener.MODIFY,
				                             erUpdateItemRequest.argument.newItem.id,
				                             erUpdateItemRequest.argument.newItem);
			}
		
			this.refresh();
		}
	},

	getOccurrenceIndexOk: function _getOccurrenceIndexOk(erGetOccurrenceIndexRequest, aIndex, aMasterId, aMasterChangeKey)
	{
//		if (this.debug) this.logInfo("getOccurrenceIndexOk index="+aIndex);
		this.saveCredentials(erGetOccurrenceIndexRequest.argument);
		this.notConnected = false;
		var self = this;
		switch (erGetOccurrenceIndexRequest.argument.action) {
			case "deleteItem":
				this.addToQueue( erDeleteItemRequest,
					{user: erGetOccurrenceIndexRequest.argument.user, 
					 mailbox: this.mailbox,
					 folderBase: this.folderBase,
					 serverUrl: erGetOccurrenceIndexRequest.argument.serverUrl,
					 item: erGetOccurrenceIndexRequest.argument.item,
					 folderID: erGetOccurrenceIndexRequest.argument.folderID,
					 masterID: aMasterId,
					 masterChangeKey: aMasterChangeKey,
					 itemIndex: aIndex,
					 itemType: erGetOccurrenceIndexRequest.argument.itemType,
					 whichOccurrence: erGetOccurrenceIndexRequest.argument.whichOccurrence}, 
					function(erDeleteItemRequest) { self.deleteItemOk(erDeleteItemRequest);},
					function(erDeleteItemRequest, aCode, aMsg) { self.deleteItemError(erDeleteItemRequest, aCode, aMsg);},
					erGetOccurrenceIndexRequest.listener);
				break;
		}
	},

	getOccurrenceIndexError: function _getOccurrenceIndexError(erGetOccurrenceIndexRequest, aCode, aMsg)
	{
//		if (this.debug) this.logInfo("getOccurrenceIndexError");
		this.saveCredentials(erGetOccurrenceIndexRequest.argument);
		this.notConnected = true;
		switch (erGetOccurrenceIndexRequest.argument.action) {
			case "deleteItem":
				if (erGetOccurrenceIndexRequest.listener) {
					this.notifyOperationComplete(erGetOccurrenceIndexRequest.listener,
					      Ci.calIErrors.MODIFICATION_FAILED,
					      Ci.calIOperationListener.DELETE,
					      null,
					      aMsg);
				}
				break;
		}
	},

	deleteItemOk: function _deleteItemOk(erDeleteItemRequest)
	{
		this.saveCredentials(erDeleteItemRequest.argument);
		if (this.debug) this.logInfo("deleteItemOK");
		this.notConnected = false;

		if (erDeleteItemRequest.listener) {
			this.notifyOperationComplete(erDeleteItemRequest.listener,
			      Cr.NS_OK,
			      Ci.calIOperationListener.DELETE,
			      erDeleteItemRequest.argument.item.id,
			      erDeleteItemRequest.argument.item);
		}

		if (this.debug) this.logInfo("itemType:"+erDeleteItemRequest.itemType+", Subject:"+erDeleteItemRequest.argument.item.title);
		switch (erDeleteItemRequest.itemType) {
			case "master" :
				// Also remove the children.
				// 12-12-2011 Turned this of because this is done when we receive the update from the exchange server.
				//this.removeChildrenFromMaster(erDeleteItemRequest.argument.item);
				//delete this.recurringMasterCache[erDeleteItemRequest.argument.item.getProperty("X-UID")];
				break;
			case "single":
			case "occurrence":

			// This will be done on receiving the update from this.globalFunctions.
				//this.notifyTheObservers("onDeleteItem", [erDeleteItemRequest.argument.item]);
				//delete this.itemCache[erDeleteItemRequest.argument.item.id];
				break;
		}


		if (isEvent(erDeleteItemRequest.argument.item)) {
			this.addActivity(calGetString("calExchangeCalendar", "deleteCalendarEventMessage", [erDeleteItemRequest.argument.item.title, this.name], "exchangecalendar"), "", erDeleteItemRequest.argument.actionStart, Date.now());
		}
		else {
			this.addActivity(calGetString("calExchangeCalendar", "deleteTaskEventMessage", [erDeleteItemRequest.argument.item.title, this.name], "exchangecalendar"), "", erDeleteItemRequest.argument.actionStart, Date.now());
		}

		//delete erDeleteItemRequest.argument.item;
		this.refresh();
	},

	deleteItemError: function _deleteItemError(erDeleteItemRequest, aCode, aMsg)
	{
		this.saveCredentials(erDeleteItemRequest.argument);
		this.notConnected = true;
		if (this.debug) this.logInfo("deleteItemError msg:"+String(aMsg));
		if (erDeleteItemRequest.listener) {
			this.notifyOperationComplete(erDeleteItemRequest.listener,
			      Ci.calIErrors.MODIFICATION_FAILED,
			      Ci.calIOperationListener.DELETE,
			      null,
			      aMsg);
		}
	},

	saveCredentials: function _saveCredentials(aCredentials)
	{
		if (aCredentials) {
			if ((aCredentials.user != "") && (aCredentials.user != "\\") && (aCredentials.user != "/")) {
				this.user = aCredentials.user;
			}
		}
	},

	addToQueue: function _addToQueue(aRequest, aArgument, aCbOk, aCbError, aListener)
	{
		if (this.getProperty("disabled")) {
			if (this.debug) this.logInfo("Not adding to queue because we are disabled.");
			return;
		}

		if (!aArgument["ServerVersion"]) aArgument["ServerVersion"] = this.exchangeStatistics.getServerVersion(this.serverUrl);

		this.loadBalancer.addToQueue({ calendar: this,
				 ecRequest:aRequest,
				 arguments: aArgument,
				 cbOk: aCbOk,
				 cbError: aCbError,
				 listener: aListener});
	},

	addToOfflineQueue: function _addToOfflineQueue(aRangeStart, aRangeEnd)
	{
		if (this.getProperty("disabled")) {
			return;
		}

		this.offlineQueue.push({rangeStart:aRangeStart,
				 rangeEnd: aRangeEnd});

//		this.observerService.notifyObservers(this, "onExchangeProgressChange", "1");  


		if (!this.offlineTimer) {
			if (this.debug) this.logInfo("Arming timer for offlineQueue.");
			this.offlineTimer = Cc["@mozilla.org/timer;1"]
					.createInstance(Ci.nsITimer);

		        let self = this;
			let timerCallback = {
				notify: function setTimeout_notify() {
					self.processOfflineQueue();
				}
			};
			if (!this.shutdown) {
				this.offlineTimer.initWithCallback(timerCallback, 50, this.offlineTimer.TYPE_REPEATING_SLACK);
			}
			if (this.debug) this.logInfo("Timer for offlineQueue.");

		}
	},

	processOfflineQueue: function _processOfflineQueue()
	{
		if (this.offlineQueue.length > 0) {
			var queueItem = this.offlineQueue[0];
			this.offlineQueue.shift();

			//this.globalFunctions.LOG("["+this.name+"] processQueue:"+aQueueNumber+" ("+this.globalFunctions.STACKshort()+")");
			//this.observerService.notifyObservers(this, "onExchangeProgressChange", "-1");  
			var itemsFromCache = this.getItemsFromOfflineCache(queueItem.rangeStart, queueItem.rangeEnd);
			if (itemsFromCache) {
				if (this.debug) this.logInfo("We got '"+itemsFromCache.length+"' items from offline cache.");
			}
		}

	},

	findCalendarItemsOK: function _findCalendarItemsOK(erFindCalendarItemsRequest, aIds, aOccurrences)
	{
		if (this.debug) this.logInfo("findCalendarItemsOK: aIds.length="+aIds.length+", aOccurrences.length="+aOccurrences.length);

		this.saveCredentials(erFindCalendarItemsRequest.argument);
		this.notConnected = false;

		if ((aIds.length == 0) && (aOccurrences.length)) {
			return;
		}

       		var self = this;

		// If we have occurrences and/or exceptions. Find the masters. followed by the occurrences.
		if (aOccurrences.length > 0) {
			if (this.debug) this.logInfo("findCalendarItemsOK: aOccurrences.length="+aOccurrences.length);
			this.addToQueue( erFindMasterOccurrencesRequest, 
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: this.folderBase,
			 serverUrl: this.serverUrl,
			 occurrences: aOccurrences,
			 folderID: this.folderID,
			 changeKey: this.changeKey,
			 folderClass: this.folderClass,
			 GUID: calExchangeCalendarGUID}, 
			function(erGetItemsRequest, aIds) { self.findMasterOccurrencesOk(erGetItemsRequest, aIds);}, 
			function(erGetItemsRequest, aCode, aMsg) { self.findCalendarItemsError(erGetItemsRequest, aCode, aMsg);},
			null);

		}

		// We have single and/or master items. Get full details and cache them.
		if (aIds.length > 0) {
			this.addToQueue( erGetItemsRequest, 
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: this.folderBase,
			 serverUrl: this.serverUrl,
			 ids: aIds,
			 folderID: this.folderID,
			 changeKey: this.changeKey,
			 occurrences: aOccurrences,
			 folderClass: this.folderClass,
			 GUID: calExchangeCalendarGUID}, 
			function(erGetItemsRequest, aIds) { self.getCalendarItemsOK(erGetItemsRequest, aIds);}, 
			function(erGetItemsRequest, aCode, aMsg) { self.findCalendarItemsError(erGetItemsRequest, aCode, aMsg);},
			null);
		}

		this.startCalendarPoller();
/*		if (!this.calendarPoller) {

			// start the calendar poller
			this.calendarPoller = Cc["@mozilla.org/timer;1"]
					.createInstance(Ci.nsITimer);
		        var self = this;
			var timerCallback = {
				notify: function setTimeout_notify() {
					self.refresh();
				}
			};

			this.calendarPoller.initWithCallback(timerCallback, this.globalFunctions.safeGetIntPref(this.prefs, "ecCalendarPollInterval", 60) * 1000, this.calendarPoller.TYPE_REPEATING_SLACK);
		}*/
	},

	startCalendarPoller: function _startCalendarPoller()
	{
	        var self = this;
		var timerCallback = {
			notify: function setTimeout_notify() {
				self.refresh();
			}
		};

		if (!this.calendarPoller) {

			// start the calendar poller
			this.calendarPoller = Cc["@mozilla.org/timer;1"]
					.createInstance(Ci.nsITimer);
			this.calendarPoller.initWithCallback(timerCallback, this.globalFunctions.safeGetIntPref(this.prefs, "ecCalendarPollInterval", 60) * 1000, this.calendarPoller.TYPE_REPEATING_SLACK);
		}
		else {
			this.calendarPoller.initWithCallback(timerCallback, this.globalFunctions.safeGetIntPref(this.prefs, "ecCalendarPollInterval", 60) * 1000, this.calendarPoller.TYPE_REPEATING_SLACK);
		}
	},

	findCalendarItemsError: function _findCalendarItemsError(erFindCalendarItemsRequest, aCode, aMsg) 
	{
		if (this.debug) this.logInfo("findCalendarItemsError aCode:"+aCode+", aMsg:"+aMsg);
		if ((aCode == -8) && (aMsg == "ErrorCalendarFolderIsInvalidForCalendarView")) {
			this.supportsEvents = false;
		}
		else {
			this.notConnected = true;
		}
		this.saveCredentials(erFindCalendarItemsRequest.argument);
	},

	findMasterOccurrencesOk: function _findMasterOccurrencesOk(erGetItemsRequest, aIds)
	{
		if (this.debug) this.logInfo("findMasterOccurrencesOk:Start: aIds.length="+aIds.length);

		this.saveCredentials(erFindCalendarItemsRequest.argument);
		this.notConnected = false;

		if (aIds.length == 0) {
			return;
		}

		// Cache full master details.
		this.updateCalendar(erGetItemsRequest, aIds, true);
		if (this.debug) this.logInfo("findMasterOccurrencesOk:End: aIds.length="+aIds.length);

	},

	findOccurrencesOK: function _findOccurrencesOK(erFindOccurrencesRequest, aIds)
	{
		if (this.debug) this.logInfo("findOccurrencesOK: aIds.length="+aIds.length);
		// Get full details of occurrences and exceptions and cache them.
		this.notConnected = false;
		this.findCalendarItemsOK(erFindOccurrencesRequest, aIds, []);
	},

	findTaskItemsOK: function _findTaskItemsOK(erFindTaskItemsRequest, aIds)
	{
//		if (this.debug) this.logInfo("findTaskItemsOK: aIds.length:"+aIds.length);
		this.saveCredentials(erFindTaskItemsRequest.argument);
		this.notConnected = false;

		if (aIds.length == 0) {
			return;
		}

       		var self = this;

		this.addToQueue( erGetItemsRequest, 
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: this.folderBase,
			 serverUrl: this.serverUrl,
			 ids: aIds,
			 folderID: this.folderID,
			 changeKey: this.changeKey,
			 folderClass: this.folderClass,
			 GUID: calExchangeCalendarGUID }, 
			function(erGetItemsRequest, aIds) { self.getTaskItemsOK(erGetItemsRequest, aIds);}, 
			function(erGetItemsRequest, aCode, aMsg) { self.getTaskItemsError(erGetItemsRequest, aCode, aMsg);},
			null);

		this.startCalendarPoller();
/*		if (!this.calendarPoller) {

			// start the calendar poller
			this.calendarPoller = Cc["@mozilla.org/timer;1"]
					.createInstance(Ci.nsITimer);
		        var self = this;
			var timerCallback = {
				notify: function setTimeout_notify() {
					self.refresh();
				}
			};

			this.calendarPoller.initWithCallback(timerCallback, this.globalFunctions.safeGetIntPref(this.prefs, "ecCalendarPollInterval", 60) * 1000, this.calendarPoller.TYPE_REPEATING_SLACK);
		}*/
	},

	findTaskItemsError: function _findTaskItemsError(erFindTaskItemsRequest, aCode, aMsg)
	{
		this.saveCredentials(erFindTaskItemsRequest.argument);
		this.notConnected = true;

	},

	tryToSetDateValue: function _TryToSetDateValue(ewsvalue, aDefault)
	{
		if ((ewsvalue) && (ewsvalue.toString().length)) {
			return cal.fromRFC3339(ewsvalue, this.globalFunctions.ecTZService().UTC).getInTimezone(this.globalFunctions.ecDefaultTimeZone());
		}

		return aDefault;
	},

	tryToSetValue: function _tryToSetValue(ewsvalue, aDefault)
	{
		if (ewsvalue) {
			return ewsvalue;
		}

		return aDefault;
	},

	processItemSyncQueue: function _processItemSyncQueue()
	{
		if (this.processItemSyncQueueBusy) {
			return;
		}

		this.processItemSyncQueueBusy = true;

		// Process this.getItemSyncQueue
		while (this.getItemSyncQueue.length > 0) {
			if (this.debug) this.logInfo("processItemSyncQueue: id:"+this.getItemSyncQueue[0].id);
			this.getItem(this.getItemSyncQueue[0].id, this.getItemSyncQueue[0].listener, true);
			this.getItemSyncQueue.shift();
		}

		this.processItemSyncQueueBusy = false;

	},

	getTaskItemsOK: function _getTaskItemsOK(erGetItemsRequest, aItems)
	{
		if (this.debug) this.logInfo("getTaskItemsOK: aItems.length:"+aItems.length);
		this.saveCredentials(erGetItemsRequest.argument);
		this.notConnected = false;

if (this.debug) this.logInfo("getTaskItemsOK 2");

		if (aItems.length == 0) {
			this.syncBusy = false;
			this.processItemSyncQueue();

			return;
		}

if (this.debug) this.logInfo("getTaskItemsOK 3");
		this.updateCalendar(erGetItemsRequest, aItems, true);
if (this.debug) this.logInfo("getTaskItemsOK 4");

		this.syncBusy = false;

		this.processItemSyncQueue();

	},

	getTaskItemsError: function _getTaskItemsError(erGetItemsRequest, aCode, aMsg) 
	{
//		if (this.debug) this.logInfo("getTaskItemsError: aMsg:"+ aMsg);
		this.saveCredentials(erGetItemsRequest.argument);
		this.notConnected = true;

		this.syncBusy = false;

		this.processItemSyncQueue();

	},

	getMeetingRequestFromServer: function _getMeetingRequestFromServer(aItem, aUID, aOperation, aListener)
	{
		if (this.debug) this.logInfo("aUID="+aUID);

		// We do not have a meetingrequest in cache but it is an iTIP.
		// Is inbox polling off? Or did the inbox polling not yet happen interval to long.
// bug 59		if (!this.doPollInbox) {
			// We are not polling the inbox so treat it as a meetingrespons.
			if (this.debug) this.logInfo("We get a new calendar item. It looks like an iTIP respons because aItem.id is set. Going to check if we can find it in the users inbox.");
			// We mis the exchange id and changekey which we need for responding.
			// We can get these by polling or searching the inbox but this is async. We can do this
			// because we received a listener. So search inbox for this uid and then use the full exchange message.
			// We could have multiple meetingrequest with the same uid but different id and changekey. How do we handle those??
						
			var self = this;
			this.addToQueue( erGetMeetingRequestByUIDRequest,
				{user: this.user, 
				 mailbox: this.mailbox,
				 folderBase: "inbox",
				 serverUrl: this.serverUrl,
				 item: aItem,
				 uid: aUID,
				 actionStart: Date.now(),
				 operation: aOperation,
				 GUID: calExchangeCalendarGUID}, 
				function(erGetMeetingRequestByUIDRequest, aMeetingRequests) { self.getMeetingRequestByUIDOk(erGetMeetingRequestByUIDRequest, aMeetingRequests);}, 
				function(erGetMeetingRequestByUIDRequest, aCode, aMsg) { self.getMeetingRequestByUIDError(erGetMeetingRequestByUIDRequest, aCode, aMsg);},
				aListener);

			return;
// bug 59		}
/* bug 59		else {
			if (this.debug) this.logInfo("!! THIS IS A SITUATION WHICH NEVER SHOULD HAPPEN !!");
			if (this.debug) this.logInfo("We have an iTIP respons and are polling the inbox but the item is not in the meetingrequestcache.");
			if (this.debug) this.logInfo("We see this when someone imports an ICS file or imports a meeting request into another calendar.");
			// If it is an ICS we would like it to be added to the calendar as new item
			// If is a meeting request then we want it accepted and not added. This must produce an error
			// Problem is we cannot identify it as a ICS import or a acceptation of a meeting request.
			aItem.id = undefined;
			this.adoptItem(aItem, aListener);
		/*	// We could do the same as we are not polling inbox..
			if (aListener) {
				this.notifyOperationComplete(aListener,
	        	                             Ci.calIErrors.MODIFICATION_FAILED,
	                        	             aOperation,
	                        	             aUID,
	                        	             aItem);
			} */
/* bug 59			return;
		} */ // bug 59
	},

	createAttendee: function _createAttendee(aElement, aType, aMyResponseType) 
	{
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

			// check if we specified a myResponseType for the complete item and the specified mailbox is equal to the mailbox for the calendar.
			if ((aMyResponseType) && (mbox.getTagValue("t:EmailAddress","unknown").toLowerCase() == this.mailbox.toLowerCase())) {
				attendee.participationStatus = participationMap[aMyResponseType];
				//if (this.debug) this.logInfo("Setting my response type from the global myresponsetype for the item.");
			}
		}

		return attendee;
	},

	createMeAsAttendee: function _createMeAsAttendee(aMyResponseType) 
	{
		var attendee = createAttendee();

		attendee.id = 'mailto:' + this.mailbox;
		attendee.commonName = this.userDisplayName;
		attendee.rsvp = "FALSE";
		attendee.userType = "INDIVIDUAL";
		attendee.role = "REQ-PARTICIPANT";

		attendee.participationStatus = participationMap[aMyResponseType];

		return attendee;
	},

	readRecurrenceRule: function _readRecurrenceRule(aElement)
	{
		/*
		 * The Mozilla recurrence API is bothersome and dictated by libical.
		 *
		 * We need to obey and build an iCalendar string which we feed in
		 * to get the proper recurrence info.
		 */
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
					/* Dunno what to do with this; no place to set */
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

	readRecurrence: function _readRecurrence(aItem, aElement)
	{
		var recurrence = aElement.XPath("/t:Recurrence/*");
		var recrule = this.readRecurrenceRule(recurrence);
		recurrence = null;
	
		if (recrule === null) {
			return null;
		}
	
		var recurrenceInfo = cal.createRecurrenceInfo(aItem);
		recurrenceInfo.setRecurrenceItems(1, [recrule]);

		return recurrenceInfo;
	},

	readDeletedOccurrences: function _readDeletedOccurrences(aItem, aElement)
	{
		var deletedOccurrences = aElement.XPath("/t:DeletedOccurrences/*");
		for each (var mit in deletedOccurrences) {
			for (var index in this.itemCache) {
				if ( (this.itemCache[index]) &&
				     (this.itemCache[index].parentItem.id == aItem.id) &&
				     (this.itemCache[index].startDate.compare(this.tryToSetDateValue(mit.getTagValue("t:Start"))) == 0) ) {
					if (this.debug) this.logInfo("readDeletedOccurrences 2a");
					aItem.recurrenceInfo.removeOccurrenceAt(this.itemCache[index].startDate);
					this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
					break;
				}
			}

			
		}
		deletedOccurrences = null;
	},

	notifyTheObservers: function _notifyTheObservers(aCommand, aArray)
	{
		try {
			if (aArray[0].title == "Lange test2") {
				if (this.debug) this.logInfo(" notifyTheObservers: aCommand:"+aCommand+", item.title:"+aArray[0].title);
			}
		} catch(err) {}

		this.observers.notify(aCommand, aArray);

		switch (aCommand) {
			case "onDeleteItem": 
				if (!this.notConnected) {
					this.removeFromOfflineCache(aArray[0]);
				}
				break;
		}
	},

	removeChildrenFromMaster: function _removeChildrenFromMaster(aMaster)
	{
		if (this.debug) this.logInfo("removeChildrenFromMaster start. Title:"+aMaster.title);
		// Remove children of this master. They will be added later.
		for (var index in this.itemCache) {
			if ( (this.itemCache[index]) &&
			     (isEvent(this.itemCache[index])) &&
			     (this.itemCache[index].parentItem.id == aMaster.id) ) {
				if (this.debug) this.logInfo("removeChildrenFromMaster: Removing child:"+this.itemCache[index].title+", startdate="+this.itemCache[index].startDate.toString());
				if (this.itemCache[index].isMutable) {
					this.itemCache[index].parentItem = this.itemCache[index];
				}
				this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
				delete this.itemCache[index];
			}
		}
		if (this.debug) this.logInfo("removeChildrenFromMaster end.:"+aMaster.title);
	},

	setCommonValues: function _setCommonValues(aItem, aExchangeItem)
	{
		switch(aExchangeItem.getTagValue("t:Importance")) {
			case "Low" : 
				aItem.priority = 9;
				break;
			case "Normal" : 
				aItem.priority = 5;
				break;
			case "High" : 
				aItem.priority = 1;
				break;
		}

		switch (aExchangeItem.getTagValue("t:Sensitivity")) {
			case "Normal" : 
				aItem.privacy = "PUBLIC";
				break;
			case "Confidential" : 
				aItem.privacy = "CONFIDENTIAL";
				break;
			case "Personal" : 
				aItem.privacy = "PRIVATE";
				break;
			case "Private" : 
				aItem.privacy = "PRIVATE";
				break;
			default :
				aItem.privacy = "PUBLIC";
		}

		switch (aExchangeItem.getTagValue("t:LegacyFreeBusyStatus")) {
			case "Free" : 
				aItem.setProperty("TRANSP", "TRANSPARENT");
				break;
			case "Busy" : 
				aItem.setProperty("TRANSP", "OPAQUE");
				break;
			case "Tentative" : 
				aItem.setProperty("TRANSP", "OPAQUE");
				break;
			case "OOF" : 
				aItem.setProperty("TRANSP", "OPAQUE");
				break;
		}

		if (aExchangeItem.getTagValue("t:IsCancelled") == "true") {
			this.setStatus(aItem, "Decline");
		}
		else {
			this.setStatus(aItem, aExchangeItem.getTagValue("t:MyResponseType"));
		}
	},

	setStatus: function _setStatus(aItem, aStatus)
	{
		switch (aStatus) {
			case "Unknown" : 
				aItem.setProperty("STATUS", "NONE");
				break;
			case "Organizer" : 
				aItem.setProperty("STATUS", "CONFIRMED");
				break;
			case "Tentative" : 
				aItem.setProperty("STATUS", "TENTATIVE");
				break;
			case "Accept" : 
				aItem.setProperty("STATUS", "CONFIRMED");
				break;
			case "Decline" : 
				aItem.setProperty("STATUS", "CANCELLED");
				break;
			case "NoResponseReceived" : 
				aItem.setProperty("STATUS", "NONE");
				break;
			default:
				aItem.setProperty("STATUS", "NONE");
				break;
		}
	},

	cloneItem: function _cloneItem(aItem) {
		var newItem = aItem.clone();
		if (aItem.id != aItem.parentItem.id) {
			newItem.parentItem = aItem.parentItem;
		}

		return newItem;
	},

	addExchangeAttachmentToCal: function _addExchangeAttachmentToCal(aExchangeItem, aItem)
	{
		if (aExchangeItem.getTagValue("t:HasAttachments") == "true") {
//			if (this.debug) this.logInfo("Title:"+aItem.title+"Attachments:"+aExchangeItem.getTagValue("Attachments"));
			var fileAttachments = aExchangeItem.XPath("/t:Attachments/t:FileAttachment");
			for each(var fileAttachment in fileAttachments) {
//				if (this.debug) this.logInfo(" -- Attachment: name="+fileAttachment.getTagValue("t:Name"));

				var newAttachment = createAttachment();
				newAttachment.setParameter("X-AttachmentId",fileAttachment.getAttributeByTag("t:AttachmentId","Id")); 
				newAttachment.uri = makeURL(this.serverUrl+"/?id="+encodeURIComponent(fileAttachment.getAttributeByTag("t:AttachmentId","Id"))+"&name="+encodeURIComponent(fileAttachment.getTagValue("t:Name"))+"&size="+encodeURIComponent(fileAttachment.getTagValue("t:Size", ""))+"&user="+encodeURIComponent(this.user));

				if (this.debug) this.logInfo("New attachment URI:"+this.serverUrl+"/?id="+encodeURIComponent(fileAttachment.getAttributeByTag("t:AttachmentId","Id"))+"&name="+encodeURIComponent(fileAttachment.getTagValue("t:Name"))+"&size="+encodeURIComponent(fileAttachment.getTagValue("t:Size", ""))+"&user="+encodeURIComponent(this.user));

				aItem.addAttachment(newAttachment);
			}
			fileAttachments = null;
		} 
	},

	clearXMozSnoozeTimes: function _clearXMozSnoozeTimes(aItem) 
	{
		if (!aItem) return;

		if (aItem.propertyEnumerator) {
			var props = aItem.propertyEnumerator;
			while (props.hasMoreElements()) {
				var prop = props.getNext().QueryInterface(Components.interfaces.nsIProperty);
				if (prop.name.indexOf("X-MOZ-SNOOZE-TIME") > -1) {
					if (this.debug) this.logInfo("deleting Property:"+prop.name+"="+prop.value);

					aItem.deleteProperty(prop.name);
					var props = aItem.propertyEnumerator;
				}
			}
		}
	},

	setSnoozeTime: function _setSnoozeTime(aItem, aMaster)
	{

		if (aMaster) {
			var pidLidReminderSet = aMaster.getProperty("X-PidLidReminderSet");
			var pidLidReminderSignalTime = aMaster.getProperty("X-PidLidReminderSignalTime");
		}
		else {
			var pidLidReminderSet = aItem.getProperty("X-PidLidReminderSet");
			var pidLidReminderSignalTime = aItem.getProperty("X-PidLidReminderSignalTime");
		}

		if (this.debug) this.logInfo("-- pidLidReminderSet:"+pidLidReminderSet);

		if (pidLidReminderSet) {

			if (this.debug) this.logInfo("Reminder date is set for item");

			if (aMaster) {
				// Exchange only has the next reminderSignaltime. This is one value. Lightning can handle multiple.
//				this.clearXMozSnoozeTimes(aMaster);

//				var reminderTime = cal.createDateTime(pidLidReminderSignalTime);
				var reminderTime = cal.createDateTime(aMaster.getProperty("X-PidLidReminderSignalTime"));
				if (reminderTime) {

					if (aItem) {
						if (this.debug) this.logInfo("We have an exception or an occurrence. We are going to use the master to see if it is snoozed or not.");

						// if the master ReminderDueBy is the same as the item Start date then this is the occurrence for which the next alarm is active.
						var masterReminderDueBy = this.tryToSetDateValue(aMaster.getProperty("X-ReminderDueBy"), null);
						if (masterReminderDueBy) {
							switch (masterReminderDueBy.compare(aItem.startDate)) {
								case -1:
									if (this.debug) this.logInfo("The ReminderDueBy date of the master is before the item's startdate. This alarm has not been snoozed or dismissed.");
									aItem.alarmLastAck = null;
									break;
								case 0: 
									if (this.debug) this.logInfo("The ReminderDueBy date of the master is equal to the item's startdate. We found the occurrence for which the alarm is active or dismissed or snoozed.");
									// We need to find out if it snoozed or dismissed.
									this.clearXMozSnoozeTimes(aMaster);
									if (this.debug) this.logInfo("Set snooze time: X-MOZ-SNOOZE-TIME-"+aItem.recurrenceId.nativeTime+"="+reminderTime.icalString);
									aMaster.setProperty("X-MOZ-SNOOZE-TIME-"+aItem.recurrenceId.nativeTime, reminderTime.icalString);

									var lastAck = reminderTime.clone();
									lastAck.addDuration(cal.createDuration('-PT1S'));
									aItem.alarmLastAck = lastAck;
									aMaster.alarmLastAck = lastAck;
									if (this.debug) this.logInfo("Set alarmLastAck:"+lastAck.icalString);
									break;
								case 1:
									if (this.debug) this.logInfo("The ReminderDueBy date of the master is after the item's startdate. This alarm has been dismissed.");
									var lastAck = aItem.startDate.clone();
									//lastAck.addDuration(cal.createDuration('-PT1S'));
									aItem.alarmLastAck = lastAck;
									if (this.debug) this.logInfo("Set alarmLastAck:"+lastAck.icalString);
									break;
							}
						}
						else {
							// Cannot determine for which alarm the next reminder is set. Bailing out.
							if (this.debug) this.logInfo("Cannot determine for which alarm the next reminder is set. Bailing out.");
							return;
						}


					}
					else {
						// We have a master only. Check for which of its occurrences/exceptions the X-MOZ-SNOOZE_TIME- needs to be set.
						// Easyest way for now is loop through it's children and call this function again with the child as item.
						// This can probably be optimized.
						if (this.debug) this.logInfo("A master. Will try to set snooze time on right occurrenceid");
						for (var index in this.itemCache) {

							if ( (this.itemCache[index]) &&
							     (isEvent(this.itemCache[index])) &&
							     ( (this.itemCache[index].getProperty("X-CalendarItemType") == "Occurrence") ||
							       (this.itemCache[index].getProperty("X-CalendarItemType") == "Exception") ) &&
							     (this.itemCache[index].getProperty("X-UID") == aMaster.getProperty("X-UID")) &&
							     (this.itemCache[index].parentItem.id == aMaster.id) ) {
								this.setSnoozeTime(this.itemCache[index], aMaster);
							}
						}
					}
				}
				else {
					if (this.debug) this.logInfo("Received pidLidReminderSignalTime is invalid:"+pidLidReminderSignalTime);
				}
			}
			else {
				// aItem is a Single
				this.clearXMozSnoozeTimes(aItem);
				var reminderTime = cal.createDateTime(pidLidReminderSignalTime);
				if (this.debug) this.logInfo("Set snooze time: X-MOZ-SNOOZE-TIME="+reminderTime.icalString);
				aItem.setProperty("X-MOZ-SNOOZE-TIME", reminderTime.icalString);

				var lastAck = reminderTime.clone();
				lastAck.addDuration(cal.createDuration('-PT1S'));
				aItem.alarmLastAck = lastAck;
				if (this.debug) this.logInfo("Set alarmLastAck:"+lastAck.icalString);
 
			}
		}
		else {
			// Remove any snooze states according http://msdn.microsoft.com/en-us/library/cc765589.aspx
			if (this.debug) this.logInfo("Item has no snooze date set.");
			aItem.alarmLastAck = null;
		}
	},

	setAlarm: function _setAlarm(aItem, aCalendarItem)
	{
		if ((aCalendarItem.getTagValue("t:ReminderIsSet") == "true")) {
			var alarm = cal.createAlarm();
			alarm.action = "DISPLAY";
			alarm.repeat = 0;

			var alarmOffset = cal.createDuration();
			alarmOffset.minutes = -1 * aCalendarItem.getTagValue("t:ReminderMinutesBeforeStart");

			// This is a bug fix for when the offset is more than a year)
			if (alarmOffset.minutes < (-60*24*365)) {
				alarmOffset.minutes = -5;
			}
			alarmOffset.normalize();

			alarm.related = Ci.calIAlarm.ALARM_RELATED_START;
			alarm.offset = alarmOffset;

			if (this.debug) this.logInfo("Alarm set with an offset of "+alarmOffset.minutes+" minutes from the start");
			aItem.setProperty("X-ReminderDueBy", aCalendarItem.getTagValue("t:ReminderDueBy"));

			aItem.addAlarm(alarm);
		}
	},

	convertExchangeAppointmentToCalAppointment: function _convertExchangeAppointmentToCalAppointment(aCalendarItem, isMeetingRequest, erGetItemsRequest, doNotify)
	{
		if (this.debug) this.logInfo("convertExchangeAppointmentToCalAppointment:"+String(aCalendarItem), 2);

try{
		//var item = createEvent();
		var item = Cc["@1st-setup.nl/exchange/calendarevent;1"]
				.createInstance(Ci.mivExchangeEvent);
		item.exchangeData = aCalendarItem;

		item.calendar = this.superCalendar;

		if (!doNotify) {
			doNotify = false;
		}

		if (! item.id) {
			this.logInfo("Item.id is missing. this is a required field.");
			return null;
		}

		if ((erGetItemsRequest) && (erGetItemsRequest.argument.occurrenceIndexes) && (erGetItemsRequest.argument.occurrenceIndexes[item.id])) {
			if (this.debug) this.logInfo(" Muriel:"+erGetItemsRequest.argument.occurrenceIndexes[item.id]+", title:"+item.subject);
			item.setProperty("X-OccurrenceIndex", erGetItemsRequest.argument.occurrenceIndexes[item.id]+"");
		}
		
		var uid = item.uid;

		if (this.itemCache[item.id]) {
			if (this.itemCache[item.id].getProperty("X-ChangeKey") == item.changeKey) {
				//if (this.debug) this.logInfo("Item is allready in cache and the id and changeKey are the same. Skipping it.");
				return null;
			}
		}
		else {
			if (this.recurringMasterCache[uid]) {
				if ( (this.recurringMasterCache[uid].getProperty("X-ChangeKey") == item.changeKey) && (this.recurringMasterCache[uid].id == item.id)) {
					//if (this.debug) this.logInfo("Master item is allready in cache and the id and changeKey are the same. Skipping it.");
					return null;
				}
			}
		}

		item.setProperty("X-CalendarItemType", item.calendarItemType);
		item.setProperty("X-ItemClass", item.itemClass);

		item.setProperty("X-UID", uid);

		if (! item.title) {
			item.title = "";
		}
		//if (this.debug) this.logInfo("convertExchangeAppointmentToCalAppointment: item.title:"+item.title);

		item.setProperty("X-LastModifiedTime", item.lastModifiedTime);
		// Check if we allready have this item and if this one is newer.
		if (!isMeetingRequest) {
			if (this.itemCache[item.id]) {
				// We allready have this item.
				if (this.debug) this.logInfo("== this.itemCache[item.id].title:"+this.itemCache[item.id].title);
				var oldItem = this.itemCache[item.id];
				if ((oldItem.getProperty("X-LastModifiedTime")) && (item.getProperty("X-LastModifiedTime") <= oldItem.getProperty("X-LastModifiedTime"))) {
					if (this.debug) this.logInfo("We received an older or not modified item. We are going to skip it. OldLastModified:"+oldItem.getProperty("X-LastModifiedTime")+", currentLastModified:"+item.getProperty("X-LastModifiedTime"));
					//return null;
				}
			}
			else {
				// Check if we have a master.
				if ((item.calendarItemType == "RecurringMaster") && (this.recurringMasterCache[uid])) {
					// We allready have this master item.
					var oldItem = this.recurringMasterCache[uid];
					if ((oldItem.getProperty("X-LastModifiedTime")) && (item.getProperty("X-LastModifiedTime") <= oldItem.getProperty("X-LastModifiedTime"))) {
						if (this.debug) this.logInfo("We received an older or not modified master item. We are going to skip it. OldLastModified:"+oldItem.getProperty("X-LastModifiedTime")+", currentLastModified:"+item.getProperty("X-LastModifiedTime"));
						//return null;
					}
				}
			}			
		}
		

		if (item.isCancelled) {
			item.setProperty("X-IsCancelled", true);
		}
		else {
			item.setProperty("X-IsCancelled", false);
		}

		if (item.isMeeting) {
			item.setProperty("X-IsMeeting", true);
		}
		else {
			item.setProperty("X-IsMeeting", false);
		}

//		this.setCommonValues(item, aCalendarItem);

		item.setProperty("X-IsInvitation", "false");
		// Check what kind of item this is.
/*		var responseObjects = aCalendarItem.XPath("/t:ResponseObjects/*");
		for each (var prop in responseObjects) {
			switch (prop.tagName) {
				case "AcceptItem":
				case "TentativelyAcceptItem":
				case "DeclineItem":
					item.setProperty("X-IsInvitation", "true");
					item.setProperty("X-MOZ-SEND-INVITATIONS", true);
					break
			}
		}
		responseObjects = null;*/

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

/*		var cats = [];
		var strings = aCalendarItem.XPath("/t:Categories/t:String");
		for each (var cat in strings) {
			cats.push(cat.value);
		}
		strings = null;
		item.setCategories(cats.length, cats);*/

		//item.startDate = this.tryToSetDateValue(aCalendarItem.getTagValue("t:Start"), item.startDate);
		if (! item.startDate) {
			if (this.debug) this.logInfo("We have an empty startdate. Skipping this item.");
			return null;
		}

		//item.endDate = this.tryToSetDateValue(aCalendarItem.getTagValue("t:End"), item.endDate);
		if (! item.endDate) {
			if (this.debug) this.logInfo("We have an empty enddate. Skipping this item.");
			return null;
		}

		// Check for Attachments
		//this.addExchangeAttachmentToCal(aCalendarItem, item);

		// Check if our custom fields are set
/*		var extendedProperties = aCalendarItem.XPath("/t:ExtendedProperty");
		var doNotHandleOldAddon = false;
		var pidLidReminderSet = false;
		var pidLidReminderSignalTime = null;
		for each(var extendedProperty in extendedProperties) {

			var propertyName = extendedProperty.getAttributeByTag("t:ExtendedFieldURI", "PropertyName", "");
			switch (propertyName) {
				case "lastLightningModified":
					var lastLightningModified = this.tryToSetDateValue(extendedProperty.getTagValue("t:Value"), null);
					var lastModifiedTime = this.tryToSetDateValue(aCalendarItem.getTagValue("t:LastModifiedTime"), null);

					if ((lastLightningModified) && (lastModifiedTime)) {
						if (lastModifiedTime.compare(lastLightningModified) == 1) {
							if (this.debug) this.logInfo("  -- Item has been modified on the Exchange server with another client.");
							item.setProperty("X-ChangedByOtherClient", true);
						}
					}

					break;
				default:
					if (propertyName != "") if (this.debug) this.logInfo("ODD propertyName:"+propertyName);
			}

			var propertyId = extendedProperty.getAttributeByTag("t:ExtendedFieldURI", "PropertyId", "");
			switch (propertyId) {
				case MAPI_PidLidReminderSignalTime: // This is the next alarm time. Could be set by a snooze command.
					pidLidReminderSignalTime = extendedProperty.getTagValue("t:Value");
					item.setProperty("X-PidLidReminderSignalTime", pidLidReminderSignalTime);
					break;
				case MAPI_PidLidReminderSet: // A snooze time is active/set.
					pidLidReminderSet = (extendedProperty.getTagValue("t:Value") == "true");
					item.setProperty("X-PidLidReminderSet", pidLidReminderSet);
					break;
				default:
					if (propertyId != "") {
						if (item.title == "Nieuwe gebeurtenis2") if (this.debug) this.logInfo("@1:ODD propertyId:"+propertyId+"|"+extendedProperty.getTagValue("t:Value"));
					}
			}

		}
		extendedProperties = null;
*/
/*		if (aCalendarItem.getTagValue("t:IsAllDayEvent") == "true") {
			// Check if the time is 00:00:00
			item.startDate.isDate = true;
			item.endDate.isDate = true;
		}*/

		item.setProperty("DTSTAMP", item.dateTimeReceived);
//		item.setProperty("LOCATION", aCalendarItem.getTagValue("t:Location"));

		//var myResponseType = item.myResponseType;

//		if (aCalendarItem.getTag("t:Organizer", "")) {
			//if (this.debug) this.logInfo(" ==A ORGANIZER== title:"+item.title+", org:"+String(aCalendarItem.getTag("t:Organizer")));
//			var org = this.createAttendee(aCalendarItem.getTag("t:Organizer"), "CHAIR");

/*			if (org.id.replace(/^mailto:/, '').toLowerCase() != this.mailbox.toLowerCase()) {
				item.setProperty("X-IsInvitation", "true");
				if (this.debug) this.logInfo("There is a organiser and I'm not it:"+org.id);
			}*/
//			org.isOrganizer = true;
//			item.organizer = org;
//		}
//		else {
//			item.setProperty("X-IsInvitation", "true");
//			if (this.debug) this.logInfo("There is no organiser.");
//		}

		if (item.type == "MeetingRequest") {
			//if (this.debug) this.logInfo(" X-IsInvitation : MeetingRequest title="+item.title);
			item.setProperty("X-IsInvitation", "true");
			item.setProperty("X-MOZ-SEND-INVITATIONS", true);
		}
		else {
			//if (this.debug) this.logInfo("                  MeetingItem title="+item.title);
/*			var iAmInTheList = false;
			var tmpAttendee;

			var attendees = aCalendarItem.XPath("/t:RequiredAttendees/t:Attendee")
			for each (var at in attendees) {
				tmpAttendee = this.createAttendee(at, "REQ-PARTICIPANT", myResponseType);
				item.addAttendee(tmpAttendee);
				if ((! iAmInTheList) && (tmpAttendee.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase())) {
					iAmInTheList = true;
				}
			}
			attendees = null;
			attendees = aCalendarItem.XPath("/t:OptionalAttendees/t:Attendee")
			for each (var at in attendees) {
				tmpAttendee = this.createAttendee(at, "OPT-PARTICIPANT", myResponseType);
				item.addAttendee(tmpAttendee);
				if ((! iAmInTheList) && (tmpAttendee.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase())) {
					iAmInTheList = true;
				}
			}
			attendees = null;

			if ((myResponseType) && (! iAmInTheList)) {
				item.addAttendee(this.createMeAsAttendee(myResponseType));
			}*/
		}
		
//		item.recurrenceId = null;
		if (!isMeetingRequest) {
			//if (this.debug) this.logInfo(" == item.title:"+item.title+", calendarItemType:"+aCalendarItem.getTagValue("t:CalendarItemType"));
			switch (item.calendarItemType) {
				case "Exception" :
					if (this.debug) this.logInfo("@1:"+item.startDate.toString()+":IsException");
					item.setProperty("X-RecurringType", "RE");
					//this.setAlarm(item, aCalendarItem);  
					// Try to find master. If found add Exception and link recurrenceinfo.
					//item.recurrenceId = this.tryToSetDateValue(aCalendarItem.getTagValue("t:RecurrenceId"), item.startDate);
					var master = this.recurringMasterCache[uid];
					if (master) {
						// We allready have a master in Cache.
						if (this.debug) this.logInfo("Found master for exception:"+master.title+", date:"+master.startDate.toString());
						item.parentItem = master;
						master.recurrenceInfo.modifyException(item, true);
						this.setSnoozeTime(item, master);
					}
					else {
						if (this.debug) this.logInfo("HAS NO MASTER: STRANGE: Exception:"+item.title);
					}

					break;
				case "Occurrence" :
					if (this.debug) this.logInfo("@1:"+item.startDate.toString()+":IsOccurrence");
					item.setProperty("X-RecurringType", "RO");
					//this.setAlarm(item, aCalendarItem);  
					// This is a occurrence. Try to find the master and link recurrenceinfo.
					//item.recurrenceId = this.tryToSetDateValue(aCalendarItem.getTagValue("t:RecurrenceId"), item.startDate);
					var master = this.recurringMasterCache[uid];
					if (master) {
						// We allready have a master in Cache.
						if (this.debug) this.logInfo("Found master for occurrence:"+master.title+", date:"+master.startDate.toString());
						item.parentItem = master;

						this.setSnoozeTime(item, master);
					}
					else {
						if (this.debug) this.logInfo("HAS NO MASTER: STRANGE: Occurrence:"+item.title);
					}
					
					break;
				case "RecurringMaster" :
	
					if (this.debug) this.logInfo("@1:"+item.startDate.toString()+":IsMaster");

					// This is a master so create recurrenceInfo.
					//item.recurrenceInfo = this.readRecurrence(item, aCalendarItem);
	
					// Try to find occurrences of this master which have their parentItem not
					// yet set to this one. Also set right recurrenceinfo for exceptions.
					// !!! This should not happen. Masters are allways cached before occurrence or exception.
					// 24-10-2011 I never have seen the below mentioned line in my logs. That is OK
					var loadChildren = false;
					var childCount = 0;

					for (var index in this.itemCache) {

						if ( (this.itemCache[index]) &&
						     (isEvent(this.itemCache[index])) &&
						     ( (this.itemCache[index].getProperty("X-CalendarItemType") == "Occurrence") ||
						       (this.itemCache[index].getProperty("X-CalendarItemType") == "Exception") ) &&
						     (this.itemCache[index].getProperty("X-UID") == item.getProperty("X-UID")) &&
						     (this.itemCache[index].parentItem.id == item.id) ) {
							childCount++;
						}

						if ( (this.itemCache[index]) &&
						     (isEvent(this.itemCache[index])) &&
						     ( (this.itemCache[index].getProperty("X-CalendarItemType") == "Occurrence") ||
						       (this.itemCache[index].getProperty("X-CalendarItemType") == "Exception") ) &&
						     (this.itemCache[index].getProperty("X-UID") == item.getProperty("X-UID")) &&
						     (this.itemCache[index].parentItem.id != item.id) ) {
							if (this.debug) this.logInfo("convertExchangeAppointmentToCalAppointment: WE SEE THIS LINE. SOLVE IT subject:"+item.title);
							this.itemCache[index].parentItem = item;
							if (this.itemCache[index].getProperty("X-CalendarItemType") == "Exception") {
								item.recurrenceInfo.modifyException(this.itemCache[index], true);
							}
						}

					}

					if (this.debug) this.logInfo("title:"+item.title+", childCount:"+childCount+", firstSyncDone:"+this.firstSyncDone);

					if ((this.firstSyncDone)) {
						if (this.debug) this.logInfo("We have a master and the sync is done. We will download it's children.");
						if (childCount > 0) {
							if (this.debug) this.logInfo("  It also has children so we first remove them.");
							this.removeChildrenFromMaster(item);
						}
						loadChildren = true;
					}

					//this.setAlarm(item, aCalendarItem);  

					this.addToOfflineCache(item, aCalendarItem);

					this.recurringMasterCache[uid] = item;
	
					if ((loadChildren) || (this.newMasters[uid])) {

						if (this.debug) this.logInfo("We have a master and it was set as new. So we download it's children.title:"+item.title);
						delete this.newMasters[uid];

						if (doNotify) {
							var self = this;
							// Request children from EWS server.
							var childRequestItem = {Id: aCalendarItem.getAttributeByTag("t:ItemId", "Id"),
								  ChangeKey: aCalendarItem.getAttributeByTag("t:ItemId", "ChangeKey"),
								  type: aCalendarItem.getTagValue("t:CalendarItemType"),
								  uid: aCalendarItem.getTagValue("t:UID"),
								  start: aCalendarItem.getTagValue("t:Start"),
								  end: aCalendarItem.getTagValue("t:End")};
					
							this.addToQueue( erFindOccurrencesRequest, 
							{user: this.user, 
							 mailbox: this.mailbox,
							 folderBase: this.folderBase,
							 serverUrl: this.serverUrl,
							 masterItem: childRequestItem,
							 folderID: this.folderID,
							 changeKey: this.changeKey,
							 startDate: this.startDate,
							 endDate: this.endDate,
					 		 GUID: calExchangeCalendarGUID}, 
							function(erGetItemsRequest, aIds) { self.findOccurrencesOK(erGetItemsRequest, aIds);}, 
							function(erGetItemsRequest, aCode, aMsg) { self.findCalendarItemsError(erGetItemsRequest, aCode, aMsg);},
							null);
						}
					}

					if (this.debug) this.logInfo("This is a master it will not be put into the normal items cache list.");
					return null;  // The master will not be visible

					break;
				default:
					//this.setAlarm(item, aCalendarItem);  
					this.setSnoozeTime(item, null);
			}
		}

		item.setProperty("X-fromExchange", true);
		return item;
}
catch(err){
	dump(" --- ERROR ERROR:"+err+"\n");
}
	},

	convertExchangeTaskToCalTask: function _convertExchangeTaskToCalTask(aTask, erGetItemsRequest)
	{
		dump("convertExchangeTaskToCalTask:\n");
		if (this.debug) this.logInfo("convertExchangeTaskToCalTask:"+String(aTask), 2);
		var item = createTodo();

		item.entryDate = this.tryToSetDateValue(aTask.getTagValue("t:StartDate"), null);

		item.dueDate = this.tryToSetDateValue(aTask.getTagValue("t:DueDate"), item.dueDate);
		item.completedDate = this.tryToSetDateValue(aTask.getTagValue("t:CompleteDate"), item.completedDate);
		item.percentComplete = this.tryToSetValue(aTask.getTagValue("t:PercentComplete"), item.percentComplete);
		item.calendar = this.superCalendar;

		item.id = this.tryToSetValue(aTask.getAttributeByTag("t:ItemId", "Id"), item.id);
		item.setProperty("X-ChangeKey", aTask.getAttributeByTag("t:ItemId", "ChangeKey"));

		if (this.itemCache[item.id]) {
			if (this.itemCache[item.id].getProperty("X-ChangeKey") == aTask.getAttributeByTag("t:ItemId", "ChangeKey")) {
				//if (this.debug) this.logInfo("Item is allready in cache and the id and changeKey are the same. Skipping it.");
				return null;
			}
		}


		item.setProperty("X-UID", "dummy");

		item.title = this.tryToSetValue(aTask.getTagValue("t:Subject"), item.title);

		this.setCommonValues(item, aTask);

		var cats = [];
		var strings = aTask.XPath("/t:Categories/t:String");
		for each (var cat in strings) {
			cats.push(cat.value);
		}
		strings = null;
		item.setCategories(cats.length, cats);

		switch(aTask.getTagValue("t:Status")) {
			case "NotStarted" : 
				item.status = "NONE";
				break;
			case "InProgress" : 
				item.status = "IN-PROCESS";
				break;
			case "Completed" : 
				item.status = "COMPLETED";
				break;
			case "WaitingOnOthers" : 
				item.status = "NEEDS-ACTION";
				break;
			case "Deferred" : 
				item.status = "CANCELLED";
				break;
		}

		// Check if our custom fields are set
		var extendedProperties = aTask.getTagValue("t:ExtendedProperty");
		var doNotHandleOldAddon = false; 
		var pidLidReminderSet = false;
		var pidLidReminderSignalTime = "";
		for each(var extendedProperty in extendedProperties) {

			var propertyName = extendedProperty.getAttributeByTag("t:ExtendedFieldURI","PropertyName");
			switch (propertyName) {
				case "lastLightningModified":
					var lastLightningModified = this.tryToSetDateValue(extendedProperty.getTagValue("t:Value"), null);
					var lastModifiedTime = this.tryToSetDateValue(aCalendarItem.getTagValue("t:LastModifiedTime"), null);

					if ((lastLightningModified) && (lastModifiedTime)) {
						if (lastModifiedTime.compare(lastLightningModified) == 1) {
							if (this.debug) this.logInfo("  -- Item has been modified on the Exchange server with another client.");
							item.setProperty("X-ChangedByOtherClient", true);
						}
					}

					break;
				default:
					if (propertyName != "") if (this.debug) this.logInfo("ODD propertyName:"+propertyName);
			}

			var propertyId = extendedProperty.getAttributeByTag("t:ExtendedFieldURI","PropertyId");
			switch (propertyId) {
				case MAPI_PidLidReminderSignalTime: // This is the next alarm time. Could be set by a snooze command.
					pidLidReminderSignalTime = extendedProperty.getTagValue("t:Value");
					item.setProperty("X-PidLidReminderSignalTime", pidLidReminderSignalTime);
					if (item.title == "Nieuwe gebeurtenis2") if (this.debug) this.logInfo("@1:ODD propertyId:"+propertyId+"|"+pidLidReminderSignalTime);
					break;
				case MAPI_PidLidReminderSet: // A snooze time is active/set.
					pidLidReminderSet = (extendedProperty.getTagValue("t:Value") == "true");
					item.setProperty("X-PidLidReminderSet", pidLidReminderSet);
					break;
				default:
					if (propertyId != "") {
						if (item.title == "Nieuwe gebeurtenis2") if (this.debug) this.logInfo("@1:ODD propertyId:"+propertyId+"|"+extendedProperty.getTagValue("t:Value"));
					}
			}

		}

		// Check for Attachments
		this.addExchangeAttachmentToCal(aTask, item);

		item.setProperty("X-IsRecurring", aTask.getTagValue("t:IsRecurring"));

		if (aTask.getTagValue("t:IsRecurring") == "true") {
			item.parentItem = item;
			// This is a master so create recurrenceInfo.
			item.recurrenceInfo = this.readRecurrence(item, aTask);
			if (this.syncBusy) {
				this.readDeletedOccurrences(item, aTask);
			}
		}

		var tmpDate;

		tmpDate = this.tryToSetDateValue(aTask.getTagValue("t:DateTimeCreated"));
		if (tmpDate) {
            		item.setProperty("CREATED", tmpDate);
		}

		tmpDate = this.tryToSetDateValue(aTask.getTagValue("t:LastModifiedTime"));
		if (tmpDate) {
//			item.setProperty("LAST-MODIFIED", tmpDate);
		}

		item.setProperty("DESCRIPTION", aTask.getTagValue("t:Body"));

		//item.parentItem = item;

		item.setProperty("X-fromExchange", true);

		// See if this is a delegated task.
		var isNotAccepted = 0;

		for each (var extendedProperty in aTask.getTagValue("t:ExtendedProperty")) {

			if (extendedProperty.getAttributeByTag("t:ExtendedFieldURI","PropertyId") == "33032") {
				item.setProperty("X-exchWebService-PidLidTaskAccepted",extendedProperty.getTagValue("t:Value"));
				// TRUE means accepted or rejected.
				if (extendedProperty.getTagValue("t:Value") == "false") isNotAccepted++;
			}
			if (extendedProperty.getAttributeByTag("t:ExtendedFieldURI","PropertyId") == "33045") {
				item.setProperty("X-exchWebService-PidLidTaskLastUpdate",extendedProperty.getTagValue("t:Value"));
				// Date of last update. 
			}
			if (extendedProperty.getAttributeByTag("t:ExtendedFieldURI","PropertyId") == "33066") {
				item.setProperty("X-exchWebService-PidLidTaskAcceptanceState",extendedProperty.getTagValue("t:Value"));
				// Only visible on the Owner task item. Otherwise value == NoMatch
				//0x00000000 The task is not assigned.
				//0x00000001 The task’s acceptance status is unknown.
				//0x00000002 The task assignee accepted the task. This value is set when the client processes a task acceptance.
				//0x00000003 The task assignee rejected the task. This value is set when the client processes a task rejection.
				if (extendedProperty.getTagValue("t:Value") == "NoMatch") isNotAccepted++;
			}
			if (extendedProperty.getAttributeByTag("t:ExtendedFieldURI","PropertyId") == "33050") {
				item.setProperty("X-exchWebService-PidLidTaskHistory",extendedProperty.getTagValue("t:Value"));
				// Specifies last change to record. PidLidTaskLastUpdate shows date of this change.
				//0x00000004 The dispidTaskDueDate (PidLidTaskDueDate) property changed.
				//0x00000003 Another property was changed.
				//0x00000001 The task assignee accepted this task.
				//0x00000002 The task assignee rejected this task.
				//0x00000005 The task was assigned to a task assignee.
				//0x00000000 No changes were made.
				if (extendedProperty.getTagValue("t:Value") == "5") isNotAccepted++;
			}
			if (extendedProperty.getAttributeByTag("t:ExtendedFieldURI","PropertyId") == "33065") {
				item.setProperty("X-exchWebService-PidLidTaskOwnership",extendedProperty.getTagValue("t:Value"));
			}
		}
		if (aTask.getTagValue("t:Delegator") != "") {
			item.setProperty("X-exchWebService-Delegator",aTask.getTagValue("t:Delegator"));
			item.setProperty("X-exchWebService-Owner",aTask.getTagValue("t:Owner"));
			item.setProperty("X-exchWebService-IsTeamTask",aTask.getTagValue("t:IsTeamTask"));
		}
		
		this.setAlarm(item, aTask);  
		this.setSnoozeTime(item, null);

/*		if (isNotAccepted == 3) {
			item.makeImmutable();
		}*/

		return item;
	},

	convertExchangeUserAvailabilityToCalAppointment: function _convertExchangeUserAvailabilityToCalAppointment(aCalendarEvent)
	{
		if (aCalendarEvent.getTagValue("t:BusyType") == "Free") {
/*			var startDate = this.tryToSetDateValue(aCalendarEvent.getTagValue("t:StartTime"), null);
			var endDate = this.tryToSetDateValue(aCalendarEvent.getTagValue("t:EndTime"), null);

			// Cleanup items that were busy but are now free.
dump("\n== removed ==:"+aCalendarEvent.toString()+"\n");
			for (var index in this.itemCache) {
				if ((startDate.compare(this.itemCache[index].endDate) < 0) && (endDate.compare(this.itemCache[index].startDate) > 0)) {
					this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
					delete this.itemCache[index];
				}
			}*/
			
			return null;
		}

		var item = createEvent();
//		var item = Cc["@1st-setup.nl/exchange/calendarevent;1"]
//				.createInstance(Ci.mivExchangeEvent);
		item.calendar = this.superCalendar;

		item.id = this.md5(aCalendarEvent.toString());
		if (this.itemCache[item.id]) {
			return null;
		}

		item.title = this.tryToSetValue(aCalendarEvent.getTagValue("t:BusyType"), "");
		if (! item.title) {
			item.title = "";
		}

		if (aCalendarEvent.getTag("t:CalendarEventDetails")) {
			item.title = this.tryToSetValue(aCalendarEvent.getTag("t:CalendarEventDetails").getTagValue("t:Subject"), "")+" ("+item.title+")";

			item.setProperty("LOCATION", aCalendarEvent.getTag("t:CalendarEventDetails").getTagValue("t:Location"));
		}
		else {
			item.title = " ("+item.title+")";
		}

//		item.setProperty("DESCRIPTION", aCalendarItem.getTagValue("t:Body"));

		item.startDate = this.tryToSetDateValue(aCalendarEvent.getTagValue("t:StartTime"), null);
		if (! item.startDate) {
			if (this.debug) this.logInfo("We have an empty startdate. Skipping this item.");
			return null;
		}

		item.endDate = this.tryToSetDateValue(aCalendarEvent.getTagValue("t:EndTime"), null);
		if (! item.endDate) {
			if (this.debug) this.logInfo("We have an empty enddate. Skipping this item.");
			return null;
		}
//dump("\n-- added --:"+aCalendarEvent.toString()+"\n");
		return item;
	},

	convertExchangeToCal: function _convertExchangeToCal(aExchangeItem, erGetItemsRequest, doNotify)
	{
		if (this.debug) this.logInfo("convertExchangeToCal:"+aExchangeItem, 2);
		if (!aExchangeItem) { return; }

		var switchValue = aExchangeItem.getTagValue("t:ItemClass", "");
		if (switchValue.indexOf(".{") > -1) {
			switchValue = switchValue.substr(0,switchValue.indexOf(".{"));
		}

		if (switchValue.indexOf("IPM.Appointment") == 0) {

			if (this.debug) this.logInfo("INFO: convertExchangeToCal: ItemClass = '"+switchValue+"'", 2);
			switchValue = "IPM.Appointment";
		}

		switch (switchValue) {
			case "IPM.Appointment" :
			case "IPM.Appointment.Occurrence" :
			case "IPM.Appointment.MP" :
			case "IPM.Appointment.Live Meeting Request" :
			case "IPM.OLE.CLASS" :
			case "IPM.Schedule.Meeting.Request":
			case "IPM.Schedule.Meeting.Canceled":
				return this.convertExchangeAppointmentToCalAppointment(aExchangeItem, false, erGetItemsRequest, doNotify);
				break;
			case "IPM.Task" :
				return this.convertExchangeTaskToCalTask(aExchangeItem, erGetItemsRequest);
				break;
			default :
				if (aExchangeItem.tagName == "CalendarEvent") {
					return this.convertExchangeUserAvailabilityToCalAppointment(aExchangeItem);
				}

				if (this.debug) this.logInfo("WARNING: convertExchangeToCal: unknown ItemClass = '"+switchValue+"'");
		}
	},

	updateCalendar: function _updateCalendar(erGetItemsRequest, aItems, doNotify)
	{
		for (var index in aItems) {
			this.updateCalendarItems.push({ request: erGetItemsRequest,
							item: aItems[index],
							doNotify: doNotify});
		}

		if ((this.updateCalendarItems.length > 0) && (!this.updateCalendarTimerRunning)) {
			this.updateCalendarTimerRunning = true;
		        let self = this;
			this.observerService.notifyObservers(this, "onExchangeProgressChange", "2");
			this.updateCalendarTimer.initWithCallback({ notify: function setTimeout_notify() {self.doUpdateCalendarItem();	}}, 2, this.updateCalendarTimer.TYPE_REPEATING_SLACK);
		}
	},
	
	doUpdateCalendarItem: function _doUpdateCalendarItem()
	{
		if (this.updateCalendarItems.length > 0) {
			var tmpItems = [];
			var updateRecord = this.updateCalendarItems[0];
			tmpItems.push(updateRecord.item);
			this.updateCalendarItems.shift();
//			this.updateCalendar2(updateRecord.request, tmpItems, updateRecord.doNotify);
			this.updateCalendar2(updateRecord.request, tmpItems, true);
		}

		if (this.updateCalendarItems.length == 0) {
			this.observerService.notifyObservers(this, "onExchangeProgressChange", "-2");
			this.updateCalendarTimer.cancel();
			this.updateCalendarTimerRunning = false;
		}
	},

	updateCalendar2: function _updateCalendar2(erGetItemsRequest, aItems, doNotify)
	{
		//if (this.debug) this.logInfo("updateCalendar");
		var items = [];
		var convertedItems = [];
		if (this.debug) this.logInfo("updateCalendar: We have '"+aItems.length+"' items to update in calendar.");

		for (var index in aItems) {

			var item = this.convertExchangeToCal(aItems[index], erGetItemsRequest, doNotify);
			if (item) {
				convertedItems.push(item);
				if (!this.itemCache[item.id]) {
					// This is a new unknown item
					this.itemCache[item.id] = item;

					if (this.debug) this.logInfo("updateCalendar: onAddItem:"+ item.title);
					if (doNotify) {
						this.notifyTheObservers("onAddItem", [item]);
					}
					this.addToOfflineCache(item, aItems[index]);

				}
				else {
					// I Allready known this one.
					if (this.debug) this.logInfo("updateCalendar: onModifyItem:"+ item.title);

					this.singleModified(item, doNotify);
					this.addToOfflineCache(item, aItems[index]);
				}
			}

			aItems[index] = null;

		}

		return convertedItems;

	},


	getCalendarItemsOK: function _getCalendarItemsOK(erGetItemsRequest, aItems)
	{
//		if (this.debug) this.logInfo("getCalendarItemsOK: aItems.length="+aItems.length);
		this.saveCredentials(erGetItemsRequest.argument);
		this.notConnected = false;

		if (aItems.length == 0) {
			return;
		}

		this.updateCalendar(erGetItemsRequest, aItems, true, true);

	},

	getCalendarItemsError: function _getCalendarItemsError(erGetItemsRequest, aCode, aMsg)
	{
		this.saveCredentials(erGetItemsRequest.argument);
		this.notConnected = true;

	},

	get isVersion2010()
	{
		if (this.exchangeStatistics.getServerVersion(this.serverUrl).indexOf("2010") > -1 ) {
			return true;
		}

		return false;
	},

	get isVersion2007()
	{
		if (this.exchangeStatistics.getServerVersion(this.serverUrl).indexOf("2007") > -1 ) {
			return true;
		}

		return false;
	},

	set weAreSyncing(aValue)
	{
		if (aValue != this._weAreSyncing) {
			if (this.debug) this.logInfo("this._weAreSyncing changed from '"+this._weAreSyncing+"' to '"+aValue+"'");
		}
		this._weAreSyncing = aValue;
	},

	get weAreSyncing()
	{
		return this._weAreSyncing;
	},

	getSyncState: function _getSyncState()
	{
		if (this.isOffline) return;

		if (!this.weAreSyncing) {
			// We do not yet have a syncState. Get it first.
			if (this.debug) this.logInfo("Creating erSyncFolderItemsRequest");
			var self = this;
			this.weAreSyncing = true;

			this.addToQueue(erSyncFolderItemsRequest,
					{user: this.user, 
				 mailbox: this.mailbox,
				 serverUrl: this.serverUrl,
				 folderBase: this.folderBase,
				 folderID: this.folderID,
				 changeKey: this.changeKey,
				 syncState: this.syncState,
				 actionStart: Date.now() },
				function(erSyncFolderItemsRequest, creations, updates, deletions, syncState) { self.syncFolderItemsOK(erSyncFolderItemsRequest, creations, updates, deletions, syncState);}, 
				function(erSyncFolderItemsRequest, aCode, aMsg) { self.syncFolderItemsError(erSyncFolderItemsRequest, aCode, aMsg);},
				null);

		}
		else {
			if (this.debug) this.logInfo("not creating erSyncFolderItemsRequest because we are allready syncing");
		}
	},

	syncFolderItemsOK: function _syncFolderItemsOK(erSyncFolderItemsRequest, creations, updates, deletions, syncState)
	{
		this.folderPathStatus = 0;
		this.saveCredentials(erSyncFolderItemsRequest.argument);
		this.notConnected = false;

		if (this.debug) this.logInfo("syncFolderItemsOK: Creation:"+creations.length+", Updates:"+updates.length+", Deletions:"+deletions.length);

		if ((creations.length > 0) || (updates.length > 0) || (deletions.length > 0)) {
			this.addActivity(calGetString("calExchangeCalendar", "syncFolderEventMessage", [creations.length, updates.length, deletions.length, this.name], "exchangecalendar"), "", erSyncFolderItemsRequest.argument.actionStart, Date.now());
		}

		if (!this.syncState) {
			// This was the first time. we now save the syncState;
			this.syncState = syncState;
			this.prefs.setCharPref("syncState", syncState);
			this.weAreSyncing = false;
			this.processItemSyncQueue();

		}
		else {
			this.weAreSyncing = false;
			if ((creations.length == 0) && (updates.length == 0) && (deletions.length == 0)) {
				// Nothing was changed. 
				//if (this.debug) this.logInfo("Sync finished. Nothing finished.");
				this.syncState = syncState;
				this.prefs.setCharPref("syncState", syncState);

				if (this.getItemSyncQueue.length > 0) {
					if (this.debug) this.logInfo("We have "+this.getItemSyncQueue.length+" items in this.getItemSyncQueue");
				}

				this.processItemSyncQueue();

				if (!this.firstSyncDone) { 
					this.firstSyncDone = true;
					if (this.debug) this.logInfo("First sync is done. Normal operation is starting.");
				}

				return;
			}

			this.syncBusy = true;

			// Do something with the output.
			if ((this.syncState) && (syncState == this.syncState)) {
				this.logError("Same syncState received.");
			}

			this.syncState = syncState;
			this.prefs.setCharPref("syncState", syncState);

			var self = this;
			if (creations.length > 0) {
				this.addToQueue( erGetItemsRequest, 
					{user: this.user, 
					 mailbox: this.mailbox,
					 folderBase: this.folderBase,
					 serverUrl: this.serverUrl,
					 ids: creations,
					 folderID: this.folderID,
					 changeKey: this.changeKey,
					 folderClass: this.folderClass,
					 GUID: calExchangeCalendarGUID }, 
					function(erGetItemsRequest, aIds) { self.getTaskItemsOK(erGetItemsRequest, aIds);}, 
					function(erGetItemsRequest, aCode, aMsg) { self.getTaskItemsError(erGetItemsRequest, aCode, aMsg);},
					null);
			}

			if (updates.length > 0) {
				this.addToQueue( erGetItemsRequest, 
					{user: this.user, 
					 mailbox: this.mailbox,
					 folderBase: this.folderBase,
					 serverUrl: this.serverUrl,
					 ids: updates,
					 folderID: this.folderID,
					 changeKey: this.changeKey,
					 folderClass: this.folderClass,
					 GUID: calExchangeCalendarGUID }, 
					function(erGetItemsRequest, aIds) { self.getTaskItemsOK(erGetItemsRequest, aIds);}, 
					function(erGetItemsRequest, aCode, aMsg) { self.getTaskItemsError(erGetItemsRequest, aCode, aMsg);},
					null);
			}

			if (deletions.length > 0) {
				for each (var deleted in deletions) {
					var item = this.itemCache[deleted.Id];
					if (item) {
						// We have this one. Remove it.
						if (this.debug) this.logInfo("Going to remove an item");
						// Single item or occurrence.
						if (item.parentItem.id == item.id) {
							if (this.debug) this.logInfo("This is a Single to delete");
						}
						else {
							if (this.debug) this.logInfo("This is a Occurrence or Exception to delete. THIS SHOULD NEVER HAPPEN.");
						}
						this.notifyTheObservers("onDeleteItem", [item]);
						delete this.itemCache[item.id];
					}
					else {
						// Find matching master record.
						var master;
						for (var index in this.recurringMasterCache) {
							if ((this.recurringMasterCache[index]) && (this.recurringMasterCache[index].id == deleted.Id)) {
								master = this.recurringMasterCache[index]
							}
						}
						if (master) {
							// This is a master recurrence. Also remove children.
							if (this.debug) this.logInfo("This is Master to delete");
							this.removeChildrenFromMaster(master);
							this.notifyTheObservers("onDeleteItem", [master]);
							delete this.recurringMasterCache[master.getProperty("X-UID")];
						}
						else {
							if (this.debug) this.logInfo("Do not know what you are trying to delete !!!");
						}
					}
				}
				this.syncBusy = false;

				this.processItemSyncQueue();

			}

			if (!this.firstSyncDone) { 
				this.firstSyncDone = true;
				if (this.debug) this.logInfo("First sync is done. Normal operation is starting.");
			}

		}

	},

	syncFolderItemsError: function _syncFolderItemsError(erSyncFolderItemsRequest, aCode, aMsg)
	{
		if (this.debug) this.logInfo("syncFolderItemsError");
		this.folderPathStatus = -1;
		this.saveCredentials(erSyncFolderItemsRequest.argument);
		this.notConnected = true;
		this.weAreSyncing = false;
		this.processItemSyncQueue();
	},

	// Check if specified folder still exists. If so get new id and changekey.
	checkFolderPath: function _checkFolderPath()
	{
		// We first restore from prefs.js file from the last time.
		var tmpFolderClass = this.globalFunctions.safeGetCharPref(this.prefs,"folderClass", null);
		if (tmpFolderClass) {
			if (this.debug) this.logInfo("Restore folderClass from prefs.js:"+tmpFolderClass);
			this.setSupportedItems(tmpFolderClass);

			var tmpFolderProperties = this.globalFunctions.safeGetCharPref(this.prefs,"folderProperties", null);
			if (tmpFolderProperties) {
				//if (this.debug) this.logInfo("Restore folderProperties from prefs.js:"+tmpFolderProperties);
				var tmpXML = this.globalFunctions.xmlToJxon(tmpFolderProperties);
				this.folderProperties = tmpXML;
				this.setFolderProperties(tmpXML, tmpFolderClass);
			}
		}

		var prefServerVersion = this.globalFunctions.safeGetCharPref(this.prefs,"lastServerVersion", null);
		if (prefServerVersion) {
			if (this.debug) this.logInfo("Restored prefServerVersion from prefs.js:"+prefServerVersion);
			this.exchangeStatistics.getServerVersion(this.serverUrl, prefServerVersion);
		}

		if (this.isOffline) return;

		if (this.folderPath != "/") {
			if (this.debug) this.logInfo("checkFolderPath 1");
			this.folderPathStatus = 1;
			var self = this;

			this.addToQueue( erFindFolderRequest,
				{user: this.user, 
				 mailbox: this.mailbox,
				 serverUrl: this.serverUrl,
				 folderBase: this.folderBase,
				 folderPath: this.folderPath,
				 actionStart: Date.now()}, 
				function(erFindFolderRequest, aId, aChangeKey, aFolderClass) { self.checkFolderPathOk(erFindFolderRequest, aId, aChangeKey, aFolderClass);}, 
				function(erFindFolderRequest, aCode, aMsg) { self.checkFolderPathError(erFindFolderRequest, aCode, aMsg);},
				null);
		}
		else {
			if (this.folderIDOfShare != "") {
				// Get Folder Properties.
				var self = this;

				this.addToQueue( erGetFolderRequest,
					{user: this.user, 
					 mailbox: this.mailbox,
					 serverUrl: this.serverUrl,
					 folderID: this.folderID,
					 changeKey: this.changeKey,
					 actionStart: Date.now()}, 
					function(erGetFolderRequest, aId, aChangeKey, aFolderClass) { self.getFolderOk(erGetFolderRequest, aId, aChangeKey, aFolderClass);}, 
					function(erGetFolderRequest, aCode, aMsg) { self.checkFolderPathError(erGetFolderRequest, aCode, aMsg);},
					null);
			}
			else {
				if (this.debug) this.logInfo("checkFolderPath 2");
				this.folderPathStatus = 1;
				var self = this;
	
				this.addToQueue( erGetFolderRequest,
					{user: this.user, 
					 mailbox: this.mailbox,
					 serverUrl: this.serverUrl,
					 folderBase: this.folderBase,
					 folderPath: this.folderPath,
					 actionStart: Date.now()}, 
					function(erGetFolderRequest, aId, aChangeKey, aFolderClass) { self.getFolderOk(erGetFolderRequest, aId, aChangeKey, aFolderClass);}, 
					function(erGetFolderRequest, aCode, aMsg) { self.checkFolderPathError(erGetFolderRequest, aCode, aMsg);},
					null);
			}
		}
	},

	setSupportedItems: function _setSupportedItems(aFolderClass)
	{
		this.folderClass = aFolderClass;
		if (this.debug) this.logInfo("Set folderClass="+this.folderClass.toString());
		this.prefs.setCharPref("folderClass", aFolderClass);
		var itemType = Ci.calICalendar.ITEM_FILTER_TYPE_EVENT;

		switch (aFolderClass.toString()) {
			case "IPF.Appointment":
				this.supportsEvents = true;
				this.supportsTasks = false;
				if (this.debug) this.logInfo("This folder supports only events.");
				//this.getItems(Ci.calICalendar.ITEM_FILTER_TYPE_EVENT, 0, this.startCacheDate, this.endCacheDate, null);
				break;
			case "IPF.Task":
				this.supportsEvents = false;
				this.supportsTasks = true;
				if (this.debug) this.logInfo("This folder supports only tasks.");
				itemType = Ci.calICalendar.ITEM_FILTER_TYPE_TODO;
				// Get the tasks for the current know time frame
				//this.getItems(Ci.calICalendar.ITEM_FILTER_TYPE_TODO, 0, this.startCacheDate, this.endCacheDate, null);
				break;
			case "IPF.Note":
				this.supportsEvents = true;
				this.supportsTasks = true;
				if (this.debug) this.logInfo("This folder supports events and tasks.");
				break;
			default:
				this.supportsEvents = false;
				this.supportsTasks = false;
				if (this.debug) this.logInfo("Unknown folderclass. We do not know if it supports events or tasks so turning it off.");
				break;
		}		

	},

	checkFolderPathOk: function _checkFolderPathOk(erFindFolderRequest, aId, aChangeKey, aFolderClass)
	{
		this.saveCredentials(erFindFolderRequest.argument);
		if (this.debug) this.logInfo("checkFolderPathOk: aId"+aId+", aChangeKey:"+aChangeKey+", aFolderClass:"+aFolderClass);
		this.notConnected = false;
		
		this.folderID = aId;
		this.changeKey = aChangeKey;
		
		this.setSupportedItems(aFolderClass);

		// Get Folder Properties.
		var self = this;

		this.addToQueue( erGetFolderRequest,
			{user: this.user, 
			 mailbox: this.mailbox,
			 serverUrl: this.serverUrl,
			 folderID: aId,
			 changeKey: aChangeKey,
			 actionStart: Date.now()}, 
			function(erGetFolderRequest, aId, aChangeKey, aFolderClass) { self.getFolderOk(erGetFolderRequest, aId, aChangeKey, aFolderClass);}, 
			function(erGetFolderRequest, aCode, aMsg) { self.checkFolderPathError(erGetFolderRequest, aCode, aMsg);},
			null);
		
	},

	setFolderProperties: function _setFolderProperties(aFolderProperties, aFolderClass)
	{
		//BUG 111
		// When the user only has permissions to see free/busy info and also permissions to read the folder
		// properties we should activate OnlyShowAvailability variable.
		// Problem is when is this condition true
		// For now we will set OnlyShowAvailability = true when EffectiveRights.Read == false
		if (this.debug) this.logInfo(" >>>>>>>>>>>>>>MIV>:"+aFolderClass.toString());
		var rm = aFolderProperties.XPath("/s:Envelope/s:Body/m:GetFolderResponse/m:ResponseMessages/m:GetFolderResponseMessage/m:Folders/*/t:EffectiveRights[t:Read='true']");

		if (rm.length == 0) {
			if (this.debug) this.logInfo("getFolderOk: but EffectiveRights.Read == false. Only getting Free/Busy information.");
			if (!this.OnlyShowAvailability) {
				this.OnlyShowAvailability = true;
				this.getOnlyFreeBusyInformation(this.lastValidRangeStart, this.lastValidRangeEnd);
				this.startCalendarPoller();
			}		
		}
		else {
			if (this.debug) this.logInfo("getFolderOk: but EffectiveRights.Read != false. Trying to get all event information.");
			this.readOnly = false;

			this.setSupportedItems(aFolderClass);		
		}
		rm = null;

		this.getTimeZones();

	},

	getFolderOk: function _getFolderOk(erGetFolderRequest, aId, aChangeKey, aFolderClass)
	{
		this.saveCredentials(erGetFolderRequest.argument);
		if (this.debug) this.logInfo("getFolderOk: aId"+aId+", aChangeKey:"+aChangeKey+", aFolderClass:"+aFolderClass);
		this.notConnected = false;
		
		this.folderProperties = erGetFolderRequest.properties;
		this.prefs.setCharPref("folderProperties", this.folderProperties.toString());

		this.prefs.setCharPref("lastServerVersion", this.exchangeStatistics.getServerVersion(this.serverUrl));

		this.setFolderProperties(this.folderProperties, aFolderClass);

		if (this.newCalendar) {
			this.newCalendar = false;
			if (this.supportsEvents) {
				this.getItems(Ci.calICalendar.ITEM_FILTER_TYPE_EVENT, 0, this.newCalRangeStartEvents, this.newCalRangeEndEvents, null);
			}
			if (this.supportsTasks) {
				this.getItems(Ci.calICalendar.ITEM_FILTER_TYPE_TODO, 0, this.newCalRangeStartTodos, this.newCalRangeEndTodos, null);
			}
		}
	},

	checkFolderPathError: function _checkFolderPathError(erFindFolderRequest, aCode, aMsg)
	{
		this.folderPathStatus = -1;
		if (this.debug) this.logInfo("checkFolderPathError: Code:"+aCode+", Msg:"+aMsg);
		// We could not get the specified folder anymore. Stop working.
		// 21-03-2012 Try to get Free/Busy/Tentative information and show that.

		if (aCode == -10) {
			this.notConnected = true;
		}
		else {

			if (!this.OnlyShowAvailability) {
				this.OnlyShowAvailability = true;
				this.getOnlyFreeBusyInformation(this.lastValidRangeStart, this.lastValidRangeEnd);
				this.startCalendarPoller();
			}		
		}
	},

	getOnlyFreeBusyInformation: function _getOnlyFreeBusyInformation(aRangeStart, aRangeEnd)
	{
		if (this.debug) this.logInfo("getOnlyFreeBusyInformation");
		if ((!aRangeStart) || (!aRangeEnd)) {
			return;
		}

		var self = this;
		var tmpStartDate = aRangeStart.clone();
		tmpStartDate.isDate = false;
		var tmpEndDate = aRangeEnd.clone();
		tmpEndDate.isDate = false;

		this.addToQueue( erGetUserAvailabilityRequest, 
			{user: this.user, 
			 folderBase: "calendar",
			 serverUrl: this.serverUrl,
			 email: this.mailbox.replace(/^MAILTO:/, ""),
			 attendeeType: 'Required',
			 start: cal.toRFC3339(tmpStartDate.getInTimezone(this.globalFunctions.ecUTC())),
			 end: cal.toRFC3339(tmpEndDate.getInTimezone(this.globalFunctions.ecUTC())),
			 folderID: this.folderID,
			 changeKey: this.changeKey }, 
			function(erGetUserAvailabilityRequest, aEvents) { self.getUserAvailabilityRequestOK(erGetUserAvailabilityRequest, aEvents);}, 
			function(erGetUserAvailabilityRequest, aCode, aMsg) { self.getUserAvailabilityRequestError(erGetUserAvailabilityRequest, aCode, aMsg);},
			null);
	},

	get ews_2010_timezonedefinitions()
	{
		return global_ews_2010_timezonedefinitions;

		if (!this._ews_2010_timezonedefinitions) {

			var somefile = chromeToPath("chrome://exchangecalendar/content/ewsTimesZoneDefinitions_2007.xml");
			var file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
			if (this.debug) this.logInfo("Will use local file for timezone data for 2007. name:"+somefile);
			file.initWithPath(somefile);

			var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].  
					 createInstance(Components.interfaces.nsIFileInputStream);  
			istream.init(file, -1, -1, 0);  
			istream.QueryInterface(Components.interfaces.nsILineInputStream);  
			  
			// read lines into array  
			var line = {}, lines = "", hasmore;  
			do {  
				hasmore = istream.readLine(line);  
				lines += line.value;   
			} while(hasmore);  
			  
			istream.close();

			try {
				try {
				    this._ews_2010_timezonedefinitions = Cc["@1st-setup.nl/conversion/xml2jxon;1"]
						       .createInstance(Ci.mivIxml2jxon);
				}
				catch(exc) { if (this.debug) this.logInfo("createInstance error:"+exc);}


				try {
					this._ews_2010_timezonedefinitions.processXMLString(lines, 0, null);
				}
				catch(exc) { if (this.debug) this.logInfo("processXMLString error:"+exc.name+", "+exc.message);} 

			}
			catch(exc) {if (this.debug) this.logInfo("Could not convert timezone xml file into XML object:"+exc); };

			if (this.debug) this.logInfo("End of get ews_2010_timezonedefinitions");
		}

		return this._ews_2010_timezonedefinitions;
	},

	getEWSTimeZones: function _getEWSTimeZones(aTimeZoneDefinitions)
	{
		var rm = aTimeZoneDefinitions.XPath("/s:Envelope/s:Body/m:GetServerTimeZonesResponse/m:ResponseMessages/m:GetServerTimeZonesResponseMessage");
		if (rm.length == 0) return null;

		var timeZoneDefinitions = {};

		var timeZoneDefinitionArray = rm[0].XPath("/m:TimeZoneDefinitions/t:TimeZoneDefinition");
		if (this.debug) this.logInfo("$$$ timeZoneDefinitionArray.length:"+timeZoneDefinitionArray.length);
		for (var index in timeZoneDefinitionArray) {
			timeZoneDefinitions[timeZoneDefinitionArray[index].getAttribute("Id")] = timeZoneDefinitionArray[index];
		}
		rm = null;
		return timeZoneDefinitions;
	},

	getTimeZones: function _getTimeZones()
	{
		var tmpTimer = Cc["@mozilla.org/timer;1"]
				.createInstance(Ci.nsITimer);

		var self = this;
		tmpTimer.initWithCallback({ notify: function setTimeout_notify() {self.getTimeZones2();	}}, 1, this.cacheLoader.TYPE_ONE_SHOT);
		
	},

	getTimeZones2: function _getTimeZones2()
	{
		// This only works for Exchange 2010 servers
		if (this.debug) this.logInfo("getTimeZones 1");
		var self = this;
		if (this.isVersion2010) {
			this.addToQueue(erGetTimeZonesRequest,
					{user: this.user, 
					 serverUrl: this.serverUrl,
					 actionStart: Date.now() },
					function(erGetTimeZonesRequest, aTimeZoneDefinitions) { self.getTimeZonesOK(erGetTimeZonesRequest, aTimeZoneDefinitions);}, 
					function(erGetTimeZonesRequest, aCode, aMsg) { self.getTimeZonesError(erGetTimeZonesRequest, aCode, aMsg);},
					null);
		}

		if (this.isVersion2007) {
			if (this.debug) this.logInfo("getTimeZones 2");
			if (this.debug) this.logInfo("getTimeZones for 2007");
			//this.EWSTimeZones = this.getEWSTimeZones(this.ews_2010_timezonedefinitions);
			this.EWSTimezones = globalTimeZoneDefinitions;
			this.haveTimeZones = true;
		}
	},

	getTimeZonesOK: function _getTimeZonesOK(erGetTimeZonesRequest, aTimeZoneDefinitions)
	{
		this.notConnected = false;
		this.saveCredentials(erGetTimeZonesRequest.argument);
		this.EWSTimeZones = this.getEWSTimeZones(aTimeZoneDefinitions);
		if (this.debug) this.logInfo("getTimeZonesOK");
		this.haveTimeZones = true;
	},

	getTimeZonesError: function _getTimeZonesError(erGetTimeZonesRequest, aCode, aMsg)
	{
		if (this.debug) this.logInfo("getTimeZonesError: Msg"+aMsg);
		this.haveTimeZones = false;
		this.notConnected = true;
	},

	calculateBiasOffsets: function _calculateBiasOffsets(aCalTimeZone)
	{
		var tzcomp = aCalTimeZone.icalComponent;
		if (!tzcomp) {
			return {};
		}
	
		var dsttz = null;
		for (var comp = tzcomp.getFirstSubcomponent("DAYLIGHT");
		     comp;
		     comp = tzcomp.getNextSubcomponent("DAYLIGHT")) {
			if (!dsttz || dsttz.getFirstProperty("DTSTART").valueAsDatetime.compare(
					comp.getFirstProperty("DTSTART").valueAsDatetime) < 0) {
				dsttz = comp;
			}
		}
		var stdtz = null;
		for (var comp = tzcomp.getFirstSubcomponent("STANDARD");
		     comp;
		     comp = tzcomp.getNextSubcomponent("STANDARD")) {
			if (!stdtz || stdtz.getFirstProperty("DTSTART").valueAsDatetime.compare(
					comp.getFirstProperty("DTSTART").valueAsDatetime) < 0) {
				stdtz = comp;
			}
		}
	
		if (!stdtz) {
			return {};
		}
	
		// Get TZOFFSETTO from standard time.
		var m = stdtz.getFirstProperty("TZOFFSETTO").value.match(/^([+-]?)(\d\d)(\d\d)$/);
		var biasOffset = cal.createDuration();
		biasOffset.hours = m[2];
		biasOffset.minutes = m[3];
		if (m[1] == '+') {
			biasOffset.isNegative = true;
		}

		var tmpBaseOffset = biasOffset.icalString;

		var daylightOffset = null;
		if (dsttz) {
			var m = dsttz.getFirstProperty("TZOFFSETTO").value.match(/^([+-]?)(\d\d)(\d\d)$/);
			daylightOffset = cal.createDuration();
			daylightOffset.hours = m[2];
			daylightOffset.minutes = m[3];
			if (m[1] == '+') {
				daylightOffset.isNegative = true;
			}
		}
	
		if (daylightOffset) {
			return { standard: biasOffset.icalString,
				 daylight: daylightOffset.icalString } ;
		}
		else {
			return { standard: biasOffset.icalString,
				 daylight: null } ;
		}
	},

	convertDurationToSeconds: function _convertDurationToSeconds(aDuration)
	{
		return this.globalFunctions.convertDurationToSeconds(aDuration);
	},

	getEWSTimeZoneId: function _getEWSTimeZoneId(aCalTimeZone)
	{
		if (this.debug) this.logInfo("getEWSTimeZoneId:"+aCalTimeZone.tzid);

		if (this.EWSTimeZones) {
			
			if (aCalTimeZone.isFloating) {
				var tmpZone = this.globalFunctions.ecDefaultTimeZone();
			}
			else {
				var tmpZone = aCalTimeZone;
			}

			var weHaveAMatch = null;
			var tmpPlaceName = null;
			var tmpId = null;
			if (tmpZone.tzid.indexOf("/") > -1) {
				// Get City/Place name from tzid.
				tmpPlaceName = tmpZone.tzid.substr(tmpZone.tzid.indexOf("/")+1);
			}
			else {
				tmpId = tmpZone.tzid.toString();
			}


			var tmpBiasValues = this.calculateBiasOffsets(tmpZone);
			if (!tmpBiasValues.standard) {
				return "UTC";
			}

			//if (tmpBiasValues.standard.indexOf("PT0") == 0) {
			//	if (this.debug) this.logInfo("Changing tmpBiasValues.standard="+tmpBiasValues.standard+ " -> PT0H");
			//	tmpBiasValues.standard = "PT0H";
			//}
			if (this.debug) this.logInfo("tmpBiasValues.standard="+tmpBiasValues.standard);
			if (tmpBiasValues.daylight) {
				if (tmpBiasValues.daylight == tmpBiasValues.standard) {
					if (this.debug) this.logInfo("tmpBiasValues.daylight == tmpBiasValues.standard Not going to use daylight value.");
					tmpBiasValues.daylight = null;
				}
				else {
					if (this.debug) this.logInfo("tmpBiasValues.daylight="+tmpBiasValues.daylight);
				}
			}

			for each(var timeZoneDefinition in this.EWSTimeZones) {
				//if (this.debug) this.logInfo("timeZoneDefinition.@Name="+timeZoneDefinition.@Name);
				var placeNameMatch = false;
				if ((tmpPlaceName) && (timeZoneDefinition.getAttribute("Name", "").indexOf(tmpPlaceName) > -1)) {
					// We found our placename in the name of the timezonedefinition
					placeNameMatch = true;
				}

				var idMatch = false;
				if ((tmpId) && (timeZoneDefinition.getAttribute("Id", "") == tmpId)) {
					// We found our tmpId in the id of the timezonedefinition
					idMatch = true;
				}

				var standardMatch = null;
				var periods = timeZoneDefinition.XPath("/t:Periods/t:Period[@Name = 'Standard']");
				if (periods.length > 0) {
					for (var index in periods) {
						//if (this.debug) this.logInfo("xx period.@Bias="+period.@Bias.toString());
						if (this.convertDurationToSeconds(periods[index].getAttribute("Bias")) == this.convertDurationToSeconds(tmpBiasValues.standard)) {
							standardMatch = periods[index].getAttribute("Bias", null);
							break;
						}
					}
				}
				periods = null;

				if (standardMatch) {
					var daylightMatch = null;
					if (tmpBiasValues.daylight) {
						var periods = timeZoneDefinition.XPath("/t:Periods/t:Period[@Name = 'Daylight']");
						if (periods.length > 0) {
							for (var index in periods) {
								//if (this.debug) this.logInfo("yy period.@Bias="+period.@Bias.toString());
								if (this.convertDurationToSeconds(periods[index].getAttribute("Bias")) == this.convertDurationToSeconds(tmpBiasValues.daylight)) {
									daylightMatch = periods[index].getAttribute("Bias", null);
									break;
								}
							}
						}
						periods = null;
					}
	
					if ((standardMatch) && ((!tmpBiasValues.daylight) || (daylightMatch))) {
						if (this.debug) this.logInfo("WE HAVE A TIMEZONE MATCH BETWEEN LIGHTNING AND this.globalFunctions. Cal:"+aCalTimeZone.tzid+", EWS:"+timeZoneDefinition.getAttribute("Name"));
	
						// If we also found the place name this will overrule everything else.
						if ((placeNameMatch) || (idMatch) || (!weHaveAMatch)) {
							weHaveAMatch = timeZoneDefinition.getAttribute("Id");
	
							if (placeNameMatch) {
								if (this.debug) this.logInfo("We have a timzonematch on place name");
								break;
							}
							if (idMatch) {
								if (this.debug) this.logInfo("We have a timzonematch on id");
								break;
							}
						}
					}
				}

			}

			return weHaveAMatch;
		}

		return "UTC";
	},

	doDeleteCalendar: function _doDeleteCalendar()
	{
		this.doShutdown();

		// Remove the offline cache database when we delete the calendar.
		if (this.dbFile) {
			this.dbFile.remove(true);
			this.offlineCacheDB = null;
		}
	},

	doShutdown: function _doShutdown()
	{
		if (this.shutdown) {
			return;
		}

		this.shutdown = true;
		this.inboxPoller.cancel();

		if (this.offlineTimer) {
			this.offlineTimer.cancel();
		}

		if (this.calendarPoller) {
			this.calendarPoller.cancel();
		}

		this.loadBalancer.stopRunningJobsForCalendar(this.serverUrl, this);

		this.loadBalancer.clearQueueForCalendar(this.serverUrl, this);
		this.offlineQueue = [];

		// Now we can initialize.
		this.syncState = null;
		this.weAreSyncing = false;
		
		// Remove all items in cache from calendar.
/*		for (var index in this.itemCache) {
			if (this.itemCache[index]) {
				this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
			}
		}  // This is removed to speed up shutdown */

		// Reset caches.
		this.itemCache = [];
		this.recurringMasterCache = [];

		this.meetingRequestsCache = [];
		this.meetingCancelationsCache = [];
		this.meetingrequestAnswered = [];
		this.meetingResponsesCache = [];

		if (this.offlineCacheDB) {
			try {
				if (this.offlineCacheDB) this.offlineCacheDB.close();
				this.offlineCacheDB = null;
			} catch(exc) {}
		}
	},

	removeFromMeetingRequestCache: function _removeFromMeetingRequestCache(aID) {
		//if (this.debug) this.logInfo("removeFromMeetingRequestCache:"+aUID);
//		this.meetingRequestsCache[aUID] == null;
		delete this.meetingRequestsCache[aID];
	},

	doTimezoneChanged: function _doTimezoneChanged()
	{
		if (this.debug) this.logInfo("doTimeZoneChanged 1");
		return;

		var prefTzid = cal.getPrefSafe("calendar.timezone.local", null);
		if (this.debug) this.logInfo("-- New timezone id:"+prefTzid);
		var newTimezone = this.globalFunctions.ecTZService().getTimezone(prefTzid);
		if (this.debug) this.logInfo("doTimeZoneChanged 2");

		// Get all cached items into new timezone
		for (var index in this.itemCache) {
			if (this.itemCache[index]) {
				//var oldItem = this.itemCache[index].clone();
				var oldItem = this.cloneItem(this.itemCache[index]);
				if (! this.itemCache[index].startDate.isDate) {
					if (this.debug) this.logInfo("mod startDate 1:"+this.itemCache[index].startDate.toString());
					this.itemCache[index].startDate = this.itemCache[index].startDate.getInTimezone(newTimezone);
					if (this.debug) this.logInfo("mod startDate 2:"+this.itemCache[index].startDate.toString());
				}
				if (! this.itemCache[index].endDate.isDate) {
					if (this.debug) this.logInfo("mod endDate");
					this.itemCache[index].endDate = this.itemCache[index].endDate.getInTimezone(newTimezone);
				}
				this.notifyTheObservers("onModifyItem", [this.itemCache[index],oldItem]);
			}
		}
		if (this.debug) this.logInfo("doTimeZoneChanged 3");

	},

	findItemInListByDatesAndID: function _findItemInListByDates(aList, aItem)
	{
		var result = null;
		for each(var listItem in aList) {
			if ((aItem.id == listItem.getProperty("X-UID")) &&
				(listItem.startDate.compare(aItem.startDate) == 0) &&
				(listItem.endDate.compare(aItem.endDate) == 0)) {
				if (this.debug) this.logInfo("Found matching item in list.");
				result = listItem;
			}
		}

		return result;
	},

	createOfflineCacheDB: function _createOfflineCacheDB()
	{
		if ((this.mUseOfflineCache) && (!this.offlineCacheDB)) {
			this.noDB = true;
			this.dbInit = true;
			this.dbFile = Cc["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
			this.dbFile.append("exchange-data");
			if ( !this.dbFile.exists() || !this.dbFile.isDirectory() ) {
				this.dbFile.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
			}

			this.dbFile.append(this.id+".offlineCache.sqlite");

			var dbExists = false;
			if (this.dbFile.exists()) {
				dbExists = true;
			}

			try {
				this.offlineCacheDB = Services.storage.openUnsharedDatabase(this.dbFile); // Will also create the file if it does not exist
			}
			catch(exc) {
				this.offlineCacheDB = null;
				if (this.debug) this.logInfo("Could not open offlineCache database.");
				return;
			}

			if (!this.offlineCacheDB.connectionReady) {
				this.offlineCacheDB = null;
				if (this.debug) this.logInfo("connectionReady for offlineCache database.");
				return;
			}

			var latestDBVersion = 1;
			var dbVersion = 0;
			if (dbExists) {
				dbVersion = this.globalFunctions.safeGetIntPref(this.prefs, "dbVersion", 0);
			}

			if (dbVersion < latestDBVersion) {
				if (!this.offlineCacheDB.tableExists("items")) {
					if (this.debug) this.logInfo("Table 'items' does not yet exist. We are going to create it.");
					try {
						this.offlineCacheDB.createTable("items", "event STRING, id STRING, changeKey STRING, startDate STRING, endDate STRING, uid STRING, type STRING, parentItem STRING, item STRING");
					}
					catch(exc) {
						if (this.debug) this.logInfo("Could not create table 'items'. Error:"+exc);
						return;
					}

					var sqlStr = "CREATE INDEX idx_items_id ON items (id)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_id'");
						this.offlineCacheDB = null;
						return;
					}

					var sqlStr = "CREATE INDEX idx_items_type ON items (type)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_type'");
						this.offlineCacheDB = null;
						return;
					}

					var sqlStr = "CREATE UNIQUE INDEX idx_items_id_changekey ON items (id, changeKey)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_id_changekey'");
						this.offlineCacheDB = null;
						return;
					}

					var sqlStr = "CREATE INDEX idx_items_type_uid ON items (type ASC, uid)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_type_uid'");
						this.offlineCacheDB = null;
						return;
					}

					var sqlStr = "CREATE INDEX idx_items_uid ON items (uid)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_uid'");
						this.offlineCacheDB = null;
						return;
					}

					var sqlStr = "CREATE INDEX idx_items_uid_startdate_enddate ON items (uid, startDate ASC, endDate)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_uid_startdate_enddate'");
						this.offlineCacheDB = null;
						return;
					}

					var sqlStr = "CREATE INDEX idx_items_startdate_enddate ON items (startDate ASC, endDate)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_startdate_enddate'");
						this.offlineCacheDB = null;
						return;
					}

					var sqlStr = "CREATE INDEX idx_items_parentitem_startdate_enddate ON items (parentitem, startDate ASC, endDate)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_startdate_enddate'");
						this.offlineCacheDB = null;
						return;
					}

					var sqlStr = "CREATE INDEX idx_items_type_startdate_enddate ON items (type, startDate ASC, endDate)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_items_type_startdate_enddate'");
						this.offlineCacheDB = null;
						return;
					}

				}

				if (!this.offlineCacheDB.tableExists("attachments")) {
					if (this.debug) this.logInfo("Table 'attachments' does not yet exist. We are going to create it.");
					try {
						this.offlineCacheDB.createTable("attachments", "id STRING, name STRING, size INTEGER, cachePath STRING");
					}
					catch(exc) {
						if (this.debug) this.logInfo("Could not create table 'attachments'. Error:"+exc);
						return;
					}

					var sqlStr = "CREATE UNIQUE INDEX idx_att_id ON attachments (id)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_att_id'");
						this.offlineCacheDB = null;
						return;
					}

				}

				if (!this.offlineCacheDB.tableExists("attachments_per_item")) {
					if (this.debug) this.logInfo("Table 'attachments_per_item' does not yet exist. We are going to create it.");
					try {
						this.offlineCacheDB.createTable("attachments_per_item", "itemId STRING, attId STRING");
					}
					catch(exc) {
						if (this.debug) this.logInfo("Could not create table 'attachments_per_item'. Error:"+exc);
						return;
					}

					var sqlStr = "CREATE INDEX idx_attitem_itemid ON attachments_per_item (itemId)";
					if (!this.executeQuery(sqlStr)) {
						if (this.debug) this.logInfo("Could not create index 'idx_attitem_itemid'");
						this.offlineCacheDB = null;
						return;
					}
				}

				if (this.debug) this.logInfo("Created/opened offlineCache database.");
				// Fix the database corruption bug from version 2.0.0-2.0.3 (fixed in version 2.0.4) 26-05-2012
				if (this.debug) this.logInfo("Running fix for database corruption bug from version 2.0.0-2.0.3 (fixed in version 2.0.4)");
				var masters = this.executeQueryWithResults("SELECT uid FROM items WHERE type='M'",["uid"]);
				if ((masters) && (masters.length > 0)) {
					for (var index in masters) {
						var newMasterEndDate = this.executeQueryWithResults("SELECT max(endDate) as newEndDate FROM items WHERE uid='"+masters[index].uid+"'",["newEndDate"]);
						if ((newMasterEndDate) && (newMasterEndDate.length > 0)) {
							if (this.debug) this.logInfo("newMasterEndDate:"+newMasterEndDate[0].newEndDate);
							var endDateStr = newMasterEndDate[0].newEndDate;
							if (endDateStr) {
								if (endDateStr.length == 10) {
									endDateStr += "T23:59:59Z";
								}
								if (this.debug) this.logInfo("newEndDate for master setting it to:"+endDateStr);
								this.executeQuery("UPDATE items set endDate='"+endDateStr+"' where type='M' AND uid='"+masters[index].uid+"'");
							}
							else {
								if (this.debug) this.logInfo("newEndDate for master is null not going to use this. Strange!!");
							}
						}
						else {
							if (this.debug) this.logInfo("Could not get newEndDate for Master. What is wrong!!"); 
						} 
					}
				} 
				this.prefs.setIntPref("dbVersion", latestDBVersion);

			}
			this.executeQuery("UPDATE items set event='y' where event='y_'");
			this.executeQuery("UPDATE items set event='n' where event='n_'");

			this.dbInit = false;
			this.noDB = false;
		}
		else {
			this.noDB = true;
			var tryCount = 0;
			while ((this.offlineCacheDB) && (tryCount < 3)) {
				try{
					if (this.offlineCacheDB) this.offlineCacheDB.close();
					this.offlineCacheDB = null;
				}
				catch(exc){
					dump("\nUnable to close offlineCache database connection:"+exc+"\n");
//					if (this.debug) this.logInfo("Unable to close offlineCache database connection:"+exc);
					tryCount++;	
				}
			}
			this.offlineCacheDB = null;
		}		
	},

	get useOfflineCache()
	{
		if (this.mUseOfflineCache) {
			return this.mUseOfflineCache;
		}
		else {
			this.mUseOfflineCache = this.globalFunctions.safeGetBoolPref(this.prefs, "useOfflineCache", true);
			this.createOfflineCacheDB();
			return this.mUseOfflineCache;
		}
	},

	set useOfflineCache(aValue)
	{
		var oldValue = this.mUseOfflineCache;
		this.mUseOfflineCache = aValue;
		this.prefs.setBoolPref("useOfflineCache", aValue);
		this.createOfflineCacheDB();

		if ((oldValue != aValue) && (aValue)) {
			this.syncExchangeToOfflineCache();
		}
	},

	getItemType: function _getItemType(aCalItem)
	{
		if (aCalItem.id == aCalItem.parentItem.id) {
			// Master or Single
			if (aCalItem.recurrenceInfo) {
				return "M";
			}
			else {
				return "S";
			}
		}
		else {
			return aCalItem.getProperty("X-RecurringType");
		}
	},

	executeQuery: function _executeQuery(aQuery)
	{
		if (this.debug) this.logInfo("sql-query:"+aQuery, 1);
		if ((this.noDB) && (!this.dbInit)) return false;
		try {
			var sqlStatement = this.offlineCacheDB.createStatement(aQuery);
		}
		catch(exc) {
			if (this.debug) this.logInfo("Error on createStatement. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString+", Exception:"+exc+". ("+aQuery+")");
			return false;
		}

		if ((this.noDB) && (!this.dbInit)) return false;
		try {
			sqlStatement.executeStep();
		}
		catch(err) {
			this.logInfo("executeQuery: Error:"+err);
		}
		finally {  
			if ((this.noDB) && (!this.dbInit)) return false;
			sqlStatement.finalize();
		}

		if ((this.offlineCacheDB.lastError == 0) || (this.offlineCacheDB.lastError == 100) || (this.offlineCacheDB.lastError == 101)) {
			return true;
		}
		else {
			if (this.debug) this.logInfo("Error executing Query. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString);
			return false;
		}
	},

	executeQueryWithResults: function _executeQueryWithResults(aQuery, aFieldArray)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return null;
		}

		if (this.debug) this.logInfo("sql-query:"+aQuery, 2);
		if ((this.noDB) && (!this.dbInit)) return [];
		try {
			var sqlStatement = this.offlineCacheDB.createStatement(aQuery);
		}
		catch(exc) {
			if (this.debug) this.logInfo("Error on createStatement. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString+", Exception:"+exc+". ("+aQuery+")");
			return null;
		}

		var results = [];
		if ((this.noDB) && (!this.dbInit)) return [];
		try {
			while (sqlStatement.executeStep()) {
				var tmpResult = {};
				for (var index in aFieldArray) {
					try {
						tmpResult[aFieldArray[index]] = sqlStatement.row[aFieldArray[index]];
					}
					catch(exc) {
						if (this.debug) this.logInfo("Error on getting field '"+aFieldArray[index]+"' from query '"+aQuery+"' result.("+exc+")");
					}
				}
				results.push(tmpResult);
				if ((this.noDB) && (!this.dbInit)) return [];
			}
		}
		finally {  
			if ((this.noDB) && (!this.dbInit)) return [];
			sqlStatement.finalize();
		}

		if ((this.offlineCacheDB.lastError == 0) || (this.offlineCacheDB.lastError == 100) || (this.offlineCacheDB.lastError == 101)) {
			return results;
		}
		else {
			if (this.debug) this.logInfo("Error executing Query. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString);
			return null;
		}
	},

	addAttachmentsToOfflineCache: function _addAttachmentsToOfflineCache(aCalItem)
	{
		var attachments = aCalItem.getAttachments({});
		this.removeAttachmentsFromOfflineCache(aCalItem);
		for (var index in attachments) {
			this.addAttachmentToOfflineCache(aCalItem, attachments[index]);
		}			
	},

	addAttachmentToOfflineCache: function _addAttachmentToOfflineCache(aCalItem, aCalAttachment)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		var attParams = this.globalFunctions.splitUriGetParams(aCalAttachment.uri);

		if (attParams) {

			var sqlStr = "SELECT COUNT() as attcount from attachments WHERE id='"+attParams.id+"'";
			if (this.debug) this.logInfo("sql-query:"+sqlStr, 2);
			var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
			if (this.noDB) return;
			sqlStatement.executeStep();
			if (sqlStatement.row.attcount > 0) {
				if (this.debug) this.logInfo("Going to update the attachment because it all ready exist.");
				this.updateAttachmentInOfflineCache(aCalItem, aCalAttachment);
				sqlStatement.finalize();
				return;
			}
			sqlStatement.finalize();
		
			var sqlStr = "INSERT INTO attachments VALUES ('"+attParams.id+"', '"+attParams.name.replace(/\x27/g, "''")+"', '"+attParams.size+"', '')";
			if (this.noDB) return;
			if (!this.executeQuery(sqlStr)) {
				if (this.debug) this.logInfo("Error inserting attachment into offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				if (this.debug) this.logInfo("Inserted attachment into offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}

			var sqlStr = "INSERT INTO attachments_per_item VALUES ('"+aCalItem.id+"','"+attParams.id+"')";
			if (this.noDB) return;
			if (!this.executeQuery(sqlStr)) {
				if (this.debug) this.logInfo("Error inserting attachments_per_item into offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				if (this.debug) this.logInfo("Inserted attachments_per_item into offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}

		}
	},

	updateAttachmentInOfflineCache: function _updateAttachmentInOfflineCache(aCalItem, aCalAttachment)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		var attParams = this.globalFunctions.splitUriGetParams(aCalAttachment.uri);

		if (attParams) {

			var sqlStr = "UPDATE attachments SET id='"+attParams.id+"', name='"+attParams.name.replace(/\x27/g, "''")+"', size='"+attParams.size+"', cachePath='' WHERE id='"+attParams.id+"'";
			if (this.noDB) return;
			if (!this.executeQuery(sqlStr)) {
				if (this.debug) this.logInfo("Error updating attachment into offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				if (this.debug) this.logInfo("Updated attachment into offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}
		}
	},

	removeAttachmentsFromOfflineCache: function _removeAttachmentsFromOfflineCache(aCalItem)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		var sqlStr = "SELECT attId FROM attachments_per_item WHERE itemId='"+aCalItem.id+"'";

		if (this.debug) this.logInfo("sql-query:"+sqlStr, 2);
		try {
			var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
		}
		catch(exc) {
			if (this.debug) this.logInfo("Error on createStatement. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString+", Exception:"+exc+". ("+sqlStr+")");
			return false;
		}

		var doContinue = true;
		try {
			while (doContinue) {
				if (this.noDB) return;
				doContinue = sqlStatement.executeStep();

				if (doContinue) {
					var sqlStr2 = "DELETE FROM attachments WHERE id='"+sqlStatement.row.attId+"'";
					if (this.noDB) return;
					if (!this.executeQuery(sqlStr2)) {
						if (this.debug) this.logInfo("Error removing attachment from offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
					}
					else {
						if (this.debug) this.logInfo("Removed attachment from offlineCacheDB. Title:"+aCalItem.title);
					}
				}
			}
		}
		finally {  
			sqlStatement.finalize();
		}

		if ((this.offlineCacheDB.lastError != 0) && (this.offlineCacheDB.lastError != 100) && (this.offlineCacheDB.lastError != 101)) {
			if (this.debug) this.logInfo("Error executing Query. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString);
			return false;
		}

		var sqlStr2 = "DELETE FROM attachments_per_item WHERE itemId='"+aCalItem.id+"'";
		if (this.noDB) return;
		if (!this.executeQuery(sqlStr2)) {
			if (this.debug) this.logInfo("Error removing attachments_per_item from offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
		}
		else {
			if (this.debug) this.logInfo("Removed attachments_per_item from offlineCacheDB. Title:"+aCalItem.title);
		}

		return true;
	},

	removeAttachmentFromOfflineCache: function _removeAttachmentFromOfflineCache(aCalItem, aCalAttachment)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		var attParams = this.globalFunctions.splitUriGetParams(aCalAttachment.uri);

		if (attParams) {

			var sqlStr = "DELETE FROM attachments WHERE id='"+attParams.id+"'";
			if (this.noDB) return;
			if (!this.executeQuery(sqlStr)) {
				if (this.debug) this.logInfo("Error removing attachment from offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				if (this.debug) this.logInfo("Removed attachment from offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}

			var sqlStr = "DELETE FROM attachments_per_item WHERE itemId='"+aCalItem.id+"' AND attId='"+attParams.id+"'";
			if (this.noDB) return;
			if (!this.executeQuery(sqlStr)) {
				if (this.debug) this.logInfo("Error removing attachments_per_item from offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				if (this.debug) this.logInfo("Removed attachments_per_item from offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}
		}
	},

	addToOfflineCache: function _addToOfflineCache(aCalItem, aExchangeItem)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		if (isEvent(aCalItem)) {
			var startDate = cal.toRFC3339(aCalItem.startDate.getInTimezone(this.globalFunctions.ecUTC()));
			var endDate = cal.toRFC3339(aCalItem.endDate.getInTimezone(this.globalFunctions.ecUTC()));
			var eventField = "y";
		}
		else {
			if (aCalItem.entryDate) {
				var startDate = cal.toRFC3339(aCalItem.entryDate.getInTimezone(this.globalFunctions.ecUTC()));
			}
			else {
				var startDate = "";
			};

			if (((aCalItem.completedDate) && (aCalItem.dueDate) && (aCalItem.completedDate.compare(aCalItem.dueDate) == 1)) || ((aCalItem.completedDate) && (!aCalItem.dueDate))) {
				var endDate = cal.toRFC3339(aCalItem.completedDate.getInTimezone(this.globalFunctions.ecUTC()));
			}
			else {
				if (aCalItem.dueDate) {
					var endDate = cal.toRFC3339(aCalItem.dueDate.getInTimezone(this.globalFunctions.ecUTC()));
				}
				else {
					var endDate = "";
				}
			}
			var eventField = "n";
		}

		var sqlStr = "SELECT COUNT() as itemcount from items WHERE id='"+aCalItem.id+"'";
		if (this.debug) this.logInfo("sql-query:"+sqlStr, 2);
		var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
		if (this.noDB) return;
		sqlStatement.executeStep();
		if (sqlStatement.row.itemcount > 0) {
			if (this.debug) this.logInfo("Going to update the item because it all ready exist.");
			this.updateInOfflineCache(aCalItem, aExchangeItem);
			sqlStatement.finalize();
			return;
		}
		sqlStatement.finalize();

		if (isEvent(aCalItem)) {
			if (this.getItemType(aCalItem) == "M") {
				// Lets find the real end date.
				for (var childIndex in this.itemCache) {
					if ((this.itemCache[childIndex]) && (aCalItem.getProperty("X-UID") == this.itemCache[childIndex].getProperty("X-UID"))) {
						var childEnd = cal.toRFC3339(this.itemCache[childIndex].endDate.getInTimezone(this.globalFunctions.ecUTC()));
						if (childEnd > endDate) {
							endDate = childEnd;
						}
					}
				}
			}
			else {
				if ((this.getItemType(aCalItem) == "RO") || (this.getItemType(aCalItem) == "RE")) {
					this.updateMasterInOfflineCache(aCalItem.parentItem);
				}
			}
		}
		
		var sqlStr = "INSERT INTO items VALUES ('"+eventField+"','"+aCalItem.id+"', '"+aCalItem.getProperty("X-ChangeKey")+"', '"+startDate+"', '"+endDate+"', '"+aCalItem.getProperty("X-UID")+"', '"+this.getItemType(aCalItem)+"', '"+aCalItem.parentItem.id+"', '"+aExchangeItem.toString().replace(/\x27/g, "''")+"')";
		if (this.noDB) return;
		if (!this.executeQuery(sqlStr)) {
			if (this.debug) this.logInfo("Error inserting item into offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
		}
		else {
			if (this.debug) this.logInfo("Inserted item into offlineCacheDB. Title:"+aCalItem.title+", startDate:"+startDate);
		}
		this.addAttachmentsToOfflineCache(aCalItem);
	},

	updateInOfflineCache: function _updateInOfflineCache(aCalItem, aExchangeItem)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		if ((this.getItemType(aCalItem) != "M") || (isToDo(aCalItem))) {
			var sqlStr = "SELECT COUNT() as itemcount from items WHERE id='"+aCalItem.id+"' AND changeKey='"+aCalItem.getProperty("X-ChangeKey")+"'";
			if (this.debug) this.logInfo("sql-query:"+sqlStr, 2);
			var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
			if (this.noDB) return;
			sqlStatement.executeStep();
			if (sqlStatement.row.itemcount > 0) {
				if (this.debug) this.logInfo("This item is allready in offlineCache database. id and changeKey are the same. Not going to update it.");
				sqlStatement.finalize();
				return;
			}
			sqlStatement.finalize();
		}
		
		if (isEvent(aCalItem)) {
			var startDate = cal.toRFC3339(aCalItem.startDate.getInTimezone(this.globalFunctions.ecUTC()));
			var endDate = cal.toRFC3339(aCalItem.endDate.getInTimezone(this.globalFunctions.ecUTC()));
			var eventField = "y";
		}
		else {
			if (aCalItem.entryDate) {
				var startDate = cal.toRFC3339(aCalItem.entryDate.getInTimezone(this.globalFunctions.ecUTC()));
			}
			else {
				var startDate = "";
			};

			if ((aCalItem.completedDate) && (aCalItem.completedDate.compare(aCalItem.dueDate) == 1)) {
				var endDate = cal.toRFC3339(aCalItem.completedDate.getInTimezone(this.globalFunctions.ecUTC()));
			}
			else {
				if (aCalItem.dueDate) {
					var endDate = cal.toRFC3339(aCalItem.dueDate.getInTimezone(this.globalFunctions.ecUTC()));
				}
				else {
					var endDate = "";
				}
			}
			var eventField = "n";
		}

		if (isEvent(aCalItem)) {
			if (this.getItemType(aCalItem) == "M") {
				// Lets find the real end date.
				if (this.noDB) return;
				var newMasterEndDate = this.executeQueryWithResults("SELECT max(endDate) as newEndDate FROM items WHERE uid='"+aCalItem.getProperty("X-UID")+"'",["newEndDate"]);
				if ((newMasterEndDate) && (newMasterEndDate.length > 0)) {
					if (this.debug) this.logInfo("newMasterEndDate:"+newMasterEndDate[0].newEndDate);
					var endDateStr = newMasterEndDate[0].newEndDate;
					if (endDateStr) {
						if (endDateStr.length == 10) {
							endDateStr += "T23:59:59Z";
						}
						if (this.debug) this.logInfo("newEndDate for master setting it to:"+endDateStr);
						endDate = endDateStr;
					}
					else {
						if (this.debug) this.logInfo("newEndDate for master is null not going to use this. Strange!!");
					}
				}
				else {
					if (this.debug) this.logInfo("Could not get newEndDate for Master. What is wrong!!"); 
				} 

/*				for (var childIndex in this.itemCache) {
					if ((this.itemCache[childIndex]) && (aCalItem.getProperty("X-UID") == this.itemCache[childIndex].getProperty("X-UID"))) {
						var childEnd = cal.toRFC3339(this.itemCache[childIndex].endDate.getInTimezone(this.globalFunctions.ecUTC()));
						if (childEnd > endDate) {
							endDate = childEnd;
						}
					}
				} */ // Old code which did not work right.
			}
			else {
				if ((this.getItemType(aCalItem) == "RO") || (this.getItemType(aCalItem) == "RE")) {
					this.updateMasterInOfflineCache(aCalItem.parentItem);
				}
			}
		}
		
		var sqlStr = "UPDATE items SET event='"+eventField+"', id='"+aCalItem.id+"', changeKey='"+aCalItem.getProperty("X-ChangeKey")+"', startDate='"+startDate+"', endDate='"+endDate+"', uid='"+aCalItem.getProperty("X-UID")+"', type='"+this.getItemType(aCalItem)+"', parentItem='"+aCalItem.parentItem.id+"', item='"+aExchangeItem.toString().replace(/\x27/g, "''")+"' WHERE id='"+aCalItem.id+"'";
		if (this.noDB) return;
		if (!this.executeQuery(sqlStr)) {
			if (this.debug) this.logInfo("Error updating item in offlineCacheDB. Error:"+this.offlineCacheDB.lastErrorString);
		}
		else {
			if (this.debug) this.logInfo("Updated item in offlineCacheDB. Title:"+aCalItem.title+", startDate:"+startDate);
		}
		this.addAttachmentsToOfflineCache(aCalItem);
	},

	updateMasterInOfflineCache: function _updateParentInOfflineCache(aCalItem)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		var endDate = cal.toRFC3339(aCalItem.endDate.getInTimezone(this.globalFunctions.ecUTC()));

		if (this.getItemType(aCalItem) == "M") {
			// Lets find the real end date.
			for (var childIndex in this.itemCache) {
				if ((this.itemCache[childIndex]) && (aCalItem.getProperty("X-UID") == this.itemCache[childIndex].getProperty("X-UID"))) {
					var childEnd = cal.toRFC3339(this.itemCache[childIndex].endDate.getInTimezone(this.globalFunctions.ecUTC()));
					if (childEnd > endDate) {
						endDate = childEnd;
					}
				}
			}
		}
		else {
			if ((this.getItemType(aCalItem) == "RO") || (this.getItemType(aCalItem) == "RE")) {
				this.updateParentInOfflineCache(aCalItem.parentItem);
			}
		}
		
		var sqlStr = "UPDATE items SET endDate='"+endDate+"' WHERE id='"+aCalItem.id+"'";
		if (this.noDB) return;
		if (!this.executeQuery(sqlStr)) {
			if (this.debug) this.logInfo("Error updating master item in offlineCacheDB. Error:"+this.offlineCacheDB.lastErrorString);
		}
		else {
			if (this.debug) this.logInfo("Updated master item in offlineCacheDB. Title:"+aCalItem.title);
		}
	},

	removeFromOfflineCache: function _removeFromOfflineCache(aCalItem)
	{
		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		var sqlStr = "DELETE FROM items WHERE id='"+aCalItem.id+"'";
		if (this.noDB) return;
		if (!this.executeQuery(sqlStr)) {
			if (this.debug) this.logInfo("Error deleting item from offlineCacheDB. Error:"+this.offlineCacheDB.lastErrorString);
		}
		else {
			if (this.debug) this.logInfo("Removed item from offlineCacheDB. Title:"+aCalItem.title);
		}
		this.removeAttachmentsFromOfflineCache(aCalItem);
	},

	syncExchangeToOfflineCache: function _syncExchangeToOfflineCache()
	{
		// This will sync the specified period from Exchange to offlineCache.
		var monthsAfter = this.globalFunctions.safeGetIntPref(this.prefs, "ecOfflineCacheMonthsAfterToday", 1, true)*4;
		var monthsBefore = this.globalFunctions.safeGetIntPref(this.prefs, "ecOfflineCacheMonthsBeforeToday", 1, true)*4;

		var monthAfterDurarion = cal.createDuration("P"+monthsAfter+"W");
		var monthsBeforeDurarion = cal.createDuration("-P"+monthsBefore+"W");

		var startDate = cal.now();
		var endDate = cal.now();
		startDate.addDuration(monthsBeforeDurarion);
		endDate.addDuration(monthAfterDurarion);

		var filter = 0;
		if (this.supportsEvents) filter |= Ci.calICalendar.ITEM_FILTER_TYPE_EVENT;
		if (this.supportsTasks) filter |= Ci.calICalendar.ITEM_FILTER_TYPE_TODO;

		if (this.debug) this.logInfo("Going to request events in the period of '"+startDate.toString()+"' until '"+endDate.toString()+"' from the exchange server to fill offlinecache.");
		//this.requestPeriod(startDate, endDate, filter, null, false);
		this.getItems(filter, 0, startDate, endDate, null);

	},

	getItemsFromOfflineCache: function _getItemsFromOfflineCache(aStartDate, aEndDate)
	{
		if (this.debug) this.logInfo("getItemsFromOfflineCache startDate:"+aStartDate+", endDate:"+aEndDate);

		if ((!this.useOfflineCache) || (!this.offlineCacheDB) ) {
			return;
		}

		var result = [];

		if (aStartDate) {
			var startDate = cal.toRFC3339(aStartDate.getInTimezone(this.globalFunctions.ecUTC()));
		}
		else {
			var startDate = "1900-01-01";
		}

		if (aEndDate) {
			var endDate = cal.toRFC3339(aEndDate.getInTimezone(this.globalFunctions.ecUTC()));
		}
		else {
			var endDate = "3500-01-01";
		}

		var sqlStr = "SELECT item FROM items";
		var whereStr = "";
		if ((this.supportsEvents) && (!this.supportsTasks)) {
			whereStr = " WHERE event = 'y' AND startDate <= '"+endDate+"' AND endDate >= '"+startDate+"'";
			sqlStr += whereStr+" ORDER BY type ASC";
		}
		else {
			if ((!this.supportsEvents) && (this.supportsTasks)) {
				whereStr = " WHERE event = 'n' AND ((startDate = '' AND endDate >= '"+startDate+"' AND endDate <= '"+endDate+"') OR (endDate = '' AND startDate >= '"+startDate+"' AND startDate <= '"+endDate+"') OR (startDate <= '"+endDate+"' AND endDate >= '"+startDate+"') OR (startDate = '' AND endDate = ''))";
				sqlStr += whereStr+" ORDER BY type ASC";
			}
		}

		if (this.debug) this.logInfo("sql-query:"+sqlStr, 1);
		try {
			var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
		}
		catch(exc) {
			if (this.debug) this.logInfo("Error on createStatement. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString+", Exception:"+exc+". ("+sqlStr+")");
			return false;
		}

		var doContinue = true;
		try {
			while (doContinue) {
				doContinue = sqlStatement.executeStep();

				if (doContinue) {
					if (this.debug) this.logInfo("Found item in offline Cache.");
					var cachedItem = this.globalFunctions.xmlToJxon(sqlStatement.row.item);

					//cachedItem.content = ;
					//if (this.debug) this.logInfo(" --:"+cachedItem.toString());
					result.push(cachedItem);
				}
			}
		}
		finally {  
			sqlStatement.reset();
		}

/*		var self = this;
		sqlStatement.executeAsync({
			handleResult: function(aResultSet) {
				if (self.debug) self.logInfo("Found item in offline Cache.");
				var row;
				while (row = aResultSet.getNextRow()) {

					if (row) {
						var cachedItem = this.globalFunctions.xmlToJxon(row.getResultByName('item'));

						//cachedItem.content = ;
						//if (self.debug) self.logInfo(" --:"+cachedItem.toString());
						//var result = [];
						result.push(cachedItem);
						//self.updateCalendar(null, result, false);
					}
				}
			},

			handleError: function(aError) {
				self.logInfo("Error reading from offline cache:" + aError.message);
			},

			handleCompletion: function(aReason) {
				sqlStatement.finalize();
				if (self.debug) self.logInfo("Retreived 1 '"+result.length+"' records from offline cache. startDate:"+startDate+", endDate:"+endDate);
				if (aReason == Ci.mozIStorageStatementCallback.REASON_FINISHED) {
					if (self.debug) self.logInfo("Retreived 2 '"+result.length+"' records from offline cache. startDate:"+startDate+", endDate:"+endDate);
					if (result.length > 0) {
						if (self.noDB) return;
						self.executeQuery("UPDATE items set event=(event || '_')"+whereStr);

						self.updateCalendar(null, result, false);
					}
				} else {
					if (self.debug) self.logInfo("Error executing Query. Error:"+aReason);
				}
			}
		});*/

		//if (this.debug) this.logInfo("Retreived '"+result.length+"' records from offline cache. startDate:"+startDate+", endDate:"+endDate);
		if ((this.offlineCacheDB.lastError == 0) || (this.offlineCacheDB.lastError == 100) || (this.offlineCacheDB.lastError == 101)) {

			if (result.length > 0) {
				this.executeQuery("UPDATE items set event=(event || '_')"+whereStr);

				return this.updateCalendar(null, result, false);
			}
		}
		else {
			if (this.debug) this.logInfo("Error executing Query. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString);
			return null;
		}
		return null;
	},

	set isOffline(aValue)
	{
		if (this.debug) this.logInfo("setting mIsOffline="+aValue);

		if (aValue != this.mIsOffline) {
			this.notConnected = aValue;
			this.mIsOffline = aValue;

			if (!aValue) {
				if (this.debug) this.logInfo("Initialized:"+this.isInitialized);
				this.refresh();
			}
			else {
				if (this.calendarPoller) {
					this.calendarPoller.cancel();
				}
				this.inboxPoller.cancel();
				this.firstrun = true;
			}
		}
	},

	get isOffline()
	{
		return this.mIsOffline;
	},

	offlineStateChanged: function _offlineStateChanged(aStatus)
	{
		if (this.debug) this.logInfo("The offline state of TB changed to:"+aStatus);
		this.isOffline = (aStatus == "offline");
	},

	get offlineStartDate()
	{
		if (this.noDB) return;
		var tmpStartDate = this.executeQueryWithResults("SELECT min(endDate) as newStartDate FROM items", ["newStartDate"]);
		if ((tmpStartDate) && (tmpStartDate.length > 0)) {
			var newStartDate = tmpStartDate[0].newStartDate;
			if (newStartDate) {
				if (newStartDate.length == 10) {
					newStartDate += "T00:00:00Z";
				}
				if (this.debug) this.logInfo("get offlineStartDate = '"+newStartDate+"'");
				return cal.createDateTime(newStartDate);
			}
		}

		return null;
	},

	get offlineEndDate()
	{
		if (this.noDB) return;
		var tmpEndDate = this.executeQueryWithResults("SELECT max(endDate) as newEndDate FROM items", ["newEndDate"]);
		if ((tmpEndDate) && (tmpEndDate.length > 0)) {
			var newEndDate = tmpEndDate[0].newEndDate;
			if (newEndDate) {
				if (newEndDate.length == 10) {
					newEndDate += "T00:00:00Z";
				}
				if (this.debug) this.logInfo("get offlineEndDate = '"+newEndDate+"'");
				return cal.createDateTime(newEndDate);
			}
		}

		return null;
	},
	
    /**
     * Internal logging function that should be called on any database error,
     * it will log as much info as possible about the database context and
     * last statement so the problem can be investigated more easilly.
     *
     * @param message           Error message to log.
     * @param exception         Exception that caused the error.
     */
	logError: function _logError(message,exception) {
		let logMessage = "("+this.name+") " + message;

		if (exception) {
			logMessage += "\nException: " + exception;
		}

		this.globalFunctions.ERROR(logMessage + "\n" + this.globalFunctions.STACK(10));
	},

	logInfo: function _logInfo(message, aDebugLevel) {

		if (!this.debug) return;

		if (!aDebugLevel) {
			var debugLevel = 1;
		}
		else {
			var debugLevel = aDebugLevel;
		}

		if (this.globalFunctions.shouldLog()) {
			exchWebService.check4addon.logAddOnVersion();
		}

		if (debugLevel <= this.storedDebugLevel) {
			this.globalFunctions.LOG("["+this.name+"] "+message + " ("+this.globalFunctions.STACKshort()+")");
		}
	},

	setDoDebug: function _setDoDebug()
	{
		
		var prefB = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		this.storedDebugLevel = this.globalFunctions.safeGetIntPref(prefB, "extensions.1st-setup.core.debuglevel", 0, true);

		this.debug = (this.storedDebugLevel > 0);

		if ((this.storedDebugLevel == 0) || (!this.globalFunctions.shouldLog())) {
			this.debug = false;
		}
	},

};

function ecObserver(inCalendar)  
{  
	this.calendar = inCalendar;

	var self = this;
	this.ecInvitationsCalendarManagerObserver = {
		onCalendarRegistered: function cMO_onCalendarRegistered(aCalendar) {
//			self.calendar.logInfo("onCalendarRegistered name="+aCalendar.name+", id="+aCalendar.id);
		},

		onCalendarUnregistering: function cMO_onCalendarUnregistering(aCalendar) {
			self.calendar.logInfo("onCalendarUnregistering name="+aCalendar.name+", id="+aCalendar.id);
			if (aCalendar.id == self.calendar.id) {

				self.calendar.doDeleteCalendar();
				self.calendar.logInfo("Removing calendar preference settings.");
	
				var rmPrefs = Cc["@mozilla.org/preferences-service;1"]
			                    .getService(Ci.nsIPrefService)
					    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl.");
				try {
					rmPrefs.deleteBranch(aCalendar.id);
				} catch(err) {}

				self.unregister();
			}
		},

		onCalendarDeleting: function cMO_onCalendarDeleting(aCalendar) {
			self.calendar.logInfo("onCalendarDeleting name="+aCalendar.name+", id="+aCalendar.id);

		}
	};


	this.register();  
}  

ecObserver.prototype = {  

	observe: function(subject, topic, data) 
	{  
		// Do your stuff here.
		//LOG("ecObserver.observe. topic="+topic+",data="+data+"\n"); 
		switch (topic) {
			case "onCalReset":
				if (data == this.calendar.id) {
					this.calendar.resetCalendar();
				}
				break;
			case "quit-application":
				this.unregister();
				break;
			case "nsPref:changed":
				if (data == "calendar.timezone.local") {
					// TODO: For now this will not work because it can happen that 
					// the timezoneservice does not know about the pref update.
					// The order of calling observers is random.
					this.calendar.doTimezoneChanged();
				}
				if ((data == "extensions.1st-setup.debug.log") || (data == "extensions.1st-setup.core.debuglevel")) {
					this.calendar.setDoDebug();
				}
				break;
			case "network:offline-status-changed":
					this.calendar.offlineStateChanged(data);
				break;
		} 
	},  

	register: function()
	{  
		var observerService = Cc["@mozilla.org/observer-service;1"]  
		                          .getService(Ci.nsIObserverService);  
		observerService.addObserver(this, "onCalReset", false);  
		observerService.addObserver(this, "quit-application", false); 
		observerService.addObserver(this, "network:offline-status-changed", false);

		Services.prefs.addObserver("calendar.timezone.local", this, false);
		Services.prefs.addObserver("extensions.1st-setup.debug.log", this, false);
		Services.prefs.addObserver("extensions.1st-setup.core.debuglevel", this, false);


		getCalendarManager().addObserver(this.ecInvitationsCalendarManagerObserver);
	},  

	unregister: function()
	{  
		this.calendar.doShutdown();

		var observerService = Cc["@mozilla.org/observer-service;1"]  
		                            .getService(Ci.nsIObserverService);  
		observerService.removeObserver(this, "onCalReset");  
		observerService.removeObserver(this, "quit-application");  
		observerService.removeObserver(this, "network:offline-status-changed");
		Services.prefs.removeObserver("calendar.timezone.local", this);

		getCalendarManager().removeObserver(this.ecInvitationsCalendarManagerObserver);
	}  
}

function convertToVersion1()
{
	var tmpPrefService = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService);
	var tmpPrefs = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService)
		    .getBranch("calendar.registry.");

	var mivFunctions = Cc["@1st-setup.nl/global/functions;1"].getService(Ci.mivFunctions);

	var children = tmpPrefs.getChildList("");
	if (children.length > 0) {
		// Move prefs from old location to new location.
		var oldUUID = "";
		var newUUID = false;
		var exchangeType = false;
		var updateToUUID = null;
		for (var index in children) {

			var pos = children[index].indexOf(".");
			var tmpUUID = children[index].substr(0, pos);
			var tmpField = children[index].substr(pos+1); 

			if (tmpField == "uri") {
				mivFunctions.LOG("Going to check calendar registry '"+tmpUUID+"' if it needs to be updated.");

				var tmpType = mivFunctions.safeGetCharPref(null, "calendar.registry."+tmpUUID+".type", null, false);

				var tmpURI = mivFunctions.safeGetCharPref(null, "calendar.registry."+children[index], null, false);
				if ((tmpURI != "https://auto/"+tmpUUID) && (tmpType == "exchangecalendar")) {
					// update uri preference
					this.globalFunctions.LOG("Going to upgrade calendar registry '"+tmpUUID+"'");
					
					var updatePrefs = Cc["@mozilla.org/preferences-service;1"]
						    .getService(Ci.nsIPrefService)
						    .getBranch("calendar.registry."+tmpUUID+".");
					updatePrefs.setCharPref("uri", "https://auto/"+tmpUUID);

					var updatePrefs = Cc["@mozilla.org/preferences-service;1"]
						    .getService(Ci.nsIPrefService)
						    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+tmpUUID+".");
					updatePrefs.setIntPref("exchangePrefVersion", 1);
					tmpPrefService.savePrefFile(nsnull);
				}
			}
		}
		
	}

}

/** Module Registration */
const scriptLoadOrder = [
	"calUtils.js"
];

if (! exchWebService) var exchWebService = {};

exchWebService.check4addon = {

	allReadyLogged: false,

	checkAddOnIsInstalledCallback: function _checkAddOnIsInstalledCallback(aAddOn)
	{
		var mivFunctions = Cc["@1st-setup.nl/global/functions;1"].getService(Ci.mivFunctions);
		if (!aAddOn) {
			mivFunctions.LOG("Exchange Calendar and Tasks add-on is NOT installed.");
		}
		else {
			mivFunctions.LOG(aAddOn.name +" is installed.");
			try {
				mivFunctions.LOG(aAddOn.name +" is installed from:"+aAddOn.sourceURI.prePath+aAddOn.sourceURI.path);
			}
			catch(err) {
				mivFunctions.LOG(aAddOn.name +" unable to determine where installed from.");
			}
			mivFunctions.LOG(aAddOn.name +" is version:"+aAddOn.version);
			if (aAddOn.isActive) {
				mivFunctions.LOG(aAddOn.name +" is active.");
			}
			else {
				mivFunctions.LOG(aAddOn.name +" is NOT active.");
			}
		}

	},

	logAddOnVersion: function _logAddOnVersion()
	{
		if (this.allReadyLogged) return;

		this.allReadyLogged = true;

		Cu.import("resource://gre/modules/AddonManager.jsm");
		AddonManager.getAddonByID("exchangecalendar@extensions.1st-setup.nl", exchWebService.check4addon.checkAddOnIsInstalledCallback);
	}
}

function load_ews_2010_timezonedefinitions()
{
	if (!global_ews_2010_timezonedefinitions) {

		var somefile = chromeToPath("chrome://exchangecalendar/content/ewsTimesZoneDefinitions_2007.xml");
		var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(somefile);

		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].  
				 createInstance(Components.interfaces.nsIFileInputStream);  
		istream.init(file, -1, -1, 0);  
		istream.QueryInterface(Components.interfaces.nsILineInputStream);  
		  
		// read lines into array  
		var line = {}, lines = "", hasmore;  
		do {  
			hasmore = istream.readLine(line);  
			lines += line.value;   
		} while(hasmore);  
		  
		istream.close();

		try {
		    global_ews_2010_timezonedefinitions = Cc["@1st-setup.nl/conversion/xml2jxon;1"]
				       .createInstance(Ci.mivIxml2jxon);
		}
		catch(exc) { 
				dump("\ncreateInstance error:"+exc+"\n");
		}


		try {
			global_ews_2010_timezonedefinitions.processXMLString(lines, 0, null);
		}
		catch(exc) { 
				dump("\nprocessXMLString error:"+exc.name+", "+exc.message+"\n");
		} 

		var rm = global_ews_2010_timezonedefinitions.XPath("/s:Envelope/s:Body/m:GetServerTimeZonesResponse/m:ResponseMessages/m:GetServerTimeZonesResponseMessage");
		if (rm.length == 0) return null;

		globalTimeZoneDefinitions = {};

		var timeZoneDefinitionArray = rm[0].XPath("/m:TimeZoneDefinitions/t:TimeZoneDefinition");
		for (var index in timeZoneDefinitionArray) {
			globalTimeZoneDefinitions[timeZoneDefinitionArray[index].getAttribute("Id")] = timeZoneDefinitionArray[index];
		}
		rm = null;

		//dump("\nEnd of get ews_2010_timezonedefinitions\n");
	}

}

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mainEC) {
			// Load main script from lightning that we need.
			convertToVersion1();

			cal.loadScripts(scriptLoadOrder, Cu.getGlobalForObject(this));
			NSGetFactory.mainEC = XPCOMUtils.generateNSGetFactory([calExchangeCalendar]);
			load_ews_2010_timezonedefinitions();
			
	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mainEC(cid);
} 

/* Following is code for testing and debugging. 

var tmpStr = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"'+"\r\n"+'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+"\r\n"+'xmlns:xsd="http://www.w3.org/2001/XMLSchema">'+"\r\n"+'<soap:Header><t:ServerVersionInfo'+"\r\n"+'MajorVersion="8" MinorVersion="3" MajorBuildNumber="279" MinorBuildNumber="1"'+"\r\n"+'Version="Exchange2007_SP1"'+"\r\n"+'xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"'+"\r\n"+'/></soap:Header>\n\t<soap:Body>\n\t\t<m:SyncFolderItemsResponse'+"\r\n"+'xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"'+"\r\n"+'xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages"><m:ResponseMessages><m:SyncFolderItemsResponseMessage'+"\r\n"+'ResponseClass="Success"><m:ResponseCode>NoError</m:ResponseCode><m:SyncState>.'+"\r\n"+'..</m:SyncState><m:IncludesLastItemInRange>true</m:IncludesLastItemInRange><m:Changes'+"\r\n"+'/></m:SyncFolderItemsResponseMessage></m:ResponseMessages></m:SyncFolderItemsResponse></soap:Body></soap:Envelope>';

var start = new Date().getTime();
var samples = 1;//5000;
var globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

for (var i=0;i<samples;i++) {
var tmpXML = globalFunctions.xmlToJxon(tmpStr);
				tmpXML.addNameSpace("s", nsSoapStr);
				tmpXML.addNameSpace("m", nsMessagesStr);
				tmpXML.addNameSpace("t", nsTypesStr);
				tmpXML.addNameSpace("michel", nsTypesStr);
}
var elapsed = new Date().getTime() - start;
dump(">>>>>>>>>>> -----:elapsed:"+elapsed+", for samples:"+samples+"\n");
dump(">>>>>>>>>>> -----:Going to do XPath"+"\n");
var tmpobject = tmpXML.XPath("/s:Envelope/s:Header/michel:ServerVersionInfo");
dump(">>>>>>>>>>> -----: MinorVersion:"+tmpobject[0].getAttribute("MinorVersion")+"\n");
var tmpobject = tmpXML.XPath("/s:Envelope/s:Body/m:SyncFolderItemsResponse/m:ResponseMessages/m:SyncFolderItemsResponseMessage[@ResponseClass='Success1' and m:ResponseCode='NoError']");
if (tmpobject.length > 0) {
	dump(">>>>>>>>>>> -----: SyncFolderItemsResponseMessage:"+tmpobject[0].toString()+"\n");
}
else {
	dump(">>>>>>>>>>> -----: XPath not foound SyncFolderItemsResponseMessage"+"\n");
}
dump(">>>>>>>>>>> -----:"+tmpXML.toString()+"\n");

*/
