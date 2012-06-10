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
 * ## Exchange 2007/2010 Calendar and Tasks Provider.
 * ## For Thunderbird with the Lightning add-on.
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

Cu.import("resource://exchangecalendar/ecFunctions.js");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm"); 
Cu.import("resource://gre/modules/FileUtils.jsm");

Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://calendar/modules/calProviderUtils.jsm");
Cu.import("resource://calendar/modules/calStorageHelpers.jsm");

if (! exchWebService) var exchWebService = {};

exchWebService.offlineCacheSettings = {	
	onLoad: function _onLoad(event) 
	{
		var calId = window.arguments[0].calendar.id;
		var aCalendar = window.arguments[0].calendar;
		

		// Load cache preferences

		this.oldUseOfflineCache = aCalendar.getProperty("exchWebService.useOfflineCache"); 
		if(aCalendar.getProperty("exchWebService.useOfflineCache")){			
			document.getElementById("exchWebService-offlineCacheproperties-cacheState").checked=true;
			document.getElementById("exchWebService-offlineCacheproperties-detaisvbox").removeAttribute("collapsed");
			
			var cachePrefs = exchWebService.offlineCacheSettings.countItemsInOfflineCache(aCalendar);			
			
			var startDate = "no date";
			var endDate = "no date";

			if (cachePrefs.aStartDateForCaching != null && (cachePrefs.aStartDateForCaching).length>11){
				startDate = (cachePrefs.aStartDateForCaching).substring(0,10);				
			}
			if (cachePrefs.aEndDateForCaching != null && (cachePrefs.aEndDateForCaching).length>11){
				endDate = (cachePrefs.aEndDateForCaching).substring(0,10);
			}				
	
			document.getElementById("exchWebService-offlineCacheproperties-cachingStartDateValue").value = startDate;
			document.getElementById("exchWebService-offlineCacheproperties-cachingEndDateValue").value = endDate;
			
			document.getElementById("exchWebService-offlineCacheproperties-totalEventsValue").value=cachePrefs.totalNoOfEvents;
			document.getElementById("exchWebService-offlineCacheproperties-totalTasksValue").value=cachePrefs.totalNoOfToDos;

			document.getElementById("exchWebService-offlineCacheproperties-maintainancegroupbox").removeAttribute("collapsed");
			document.getElementById("exchWebService-offlineCacheproperties-preferencesgroupbox").removeAttribute("collapsed");

			var exchWebServicesCalPrefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+calId+".");
			
			document.getElementById("exchWebService-offlineCacheproperties-monthsBeforeToday").value=exchWebService.commonFunctions.safeGetIntPref(exchWebServicesCalPrefs, "ecOfflineCacheMonthsBeforeToday",1);
			document.getElementById("exchWebService-offlineCacheproperties-monthsAfterToday").value=exchWebService.commonFunctions.safeGetIntPref(exchWebServicesCalPrefs, "ecOfflineCacheMonthsAfterToday",1);
			
		}

	},
	
	doClearCache: function _doClearCache()
	{	
		var aCalendar = window.arguments[0].calendar;
		exchWebService.offlineCacheSettings.clearCachedData(aCalendar);				
	},

	onSave: function _onSave()
	{	
		var calId = window.arguments[0].calendar.id;
		var aCalendar = window.arguments[0].calendar;
		exchWebServicesSaveExchangeSettingsByCalId(calId);

		var exchWebServicesCalPrefs = Cc["@mozilla.org/preferences-service;1"]
						.getService(Ci.nsIPrefService)
						.getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+calId+".");

		// Save caching preferences
		/*if(document.getElementById("exchWebService-offlineCacheproperties-cacheState").checked){
			exchWebServicesCalPrefs.setBoolPref("useOfflineCache", true);	
		}
		else{
			exchWebServicesCalPrefs.setBoolPref("useOfflineCache", false);					
		}*/
		
		exchWebServicesCalPrefs.setIntPref("ecOfflineCacheMonthsBeforeToday", document.getElementById("exchWebService-offlineCacheproperties-monthsBeforeToday").value); 
		exchWebServicesCalPrefs.setIntPref("ecOfflineCacheMonthsAfterToday", document.getElementById("exchWebService-offlineCacheproperties-monthsAfterToday").value); 

		if (this.oldUseOfflineCache != document.getElementById("exchWebService-offlineCacheproperties-cacheState").checked) {
			aCalendar.setProperty("exchWebService.useOfflineCache", document.getElementById("exchWebService-offlineCacheproperties-cacheState").checked)
		}

	},
	
	getDBConn : function _aDBConn(aCalendar)
	{	
		var file = Cc["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
			file.append("exchange-data");
			file.append(aCalendar.id+".offlineCache.sqlite");
		let mDBConn = Services.storage.openDatabase(file);
		return mDBConn;
	},

	countItemsInOfflineCache : function _countItemsInOfflineCache(aCalendar)
	{	
		let aDBConn = exchWebService.offlineCacheSettings.getDBConn(aCalendar);
		var eventCount = 0;
		var toDoCount = 0;
		var startDate = 0;
		var endDate=0;
		
		var cachePrefs={
					aStartDateForCaching: startDate,
					aEndDateForCaching: endDate,
					totalNoOfEvents: eventCount,
					totalNoOfToDos: toDoCount
				};

		if(aDBConn.connectionReady && aDBConn.tableExists("items")){
				
				let statement = aDBConn.createStatement("SELECT COUNT() as eventcount FROM items where event = 'y'");
				let statement1 = aDBConn.createStatement("SELECT min(startDate) as startDate FROM items");
				let statement2 = aDBConn.createStatement("SELECT max(endDate) as endDate FROM items");
				let statement3 = aDBConn.createStatement("SELECT COUNT() as toDoCount FROM items where event = 'n'");
								
				try{	
					statement.executeStep();
					statement1.executeStep();
					statement2.executeStep();
					statement3.executeStep();

					eventCount=statement.row.eventcount;
					toDoCount=statement3.row.toDoCount;

					startDate=statement1.row.startDate;
					endDate=statement2.row.endDate;					

					statement.finalize();
					statement1.finalize();
					statement2.finalize();
					statement3.finalize();
				}
				catch(e){
			       		exchWebService.commonFunctions.LOG("unable to count events"+e);					
				}


				cachePrefs={
					aStartDateForCaching: startDate,
					aEndDateForCaching: endDate,
					totalNoOfEvents: eventCount,
					totalNoOfToDos: toDoCount
				};				
			}
		exchWebService.commonFunctions.getConsoleService().logStringMessage("in count: tsks: "+cachePrefs.totalNoOfToDos+ " events: "+cachePrefs.totalNoOfEvents+" start date: " +cachePrefs.aStartDateForCaching+ " end date: "+cachePrefs.aEndDateForCaching);
		return cachePrefs;	
	},

	clearCachedData : function _clearCachedData(aCalendar)
	{
		let aDBConn = exchWebService.offlineCacheSettings.getDBConn(aCalendar);
		if(aDBConn.connectionReady && aDBConn.tableExists("items")){
				exchWebService.commonFunctions.getConsoleService().logStringMessage("in if of delete");
				let statement = aDBConn.createStatement("DELETE FROM items");
				let statement1 = aDBConn.createStatement("DELETE FROM attachments");
				let statement2 = aDBConn.createStatement("DELETE FROM attachments_per_item");
								
				try{	
					statement.executeStep();
					statement1.executeStep();
					statement2.executeStep();					

					statement.finalize();
					statement1.finalize();
					statement2.finalize();
				}
				catch(e){
			       		exchWebService.commonFunctions.LOG("unable to clear tables"+e);					
				}
			alert("cache cleared!");
			var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
			observerService.notifyObservers(aCalendar, "onCalReset", aCalendar.id);			
			exchWebService.offlineCacheSettings.onLoad();		
		}
	},

	doCheckOfflineCacheChanged: function _doCheckOfflineCacheChanged(aCheckBox)
	{
		if (document.getElementById("exchWebService-offlineCacheproperties-cacheState").checked) {
			document.getElementById("exchWebService-offlineCacheproperties-detaisvbox").setAttribute("collapsed", "false");
			document.getElementById("exchWebService-offlineCacheproperties-maintainancegroupbox").setAttribute("collapsed", "false");
			document.getElementById("exchWebService-offlineCacheproperties-preferencesgroupbox").setAttribute("collapsed", "false");
		}
		else {
			document.getElementById("exchWebService-offlineCacheproperties-detaisvbox").setAttribute("collapsed", "true");
			document.getElementById("exchWebService-offlineCacheproperties-maintainancegroupbox").setAttribute("collapsed", "true");
			document.getElementById("exchWebService-offlineCacheproperties-preferencesgroupbox").setAttribute("collapsed", "true");
		}
	},

}
document.addEventListener("load", exchWebService.offlineCacheSettings.onLoad, true);
