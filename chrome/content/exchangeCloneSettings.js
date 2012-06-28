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
 * -- Exchange 2007/2010 Contacts.
 * -- For Thunderbird.
 *
 * Author: Michel Verbraak (info@1st-setup.nl)
 * Website: http://www.1st-setup.nl/wordpress/?page_id=xx
 * email: exchangecontacts@extensions.1st-setup.nl
 *
 *
 * ***** BEGIN LICENSE BLOCK *****/
var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Cu.import("resource://exchangecalendar/ecFunctions.js");

//Cu.import("resource://calendar/modules/calUtils.jsm");

if (! exchWebService) var exchWebService = {};

exchWebService.exchangeCloneSettings = {

	checkRequired: function _checkRequired()
	{
	    let canAdvance = true;
	    let vbox = document.getElementById('exchWebService-exchange-settings');
	    if (vbox) {
		let eList = vbox.getElementsByAttribute('required', 'true');
		for (let i = 0; i < eList.length && canAdvance; ++i) {
		    canAdvance = (eList[i].value != "");
		}

		if (canAdvance) {
			document.getElementById("exchWebService_CloneSettings_dialog").buttons = "accept,cancel";
		}
		else {
			document.getElementById("exchWebService_CloneSettings_dialog").buttons = "cancel";
		}
	    }

	},

	onLoad: function _onLoad()
	{
		var calId = window.arguments[0].calendar.id;
		document.getElementById("exchWebService_clone_description").value = window.arguments[0].calendar.name+" (copy)";
		exchWebServicesLoadExchangeSettingsByCalId(calId);
	},

	onSave: function _onSave()
	{
		var oldCalId = window.arguments[0].calendar.id;

		// Clone the Calendar settings to a new cal id.
		var newCalId = exchWebService.commonFunctions.copyCalendarSettings(oldCalId);

		// Save settings in dialog to new cal id.
		exchWebServicesSaveExchangeSettingsByCalId(newCalId);

		// Save the description/name for the calendar and create a new unique uri.
		var toCalPrefs = Cc["@mozilla.org/preferences-service;1"]
		            .getService(Ci.nsIPrefService)
			    .getBranch("calendar.registry."+newCalId+".");

		toCalPrefs.setCharPref("name", document.getElementById("exchWebService_clone_description").value);
		toCalPrefs.setCharPref("uri", "https://auto/"+newCalId);

		// Store the new cal id for the calling process of this dialog.
		window.arguments[0].newCalId = newCalId;

		window.arguments[0].answer = "saved";

		Cc["@mozilla.org/preferences-service;1"]
		                    .getService(Ci.nsIPrefService).savePrefFile(null);
		return true;
	},

}
