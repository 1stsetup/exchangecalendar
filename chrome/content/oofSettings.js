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


Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://exchangecalendar/erGetUserOofSettings.js");
Cu.import("resource://exchangecalendar/erSetUserOofSettings.js");

Cu.import("resource://exchangecalendar/ecFunctions.js");

if (! exchWebService) var exchWebService = {};

if (! exchWebService.cal) {
	Cu.import("resource://calendar/modules/calUtils.jsm", exchWebService);
}

exchWebService.oofSettings = {

	calPrefs: null,
	intOofSettings: {},

	onLoad: function _onLoad()
	{
		var calId = window.arguments[0].calendar.id;

		this.calPrefs = Cc["@mozilla.org/preferences-service;1"]
		            .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+calId+".");

		document.getElementById("exchWebService-oofSettings-title").value = exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecMailbox", "null");
		exchWebService.oofSettings.getOofSettings();
	},

	onSave: function _onSave()
	{
		exchWebService.oofSettings.setOofSettings();

		Cc["@mozilla.org/preferences-service;1"]
		                    .getService(Ci.nsIPrefService).savePrefFile(null);
		return false;
	},

	getOofSettings: function _getOofSettings()
	{
		document.getElementById("exchWebService-load-error-message").value = exchWebService.commonFunctions.getString("calExchangeCalendar", "ecLoadingOofSettings", [], "exchangecalendar");

		var tmpObject = new erGetUserOofSettingsRequest(
			{user: exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecDomain", "null")+"\\"+exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecUser", "null"), 
			 mailbox: exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecMailbox", "null"),
			 serverUrl: exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecServer", "null")}, this.getOofSettingsOK, this.getOofSettingsError)
	},

	getOofSettingsOK: function _getOofSettingsOK(aGetUserOofSettingsRequest, aOofSettings)
	{
		exchWebService.oofSettings.intOofSettings = aOofSettings;

		exchWebService.commonFunctions.LOG("intern:"+exchWebService.oofSettings.intOofSettings.internalReply);
		exchWebService.commonFunctions.LOG("extern:"+exchWebService.oofSettings.intOofSettings.externalReply);

		document.getElementById("exchWebService-load-error-message").value = exchWebService.commonFunctions.getString("calExchangeCalendar", "ecLoadedOofSettings", [], "exchangecalendar");	
	
		document.getElementById("exchWebService_oofSettings_dialog").buttons = "accept,cancel";

		document.getElementById("vbox-exchWebService-oof-settings").disabled = false;

		document.getElementById("exchWebService-oof-status").value = (aOofSettings.oofState == "Disabled") ? "Disabled" : "Enabled";

		document.getElementById("exchWebService-oof-scheduled").checked = (aOofSettings.oofState == "Scheduled");

		if (aOofSettings.startTime) {
			document.getElementById("exchWebService-oof-startdate").year = aOofSettings.startTime.year;
			document.getElementById("exchWebService-oof-startdate").month = aOofSettings.startTime.month;
			document.getElementById("exchWebService-oof-startdate").date = aOofSettings.startTime.day;

			document.getElementById("exchWebService-oof-starttime").hour = aOofSettings.startTime.hour;
			document.getElementById("exchWebService-oof-starttime").minute = aOofSettings.startTime.minute;
		}

		if (aOofSettings.endTime) {
			document.getElementById("exchWebService-oof-enddate").year = aOofSettings.endTime.year;
			document.getElementById("exchWebService-oof-enddate").month = aOofSettings.endTime.month;
			document.getElementById("exchWebService-oof-enddate").date = aOofSettings.endTime.day;

			document.getElementById("exchWebService-oof-endtime").hour = aOofSettings.endTime.hour;
			document.getElementById("exchWebService-oof-endtime").minute = aOofSettings.endTime.minute;
		}
		exchWebService.oofSettings.doScheduledChanged();

		document.getElementById("exchWebService-oof-externalaudience").value = aOofSettings.externalAudience;

		
		document.getElementById("exchWebService-oof-textbox-internal").value = exchWebService.oofSettings.intOofSettings.internalReply.replace(/\<br\>/g , "\n").replace(/\&nbsp\;/g," ");

		document.getElementById("exchWebService-oof-textbox-external").value = exchWebService.oofSettings.intOofSettings.externalReply.replace(/\<br\>/g , "\n").replace(/\&nbsp\;/g," ");
		

	},

	getOofSettingsError: function _getOofSettingsError(aGetUserOofSettingsRequest, aCode, aMsg)
	{
		document.getElementById("exchWebService-load-error-message").value = exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorLoadingOofSettings", [aMsg, aCode], "exchangecalendar");
	},

	doScheduledChanged: function _doScheduledChanged()
	{
		// Enable or disable time/date pickers
		document.getElementById("exchWebService-oof-startdate").disabled = (!document.getElementById("exchWebService-oof-scheduled").checked);
		document.getElementById("exchWebService-oof-starttime").disabled = (!document.getElementById("exchWebService-oof-scheduled").checked);
		document.getElementById("exchWebService-oof-enddate").disabled = (!document.getElementById("exchWebService-oof-scheduled").checked);
		document.getElementById("exchWebService-oof-endtime").disabled = (!document.getElementById("exchWebService-oof-scheduled").checked);
	},	

	setOofSettings: function _setOofSettings()
	{
		document.getElementById("exchWebService-load-error-message").value = exchWebService.commonFunctions.getString("calExchangeCalendar", "ecSavingOofSettings", [], "exchangecalendar");

		var oofState = "Disabled";
		if (document.getElementById("exchWebService-oof-status").value == "Enabled") {
			oofState = "Enabled";
			if (document.getElementById("exchWebService-oof-scheduled").checked) {
				oofState = "Scheduled";
			}
		}
	 
		var startTime = exchWebService.cal.createDateTime();
		startTime.resetTo(document.getElementById("exchWebService-oof-startdate").year,
				document.getElementById("exchWebService-oof-startdate").month,
				document.getElementById("exchWebService-oof-startdate").date,
				document.getElementById("exchWebService-oof-starttime").hour,
				document.getElementById("exchWebService-oof-starttime").minute,
				0,
				exchWebService.commonFunctions.ecDefaultTimeZone());
		startTime = startTime.getInTimezone(exchWebService.commonFunctions.ecUTC());

		var endTime = exchWebService.cal.createDateTime();
		endTime.resetTo(document.getElementById("exchWebService-oof-enddate").year,
				document.getElementById("exchWebService-oof-enddate").month,
				document.getElementById("exchWebService-oof-enddate").date,
				document.getElementById("exchWebService-oof-endtime").hour,
				document.getElementById("exchWebService-oof-endtime").minute,
				0,
				exchWebService.commonFunctions.ecDefaultTimeZone());
		endTime = endTime.getInTimezone(exchWebService.commonFunctions.ecUTC());

		var internalReply = this.intOofSettings.internalReply;
		var externalReply = this.intOofSettings.externalReply;
		
		internalReply = document.getElementById("exchWebService-oof-textbox-internal").value.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');		
		
		externalReply = document.getElementById("exchWebService-oof-textbox-external").value.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');


		var tmpObject = new erSetUserOofSettingsRequest(
			{user: exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecDomain", "null")+"\\"+exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecUser", "null"), 
			 mailbox: exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecMailbox", "null"),
			 serverUrl: exchWebService.commonFunctions.safeGetCharPref(this.calPrefs, "ecServer", "null"),
		
			 oofState : oofState,
			 externalAudience : document.getElementById("exchWebService-oof-externalaudience").value,
			 startTime : startTime,
			 endTime : endTime,
			 internalReply : internalReply,
			 externalReply : externalReply

			}, this.setOofSettingsOK, this.setOofSettingsError);
	},

	setOofSettingsOK: function _setOofSettingsOK(aGetUserOofSettingsRequest)
	{
		document.getElementById("exchWebService-load-error-message").value = exchWebService.commonFunctions.getString("calExchangeCalendar", "ecSavedOofSettings", [], "exchangecalendar");
		alert("Settings saved.");

		exchWebService.oofSettings.getOofSettings();

	},

	setOofSettingsError: function _setOofSettingsError(aGetUserOofSettingsRequest, aCode, aMsg)
	{
		document.getElementById("exchWebService-load-error-message").value = exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorSavingOofSettings", [aMsg, aCode], "exchangecalendar");
		alert("Error saving settings. Msg:"+aMsg+", Code:"+aCode);

		exchWebService.oofSettings.getOofSettings();

	},

}
