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


//if (! exchWebService) var exchWebService = {};

function exchEventSummaryDialog(aDocument, aWindow)
{
	this._document = aDocument;
	this._window = aWindow;

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
}

exchEventSummaryDialog.prototype = {

//exchWebService.forewardEvent2 = {
	onForward : function _onForward()
	{	
		var args = this._window.arguments[0];
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
		args.onOk = this.callOnOk;
		args.opener="exchWebService-onForward";
		this._window.openDialog("chrome://calendar/content/calendar-event-dialog-attendees.xul","_blank", "chrome,titlebar,modal,resizable",args);
		
	},	
	
	callOnOk : function(attendee,organizer,startTime,endTime){
		
		var args = this._window.arguments[0];
		var item = args.calendarEvent;
		var calendar = item.calendar;
		var calId = calendar.id;
		var calPrefs = Cc["@mozilla.org/preferences-service;1"]
		            .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+calId+".");
		
		var self = this;
		var tmpObject = new erForewardItemRequest(
			{user: this.globalFunctions.safeGetCharPref(calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref(calPrefs, "ecUser"), 
			mailbox: this.globalFunctions.safeGetCharPref(calPrefs, "ecMailbox"),
			serverUrl: this.globalFunctions.safeGetCharPref(calPrefs, "ecServer"), item: item, attendees: attendee, 
			changeKey :  item.changeKey, description : item.getProperty("description")}, 					
			function(aForewardItemRequest, aResp){self.erForewardItemRequestOK(aForewardItemRequest, aResp);}, 
			function(aForewardItemRequest, aCode, aMsg){self.erForewardItemRequestError(aForewardItemRequest, aCode, aMsg);});		
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
		if (this._document.getElementById("calendar-event-summary-dialog")) {
			//this._window.removeEventListener("load", this.onLoad, false);
			var args = this._window.arguments[0];
			var item = args.calendarEvent;
			var calendar = item.calendar;
			var tmpButtons = this._document.getElementById("calendar-event-summary-dialog").getAttribute("buttons");
			if (calendar.getProperty("exchWebService.offlineOrNotConnected")) {
				var tmpArray = tmpButtons.split(",");
				var newArray = [];
				for (var index in tmpArray) {
					if (tmpArray[index] != "extra1") {
						newArray.push(tmpArray[index]);
					}
				}
				this._document.getElementById("calendar-event-summary-dialog").buttons = newArray.join(",");
			}
			else {
				if ((item.calendar.type == "exchangecalendar") && (item.responseObjects) && (item.responseObjects.ForwardItem)) {
					this._document.getElementById("calendar-event-summary-dialog").buttons += ",extra1";
				}
			}

//dump("summary.dialog: item.exchangeXML:"+item.exchangeXML+"\n");
			if (item.bodyType == "HTML") {
				if (this._document.getElementById("item-description")) {
					this._document.getElementById("item-description").parentNode.appendChild(this._document.getElementById("exchWebService-body-editor"));
					this._document.getElementById("item-description").hidden = true;
				}
				if (this._document.getElementById("exchWebService-body-editor")) {
					this._document.getElementById("exchWebService-body-editor").hidden = false;
					//this._document.getElementById("exchWebService-body-editor").content = item.body;
					this._document.getElementById("exchWebService-body-editor").loadURI("data:text/html;charset=utf-8;base64," + btoa(item.body), null,null);
					//this._document.getElementById("exchWebService-body-editor").loadURI("data:text/html;charset=utf-8," + item.body, null,null);
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
}

//this._window.addEventListener("load", exchWebService.forewardEvent2.onLoad, false);
var tmpEventSummaryDialog = new exchEventSummaryDialog(document, window);
window.addEventListener("load", function () { window.removeEventListener("load",arguments.callee,false); tmpEventSummaryDialog.onLoad(); }, true);


