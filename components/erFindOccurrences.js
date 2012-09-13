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

Cu.import("resource://exchangecalendar/erGetMasterOccurrenceId.js");

var EXPORTED_SYMBOLS = ["erFindOccurrencesRequest"];

function erFindOccurrencesRequest(aArgument, aCbOk, aCbError, aListener)
{
	this.mCbOk = aCbOk;
	this.mCbError = aCbError;

	var self = this;

	this.parent = new ExchangeRequest(aArgument, 
		function(aExchangeRequest, aResp) { self.onSendOk(aExchangeRequest, aResp);},
		function(aExchangeRequest, aCode, aMsg) { self.onSendError(aExchangeRequest, aCode, aMsg);},
		aListener);

	this.argument = aArgument;
	this.serverUrl = aArgument.serverUrl;
	this.listener = aListener;
	this.masterID = aArgument.masterItem.Id;
	this.masterChangeKey = aArgument.masterItem.ChangeKey;
	this.startDate = aArgument.startDate;
	this.endDate = aArgument.endDate;

	this.currentSearchIndex = 1;
	this.currentRealIndex = 0;
	this.idGroupSize = 15; // We will request in pages of 15 occurrences of the list at once
	this.items = [];

	var self = this;

	this.isRunning = true;

	if (aArgument.masterItem.type == "RecurringMaster") {
//exchWebService.commonFunctions.LOG("We have a master. Find occurences\n");
		this.execute();
	}
	else {
//exchWebService.commonFunctions.LOG("We have a child. First try to find master.\n");
		var tmpObject = new erGetMasterOccurrenceIdRequest( 
				{user: aArgument.user, 
				 serverUrl: aArgument.serverUrl,
				 item: aArgument.masterItem,
				 folderID: aArgument.folderID,
				 changeKey: aArgument.changeKey,
				 getType: "exchange" }, 
				function(erGetMasterOccurrenceIdRequest, aId, aChangeKey) { self.getMasterOk(erGetMasterOccurrenceIdRequest, aId, aChangeKey);}, 
				function(erGetMasterOccurrenceIdRequest, aCode, aMsg) { self.onSendError(erGetMasterOccurrenceIdRequest, aCode, aMsg);},
				aListener);
	}

//	this.execute();
}

erFindOccurrencesRequest.prototype = {

	execute: function _execute()
	{
		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:GetItem xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');

		var itemShape = req.addChildTag("ItemShape", "nsMessages", null);
		itemShape.addChildTag("BaseShape", "nsTypes", "IdOnly"); 

		var additionalProperties = itemShape.addChildTag("AdditionalProperties", "nsTypes", null);
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:UID");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:CalendarItemType");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:Start");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:End");
		additionalProperties.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "item:ItemClass");

		var itemids = exchWebService.commonFunctions.xmlToJxon('<nsMessages:ItemIds xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
		for (var x = 0; x < this.idGroupSize; x++) {
			var occurrenceItemID = itemids.addChildTag("OccurrenceItemId", "nsTypes", null);
			occurrenceItemID.setAttribute("RecurringMasterId", this.masterID);
			occurrenceItemID.setAttribute("ChangeKey", this.masterChangeKey);
			occurrenceItemID.setAttribute("InstanceIndex", this.currentSearchIndex++);
		}

		req.addChildTagObject(itemids);

		this.parent.xml2jxon = true;

		//exchWebService.commonFunctions.LOG("erFindOccurrencesRequest.execute>"+String(this.parent.makeSoapMessage(req))+"\n");
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erFindOccurrencesRequest.onSendOk>"+String(aResp)+"\n");
		var finished = false;
		var found = false;

		var rm = aResp.XPath("/s:Envelope/s:Body/m:GetItemResponse/m:ResponseMessages/m:GetItemResponseMessage");

		for each (var e in rm) {
			var responseCode = e.getTagValue("m:ResponseCode");
			switch (responseCode) {
				case "ErrorCalendarOccurrenceIsDeletedFromRecurrence" :
					this.currentRealIndex++;
					break;
				case "NoError":
					var tmpItems = e.XPath("/m:Items/*");
					for each (var tmpItem in tmpItems) {
						this.currentRealIndex++;
						var startDate = cal.fromRFC3339(tmpItem.getTagValue("t:Start"), cal.UTC()).getInTimezone(cal.UTC()); 
						var endDate = cal.fromRFC3339(tmpItem.getTagValue("t:End"), cal.UTC()).getInTimezone(cal.UTC()); 
						if ((this.startDate.compare(endDate) < 1) &&
						    (this.endDate.compare(startDate) > -1) ) {
							// We found our occurrence
							this.items.push({Id: tmpItem.getAttributeByTag("t:ItemId","Id"),
						  ChangeKey: tmpItem.getAttributeByTag("t:ItemId", "ChangeKey"),
						  type: tmpItem.getTagValue("t:CalendarItemType"),
						  uid: tmpItem.getTagValue("t:UID"),
						  start: tmpItem.getTagValue("t:Start"),
						  end: tmpItem.getTagValue("t:End"),
						  index: this.currentRealIndex});
						}

						// When we see occurrences past our endDate range stop.
						if (startDate.compare(this.endDate) == 1) {	
							finished = true;
							break;
						}
					}
					break;
				case "ErrorCalendarOccurrenceIndexIsOutOfRecurrenceRange" :
					finished = true;
					break;
				case "ErrorInvalidIdMalformed" :
					this.onSendError(aExchangeRequest, this.parent.ER_ERROR_FINDOCCURRENCES_INVALIDIDMALFORMED, responseCode);
					return;
			}

			if ((finished) || (found)) {
				break;	// break the loop
			}
		}
	
		if (finished) {
			// We found our occurrence.
			if (this.mCbOk) {
				this.mCbOk(this, this.items);
			}
			this.isRunning = false;
		}
		else {
			// We did not find the occurrence but we did not yet hit the end of the
			// occurrence list. Request the next page.
			this.execute();
		}
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},

	getMasterOk: function _getMasterOk(erGetMasterOccurrenceIdRequest, aId, aChangeKey)
	{
		this.masterID = aId;
		this.masterChangeKey = aChangeKey;

		this.execute();
	},

};


