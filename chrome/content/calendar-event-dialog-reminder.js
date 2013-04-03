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
var Cu = Components.utils;
var Ci = Components.interfaces;
var Cc = Components.classes;

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://calendar/modules/calUtils.jsm");

if (! exchWebService) var exchWebService = {};

exchWebService.changeCalendarPropertiesReminder={

	onLoad : function _onLoad(){
		window.removeEventListener("load", exchWebService.changeCalendarPropertiesReminder.onLoad, false);

		if ((window.arguments[0].item.className) && (window.arguments[0].item.className = "mivExchangeTodo")) {
			document.getElementById("reminder-relative-box").hidden = true;

			document.getElementById("reminder-relative-radio").selected = false;
			document.getElementById("reminder-relative-radio").disabled = true;

			document.getElementById("reminder-absolute-radio").selected = true;
			document.getElementById("reminder-absolute-radio").hidden = true;
		}

		if ((window.arguments[0].item.className) && ((window.arguments[0].item.className = "mivExchangeTodo") || (window.arguments[0].item.className = "mivExchangeEvent"))) {
			document.getElementById("reminder-relative-box").hidden = false;
			document.getElementById("reminder-relative-radio").disabled = false;
			document.getElementById("reminder-absolute-radio").hidden = false;
			document.getElementById("reminder-actions-caption").hidden = true;
			document.getElementById("reminder-actions-menulist").hidden = true;
		}
	},

	onNewReminder: function _onNewReminder() {
		if ((window.arguments[0].item.className) && (window.arguments[0].item.className = "mivExchangeTodo")) {
			let itemType = (isEvent(window.arguments[0].item) ? "event" : "todo");
			let listbox = document.getElementById("reminder-listbox");

			let reminder = cal.createAlarm();
			let alarmlen = getPrefSafe("calendar.alarms." + itemType + "alarmlen", 15);

			// Default is an absolute DISPLAY alarm, |alarmlen| minutes before the event.
			// If DISPLAY is not supported by the provider, then pick the provider's
			// first alarm type.
			var absDate = document.getElementById("reminder-absolute-date");
			reminder.related = reminder.ALARM_RELATED_ABSOLUTE;
			reminder.alarmDate = cal.jsDateToDateTime(absDate.value,
		                                              window.arguments[0].timezone);
			//reminder.offset = 0;
			if ("DISPLAY" in allowedActionsMap) {
				reminder.action = "DISPLAY";
			} else {
				let calendar = window.arguments[0].calendar
				let actions = calendar.getProperty("capabilities.alarms.actionValues") || [];
				reminder.action = actions[0];
			}

			// Set up the listbox
			let listitem = setupListItem(null, reminder, window.arguments[0].item);
			listbox.appendChild(listitem);
			listbox.selectItem(listitem);

			// Since we've added an item, its safe to always enable the button
			enableElement("reminder-remove-button");

			// Set up the enabled state and max reminders
			setupRadioEnabledState();
			setupMaxReminders();
		}
		else {
			onNewReminder();
		}

		if ((window.arguments[0].item.className) && ((window.arguments[0].item.className = "mivExchangeTodo") || (window.arguments[0].item.className = "mivExchangeEvent"))) {
			document.getElementById("reminder-new-button").enabled = false;
		}
	},

}
window.addEventListener("load", exchWebService.changeCalendarPropertiesReminder.onLoad, true);
