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
 * ***** BEGIN LICENSE BLOCK *****/

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://calendar/modules/calUtils.jsm");

if (! exchWebService) var exchWebService = {};

exchWebService.taskDelegation = {

	_initialized: false,

	onLoad: function _onLoad()
	{
		if (this._initialized) return;

		if (document.getElementById("calendar-task-tree")) {
			this._initialized = true;
			// nuke the onload, or we get called every time there's
			// any load that occurs
			document.removeEventListener("load", exchWebService.taskDelegation.onLoad, false);
			document.getElementById("calendar-task-tree").addEventListener("select", exchWebService.taskDelegation.onSelect, true);
		}
	},

	onSelect: function _onSelect()
	{
		var task = document.getElementById("calendar-task-tree").currentTask;
		if (task) {
			if (task.hasProperty("exchWebService-Owner")) {
				document.getElementById("exchWebService-task-delegation-owner-label").value = task.getProperty("exchWebService-Owner")+"|"+task.getProperty("exchWebService-PidLidTaskAccepted")+"|"+task.getProperty("exchWebService-PidLidTaskAcceptanceState")+"|"+task.getProperty("exchWebService-PidLidTaskHistory")+"|";
				document.getElementById("exchWebService-task-delegation-owner").hidden = false;

				// Hide the buttons if we are the Owner.
				if (task.getProperty("exchWebService-PidLidTaskAcceptanceState") != "NoMatch") {
					document.getElementById("exchWebService-task-delegation-accept-button").hidden = true;
					document.getElementById("exchWebService-task-delegation-decline-button").hidden = true;
					document.getElementById("exchWebService-task-delegation-toolbar").hidden = true;
				}
				else {
					document.getElementById("exchWebService-task-delegation-toolbar").hidden = false;
					if (task.getProperty("exchWebService-PidLidTaskHistory") == 5) {
						document.getElementById("exchWebService-task-delegation-accept-button").hidden = false;
						document.getElementById("exchWebService-task-delegation-decline-button").hidden = false;
						document.getElementById("exchWebService-task-delegation-toolbar").setAttribute("defaultset", "exchWebService-task-delegation-accept-button, exchWebService-task-delegation-decline-button");
					}
					else {
						document.getElementById("exchWebService-task-delegation-accept-button").hidden = true;
						document.getElementById("exchWebService-task-delegation-toolbar").setAttribute("defaultset", "exchWebService-task-delegation-decline-button");
					}
				}
				document.getElementById("exchWebService-task-delegation-toolbar").hidden = true; // Temporary until we get it fixed.
				document.getElementById("exchWebService-task-delegation-toolbar").setAttribute("defaultset", ""); // Temporary until we get it fixed.
			}
			else {
				document.getElementById("exchWebService-task-delegation-owner").hidden = true;
			}

			if (task.hasProperty("exchWebService-Delegator")) {
				document.getElementById("exchWebService-task-delegation-delegator-label").value = task.getProperty("exchWebService-Delegator");
				document.getElementById("exchWebService-task-delegation-delegator").hidden = false;
			}
			else {
				document.getElementById("exchWebService-task-delegation-delegator").hidden = true;
			}

			if (task.hasProperty("exchWebService-PidLidTaskLastUpdate")) {
				let dtFormat = Cc["@mozilla.org/calendar/datetime-formatter;1"]
					             .getService(Ci.calIDateTimeFormatter);

				var tmpDate = cal.fromRFC3339(task.getProperty("exchWebService-PidLidTaskLastUpdate"), exchWebService.commonFunctions.ecTZService().UTC).getInTimezone(exchWebService.commonFunctions.ecDefaultTimeZone());

				var lastChange = task.getProperty("exchWebService-PidLidTaskHistory");
				switch (lastChange) {
				case "4": lastChange = exchWebService.commonFunctions.getString("calExchangeCalendar", "exchWebService.PidLidTaskHistory.duedate.changed", [], "exchangecalendar"); break;
				case "3": lastChange = exchWebService.commonFunctions.getString("calExchangeCalendar", "exchWebService.PidLidTaskHistory.some.property.changed", [], "exchangecalendar"); break;
				case "1": lastChange = exchWebService.commonFunctions.getString("calExchangeCalendar", "exchWebService.PidLidTaskHistory.accepted", [task.getProperty("exchWebService-Owner")], "exchangecalendar"); break;
				case "2": lastChange = exchWebService.commonFunctions.getString("calExchangeCalendar", "exchWebService.PidLidTaskHistory.rejected", [task.getProperty("exchWebService-Owner")], "exchangecalendar"); break;
				case "5": lastChange = exchWebService.commonFunctions.getString("calExchangeCalendar", "exchWebService.PidLidTaskHistory.assigned", [task.getProperty("exchWebService-Owner")], "exchangecalendar"); break;
				case "0": lastChange = exchWebService.commonFunctions.getString("calExchangeCalendar", "exchWebService.PidLidTaskHistory.no.changes", [], "exchangecalendar"); break;
				}

				document.getElementById("exchWebService-task-delegation-lastUpdateDate-label").value = dtFormat.formatDateTime(tmpDate)+" "+lastChange;
				document.getElementById("exchWebService-task-delegation-lastUpdateDate").hidden = false;
			}
			else {
				document.getElementById("exchWebService-task-delegation-lastUpdateDate").hidden = true;
			}
		}
	},

	onAccept: function _onAccept()
	{
		exchWebService.commonFunctions.LOG("onAccept");
		var task = document.getElementById("calendar-task-tree").currentTask;
		if (task) {
			var newTask = task.clone();
			newTask.setProperty("exchWebService-PidLidTaskLastUpdate", cal.toRFC3339(cal.now()) );
			newTask.setProperty("exchWebService-PidLidTaskHistory", "1")
			newTask.setProperty("exchWebService-PidLidTaskAccepted", "true")
			task.calendar.modifyItem(newTask, task, null);
		}
	},

	onReject: function _onReject()
	{
		exchWebService.commonFunctions.LOG("onReject");
		var task = document.getElementById("calendar-task-tree").currentTask;
		if (task) {
			var newTask = task.clone();
			newTask.setProperty("exchWebService-PidLidTaskLastUpdate", cal.toRFC3339(cal.now()) );
			newTask.setProperty("exchWebService-PidLidTaskHistory", "2")
			newTask.setProperty("exchWebService-PidLidTaskAccepted", "true")
			task.calendar.modifyItem(newTask, task, null);
		}
	},

}

document.addEventListener("load", exchWebService.taskDelegation.onLoad, true);

