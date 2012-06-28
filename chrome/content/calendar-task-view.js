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

//Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://calendar/modules/calUtils.jsm");

if (! exchWebService) var exchWebService = {};

exchWebService.eventDialog = {

	_initialized: false,
	onLoad: function _onLoad()
	{
		if (this._initialized) return;

exchWebService.commonFunctions.LOG(" !! exchWebService.eventDialog.onLoad 1");

		if (document.getElementById("todo-entrydate")) {
			this._initialized = true;
			// nuke the onload, or we get called every time there's
			// any load that occurs
exchWebService.commonFunctions.LOG(" !! exchWebService.eventDialog.onLoad 1a");
			window.removeEventListener("load", exchWebService.eventDialog.onLoad, false);

			var args = window.arguments[0];
			var item = args.calendarEvent;
			if ((!cal.isEvent(item)) && (item.calendar.type == "exchangecalendar")) {

exchWebService.commonFunctions.LOG(" !! exchWebService.eventDialog.onLoad 2");
				var tmpDatePicker = document.createElement("datepicker");
				tmpDatePicker.setAttribute("type","popup");
				tmpDatePicker.setAttribute("id","todo-entrydate");
				tmpDatePicker.setAttribute("value",document.getElementById("todo-entrydate").value);
				//tmpDatePicker.setAttribute("onchange","dateTimeControls2State(true);exchWebService.eventDialog.updateTime();");
				tmpDatePicker.addEventListener("change", exchWebService.eventDialog.updateTime, false);
				if (!document.getElementById("todo-has-entrydate").checked) {
					tmpDatePicker.setAttribute("disabled","true");
				}
				document.getElementById("event-grid-startdate-picker-box").replaceChild(tmpDatePicker, document.getElementById("todo-entrydate"));

exchWebService.commonFunctions.LOG(" !! exchWebService.eventDialog.onLoad 3");
				var tmpDatePicker = document.createElement("datepicker");
				tmpDatePicker.setAttribute("type","popup");
				tmpDatePicker.setAttribute("id","todo-duedate");
				tmpDatePicker.setAttribute("value",document.getElementById("todo-duedate").value);
				//tmpDatePicker.setAttribute("onchange","dateTimeControls2State(false);exchWebService.eventDialog.updateTime();");
				tmpDatePicker.addEventListener("change", exchWebService.eventDialog.updateTime, false);
				if (!document.getElementById("todo-has-duedate").checked) {
					tmpDatePicker.setAttribute("disabled","true");
				}
				document.getElementById("event-grid-enddate-picker-box").replaceChild(tmpDatePicker, document.getElementById("todo-duedate"));
exchWebService.commonFunctions.LOG(" !! exchWebService.eventDialog.onLoad 4");

				document.getElementById("link-image-top").hidden = true;
				document.getElementById("link-image-bottom").hidden = true;
				document.getElementById("keepduration-button").hidden = true;
				document.getElementById("timezone-starttime").hidden = true;
				document.getElementById("timezone-endtime").hidden = true;

				if (document.getElementById("item-repeat")) {
					document.getElementById("item-repeat").addEventListener("command", exchWebService.eventDialog.updateRepeat, false);
				}
				exchWebService.eventDialog.updateTime();
				exchWebService.eventDialog.updateRepeat();
			}
		}
exchWebService.commonFunctions.LOG(" !! exchWebService.eventDialog.onLoad 5");
	},

	updateTime: function _updateTime()
	{
		exchWebService.commonFunctions.LOG(" ===++ calendar-task-view.js");
		if (document.getElementById("todo-entrydate").dateValue) {
			document.getElementById("todo-entrydate").dateValue.setHours(12);
		}
		if (document.getElementById("todo-duedate").dateValue) {
			document.getElementById("todo-duedate").dateValue.setHours(13);
		}
	},

	// This will remove the time value from the repeat part and tooltip.
	updateRepeat: function _updateRepeat()
	{
		var repeatDetails = document.getElementById("repeat-details").childNodes;
		if (repeatDetails.length == 3) {
			document.getElementById("repeat-details").removeChild(repeatDetails[2]);
			var toolTip = repeatDetails[0].getAttribute("tooltiptext");
			var tmpArray = toolTip.split("\n");
			tmpArray.splice(2,1);
			repeatDetails[0].setAttribute("tooltiptext", tmpArray.join("\n"));
			repeatDetails[1].setAttribute("tooltiptext", tmpArray.join("\n"));
		}
	}

}

window.addEventListener("load", exchWebService.eventDialog.onLoad, false);

