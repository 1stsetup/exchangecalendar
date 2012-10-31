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
 * Contributor: Krzysztof Nowicki (krissn@op.pl)
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

var EXPORTED_SYMBOLS = ["erSyncFolderItemsRequest"];

function erSyncFolderItemsRequest(aArgument, aCbOk, aCbError, aListener)
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
	this.folderID = aArgument.folderID;
	this.folderBase = aArgument.folderBase;
	this.changeKey = aArgument.changeKey;
	this.listener = aListener;
	this.syncState = aArgument.syncState;

	if (!aArgument.syncState) {
		this.getSyncState = true;
	}
	else {
		this.getSyncState = false;
	}

	this.creations = [];
	this.updates = [];
	this.deletions = [];

	this.attempts = 0;

	this.isRunning = true;
	this.execute(aArgument.syncState);
}

erSyncFolderItemsRequest.prototype = {

	execute: function _execute(aSyncState)
	{
		//exchWebService.commonFunctions.LOG("erSyncFolderItemsRequest.execute\n");

		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:SyncFolderItems xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');

		var itemShape = req.addChildTag("ItemShape", "nsMessages", null);
		itemShape.addChildTag("BaseShape", "nsTypes", "IdOnly");

		var parentFolder = makeParentFolderIds2("SyncFolderId", this.argument);
		req.addChildTagObject(parentFolder);
	
		if ((aSyncState) && (aSyncState != "")) {
			req.addChildTag("SyncState", "nsMessages", aSyncState);
		}

		if (this.getSyncState) {
			req.addChildTag("MaxChangesReturned", "nsMessages", "512");
		}
		else {
			req.addChildTag("MaxChangesReturned", "nsMessages", "15");
		}
		
		this.parent.xml2jxon = true;
		
		//exchWebService.commonFunctions.LOG("erSyncFolderItemsRequest.execute:"+String(this.parent.makeSoapMessage(req)));
		
		//exchWebService.commonFunctions.LOG(String(this.parent.makeSoapMessage(req)));
		this.attempts++;
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erSyncFolderItemsRequest.onSendOk:"+String(aResp));

		var rm = aResp.XPath("/s:Envelope/s:Body/m:SyncFolderItemsResponse/m:ResponseMessages/m:SyncFolderItemsResponseMessage[@ResponseClass='Success' and m:ResponseCode='NoError']");

		if (rm.length > 0) {
			var syncState = rm[0].getTagValue("m:SyncState");

			var lastItemInRange = rm[0].getTagValue("m:IncludesLastItemInRange");

			if (!this.getSyncState) {
				var createItems = rm[0].XPath("/m:Changes/t:Create");
				for each (var creation in createItems) {
					var calendarItems = creation.XPath("/t:CalendarItem/t:ItemId");
					for each (var calendarItem in calendarItems) {
						this.creations.push({Id: calendarItem.getAttribute("Id").toString(),
							  ChangeKey: calendarItem.getAttribute("ChangeKey").toString()});
					}
					var tasks = creation.XPath("/t:Task/t:ItemId");
					for each (var task in tasks) {
						this.creations.push({Id: task.getAttribute("Id").toString(),
							  ChangeKey: task.getAttribute("ChangeKey").toString()});
					}
				}
				createItems = null;

				var updateItems = rm[0].XPath("/m:Changes/t:Update");
				for each (var update in updateItems) {
					var calendarItems = update.XPath("/t:CalendarItem/t:ItemId");
					for each (var calendarItem in calendarItems) {
						this.updates.push({Id: calendarItem.getAttribute("Id").toString(),
					  ChangeKey: calendarItem.getAttribute("ChangeKey").toString()});
					}
					var tasks = update.XPath("/t:Task/t:ItemId");
					for each (var task in tasks) {
						this.updates.push({Id: task.getAttribute("Id").toString(),
					  ChangeKey: task.getAttribute("ChangeKey").toString()});
					}
				}
				updateItems = null;

				var deleteItems = rm[0].XPath("/m:Changes/t:Delete/t:ItemId");
				for each (var deleted in deleteItems) {
					this.deletions.push({Id: deleted.getAttribute("Id").toString(),
					  ChangeKey: deleted.getAttribute("ChangeKey").toString()});
				}
				deleteItems = null;
			}

			rm = null;

			if (lastItemInRange == "false") {
				this.execute(syncState);
				return;
			}
			else {
				if (this.mCbOk) {
					this.mCbOk(this, this.creations, this.updates, this.deletions, syncState);
				}
				this.isRunning = false;
			}
		}
		else {
			if (this.attempts == 1) {
				// We retry without a known syncstate.
				this.getSyncState = true;
				this.execute(null);
			}
			else {
				var rm = aResp.XPath("/s:Envelope/s:Body/m:SyncFolderItemsResponse/m:ResponseMessages/m:SyncFolderItemsResponseMessage");
				if (rm.length > 0) {
					var ResponseCode = rm[0].getTagValue("m:ResponseCode");
				}
				else {
					var ResponseCode = "Unknown error from Exchange server.";
				}
				this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SYNCFOLDERITEMS_UNKNOWN, "Error during SyncFolderItems:"+ResponseCode);
				return;
			}
		}

	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
//exchWebService.commonFunctions.LOG("onSendError aMsg:"+aMsg+"\n");
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};


