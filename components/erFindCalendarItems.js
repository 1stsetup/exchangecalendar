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

		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:FindItem xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
		req.setAttribute("Traversal", "Shallow");

		var itemShape = req.addChildTag("ItemShape", "nsMessages", null); 
		itemShape.addChildTag("BaseShape", "nsTypes", "IdOnly");

		var additionalProperties = itemShape.addChildTag("AdditionalProperties", "nsTypes", null);
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:UID");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:CalendarItemType");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:Start");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:End");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "item:ItemClass");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "item:Subject");

		var view = exchWebService.commonFunctions.xmlToJxon('<nsMessages:CalendarView xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
		if (this.rangeStart) {
			view.setAttribute("StartDate", convDate(this.rangeStart));
		}
		else {
			view.setAttribute("StartDate", "1900-01-01T00:00:00-00:00");
		}

		if (this.rangeEnd) {
			view.setAttribute("EndDate", convDate(this.rangeEnd));
		}
		else {
			view.setAttribute("EndDate", "2300-01-01T00:00:00-00:00");
		}
		//view.setAttribute("MaxEntriesReturned", "15");

		req.addChildTagObject(view);

		var parentFolder = makeParentFolderIds2("ParentFolderIds", this.argument);
		req.addChildTagObject(parentFolder);

		this.parent.xml2jxon = true;

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

		var aError = false;
		var aCode = 0;
		var aMsg = "";

		var rm = aResp.XPath("/s:Envelope/s:Body/m:FindItemResponse/m:ResponseMessages/m:FindItemResponseMessage[@ResponseClass='Success' and m:ResponseCode='NoError']");

		if (rm.length > 0) {
			var rootFolder = rm[0].getTag("m:RootFolder");
			if (rootFolder) {
				if (rootFolder.getAttribute("IncludesLastItemInRange") == "true") {
					// Process results.
					var calendarItems = rootFolder.XPath("/t:Items/t:CalendarItem");
					for (var index in calendarItems) {
						var uid = calendarItems[index].getTagValue("t:UID", "");
						switch (calendarItems[index].getTagValue("t:CalendarItemType")) {
							case "Occurrence" :
							case "Exception" :
								if (uid != "") {
									this.occurrences[uid] = {Id: calendarItems[index].getAttributeByTag("t:ItemId","Id"),
										  ChangeKey: calendarItems[index].getAttributeByTag("t:ItemId", "ChangeKey"),
										  type: calendarItems[index].getTagValue("t:CalendarItemType"),
										  uid: uid,
										  start: calendarItems[index].getTagValue("t:Start"),
										  end: calendarItems[index].getTagValue("t:End")};
								}
							case "RecurringMaster" :
							case "Single" :
								this.ids.push({Id: calendarItems[index].getAttributeByTag("t:ItemId","Id"),
										  ChangeKey: calendarItems[index].getAttributeByTag("t:ItemId", "ChangeKey"),
										  type: calendarItems[index].getTagValue("t:CalendarItemType"),
										  uid: uid,
										  start: calendarItems[index].getTagValue("t:Start"),
										  end: calendarItems[index].getTagValue("t:End")});
								break;
							default:
								exchWebService.commonFunctions.LOG("UNKNOWN CalendarItemType:"+calendarItems[index].getTagValue("t:CalendarItemType")+"\n");
								break;
						}
					}
				}
				else {
					// We do not know how to handle this yet. Do not know if it ever happens. We did not restrict MaxEntriesReturned.
					exchWebService.commonFunctions.LOG("PLEASE MAIL THIS LINE TO exchangecalendar@extensions.1st-setup.nl: IncludesLastItemInRange == false in FindItemResponse.");
				}
			}
			else {
				aCode = this.parent.ER_ERROR_SOAP_RESPONSECODE_NOTFOUND;
				aError = true;
				aMsg = "No RootFolder found in FindItemResponse.";
			}
		}
		else {
			aMsg = this.parent.getSoapErrorMsg(aResp);
			if (aMsg) {
				aCode = this.parent.ER_ERROR_CONVERTID;
				aError = true;
			}
			else {
				aCode = this.parent.ER_ERROR_SOAP_RESPONSECODE_NOTFOUND;
				aError = true;
				aMsg = "Wrong response received.";
			}
		}

		if (aError) {
			this.onSendError(aExchangeRequest, aCode, aMsg);
		}
		else {
			if (this.mCbOk) {
				var occurrenceList = [];
				for (var index in this.occurrences) {
					occurrenceList.push(this.occurrences[index]);
				}
				this.mCbOk(this, this.ids, occurrenceList);
			}
			this.isRunning = false;
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


