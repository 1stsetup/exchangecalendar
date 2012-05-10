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
//		exchWebService.commonFunctions.LOG("erSyncFolderItemsRequest.execute\n");

		var req = <nsMessages:SyncFolderItems xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;

		req.nsMessages::ItemShape.nsTypes::BaseShape = "IdOnly";

		req.nsMessages::SyncFolderId = makeParentFolderIds("SyncFolderId", this.argument);
	
		if ((aSyncState) && (aSyncState != "")) {
			req.nsMessages::SyncState = aSyncState;
		}

		if (this.getSyncState) {
			req.nsMessages::MaxChangesReturned = 512;  // We only want a synstate to ask it fast.
		}
		else {
			req.nsMessages::MaxChangesReturned = 15;  // We will ask 15 items at a time.
		}
		
		//exchWebService.commonFunctions.LOG(String(this.parent.makeSoapMessage(req)));
		this.attempts++;
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erSyncFolderItemsRequest.onSendOk:"+String(aResp));

		var rm = aResp..nsMessages::SyncFolderItemsResponseMessage;

		var ResponseCode = rm.nsMessages::ResponseCode.toString();

		if (ResponseCode == "NoError") {
			var syncState = rm.nsMessages::SyncState.toString();

			var lastItemInRange = rm.nsMessages::IncludesLastItemInRange.toString();

			if (!this.getSyncState) {
				for each (var creation in rm.nsMessages::Changes.nsTypes::Create) {
					for each (var calendarItem in creation.nsTypes::CalendarItem) {
						this.creations.push({Id: calendarItem.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: calendarItem.nsTypes::ItemId.@ChangeKey.toString()});
					}
					for each (var task in creation.nsTypes::Task) {
						this.creations.push({Id: task.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: task.nsTypes::ItemId.@ChangeKey.toString()});
					}
				}
	
				for each (var update in rm.nsMessages::Changes.nsTypes::Update) {
					for each (var calendarItem in update.nsTypes::CalendarItem) {
						this.updates.push({Id: calendarItem.nsTypes::ItemId.@Id.toString(),
					  ChangeKey: calendarItem.nsTypes::ItemId.@ChangeKey.toString()});
					}
					for each (var task in update.nsTypes::Task) {
						this.updates.push({Id: task.nsTypes::ItemId.@Id.toString(),
					  ChangeKey: task.nsTypes::ItemId.@ChangeKey.toString()});
					}
				}

				for each (var deleted in rm.nsMessages::Changes.nsTypes::Delete) {
					this.deletions.push({Id: deleted.nsTypes::ItemId.@Id.toString(),
					  ChangeKey: deleted.nsTypes::ItemId.@ChangeKey.toString()});
				}
			}

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


