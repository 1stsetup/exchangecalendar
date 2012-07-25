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
 * Author: Ashok Kumar
 * email: ashokkumarprajapati@gmail.com
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
Cu.import("resource://calendar/modules/calItipUtils.jsm");
var promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);

function forwardInviteUsingItip()
{
	let itipItem = ltnImipBar.itipItem;
	let item = null;
	let items = itipItem.getItemList({ });
       		
	if (items && items.length) {
       		item = items[0].isMutable ? items[0] : items[0].clone();
	}
	// Check if this item is already processed in Exchange Calendar.
	if(itipItem.targetCalendar){
		if(itipItem.targetCalendar.contractID == "@mozilla.org/calendar/calendar;1?type=exchangecalendar"){
			forwardUsingWS(itipItem, item);
		}
	}else{
		if (cal.itip.promptCalendar('select Calendar', itipItem, window)) {
			if(itipItem.targetCalendar.contractID == "@mozilla.org/calendar/calendar;1?type=exchangecalendar"){
				forwardUsingWS(itipItem, item);
			} else {
				promptService.alert(null, "Could not forward", "This calendar doesn't support requested feature.");
			}
		}
	}
}

function forwardUsingWS(itipItem, item)
{
	item.calendar = itipItem.targetCalendar;
	exchWebService.forewardEvent2.onForward(item, callOnOk);
}
	
function callOnOk(attendee,organizer,startTime,endTime)
{
	let itipItem = ltnImipBar.itipItem;
	let item = null;
	let items = itipItem.getItemList({ });
      		
	if (items && items.length) {
       		item = items[0].isMutable ? items[0] : items[0].clone();
	}
	exchWebService.forewardEvent2.callOnOk(attendee,organizer,startTime,endTime,item);			
}
