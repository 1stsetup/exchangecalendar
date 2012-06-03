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


var tmpActivityManager = Cc["@mozilla.org/activity-manager;1"];

if (tmpActivityManager) {
	exchWebService.commonFunctions.LOG("-- ActivityManger available. Enabeling it.");
	const nsIAP = Ci.nsIActivityProcess;  
	const nsIAE = Ci.nsIActivityEvent;  
	const nsIAM = Ci.nsIActivityManager;

	var gActivityManager = Cc["@mozilla.org/activity-manager;1"].getService(nsIAM);  
}
else {
	exchWebService.commonFunctions.LOG("-- ActivityManger not available.");
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
   var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
        .createInstance(Components.interfaces.nsIFileProtocolHandler);
    rv = ph.getFileFromURLSpec(aPath).path;
    return rv;
}

function chromeToPath (aPath) {

   if (!aPath || !(/^chrome:/.test(aPath)))
      return; //not a chrome url
   var rv;
   
      var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
        var uri = ios.newURI(aPath, "UTF-8", null);
        var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1'].getService(Components.interfaces["nsIChromeRegistry"]);
        rv = cr.convertChromeURL(uri).spec;

        if (/^file:/.test(rv))
          rv = urlToPath(rv);
        else
          rv = urlToPath("file://"+rv);

      return rv;
}


function calExchangeCalendar() {
	this.initProviderBase();

	this.folderPathStatus = 1;
	this.firstrun = true;
	this.mUri = "";
	this.mid = null;

//	this.initialized = false;

	this.prefs = null;
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
	this.weAreSyncing = false;
	this.firstSyncDone = false;

	this.meetingRequestsCache = [];
	this.meetingCancelationsCache = [];
	this.meetingrequestAnswered = [];
	this.meetingResponsesCache = [];

	this.queue = new Array;
	this.tmpJobs = new Array;
	this.getItemSyncQueue = [];
	this.processItemSyncQueueBusy = false;
	this.timers = [];

	this.offlineTimer = null;
	this.offlineQueue = [];

	this.doReset = false;

	this.haveTimeZones = false;
	this.EWSTimeZones = null;

	this.shutdown = false;

	this.inboxPoller = Cc["@mozilla.org/timer;1"]
			.createInstance(Ci.nsITimer);

	this.observerService = Cc["@mozilla.org/observer-service;1"]  
	                          .getService(Ci.nsIObserverService);  

	this.calendarPoller = null;

        this.mObserver = new ecObserver(this);

	this.supportsTasks = false;
	this.supportsEvents = false;

	this.folderProperties = null;
	this._readOnly = true;

	this.exporting = false;
	this.OnlyShowAvailability = false;

	this.mIsOffline = Components.classes["@mozilla.org/network/io-service;1"]
                             .getService(Components.interfaces.nsIIOService).offline;

}

var calExchangeCalendarGUID = "720a458e-b6cd-4883-8a4d-5be27ec454d8";

calExchangeCalendar.prototype = {
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
		this.logInfo("get prefChromeOverlay()");
		return null;
	},

	get displayName() {
		this.logInfo("get displayName()");
		return calGetString("calExchangeCalendar", "displayName", null, "exchangecalendar");
	},

	//  void createCalendar(in AUTF8String aName, in nsIURI aURL,
        //	            in calIProviderListener aListener);
	createCalendar: function calWcapCalendar_createCalendar(name, url, listener) {
		this.logInfo("createCalendar");
		throw NS_ERROR_NOT_IMPLEMENTED;
	},

	//  void deleteCalendar(in calICalendar aCalendar,
        //  	            in calIProviderListener aListener);
	deleteCalendar: function calWcapCalendar_deleteCalendar(calendar, listener) {
		this.logInfo("deleteCalendar");
		throw NS_ERROR_NOT_IMPLEMENTED;
	},

	//  calICalendar getCalendar(in nsIURI aURL);
	getCalendar: function calWcapCalendar_getCalendar(url) {
		this.logInfo("getCalendar");
		throw NS_ERROR_NOT_IMPLEMENTED;
	},
// End calICalendarProvider

// Begin calICalendar

	//  attribute AUTF8String id;

	//   attribute AUTF8String name;

	//  readonly attribute AUTF8String type;
	get type()
	{
//		this.logInfo("get type()");
		return "exchangecalendar";
	},

	//  readonly attribute AString providerID;
	get providerID()
	{
		return "exchangecalendar@extensions.1st-setup.nl";
	},

	//  attribute calICalendar superCalendar;

	//  attribute nsIURI uri;
	get uri()
	{
	        return this.mUri;
	},

	set uri(aUri)
	{
		//this.logInfo("set uri:"+aUri.path);
		this.myId = aUri.path.substr(1);

		this.mPrefs = Cc["@mozilla.org/preferences-service;1"]
	                    .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+this.myId+".");
		if (this.exchangePrefVersion < 1) {
			this.mPrefs = null;
		}

	        this.mUri = aUri;
	        return this.uri;
	},

	set readOnly(aValue)
	{

		if (this.folderProperties) {
			var effectiveRights = this.folderProperties.nsSoap::Body.nsMessages::GetFolderResponse.nsMessages::ResponseMessages.nsMessages::GetFolderResponseMessage.nsMessages::Folders.nsTypes::CalendarFolder.nsTypes::EffectiveRights;
			if (((effectiveRights.nsTypes::Delete.toString() == "false") || (effectiveRights.nsTypes::Modify.toString() == "false")) &&
				(effectiveRights.nsTypes::CreateContents.toString() == "false")) {
				aValue = true;
			}
		}

		var changed = false;
		if (aValue != this._readOnly) {
			this.logInfo("readOnly property changed from "+this._readOnly+" to "+aValue);
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
			exchWebService.commonFunctions.LOG("Requesting exchWebService.getFolderProperties property.");
			if (this.folderProperties) {
				return this.folderProperties.toString();
			}
			return null;
			break;
		case "exchWebService.checkFolderPath":
			exchWebService.commonFunctions.LOG("Requesting exchWebService.checkFolderPath property.");
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
			//this.logInfo("getProperty: organizerId");
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
				this._disabled = exchWebService.commonFunctions.safeGetBoolPref(this.prefs, "disabled", false);
				if (this._disabled) return this._disabled;
			}

			return ((!this.isInitialized) && (this.folderPathStatus == 0));
		case "itip.notify-replies":
			return true;
		case "itip.transport":
			this.logInfo("getProperty: itip.transport");
			break;
			//return true;
            	case "capabilities.autoschedule.supported":
			this.logInfo("capabilities.autoschedule.supported");
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

		//exchWebService.commonFunctions.LOG("1 getProperty("+aName+")");
	        return this.__proto__.__proto__.getProperty.apply(this, arguments);
	},

	//  void setProperty(in AUTF8String aName, in nsIVariant aValue);
	setProperty: function setProperty(aName, aValue)
	{

		this.logInfo("setProperty. aName:"+aName+", aValue:"+aValue);
		switch (aName) {
		case "disabled" :
			this._disabled = aValue;
			this.prefs.setBoolPref("disabled", aValue);
			if (aValue) {
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
				}
			}
			return;
		}

		this.__proto__.__proto__.setProperty.apply(this, arguments);

		switch (aName) {
		case "disabled" :
			if (!this._disabled) {
				this.doReset = true;
				this.performReset();
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
		this.logInfo("addItem id="+aItem.id);

		// if aItem.id == null then it is a newly created item in Lightning.
		// if aItem.id == "040000008200E00074C5B7101A82E008000000005D721F845633CD0100000000000000001000000006CC9AC20EA39441B863D6E454306174" it is from iTIP
		// if aItem.id == "31d9835f-1c29-4d18-ab39-7587c56e3982" paste in lightning after a copy in lightning.

	        if (this.OnlyShowAvailability) {
	            this.notifyOperationComplete(aListener,
	                                         Ci.calIErrors.CAL_IS_READONLY,
	                                         Ci.calIOperationListener.ADD,
	                                         null,
	                                         "Calendar is readonly");
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
					this.logInfo("addItem: FOUND myself as an attendee and we are going to remove myself:"+aItem.title);
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
		this.logInfo("adoptItem()");

		if ((this.readOnly) || (this.OnlyShowAvailability)) {
			this.notifyOperationComplete(aListener,
                                         Ci.calIErrors.CAL_IS_READONLY,
                                         Ci.calIOperationListener.ADD,
                                         null,
                                         "Calendar is readonly");
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
					this.logInfo("BOA: iTIP action item with STATUS:"+aItem.getProperty("STATUS"));

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
				this.logInfo("  -- We have attachments:"+attachments.length);
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
				aListener,
				2);
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
		this.logInfo("getMeetingRequestByUIDOk: itemcount="+aMeetingRequests.length);

		if (erGetMeetingRequestByUIDRequest.argument.item.organizer) {
			this.logInfo(" >>>>>>> 1 We have a organizer and SCHEDULE-AGENT="+erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT"));
		}
		else {
			this.logInfo("item has not oranizer!!!!!!!!!!!!");
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
					
			this.logInfo("getMeetingRequestByUIDOk: iTIP action item with STATUS:"+erGetMeetingRequestByUIDRequest.argument.item.getProperty("STATUS"));

			var me = this.getInvitedAttendee(erGetMeetingRequestByUIDRequest.argument.item);
			if (me) {
				this.logInfo("getMeetingRequestByUIDOk: me.participationStatus:"+me.participationStatus);
				var tmpMe = this.getInvitedAttendee(ewsItem);
				if (tmpMe) {
					this.logInfo("getMeetingRequestByUIDOk: tmpMe.participationStatus:"+tmpMe.participationStatus);
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
				this.logInfo("getMeetingRequestByUIDOk: I'm not directly invited so we are going to create a dummy attendee for now.");
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

			this.logInfo("getMeetingRequestByUIDOk: iTIP action item with ewsItem.STATUS:"+ewsItem.getProperty("STATUS"));

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
			this.logInfo("Meeting request was removed from inbox after iTIP button was pressed and before Exchange server could be checked.");
			this.logInfo("Someone else working in the same inbox?");
			this.logInfo("OR We see this when someone imports an ICS file or imports a meeting request into another calendar.");
			// If it is an ICS we would like it to be added to the calendar as new item
			// If is a meeting request then we want it accepted and not added. This must produce an error
			// Problem is we cannot identify it as a ICS import or a acceptation of a meeting request.
			var doStop = false;

			if (erGetMeetingRequestByUIDRequest.argument.item.organizer) {
				this.logInfo(" >>>>>>> 2 We have a organizer and SCHEDULE-AGENT="+erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT"));
				if (erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT") == "CLIENT") {
					// looks like iTIP because SCHEDULE-AGENT is set. 
					this.logInfo(" >>>>>>> 2 We have a organizer and SCHEDULE-AGENT="+erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT"));
					this.logInfo(" !!!!!!!!!!!!!! THIS SHOULD NEVER HAPPEN ON AN iTIP. DO WE HAVE AN iTIP");
					this.logInfo("iCalString:"+erGetMeetingRequestByUIDRequest.argument.item.icalString);
					//this.logInfo(" Stopping processing.. Report this problem to exchangecalendar@extensions.1st-setup.nl");
					//doStop = true;  // For now we going to clean out the UID and me as an attendee
					// We fake that we do a paste and that it is an invitation.
					
					this.logInfo(" !!!>>  We are going to treat this as a copy/paste for a new event.");
					var tmpItem = erGetMeetingRequestByUIDRequest.argument.item.clone();
					tmpItem.id = "xxxx-xxxx-xxx-xxxx";
					tmpItem.setProperty("X-IsInvitation", "true");
					tmpItem.setProperty("X-exchangeITIP1", "true");
					tmpItem.setProperty("X-IsMeeting", true);
					this.addItem(tmpItem, erGetMeetingRequestByUIDRequest.listener);
					return;
					
				}

				if (erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT")) {
					this.logInfo("Unknown SCHEDULE-AGENT property for item. SCHEDULE-AGENT:"+erGetMeetingRequestByUIDRequest.argument.item.organizer.getProperty("SCHEDULE-AGENT"));
					this.logInfo("Please mail the previous line to exchangecalendar@extensions.1st-setup.nl");
					return;
				}
				else {
					this.logInfo("SCHEDULE-AGENT not set. We are going add the item. At a later stage we will want to have a proper restore.");
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
		this.logInfo("getMeetingRequestByUIDError: aCode:"+aCode+", aMsg:"+aMsg);

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
this.logInfo("singleModified doNotify");
				this.notifyTheObservers("onModifyItem", [aModifiedSingle, this.itemCache[aModifiedSingle.id]]);
			}
			this.itemCache[aModifiedSingle.id] = aModifiedSingle;
		}
	},

	masterModified: function _masterModified(aModifiedMaster)
	{
		//this.logInfo("masterModified:"+aModifiedMaster.title);
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

		this.logInfo("modifyItem");
		var result = Ci.calIErrors.MODIFICATION_FAILED;

	        if (this.OnlyShowAvailability) {
	            this.notifyOperationComplete(aListener,
	                                         Ci.calIErrors.CAL_IS_READONLY,
	                                         Ci.calIOperationListener.MODIFY,
	                                         null,
	                                         "Calendar is readonly");
			return null;
	        }

	        if (this.readOnly) {
			// When we hit this it probably is the change on a alarm. We will process this only in the local cache.
			this.logInfo("modifyItem and this calendar is ReadOnly");
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
			this.logInfo("  -- We have newAttachments:"+newAttachments.length);
			for (var index in newAttachments) {
				if (newAttachments[index].getParameter("X-AttachmentId")) {
					attachments[newAttachments[index].getParameter("X-AttachmentId")] = newAttachments[index];
				}
				else {
					attachmentsUpdates.create.push(newAttachments[index]);
					this.logInfo("newAttachment:"+newAttachments[index].uri.spec);
				}
			}

			// Check which have been removed.
			var oldAttachments = aOldItem.getAttachments({});
			for (var index in oldAttachments) {
				if (! attachments[oldAttachments[index].getParameter("X-AttachmentId")]) {
					attachmentsUpdates.delete.push(oldAttachments[index]);
					this.logInfo("removedAttachment:"+oldAttachments[index].uri.spec);
				}
			}			
			
		}

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

				this.logInfo("1 meOld.participationStatus="+meOld.participationStatus+", meNew.participationStatus="+meNew.participationStatus);
				this.logInfo("1 aOldItem.status="+aOldItem.getProperty("STATUS")+", aNewItem.status="+aNewItem.getProperty("STATUS"));

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
				// My status has changed. Send to exchWebService.commonFunctions.
				this.logInfo("2 aOldItem.participationStatus="+meOld.participationStatus+", aNewItem.participationStatus="+(meNew ? meNew.participationStatus : ".."));
				this.logInfo("3a aOldItem.id="+aOldItem.id);
				this.logInfo("3b aNewItem.id="+aNewItem.id);

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
					this.logInfo("___________ Found in meeting request cache.");
					var tmpItem = cachedItem;
					var tmpUID = aNewItem.id;
					requestResponseItem = this.cloneItem(aNewItem);
					requestResponseItem.id = tmpItem.id;
					requestResponseItem.setProperty("X-UID",  tmpItem.getProperty("X-UID"));
					requestResponseItem.setProperty("X-ChangeKey",  tmpItem.getProperty("X-ChangeKey"));
				}
				else {
					this.logInfo("___________ NOT Found in meeting request cache. X-UID:"+aNewItem.getProperty("X-UID"));

					if (aNewItem.id == aNewItem.parentItem.id) {
						this.logInfo("_________ it is a master.");
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
					this.logInfo("modifyItem: canceled by user.");
					result = Cr.NS_OK;
				}
			}
			else {

				var input= { item: aNewItem, 
					     response: "sendtonone"};

				if (aNewItem.organizer) {
					this.logInfo("The organizer is:"+aNewItem.organizer.id);
				}
				else {
					this.logInfo("We have no organizer!");
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
						this.logInfo("  -- aOldItem.getAttendees({}).length="+aOldItem.getAttendees({}).length);
						this.logInfo("  -- aNewItem.getAttendees({}).length="+aNewItem.getAttendees({}).length);
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
							this.logInfo(" -- There are no attendees left");
							input.response = "sendtonone";
						}
					}
					else {
						this.logInfo(" -- The user/organizer only dismissed or removed a reminder. We are not going to send this update to the invited people of the meeting.");
						input.response = "sendtonone";
					}
				}

				this.logInfo("modifyItem: it is a event. aOldItem.CalendarItemType=:"+aOldItem.getProperty("X-CalendarItemType"));

				if (aOldItem.parentItem.id == aOldItem.id) {
					// We have a Single or master
					var master = this.recurringMasterCache[aOldItem.getProperty("X-UID")];
					if (master) {
						isMaster = true;
						// See if the aNewItem is also the master record.
						var masterChanged = (aNewItem.parentItem.id == aNewItem.id);

				this.logInfo(" == aNewItem.id:"+aNewItem.id);
				this.logInfo(" == aNewItem.parentItem.id:"+aNewItem.parentItem.id);
				this.logInfo(" == aOldItem.id:"+aOldItem.id);
				this.logInfo(" == aOldItem.parentItem.id:"+aOldItem.parentItem.id);
	
						// We need to find out wat has changed;
						this.logInfo(" ==1 invite="+invite);

						var changesObj = this.makeUpdateOneItem(aNewItem, aOldItem, null, null, null, invite);
						var changes;
						if (changesObj) {
							changes = changesObj.changes;
						}

						if (changes) {
							this.logInfo("modifyItem: changed:"+String(changes));

							this.removeChildrenFromMaster(this.recurringMasterCache[aOldItem.getProperty("X-UID")]);
							delete this.itemCache[aOldItem.id];
							delete this.recurringMasterCache[aOldItem.getProperty("X-UID")];

							this.logInfo(" When CHANGED master arrives for '"+aNewItem.title+"' then it's children we all be downloaded.");
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
								aListener,
								2);
							return;
						}
						else {
							this.logInfo("modifyItem: No changes for master.");
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
									null,
									2);
							}
							else {
								// Could be an alarm dismiss or snooze
							}
							this.masterModified(aNewItem);
							result = Cr.NS_OK;
						}
					}
					else {
						this.logInfo("modifyItem: Single event modification");
						// We need to find out wat has changed;
						this.logInfo(" ==1 invite="+invite);

						var changesObj = this.makeUpdateOneItem(aNewItem, aOldItem, null, null, null, invite);
						var changes;
						if (changesObj) {
							changes = changesObj.changes;
						}
//						var changes = this.makeUpdateOneItem(aNewItem, aOldItem, null, null, null, invite);
						if (changes) {
							this.logInfo("modifyItem: changed:"+String(changes));

							// We remove the item from cache and calendar because the update request will add
							// it again.
							// This is not true when we changed a single to a recurring item.
							if ((!aOldItem.recurrenceInfo) && (aNewItem.recurrenceInfo)) {
								// We need to request the children when the new master arrives.
								this.logInfo(" When master arrives for '"+aNewItem.title+"' then it's children we all be downloaded.");
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
								aListener,
								2);
							//this.singleModified(aNewItem);
							return;
						}
						else {
							if (this.doAttachmentUpdates(attachmentsUpdates, aOldItem, input.response, aListener)) {
								// We are done
								this.logInfo("modifyItem: No only attachment changes no other fields.");
								return;
							}
							else {
								this.logInfo("modifyItem: No changes 1.");
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
					this.logInfo("modifyItem: Occurrence or exception modification");
					
					// We need to find the Index of this item.
					var self = this;
					if (aOldItem.hasProperty("X-OccurrenceIndex")) {
						this.logInfo(" [[[[[[[[[[[[ We allready have an index for this occurrence ]]]]]]]]]]]]");
					}
						this.logInfo(" [[[[[[[[[[[[ Index:"+aOldItem.getProperty("X-OccurrenceIndex")+" ]]]]]]]]]]]]");

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
						aListener,
						2);
					this.singleModified(aNewItem);
					return;
				}
			}
		}
		else {
			if (isToDo(aNewItem)) {
				this.logInfo("modifyItem: it is a todo");

				var changesObj = this.makeUpdateOneItem(aNewItem, aOldItem);
				var changes;
				if (changesObj) {
					changes = changesObj.changes;
				}
//				var changes = this.makeUpdateOneItem(aNewItem, aOldItem);
				if (changes) {
					this.logInfo("modifyItem: changed:"+String(changes));
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
						aListener,
						2);
					this.singleModified(aNewItem, true);
					return;
				}
				else {
					if (this.doAttachmentUpdates(attachmentsUpdates, aOldItem, "sendtonone", aListener)) {
						// We are done
						this.logInfo("modifyItem: No only attachment changes no other fields.");
						return;
					}
					else {
						this.logInfo("modifyItem: No changes 2.");
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
		this.logInfo("deleteItem");

	        if (this.OnlyShowAvailability) {
	            this.notifyOperationComplete(aListener,
	                                         Ci.calIErrors.CAL_IS_READONLY,
	                                         Ci.calIOperationListener.DELETE,
	                                         null,
	                                         "Calendar is readonly");
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
			this.logInfo("Item is not in itemCache anymore. Probably not removed from view by Lightning..");
			this.notifyOperationComplete(aListener,
                                         Cr.NS_OK,
                                         Ci.calIOperationListener.DELETE,
                                         aItem.id,
                                         aItem);
			return;
		}

		var self = this;
		if (isEvent(aItem)) {
			this.logInfo("deleteItem is calIEvent");

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
					this.logInfo("deleteItem: canceled by user.");
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
					this.logInfo("-- Single CalendarItemType");

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
						aListener,
						2);

					break;
				case "Occurrence" :
				case "Exception" :
					this.logInfo("-- "+aItem.getProperty("X-CalendarItemType")+" CalendarItemType");

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
						aListener,
						2);

					break;
				case "RecurringMaster" :
					this.logInfo("-- RecurringMaster CalendarItemType");

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
						aListener,
						2);
					break;
				default :
					// TODO: This will happen when the sync to/from EWS has not yet happened.
					this.logInfo("WARNING: unknown CalendarItemType="+aItem.getProperty("X-CalendarItemType"));
			}
		}

		if (isToDo(aItem)) {
			this.logInfo("deleteItem is calITask");
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
				aListener,
				2);
		}


	},

	//  calIOperation getItem(in string aId, in calIOperationListener aListener);
	getItem: function _getItem(aId, aListener, aRetry) {
		this.logInfo("getItem: aId:"+aId);

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
				this.logInfo("This is odd we have a meeting cancelation but not any calendaritem. THIS SHOULD NOT HAPPEN");
				delete this.meetingCancelationsCache[cachedRequest.id];
				return;
			}

		}

	/*	if (!item) {
			for (var index in this.meetingRequestsCache) {
				if (this.meetingRequestsCache[index]) {
					if (this.meetingRequestsCache[index].getProperty("X-UID") == aId) {
						this.logInfo("getItem is in meetingRequestsCache");
						this.logInfo("  id="+index);
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
				this.logInfo("Not found putting it in ItemSyncQue");
				this.getItemSyncQueue.push( { id: aId,
							      listener: aListener } );
				this.refresh();
				return;
			}
			else {
				this.logInfo("getItem not FOUND");
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

		this.logInfo("Found item in cache with Status:"+item.getProperty("STATUS"));

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
		this.logInfo("getItems 1:");

		if (aRangeStart)  { this.logInfo("getItems 2: aRangeStart:"+aRangeStart.toString()); }
		if (aRangeEnd) { this.logInfo("getItems 3: aRangeEnd:"+aRangeEnd.toString()); }

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

		if (this.OnlyShowAvailability) {
			if (validPeriod) {
				this.getOnlyFreeBusyInformation(aRangeStart, aRangeEnd);
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


		if ((aItemFilter == Ci.calICalendar.ITEM_FILTER_ALL_ITEMS) &&
		    (aCount == 0) &&
		    (aRangeStart == null) &&
		    (aRangeEnd == null)) {
			this.logInfo("getItems: Request to get all Items in Calendar. Probably an export");
			this.exporting = true;
		}

		var wantEvents = ((aItemFilter & Ci.calICalendar
			.ITEM_FILTER_TYPE_EVENT) != 0);

		var wantTodos = ((aItemFilter & Ci.calICalendar
			.ITEM_FILTER_TYPE_TODO) != 0);

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

		if (wantEvents) this.logInfo("Events are requested by calendar.");
		if (wantTodos) this.logInfo("Tasks are requested by calendar.");
		if (wantInvitations) this.logInfo("Invitations are requested by calendar.");

		if ((!this.supportsEvents) && (!this.supportsTasks)) {
			// Something requested we cannot fullfill.
			this.logInfo("This folder currently is not able yet to support events or tasks.");
			this.notifyOperationComplete(aListener,
				Cr.NS_OK,
				Ci.calIOperationListener.GET,
				null, null);
			return;
		}

		var eventsRequestedAndPossible = ((wantEvents) && (this.supportsEvents));
		var tasksRequestedAndPossible = ((wantTodos) && (this.supportsTasks));
		if ((!eventsRequestedAndPossible) && (!tasksRequestedAndPossible)) {
			this.logInfo("This folder is not able to support requested items.");
			this.notifyOperationComplete(aListener,
				Cr.NS_OK,
				Ci.calIOperationListener.GET,
				null, null);
			return;
		}
		if (eventsRequestedAndPossible) this.logInfo("Events are requested and this is possible for this folder");
		if (tasksRequestedAndPossible) this.logInfo("Tasks are requested and this is possible for this folder");

		// Try to make both start and end date be valid
		// No more than two years apart because exchange does not want this.
		if ((!aRangeStart) && (aRangeEnd)) {
			aRangeStart = aRangeEnd.clone();
			var tmpDur = cal.createDuration();
			//tmpDur.hours = -24;
			tmpDur.weeks = -8;
			aRangeStart.addDuration(tmpDur);
			//aRangeStart.year = aRangeStart.year - 1;
		}

		if ((aRangeStart) && (!aRangeEnd)) {
			aRangeEnd = aRangeStart.clone();
			var tmpDur = cal.createDuration();
			//tmpDur.hours = 24;
			tmpDur.weeks = 8;
			aRangeEnd.addDuration(tmpDur);
			//aRangeEnd.year = aRangeEnd.year + 1;
		}

		if (!aRangeStart) {
			// Set rangestart to today.
			if (this.startDate) {
				aRangeStart = this.startDate.clone();
			}
			else {
				aRangeStart = now();
			}
		}

		if (!aRangeEnd) {
			// Set rangeend to today.
			if (this.endDate) {
				aRangeEnd = this.endDate.clone();
			}
			else {
				aRangeEnd = now();
			}
		}

		if (aRangeStart.year == 1970) {
			aRangeStart = aRangeEnd.clone();
			var tmpDur = cal.createDuration();
			//tmpDur.hours = -24;
			tmpDur.weeks = -8;
			aRangeStart.addDuration(tmpDur);
		}

		var dateChanged = false;
		var startChanged = false;
		var endChanged = false;

		if (!this.startDate) {
			this.logInfo("no startdate");
			this.startDate = aRangeStart.clone();
			dateChanged = true;
		}
		else {
			if (this.startDate.compare(aRangeStart) > 0) {
				this.logInfo("aRangeStart ("+aRangeStart.toString()+") is before current startDate ("+this.startDate.toString()+")");
				// New start date is before old startdate. Period has grown.
				var oldStartDate = this.startDate.clone();
				this.startDate = aRangeStart.clone();
				dateChanged = true;
				startChanged = true;
			}
		}

		if (!this.endDate) {
			this.logInfo("no enddate");
			this.endDate = aRangeEnd.clone();
			dateChanged = true;
		}
		else {
			if (this.endDate.compare(aRangeEnd) < 0) {
				this.logInfo("aRangeEnd ("+aRangeEnd.toString()+") is after current endDate ("+this.endDate.toString()+")");
				// New end date is after old enddate. Period has grown.
				var oldEndDate = this.endDate.clone();
				this.endDate = aRangeEnd.clone();
				dateChanged = true;
				endChanged = true;
			}
		}

		if (!dateChanged) {

			if (aRangeStart)  { this.logInfo("getItems 5a: aRangeStart:"+aRangeStart.toString()); }
			if (aRangeEnd) { this.logInfo("getItems 5b: aRangeEnd:"+aRangeEnd.toString()); }

			this.addToOfflineQueue(aRangeStart, aRangeEnd);
/*			var itemsFromCache = this.getItemsFromOfflineCache(aRangeStart, aRangeEnd);
			if (itemsFromCache) {
				this.logInfo("We got '"+itemsFromCache.length+"' items from offline cache.");
			}*/

			var events = [];
			var tasks = [];

			for (var index in this.itemCache) {
				if (isEvent(this.itemCache[index])) {
					if ( ( (this.itemCache[index].startDate.compare(aRangeEnd) < 1) &&
					      (this.itemCache[index].endDate.compare(aRangeStart) > -1) ) ||
						(this.exporting) ) {
						events.push(this.itemCache[index]);
					} 
				}
				else {
					if (isToDo(this.itemCache[index])) {
						if ( (this.itemCache[index].status != "COMPLETED") || (aItemFilter & Ci.calICalendar
			.ITEM_FILTER_COMPLETED_YES)) {
							tasks.push(this.itemCache[index]);
						}
					}
				}
			}

			this.logInfo("We got '"+events.length+"' events and  '"+tasks.length+"'  tasks from memory cache.");
			if (aListener) {
				this.logInfo("We have a listener so going to inform it.(2)");
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


			return;
		}

       		var self = this;

		if ((!this.syncInboxState) && (!this.weAreInboxSyncing)) {
			if ((this.folderBase == "calendar") && (!this.folderID)) {

				// Start the inbox poller to check for meetinginvitations or cancelations.
				this.checkInbox();
			}
		}


		if ((wantEvents) && (this.supportsEvents)) {
			this.logInfo("Requesting events from exchange server.");
			if ((startChanged) || (endChanged)) {
				if (startChanged) {
					this.logInfo("Startdate has changed to an earlier date. Requesting difference.");
					this.requestPeriod(aRangeStart, oldStartDate, aItemFilter, aCount, false);
				}
				if (endChanged) {
					this.logInfo("Enddate has changed to a later date. Requesting difference.");
					this.requestPeriod(oldEndDate, aRangeEnd, aItemFilter, aCount, true);
				}
			}
			else {
				this.logInfo("New time period. Requesting items in period.");
				this.requestPeriod(aRangeStart, aRangeEnd, aItemFilter, aCount, false);
			}
		}
	
		if ((wantTodos) && (this.supportsTasks)) {
			this.logInfo("Requesting tasks from exchange server.");
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

	requestPeriod: function _requestPeriod(aStartDate, aEndDate, aItemFilter, aCount, findReverse)
	{
		this.logInfo("Getting period from: "+aStartDate.toString()+" until "+aEndDate.toString());

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
			this.logInfo("Getting period part of: "+startDate.toString()+" until "+endDate.toString());
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
		this.logInfo("Getting period done.");
	},

	//  calIOperation refresh();
	refresh: function _refresh() {

		this.logInfo("refresh");
		if (this.shutdown) {
			return;
		}

		if ((!this.syncState) || (this.weAreSyncing)) {
			return;
		}

		if (!this.isInitialized) {	
			return;
		}

		//this.logInfo("Refresh. We start a sync.");
		var self = this;

		this.getSyncState();

		if (this.OnlyShowAvailability) {
			this.getOnlyFreeBusyInformation(this.lastValidRangeStart, this.lastValidRangeEnd);
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
				this.logInfo("isInvitation FOUND myself");

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
				this.logInfo("I'm the organiser");
			}
		}*/

		return false;
	},

	// boolean canNotify(in AUTF8String aMethod, in calIItemBase aItem);
	canNotify: function _canNotify(aMethod, aItem)
	{
		this.logInfo("canNotify: aMethod="+aMethod+":"+aItem.title);

		return true;
	},

	// calIAttendee getInvitedAttendee(in calIItemBase aItem);
	getInvitedAttendee: function _getInvitedAttendee(aItem)
	{
		//this.logInfo("getInvitedAttendee 1:"+aItem.title);
		if (!aItem) {
			return;
		}

		// Parse through the attendees
		var attendees = aItem.getAttendees({});
		for each (var attendee in attendees) {
			//this.logInfo("getInvitedAttendee 2:"+attendee.id);
			if ((attendee.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()) ||
				(attendee.id.replace(/^exchangecalendar:/, '').toLowerCase() == this.mailbox.toLowerCase()) ) {
				//this.logInfo("getInvitedAttendee FOUND myself:"+aItem.title);
				return attendee; //.clone();
			}
		}

		if (aItem.getProperty("X-IsInvitation") == "true") {
			//this.logInfo("getInvitedAttendee  X-IsInvitation = true");
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
//		this.logInfo("getFreeBusyIntervals: " + aCalId + ", aBusyTypes:"+aBusyTypes);

		if (aCalId.indexOf("@") < 0 || aCalId.indexOf(".") < 0) {
            		// No valid email, screw it
			if (aListener) {
				aListener.onResult(null, null);
			}
			return;
		}

		var self = this;
		this.addToQueue( erGetUserAvailabilityRequest, 
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: this.folderBase,
			 serverUrl: this.serverUrl,
			 email: aCalId.replace(/^MAILTO:/, ""),
			 attendeeType: 'Required',
			 start: cal.toRFC3339(aRangeStart.getInTimezone(exchWebService.commonFunctions.ecUTC())),
			 end: cal.toRFC3339(aRangeEnd.getInTimezone(exchWebService.commonFunctions.ecUTC())),
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
		this.logInfo("get scheme");
		return "";
	},

	//    attribute AUTF8String senderAddress;
	get senderAddress()
	{
		this.logInfo("get senderAddress");
		return "hihi";
	},

	set senderAddress(aValue)
	{
		this.logInfo("set senderAddress("+aValue+")");
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
		this.logInfo("sendItems");
	},
// End calIItipTransport

	isRemoved: function _isRemoved(aItem)
	{
		if (!aItem) {
			return null;
		}

		this.logInfo("isRemoved title:"+aItem.title+", status="+aItem.status);

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
			this.logInfo("getExceptions: nr:"+tmpCount+", isNegative:"+recurrenceItem.isNegative);
			if (recurrenceItem.isNegative) {
				// A deletion is an exception and therefore isNegative === true
				var occurrences = recurrenceItem.getOccurrences(this.startDate, this.startDate, this.endDate, 0,  {});
				this.logInfo("getExceptions: we have occurrences.length="+occurrences.length);
				for each(var occurrence in occurrences) {
					exceptions[occurrence.toString()] = occurrence;
				}				
			}
		}
		return exceptions;
	},

	getRemovedOccurrence: function _getRemovedOccurrence(aOldItem, aNewItem)
	{
		this.logInfo("getRemovedOccurrence");
		// When an occurences gets removed from we get an extra occurenceitem in the recurrenceinfo list.

		var newRecurrenceItems;
		newRecurrenceItems = aNewItem.recurrenceInfo.getRecurrenceItems({});

		var oldRecurrenceItems;
		oldRecurrenceItems = aOldItem.recurrenceInfo.getRecurrenceItems({});

		if ((!newRecurrenceItems) || (newRecurrenceItems.length == 0)) {
			// No recurrenceItems in the new item
			// Nothing can be checked if it is removed.
			if (newRecurrenceItems) {
				this.logInfo("newRecurrenceItems.length="+newRecurrenceItems.length);
			}
			this.logInfo("getRemovedOccurrence: newItem has occurrenceInfo but no recurrenceItems. newCount="+newRecurrenceItems.length+",oldCount="+oldRecurrenceItems.length);
			return null;
		}

		if (newRecurrenceItems.length > oldRecurrenceItems.length) {
			this.logInfo("getRemovedOccurrence: a New occurrence. newCount="+newRecurrenceItems.length+",  oldCount="+oldRecurrenceItems.length);
		}

		var newException = aNewItem.recurrenceInfo.getExceptionIds({});
		var oldException = aOldItem.recurrenceInfo.getExceptionIds({});
		if (newException.length != oldException.length) {
			this.logInfo("getRemovedOccurrence: Exceptions count changed. newCount="+newException.length+",  oldCount="+oldException.length);
		}
		
		var oldExceptions = this.getExceptions(oldRecurrenceItems);

		var newExceptions = this.getExceptions(newRecurrenceItems);

		// Check if the newExceptions allready exists in the oldExceptions. If so remove it.
		for (var exceptionStr in newExceptions) {
			if (oldExceptions[exceptionStr]) {
				this.logInfo("getRemovedOccurrence: '"+exceptionStr+"' also exists in the old occurrence list.");
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
						this.logInfo("getRemovedOccurrence: we found our removed occurrence");
						return item;
					}
				}
			}
		}

		this.logInfo("getRemovedOccurrence: we DID NOT FIND our removed occurrence");
		return null;
	},

	get prefs()
	{
		return this.mPrefs;
	},

	get exchangePrefVersion()
	{
		return exchWebService.commonFunctions.safeGetIntPref( this.prefs, "exchangePrefVersion", 0);
	},

	get isInitialized()
	{
		if (!this.id) {
			return false;
		}

		if (!this.mPrefs) {
			this.logInfo("Found old version preferences. Going to update to the new. This is only for exisiting calendars.");
			this.mPrefs = Cc["@mozilla.org/preferences-service;1"]
			            .getService(Ci.nsIPrefService)
				    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+this.id+".");
			this.prefs.setIntPref("exchangePrefVersion", 1);

			var oldPrefs = Cc["@mozilla.org/preferences-service;1"]
					.getService(Ci.nsIPrefService)
					.getBranch("calendar.registry."+this.id+".");
			oldPrefs.setCharPref("uri", "https://auto/"+this.id);
		}

		var returnVal = false;
		try {
			this.prefs.getCharPref("ecServer");
			returnVal = true;
		}
		catch(err) {
			returnVal = false;
		}

		if (this.firstrun) {
			this.firstrun = false;

			// Convert oldstyle ExchangeCalendar prefs to newstyle. (since version 0.7.26)
			var oldPrefs = Cc["@mozilla.org/preferences-service;1"]
					.getService(Ci.nsIPrefService)
					.getBranch("calendar.registry."+this.id+".");
			try {
				oldPrefs.getCharPref("ecServer");
				// If we get here old prefs exists. We need to move them.
				this.logInfo("Performing upgrade of userpreferences.");
				this.prefs.setCharPref("ecServer", oldPrefs.getCharPref("ecServer"));
				oldPrefs.clearUserPref("ecServer");
				this.prefs.setCharPref("ecMailbox", oldPrefs.getCharPref("ecMailbox"));
				oldPrefs.clearUserPref("ecMailbox");
				this.prefs.setCharPref("ecDisplayname", oldPrefs.getCharPref("ecDisplayname"));
				oldPrefs.clearUserPref("ecDisplayname");
				this.prefs.setCharPref("ecUser", oldPrefs.getCharPref("ecUser"));
				oldPrefs.clearUserPref("ecUser");
				this.prefs.setCharPref("ecDomain", oldPrefs.getCharPref("ecDomain"));
				oldPrefs.clearUserPref("ecDomain");
				this.prefs.setCharPref("ecFolderbase", oldPrefs.getCharPref("ecFolderbase"));
				oldPrefs.clearUserPref("ecFolderbase");
				this.prefs.setCharPref("ecFolderpath", oldPrefs.getCharPref("ecFolderpath"));
				oldPrefs.clearUserPref("ecFolderpath");
				try {
					this.prefs.setCharPref("ecFolderID", oldPrefs.getCharPref("ecFolderID"));
					oldPrefs.clearUserPref("ecFolderID");
					this.prefs.setCharPref("ecChangeKey", oldPrefs.getCharPref("ecChangeKey"));
					oldPrefs.clearUserPref("ecChangeKey");
				}
				catch(err) {
				}
				this.addActivity(calGetString("calExchangeCalendar", "updateUserPrefs1", null, "exchangecalendar"), "xx", Date.now(), Date.now());
			}
			catch(err) {
				// If we get here old prefs do not exists. Al is fine.
			}

			getFreeBusyService().addProvider(this);

			// The first thing we want to do is check the folderbase and folderpath for their id & changekey.
			// It might have changed between restarts.
			this.checkFolderPath();

			this.syncState = exchWebService.commonFunctions.safeGetCharPref(this.prefs,"syncState", "");
			this.syncInboxState = exchWebService.commonFunctions.safeGetCharPref(this.prefs,"syncInboxState", "");

			this.getSyncState();
			this.getTimeZones();

		}
		return returnVal;

	},

	getCharPref: function(aName) {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, aName, null);
	},

	setCharPref: function(aName, aValue) {
		if (this.prefs) {
			return this.prefs.setCharPref(aName, aValue);
		}
	},

	get user() {
		var username = exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecUser", "");
		if (username.indexOf("@") > -1) {
			return username;
		}
		else {
			if (this.domain == "") {
				return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecUser", "");
			}
			else {
				return this.domain+"\\"+exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecUser", "");
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
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecDomain", "");
	},

	set domain(value) {
		return this.setCharPref("ecDomain", value);
	},

	get mailbox() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecMailbox", "");
	},

	get serverUrl() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecServer", "");
	},

	get userDisplayName() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecDisplayname", "");
	},

	get folderBase() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecFolderbase", "calendar");
	},

	get folderPath() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecFolderpath", "/");
	},

	get folderID() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecFolderID", null);
	},

	set folderID(aValue) {
		this.prefs.setCharPref("ecFolderID", aValue);
	},

	get changeKey() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecChangeKey", null);
	},

	set changeKey(aValue) {
		this.prefs.setCharPref("ecChangeKey", aValue);
	},

	get folderIDOfShare() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecFolderIDOfShare", "");
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

		return exchWebService.commonFunctions.safeGetBoolPref(this.prefs, "ecPollInbox", true);
	},

	get pollInboxInterval() {
		return exchWebService.commonFunctions.safeGetIntPref(this.prefs, "ecPollInboxInterval", 180);
	},

	get doAutoRespondMeeting() {
		return exchWebService.commonFunctions.safeGetBoolPref(this.prefs, "ecAutoRespondMeetingRequest", false);
	},

	get autoResponseAnswer() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecAutoRespondAnswer", "TENTATIVE");
	},

	get doAutoRemoveInvitationCancelation1() {
		return exchWebService.commonFunctions.safeGetBoolPref(this.prefs, "ecAutoRemoveInvitationCancellation1", false);
	},

	get doAutoRemoveInvitationCancelation2() {
		return exchWebService.commonFunctions.safeGetBoolPref(this.prefs, "ecAutoRemoveInvitationCancellation2", false);
	},

	get doAutoRemoveInvitationResponse1() {
		return exchWebService.commonFunctions.safeGetBoolPref(this.prefs, "ecAutoRemoveInvitationResponse1", true);
	},

	get sendAutoRespondMeetingRequestMessage() {
		return exchWebService.commonFunctions.safeGetBoolPref(this.prefs, "ecSendAutoRespondMeetingRequestMessage", false);
	},

	get autoRespondMeetingRequestMessage() {
		return exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ecAutoRespondMeetingRequestMessage", "");
	},

	get cacheStartupBefore() {
		return exchWebService.commonFunctions.safeGetIntPref(null, "extensions.1st-setup.cache.startupBefore", 30, true);
	},

	get cacheStartupAfter() {
		return exchWebService.commonFunctions.safeGetIntPref(null, "extensions.1st-setup.cache.startupAfter", 30, true);
	},

	get startCacheDate() {
		var aDate = cal.now();
		var tmpDur = cal.createDuration();
		tmpDur.hours = -1 * 24 * this.cacheStartupBefore;
		aDate.addDuration(tmpDur);
		this.logInfo("startCacheDate:"+aDate.toString());
		return aDate
	},

	get endCacheDate() 
	{
		var aDate = cal.now();
		var tmpDur = cal.createDuration();
		tmpDur.hours = 1 * 24 * this.cacheStartupAfter;
		aDate.addDuration(tmpDur);
		this.logInfo("endCacheDate:"+aDate.toString());
		return aDate
	},

	checkInbox: function _checkInbox()
	{
//		this.logInfo("checkInbox.");
		if ((this.weAreInboxSyncing) || (!this.doPollInbox) || (this.OnlyShowAvailability)) {
			return;
		}

		this.weAreInboxSyncing = true;
		var self = this;

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
//		this.logInfo("syncInbox.");
		if ((this.weAreInboxSyncing) || (!this.doPollInbox)) {
			return;
		}

		this.inboxPoller.cancel();

		var self = this;
		this.weAreInboxSyncing = true;

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

		this.logInfo("Going to remove meetingItem:"+aRequestItem.title);
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
			null,
			2);
	},

	removeResponseItem: function _removeResponseItem(aResponse)
	{
		var self = this;

		this.logInfo("Going to remove responseItem:"+aResponse.nsTypes::Subject.toString()+" from:"+aResponse.nsTypes::Sender.nsTypes::Mailbox.nsTypes::Name.toString()+" ("+aResponse.nsTypes::Sender.nsTypes::Mailbox.nsTypes::EmailAddress.toString()+")");
		this.addToQueue( erDeleteItemRequest, 
			{user: this.user, 
			 mailbox: this.mailbox,
			 folderBase: 'inbox',
			 serverUrl: this.serverUrl,
			 item: null,
			 folderID: null,
			 id: aResponse.nsTypes::ItemId.@Id,
			 changeKey: aResponse.nsTypes::ItemId.@ChangeKey,
			 itemType: "response"}, 
			function(erDeleteItemRequest) { self.removeMeetingItemOk(erDeleteItemRequest);}, 
			function(erDeleteItemRequest, aCode, aMsg) { self.removeMeetingItemError(erDeleteItemRequest, aCode, aMsg);},
			null,
			2);
	},

	removeMeetingItemOk: function _removeMeetingItemOk(erDeleteItemRequest)
	{
		this.notConnected = false;
		this.saveCredentials(erDeleteItemRequest.argument);
		this.logInfo("removeItemOk: "+erDeleteItemRequest.argument.itemType);

	},

	removeMeetingItemError: function _removeMeetingItemError(erDeleteItemRequest, aCode, aMsg)
	{
		this.saveCredentials(erDeleteItemRequest.argument);
		this.notConnected = true;
		this.logInfo("removeItemError: "+erDeleteItemRequest.argument.itemType+" msg:"+String(aMsg));
	},

	syncInboxOK: function _syncInboxOK(erSyncInboxRequest, creations, updates, deletions, syncState)
	{
//		this.logInfo("syncInboxOk.");
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
//		this.logInfo("syncInboxOK meetingrequests: Creation:"+creations.meetingrequests.length+", Updates:"+updates.meetingrequests.length+", Deletions:"+deletions.meetingrequests.length);
//		this.logInfo("syncInboxOK meetingCancellations: Creation:"+creations.meetingCancellations.length+", Updates:"+updates.meetingCancellations.length+", Deletions:"+deletions.meetingCancellations.length);

		// Save requests into cache.
		for each (var request in creations.meetingrequests) {
			var meetingItem = this.convertExchangeAppointmentToCalAppointment(request, true);
			if (meetingItem) {
				this.logInfo(" -- MeetingRequest creation:"+ meetingItem.title+", UID:"+request.nsTypes::UID.toString()+",id:"+meetingItem.id+",changeKey:"+meetingItem.getProperty("X-ChangeKey"));
				meetingItem.setProperty("X-MEETINGREQUEST", true);
				meetingItem.setProperty("STATUS", "NONE")
				//this.meetingRequestsCache[request.nsTypes::UID.toString()] = meetingItem;
				this.meetingRequestsCache[meetingItem.id] = meetingItem;
			}
		}

		for each (var update in updates.meetingrequests) {
			var meetingItem = this.convertExchangeAppointmentToCalAppointment(update, true);
			if (meetingItem) {
				this.logInfo(" -- MeetingRequest update:"+ meetingItem.title+", UID:"+update.nsTypes::UID.toString()+",id:"+meetingItem.id+",changeKey:"+meetingItem.getProperty("X-ChangeKey"));
				meetingItem.setProperty("X-MEETINGREQUEST", true);
				
				if ((this.meetingRequestsCache[update.id]) && (this.meetingRequestsCache[update.id].getProperty("X-UID") == meetingItem.getProperty("X-UID"))) {
					this.logInfo("2 modifing  meeting request:"+update.id);
//					this.meetingRequestsCache[update.nsTypes::UID.toString()] = meetingItem;
					this.meetingRequestsCache[meetingItem.id] = meetingItem;
				}
				else {
					this.logInfo("WE DO NOT HAVE AN MEETING IN CACHE FOR THIS UPDATE!!!!. PLEASE REPORT");
				}
			}
		}

		for each (var deletion in deletions.meetingrequests) {
			var meetingItem = this.convertExchangeAppointmentToCalAppointment(deletion, true);
			if (meetingItem) {
				this.logInfo(" -- MeetingRequest deletion:"+ meetingItem.title+", UID:"+deletion.nsTypes::UID.toString()+",id:"+meetingItem.id+",changeKey:"+meetingItem.getProperty("X-ChangeKey"));
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
					this.logInfo("WE DO NOT HAVE AN MEETING IN CACHE FOR THIS UPDATE!!!!. PLEASE REPORT");
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
					//this.logInfo("request '"+inCalendar.title+"' allready in Calendar with status="+inCalendar.getProperty("STATUS"));
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
					//this.logInfo("meetingRequest:"+index.nsTypes::Subject.toString());

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
						this.logInfo("meetingCancelation:"+index.title);
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
			this.meetingResponsesCache[response.nsTypes::ItemId.@Id.toString()] = response;
		}

		for each (var response in updates.meetingResponses) {
			if (this.meetingResponsesCache[response.nsTypes::ItemId.@Id.toString()]) {
				this.meetingResponsesCache[response.nsTypes::ItemId.@Id.toString()] = response;
			}
			else {
				this.logInfo("WE DO NOT HAVE AN RESPONSE IN CACHE FOR THIS UPDATE!!!!. PLEASE REPORT");
			}
		}

		for each (var response in deletions.meetingResponses) {
			if (this.meetingResponsesCache[response.nsTypes::ItemId.@Id.toString()]) {
				delete this.meetingResponsesCache[response.nsTypes::ItemId.@Id.toString()];
			}
		}


		if (this.doAutoRemoveInvitationResponse1) {
			for each(var response in this.meetingResponsesCache) {
				// Check if we have this meeting 
				var tmpUID = response.nsTypes::UID.toString();
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
						delete this.meetingResponsesCache[response.nsTypes::ItemId.@Id.toString()];
					}
				}				
			}
		}

		if ((requestCount > 0) || (cancelationCount > 0)) {
			this.refresh();
		}

//		this.logInfo("syncInboxOK: left with meetingRequests:"+requestCount+", meetingCancelations:"+cancelationCount);

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

	syncInboxError: function _syncFolderItemsError(erSyncFolderItemsRequest, aCode, aMsg)
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

		var start = this.tryToSetDateValue(aCi.nsTypes::StartTime);
		var end   = this.tryToSetDateValue(aCi.nsTypes::EndTime);
		var type  = types[aCi.nsTypes::BusyType];

		return new cal.FreeBusyInterval(aCalId, type,
					       	  start, end);
	},

	showUserAvailability: function _showUserAvailability(aEvents)
	{

		if (this.showUserAvailabilityBusy) {
			return;
		}

		this.showUserAvailabilityBusy = true;

		this.logInfo("showUserAvailability 1");

		// Clear current list.
		for (var index in this.itemCache) {
			this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
		}
		this.itemCache = [];

		
		for (var index in aEvents) {
			if (aEvents[index].nsTypes::BusyType.toString() != "Free") {
				var item = createEvent();
				item.calendar = this.superCalendar;

				item.id = exchWebService.commonFunctions.getUUID();

				item.title = this.tryToSetValue(aEvents[index].nsTypes::BusyType.toString(), "");
				if (! item.title) {
					item.title = "";
				}

				item.title = this.tryToSetValue(aEvents[index].nsTypes::CalendarEventDetails.nsTypes::Subject.toString(), "")+" ("+item.title+")";

				item.setProperty("LOCATION", aEvents[index].nsTypes::CalendarEventDetails.nsTypes::Location.toString());

		//		item.setProperty("DESCRIPTION", aCalendarItem.nsTypes::Body.toString());

				item.startDate = this.tryToSetDateValue(aEvents[index].nsTypes::StartTime, null);
				if (! item.startDate) {
					this.logInfo("We have an empty startdate. Skipping this item.");
					return null;
				}

				item.endDate = this.tryToSetDateValue(aEvents[index].nsTypes::EndTime, null);
				if (! item.endDate) {
					this.logInfo("We have an empty enddate. Skipping this item.");
					return null;
				}

				this.itemCache[item.id] = item;
				this.notifyTheObservers("onAddItem", [item]);
			}
		}

		this.logInfo("showUserAvailability 2");
		this.showUserAvailabilityBusy = false;
	},

	getUserAvailabilityRequestOK: function _getUserAvailabilityRequestOK(erGetUserAvailabilityRequest, aEvents)
	{
		this.notConnected = false;
		this.logInfo("getUserAvailabilityRequestOK");
		this.saveCredentials(erGetUserAvailabilityRequest.argument);

		if (this.OnlyShowAvailability) {
			this.showUserAvailability(aEvents);
		}
		else {
			var items = new Array();
			for (var index in aEvents) {
				var item = this.doAvailability(erGetUserAvailabilityRequest.argument.calId, aEvents[index]);
				items.push(item);
			}
		
			erGetUserAvailabilityRequest.listener.onResult(null, items);
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
			erGetUserAvailabilityRequest.listener.onResult(null, null);
		}
	},

	resetCalendar: function _resetCalendar()
	{
		this.logInfo(" resetCalendar 1");

		for each(var tmpJob in this.tmpJobs) {
			if (tmpJob) {
				if ((tmpJob.isRunning) && (tmpJob.parent)) {
					tmpJob.parent.stopRequest();
				}
			}
		}

		// Clean the job queue.
		for each(var tmpQueue in this.queue) {
			this.observerService.notifyObservers(this, "onExchangeProgressChange", -1*tmpQueue.length); 
		}

		this.queue = new Array;
		this.offlineQueue = [];

		this.doReset = true;

		this.resetStart = Date.now();

		this.inboxPoller.cancel();
		for (var index in this.timers) {
			if (this.timers[index]) {
				this.timers[index].cancel();
				delete this.timers[index];
			}
		}
		this.offlineTimer.cancel();
		this.offlineTimer = null;

		if (this.calendarPoller) {
			this.calendarPoller.cancel();
		}

		if (this.getProperty("disabled")) {
			// Remove all items in cache from calendar.
			for (var index in this.itemCache) {
				if (this.itemCache[index]) {
					//this.itemCache[index].clearAlarms();
					this.deleteAlarms(this.itemCache[index]);
					this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
					this.itemCache[index]= null;
				}
			}
			this.itemCache = [];
			this.recurringMasterCache = [];
		}
		else {
			this.performReset();
		}
	},

	performReset: function _performReset()
	{
		this.logInfo(" performReset 1");

		if (!this.doReset) {
			return;
		}

		this.doReset = false;

		for each(var tmpJob in this.tmpJobs) {
			if (tmpJob) {
				if ((tmpJob.isRunning) && (tmpJob.parent)) {
					tmpJob.parent.stopRequest();
				}
			}
		}

		// Clean the job queue again.
		for each(var tmpQueue in this.queue) {
			this.observerService.notifyObservers(this, "onExchangeProgressChange", -1*tmpQueue.length); 
		}

		this.queue = new Array;
		this.offlineQueue = [];

		// Now we can initialize.
		this.syncState = null;
		this.prefs.deleteBranch("syncState");
		this.weAreSyncing = false;
		this.firstSyncDone = false;
		
		// Remove all items in cache from calendar.
		for (var index in this.itemCache) {
			if (this.itemCache[index]) {
				//this.itemCache[index].clearAlarms();
				this.deleteAlarms(this.itemCache[index]);
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
			this.logInfo(" THIS IS STRANGE beginDate");
			var oldBeginDate = now();
		}
		if (this.endDate) {
			var oldEndDate = this.endDate.clone();
		}
		else {
			this.logInfo(" THIS IS STRANGE endDate");
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

		this.checkFolderPath();
		this.getSyncState();
		this.getTimeZones();

		this.logInfo("oldBeginDate:"+oldBeginDate.toString()+", oldEndDate:"+oldEndDate.toString());
		this.getItems(Ci.calICalendar.ITEM_FILTER_TYPE_TODO +
				Ci.calICalendar.ITEM_FILTER_TYPE_EVENT
				, 0, oldBeginDate, oldEndDate, null);

		// Make an event for thistory.
		this.addActivity(calGetString("calExchangeCalendar", "resetEventMessage", [this.name], "exchangecalendar"), "", this.resetStart, Date.now());
		this.logInfo(" performReset 2");
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
				this.logInfo("makeRecurrenceRule: We have no recurrenceInfo");
			}
			if (aItem.parentItem.id != aItem.id) {
				this.logInfo("makeRecurrenceRule: We have aItem.parentItem.id != aItem.id");
			}
			return;
		}

		var rrule = null;
		for each (var ritem in aItem.recurrenceInfo.getRecurrenceItems({})) {
			if (calInstanceOf(ritem, Ci.calIRecurrenceRule)) {
				rrule = ritem;
this.logInfo(" ;;;; rrule:"+rrule.icalProperty.icalString);
				//break;
			}
		}

		if (!rrule) {
			// XXX exception?
			this.logInfo("makeRecurrenceRule: We have no rrule");
			return;
		}

		var r = <nsTypes:Recurrence xmlns:nsTypes={nsTypes}/>;

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
				r.nsTypes::RelativeYearlyRecurrence.nsTypes::DaysOfWeek = dayRevMap[m[2]];
				r.nsTypes::RelativeYearlyRecurrence.nsTypes::DayOfWeekIndex = weekRevMap[m[1]];
				r.nsTypes::RelativeYearlyRecurrence.nsTypes::Month = monthIdxMap[prop["BYMONTH"] - 1];
			} else {
				r.nsTypes::AbsoluteYearlyRecurrence.nsTypes::DayOfMonth = prop["BYMONTHDAY"];
				r.nsTypes::AbsoluteYearlyRecurrence.nsTypes::Month = monthIdxMap[prop["BYMONTH"] - 1];
			}
			break;
		case 'MONTHLY':
			if (prop["BYDAY"]) {
				r.nsTypes::RelativeMonthlyRecurrence.nsTypes::Interval = rrule.interval;
				var m = prop["BYDAY"].match(/^(-?\d)(..)$/);
				r.nsTypes::RelativeMonthlyRecurrence.nsTypes::DaysOfWeek = dayRevMap[m[2]];
				r.nsTypes::RelativeMonthlyRecurrence.nsTypes::DayOfWeekIndex = weekRevMap[m[1]];
			} else {
				r.nsTypes::AbsoluteMonthlyRecurrence.nsTypes::Interval = rrule.interval;
				r.nsTypes::AbsoluteMonthlyRecurrence.nsTypes::DayOfMonth = prop["BYMONTHDAY"];
			}
			break;
		case 'WEEKLY':
			r.nsTypes::WeeklyRecurrence.nsTypes::Interval = rrule.interval;
			var days = [];
			var daystr = prop["BYDAY"] || dayIdxMap[startDate.weekday];
			for each (let day in daystr.split(",")) {
				days.push(dayRevMap[day]);
			}
			r.nsTypes::WeeklyRecurrence.nsTypes::DaysOfWeek = days.join(' ');
			break;
		case 'DAILY':
			r.nsTypes::DailyRecurrence.nsTypes::Interval = rrule.interval;
			break;
		}

		if (isEvent(aItem)) {
			var startDateStr = cal.toRFC3339(startDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
		}
		else {
			// We make a non-UTC datetime value for exchWebService.commonFunctions.
			// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
			//LOG("  ==== tmpStart:"+cal.toRFC3339(tmpStart));
			var startDateStr = cal.toRFC3339(startDate).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
		}

		if (rrule.isByCount && rrule.count != -1) {
			r.nsTypes::NumberedRecurrence.nsTypes::StartDate = startDateStr;
			r.nsTypes::NumberedRecurrence.nsTypes::NumberOfOccurrences = rrule.count;
		} else if (!rrule.isByCount && rrule.untilDate) {

			var endDate = rrule.untilDate.clone();
			if (isEvent(aItem)) {
				endDate.isDate = true;
				var endDateStr = cal.toRFC3339(endDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
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
			r.nsTypes::EndDateRecurrence.nsTypes::StartDate = startDateStr;
			r.nsTypes::EndDateRecurrence.nsTypes::EndDate = endDateStr;
		} else {
			r.nsTypes::NoEndRecurrence.nsTypes::StartDate = startDateStr;
		}

		/* We won't write WKST/FirstDayOfWeek for now because it is Exchange 2010 and up */

		e.appendChild(r);
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
		this.logInfo("getSingleSnoozeState");
		var tmpStr = null;
		var mozSnooze = aSingle.getProperty("X-MOZ-SNOOZE-TIME");
		if (mozSnooze) {
			if (aSingle.alarmLastAck) {
				// We have a X-MOZ-SNOOZE and an alarmLastAck. We are going to check if the LastAck is before the X-MOZ-SNOOZE or after
				this.logInfo("We have a X-MOZ-SNOOZE and an alarmLastAck. We are going to check if the LastAck is before the X-MOZ-SNOOZE or after.");

				// if mozSnooze < alarmLastAck it means the last alarm has been Acked and it was a dismiss.
				// if mozSnooze >= alarmLastAck it means the last alarm was snoozed to a new alarm time in the future.
				var tmpMozSnooze = cal.createDateTime(mozSnooze);
				if (tmpMozSnooze.compare(aSingle.alarmLastAck) == -1) {
					this.logInfo("The X-MOZ-SNOOZE is before alarmLastAck. The alarm has been dismissed.");
					tmpStr = "4501-01-01T00:00:00Z";
				}
				else {
					this.logInfo("The X-MOZ-SNOOZE is after or equal to alarmLastAck. The alarm has been snoozed.");
					tmpStr = mozSnooze;
				}
			}
			else {
				// We have a X-MOZ-SNOOZE and no alarmLastAck. This means we use the X-MOZ-SNOOZE as the next reminder time.
				this.logInfo("We have a X-MOZ-SNOOZE and no alarmLastAck. This means no snooze or dismiss yet and we use the X-MOZ-SNOOZE as the next reminder time.");
				tmpStr = mozSnooze;
			}
		}
		else {
			if (aSingle.alarmLastAck) {
				// The alarm has been snoozed or dismissed before and we do not have a X-MOZ-SNOOZE. So it is dismissed.
				this.logInfo("The alarm has been snoozed or dismissed before and we do not have a X-MOZ-SNOOZE. So it is dismissed.");
				tmpStr = "4501-01-01T00:00:00Z";
			}
			else {
				// We have no snooze time and no alarmLastAck this means the alarm was never snoozed or dismissed
				// We set the next reminder to the alarm time.
				if (this.getAlarmTime(aSingle)) {
					this.logInfo("We have no snooze time and no alarmLastAck this means the alarm was never snoozed or dismissed. We set the next reminder to the alarm time.");
					tmpStr = this.getAlarmTime(aSingle).icalString;
				}
				else {
					this.logInfo("We have no snooze time and no alarmLastAck this means the alarm was never snoozed or dismissed AND we have no alarm time skipping PidLidReminderSignalTime.");
					tmpStr = null;
				}
			}
		}

		if (tmpStr) {
			this.logInfo("We have a new PidLidReminderSignalTime:"+tmpStr);
			let eprop = <nsTypes:ExtendedProperty xmlns:nsTypes={nsTypes}/>;
			eprop.nsTypes::ExtendedFieldURI.@DistinguishedPropertySetId = "Common";
			eprop.nsTypes::ExtendedFieldURI.@PropertyId = MAPI_PidLidReminderSignalTime;
			eprop.nsTypes::ExtendedFieldURI.@PropertyType = "SystemTime";
			var newSnoozeTime = cal.createDateTime(tmpStr);
			newSnoozeTime = newSnoozeTime.getInTimezone(cal.UTC());
			eprop.nsTypes::Value = cal.toRFC3339(newSnoozeTime);

			e.appendChild(eprop);
		}

		this.logInfo("getSingleSnoozeState END");
		return tmpStr;
	},

	getMasterSnoozeStates: function _getMasterSnoozeStates(e, aMaster, aItem)
	{
		this.logInfo("getMasterSnoozeStates");
		var tmpStr = "";

		if ((aItem) && (aMaster)) {
			this.logInfo("getMasterSnoozeStates: We have an item (occurrence/exception) and a master.");
			if (aMaster.hasProperty("X-MOZ-SNOOZE-TIME-"+aItem.recurrenceId.nativeTime)) {
				tmpStr = aMaster.getProperty("X-MOZ-SNOOZE-TIME-"+aItem.recurrenceId.nativeTime);
				this.logInfo("getMasterSnoozeStates: Master has a X-MOZ-SNOOZE-TIME value for this occurrence. startDate:"+aItem.startDate.icalString+", X-MOZ-SNOOZE-TIME:"+tmpStr);
				
				// What value does alarmLastAck has?? This will determine what to send to 
			}
			else {
				this.logInfo("getMasterSnoozeStates: Master has NO X-MOZ-SNOOZE-TIME value for this occurrence. startDate:"+aItem.startDate.icalString);

				// If alarmLastAck for this item is null then the item was dismissed.
				tmpStr = "";
			}
		}
		else {
			if (aMaster) {
				this.logInfo("getMasterSnoozeStates: We only have a master and no item. We are going to see if a X-MOZ-SNOOZE-TIME- is set for a child event.");

				// We need to get the event for which the alarm is active.
				var props = aMaster.propertyEnumerator;
				while (props.hasMoreElements()) {
					var prop = props.getNext().QueryInterface(Components.interfaces.nsIProperty);
					if (prop.name.indexOf("X-MOZ-SNOOZE-TIME-") == 0) {
						this.logInfo("getMasterSnoozeStates: "+prop.name+"="+prop.value);
						tmpStr = prop.value;
						this.logInfo("getMasterSnoozeStates2: Master has a X-MOZ-SNOOZE-TIME- value. "+prop.name+":"+tmpStr);
						break;
					}
				}

				if (tmpStr == "") {
					this.logInfo("We did not find a X-MOZ-SNOOZE-TIME- for one of the children.");

					// Nothing smoozed we are going to set it to the next alarm.
					this.logInfo("We did not find a childEvent by using the X-MOZ-SNOOZE-TIME-. We are going to find the child by the alarmLastAck of the Master. alarmLastAck:"+aMaster.alarmLastAck);
					if (aMaster.alarmLastAck) {
						this.logInfo("Master has an alarmLastAck. We set the alarm to the first child with an alarm after alarmLastAck.");
						var prevTime = aMaster.alarmLastAck.clone();
					}
					else {
						this.logInfo("Master has no alarmLastAck. We set the alarm to the first child with an alarm in the future.");
						var prevTime = cal.createDateTime().getInTimezone(cal.UTC());
					}

					var childEvent = null;

					this.logInfo("Trying to find a child event with an alarmdate after '"+prevTime.icalString+"'");
					var childAlarm = cal.createDateTime("4501-01-01T00:00:00Z");
					for (var index in this.itemCache) {
						if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aMaster.getProperty("X-UID"))) {
							var newChildAlarm = this.getAlarmTime(this.itemCache[index]);
							if ((newChildAlarm) && (newChildAlarm.compare(prevTime) == 1)) {
								if (childAlarm.compare(newChildAlarm) == 1) {
									childAlarm = newChildAlarm.clone();
									childEvent = this.itemCache[index];
									this.logInfo("Found child event for which the alarmdate ("+childAlarm.icalString+") is set after '"+prevTime.icalString+"'");
								}
							}
						}
					}
					if ((childAlarm) && (childEvent)) {
						this.logInfo("Found a child and we are going to calculate the alarmLastAck based on it.");
						tmpStr = this.getAlarmTime(childEvent);
						if (tmpStr) {
							tmpStr = tmpStr.icalString;
							this.logInfo("This child has the following alarm:"+tmpStr);
						}
						else {
							tmpStr = "";
							this.logInfo("Did not find an alarm time for the child. This is strange..!!");
						}

					}
					else {
						this.logInfo("We did not find a child. Unable to set alarmLastAck... Maybe set it to 4501-01-01T00:00:00Z");
						tmpStr = "4501-01-01T00:00:00Z";
					}
				}
			}
			else {
				this.logInfo("Only an item was specified. This is odd this should never happen. Bailing out.");
				return;
			}
		}

		if (tmpStr != "") {
			let eprop = <nsTypes:ExtendedProperty xmlns:nsTypes={nsTypes}/>;
			eprop.nsTypes::ExtendedFieldURI.@DistinguishedPropertySetId = "Common";
			eprop.nsTypes::ExtendedFieldURI.@PropertyId = MAPI_PidLidReminderSignalTime;
			eprop.nsTypes::ExtendedFieldURI.@PropertyType = "SystemTime";
			var newSnoozeTime = cal.createDateTime(tmpStr);
			newSnoozeTime = newSnoozeTime.getInTimezone(cal.UTC());
			eprop.nsTypes::Value = cal.toRFC3339(newSnoozeTime);

			e.appendChild(eprop);
		}
		this.logInfo("getMasterSnoozeStates END");
		return tmpStr;
	},

	getAlarmLastAck: function _getAlarmLastAck(e, aItem)
	{
		this.logInfo("getAlarmLastAck");
		var tmpStr = "";
/*		if (aItem.alarmLastAck) {
			this.logInfo("getAlarmLastAck: alarmLastAck:"+aItem.alarmLastAck.toString());
			var tmpDateTime = aItem.alarmLastAck.getInTimezone(exchWebService.commonFunctions.ecUTC());
			tmpStr = tmpStr + "alarmLastAck="+cal.toRFC3339(tmpDateTime.getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone()));

			
			let eprop = <nsTypes:ExtendedProperty xmlns:nsTypes={nsTypes}/>;
			eprop.nsTypes::ExtendedFieldURI.@PropertySetId = calExchangeCalendarGUID;
			eprop.nsTypes::ExtendedFieldURI.@PropertyName = "alarmLastAck";
			eprop.nsTypes::ExtendedFieldURI.@PropertyType = "SystemTime";
			eprop.nsTypes::Value = cal.toRFC3339(tmpDateTime.getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone()));

			e.appendChild(eprop);

		}
		this.logInfo("getAlarmLastAck END");*/
		return tmpStr;
	},

	addSnoozeDismissState: function _addSnoozeDismissState(e, aItem, aAlarmTime)
	{
		// Check if we have a single item or not
		var tmpStr = this.getAlarmLastAck(e, aItem);

		this.logInfo("addSnoozeDismissState: Start1");

		if (aAlarmTime) {
			this.logInfo("addSnoozeDismissState: item has alarms");

			var tmpDateTime;
			var nextReminder = "";

			if ((aItem.id != aItem.parentItem.id) && (aItem.parentItem.recurrenceInfo)) {
				this.logInfo("addSnoozeDismissState: Occurrence or Exception");
				// Find out which one got snoozed/dismisses
				tmpStr = tmpStr + this.getMasterSnoozeStates(e, aItem.parentItem, aItem);
			}
			else {
				if (aItem.recurrenceInfo) {
					this.logInfo("addSnoozeDismissState: Master");
					tmpStr = tmpStr + this.getMasterSnoozeStates(e, aItem, null);
				}
				else {
					this.logInfo("addSnoozeDismissState: Single");
					nextReminder = this.getSingleSnoozeState(e, aItem)
					tmpStr = tmpStr + nextReminder;
				}

			}

			let eprop = <nsTypes:ExtendedProperty xmlns:nsTypes={nsTypes}/>;
			eprop.nsTypes::ExtendedFieldURI.@DistinguishedPropertySetId = "Common";
			eprop.nsTypes::ExtendedFieldURI.@PropertyId = MAPI_PidLidReminderSet;
			eprop.nsTypes::ExtendedFieldURI.@PropertyType = "Boolean";

		//	if (nextReminder.indexOf("4501-01-01T00:00:00Z") > -1) {
				// Reminder is turned off.
		//		eprop.nsTypes::Value = "false";
		//	}
		//	else {
				eprop.nsTypes::Value = "true";
		//	}

			e.appendChild(eprop);

		}
		else {
			this.logInfo("addSnoozeDismissState: item has no alarms");

			let eprop = <nsTypes:ExtendedProperty xmlns:nsTypes={nsTypes}/>;
			eprop.nsTypes::ExtendedFieldURI.@DistinguishedPropertySetId = "Common";
			eprop.nsTypes::ExtendedFieldURI.@PropertyId = MAPI_PidLidReminderSet;
			eprop.nsTypes::ExtendedFieldURI.@PropertyType = "Boolean";
			eprop.nsTypes::Value = "false";

			e.appendChild(eprop);
		}

		this.logInfo("addSnoozeDismissState: End:"+tmpStr);

		return tmpStr;
	},

	convertCalAppointmentToExchangeAppointment: function _convertCalAppointmentToExchangeAppointment(aItem, aAction, isNew)
	{
		if (!aAction) {
			aAction = "modify";
		}

		// The order in which create items are specified is important.
		// EWS expects the right order.

		var e = <nsTypes:CalendarItem xmlns:nsTypes={nsTypes} xmlns:nsMessages={nsMessages}/>;

		e.nsTypes::Subject = aItem.title;

		const privacies = { "PUBLIC": "Normal",
				"CONFIDENTIAL": "Confidential", 
				"PRIVATE" : "Private",
				null: "Normal" };
		
		if (privacies[aItem.privacy] == undefined) {
			e.nsTypes::Sensitivity = "Normal"; // BUG 82
		}
		else {
			e.nsTypes::Sensitivity = privacies[aItem.privacy];
		}

		e.nsTypes::Body.@BodyType = "Text";
		e.nsTypes::Body = aItem.getProperty('DESCRIPTION') || "";

		var categories = aItem.getCategories({});
		for each (var category in categories) {
			e.nsTypes::Categories.list += <nsTypes:String xmlns:nsTypes={nsTypes}>{category}</nsTypes:String>;
		}
	
		e.nsTypes::Importance = "Normal";
		if (aItem.priority > 5) {
			e.nsTypes::Importance = "Low";
		}
		if (aItem.priority == 5) {
			e.nsTypes::Importance = "Normal";
		}
		if (aItem.priority < 5) {
			e.nsTypes::Importance = "High";
		}
		if (aItem.priority == 0) {
			e.nsTypes::Importance = "Normal";
		}

		if (aItem.alarmLastAck) {
			this.logInfo("[[[[[[[[[[[ alarmLastAck:"+aItem.alarmLastAck.icalString+"]]]]]]]]]]]]]]]]]]]");
		}
		else {
			this.logInfo("[[[[[[[[[[[ alarmLastAck:null]]]]]]]]]]]]]]]]]]]");
		}

		// Precalculate right start and end time for exchange.
		// If not timezone specified set them to the lightning preference.
		if ((aItem.startDate.timezone.isFloating) && (!aItem.startDate.isDate)) {
			aItem.startDate = aItem.startDate.getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());
		}

		if ((aItem.endDate.timezone.isFloating) && (!aItem.endDate.isDate)) {
			aItem.endDate = aItem.endDate.getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());
		}

		var tmpStart = aItem.startDate.clone();
		var tmpEnd = aItem.endDate.clone();

		if (aItem.startDate.isDate) {
			tmpStart.isDate = false;
			tmpEnd.isDate = false;
			var tmpDuration = cal.createDuration();
			tmpDuration.minutes = -1;
			tmpEnd.addDuration(tmpDuration);

			// We make a non-UTC datetime value for exchWebService.commonFunctions.
			// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
			var exchStart = cal.toRFC3339(tmpStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
			var exchEnd = cal.toRFC3339(tmpEnd).substr(0, 19); //cal.toRFC3339(tmpEnd).length-6);
		}
		else {
			// We set in bias advanced to UCT datetime values for exchWebService.commonFunctions.
			var exchStart = cal.toRFC3339(tmpStart);
			var exchEnd = cal.toRFC3339(tmpEnd);
		}

		var masterAlarmOn = true;
		if ((aItem.id == aItem.parentItem.id) && (aItem.recurrenceInfo)) {
			// This is a master we need the alarm date for the active child
			// We get this by analyzing the X-MOZ-SNOOZE-STATE or the alarmLastAck date.
			this.logInfo("We are converting a Cal master to an Exchange master");

			this.logInfo("We are going to find for which child an alarm might have been snoozed (X-MOZ-SNOOZE-TIME- is set).");
			var childEvent = null;
			var props = aItem.propertyEnumerator;
			while (props.hasMoreElements()) {
				var prop = props.getNext().QueryInterface(Components.interfaces.nsIProperty);
				if (prop.name.indexOf("X-MOZ-SNOOZE-TIME-") == 0) {
					this.logInfo("Cal Master has a X-MOZ-SNOOZE-TIME- value. "+prop.name+":"+prop.value);

					// We are going to find the child with specified recurrenId.nativeTime.
					this.logInfo("We are going to find the child with specified recurrenId.nativeTime.");
					for (var index in this.itemCache) {
						if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aItem.getProperty("X-UID")) &&
						    (this.itemCache[index].recurrenceId.nativeTime == prop.name.substr(18))) {
							this.logInfo("Found child event for which the X-MOZ-SNOOZE-TIME- is set on the master.");
							childEvent = this.itemCache[index];
							break;
						}
					}

					break;
				}
			}

			if (! childEvent) {
				this.logInfo("We did not find a childEvent by using the X-MOZ-SNOOZE-TIME-. We are going to find the child by the alarmLastAck of the Master. alarmLastAck:"+aItem.alarmLastAck);
				if (aItem.alarmLastAck) {
					this.logInfo("Master has an alarmLastAck. We set the alarm to the first child with an alarm after alarmLastAck.");
					var prevTime = aItem.alarmLastAck.clone();
				}
				else {
					this.logInfo("Master has no alarmLastAck. We set the alarm to the first child with an alarm in the future.");
					var prevTime = cal.createDateTime().getInTimezone(cal.UTC());
				}

				this.logInfo("Trying to find a child event with an alarmdate after '"+prevTime.icalString+"'");
				var childAlarm = cal.createDateTime("4501-01-01T00:00:00Z");
				for (var index in this.itemCache) {
					if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aItem.getProperty("X-UID"))) {
						var newChildAlarm = this.getAlarmTime(this.itemCache[index]);
						if ((newChildAlarm) && (newChildAlarm.compare(prevTime) == 1)) {
							if (childAlarm.compare(newChildAlarm) == 1) {
								childAlarm = newChildAlarm.clone();
								childEvent = this.itemCache[index];
								this.logInfo("Found child event for which the alarmdate ("+childAlarm.icalString+") is set after '"+prevTime.icalString+"'");
							}
						}
					}
				}
			}
 
			if (childEvent) {
				this.logInfo("We found a child event and we are going to use it's alarm settings for the master.");
				var alarmTime = this.getAlarmTime(childEvent);
				var childStart = childEvent.startDate.clone();
				masterAlarmOn = true;
				var alarmEvent = childEvent;
				if (childEvent.startDate.isDate) {
					
					childStart.isDate = false;
					// We make a non-UTC datetime value for exchWebService.commonFunctions.
					// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
					var exchAlarmStart = cal.toRFC3339(childStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
				}
				else {
					// We set in bias advanced to UCT datetime values for exchWebService.commonFunctions.
					var exchAlarmStart = cal.toRFC3339(childStart);
				}
			}
			else {
				// We did not find an child with an alarm active...!!!
				this.logInfo("We did not find an child with an alarm active. Trying to find last child event with an alarmdate.");
				// We need to get the last child in line. Use that alarm and set alarmLastAck way into the futur...
				var childAlarm = cal.createDateTime("1970-01-01T00:00:00Z");
				for (var index in this.itemCache) {
					if ((this.itemCache[index]) && (this.itemCache[index].getProperty("X-UID") == aItem.getProperty("X-UID"))) {

							this.logInfo(" !!!! this.getAlarmTime(this.itemCache[index])="+this.getAlarmTime(this.itemCache[index]));

						var newChildAlarm = this.getAlarmTime(this.itemCache[index]);
						if ((newChildAlarm) && (newChildAlarm.compare(childAlarm) == 1)) {
							childAlarm = newChildAlarm.clone();
							childEvent = this.itemCache[index];
							this.logInfo("Found child event with an alarm date. ("+childAlarm.icalString+")");
						}
					}
				}

				if (childEvent) {
					this.logInfo("We found the last child in line which has an alarm.");
					var alarmTime = this.getAlarmTime(childEvent);
					var childStart = childEvent.startDate.clone();
					masterAlarmOn = true;
					var alarmEvent = childEvent;
					if (childEvent.startDate.isDate) {
					
						childStart.isDate = false;
						// We make a non-UTC datetime value for exchWebService.commonFunctions.
						// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
						var exchAlarmStart = cal.toRFC3339(childStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
					}
					else {
						// We set in bias advanced to UCT datetime values for exchWebService.commonFunctions.
						var exchAlarmStart = cal.toRFC3339(childStart);
					}
				}
				else {
					this.logInfo("We did not find a child event with an alarm. This is odd. We are going to see if the master has the alarm set on and use that.");
					var masterAlarm = this.getAlarmTime(aItem);
					if (masterAlarm) {
						this.logInfo("The master has an alarm. We are going to use this one.");
						var alarmTime = this.getAlarmTime(aItem);
						var childStart = aItem.startDate.clone();
						masterAlarmOn = true;
						var alarmEvent = aItem;
						if (aItem.startDate.isDate) {
					
							childStart.isDate = false;
							// We make a non-UTC datetime value for exchWebService.commonFunctions.
							// EWS will use the MeetingTimeZone or StartTimeZone and EndTimeZone to convert.
							var exchAlarmStart = cal.toRFC3339(childStart).substr(0, 19); //cal.toRFC3339(tmpStart).length-6);
						}
						else {
							// We set in bias advanced to UCT datetime values for exchWebService.commonFunctions.
							var exchAlarmStart = cal.toRFC3339(childStart);
						}
					}
					else {
						this.logInfo("The master does not have an alarm. We are going to turn it off.");
						masterAlarmOn = false; 
					}
				}
			}
		}
		else {
			this.logInfo("We are converting a Cal single/occurrence/exception to an Exchange single/occurrence/exception");
			var exchAlarmStart = exchStart;
			var alarmTime = this.getAlarmTime(aItem);
			masterAlarmOn = true;
			var alarmEvent = aItem;
		}

		if ((alarmTime) && (masterAlarmOn)) {
			this.logInfo("alarmTime = "+alarmTime.toString());

			this.logInfo("length="+alarmEvent.getAlarms({}).length);

			// Lightning event can have multiple alarms. Exchange only one.
			for each(var alarm in alarmEvent.getAlarms({})) {
				break;
			}

			// Exchange alarm is always an offset to the start.
			switch (alarm.related) {
			case Ci.calIAlarm.ALARM_RELATED_ABSOLUTE:
				this.logInfo("ALARM_RELATED_ABSOLUTE we are going to calculate a offset from the start.");
				var newAlarmTime = alarm.alarmDate.clone();

				// Calculate offset from start of item.
				var offset = newAlarmTime.subtractDate(alarmEvent.startDate);
				break;
			case Ci.calIAlarm.ALARM_RELATED_START:
				this.logInfo("ALARM_RELATED_START this is easy exchange does the same.");
				var newAlarmTime = alarmEvent.startDate.clone();
				var offset = alarm.offset.clone();
				break;
			case Ci.calIAlarm.ALARM_RELATED_END:
				this.logInfo("ALARM_RELATED_END we are going to calculate the offset from the start.");
				var newAlarmTime = aItem.endDate.clone();
				newAlarmTime.addDuration(alarm.offset);

				var offset = newAlarmTime.subtractDate(alarmEvent.startDate);
				break;
			}
	
			e.nsTypes::ReminderDueBy = exchAlarmStart;
			e.nsTypes::ReminderIsSet = 'true';
			if (offset.inSeconds != 0) {
				e.nsTypes::ReminderMinutesBeforeStart = (offset.inSeconds / 60) * -1;
			}
			else {
				e.nsTypes::ReminderMinutesBeforeStart = 0;
			}

		}
		else {
			e.nsTypes::ReminderIsSet = 'false';
		}

		// Save snooze/dismiss state
		this.addSnoozeDismissState(e, aItem, alarmTime);

		if (aItem.getProperty("X-UID")) {
			e.nsTypes::UID = aItem.getProperty("X-UID");
		}
		else {
// TODO: Check if this is still valid..
			if (aItem.id) {
				// This is when we accept and an iTIP
				e.nsTypes::UID = aItem.id;
				aItem.setProperty("X-UID", aItem.id);
				if (aItem.currenceInfo) {
					this.logInfo("we have recurrence info");
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
			e.nsTypes::Start = exchStart;
			e.nsTypes::End = exchEnd;

			e.nsTypes::IsAllDayEvent = aItem.startDate.isDate;
	
			e.nsTypes::LegacyFreeBusyStatus = freeBusy[aItem.getProperty("TRANSP")];
	
			e.nsTypes::Location = aItem.getProperty("LOCATION") || "";

			var attendees = aItem.getAttendees({});
			for each (var attendee in attendees) {
				var ae = <nsTypes:Attendee xmlns:nsTypes={nsTypes}/>;
	
				ae.nsTypes::Mailbox.nsTypes::Name = attendee.commonName;

				var tmpEmailAddress = attendee.id.replace(/^mailto:/, '');
				if (tmpEmailAddress.indexOf("@") > 0) {
					ae.nsTypes::Mailbox.nsTypes::EmailAddress = tmpEmailAddress;
				}
				else {
					ae.nsTypes::Mailbox.nsTypes::EmailAddress = "unknown@somewhere.com";
				}
				ae.nsTypes::ResponseType = attendeeStatus[attendee.participationStatus];
	
				switch (attendee.role) {
				case "REQ-PARTICIPANT":
					e.nsTypes::RequiredAttendees.nsTypes::Attendee += ae;
					break;
				case "OPT-PARTICIPANT":
					e.nsTypes::OptionalAttendees.nsTypes::Attendee += ae;
					break;
				}
			}

			this.makeRecurrenceRule(aItem, e);
	
			if (this.isVersion2007) {
				e.nsTypes::MeetingTimeZone.@TimeZoneName = this.getEWSTimeZoneId(tmpStart.timezone);
			}
			else {
				e.nsTypes::StartTimeZone.@Id = this.getEWSTimeZoneId(tmpStart.timezone);
				e.nsTypes::EndTimeZone.@Id = this.getEWSTimeZoneId(tmpEnd.timezone);
			}

		}
		else {
			//this.logInfo("convertCalAppointmentToExchangeAppointment: "+String(e));

			//return e;
			
			if ((aItem.hasProperty("X-exchangeITIP1")) && (aItem.getProperty("X-exchangeITIP1") == "true")) {
				this.logInfo("This is a message which came from an import or an copy/paste operation or is an invitation from an external party outside our Exchange.");

				e.nsTypes::Start = exchStart;
				e.nsTypes::End = exchEnd;

				e.nsTypes::IsAllDayEvent = aItem.startDate.isDate;
	
				e.nsTypes::LegacyFreeBusyStatus = freeBusy[aItem.getProperty("TRANSP")];
	
				e.nsTypes::Location = aItem.getProperty("LOCATION") || "";

				// Set if the item is from the user itself or not.
				if (aItem.organizer) {
					if (aItem.organizer.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase()) {
						this.logInfo(" ## I am the organizer of this meeting.");
					}
					else {
						this.logInfo(" ## I am NOT the organizer of this meeting.'"+aItem.organizer.id.replace(/^mailto:/, '')+"' is the organizer.");
//						e.nsTypes::Organizer.nsTypes::Mailbox.nsTypes::EmailAddress = aItem.organizer.id.replace(/^mailto:/, '');
					}
				}
				else {
					this.logInfo(" ## There is not organizer for this meeting.");
				}
		

/*				var attendees = aItem.getAttendees({});
				for each (var attendee in attendees) {
					const attendeeStatus = {
						"NEEDS-ACTION"	: "Unknown",
						"TENTATIVE"	: "Tentative",
						"ACCEPTED"	: "Accept",
						"DECLINED"	: "Decline",
						null		: "Unknown"
					};
	
					var ae = <nsTypes:Attendee xmlns:nsTypes={nsTypes}/>;
	
					ae.nsTypes::Mailbox.nsTypes::Name = attendee.commonName;

					var tmpEmailAddress = attendee.id.replace(/^mailto:/, '');
					if (tmpEmailAddress.indexOf("@") > 0) {
						ae.nsTypes::Mailbox.nsTypes::EmailAddress = tmpEmailAddress;
					}
					else {
						ae.nsTypes::Mailbox.nsTypes::EmailAddress = "unknown@somewhere.com";
					}
					ae.nsTypes::ResponseType = attendeeStatus[attendee.participationStatus];
	
					switch (attendee.role) {
					case "REQ-PARTICIPANT":
						e.nsTypes::RequiredAttendees.nsTypes::Attendee += ae;
						break;
					case "OPT-PARTICIPANT":
						e.nsTypes::OptionalAttendees.nsTypes::Attendee += ae;
						break;
					}
				} */

				this.makeRecurrenceRule(aItem, e);
	
				if (this.isVersion2007) {
					e.nsTypes::MeetingTimeZone.@TimeZoneName = this.getEWSTimeZoneId(tmpStart.timezone);
				}
				else {
					e.nsTypes::StartTimeZone.@Id = this.getEWSTimeZoneId(tmpStart.timezone);
					e.nsTypes::EndTimeZone.@Id = this.getEWSTimeZoneId(tmpEnd.timezone);
				}

			}
		}

		this.logInfo("convertCalAppointmentToExchangeAppointment: "+String(e));

		return e;
	},

	convertCalTaskToExchangeTask: function _convertCalTaskToExchangeTask(aItem, aAction)
	{
		if (!aAction) {
			aAction = "modify";
		}

		var e = <nsTypes:Task xmlns:nsTypes={nsTypes} xmlns:nsMessages={nsMessages}/>;

		e.nsTypes::Subject = aItem.title;

		const privacies = { "PUBLIC": "Normal",
				"CONFIDENTIAL": "Confidential", 
				"PRIVATE" : "Private",
				null: "Normal" };
		e.nsTypes::Sensitivity = privacies[aItem.privacy];

		e.nsTypes::Body.@BodyType = "Text";
		e.nsTypes::Body = aItem.getProperty('DESCRIPTION') || "";

		var categories = aItem.getCategories({});
		for each (var category in categories) {
			e.nsTypes::Categories.list += <nsTypes:String xmlns:nsTypes={nsTypes}>{category}</nsTypes:String>;
		}
	
		e.nsTypes::Importance = "Normal";
		if (aItem.priority > 5) {
			e.nsTypes::Importance = "Low";
		}
		if (aItem.priority == 5) {
			e.nsTypes::Importance = "Normal";
		}
		if (aItem.priority < 5) {
			e.nsTypes::Importance = "High";
		}
		if (aItem.priority == 0) {
			e.nsTypes::Importance = "Normal";
		}
		 

		var alarmTime = this.getAlarmTime(aItem);
		if (alarmTime) {
			this.logInfo("alarmTime = "+alarmTime.toString());

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
				e.nsTypes::ReminderDueBy = cal.toRFC3339(newAlarmTime);
			}

			e.nsTypes::ReminderIsSet = 'true';
			e.nsTypes::ReminderMinutesBeforeStart = 0;
		}
		else {
			e.nsTypes::ReminderIsSet = 'false';
		}

		// Save snooze/dismiss state
		this.addSnoozeDismissState(e, aItem, alarmTime);

		// Delegation changes
		if (aItem.hasProperty("X-exchWebService-PidLidTaskLastUpdate")) {
			let eprop = <nsTypes:ExtendedProperty xmlns:nsTypes={nsTypes}/>;
			eprop.nsTypes::ExtendedFieldURI.@DistinguishedPropertySetId = "Task";
			eprop.nsTypes::ExtendedFieldURI.@PropertyId = "33045";
			eprop.nsTypes::ExtendedFieldURI.@PropertyType = "SystemTime";
			eprop.nsTypes::Value = aItem.getProperty("X-exchWebService-PidLidTaskLastUpdate");
			e.appendChild(eprop); 
		}

		if (aItem.hasProperty("X-exchWebService-PidLidTaskHistory")) {
			let eprop = <nsTypes:ExtendedProperty xmlns:nsTypes={nsTypes}/>;
			eprop.nsTypes::ExtendedFieldURI.@DistinguishedPropertySetId = "Task";
			eprop.nsTypes::ExtendedFieldURI.@PropertyId = "33050";
			eprop.nsTypes::ExtendedFieldURI.@PropertyType = "Integer";
			eprop.nsTypes::Value = aItem.getProperty("X-exchWebService-PidLidTaskHistory");
			e.appendChild(eprop); 
		}

		if (aItem.hasProperty("X-exchWebService-PidLidTaskAccepted")) {
			let eprop = <nsTypes:ExtendedProperty xmlns:nsTypes={nsTypes}/>;
			eprop.nsTypes::ExtendedFieldURI.@DistinguishedPropertySetId = "Task";
			eprop.nsTypes::ExtendedFieldURI.@PropertyId = "33032";
			eprop.nsTypes::ExtendedFieldURI.@PropertyType = "Boolean";
			eprop.nsTypes::Value = aItem.getProperty("X-exchWebService-PidLidTaskAccepted");
			e.appendChild(eprop); 
		}


		if (aItem.completedDate) {

			tmpStart = aItem.completedDate.clone();

			if (tmpStart.timezone.isFloating) {
				tmpStart = tmpStart.getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());
			}

			tmpStart = tmpStart.getInTimezone(exchWebService.commonFunctions.ecUTC());

			tmpStart.isDate = true;
			tmpStart.isDate = false;
		/*	var tmpDuration = cal.createDuration();
			tmpDuration.minutes = -1;
			tmpStart.addDuration(tmpDuration);*/

			e.nsTypes::CompleteDate = cal.toRFC3339(tmpStart);
		}


//		if ((!aItem.parentItem.id) ||
//		    (!aItem.recurrenceInfo)) {
		if (aItem.dueDate) {
			if (aItem.dueDate.timezone.isFloating) {
				aItem.dueDate = aItem.dueDate.getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());
			}

			e.nsTypes::DueDate = cal.toRFC3339(aItem.dueDate);
		}
		if (aItem.percentComplete) {
			e.nsTypes::PercentComplete = aItem.percentComplete;
		}
//}

		this.makeRecurrenceRule(aItem, e);

//		if ((!aItem.parentItem.id) ||
//		    (!aItem.recurrenceInfo)) {

			if (aItem.entryDate) {
				if (aItem.entryDate.timezone.isFloating) {
					aItem.entryDate = aItem.entryDate.getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());
				}

				e.nsTypes::StartDate = cal.toRFC3339(aItem.entryDate);
			}
//		}

		const statuses = { "NONE": "NotStarted",
				"IN-PROCESS": "InProgress", 
				"COMPLETED" : "Completed",
				"NEEDS-ACTION" : "WaitingOnOthers",
				"CANCELLED" : "Deferred",
				null: "NotStarted" };
		e.nsTypes::Status = statuses[aItem.status];

this.logInfo("!!CHANGED:"+String(e));

		return e;
	},

	createItemOk: function _createItemOk(erCreateItemRequest, aId, aChangeKey)
	{
		this.notConnected = false;
		this.saveCredentials(erCreateItemRequest.argument);
		this.logInfo("createItemOk 1");

		// Check if we have attachmentsUpdates
		if ((erCreateItemRequest.argument.attachmentsUpdates) && (erCreateItemRequest.argument.attachmentsUpdates.create.length > 0)) {
			this.logInfo("createItemOk We have "+erCreateItemRequest.argument.attachmentsUpdates.create.length+" attachments to create.");
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
				erCreateItemRequest.listener,
				2);
		}
		else {
			this.logInfo("createItemOk We have no attachments to create.");

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
		this.logInfo("createAttachmentOk");
		this.notConnected = false;

		if (erCreateAttachmentRequest.argument.attachmentsUpdates.delete.length > 0) {
			this.logInfo("We also need to delete some attachments: count="+erCreateAttachmentRequest.argument.attachmentsUpdates.delete.length);
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
				erCreateAttachmentRequest.listener,
				2);
			return;
		}
		else {
			this.logInfo("We have no attachment deletions.");
			if ((erCreateAttachmentRequest.argument.sendto) && ((erCreateAttachmentRequest.argument.sendto != "sendtonone"))) {
				// The item we processed was a meeting of which I'm the organiser.
				// It contained new attachments and we need to send an item update to get it to the invited.
				this.logInfo("We had attachment changes and it is a meeting for which we are the organiser send the changed item to the others as specified:"+erCreateAttachmentRequest.argument.sendto);
				this.doAttachmentUpdatesFinalize(erCreateAttachmentRequest.argument.attachmentsUpdates, erCreateAttachmentRequest.argument.item, RootItemId, RootItemChangeKey, erCreateAttachmentRequest.argument.sendto, erCreateAttachmentRequest.listener);
				return;
			}
			else {
				this.logInfo("createAttachmentOk erCreateAttachmentRequest.argument.sendto is not set.");
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
		this.logInfo("createAttachmentError: aCode:"+aCode+", aMsg:"+aMsg);
		this.notConnected = true;

	},

	deleteAttachmentOk: function _deleteAttachmentOk(erDeleteAttachmentRequest, aId, aChangeKey)
	{
		this.logInfo("deleteAttachmentOk");
		this.notConnected = false;

		// See if we need to update the item when it is an invitation to others
		// This to get the invitation uncluding the attachments send out.
		this.addAttachmentsToOfflineCache(erDeleteAttachmentRequest.argument.item);

		if ((erDeleteAttachmentRequest.argument.sendto) && ((erDeleteAttachmentRequest.argument.sendto != "sendtonone"))) {
			// The item we processed was a meeting of which I'm the organiser.
			// It contained new attachments and we need to send an item update to get it to the invited.
			this.logInfo("We had attachment changes and it is a meeting for which we are the organiser send the changed item to the others as specified:"+erDeleteAttachmentRequest.argument.sendto);
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
		this.logInfo("deleteAttachmentError");
		this.notConnected = true;
	},

	makeUpdateOneItem: function _makeUpdateOneItem(aNewItem, aOldItem, aIndex, aMasterId, aMasterChangeKey, aInvitation)
	{
		var upd = <nsTypes:ItemChange xmlns:nsTypes={nsTypes}/>;

		if (!aIndex) {
			upd.ItemId = <nsTypes:ItemId Id={aOldItem.id} ChangeKey={aOldItem.getProperty("X-ChangeKey")} xmlns:nsTypes={nsTypes}/>;
		}
		else {
			upd.OccurrenceItemId = <nsTypes:OccurrenceItemId RecurringMasterId={aMasterId} ChangeKey={aMasterChangeKey} InstanceIndex={aIndex} xmlns:nsTypes={nsTypes}/>;
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
	
		var ce = new XMLList();

		if (isEvent(aOldItem)) {
			var oe = this.convertCalAppointmentToExchangeAppointment(aOldItem, null, false);
			var ne = this.convertCalAppointmentToExchangeAppointment(aNewItem, null, false);
		}
		if (isToDo(aOldItem)) {
			var oe = this.convertCalTaskToExchangeTask(aOldItem);
			var ne = this.convertCalTaskToExchangeTask(aNewItem);
		}
	
		var onlySnoozeChanged = true;

		for each (var prop in oe) {
			if (ne[prop.name()].length() > 0 || noDelete[prop.localName()]) {
				continue;
			}

			if ((isInvitation) && (ne[prop.name()].length() > 0 || noUpdateOnInvitation[prop.localName()])) {
				continue;
			}
	
			var de = <nsTypes:DeleteItemField xmlns:nsTypes={nsTypes}/>;
			if (prop.localName() == "ExtendedProperty") {
				de.nsTypes::ExtendedFieldURI = prop.nsTypes::ExtendedFieldURI;
			} else {
				if ((fieldPathMap[prop.localName()] == "calendar") && (isEvent(aOldItem))) {
					de.nsTypes::FieldURI.@FieldURI = 'calendar:' + prop.localName();
				}
				else {
					if ((fieldPathMap[prop.localName()] == "calendar") && (isToDo(aOldItem))) {
						de.nsTypes::FieldURI.@FieldURI = 'task:' + prop.localName();
					}
					else {
						de.nsTypes::FieldURI.@FieldURI = fieldPathMap[prop.localName()] + ':' + prop.localName();
					}
				}

			}
	
			onlySnoozeChanged = false;
			ce += de;
		}

		for each (var prop in ne) {

			if ((isInvitation) && (noUpdateOnInvitation[prop.localName()])) {
				continue;
			}
	
			// Always save lastLightningModified field
			var doSave = false;
			if ((prop.localName() == "ExtendedProperty") && (prop.nsTypes::ExtendedFieldURI.@PropertyName == "lastLightningModified")) {
				doSave = true;
			}

			if (! doSave) {
				if (oe.children().contains(prop)) {
					continue;
				}
			}
	
			var se = <nsTypes:SetItemField xmlns:nsTypes={nsTypes}/>;
			if (prop.localName() == "ExtendedProperty") {
				se.nsTypes::ExtendedFieldURI = prop.nsTypes::ExtendedFieldURI;

				if ((prop.nsTypes::ExtendedFieldURI.@PropertyId != MAPI_PidLidReminderSignalTime) && (prop.nsTypes::ExtendedFieldURI.@PropertyId != "34051")  && (prop.nsTypes::ExtendedFieldURI.@PropertyId != "34049")) {
					onlySnoozeChanged = false;
				}
			} else {

				if ((fieldPathMap[prop.localName()] == "calendar") && (isEvent(aOldItem))) {
					onlySnoozeChanged = false;
					se.nsTypes::FieldURI.@FieldURI = 'calendar:' + prop.localName();
				}
				else {
					if ((fieldPathMap[prop.localName()] == "calendar") && (isToDo(aOldItem))) {
						onlySnoozeChanged = false;
						se.nsTypes::FieldURI.@FieldURI = 'task:' + prop.localName();
					}
					else {
						if ((prop.localName() != "ReminderMinutesBeforeStart") && (prop.localName() != "ReminderIsSet")) {
							onlySnoozeChanged = false;
						}
						se.nsTypes::FieldURI.@FieldURI = fieldPathMap[prop.localName()] + ':' + prop.localName();
					}
				}
			}
			if (isEvent(aOldItem)) {
				se.nsTypes::CalendarItem.content = prop;
			}
			if (isToDo(aOldItem)) {
				se.nsTypes::Task.content = prop;
			}
	
			ce += se;
		}
	
		upd.nsTypes::Updates.content = ce;
	
		if (onlySnoozeChanged) {
			this.logInfo("onlySnoozeChanged Or reminder time before start.");
		}

		if (!ce[0]) {
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
			this.logInfo("User canceled preInvitationDialog.");
			return false;
		}

		var input= { item: aItem, 
			     response: tmpResponse,
			     answer: "",
			     bodyText: ""};

		if (preInput.response == "edit") {
			// If the user would like to edit his response we show him the window for it.
			this.logInfo("User indicated he would like to edit response.");
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
				this.logInfo("User canceled invitationDialog.");
				return false;
			}

		}
		else {
			this.logInfo("User indicated he does not want to edit the response.");
			if (preInput.response == "donotsend") {
				this.logInfo("User indicated he does not want to send a response.");
				messageDisposition = "SaveOnly";
			}
		}
		this.logInfo("  -------------- messageDisposition="+messageDisposition);

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
			aListener,
			2);
		return true;
	},

	sendMeetingResponsOk: function _sendMeetingResponsOk(erSendMeetingResponsRequest)
	{
		this.logInfo("sendMeetingResponsOk");
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
		this.logInfo("modifyItemgetOccurrenceIndexOk");
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
			this.logInfo("modifyItemgetOccurrenceIndexOk: changed:"+String(changes));
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
				erGetOccurrenceIndexRequest.listener,
				2);
			return;
			
		}
		else {
			if (this.doAttachmentUpdates(erGetOccurrenceIndexRequest.argument.attachmentsUpdates, erGetOccurrenceIndexRequest.argument.masterItem, erGetOccurrenceIndexRequest.argument.sendto, erGetOccurrenceIndexRequest.listener)) {
				this.logInfo("modifyItemgetOccurrenceIndexOk: Only attachment changes no field changes 3.");
				return;
			}
			else {
				this.logInfo("modifyItemgetOccurrenceIndexOk: No changes 3.");
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
		this.logInfo("whichOccurrencegetOccurrenceIndexError:("+aCode+")"+aMsg);
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
			this.logInfo("We have a conflict with the server for this update. We are going to refresh and then retry.");
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

			this.logInfo("X-RetryCount="+oldItem.getProperty("X-RetryCount"));

			if (oldItem.getProperty("X-RetryCount") < 25) {
				this.modifyItem(newItem, oldItem, erGetOccurrenceIndexRequest.listener);
			}
			else {
				this.logInfo("To many update retries. Giving up.");
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
				this.logInfo("doAttachmentUpdates We have "+aAttachmentsUpdates.create.length+" attachments to create.");
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
					aListener,
					2);
			}
			else {
				this.logInfo("updateItemOk We have "+aAttachmentsUpdates.delete.length+" attachments to delete.");
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
					aListener,
					2);
			}
		}
		return result;
	},

	doAttachmentUpdatesFinalize: function _doAttachmentUpdatesFinalize(aAttachmentsUpdates, aItem, aId, aChangeKey, aSendTo, aListener)
	{
		this.logInfo("doAttachmentUpdatesFinalize: item:"+aItem.title+", aSendTo:"+aSendTo);

		var req = <nsTypes:ItemChange xmlns:nsTypes="http://schemas.microsoft.com/exchange/services/2006/types">
			  <nsTypes:ItemId Id={aId} ChangeKey={aChangeKey}/>
			  <nsTypes:Updates>
			    <nsTypes:SetItemField>
			      <nsTypes:FieldURI FieldURI="item:Subject"/>
			      <nsTypes:CalendarItem>
				<nsTypes:Subject>{aItem.title}</nsTypes:Subject>
			      </nsTypes:CalendarItem>
			    </nsTypes:SetItemField>
			  </nsTypes:Updates>
			</nsTypes:ItemChange>;

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
			aListener,
			2);
		
	},

	updateItemOk: function _updateItemOk(erUpdateItemRequest, aId, aChangeKey)
	{
		this.logInfo("updateItemOk");

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
//		this.logInfo("getOccurrenceIndexOk index="+aIndex);
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
					erGetOccurrenceIndexRequest.listener,
					2);
				break;
		}
	},

	getOccurrenceIndexError: function _getOccurrenceIndexError(erGetOccurrenceIndexRequest, aCode, aMsg)
	{
//		this.logInfo("getOccurrenceIndexError");
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
		this.logInfo("deleteItemOK");
		this.notConnected = false;

		if (erDeleteItemRequest.listener) {
			this.notifyOperationComplete(erDeleteItemRequest.listener,
			      Cr.NS_OK,
			      Ci.calIOperationListener.DELETE,
			      erDeleteItemRequest.argument.item.id,
			      erDeleteItemRequest.argument.item);
		}

		this.logInfo("itemType:"+erDeleteItemRequest.itemType+", Subject:"+erDeleteItemRequest.argument.item.title);
		switch (erDeleteItemRequest.itemType) {
			case "master" :
				// Also remove the children.
				// 12-12-2011 Turned this of because this is done when we receive the update from the exchange server.
				//this.removeChildrenFromMaster(erDeleteItemRequest.argument.item);
				//delete this.recurringMasterCache[erDeleteItemRequest.argument.item.getProperty("X-UID")];
				break;
			case "single":
			case "occurrence":
				//erDeleteItemRequest.argument.item.clearAlarms();

			// This will be done on receiving the update from exchWebService.commonFunctions.
				//this.deleteAlarms(erDeleteItemRequest.argument.item);
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
		this.logInfo("deleteItemError msg:"+String(aMsg));
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

	addToQueue: function _addToQueue(aRequest, aArgument, aCbOk, aCbError, aListener, aQueueNumber)
	{
		if ((this.getProperty("disabled")) || (this.isOffline)) {
			return;
		}

		if (!aQueueNumber) {
			aQueueNumber = 1;
		}

		if (!this.queue[aQueueNumber]) {
			this.queue[aQueueNumber] = [];
		}

		//exchWebService.commonFunctions.LOG("["+this.name+"] addToQueue:"+aQueueNumber+" ("+exchWebService.commonFunctions.STACKshort()+")");

		this.queue[aQueueNumber].push({ecRequest:aRequest,
				 arguments: aArgument,
				 cbOk: aCbOk,
				 cbError: aCbError,
				 listener: aListener});

		this.observerService.notifyObservers(this, "onExchangeProgressChange", "1");  


		if (!this.timers[aQueueNumber]) {
			this.logInfo("Arming timer for queue:"+aQueueNumber);
			this.timers[aQueueNumber] = Cc["@mozilla.org/timer;1"]
					.createInstance(Ci.nsITimer);

		        let self = this;
			let timerCallback = {
				notify: function setTimeout_notify() {
					self.processQueue(aQueueNumber);
				}
			};
			if (!this.shutdown) {
				this.timers[aQueueNumber].initWithCallback(timerCallback, 50, this.timers[aQueueNumber].TYPE_REPEATING_SLACK);
			}
			this.logInfo("Timer for for queue:"+aQueueNumber);

		}
	},

	processQueue: function _processQueue(aQueueNumber)
	{
		if (this.tmpJobs[aQueueNumber]) {
			if (this.tmpJobs[aQueueNumber].isRunning) {
				return;
			}
		}

		if (this.doReset) {
			if (this.weAreSyncing) {
				return;
			}

			this.performReset();
			this.logInfo("Reset done.");
		}

		if (this.queue[aQueueNumber].length > 0) {
			var queueItem = this.queue[aQueueNumber][0];
			this.queue[aQueueNumber].shift();

			//exchWebService.commonFunctions.LOG("["+this.name+"] processQueue:"+aQueueNumber+" ("+exchWebService.commonFunctions.STACKshort()+")");
			this.observerService.notifyObservers(this, "onExchangeProgressChange", "-1");  

			queueItem.arguments["ServerVersion"] = getEWSServerVersion(this.serverUrl);
			this.tmpJobs[aQueueNumber] = new queueItem.ecRequest(queueItem.arguments, queueItem.cbOk, queueItem.cbError, queueItem.listener);
		}

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
			this.logInfo("Arming timer for offlineQueue.");
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
			this.logInfo("Timer for offlineQueue.");

		}
	},

	processOfflineQueue: function _processOfflineQueue()
	{
		if (this.offlineQueue.length > 0) {
			var queueItem = this.offlineQueue[0];
			this.offlineQueue.shift();

			//exchWebService.commonFunctions.LOG("["+this.name+"] processQueue:"+aQueueNumber+" ("+exchWebService.commonFunctions.STACKshort()+")");
			//this.observerService.notifyObservers(this, "onExchangeProgressChange", "-1");  
			var itemsFromCache = this.getItemsFromOfflineCache(queueItem.rangeStart, queueItem.rangeEnd);
			if (itemsFromCache) {
				this.logInfo("We got '"+itemsFromCache.length+"' items from offline cache.");
			}
		}

	},

	findCalendarItemsOK: function _findCalendarItemsOK(erFindCalendarItemsRequest, aIds, aOccurrences)
	{
		//this.logInfo("findCalendarItemsOK: aIds.length="+aIds.length+", aOccurrences.length="+aOccurrences.length);

		this.saveCredentials(erFindCalendarItemsRequest.argument);
		this.notConnected = false;

		if ((aIds.length == 0) && (aOccurrences.length)) {
			return;
		}

       		var self = this;

		// If we have occurrences and/or exceptions. Find the masters. followed by the occurrences.
		if (aOccurrences.length > 0) {
			this.logInfo("findCalendarItemsOK: aOccurrences.length="+aOccurrences.length);
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

			this.calendarPoller.initWithCallback(timerCallback, exchWebService.commonFunctions.safeGetIntPref(this.prefs, "ecCalendarPollInterval", 60) * 1000, this.calendarPoller.TYPE_REPEATING_SLACK);
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
			this.calendarPoller.initWithCallback(timerCallback, exchWebService.commonFunctions.safeGetIntPref(this.prefs, "ecCalendarPollInterval", 60) * 1000, this.calendarPoller.TYPE_REPEATING_SLACK);
		}
		else {
			this.calendarPoller.initWithCallback(timerCallback, exchWebService.commonFunctions.safeGetIntPref(this.prefs, "ecCalendarPollInterval", 60) * 1000, this.calendarPoller.TYPE_REPEATING_SLACK);
		}
	},

	findCalendarItemsError: function _findCalendarItemsError(erFindCalendarItemsRequest, aCode, aMsg) 
	{
		this.logInfo("findCalendarItemsError aCode:"+aCode+", aMsg:"+aMsg);
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
		this.logInfo("findMasterOccurrencesOk:Start: aIds.length="+aIds.length);

		this.saveCredentials(erFindCalendarItemsRequest.argument);
		this.notConnected = false;

		if (aIds.length == 0) {
			return;
		}

		// Cache full master details.
		this.updateCalendar(erGetItemsRequest, aIds, true);
		this.logInfo("findMasterOccurrencesOk:End: aIds.length="+aIds.length);

	},

	findOccurrencesOK: function _findOccurrencesOK(erFindOccurrencesRequest, aIds)
	{
//		this.logInfo("findOccurrencesOK: aIds.length="+aIds.length);
		// Get full details of occurrences and exceptions and cache them.
		this.notConnected = false;
		this.findCalendarItemsOK(erFindOccurrencesRequest, aIds, []);
	},

	findTaskItemsOK: function _findTaskItemsOK(erFindTaskItemsRequest, aIds)
	{
//		this.logInfo("findTaskItemsOK: aIds.length:"+aIds.length);
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

			this.calendarPoller.initWithCallback(timerCallback, exchWebService.commonFunctions.safeGetIntPref(this.prefs, "ecCalendarPollInterval", 60) * 1000, this.calendarPoller.TYPE_REPEATING_SLACK);
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
			return cal.fromRFC3339(ewsvalue, exchWebService.commonFunctions.ecTZService().UTC).getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());
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
			this.logInfo("processItemSyncQueue: id:"+this.getItemSyncQueue[0].id);
			this.getItem(this.getItemSyncQueue[0].id, this.getItemSyncQueue[0].listener, true);
			this.getItemSyncQueue.shift();
		}

		this.processItemSyncQueueBusy = false;

	},

	getTaskItemsOK: function _getTaskItemsOK(erGetItemsRequest, aItems)
	{
		this.logInfo("getTaskItemsOK: aItems.length:"+aItems.length);
		this.saveCredentials(erGetItemsRequest.argument);
		this.notConnected = false;

this.logInfo("getTaskItemsOK 2");

		if (aItems.length == 0) {
			this.syncBusy = false;
			this.processItemSyncQueue();

			return;
		}

this.logInfo("getTaskItemsOK 3");
		this.updateCalendar(erGetItemsRequest, aItems, true);
this.logInfo("getTaskItemsOK 4");

		this.syncBusy = false;

		this.processItemSyncQueue();

	},

	getTaskItemsError: function _getTaskItemsError(erGetItemsRequest, aCode, aMsg) 
	{
//		this.logInfo("getTaskItemsError: aMsg:"+ aMsg);
		this.saveCredentials(erGetItemsRequest.argument);
		this.notConnected = true;

		this.syncBusy = false;

		this.processItemSyncQueue();

	},

	getMeetingRequestFromServer: function _getMeetingRequestFromServer(aItem, aUID, aOperation, aListener)
	{
		this.logInfo("aUID="+aUID);

		// We do not have a meetingrequest in cache but it is an iTIP.
		// Is inbox polling off? Or did the inbox polling not yet happen interval to long.
// bug 59		if (!this.doPollInbox) {
			// We are not polling the inbox so treat it as a meetingrespons.
			this.logInfo("We get a new calendar item. It looks like an iTIP respons because aItem.id is set. Going to check if we can find it in the users inbox.");
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
				aListener,
				1);

			return;
// bug 59		}
/* bug 59		else {
			this.logInfo("!! THIS IS A SITUATION WHICH NEVER SHOULD HAPPEN !!");
			this.logInfo("We have an iTIP respons and are polling the inbox but the item is not in the meetingrequestcache.");
			this.logInfo("We see this when someone imports an ICS file or imports a meeting request into another calendar.");
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
		let mbox = aElement.nsTypes::Mailbox;
		let attendee = createAttendee();

		if (!aType) {
			aType = "REQ-PARTICIPANT";
		}

		attendee.id = 'mailto:' + mbox.nsTypes::EmailAddress.toString();
		attendee.commonName = mbox.nsTypes::Name.toString();
		attendee.rsvp = "FALSE";
		attendee.userType = "INDIVIDUAL";
		attendee.role = aType;

		if (aElement.nsTypes::ResponseType.length() > 0) {
			attendee.participationStatus = participationMap[aElement.nsTypes::ResponseType.toString()];

			// check if we specified a myResponseType for the complete item and the specified mailbox is equal to the mailbox for the calendar.
			//this.logInfo("aMyResponseType:"+aMyResponseType+", EmailAddress:"+mbox.nsTypes::EmailAddress.toString().toLowerCase()+", mailbox:"+this.mailbox.toLowerCase());
			if ((aMyResponseType) && (mbox.nsTypes::EmailAddress.toString().toLowerCase() == this.mailbox.toLowerCase())) {
				attendee.participationStatus = participationMap[aMyResponseType];
				//this.logInfo("Setting my response type from the global myresponsetype for the item.");
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
			switch (rec.localName()) {
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
				this.logInfo("skipping " + rec.localName());
				continue;
			}
	
			var weekdays = [];
			var week = [];
			for each (var comp in rec) {
				switch (comp.localName()) {
				case 'DaysOfWeek':
					for each (let day in comp.toString().split(" ")) {
						weekdays = weekdays.concat(dayMap[day]);
					}
					break;
				case 'DayOfWeekIndex':
					week = weekMap[comp.toString()];
					break;
				case 'Month':
					comps['BYMONTH'] = monthMap[comp.toString()];
					break;
				case 'DayOfMonth':
					comps['BYMONTHDAY'] = comp.toString();
					break;
				case 'FirstDayOfWeek':
					comps['WKST'] = dayMap[comp.toString()];
					break;
				case 'Interval':
					comps['INTERVAL'] = comp.toString();
					break;
				case 'StartDate':
					/* Dunno what to do with this; no place to set */
					break;
				case 'EndDate':
					comps['UNTIL'] = comp.toString().replace(/Z$/, '');
					break;
				case 'NumberOfOccurrences':
					comps['COUNT'] = comp.toString();
					break;
				}
			}

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
		var recrule = this.readRecurrenceRule(aElement.nsTypes::Recurrence.children());
	
		if (recrule === null) {
			return null;
		}
	
		var recurrenceInfo = cal.createRecurrenceInfo(aItem);
		recurrenceInfo.setRecurrenceItems(1, [recrule]);
	
		return recurrenceInfo;
	},

	readDeletedOccurrences: function _readDeletedOccurrences(aItem, aElement)
	{
		for each (var mit in aElement.nsTypes::DeletedOccurrences.children()) {
			for (var index in this.itemCache) {
				if ( (this.itemCache[index]) &&
				     (this.itemCache[index].parentItem.id == aItem.id) &&
				     (this.itemCache[index].startDate.compare(this.tryToSetDateValue(mit.nsTypes::Start)) == 0) ) {
					this.logInfo("readDeletedOccurrences 2a");
					aItem.recurrenceInfo.removeOccurrenceAt(this.itemCache[index].startDate);
					//this.itemCache[index].clearAlarms();
					this.deleteAlarms(this.itemCache[index]);
					this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
					break;
				}
			}

			
		}
	},

	notifyTheObservers: function _notifyTheObservers(aCommand, aArray)
	{
		try {
			if (aArray[0].title == "Lange test2") {
				this.logInfo(" notifyTheObservers: aCommand:"+aCommand+", item.title:"+aArray[0].title);
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
		this.logInfo("removeChildrenFromMaster start. Title:"+aMaster.title);
		// Remove children of this master. They will be added later.
		for (var index in this.itemCache) {
			if ( (this.itemCache[index]) &&
			     (isEvent(this.itemCache[index])) &&
			     (this.itemCache[index].parentItem.id == aMaster.id) ) {
				this.logInfo("removeChildrenFromMaster: Removing child:"+this.itemCache[index].title+", startdate="+this.itemCache[index].startDate.toString());
				this.itemCache[index].parentItem = this.itemCache[index];
				this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
				delete this.itemCache[index];
			}
		}
		this.logInfo("removeChildrenFromMaster end.:"+aMaster.title);
	},

	setCommonValues: function _setCommonValues(aItem, aExchangeItem)
	{
		switch(aExchangeItem.nsTypes::Importance.toString()) {
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

		switch (aExchangeItem.nsTypes::Sensitivity.toString()) {
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

		switch (aExchangeItem.nsTypes::LegacyFreeBusyStatus.toString()) {
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

		if (aExchangeItem.nsTypes::IsCancelled.toString() == "true") {
			this.setStatus(aItem, "Decline");
		}
		else {
			this.setStatus(aItem, aExchangeItem.nsTypes::MyResponseType.toString());
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

	// Taken from soapin.js from Exchange Provider add-on
	// This as part of the conversion from Exchange Provider add-on to Exchange Calendar add-on.
	readEP_DismissSnoozeState: function _readEP_DismissSnoozeState(aItem, it)
	{
		let nextRem = it.nsTypes::ExtendedProperty.(nsTypes::ExtendedFieldURI.@PropertyId == MAPI_PidLidReminderSignalTime).nsTypes::Value[0];
	
		if (!nextRem) {
			return;
		}
	
		nextRem = cal.fromRFC3339(nextRem.toString(), cal.UTC());
		let lastAck = nextRem.clone();
		lastAck.addDuration(cal.createDuration('-PT1S'));
	
		aItem.alarmLastAck = lastAck;
	
	},

	addExchangeAttachmentToCal: function _addExchangeAttachmentToCal(aExchangeItem, aItem)
	{
		if (aExchangeItem.nsTypes::HasAttachments.toString() == "true") {
//			this.logInfo("Title:"+aItem.title+"Attachments:"+aExchangeItem.nsTypes::Attachments.toString());
			for each(var fileAttachment in aExchangeItem.nsTypes::Attachments.nsTypes::FileAttachment) {
//				this.logInfo(" -- Attachment: name="+fileAttachment.nsTypes::Name.toString());

				var newAttachment = createAttachment();
				newAttachment.setParameter("X-AttachmentId",fileAttachment.nsTypes::AttachmentId.@Id.toString()); 
				newAttachment.uri = makeURL(this.serverUrl+"/?id="+encodeURIComponent(fileAttachment.nsTypes::AttachmentId.@Id.toString())+"&name="+encodeURIComponent(fileAttachment.nsTypes::Name.toString())+"&size="+encodeURIComponent(fileAttachment.nsTypes::Size.toString())+"&user="+encodeURIComponent(this.user));

				this.logInfo("New attachment URI:"+this.serverUrl+"/?id="+encodeURIComponent(fileAttachment.nsTypes::AttachmentId.@Id.toString())+"&name="+encodeURIComponent(fileAttachment.nsTypes::Name.toString())+"&size="+encodeURIComponent(fileAttachment.nsTypes::Size.toString())+"&user="+encodeURIComponent(this.user));

				aItem.addAttachment(newAttachment);
			}
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
					this.logInfo("deleting Property:"+prop.name+"="+prop.value);

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

		this.logInfo("-- pidLidReminderSet:"+pidLidReminderSet);

		if (pidLidReminderSet) {

			this.logInfo("Reminder date is set for item");

			if (aMaster) {
				// Exchange only has the next reminderSignaltime. This is one value. Lightning can handle multiple.
//				this.clearXMozSnoozeTimes(aMaster);

//				var reminderTime = cal.createDateTime(pidLidReminderSignalTime);
				var reminderTime = cal.createDateTime(aMaster.getProperty("X-PidLidReminderSignalTime"));
				if (reminderTime) {

					if (aItem) {
						this.logInfo("We have an exception or an occurrence. We are going to use the master to see if it is snoozed or not.");

						// if the master ReminderDueBy is the same as the item Start date then this is the occurrence for which the next alarm is active.
						var masterReminderDueBy = this.tryToSetDateValue(aMaster.getProperty("X-ReminderDueBy"), null);
						if (masterReminderDueBy) {
							switch (masterReminderDueBy.compare(aItem.startDate)) {
								case -1:
									this.logInfo("The ReminderDueBy date of the master is before the item's startdate. This alarm has not been snoozed or dismissed.");
									aItem.alarmLastAck = null;
									break;
								case 0: 
									this.logInfo("The ReminderDueBy date of the master is equal to the item's startdate. We found the occurrence for which the alarm is active or dismissed or snoozed.");
									// We need to find out if it snoozed or dismissed.
									this.clearXMozSnoozeTimes(aMaster);
									this.logInfo("Set snooze time: X-MOZ-SNOOZE-TIME-"+aItem.recurrenceId.nativeTime+"="+reminderTime.icalString);
									aMaster.setProperty("X-MOZ-SNOOZE-TIME-"+aItem.recurrenceId.nativeTime, reminderTime.icalString);

									var lastAck = reminderTime.clone();
									lastAck.addDuration(cal.createDuration('-PT1S'));
									aItem.alarmLastAck = lastAck;
									aMaster.alarmLastAck = lastAck;
									this.logInfo("Set alarmLastAck:"+lastAck.icalString);
									break;
								case 1:
									this.logInfo("The ReminderDueBy date of the master is after the item's startdate. This alarm has been dismissed.");
									var lastAck = aItem.startDate.clone();
									//lastAck.addDuration(cal.createDuration('-PT1S'));
									aItem.alarmLastAck = lastAck;
									this.logInfo("Set alarmLastAck:"+lastAck.icalString);
									break;
							}
						}
						else {
							// Cannot determine for which alarm the next reminder is set. Bailing out.
							this.logInfo("Cannot determine for which alarm the next reminder is set. Bailing out.");
							return;
						}


					}
					else {
						// We have a master only. Check for which of its occurrences/exceptions the X-MOZ-SNOOZE_TIME- needs to be set.
						// Easyest way for now is loop through it's children and call this function again with the child as item.
						// This can probably be optimized.
						this.logInfo("A master. Will try to set snooze time on right occurrenceid");
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
					this.logInfo("Received pidLidReminderSignalTime is invalid:"+pidLidReminderSignalTime);
				}
			}
			else {
				// aItem is a Single
				this.clearXMozSnoozeTimes(aItem);
				var reminderTime = cal.createDateTime(pidLidReminderSignalTime);
				this.logInfo("Set snooze time: X-MOZ-SNOOZE-TIME="+reminderTime.icalString);
				aItem.setProperty("X-MOZ-SNOOZE-TIME", reminderTime.icalString);

				var lastAck = reminderTime.clone();
				lastAck.addDuration(cal.createDuration('-PT1S'));
				aItem.alarmLastAck = lastAck;
				this.logInfo("Set alarmLastAck:"+lastAck.icalString);
 
			}
		}
		else {
			// Remove any snooze states according http://msdn.microsoft.com/en-us/library/cc765589.aspx
			this.logInfo("Item has no snooze date set.");
			aItem.alarmLastAck = null;
		}
	},

	setAlarm: function _setAlarm(aItem, aCalendarItem)
	{
		if ((aCalendarItem.nsTypes::ReminderIsSet == "true")) {
			var alarm = cal.createAlarm();
			alarm.action = "DISPLAY";
			alarm.repeat = 0;

			var alarmOffset = cal.createDuration();
			alarmOffset.minutes = -1 * aCalendarItem.nsTypes::ReminderMinutesBeforeStart;

			// This is a bug fix for when the offset is more than a year)
			if (alarmOffset.minutes < (-60*24*365)) {
				alarmOffset.minutes = -5;
			}
			alarmOffset.normalize();

			alarm.related = Ci.calIAlarm.ALARM_RELATED_START;
			alarm.offset = alarmOffset;

			this.logInfo("Alarm set with an offset of "+alarmOffset.minutes+" minutes from the start");
			aItem.setProperty("X-ReminderDueBy", aCalendarItem.nsTypes::ReminderDueBy.toString());

			aItem.addAlarm(alarm);
		}
	},

	convertExchangeAppointmentToCalAppointment: function _convertExchangeAppointmentToCalAppointment(aCalendarItem, isMeetingRequest, erGetItemsRequest)
	{
		this.logInfo("convertExchangeAppointmentToCalAppointment:"+String(aCalendarItem), 2);
		var item = createEvent();
		item.calendar = this.superCalendar;

		item.id = this.tryToSetValue(aCalendarItem.nsTypes::ItemId.@Id.toString(), item.id);
		if (! item.id) {
			this.logInfo("Item.id is missing. this is a required field.");
			return null;
		}

		item.setProperty("X-ChangeKey", aCalendarItem.nsTypes::ItemId.@ChangeKey.toString());
		if ((erGetItemsRequest) && (erGetItemsRequest.argument.occurrenceIndexes) && (erGetItemsRequest.argument.occurrenceIndexes[item.id])) {
			this.logInfo(" Muriel:"+erGetItemsRequest.argument.occurrenceIndexes[item.id]+", title:"+this.tryToSetValue(aCalendarItem.nsTypes::Subject.toString()));
			item.setProperty("X-OccurrenceIndex", erGetItemsRequest.argument.occurrenceIndexes[item.id]+"");
		}

		if (this.itemCache[item.id]) {
			if (this.itemCache[item.id].getProperty("X-ChangeKey") == aCalendarItem.nsTypes::ItemId.@ChangeKey.toString()) {
				//this.logInfo("Item is allready in cache and the id and changeKey are the same. Skipping it.");
				return null;
			}
		}
		else {
			if (this.recurringMasterCache[aCalendarItem.nsTypes::UID.toString()]) {
				if ( (this.recurringMasterCache[aCalendarItem.nsTypes::UID.toString()].getProperty("X-ChangeKey") == aCalendarItem.nsTypes::ItemId.@ChangeKey.toString()) && (this.recurringMasterCache[aCalendarItem.nsTypes::UID.toString()].id == item.id)) {
					//this.logInfo("Master item is allready in cache and the id and changeKey are the same. Skipping it.");
					return null;
				}
			}
		}

		item.setProperty("X-CalendarItemType", aCalendarItem.nsTypes::CalendarItemType.toString());
		item.setProperty("X-ItemClass", aCalendarItem.nsTypes::ItemClass.toString());

		item.setProperty("X-UID", aCalendarItem.nsTypes::UID.toString());

		item.title = this.tryToSetValue(aCalendarItem.nsTypes::Subject.toString(), "");
		if (! item.title) {
			item.title = "";
		}
		//this.logInfo("convertExchangeAppointmentToCalAppointment: item.title:"+item.title);

		item.setProperty("X-LastModifiedTime", aCalendarItem.nsTypes::LastModifiedTime.toString());
		// Check if we allready have this item and if this one is newer.
		if (!isMeetingRequest) {
			if (this.itemCache[item.id]) {
				// We allready have this item.
				this.logInfo("== this.itemCache[item.id].title:"+this.itemCache[item.id].title);
				var oldItem = this.itemCache[item.id];
				if ((oldItem.getProperty("X-LastModifiedTime")) && (item.getProperty("X-LastModifiedTime") <= oldItem.getProperty("X-LastModifiedTime"))) {
					this.logInfo("We received an older or not modified item. We are going to skip it. OldLastModified:"+oldItem.getProperty("X-LastModifiedTime")+", currentLastModified:"+item.getProperty("X-LastModifiedTime"));
					//return null;
				}
			}
			else {
				// Check if we have a master.
				if ((aCalendarItem.nsTypes::CalendarItemType.toString() == "RecurringMaster") && (this.recurringMasterCache[aCalendarItem.nsTypes::UID.toString()])) {
					// We allready have this master item.
					var oldItem = this.recurringMasterCache[aCalendarItem.nsTypes::UID.toString()];
					if ((oldItem.getProperty("X-LastModifiedTime")) && (item.getProperty("X-LastModifiedTime") <= oldItem.getProperty("X-LastModifiedTime"))) {
						this.logInfo("We received an older or not modified master item. We are going to skip it. OldLastModified:"+oldItem.getProperty("X-LastModifiedTime")+", currentLastModified:"+item.getProperty("X-LastModifiedTime"));
						//return null;
					}
				}
			}			
		}
		

		if (aCalendarItem.nsTypes::IsCancelled.toString() == "true") {
			item.setProperty("X-IsCancelled", true);
		}
		else {
			item.setProperty("X-IsCancelled", false);
		}

		if (aCalendarItem.nsTypes::IsMeeting.toString() == "true") {
			item.setProperty("X-IsMeeting", true);
		}
		else {
			item.setProperty("X-IsMeeting", false);
		}

		item.setProperty("DESCRIPTION", aCalendarItem.nsTypes::Body.toString());

		this.setCommonValues(item, aCalendarItem);

		item.setProperty("X-IsInvitation", "false");
		// Check what kind of item this is.
		for each (var prop in aCalendarItem.nsTypes::ResponseObjects.*) {
			switch (prop.localName()) {
				case "AcceptItem":
				case "TentativelyAcceptItem":
				case "DeclineItem":
					item.setProperty("X-IsInvitation", "true");
					item.setProperty("X-MOZ-SEND-INVITATIONS", true);
					break
			}
		}

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

		var cats = [];
		for each (var cat in aCalendarItem.nsTypes::Categories.nsTypes::String) {
			cats.push(cat.toString());
		}
		item.setCategories(cats.length, cats);

		item.startDate = this.tryToSetDateValue(aCalendarItem.nsTypes::Start, item.startDate);
		if (! item.startDate) {
			this.logInfo("We have an empty startdate. Skipping this item.");
			return null;
		}

		item.endDate = this.tryToSetDateValue(aCalendarItem.nsTypes::End, item.endDate);
		if (! item.endDate) {
			this.logInfo("We have an empty enddate. Skipping this item.");
			return null;
		}

		// Check for Attachments
		this.addExchangeAttachmentToCal(aCalendarItem, item);

		// Check if our custom fields are set
		var extendedProperties = aCalendarItem.nsTypes::ExtendedProperty;
		var doNotHandleOldAddon = false;
		var pidLidReminderSet = false;
		var pidLidReminderSignalTime = null;
		for each(var extendedProperty in extendedProperties) {

			var propertyName = extendedProperty.nsTypes::ExtendedFieldURI.@PropertyName.toString();
			switch (propertyName) {
/*				case "alarmLastAck" :
					//this.logInfo("  alarmLastAck:"+extendedProperty.nsTypes::Value.toString());
					item.alarmLastAck = this.tryToSetDateValue(extendedProperty.nsTypes::Value, null);
					doNotHandleOldAddon = true;
					break; */
				case "lastLightningModified":
					var lastLightningModified = this.tryToSetDateValue(extendedProperty.nsTypes::Value, null);
					var lastModifiedTime = this.tryToSetDateValue(aCalendarItem.nsTypes::LastModifiedTime, null);

					if ((lastLightningModified) && (lastModifiedTime)) {
						if (lastModifiedTime.compare(lastLightningModified) == 1) {
							this.logInfo("  -- Item has been modified on the Exchange server with another client.");
							item.setProperty("X-ChangedByOtherClient", true);
						}
					}

					break;
				default:
					if (propertyName != "") this.logInfo("ODD propertyName:"+propertyName);
			}

			var propertyId = extendedProperty.nsTypes::ExtendedFieldURI.@PropertyId.toString();
			switch (propertyId) {
				case MAPI_PidLidReminderSignalTime: // This is the next alarm time. Could be set by a snooze command.
					pidLidReminderSignalTime = extendedProperty.nsTypes::Value.toString();
					item.setProperty("X-PidLidReminderSignalTime", pidLidReminderSignalTime);
					break;
				case MAPI_PidLidReminderSet: // A snooze time is active/set.
					pidLidReminderSet = (extendedProperty.nsTypes::Value.toString() == "true");
					item.setProperty("X-PidLidReminderSet", pidLidReminderSet);
					break;
				default:
					if (propertyId != "") {
						if (item.title == "Nieuwe gebeurtenis2") this.logInfo("@1:ODD propertyId:"+propertyId+"|"+extendedProperty.nsTypes::Value.toString());
					}
			}

		}

		if (aCalendarItem.nsTypes::IsAllDayEvent == "true") {
			// Check if the time is 00:00:00
			item.startDate.isDate = true;
			item.endDate.isDate = true;
		}

		item.setProperty("DTSTAMP", this.tryToSetDateValue(aCalendarItem.nsTypes::DateTimeReceived));
		item.setProperty("LOCATION", aCalendarItem.nsTypes::Location.toString());

		var myResponseType = null;
		if (aCalendarItem.nsTypes::MyResponseType.length() > 0) {
			myResponseType = aCalendarItem.nsTypes::MyResponseType.toString();
		}

		if (aCalendarItem.nsTypes::Organizer.length() > 0) {
			//this.logInfo(" ==A ORGANIZER== title:"+item.title+", org:"+String(aCalendarItem.nsTypes::Organizer));
			var org = this.createAttendee(aCalendarItem.nsTypes::Organizer, "CHAIR");

/*			if (org.id.replace(/^mailto:/, '').toLowerCase() != this.mailbox.toLowerCase()) {
				item.setProperty("X-IsInvitation", "true");
				this.logInfo("There is a organiser and I'm not it:"+org.id);
			}*/
			org.isOrganizer = true;
			item.organizer = org;
		}
		else {
//			item.setProperty("X-IsInvitation", "true");
//			this.logInfo("There is no organiser.");
		}

		if (aCalendarItem.localName() == "MeetingRequest") {
			//this.logInfo(" X-IsInvitation : MeetingRequest title="+item.title);
			item.setProperty("X-IsInvitation", "true");
			item.setProperty("X-MOZ-SEND-INVITATIONS", true);
		}
		else {
			//this.logInfo("                  MeetingItem title="+item.title);
			var iAmInTheList = false;
			var tmpAttendee;

			for each (var at in aCalendarItem.nsTypes::RequiredAttendees.nsTypes::Attendee) {
				tmpAttendee = this.createAttendee(at, "REQ-PARTICIPANT", myResponseType);
				item.addAttendee(tmpAttendee);
				if ((! iAmInTheList) && (tmpAttendee.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase())) {
					iAmInTheList = true;
				}
			}
			for each (var at in aCalendarItem.nsTypes::OptionalAttendees.nsTypes::Attendee) {
				tmpAttendee = this.createAttendee(at, "OPT-PARTICIPANT", myResponseType);
				item.addAttendee(tmpAttendee);
				if ((! iAmInTheList) && (tmpAttendee.id.replace(/^mailto:/, '').toLowerCase() == this.mailbox.toLowerCase())) {
					iAmInTheList = true;
				}
			}

			if ((myResponseType) && (! iAmInTheList)) {
				item.addAttendee(this.createMeAsAttendee(myResponseType));
			}
		}
		
		item.recurrenceId = null;
		if (!isMeetingRequest) {
			//this.logInfo(" == item.title:"+item.title+", calendarItemType:"+aCalendarItem.nsTypes::CalendarItemType.toString());
			switch (aCalendarItem.nsTypes::CalendarItemType.toString()) {
				case "Exception" :
					this.logInfo("@1:"+item.startDate.toString()+":IsException");
					item.setProperty("X-RecurringType", "RE");
					this.setAlarm(item, aCalendarItem);  
					// Try to find master. If found add Exception and link recurrenceinfo.
					item.recurrenceId = this.tryToSetDateValue(aCalendarItem.nsTypes::RecurrenceId, item.startDate);
					var master = this.recurringMasterCache[aCalendarItem.nsTypes::UID.toString()];
					if (master) {
						// We allready have a master in Cache.
						this.logInfo("Found master for exception:"+master.title+", date:"+master.startDate.toString());
						item.parentItem = master;
						master.recurrenceInfo.modifyException(item, true);
						this.setSnoozeTime(item, master);
					}
					else {
						this.logInfo("HAS NO MASTER: STRANGE: Exception:"+item.title);
					}

					break;
				case "Occurrence" :
					this.logInfo("@1:"+item.startDate.toString()+":IsOccurrence");
					item.setProperty("X-RecurringType", "RO");
					this.setAlarm(item, aCalendarItem);  
					// This is a occurrence. Try to find the master and link recurrenceinfo.
					item.recurrenceId = this.tryToSetDateValue(aCalendarItem.nsTypes::RecurrenceId, item.startDate);
					var master = this.recurringMasterCache[aCalendarItem.nsTypes::UID.toString()];
					if (master) {
						// We allready have a master in Cache.
						this.logInfo("Found master for occurrence:"+master.title+", date:"+master.startDate.toString());
						item.parentItem = master;

						this.setSnoozeTime(item, master);
					}
					else {
						this.logInfo("HAS NO MASTER: STRANGE: Occurrence:"+item.title);
					}
					
					break;
				case "RecurringMaster" :
	
					this.logInfo("@1:"+item.startDate.toString()+":IsMaster");

					// This is a master so create recurrenceInfo.
					item.recurrenceInfo = this.readRecurrence(item, aCalendarItem);
	
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
							this.logInfo("convertExchangeAppointmentToCalAppointment: WE SEE THIS LINE. SOLVE IT subject:"+item.title);
							this.itemCache[index].parentItem = item;
							if (this.itemCache[index].getProperty("X-CalendarItemType") == "Exception") {
								item.recurrenceInfo.modifyException(this.itemCache[index], true);
							}
						}

					}

					this.logInfo("title:"+item.title+", childCount:"+childCount+", firstSyncDone:"+this.firstSyncDone);

					if ((this.firstSyncDone)) {
						this.logInfo("We have a master and the sync is done. We will download it's children.");
						if (childCount > 0) {
							this.logInfo("  It also has children so we first remove them.");
							this.removeChildrenFromMaster(item);
						}
						loadChildren = true;
					}

					this.setAlarm(item, aCalendarItem);  

					this.addToOfflineCache(item, aCalendarItem);

					this.recurringMasterCache[aCalendarItem.nsTypes::UID.toString()] = item;
	
					// Removed because it probably does not need to be set. We found this out when working on the offline cache (16-05-2012)
					//item.recurrenceId = this.tryToSetDateValue(aCalendarItem.nsTypes::RecurrenceId, item.startDate);
					//this.setSnoozeTime(null, item);
	
					if ((loadChildren) || (this.newMasters[aCalendarItem.nsTypes::UID.toString()])) {

						this.logInfo("We have a master and it was set as new. So we download it's children.title:"+item.title);
						delete this.newMasters[aCalendarItem.nsTypes::UID.toString()];

						var self = this;
						// Request children from EWS server.
						var childRequestItem = {Id: aCalendarItem.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: aCalendarItem.nsTypes::ItemId.@ChangeKey.toString(),
							  type: aCalendarItem.nsTypes::CalendarItemType.toString(),
							  uid: aCalendarItem.nsTypes::UID.toString(),
							  start: aCalendarItem.nsTypes::Start.toString(),
							  end: aCalendarItem.nsTypes::End.toString()};
					
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

/*					// Microsoft remindernexttime
					if (!doNotHandleOldAddon) {
						this.readEP_DismissSnoozeState(item, aCalendarItem);
					}*/

					this.logInfo("This is a master it will not be put into the normal items cache list.");
					return null;  // The master will not be visible

					break;
				default:
					this.setAlarm(item, aCalendarItem);  
					this.setSnoozeTime(item, null);
			}
		}

/*		// Microsoft remindernexttime
		if (!doNotHandleOldAddon) {
			this.readEP_DismissSnoozeState(item, aCalendarItem);
		}*/

		item.setProperty("X-fromExchange", true);
		return item;

	},

	convertExchangeTaskToCalTask: function _convertExchangeTaskToCalTask(aTask, erGetItemsRequest)
	{
		this.logInfo("convertExchangeTaskToCalTask:"+String(aTask), 2);
		var item = createTodo();

		item.entryDate = this.tryToSetDateValue(aTask.nsTypes::StartDate, null);
/*		if (!item.entryDate) {
			item.entryDate = this.tryToSetDateValue(aTask.nsTypes::Recurrence.nsTypes::EndDateRecurrence.nsTypes::StartDate, null);
		}*/

		item.dueDate = this.tryToSetDateValue(aTask.nsTypes::DueDate, item.dueDate);
		item.completedDate = this.tryToSetDateValue(aTask.nsTypes::CompleteDate, item.completedDate);
		item.percentComplete = this.tryToSetValue(aTask.nsTypes::PercentComplete.toString(), item.percentComplete);
		item.calendar = this.superCalendar;

		item.id = this.tryToSetValue(aTask.nsTypes::ItemId.@Id.toString(), item.id);
		item.setProperty("X-ChangeKey", aTask.nsTypes::ItemId.@ChangeKey.toString());

		if (this.itemCache[item.id]) {
			if (this.itemCache[item.id].getProperty("X-ChangeKey") == aTask.nsTypes::ItemId.@ChangeKey.toString()) {
				//this.logInfo("Item is allready in cache and the id and changeKey are the same. Skipping it.");
				return null;
			}
		}


		item.setProperty("X-UID", "dummy");

		item.title = this.tryToSetValue(aTask.nsTypes::Subject.toString(), item.title);

		this.setCommonValues(item, aTask);

		var cats = [];
		for each (var cat in aTask.nsTypes::Categories.nsTypes::String) {
			cats.push(cat.toString());
		}
		item.setCategories(cats.length, cats);

		switch(aTask.nsTypes::Status.toString()) {
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
		var extendedProperties = aTask.nsTypes::ExtendedProperty;
		var doNotHandleOldAddon = false; 
		var pidLidReminderSet = false;
		var pidLidReminderSignalTime = "";
		for each(var extendedProperty in extendedProperties) {

			var propertyName = extendedProperty.nsTypes::ExtendedFieldURI.@PropertyName.toString();
			switch (propertyName) {
/*				case "alarmLastAck" :
					//this.logInfo("  alarmLastAck:"+extendedProperty.nsTypes::Value.toString());
					item.alarmLastAck = this.tryToSetDateValue(extendedProperty.nsTypes::Value, null);
					doNotHandleOldAddon = true;
					break; */
				case "lastLightningModified":
					var lastLightningModified = this.tryToSetDateValue(extendedProperty.nsTypes::Value, null);
					var lastModifiedTime = this.tryToSetDateValue(aCalendarItem.nsTypes::LastModifiedTime, null);

					if ((lastLightningModified) && (lastModifiedTime)) {
						if (lastModifiedTime.compare(lastLightningModified) == 1) {
							this.logInfo("  -- Item has been modified on the Exchange server with another client.");
							item.setProperty("X-ChangedByOtherClient", true);
						}
					}

					break;
				default:
					if (propertyName != "") this.logInfo("ODD propertyName:"+propertyName);
			}

			var propertyId = extendedProperty.nsTypes::ExtendedFieldURI.@PropertyId.toString();
			switch (propertyId) {
				case MAPI_PidLidReminderSignalTime: // This is the next alarm time. Could be set by a snooze command.
					pidLidReminderSignalTime = extendedProperty.nsTypes::Value.toString();
					item.setProperty("X-PidLidReminderSignalTime", pidLidReminderSignalTime);
					if (item.title == "Nieuwe gebeurtenis2") this.logInfo("@1:ODD propertyId:"+propertyId+"|"+pidLidReminderSignalTime);
					break;
				case MAPI_PidLidReminderSet: // A snooze time is active/set.
					pidLidReminderSet = (extendedProperty.nsTypes::Value.toString() == "true");
					item.setProperty("X-PidLidReminderSet", pidLidReminderSet);
					break;
				default:
					if (propertyId != "") {
						if (item.title == "Nieuwe gebeurtenis2") this.logInfo("@1:ODD propertyId:"+propertyId+"|"+extendedProperty.nsTypes::Value.toString());
					}
			}

		}

		// Check for Attachments
		this.addExchangeAttachmentToCal(aTask, item);

		item.setProperty("X-IsRecurring", aTask.nsTypes::IsRecurring.toString());

		if (aTask.nsTypes::IsRecurring.toString() == "true") {
			item.parentItem = item;
			// This is a master so create recurrenceInfo.
			item.recurrenceInfo = this.readRecurrence(item, aTask);
			if (this.syncBusy) {
				this.readDeletedOccurrences(item, aTask);
			}
		}

		var tmpDate;

		tmpDate = this.tryToSetDateValue(aTask.nsTypes::DateTimeCreated);
		if (tmpDate) {
            		item.setProperty("CREATED", tmpDate);
		}

		tmpDate = this.tryToSetDateValue(aTask.nsTypes::LastModifiedTime);
		if (tmpDate) {
//			item.setProperty("LAST-MODIFIED", tmpDate);
		}

		item.setProperty("DESCRIPTION", aTask.nsTypes::Body.toString());

		//item.parentItem = item;

		item.setProperty("X-fromExchange", true);

		// See if this is a delegated task.
		var isNotAccepted = 0;

		for each (var extendedProperty in aTask.nsTypes::ExtendedProperty) {

			if (extendedProperty.nsTypes::ExtendedFieldURI.@PropertyId == "33032") {
				item.setProperty("X-exchWebService-PidLidTaskAccepted",extendedProperty.nsTypes::Value.toString());
				// TRUE means accepted or rejected.
				if (extendedProperty.nsTypes::Value.toString() == "false") isNotAccepted++;
			}
			if (extendedProperty.nsTypes::ExtendedFieldURI.@PropertyId == "33045") {
				item.setProperty("X-exchWebService-PidLidTaskLastUpdate",extendedProperty.nsTypes::Value.toString());
				// Date of last update. 
			}
			if (extendedProperty.nsTypes::ExtendedFieldURI.@PropertyId == "33066") {
				item.setProperty("X-exchWebService-PidLidTaskAcceptanceState",extendedProperty.nsTypes::Value.toString());
				// Only visible on the Owner task item. Otherwise value == NoMatch
				//0x00000000 The task is not assigned.
				//0x00000001 The task’s acceptance status is unknown.
				//0x00000002 The task assignee accepted the task. This value is set when the client processes a task acceptance.
				//0x00000003 The task assignee rejected the task. This value is set when the client processes a task rejection.
				if (extendedProperty.nsTypes::Value.toString() == "NoMatch") isNotAccepted++;
			}
			if (extendedProperty.nsTypes::ExtendedFieldURI.@PropertyId == "33050") {
				item.setProperty("X-exchWebService-PidLidTaskHistory",extendedProperty.nsTypes::Value.toString());
				// Specifies last change to record. PidLidTaskLastUpdate shows date of this change.
				//0x00000004 The dispidTaskDueDate (PidLidTaskDueDate) property changed.
				//0x00000003 Another property was changed.
				//0x00000001 The task assignee accepted this task.
				//0x00000002 The task assignee rejected this task.
				//0x00000005 The task was assigned to a task assignee.
				//0x00000000 No changes were made.
				if (extendedProperty.nsTypes::Value.toString() == "5") isNotAccepted++;
			}
			if (extendedProperty.nsTypes::ExtendedFieldURI.@PropertyId == "33065") {
				item.setProperty("X-exchWebService-PidLidTaskOwnership",extendedProperty.nsTypes::Value.toString());
			}
		}
		if (aTask.nsTypes::Delegator.toString() != "") {
			item.setProperty("X-exchWebService-Delegator",aTask.nsTypes::Delegator.toString());
			item.setProperty("X-exchWebService-Owner",aTask.nsTypes::Owner.toString());
			item.setProperty("X-exchWebService-IsTeamTask",aTask.nsTypes::IsTeamTask.toString());
		}
		
		this.setAlarm(item, aTask);  
		this.setSnoozeTime(item, null);

/*		if (isNotAccepted == 3) {
			item.makeImmutable();
		}*/

		return item;
	},

	convertExchangeToCal: function _convertExchangeToCal(aExchangeItem, erGetItemsRequest)
	{
		//this.logInfo("convertExchangeToCal");
		if (!aExchangeItem) { return; }

		var switchValue = aExchangeItem.nsTypes::ItemClass.toString();
		if (switchValue.indexOf(".{") > -1) {
			switchValue = switchValue.substr(0,switchValue.indexOf(".{"));
		}

		if (switchValue.indexOf("IPM.Appointment") == 0) {

			this.logInfo("INFO: convertExchangeToCal: ItemClass = '"+switchValue+"'");
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
				return this.convertExchangeAppointmentToCalAppointment(aExchangeItem, false, erGetItemsRequest);
				break;
			case "IPM.Task" :
				return this.convertExchangeTaskToCalTask(aExchangeItem, erGetItemsRequest);
				break;
			default :
				this.logInfo("WARNING: convertExchangeToCal: unknown ItemClass = '"+switchValue+"'");
		}
	},

	updateCalendar: function _updateCalendar(erGetItemsRequest, aItems, doNotify)
	{
		//this.logInfo("updateCalendar");
		var items = [];
		var convertedItems = [];
//		for each (var exchItem in aItems) {
		for (var index in aItems) {

//			var item = this.convertExchangeToCal(exchItem, erGetItemsRequest);
			var item = this.convertExchangeToCal(aItems[index], erGetItemsRequest);
			if (item) {
				convertedItems.push(item);
				if (!this.itemCache[item.id]) {
					// This is a new unknown item
					this.itemCache[item.id] = item;

					//this.logInfo("updateCalendar: onAddItem:"+ item.title);
					if (doNotify) {
						this.notifyTheObservers("onAddItem", [item]);
					}
//					this.addToOfflineCache(item, exchItem);
					this.addToOfflineCache(item, aItems[index]);

				}
				else {
					// I Allready known this one.
					//this.logInfo("updateCalendar: onModifyItem:"+ item.title);

					this.singleModified(item, doNotify);
//					this.addToOfflineCache(item, exchItem);
					this.addToOfflineCache(item, aItems[index]);
				}
			}

		}

		return convertedItems;

	},


	getCalendarItemsOK: function _getCalendarItemsOK(erGetItemsRequest, aItems)
	{
//		this.logInfo("getCalendarItemsOK: aItems.length="+aItems.length);
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
		if (getEWSServerVersion(this.serverUrl).indexOf("2010") > -1 ) {
			return true;
		}

		return false;
	},

	get isVersion2007()
	{
		if (getEWSServerVersion(this.serverUrl).indexOf("2007") > -1 ) {
			return true;
		}

		return false;
	},

	getSyncState: function _getSyncState()
	{
		if (!this.weAreSyncing) {
			// We do not yet have a syncState. Get it first.
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
	},

	syncFolderItemsOK: function _syncFolderItemsOK(erSyncFolderItemsRequest, creations, updates, deletions, syncState)
	{
		this.folderPathStatus = 0;
		this.saveCredentials(erSyncFolderItemsRequest.argument);
		this.notConnected = false;

		//this.logInfo("syncFolderItemsOK: Creation:"+creations.length+", Updates:"+updates.length+", Deletions:"+deletions.length);

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
				//this.logInfo("Sync finished. Nothing finished.");
				this.syncState = syncState;
				this.prefs.setCharPref("syncState", syncState);

				if (this.getItemSyncQueue.length > 0) {
					this.logInfo("We have "+this.getItemSyncQueue.length+" items in this.getItemSyncQueue");
				}

				this.processItemSyncQueue();

				if (!this.firstSyncDone) { 
					this.firstSyncDone = true;
					this.logInfo("First sync is done. Normal operation is starting.");
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
						this.logInfo("Going to remove an item");
						// Single item or occurrence.
						if (item.parentItem.id == item.id) {
							this.logInfo("This is a Single to delete");
						}
						else {
							this.logInfo("This is a Occurrence or Exception to delete. THIS SHOULD NEVER HAPPEN.");
						}
						//item.clearAlarms();
						this.deleteAlarms(item);
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
							this.logInfo("This is Master to delete");
							this.removeChildrenFromMaster(master);
							this.notifyTheObservers("onDeleteItem", [master]);
							delete this.recurringMasterCache[master.getProperty("X-UID")];
						}
						else {
							this.logInfo("Do not know what you are trying to delete !!!");
						}
					}
				}
				this.syncBusy = false;

				this.processItemSyncQueue();

			}

			if (!this.firstSyncDone) { 
				this.firstSyncDone = true;
				this.logInfo("First sync is done. Normal operation is starting.");
			}

		}

	},

	syncFolderItemsError: function _syncFolderItemsError(erSyncFolderItemsRequest, aCode, aMsg)
	{
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
		var tmpFolderClass = exchWebService.commonFunctions.safeGetCharPref(this.prefs,"folderClass", null);
		if (tmpFolderClass) {
			this.logInfo("Restore folderClass from prefs.js:"+tmpFolderClass);
			this.setSupportedItems(tmpFolderClass);

			var tmpFolderProperties = exchWebService.commonFunctions.safeGetCharPref(this.prefs,"folderProperties", null);
			if (tmpFolderProperties) {
				//this.logInfo("Restore folderProperties from prefs.js:"+tmpFolderProperties);
				var tmpXML = new XML(tmpFolderProperties);
				this.setFolderProperties(tmpXML, tmpFolderClass);
			}
		}


		if (this.folderPath != "/") {
			this.logInfo("checkFolderPath 1");
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
				this.logInfo("checkFolderPath 2");
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
		this.logInfo("Set folderClass="+this.folderClass);
		this.prefs.setCharPref("folderClass", aFolderClass);
		var itemType = Ci.calICalendar.ITEM_FILTER_TYPE_EVENT;

		switch (aFolderClass) {
			case "IPF.Appointment":
				this.supportsEvents = true;
				this.supportsTasks = false;
				this.logInfo("This folder supports only events.");
				//this.getItems(Ci.calICalendar.ITEM_FILTER_TYPE_EVENT, 0, this.startCacheDate, this.endCacheDate, null);
				break;
			case "IPF.Task":
				this.supportsEvents = false;
				this.supportsTasks = true;
				this.logInfo("This folder supports only tasks.");
				itemType = Ci.calICalendar.ITEM_FILTER_TYPE_TODO;
				// Get the tasks for the current know time frame
				//this.getItems(Ci.calICalendar.ITEM_FILTER_TYPE_TODO, 0, this.startCacheDate, this.endCacheDate, null);
				break;
			case "IPF.Note":
				this.supportsEvents = true;
				this.supportsTasks = true;
				this.logInfo("This folder supports events and tasks.");
				break;
			default:
				this.supportsEvents = false;
				this.supportsTasks = false;
				this.logInfo("Unknown folderclass. We do not know if it supports events or tasks so turning it off.");
				break;
		}		

		// We are going to find out what is allready in cache. And only going to set the date range to request items for the period
		// still missing.

		// Get our this.startDate and this.endDate from offlineCache;
		var requestItem = false;
		if (!this.startDate) {
			requestItems = true;
			var tmpStartDate = this.executeQueryWithResults("SELECT min(endDate) as newStartDate FROM items", ["newStartDate"]);
			if ((tmpStartDate) && (tmpStartDate.length > 0)) {
				var newStartDate = tmpStartDate[0].newStartDate;
				if (newStartDate) {
					if (newStartDate.length == 10) {
						newStartDate += "T00:00:00Z";
					}
					this.logInfo("We have a newStartDate of '"+newStartDate+"'");
					this.startDate = cal.createDateTime(newStartDate);
				}
			}
		}

		if (!this.endDate) {
			requestItems = true;
			var tmpEndDate = this.executeQueryWithResults("SELECT max(endDate) as newEndDate FROM items", ["newEndDate"]);
			if ((tmpEndDate) && (tmpEndDate.length > 0)) {
				var newEndDate = tmpEndDate[0].newEndDate;
				if (newEndDate) {
					if (newEndDate.length == 10) {
						newEndDate += "T00:00:00Z";
					}
					this.logInfo("We have a newEndDate of '"+newEndDate+"'");
					this.endDate = cal.createDateTime(newEndDate);
				}
			}
		}

		if (requestItems) {
			var maxStartDate = this.executeQueryWithResults("SELECT max(startDate) as maxStartDate FROM items", ["maxStartDate"]);
			if ((maxStartDate) && (maxStartDate.length > 0)) {
				this.logInfo("maxStartDate:"+maxStartDate[0].maxStartDate);
				var startDateStr = maxStartDate[0].maxStartDate;
				if (startDateStr) {
					if (startDateStr.length == 10) {
						startDateStr += "T00:00:00Z";
					}
					this.logInfo("We have a maxStartDate of '"+startDateStr+"'");
					startDateStr = cal.createDateTime(startDateStr);
					if (startDateStr.compare(this.endCacheDate) < 1) {
						this.logInfo("maxStartDate is smaller than or equal to this.endCacheDate");
						this.getItems(itemType, 0, startDateStr, this.endCacheDate, null);
					}
				}
				else {
					this.logInfo("We do not have a maxStartDate. Going to request full cache period.");
					startDateStr = this.startCacheDate;
					this.getItems(itemType, 0, this.startCacheDate, this.endCacheDate, null);
				}
			}

			var minEndDate = this.executeQueryWithResults("SELECT min(endDate) as minEndDate FROM items", ["minEndDate"]);
			if ((minEndDate) && (minEndDate.length > 0)) {
				this.logInfo("minEndDate:"+minEndDate[0].minEndDate);
				var endDateStr = minEndDate[0].minEndDate;
				if (endDateStr) {
					if (endDateStr.length == 10) {
						endDateStr += "T23:59:59Z";
					}
					this.logInfo("We have a minEndDate of '"+endDateStr+"'");
					endDateStr = cal.createDateTime(endDateStr);
					if (endDateStr.compare(this.startCacheDate) > -1) {
						this.logInfo("minEndDate is bigger than or equal to this.startCacheDate");
						this.getItems(itemType, 0, this.startCacheDate, endDateStr, null);
					}
				}
			}
		}
	},

	checkFolderPathOk: function _checkFolderPathOk(erFindFolderRequest, aId, aChangeKey, aFolderClass)
	{
		this.saveCredentials(erFindFolderRequest.argument);
		this.logInfo("checkFolderPathOk: aId"+aId+", aChangeKey:"+aChangeKey+", aFolderClass:"+aFolderClass);
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
		if (aFolderProperties.nsSoap::Body.nsMessages::GetFolderResponse..nsTypes::EffectiveRights.nsTypes::Read.toString() == "false") {
			this.logInfo("getFolderOk: but EffectiveRights.Read == false. Only getting Free/Busy information.");
			if (!this.OnlyShowAvailability) {
				this.OnlyShowAvailability = true;
				this.getOnlyFreeBusyInformation(this.lastValidRangeStart, this.lastValidRangeEnd);
				this.startCalendarPoller();
			}		
		}
		else {
			this.logInfo("getFolderOk: but EffectiveRights.Read != false. Trying to get all event information.");
			this.readOnly = false;

			this.setSupportedItems(aFolderClass);		
		}
	},

	getFolderOk: function _getFolderOk(erGetFolderRequest, aId, aChangeKey, aFolderClass)
	{
		this.saveCredentials(erGetFolderRequest.argument);
		this.logInfo("getFolderOk: aId"+aId+", aChangeKey:"+aChangeKey+", aFolderClass:"+aFolderClass);
		this.notConnected = false;
		
		this.folderProperties = erGetFolderRequest.properties;
		this.prefs.setCharPref("folderProperties", this.folderProperties.toString());

		this.setFolderProperties(this.folderProperties, aFolderClass);
	},

	checkFolderPathError: function _checkFolderPathError(erFindFolderRequest, aCode, aMsg)
	{
		this.folderPathStatus = -1;
		this.logInfo("checkFolderPathError: Code:"+aCode+", Msg:"+aMsg);
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
		this.logInfo("getOnlyFreeBusyInformation");
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
			 start: cal.toRFC3339(tmpStartDate.getInTimezone(exchWebService.commonFunctions.ecUTC())),
			 end: cal.toRFC3339(tmpEndDate.getInTimezone(exchWebService.commonFunctions.ecUTC())),
			 folderID: this.folderID,
			 changeKey: this.changeKey }, 
			function(erGetUserAvailabilityRequest, aEvents) { self.getUserAvailabilityRequestOK(erGetUserAvailabilityRequest, aEvents);}, 
			function(erGetUserAvailabilityRequest, aCode, aMsg) { self.getUserAvailabilityRequestError(erGetUserAvailabilityRequest, aCode, aMsg);},
			null);
	},

	get ews_2010_timezonedefinitions()
	{
		if (!this._ews_2010_timezonedefinitions) {

			var somefile = chromeToPath("chrome://exchangecalendar/content/ewsTimesZoneDefinitions_2007.xml");
			var file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
			this.logInfo("Will use local file for timezone data for 2007. name:"+somefile);
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
				this._ews_2010_timezonedefinitions = new XML(lines);
			}
			catch(exc) {this.logInfo("Could not convert timezone xml file into XML object:"+exc); };

			this.logInfo("End of get ews_2010_timezonedefinitions");
		}

		return this._ews_2010_timezonedefinitions;
	},

	getEWSTimeZones: function _getEWSTimeZones(aTimeZoneDefinitions)
	{
		var rm = aTimeZoneDefinitions..nsMessages::GetServerTimeZonesResponseMessage;

		var timeZoneDefinitions = {};

		for each( var timeZoneDefinition in rm.nsMessages::TimeZoneDefinitions.nsTypes::TimeZoneDefinition) {
			//cal.LOG("ss:"+timeZoneDefinition.@Name);
			timeZoneDefinitions[timeZoneDefinition.@Id] = timeZoneDefinition;
		}

		return timeZoneDefinitions;
	},

	getTimeZones: function _getTimeZones()
	{
		// This only works for Exchange 2010 servers
		this.logInfo("getTimeZones 1");
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
			this.logInfo("getTimeZones 2");
			this.logInfo("getTimeZones for 2007");
			this.EWSTimeZones = this.getEWSTimeZones(this.ews_2010_timezonedefinitions);
			this.haveTimeZones = true;
		}
	},

	getTimeZonesOK: function _getTimeZonesOK(erGetTimeZonesRequest, aTimeZoneDefinitions)
	{
		this.notConnected = false;
		this.saveCredentials(erGetTimeZonesRequest.argument);
		this.EWSTimeZones = this.getEWSTimeZones(aTimeZoneDefinitions);
		this.logInfo("getTimeZonesOK");
		this.haveTimeZones = true;
	},

	getTimeZonesError: function _getTimeZonesError(erGetTimeZonesRequest, aCode, aMsg)
	{
		this.logInfo("getTimeZonesError: Msg"+aMsg);
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
		var tmpStr = aDuration;
		var multiplier = 1;
		if (tmpStr.substr(0,1) == "-") {
			multiplier = -1;
			tmpStr = tmpStr.substr(1);
		}

		var total = 0;
		var subtotal = 0;

		if (tmpStr.substr(0,2) == "PT") {
			tmpStr = tmpStr.substr(2);

			var counter = 0;
			while (counter < tmpStr.length) {
				if (isNaN(tmpStr.substr(counter, 1))) {
					switch (tmpStr.substr(counter, 1).toUpperCase()) {
						case "D":
							subtotal = subtotal * 3600 * 24;
							break;
						case "H":
							subtotal = subtotal * 3600;
							break;
						case "M":
							subtotal = subtotal * 60;
							break;
						case "S":
							subtotal = subtotal;
							break;
					}
					total = total + subtotal;
					subtotal = 0;
					//this.logInfo(" ++ total:"+total);
				}
				else {
					subtotal = (subtotal * 10) + Number(tmpStr.substr(counter, 1));
					//this.logInfo(" ++ subtotal:"+subtotal);
				}
				counter = counter + 1;
			}

		}


		return total * multiplier;
		
	},

	getEWSTimeZoneId: function _getEWSTimeZoneId(aCalTimeZone)
	{
		this.logInfo("getEWSTimeZoneId:"+aCalTimeZone.tzid);
		if (this.EWSTimeZones) {
			
			if (aCalTimeZone.isFloating) {
				var tmpZone = exchWebService.commonFunctions.ecDefaultTimeZone();
			}
			else {
				var tmpZone = aCalTimeZone;
			}

			var weHaveAMatch = null;
			var tmpPlaceName = null;
			if (tmpZone.tzid.indexOf("/") > -1) {
				// Get City/Place name from tzid.
				tmpPlaceName = tmpZone.tzid.substr(tmpZone.tzid.indexOf("/")+1);
			}


			var tmpBiasValues = this.calculateBiasOffsets(tmpZone);
			if (!tmpBiasValues.standard) {
				return "UTC";
			}

			//if (tmpBiasValues.standard.indexOf("PT0") == 0) {
			//	this.logInfo("Changing tmpBiasValues.standard="+tmpBiasValues.standard+ " -> PT0H");
			//	tmpBiasValues.standard = "PT0H";
			//}
			this.logInfo("tmpBiasValues.standard="+tmpBiasValues.standard);
			if (tmpBiasValues.daylight) {
				this.logInfo("tmpBiasValues.daylight="+tmpBiasValues.daylight);
			}

			for each(var timeZoneDefinition in this.EWSTimeZones) {
				//this.logInfo("timeZoneDefinition.@Name="+timeZoneDefinition.@Name);
				var placeNameMatch = false;
				if ((tmpPlaceName) && (timeZoneDefinition.@Name.indexOf(tmpPlaceName) > -1)) {
					// We found our placename in the name of the timezonedefinition
					placeNameMatch = true;
				}

				var standardMatch = null;
				var periods = timeZoneDefinition.nsTypes::Periods..nsTypes::Period.(@Name == "Standard");
				if (periods) {
					for each (var period in periods) {
						//this.logInfo("xx period.@Bias="+period.@Bias.toString());
						if (this.convertDurationToSeconds(period.@Bias.toString()) == this.convertDurationToSeconds(tmpBiasValues.standard)) {
							standardMatch = period.@Bias.toString();
							break;
						}
					}
				}
		
				if (standardMatch) {
					var daylightMatch = null;
					if (tmpBiasValues.daylight) {
						var periods = timeZoneDefinition.nsTypes::Periods..nsTypes::Period.(@Name == "Daylight");
						if (periods) {
							for each (var period in periods) {
								//this.logInfo("yy period.@Bias="+period.@Bias.toString());
								if (this.convertDurationToSeconds(period.@Bias.toString()) == this.convertDurationToSeconds(tmpBiasValues.daylight)) {
									daylightMatch = period.@Bias.toString();
									break;
								}
							}
						}
					}
	
					if ((standardMatch) && ((!tmpBiasValues.daylight) || (daylightMatch))) {
						this.logInfo("WE HAVE A TIMEZONE MATCH BETWEEN LIGHTNING AND exchWebService.commonFunctions. Cal:"+aCalTimeZone.tzid+", EWS:"+timeZoneDefinition.@Name);
	
						// If we also found the place name this will overrule everything else.
						if ((placeNameMatch) || (!weHaveAMatch)) {
							weHaveAMatch = timeZoneDefinition.@Id;
	
							if (placeNameMatch) {
								this.logInfo("We have a timzonematch on place name");
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
		}
	},

	doShutdown: function _doShutdown()
	{
		if (this.shutdown) {
			return;
		}

		this.shutdown = true;
		this.inboxPoller.cancel();

		for each(var timer in this.timers) {
			if (timer) {
				timer.cancel();
			}
		}

		this.offlineTimer.cancel();

		if (this.calendarPoller) {
			this.calendarPoller.cancel();
		}

		for each(var tmpJob in this.tmpJobs) {
			if (tmpJob) {
				if ((tmpJob.isRunning) && (tmpJob.parent)) {
					tmpJob.parent.stopRequest();
				}
			}
		}

		for each(var tmpQueue in this.queue) {
			this.observerService.notifyObservers(this, "onExchangeProgressChange", -1*tmpQueue.length); 
		}

		this.queue = new Array;
		this.offlineQueue = [];

		// Now we can initialize.
		this.syncState = null;
		this.weAreSyncing = false;
		
		// Remove all items in cache from calendar.
/*		for (var index in this.itemCache) {
			if (this.itemCache[index]) {
				//this.itemCache[index].clearAlarms();
				this.deleteAlarms(this.itemCache[index]);
				this.notifyTheObservers("onDeleteItem", [this.itemCache[index]]);
			}
		} */ // This is removed to speed up shutdown

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
		//this.logInfo("removeFromMeetingRequestCache:"+aUID);
//		this.meetingRequestsCache[aUID] == null;
		delete this.meetingRequestsCache[aID];
	},

	deleteAlarms: function _deleteAlarms(aItem)
	{
		return;
		//this.logInfo("deleteAlarms using alarmService");
		if (! aItem) {
			return;
		}

		var alarmService = Cc["@mozilla.org/calendar/alarm-service;1"]
					.getService(Ci.calIAlarmService);

		var alarms = aItem.getAlarms({});

		for each(var alarm in alarms) {
			//this.logInfo("Removing alarm for:"+aItem.title);
			alarmService.dismissAlarm(aItem,alarm);
		}
		//this.logInfo("deleteAlarms done.");

	},

	doTimezoneChanged: function _doTimezoneChanged()
	{
		this.logInfo("doTimeZoneChanged 1");
		return;

		var prefTzid = cal.getPrefSafe("calendar.timezone.local", null);
		this.logInfo("-- New timezone id:"+prefTzid);
		var newTimezone = exchWebService.commonFunctions.ecTZService().getTimezone(prefTzid);
		this.logInfo("doTimeZoneChanged 2");

		// Get all cached items into new timezone
		for (var index in this.itemCache) {
			if (this.itemCache[index]) {
				//var oldItem = this.itemCache[index].clone();
				var oldItem = this.cloneItem(this.itemCache[index]);
				if (! this.itemCache[index].startDate.isDate) {
					this.logInfo("mod startDate 1:"+this.itemCache[index].startDate.toString());
					this.itemCache[index].startDate = this.itemCache[index].startDate.getInTimezone(newTimezone);
					this.logInfo("mod startDate 2:"+this.itemCache[index].startDate.toString());
				}
				if (! this.itemCache[index].endDate.isDate) {
					this.logInfo("mod endDate");
					this.itemCache[index].endDate = this.itemCache[index].endDate.getInTimezone(newTimezone);
				}
				//this.itemCache[index].clearAlarms();
				this.notifyTheObservers("onModifyItem", [this.itemCache[index],oldItem]);
			}
		}
		this.logInfo("doTimeZoneChanged 3");

	},

	findItemInListByDatesAndID: function _findItemInListByDates(aList, aItem)
	{
		var result = null;
		for each(var listItem in aList) {
			if ((aItem.id == listItem.getProperty("X-UID")) &&
				(listItem.startDate.compare(aItem.startDate) == 0) &&
				(listItem.endDate.compare(aItem.endDate) == 0)) {
				this.logInfo("Found matching item in list.");
				result = listItem;
			}
		}

		return result;
	},

	createOfflineCacheDB: function _createOfflineCacheDB()
	{
		if ((this.mUseOfflineCache) && (!this.offlineCacheDB)) {
			this.dbFile = Cc["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
			this.dbFile.append("exchange-data");
			if ( !this.dbFile.exists() || !this.dbFile.isDirectory() ) {
				this.dbFile.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
			}

			this.dbFile.append(this.id+".offlineCache.sqlite");

			try {
				this.offlineCacheDB = Services.storage.openDatabase(this.dbFile); // Will also create the file if it does not exist
			}
			catch(exc) {
				this.offlineCacheDB = null;
				this.logInfo("Could not open offlineCache database.");
				return;
			}

			if (!this.offlineCacheDB.connectionReady) {
				this.offlineCacheDB = null;
				this.logInfo("connectionReady for offlineCache database.");
				return;
			}

			if (!this.offlineCacheDB.tableExists("items")) {
				this.logInfo("Table 'items' does not yet exist. We are going to create it.");
				try {
					this.offlineCacheDB.createTable("items", "event STRING, id STRING, changeKey STRING, startDate STRING, endDate STRING, uid STRING, type STRING, parentItem STRING, item STRING");
				}
				catch(exc) {
					this.logInfo("Could not create table 'items'. Error:"+exc);
					return;
				}

				var sqlStr = "CREATE INDEX idx_items_id ON items (id)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_id'");
					this.offlineCacheDB = null;
					return;
				}

				var sqlStr = "CREATE INDEX idx_items_type ON items (type)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_type'");
					this.offlineCacheDB = null;
					return;
				}

				var sqlStr = "CREATE UNIQUE INDEX idx_items_id_changekey ON items (id, changeKey)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_id_changekey'");
					this.offlineCacheDB = null;
					return;
				}

				var sqlStr = "CREATE INDEX idx_items_type_uid ON items (type ASC, uid)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_type_uid'");
					this.offlineCacheDB = null;
					return;
				}

				var sqlStr = "CREATE INDEX idx_items_uid ON items (uid)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_uid'");
					this.offlineCacheDB = null;
					return;
				}

				var sqlStr = "CREATE INDEX idx_items_uid_startdate_enddate ON items (uid, startDate ASC, endDate)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_uid_startdate_enddate'");
					this.offlineCacheDB = null;
					return;
				}

				var sqlStr = "CREATE INDEX idx_items_startdate_enddate ON items (startDate ASC, endDate)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_startdate_enddate'");
					this.offlineCacheDB = null;
					return;
				}

				var sqlStr = "CREATE INDEX idx_items_parentitem_startdate_enddate ON items (parentitem, startDate ASC, endDate)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_startdate_enddate'");
					this.offlineCacheDB = null;
					return;
				}

				var sqlStr = "CREATE INDEX idx_items_type_startdate_enddate ON items (type, startDate ASC, endDate)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_items_type_startdate_enddate'");
					this.offlineCacheDB = null;
					return;
				}

			}

			if (!this.offlineCacheDB.tableExists("attachments")) {
				this.logInfo("Table 'attachments' does not yet exist. We are going to create it.");
				try {
					this.offlineCacheDB.createTable("attachments", "id STRING, name STRING, size INTEGER, cachePath STRING");
				}
				catch(exc) {
					this.logInfo("Could not create table 'attachments'. Error:"+exc);
					return;
				}

				var sqlStr = "CREATE UNIQUE INDEX idx_att_id ON attachments (id)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_att_id'");
					this.offlineCacheDB = null;
					return;
				}

			}

			if (!this.offlineCacheDB.tableExists("attachments_per_item")) {
				this.logInfo("Table 'attachments_per_item' does not yet exist. We are going to create it.");
				try {
					this.offlineCacheDB.createTable("attachments_per_item", "itemId STRING, attId STRING");
				}
				catch(exc) {
					this.logInfo("Could not create table 'attachments_per_item'. Error:"+exc);
					return;
				}

				var sqlStr = "CREATE INDEX idx_attitem_itemid ON attachments_per_item (itemId)";
				if (!this.executeQuery(sqlStr)) {
					this.logInfo("Could not create index 'idx_attitem_itemid'");
					this.offlineCacheDB = null;
					return;
				}
			}

			this.logInfo("Created/opened offlineCache database.");
			this.executeQuery("UPDATE items set event='y' where event='y_'");
			this.executeQuery("UPDATE items set event='n' where event='n_'");

			// Fix the database corruption bug from version 2.0.0-2.0.3 (fixed in version 2.0.4) 26-05-2012
			this.logInfo("Running fix for database corruption bug from version 2.0.0-2.0.3 (fixed in version 2.0.4)");
			var masters = this.executeQueryWithResults("SELECT uid FROM items WHERE type='M'",["uid"]);
			if ((masters) && (masters.length > 0)) {
				for (var index in masters) {
					var newMasterEndDate = this.executeQueryWithResults("SELECT max(endDate) as newEndDate FROM items WHERE uid='"+masters[index].uid+"'",["newEndDate"]);
					if ((newMasterEndDate) && (newMasterEndDate.length > 0)) {
						this.logInfo("newMasterEndDate:"+newMasterEndDate[0].newEndDate);
						var endDateStr = newMasterEndDate[0].newEndDate;
						if (endDateStr) {
							if (endDateStr.length == 10) {
								endDateStr += "T23:59:59Z";
							}
							this.logInfo("newEndDate for master setting it to:"+endDateStr);
							this.executeQuery("UPDATE items set endDate='"+endDateStr+"' where type='M' AND uid='"+masters[index].uid+"'");
						}
						else {
							this.logInfo("newEndDate for master is null not going to use this. Strange!!");
						}
					}
					else {
						this.logInfo("Could not get newEndDate for Master. What is wrong!!"); 
					} 
				}
			} 

		}
		else {
			try{
				if (this.offlineCacheDB) this.offlineCacheDB.close();
				this.offlineCacheDB = null;
			}
			catch(exc){
				this.logInfo("Unable to close offlineCache database connection:"+exc);	
			}
		}		
	},

	get useOfflineCache()
	{
		if (this.mUseOfflineCache) {
			return this.mUseOfflineCache;
		}
		else {
			this.mUseOfflineCache = exchWebService.commonFunctions.safeGetBoolPref(this.prefs, "useOfflineCache", true);
			this.createOfflineCacheDB();
			return this.mUseOfflineCache;
		}
	},

	set useOfflineCache(aValue)
	{
		this.mUseOfflineCache = aValue;
		this.prefs.setBoolPref("useOfflineCache", aValue);
		this.createOfflineCacheDB();
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
		this.logInfo("sql-query:"+aQuery, 2);
		try {
			var sqlStatement = this.offlineCacheDB.createStatement(aQuery);
		}
		catch(exc) {
			this.logInfo("Error on createStatement. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString+", Exception:"+exc+". ("+aQuery+")");
			return false;
		}

		try {
			sqlStatement.executeStep();
		}
		finally {  
			sqlStatement.reset();
		}

		if ((this.offlineCacheDB.lastError == 0) || (this.offlineCacheDB.lastError == 100) || (this.offlineCacheDB.lastError == 101)) {
			return true;
		}
		else {
			this.logInfo("Error executing Query. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString);
			return false;
		}
	},

	executeQueryWithResults: function _executeQueryWithResults(aQuery, aFieldArray)
	{
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return null;
		}

		this.logInfo("sql-query:"+aQuery, 2);
		try {
			var sqlStatement = this.offlineCacheDB.createStatement(aQuery);
		}
		catch(exc) {
			this.logInfo("Error on createStatement. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString+", Exception:"+exc+". ("+aQuery+")");
			return null;
		}

		var results = [];
		try {
			while (sqlStatement.executeStep()) {
				var tmpResult = {};
				for (var index in aFieldArray) {
					try {
						tmpResult[aFieldArray[index]] = sqlStatement.row[aFieldArray[index]];
					}
					catch(exc) {
						this.logInfo("Error on getting field '"+aFieldArray[index]+"' from query '"+aQuery+"' result.("+exc+")");
					}
				}
				results.push(tmpResult);
			}
		}
		finally {  
			sqlStatement.reset();
		}

		if ((this.offlineCacheDB.lastError == 0) || (this.offlineCacheDB.lastError == 100) || (this.offlineCacheDB.lastError == 101)) {
			return results;
		}
		else {
			this.logInfo("Error executing Query. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString);
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
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		var attParams = exchWebService.commonFunctions.splitUriGetParams(aCalAttachment.uri);

		if (attParams) {

			var sqlStr = "SELECT COUNT() as attcount from attachments WHERE id='"+attParams.id+"'";
			this.logInfo("sql-query:"+sqlStr, 2);
			var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
			sqlStatement.executeStep();
			if (sqlStatement.row.attcount > 0) {
				this.logInfo("Going to update the attachment because it all ready exist.");
				this.updateAttachmentInOfflineCache(aCalItem, aCalAttachment);
				sqlStatement.reset();
				return;
			}
			sqlStatement.reset();
		
			var sqlStr = "INSERT INTO attachments VALUES ('"+attParams.id+"', '"+attParams.name.replace(/\x27/g, "''")+"', '"+attParams.size+"', '')";
			if (!this.executeQuery(sqlStr)) {
				this.logInfo("Error inserting attachment into offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				this.logInfo("Inserted attachment into offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}

			var sqlStr = "INSERT INTO attachments_per_item VALUES ('"+aCalItem.id+"','"+attParams.id+"')";
			if (!this.executeQuery(sqlStr)) {
				this.logInfo("Error inserting attachments_per_item into offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				this.logInfo("Inserted attachments_per_item into offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}

		}
	},

	updateAttachmentInOfflineCache: function _updateAttachmentInOfflineCache(aCalItem, aCalAttachment)
	{
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		var attParams = exchWebService.commonFunctions.splitUriGetParams(aCalAttachment.uri);

		if (attParams) {

			var sqlStr = "UPDATE attachments SET id='"+attParams.id+"', name='"+attParams.name.replace(/\x27/g, "''")+"', size='"+attParams.size+"', cachePath='' WHERE id='"+attParams.id+"'";
			if (!this.executeQuery(sqlStr)) {
				this.logInfo("Error updating attachment into offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				this.logInfo("Updated attachment into offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}
		}
	},

	removeAttachmentsFromOfflineCache: function _removeAttachmentsFromOfflineCache(aCalItem)
	{
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		var sqlStr = "SELECT attId FROM attachments_per_item WHERE itemId='"+aCalItem.id+"'";

		this.logInfo("sql-query:"+sqlStr, 2);
		try {
			var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
		}
		catch(exc) {
			this.logInfo("Error on createStatement. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString+", Exception:"+exc+". ("+sqlStr+")");
			return false;
		}

		var doContinue = true;
		try {
			while (doContinue) {
				doContinue = sqlStatement.executeStep();

				if (doContinue) {
					var sqlStr2 = "DELETE FROM attachments WHERE id='"+sqlStatement.row.attId+"'";
					if (!this.executeQuery(sqlStr2)) {
						this.logInfo("Error removing attachment from offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
					}
					else {
						this.logInfo("Removed attachment from offlineCacheDB. Title:"+aCalItem.title);
					}
				}
			}
		}
		finally {  
			sqlStatement.reset();
		}

		if ((this.offlineCacheDB.lastError != 0) && (this.offlineCacheDB.lastError != 100) && (this.offlineCacheDB.lastError != 101)) {
			this.logInfo("Error executing Query. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString);
			return false;
		}

		var sqlStr2 = "DELETE FROM attachments_per_item WHERE itemId='"+aCalItem.id+"'";
		if (!this.executeQuery(sqlStr2)) {
			this.logInfo("Error removing attachments_per_item from offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
		}
		else {
			this.logInfo("Removed attachments_per_item from offlineCacheDB. Title:"+aCalItem.title);
		}

		return true;
	},

	removeAttachmentFromOfflineCache: function _removeAttachmentFromOfflineCache(aCalItem, aCalAttachment)
	{
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		var attParams = exchWebService.commonFunctions.splitUriGetParams(aCalAttachment.uri);

		if (attParams) {

			var sqlStr = "DELETE FROM attachments WHERE id='"+attParams.id+"'";
			if (!this.executeQuery(sqlStr)) {
				this.logInfo("Error removing attachment from offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				this.logInfo("Removed attachment from offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}

			var sqlStr = "DELETE FROM attachments_per_item WHERE itemId='"+aCalItem.id+"' AND attId='"+attParams.id+"'";
			if (!this.executeQuery(sqlStr)) {
				this.logInfo("Error removing attachments_per_item from offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
			}
			else {
				this.logInfo("Removed attachments_per_item from offlineCacheDB. Name:"+attParams.name+", Title:"+aCalItem.title);
			}
		}
	},

	addToOfflineCache: function _addToOfflineCache(aCalItem, aExchangeItem)
	{
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		if (isEvent(aCalItem)) {
			var startDate = cal.toRFC3339(aCalItem.startDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
			var endDate = cal.toRFC3339(aCalItem.endDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
			var eventField = "y";
		}
		else {
			if (aCalItem.entryDate) {
				var startDate = cal.toRFC3339(aCalItem.entryDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
			}
			else {
				var startDate = "";
			};

			if (((aCalItem.completedDate) && (aCalItem.dueDate) && (aCalItem.completedDate.compare(aCalItem.dueDate) == 1)) || ((aCalItem.completedDate) && (!aCalItem.dueDate))) {
				var endDate = cal.toRFC3339(aCalItem.completedDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
			}
			else {
				if (aCalItem.dueDate) {
					var endDate = cal.toRFC3339(aCalItem.dueDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
				}
				else {
					var endDate = "";
				}
			}
			var eventField = "n";
		}

		var sqlStr = "SELECT COUNT() as itemcount from items WHERE id='"+aCalItem.id+"'";
		this.logInfo("sql-query:"+sqlStr, 2);
		var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
		sqlStatement.executeStep();
		if (sqlStatement.row.itemcount > 0) {
			this.logInfo("Going to update the item because it all ready exist.");
			this.updateInOfflineCache(aCalItem, aExchangeItem);
			sqlStatement.reset();
			return;
		}
		sqlStatement.reset();

		if (isEvent(aCalItem)) {
			if (this.getItemType(aCalItem) == "M") {
				// Lets find the real end date.
				for (var childIndex in this.itemCache) {
					if ((this.itemCache[childIndex]) && (aCalItem.getProperty("X-UID") == this.itemCache[childIndex].getProperty("X-UID"))) {
						var childEnd = cal.toRFC3339(this.itemCache[childIndex].endDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
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
		if (!this.executeQuery(sqlStr)) {
			this.logInfo("Error inserting item into offlineCacheDB. Error:("+this.offlineCacheDB.lastError+")"+this.offlineCacheDB.lastErrorString);
		}
		else {
			this.logInfo("Inserted item into offlineCacheDB. Title:"+aCalItem.title+", startDate:"+startDate);
		}
		this.addAttachmentsToOfflineCache(aCalItem);
	},

	updateInOfflineCache: function _updateInOfflineCache(aCalItem, aExchangeItem)
	{
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		if ((this.getItemType(aCalItem) != "M") || (isToDo(aCalItem))) {
			var sqlStr = "SELECT COUNT() as itemcount from items WHERE id='"+aCalItem.id+"' AND changeKey='"+aCalItem.getProperty("X-ChangeKey")+"'";
			this.logInfo("sql-query:"+sqlStr, 2);
			var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
			sqlStatement.executeStep();
			if (sqlStatement.row.itemcount > 0) {
				this.logInfo("This item is allready in offlineCache database. id and changeKey are the same. Not going to update it.");
				sqlStatement.reset();
				return;
			}
			sqlStatement.reset();
		}
		
		if (isEvent(aCalItem)) {
			var startDate = cal.toRFC3339(aCalItem.startDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
			var endDate = cal.toRFC3339(aCalItem.endDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
			var eventField = "y";
		}
		else {
			if (aCalItem.entryDate) {
				var startDate = cal.toRFC3339(aCalItem.entryDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
			}
			else {
				var startDate = "";
			};

			if ((aCalItem.completedDate) && (aCalItem.completedDate.compare(aCalItem.dueDate) == 1)) {
				var endDate = cal.toRFC3339(aCalItem.completedDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
			}
			else {
				if (aCalItem.dueDate) {
					var endDate = cal.toRFC3339(aCalItem.dueDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
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
				var newMasterEndDate = this.executeQueryWithResults("SELECT max(endDate) as newEndDate FROM items WHERE uid='"+aCalItem.getProperty("X-UID")+"'",["newEndDate"]);
				if ((newMasterEndDate) && (newMasterEndDate.length > 0)) {
					this.logInfo("newMasterEndDate:"+newMasterEndDate[0].newEndDate);
					var endDateStr = newMasterEndDate[0].newEndDate;
					if (endDateStr) {
						if (endDateStr.length == 10) {
							endDateStr += "T23:59:59Z";
						}
						this.logInfo("newEndDate for master setting it to:"+endDateStr);
						endDate = endDateStr;
					}
					else {
						this.logInfo("newEndDate for master is null not going to use this. Strange!!");
					}
				}
				else {
					this.logInfo("Could not get newEndDate for Master. What is wrong!!"); 
				} 

/*				for (var childIndex in this.itemCache) {
					if ((this.itemCache[childIndex]) && (aCalItem.getProperty("X-UID") == this.itemCache[childIndex].getProperty("X-UID"))) {
						var childEnd = cal.toRFC3339(this.itemCache[childIndex].endDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
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
		if (!this.executeQuery(sqlStr)) {
			this.logInfo("Error updating item in offlineCacheDB. Error:"+this.offlineCacheDB.lastErrorString);
		}
		else {
			this.logInfo("Updated item in offlineCacheDB. Title:"+aCalItem.title+", startDate:"+startDate);
		}
		this.addAttachmentsToOfflineCache(aCalItem);
	},

	updateMasterInOfflineCache: function _updateParentInOfflineCache(aCalItem)
	{
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		var endDate = cal.toRFC3339(aCalItem.endDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));

		if (this.getItemType(aCalItem) == "M") {
			// Lets find the real end date.
			for (var childIndex in this.itemCache) {
				if ((this.itemCache[childIndex]) && (aCalItem.getProperty("X-UID") == this.itemCache[childIndex].getProperty("X-UID"))) {
					var childEnd = cal.toRFC3339(this.itemCache[childIndex].endDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
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
		if (!this.executeQuery(sqlStr)) {
			this.logInfo("Error updating master item in offlineCacheDB. Error:"+this.offlineCacheDB.lastErrorString);
		}
		else {
			this.logInfo("Updated master item in offlineCacheDB. Title:"+aCalItem.title);
		}
	},

	removeFromOfflineCache: function _removeFromOfflineCache(aCalItem)
	{
		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		var sqlStr = "DELETE FROM items WHERE id='"+aCalItem.id+"'";
		if (!this.executeQuery(sqlStr)) {
			this.logInfo("Error deleting item from offlineCacheDB. Error:"+this.offlineCacheDB.lastErrorString);
		}
		else {
			this.logInfo("Removed item from offlineCacheDB. Title:"+aCalItem.title);
		}
		this.removeAttachmentsFromOfflineCache(aCalItem);
	},

	getItemsFromOfflineCache: function _getItemsFromOfflineCache(aStartDate, aEndDate)
	{
		this.logInfo("getItemsFromOfflineCache");

		if ((!this.getProperty("exchWebService.useOfflineCache")) || (!this.offlineCacheDB) ) {
			return;
		}

		var result = [];

		var startDate = cal.toRFC3339(aStartDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));
		var endDate = cal.toRFC3339(aEndDate.getInTimezone(exchWebService.commonFunctions.ecUTC()));

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

		this.logInfo("sql-query:"+sqlStr, 1);
		try {
			var sqlStatement = this.offlineCacheDB.createStatement(sqlStr);
		}
		catch(exc) {
			this.logInfo("Error on createStatement. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString+", Exception:"+exc+". ("+sqlStr+")");
			return false;
		}

		var doContinue = true;
		try {
			while (doContinue) {
				doContinue = sqlStatement.executeStep();

				if (doContinue) {
					this.logInfo("Found item in offline Cache.");
					var cachedItem = new XML(sqlStatement.row.item);
					//cachedItem.content = ;
					//this.logInfo(" --:"+cachedItem.toString());
					result.push(cachedItem);
				}
			}
		}
		finally {  
			sqlStatement.reset();
		}

		this.logInfo("Retreived '"+result.length+"' records from offline cache. startDate:"+startDate+", endDate:"+endDate);
		if ((this.offlineCacheDB.lastError == 0) || (this.offlineCacheDB.lastError == 100) || (this.offlineCacheDB.lastError == 101)) {

			if (result.length > 0) {
				this.executeQuery("UPDATE items set event=(event || '_')"+whereStr);

				return this.updateCalendar(null, result, true);
			}
		}
		else {
			this.logInfo("Error executing Query. Error:"+this.offlineCacheDB.lastError+", Msg:"+this.offlineCacheDB.lastErrorString);
			return null;
		}
	},

	set isOffline(aValue)
	{
		if (aValue != this.mIsOffline) {
			this.notConnected = aValue;
			this.mIsOffline = aValue;

			if (!aValue) {
				this.refresh();
				this.startCalendarPoller();
				this.startSyncInboxPoller();
			}
			else {
				if (this.calendarPoller) {
					this.calendarPoller.cancel();
				}
				this.inboxPoller.cancel();
			}
		}
	},

	get isOffline()
	{
		return this.mIsOffline;
	},

	offlineStateChanged: function _offlineStateChanged(aStatus)
	{
		this.logInfo("The offline state of TB changed to:"+aStatus);
		this.isOffline = (aStatus == "offline");
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

		exchWebService.commonFunctions.ERROR(logMessage + "\n" + exchWebService.commonFunctions.STACK(10));
	},

	logInfo: function _logInfo(message, aDebugLevel) {

		if (!aDebugLevel) {
			var debugLevel = 1;
		}
		else {
			var debugLevel = aDebugLevel;
		}

		if (exchWebService.commonFunctions.shouldLog()) {
			exchWebService.check4addon.logAddOnVersion();
		}

		var prefB = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		var storedDebugLevel = exchWebService.commonFunctions.safeGetIntPref(prefB, "extensions.1st-setup.core.debuglevel", 0, true);

		if (debugLevel <= storedDebugLevel) {
			exchWebService.commonFunctions.LOG("["+this.name+"] "+message + " ("+exchWebService.commonFunctions.STACKshort()+")");
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

function fixPrefBug()
{
	var createPrefs = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService)
		    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl.createcalendar.");

	createPrefs.clearUserPref("autodiscover");
	createPrefs.clearUserPref("server");
	createPrefs.clearUserPref("mailbox");
	createPrefs.clearUserPref("displayname");
	createPrefs.clearUserPref("user");
	createPrefs.clearUserPref("domain");
	createPrefs.clearUserPref("folderbase");
	createPrefs.clearUserPref("folderpath");
	createPrefs.clearUserPref("folderID");
	createPrefs.clearUserPref("changeKey");
	createPrefs.clearUserPref("folderIDOfShare");

	var children = createPrefs.getChildList("");
	if (children.length > 0) {
		// Move prefs from old location to new location.
		for (var index in children) {
			exchWebService.commonFunctions.LOG("Going to move pref key:"+children[index]);
			var newPrefs = Cc["@mozilla.org/preferences-service;1"]
		                    .getService(Ci.nsIPrefService)
				    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl.");
			switch (createPrefs.getPrefType(children[index])) {
			case createPrefs.PREF_STRING:
				exchWebService.commonFunctions.LOG("STRING pref");
				newPrefs.setCharPref(children[index], createPrefs.getCharPref(children[index]));
				break;
			case createPrefs.PREF_INT:
				exchWebService.commonFunctions.LOG("INT pref");
				newPrefs.setIntPref(children[index], createPrefs.getIntPref(children[index]));
				break;
			case createPrefs.PREF_BOOL:
				exchWebService.commonFunctions.LOG("BOOL pref");
				newPrefs.setBoolPref(children[index], createPrefs.getBoolPref(children[index]));
				break;
			}
			createPrefs.clearUserPref(children[index]);
		}
		
	}

}

function removeOldPrefs()
{
	var currentPrefs = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService)
		    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl.");

	var children = currentPrefs.getChildList("");
	if (children.length > 0) {
		var oldUUID = "";
		children.sort();
		for (var index in children) {
			if (children[index].indexOf("createcalendar.") == -1) {
				var uuid = children[index].substr(0, children[index].indexOf("."));
				if (uuid != oldUUID) {
					exchWebService.commonFunctions.LOG("removeOldPrefs Checking uuid:"+uuid);
					oldUUID = uuid;
					var calPrefs = Cc["@mozilla.org/preferences-service;1"]
				                    .getService(Ci.nsIPrefService)
						    .getBranch("calendar.registry."+uuid+".");
					try {
						var type = calPrefs.getCharPref("type");
					}
					catch(err) {
						exchWebService.commonFunctions.LOG("   -- Removing uuid:"+uuid);
						currentPrefs.deleteBranch(uuid);
					}

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
		if (!aAddOn) {
			exchWebService.commonFunctions.LOG("Exchange Calendar and Tasks add-on is NOT installed.");
		}
		else {
			exchWebService.commonFunctions.LOG(aAddOn.name +" is installed.");
			try {
				exchWebService.commonFunctions.LOG(aAddOn.name +" is installed from:"+aAddOn.sourceURI.prePath+aAddOn.sourceURI.path);
			}
			catch(err) {
				exchWebService.commonFunctions.LOG(aAddOn.name +" unable to determine where installed from.");
			}
			exchWebService.commonFunctions.LOG(aAddOn.name +" is version:"+aAddOn.version);
			if (aAddOn.isActive) {
				exchWebService.commonFunctions.LOG(aAddOn.name +" is active.");
			}
			else {
				exchWebService.commonFunctions.LOG(aAddOn.name +" is NOT active.");
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

function NSGetFactory(cid) {

	exchWebService.commonFunctions.LOG("--XX- calExchangeCalendar--1");
	try {
		if (!NSGetFactory.mainEC) {
			// Load main script from lightning that we need.
			cal.loadScripts(scriptLoadOrder, Cu.getGlobalForObject(this));
			NSGetFactory.mainEC = XPCOMUtils.generateNSGetFactory([calExchangeCalendar]);
			exchWebService.commonFunctions.LOG("---XX- huppeltje");
			
	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	fixPrefBug();
	removeOldPrefs();

	exchWebService.commonFunctions.LOG("---XX- calExchangeCalendar-miv");
	return NSGetFactory.mainEC(cid);
} 


