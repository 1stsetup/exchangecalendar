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

Cu.import("resource://exchangecalendar/ecFunctions.js");

if (! exchWebService) var exchWebService = {};

exchWebService.calendarCreation = {

	oldLocationTextBox: "",
	oldNextPage: "",
	oldCache: false,
	oldOnPageAdvanced: "",

	firstTime: true,

	createPrefs : Cc["@mozilla.org/preferences-service;1"]
                    			.getService(Ci.nsIPrefService)
		    			.getBranch("extensions.exchangecalendar@extensions.1st-setup.nl.createcalendar."),

	doRadioExchangeCalendar: function _doRadioExchangeCalendar(aRadioGroep)
	{
		if (this.firstTime) {
			// Get the next page to change how it should advance.
			var aCustomizePage = document.getElementById('calendar-wizard').getPageById("customizePage");
			this.oldNextPage = aCustomizePage.getAttribute("next");
			this.oldOnPageAdvanced = aCustomizePage.getAttribute("onpageadvanced");

			this.firstTime = false;		
		}

		if (aRadioGroep.value == "exchangecalendar") {
			this.oldLocationTextBox = document.getElementById("calendar-uri").value;
			this.oldCache = document.getElementById("cache").checked;

			document.getElementById("calendar-uri").value = "https://auto/"+exchWebService.commonFunctions.getUUID();
			document.getElementById("calendar-uri").parentNode.hidden = true;

			// Get the next page to set back new values.
			var aCustomizePage = document.getElementById('calendar-wizard').getPageById("customizePage");
			aCustomizePage.setAttribute( "next", "exchWebService_exchange1");
			aCustomizePage.setAttribute( "onpageadvanced", "return true;");

			document.getElementById("cache").parentNode.hidden = true;
			document.getElementById("cache").checked = false;
			var temp = document.getElementById("cache").parentNode.parentNode;

			if(!document.getElementById("exchange-cache-row")){
				var exchangeCacheRow = document.createElement("row");
				exchangeCacheRow.setAttribute("id", "exchange-cache-row");
				var exchangeCacheRowlabel = document.createElement("label");
				exchangeCacheRow.appendChild(exchangeCacheRowlabel);
				var exchangeCache = document.createElement("checkbox");
				exchangeCache.setAttribute("id", "exchange-cache");
				exchangeCache.setAttribute("label", "exchange-cache");
				exchangeCacheRow.appendChild(exchangeCache);
				temp.appendChild(exchangeCacheRow);
			}

		}
		else {
			document.getElementById("calendar-uri").value = this.oldLocationTextBox;
			document.getElementById("calendar-uri").parentNode.hidden = false;

			// Get the next page to set back  how it should advance.
			var aCustomizePage = document.getElementById('calendar-wizard').getPageById("customizePage");
			aCustomizePage.setAttribute( "next", this.oldNextPage);
			aCustomizePage.setAttribute( "onpageadvanced", this.oldOnPageAdvanced);

			document.getElementById("cache").parentNode.hidden = false;
			document.getElementById("cache").checked = this.oldCache;
			
			if(document.getElementById("exchange-cache-row")){
				var temp = document.getElementById("cache").parentNode.parentNode;
				var exchangeCacheRow = document.getElementById("exchange-cache-row");
				temp.removeChild(exchangeCacheRow);
			}
		
		}
		exchWebServicesCheckRequired();
	},

	initExchange1: function _initExchange1()
	{
		this.createPrefs.deleteBranch("");

		var selItem = document.getElementById("email-identity-menulist").selectedItem;
		if (selItem) {
			var identity = selItem.getAttribute("value");
			if (identity != "none") {
				var identityPrefs = Cc["@mozilla.org/preferences-service;1"]
			            .getService(Ci.nsIPrefService)
				    .getBranch("mail.identity."+identity+".");

				document.getElementById("exchWebService_mailbox").value = identityPrefs.getCharPref("useremail");
				exchWebServicesInitMailbox(document.getElementById("exchWebService_mailbox").value);
				this.createPrefs.setCharPref("mailbox", document.getElementById("exchWebService_mailbox").value);
			}
			else {
				document.getElementById("exchWebService_mailbox").value = "";
			}
		}
		else {
			exchWebService.commonFunctions.LOG("no item selected");
		}


		document.getElementById("exchWebService_folderpath").value = "/";

		exchWebServicesCheckRequired();
	
	},

	saveSettings: function _saveSettings()
	{
		exchWebService.commonFunctions.LOG("saveSettings Going to create the calendar in prefs.js");

		// Calculate the new calendar.id
		var newCalId = exchWebService.commonFunctions.getUUID();

		// Save settings in dialog to new cal id.
		exchWebServicesSaveExchangeSettingsByCalId(newCalId);

		// Need to save the useOfflineCache preference separetly because it is not part of the main.
		this.prefs = Cc["@mozilla.org/preferences-service;1"]
	                    .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+newCalId+".");
		this.prefs.setBoolPref("useOfflineCache", document.getElementById("exchange-cache").checked);
		this.prefs.setIntPref("exchangePrefVersion", 1);

		// We create a new URI for this calendar which will contain the calendar.id
		var ioService = Cc["@mozilla.org/network/io-service;1"]  
				.getService(Ci.nsIIOService);  
		var tmpURI = ioService.newURI("https://auto/"+newCalId, null, null);  

		var calManager = Cc["@mozilla.org/calendar/manager;1"]
			.getService(Ci.calICalendarManager);
		var newCal = calManager.createCalendar("exchangecalendar", tmpURI);

		newCal.id = newCalId;
		newCal.name = document.getElementById("calendar-name").value;

		var calPrefs = Cc["@mozilla.org/preferences-service;1"]
		            .getService(Ci.nsIPrefService)
			    .getBranch("calendar.registry."+newCalId+".");

		calPrefs.setCharPref("name", document.getElementById("calendar-name").value);

		newCal.setProperty("color", document.getElementById('calendar-color').color);
		if (!document.getElementById("fire-alarms").checked) {
			newCal.setProperty("suppressAlarms", true);
		}


		var selItem = document.getElementById("email-identity-menulist").selectedItem;
		if (selItem) {
			var identity = selItem.getAttribute("value");
		}
		else {
			var identity = "";
		}

		newCal.setProperty("imip.identity.key", identity); 


		newCal.setProperty("cache.enabled", false);

		Cc["@mozilla.org/preferences-service;1"]
	                    .getService(Ci.nsIPrefService).savePrefFile(null);

		calManager.registerCalendar(newCal);

	},
}

