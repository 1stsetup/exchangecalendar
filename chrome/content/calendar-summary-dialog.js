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
 * Author: Deepak Kumar
 * email: deepk2u@gmail.com
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

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/erForewardItem.js");


if (! exchWebService) var exchWebService = {};


exchWebService.forewardEvent2 = {
	onForward : function _onForward()
	{	
		var args = window.arguments[0];
		var item = args.calendarEvent;
		item =item.clone();
		var calendar = item.calendar;
		var args = new Object();
		args.startTime = item.startDate;
		args.endTime = item.endDate;
		args.organizer = item.organizer;
		args.item = item;
		args.attendees =item.organizer;
		args.calendar =calendar;
		args.onOk = exchWebService.forewardEvent2.callOnOk;
		args.opener="exchWebService-onForward";
		window.openDialog("chrome://calendar/content/calendar-event-dialog-attendees.xul","_blank", "chrome,titlebar,modal,resizable",args);
		
	},	
	
	callOnOk : function(attendee,organizer,startTime,endTime){
		
		var args = window.arguments[0];
		var item = args.calendarEvent;
		var calendar = item.calendar;
		var calId = calendar.id;
		var calPrefs = Cc["@mozilla.org/preferences-service;1"]
		            .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+calId+".");
		
		var tmpObject = new erForewardItemRequest(
			{user: exchWebService.commonFunctions.safeGetCharPref(calPrefs, "ecDomain")+"\\"+exchWebService.commonFunctions.safeGetCharPref(calPrefs, "ecUser"), 
			mailbox: exchWebService.commonFunctions.safeGetCharPref(calPrefs, "ecMailbox"),
			serverUrl: exchWebService.commonFunctions.safeGetCharPref(calPrefs, "ecServer"), item: item, attendees: attendee, 
			changeKey :  item.getProperty("X-ChangeKey"), description : item.getProperty("description")}, 					
			exchWebService.forewardEvent2.erForewardItemRequestOK, exchWebService.forewardEvent2.erForewardItemRequestError);		
	},

	erForewardItemRequestOK : function _erForewardItemRequestOK(aForewardItemRequest, aResp)
	{
		alert(aResp);
	},

	erForewardItemRequestError: function _erForewardItemRequestError(aForewardItemRequest, aCode, aMsg)
	{
		alert(aCode+":"+aMsg);
	},

	onLoad: function _onLoad()
	{
		if (document.getElementById("calendar-event-summary-dialog")) {
			window.removeEventListener("load", exchWebService.forewardEvent2.onLoad, false);
			var args = window.arguments[0];
			var item = args.calendarEvent;
			var calendar = item.calendar;
			var tmpButtons = document.getElementById("calendar-event-summary-dialog").getAttribute("buttons");
			if (calendar.getProperty("exchWebService.offlineOrNotConnected")) {
				var tmpArray = tmpButtons.split(",");
				var newArray = [];
				for (var index in tmpArray) {
					if (tmpArray[index] != "extra1") {
						newArray.push(tmpArray[index]);
					}
				}
				document.getElementById("calendar-event-summary-dialog").buttons = newArray.join(",");
			}
			else {
				if ((item.calendar.type == "exchangecalendar") && (item.responseObjects.ForwardItem)) {
					document.getElementById("calendar-event-summary-dialog").buttons += ",extra1";
				}
			}
		}
	},
}

window.addEventListener("load", exchWebService.forewardEvent2.onLoad, false);

