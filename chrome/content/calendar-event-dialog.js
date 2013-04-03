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

Cu.import("resource://calendar/modules/calUtils.jsm");

function exchEventDialog(aDocument, aWindow)
{
	this._document = aDocument;
	this._window = aWindow;

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
}

exchEventDialog.prototype = {

	_initialized: false,
	_oldCallback: null,

	onAcceptCallback: function _onAcceptCallback(aItem, aCalendar, aOriginalItem, aIsClosing)
	{
//		if (aItem.className == "mivExchangeTodo") {
		if ((!cal.isEvent(aItem)) && (aCalendar.type == "exchangecalendar")) {
			// Save extra exchange fields to item.
			aItem.totalWork = this._document.getElementById("exchWebService-totalWork-count").value;
			aItem.actualWork = this._document.getElementById("exchWebService-actualWork-count").value;
			aItem.mileage = this._document.getElementById("exchWebService-mileage-count").value;
			aItem.billingInformation = this._document.getElementById("exchWebService-billingInformation-count").value;
			aItem.companies = this._document.getElementById("exchWebService-companies-count").value;
		}

		if (this._oldCallback) {
			this._oldCallback(aItem, aCalendar, aOriginalItem, aIsClosing);
		}
	},

	onLoad: function _onLoad()
	{
		onLoad();

		if (this._initialized) return;

		if (this._document.getElementById("todo-entrydate")) {
			this._initialized = true;

			this._oldCallback = this._window.onAcceptCallback;
			var self = this;
			this._window.onAcceptCallback = function(aItem, aCalendar, aOriginalItem, aIsClosing) { self.onAcceptCallback(aItem, aCalendar, aOriginalItem, aIsClosing); };

			var args = this._window.arguments[0];
			var item = args.calendarEvent;
			if ((!cal.isEvent(item)) && (item.calendar.type == "exchangecalendar")) {

				var ownerLabel = this._document.getElementById("exchWebService-owner-label");
				if (ownerLabel) {
					ownerLabel.value = item.owner;
				}

				try {
					this._document.getElementById("exchWebService-details-row1").removeAttribute("collapsed");
					this._document.getElementById("exchWebService-details-row2").removeAttribute("collapsed");
					this._document.getElementById("exchWebService-details-row3").removeAttribute("collapsed");
				}
				catch (ex) {}

				this._document.getElementById("exchWebService-owner-hbox").hidden = false;
				this._document.getElementById("exchWebService-details-separator").hidden = false;

				this._document.getElementById("exchWebService-totalWork-count").value = item.totalWork;
				this._document.getElementById("exchWebService-actualWork-count").value = item.actualWork;
				this._document.getElementById("exchWebService-mileage-count").value = item.mileage;
				this._document.getElementById("exchWebService-billingInformation-count").value = item.billingInformation;
				this._document.getElementById("exchWebService-companies-count").value = item.companies;

				// Clear reminder select list for todo
				this._document.getElementById("reminder-none-separator").hidden = true;
				this._document.getElementById("reminder-0minutes-menuitem").hidden = true;
				this._document.getElementById("reminder-5minutes-menuitem").hidden = true;
				this._document.getElementById("reminder-15minutes-menuitem").hidden = true;
				this._document.getElementById("reminder-30minutes-menuitem").hidden = true;
				this._document.getElementById("reminder-minutes-separator").hidden = true;
				this._document.getElementById("reminder-1hour-menuitem").hidden = true;
				this._document.getElementById("reminder-2hours-menuitem").hidden = true;
				this._document.getElementById("reminder-12hours-menuitem").hidden = true;
				this._document.getElementById("reminder-hours-separator").hidden = true;
				this._document.getElementById("reminder-1day-menuitem").hidden = true;
				this._document.getElementById("reminder-2days-menuitem").hidden = true;
				this._document.getElementById("reminder-1week-menuitem").hidden = true;
				
				var tmpDatePicker = this._document.createElement("datepicker");
				tmpDatePicker.setAttribute("type","popup");
				tmpDatePicker.setAttribute("id","todo-entrydate");
				tmpDatePicker.setAttribute("value",this._document.getElementById("todo-entrydate").value);
				tmpDatePicker.setAttribute("onchange","dateTimeControls2State(true);");
				tmpDatePicker.addEventListener("change", function() { self.updateTime(); }, false);
				if (!this._document.getElementById("todo-has-entrydate").checked) {
					tmpDatePicker.setAttribute("disabled","true");
				}
				this._document.getElementById("event-grid-startdate-picker-box").replaceChild(tmpDatePicker, this._document.getElementById("todo-entrydate"));

				var tmpDatePicker = this._document.createElement("datepicker");
				tmpDatePicker.setAttribute("type","popup");
				tmpDatePicker.setAttribute("id","todo-duedate");
				tmpDatePicker.setAttribute("value",this._document.getElementById("todo-duedate").value);
				tmpDatePicker.setAttribute("onchange","dateTimeControls2State(false);");
				tmpDatePicker.addEventListener("change", function() { self.updateTime(); }, false);
				if (!this._document.getElementById("todo-has-duedate").checked) {
					tmpDatePicker.setAttribute("disabled","true");
				}
				this._document.getElementById("event-grid-enddate-picker-box").replaceChild(tmpDatePicker, this._document.getElementById("todo-duedate"));

				this._document.getElementById("timezone-starttime").hidden = true;
				this._document.getElementById("timezone-endtime").hidden = true;

				if (this._document.getElementById("item-repeat")) {
					this._document.getElementById("item-repeat").addEventListener("command", function() { self.updateRepeat(); }, false);
				}
				this.updateTime();
				this.updateRepeat();
			}
		}
	},

	setRealEndtime: function _setRealEndTime()
	{
		this._document.getElementById("event-endtime").value = this._document.getElementById("todo-duedate").value; 
	},

	updateTime: function _updateTime()
	{
		//dump(" ===++ calendar-event-dialog.js\n");
		if (this._document.getElementById("todo-entrydate").dateValue) {
			this._document.getElementById("todo-entrydate").dateValue.setHours(12);
		}
		if (this._document.getElementById("todo-duedate").dateValue) {
			this._document.getElementById("todo-duedate").dateValue.setHours(13);
		}
	},

	// This will remove the time value from the repeat part and tooltip.
	updateRepeat: function _updateRepeat()
	{
		var repeatDetails = this._document.getElementById("repeat-details").childNodes;
		if (repeatDetails.length == 3) {
			this._document.getElementById("repeat-details").removeChild(repeatDetails[2]);
			var toolTip = repeatDetails[0].getAttribute("tooltiptext");
			var tmpArray = toolTip.split("\n");
			tmpArray.splice(2,1);
			repeatDetails[0].setAttribute("tooltiptext", tmpArray.join("\n"));
			repeatDetails[1].setAttribute("tooltiptext", tmpArray.join("\n"));
		}
	}


}

var tmpEventDialog = new exchEventDialog(document, window);
window.addEventListener("load", function _onLoad() { window.removeEventListener("load",arguments.callee,false); tmpEventDialog.onLoad(); }, true);

