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
Cu.import("resource://gre/modules/Services.jsm");

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
		if ((cal.isEvent(aItem)) && (aCalendar.type == "exchangecalendar")) {
			if (!aItem.className) {
				var newItem = Cc["@1st-setup.nl/exchange/calendarevent;1"]
						.createInstance(Ci.mivExchangeEvent);
				newItem.cloneToCalEvent(aItem);
				aItem = newItem;
			}
		}

		if ((!cal.isEvent(aItem)) && (aCalendar.type == "exchangecalendar")) {
			// Save extra exchange fields to item.
			if (!aItem.className) {
				var newItem = Cc["@1st-setup.nl/exchange/calendartodo;1"]
						.createInstance(Ci.mivExchangeTodo);
				newItem.cloneToCalEvent(aItem);
				aItem = newItem;
			}

			aItem.totalWork = this._document.getElementById("exchWebService-totalWork-count").value;
			aItem.actualWork = this._document.getElementById("exchWebService-actualWork-count").value;
			aItem.mileage = this._document.getElementById("exchWebService-mileage-count").value;
			aItem.billingInformation = this._document.getElementById("exchWebService-billingInformation-count").value;
			aItem.companies = this._document.getElementById("exchWebService-companies-count").value;
		}

try{
		if (this.newItem) {
			aItem.bodyType = "HTML";
			aItem.body = this._document.getElementById("exchWebService-body-editor").content;
		}
		else {
			if (aItem.bodyType == "HTML") {
				aItem.body = this._document.getElementById("exchWebService-body-editor").content;
			}
		}
}catch(err){dump("Error saving content\n");}

		if (this._oldCallback) {
			this._oldCallback(aItem, aCalendar, aOriginalItem, aIsClosing);
		}
	},

	onLoad: function _onLoad()
	{
		//onLoad();
		 this._document.getElementById("exchWebService-body-editor").setAttribute("scrollbars","yes");
 		if (this._window.arguments[0].calendarEvent.calendar.type != "exchangecalendar") {
			if (this._document.getElementById("item-description")) {
				this._document.getElementById("item-description").hidden = false;
			}
			if (this._document.getElementById("exchWebService-body-editor")) {
				this._document.getElementById("exchWebService-body-editor").hidden = true;
			}
			return;
		}

		if (this._initialized) return;
		this._oldCallback = this._window.onAcceptCallback;
		var self = this;
		this._window.onAcceptCallback = function(aItem, aCalendar, aOriginalItem, aIsClosing) { self.onAcceptCallback(aItem, aCalendar, aOriginalItem, aIsClosing); };

		if (this._document.getElementById("todo-entrydate")) {
			this._initialized = true;

			var args = this._window.arguments[0];
			var item = args.calendarEvent;
			this.updateScreen(item, item.calendar);
			//Cc["@mozilla.org/consoleservice;1"]
	                //     .getService(Ci.nsIConsoleService).logStringMessage(item.exchangeXML);

//dump("event.dialog: item.exchangeXML:"+item.exchangeXML+"\n");

			if ((item.bodyType === undefined) || (item.bodyType == "HTML")) {
				if (this._document.getElementById("item-description")) {
					this._document.getElementById("item-description").hidden = true;
				}
				if (this._document.getElementById("exchWebService-body-editor")) {
					this._document.getElementById("exchWebService-body-editor").hidden = false;
					if (item.bodyType !== undefined) {
						this._document.getElementById("exchWebService-body-editor").content = item.body;
					}
					else {
						this.newItem = true;
						if (item.body) {
							if ((item.body.indexOf("<BODY>") > -1) || (item.body.indexOf("<body>") > -1)) {
								this._document.getElementById("exchWebService-body-editor").content = item.body;
							}
							else {
								this._document.getElementById("exchWebService-body-editor").content = this.globalFunctions.fromText2HTML(item.getProperty("DESCRIPTION"));
							}
						}
						else {
							this._document.getElementById("exchWebService-body-editor").content = this.globalFunctions.fromText2HTML(item.getProperty("DESCRIPTION"));
						}
					}
				}
			}
			else {
				if (this._document.getElementById("item-description")) {
					this._document.getElementById("item-description").hidden = false;
				}
				if (this._document.getElementById("exchWebService-body-editor")) {
					this._document.getElementById("exchWebService-body-editor").hidden = true;
				}
			}
		}
	},

	updateScreen: function _updateScreen(aItem, aCalendar)
	{
		var item = aItem;

		if ((!cal.isEvent(item)) && (aCalendar.type == "exchangecalendar")) {

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

			this._document.getElementById("exchWebService-owner-row").setAttribute("collapsed", "false");
			this._document.getElementById("exchWebService-details-separator").hidden = false;

			if (item.className) {
				this._document.getElementById("exchWebService-totalWork-count").value = item.totalWork;
				this._document.getElementById("exchWebService-actualWork-count").value = item.actualWork;
				this._document.getElementById("exchWebService-mileage-count").value = item.mileage;
				this._document.getElementById("exchWebService-billingInformation-count").value = item.billingInformation;
				this._document.getElementById("exchWebService-companies-count").value = item.companies;
			}

			this._document.getElementById("event-grid-location-row").hidden = true;

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
			
			this._document.getElementById("timezone-starttime").hidden = true;
			this._document.getElementById("timezone-endtime").hidden = true;

			if (this._document.getElementById("item-repeat")) {
				this._document.getElementById("item-repeat").addEventListener("command", function() { self.updateRepeat(); }, false);
			}
			//this.updateTime();
			this.updateRepeat();
		}
		else {
			try {
				this._document.getElementById("exchWebService-details-row1").setAttribute("collapsed", "true");
				this._document.getElementById("exchWebService-details-row2").setAttribute("collapsed", "true");
				this._document.getElementById("exchWebService-details-row3").setAttribute("collapsed", "true");
			}
			catch (ex) {}

			this._document.getElementById("exchWebService-owner-row").setAttribute("collapsed", "true");
			this._document.getElementById("exchWebService-details-separator").hidden = true;

			this._document.getElementById("event-grid-location-row").hidden = false;
			this._document.getElementById("event-grid-recurrence-row").hidden=false;

			// Clear reminder select list for todo
			this._document.getElementById("reminder-none-separator").hidden = false;
			this._document.getElementById("reminder-0minutes-menuitem").hidden = false;
			this._document.getElementById("reminder-5minutes-menuitem").hidden = false;
			this._document.getElementById("reminder-15minutes-menuitem").hidden = false;
			this._document.getElementById("reminder-30minutes-menuitem").hidden = false;
			this._document.getElementById("reminder-minutes-separator").hidden = false;
			this._document.getElementById("reminder-1hour-menuitem").hidden = false;
			this._document.getElementById("reminder-2hours-menuitem").hidden = false;
			this._document.getElementById("reminder-12hours-menuitem").hidden = false;
			this._document.getElementById("reminder-hours-separator").hidden = false;
			this._document.getElementById("reminder-1day-menuitem").hidden = false;
			this._document.getElementById("reminder-2days-menuitem").hidden = false;
			this._document.getElementById("reminder-1week-menuitem").hidden = false;

			this._document.getElementById("timezone-starttime").hidden = false;
			this._document.getElementById("timezone-endtime").hidden = false;

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
	},

	selectedCalendarChanged: function _selectedCalendarChanged(aMenuList)
	{
		updateCalendar();

		this.updateScreen(this._window.calendarItem, getCurrentCalendar());
	},

}

if (!exchWebService) var exchWebService = {};

exchWebService.eventDialog = {

    _initialized: false,
    onLoad: function _onLoad() {
        if (this._initialized) return;

        exchWebService.eventDialog.updateAttendees();
	},


    updateAttendees: function _updateAttendees() {
        let attendeeRow = document.getElementById("event-grid-attendee-row");
        attendeeRow.setAttribute('collapsed', 'true');
        let attendeeRow2 = document.getElementById("event-grid-attendee-row-2");
        let optAttendeeRow = document.getElementById("event-grid-attendee-row-4");
        let reqAttendeeRow = document.getElementById("event-grid-attendee-row-3");
        if (window.attendees && window.attendees.length > 0) {
            if (isEvent(window.calendarItem)) { // sending email invitations currently only supported for events
                attendeeRow2.removeAttribute('collapsed');
            } else {
                attendeeRow2.setAttribute('collapsed', 'true');
            }

            let attendeeNames = [];
            let attendeeEmails = [];
            let reqAttendeeNames = [];
            let reqAttendeeEmails = [];
            let optAttendeeNames = [];
            let optAttendeeEmails = [];
            let numAttendees = window.attendees.length;
            let emailRE = new RegExp("^mailto:(.*)", "i");
            for (let i = 0; i < numAttendees; i++) {
                let attendee = window.attendees[i];
                let name = attendee.commonName;
                if (attendee.role == "OPT-PARTICIPANT") {
                    if (name && name.length) {
                        optAttendeeNames.push(name);
                        let email = attendee.id;
                        if (email && email.length) {
                            if (emailRE.test(email)) {
                                name += ' <' + RegExp.$1 + '>';
                            } else {
                                name += ' <' + email + '>';
                            }
                            optAttendeeEmails.push(name);
                        }
                    } else if (attendee.id && attendee.id.length) {
                        let email = attendee.id;
                        if (emailRE.test(email)) {
                            optAttendeeNames.push(RegExp.$1);
                        } else {
                            optAttendeeNames.push(email);
                        }
                    } else {
                        continue;
                    }

                } else {

                    if (name && name.length) {
                        reqAttendeeNames.push(name);
                        let email = attendee.id;
                        if (email && email.length) {
                            if (emailRE.test(email)) {
                                name += ' <' + RegExp.$1 + '>';
                            } else {
                                name += ' <' + email + '>';
                            }
                            reqAttendeeEmails.push(name);
                        }
                    } else if (attendee.id && attendee.id.length) {
                        let email = attendee.id;
                        if (emailRE.test(email)) {
                            reqAttendeeNames.push(RegExp.$1);
                        } else {
                            reqAttendeeNames.push(email);
                        }
                    } else {
                        continue;
                    }

                }
            }
            if (reqAttendeeNames.length > 0) {
                reqAttendeeRow.removeAttribute('collapsed');
            } else {
                reqAttendeeRow.setAttribute('collapsed', 'true');
            }
            if (optAttendeeNames.length > 0) {
                optAttendeeRow.removeAttribute('collapsed');
            } else {
                optAttendeeRow.setAttribute('collapsed', 'true');
            }

            let attendeeList = document.getElementById("attendee-list");
            let reqAttendeeList = document.getElementById("req-attendee-list-3");
            let optAttendeeList = document.getElementById("opt-attendee-list-4");

            let callback = function func() {
                reqAttendeeList.setAttribute('value', reqAttendeeNames.join(', '));
                reqAttendeeList.setAttribute('tooltiptext', reqAttendeeEmails.join(', '));
                optAttendeeList.setAttribute('value', optAttendeeNames.join(', '));
                optAttendeeList.setAttribute('tooltiptext', optAttendeeEmails.join(', '));
            };
            setTimeout(callback, 1);
        } else {

            attendeeRow2.setAttribute('collapsed', 'true');
            optAttendeeRow.setAttribute('collapsed', 'true');
            reqAttendeeRow.setAttribute('collapsed', 'true');
        }
    },

    editAttendees: function _editAttendees() {
        let savedWindow = window;
        let calendar = getCurrentCalendar();

        var callback = function (attendees, organizer, startTime, endTime) {
            savedWindow.attendees = attendees;
            if (organizer) {
                // In case we didn't have an organizer object before we
                // added attendees to our event we take the one created
                // by the 'invite attendee'-dialog.
                if (savedWindow.organizer) {
                    // The other case is that we already had an organizer object
                    // before we went throught the 'invite attendee'-dialog. In that
                    // case make sure we don't carry over attributes that have been
                    // set to their default values by the dialog but don't actually
                    // exist in the original organizer object.
                    if (!savedWindow.organizer.id) {
                        organizer.id = null;
                    }
                    if (!savedWindow.organizer.role) {
                        organizer.role = null;
                    }
                    if (!savedWindow.organizer.participationStatus) {
                        organizer.participationStatus = null;
                    }
                    if (!savedWindow.organizer.commonName) {
                        organizer.commonName = null;
                    }
                }
                savedWindow.organizer = organizer;
            }
            var duration = endTime.subtractDate(startTime);
            startTime = startTime.clone();
            endTime = endTime.clone();
            var kDefaultTimezone = calendarDefaultTimezone();
            gStartTimezone = startTime.timezone;
            gEndTimezone = endTime.timezone;
            gStartTime = startTime.getInTimezone(kDefaultTimezone);
            gEndTime = endTime.getInTimezone(kDefaultTimezone);
            gItemDuration = duration;
            exchWebService.eventDialog.updateAttendees();
            updateDateTime();
            updateAllDay();
            if (isAllDay != gStartTime.isDate) {
                setShowTimeAs(gStartTime.isDate)
            }
        };

        var startTime = gStartTime.getInTimezone(gStartTimezone);
        var endTime = gEndTime.getInTimezone(gEndTimezone);

        var isAllDay = getElementValue("event-all-day", "checked");
        if (isAllDay) {
            startTime.isDate = true;
            endTime.isDate = true;
            endTime.day += 1;
        } else {
            startTime.isDate = false;
            endTime.isDate = false;
        }

        var menuItem = document.getElementById('options-timezone-menuitem');
        var displayTimezone = true;
        if( menuItem != null)
            displayTimezone = menuItem.getAttribute('checked') == 'true';

        var args = new Object();
        args.startTime = startTime;
        args.endTime = endTime;
        args.displayTimezone = displayTimezone;
        args.attendees = window.attendees;
        args.organizer = window.organizer && window.organizer.clone();
        args.calendar = calendar;
        args.item = window.calendarItem;
        args.onOk = callback;
        args.fbWrapper = window.fbWrapper;

        // open the dialog modally
        openDialog(
            "chrome://calendar/content/calendar-event-dialog-attendees.xul",
            "_blank",
            "chrome,titlebar,modal,resizable",
            args);
    }
}

window.addEventListener("load", exchWebService.eventDialog.onLoad, false);


var tmpEventDialog = new exchEventDialog(document, window);
window.addEventListener("load", function () { window.removeEventListener("load",arguments.callee,false); tmpEventDialog.onLoad(); }, true);

