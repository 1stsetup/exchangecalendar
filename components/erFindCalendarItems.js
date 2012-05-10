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
 * This code uses parts of the Microsoft Exchange Calendar Provider code on which the
 * "Exchange Data Provider for Lightning" was based.
 * The Initial Developer of the Microsoft Exchange Calendar Provider Code is
 *   Andrea Bittau <a.bittau@cs.ucl.ac.uk>, University College London
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * ***** BEGIN LICENSE BLOCK *****/

var Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://calendar/modules/calAlarmUtils.jsm");
Cu.import("resource://calendar/modules/calProviderUtils.jsm");
Cu.import("resource://calendar/modules/calAuthUtils.jsm");

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");

var EXPORTED_SYMBOLS = ["erFindCalendarItemsRequest"];

function convDate(aDate)
{
	if (aDate) {
		var d = aDate.clone();

		d.isDate = false;
		return cal.toRFC3339(d);
	}

	return null;
}

function erFindCalendarItemsRequest(aArgument, aCbOk, aCbError, aListener)
{
	this.mCbOk = aCbOk;
	this.mCbError = aCbError;

	var self = this;

	this.parent = new ExchangeRequest(aArgument, 
		function(aExchangeRequest, aResp) { self.onSendOk(aExchangeRequest, aResp);},
		function(aExchangeRequest, aCode, aMsg) { self.onSendError(aExchangeRequest, aCode, aMsg);},
		aListener);

	this.argument = aArgument;
	this.mailbox = aArgument.mailbox;
	this.serverUrl = aArgument.serverUrl;
	this.rangeStart = aArgument.rangeStart;
	this.rangeEnd = aArgument.rangeEnd;
	this.count = aArgument.count;
	this.folderID = aArgument.folderID;
	this.folderBase = aArgument.folderBase;
	this.changeKey = aArgument.changeKey;
	this.listener = aListener;
	this.itemFilter = aArgument.itemFilter;

	this.recurringMasters = [];
	this.occurrences = [];
	this.occurrenceIds = [];
	this.ids = [];

	this.isRunning = true;
	this.execute();
}

erFindCalendarItemsRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erGetCalendarItemsRequest.execute\n");

		var req = <nsMessages:FindItem xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;
		req.@Traversal = "Shallow";

		req.nsMessages::ItemShape.nsTypes::BaseShape = "IdOnly";
//		req.nsMessages::ItemShape.nsTypes::BaseShape = "Default";

		req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content = <>
		    	<nsTypes:FieldURI FieldURI="calendar:UID" xmlns:nsTypes={nsTypes}/>
		    	<nsTypes:FieldURI FieldURI="calendar:CalendarItemType" xmlns:nsTypes={nsTypes}/>
		    	<nsTypes:FieldURI FieldURI="calendar:Start" xmlns:nsTypes={nsTypes}/>
		    	<nsTypes:FieldURI FieldURI="calendar:End" xmlns:nsTypes={nsTypes}/>
		    	<nsTypes:FieldURI FieldURI="item:ItemClass" xmlns:nsTypes={nsTypes}/>
		    	<nsTypes:FieldURI FieldURI="item:Subject" xmlns:nsTypes={nsTypes}/>
		    </>;

		var view = <nsMessages:CalendarView xmlns:nsMessages={nsMessages}/>;
		
		if (this.rangeStart) {
			view.@StartDate = convDate(this.rangeStart);
		}
		else {
			view.@StartDate = "1900-01-01T00:00:00-00:00";
		}

		if (this.rangeEnd) {
			view.@EndDate = convDate(this.rangeEnd);
		}
		else {
			view.@EndDate = "2300-01-01T00:00:00-00:00";
		}

//		if (this.count != 0) {
//			view.@MaxEntriesReturned = 15; // this.count;
//		}

 		req.appendChild(view);

		req.nsMessages::ParentFolderIds = makeParentFolderIds("ParentFolderIds", this.argument);
		//exchWebService.commonFunctions.LOG("erFindCalendarItemsRequest.execute:"+String(this.parent.makeSoapMessage(req)));

                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		/*
		 * We want to include all Single items, all Exception items, but also
		 * at least one Occurrence or Exception item for each master.
		 * If we include too many Occurrences, we will query for the master
		 * too often, but if we don't include any, we might not query for the
		 * master at all.
		 *
		 * We first collect all non-Occurrences, and after that we fill in
		 * Occurrence for those masters that did not yet see any Exception.
		 */
		//exchWebService.commonFunctions.LOG("erFindCalendarItemsRequest.onSendOk:"+String(aResp)+"\n");

		var rm = aResp..nsMessages::ResponseMessages.nsMessages::FindItemResponseMessage;
		var ResponseCode = rm.nsMessages::ResponseCode.toString();
		if (ResponseCode == "NoError") {

			for each (var e in aResp..nsTypes::CalendarItem) {
				switch (e.nsTypes::CalendarItemType.toString()) {
					case "RecurringMaster" :
						this.ids.push({Id: e.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: e.nsTypes::ItemId.@ChangeKey.toString(),
							  type: e.nsTypes::CalendarItemType.toString(),
							  uid: e.nsTypes::UID.toString(),
							  start: e.nsTypes::Start.toString(),
							  end: e.nsTypes::End.toString()});
						break; // BUG 13.n
					case "Occurrence" :
					case "Exception" :
						this.occurrences[e.nsTypes::UID.toString()] = {Id: e.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: e.nsTypes::ItemId.@ChangeKey.toString(),
							  type: e.nsTypes::CalendarItemType.toString(),
							  uid: e.nsTypes::UID.toString(),
							  start: e.nsTypes::Start.toString(),
							  end: e.nsTypes::End.toString()};
						// BUG 13.sn
						this.ids.push({Id: e.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: e.nsTypes::ItemId.@ChangeKey.toString(),
							  type: e.nsTypes::CalendarItemType.toString(),
							  uid: e.nsTypes::UID.toString(),
							  start: e.nsTypes::Start.toString(),
							  end: e.nsTypes::End.toString()});
						// BUG 13.en
						break;
					case "Single" :
						this.ids.push({Id: e.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: e.nsTypes::ItemId.@ChangeKey.toString(),
							  type: e.nsTypes::CalendarItemType.toString(),
							  uid: e.nsTypes::UID.toString(),
							  start: e.nsTypes::Start.toString(),
							  end: e.nsTypes::End.toString()});
						break;
					default:
						exchWebService.commonFunctions.LOG("UNKNOWN CalendarItemType:"+e.nsTypes::CalendarItemType.toString()+"\n");
						break;
				}
			}
		
			if (this.mCbOk) {
				var occurrenceList = [];
				for (var index in this.occurrences) {
					occurrenceList.push(this.occurrences[index]);
				}

				this.mCbOk(this, this.ids, occurrenceList);
			}
			this.isRunning = false;
		}
		else {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, ResponseCode);
		}
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};


