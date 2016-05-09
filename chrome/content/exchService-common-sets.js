/*********************************************************************************
*  This file is part of Ericsson's Ews Provider. 
* Ericsson's Ews Provider is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.

*  Ericsson's Ews Provider is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.

*  You should have received a copy of the GNU General Public License
* along with Ericsson's Ews Provider.  If not, see <http://www.gnu.org/licenses/>.
***********************************************************************************/

var orig_openEventDialog=openEventDialog;

openEventDialog=function(calendarItem, calendar, mode, callback, job, initialDate) {
	
newOpenEventDialog(calendarItem, calendar, mode, callback, job, initialDate);

}

function newOpenEventDialog(calendarItem, calendar, mode, callback, job, initialDate) {
   let dlg = cal.findItemWindow(calendarItem);
    if (dlg) {
        dlg.focus();
        disposeJob(job);
        return;
    }

    // Set up some defaults
    mode = mode || "new";
    calendar = calendar || getSelectedCalendar();
    var calendars = getCalendarManager().getCalendars({});
    calendars = calendars.filter(isCalendarWritable);

    var isItemSupported;
    if (isToDo(calendarItem)) {
        isItemSupported = function isTodoSupported(aCalendar) {
            return (aCalendar.getProperty("capabilities.tasks.supported") !== false);
        };
    } else if (isEvent(calendarItem)) {
        isItemSupported = function isEventSupported(aCalendar) {
            return (aCalendar.getProperty("capabilities.events.supported") !== false);
        };
    }

    // Filter out calendars that don't support the given calendar item
    calendars = calendars.filter(isItemSupported);

    // Filter out calendar/items that we cannot write to/modify
    if (mode == "new") {
        calendars = calendars.filter(userCanAddItemsToCalendar);
    } else { /* modify */
        
        calendars = calendars.filter(function calendarCanModifyItems(aCalendar) {
            /* If the calendar is the item calendar, we check that the item
             * can be modified. If the calendar is NOT the item calendar, we
             * check that the user can remove items from that calendar and
             * add items to the current one.
             */
            return (((calendarItem.calendar != aCalendar)
                     && userCanDeleteItemsFromCalendar(calendarItem.calendar)
                     && userCanAddItemsToCalendar(aCalendar))
                    || ((calendarItem.calendar == aCalendar)
                        && userCanModifyItem(calendarItem)));
        });
    }

    if (mode == "new"
        && (!isCalendarWritable(calendar)
            || !userCanAddItemsToCalendar(calendar)
            || !isItemSupported(calendar))) {
        if (calendars.length < 1) {
            // There are no writable calendars or no calendar supports the given
            // item. Don't show the dialog.
            disposeJob(job);
            return;
        } else  {
            // Pick the first calendar that supports the item and is writable
            calendar = calendars[0];
            if (calendarItem) {
                // XXX The dialog currently uses the items calendar as a first
                // choice. Since we are shortly before a release to keep
                // regression risk low, explicitly set the item's calendar here.
                calendarItem.calendar = calendars[0];
            }
        }
    }

    // Setup the window arguments
    var args = new Object();
    args.calendarEvent = calendarItem;
    args.calendar = calendar;
    args.mode = mode;
    args.onOk = callback;
    args.job = job;
    args.initialStartDateValue = (initialDate || getDefaultStartDate());

    // this will be called if file->new has been selected from within the dialog
    args.onNewEvent = function(calendar) {
        createEventWithDialog(calendar, null, null);
    };
    args.onNewTodo = function(calendar) {
        createTodoWithDialog(calendar);
    };

    // the dialog will reset this to auto when it is done loading.
    window.setCursor("wait");

    // ask the provide if this item is an invitation. if this is the case
    // we'll open the summary dialog since the user is not allowed to change
    // the details of the item.
    let wrappedCalendar = cal.wrapInstance(calendar, Components.interfaces.calISchedulingSupport);
    let isInvitation = wrappedCalendar && wrappedCalendar.isInvitation(calendarItem);

    // open the dialog modeless
    let url;
    if (isCalendarWritable(calendar)
        && (mode == "new"
            || (mode == "modify" && !isInvitation && userCanModifyItem((calendarItem))))) {
        url = "chrome://calendar/content/calendar-event-dialog.xul";
    } else {
        url = "chrome://calendar/content/calendar-summary-dialog.xul";
    }
 
    if( calendarItem.itemClass == "IPM.Note" )   url = "chrome://exchangecalendar/content/exchService-followup-event-dialog.xul";
    
    // reminder: event dialog should not be modal (cf bug 122671)
    var features;
    // keyword "dependent" should not be used (cf bug 752206)
    if (Services.appinfo.OS == "WINNT") {
        features = "chrome,titlebar,resizable";
    } else if (Services.appinfo.OS == "Darwin") {
        features = "chrome,titlebar,resizable,minimizable=no";
    } else {
        // All other targets, mostly Linux flavors using gnome.
        features = "chrome,titlebar,resizable,minimizable=no,dialog=no";
    }

    openDialog(url, "_blank", features, args);
}

