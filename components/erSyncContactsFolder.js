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
 * -- Exchange 2007/2010 Contacts.
 * -- For Thunderbird.
 *
 * Author: Michel Verbraak (info@1st-setup.nl)
 * Website: http://www.1st-setup.nl/wordpress/?page_id=xx
 * email: exchangecontacts@extensions.1st-setup.nl
 *
 *
 * ***** BEGIN LICENSE BLOCK *****/
var Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://1st-setup/ecExchangeRequest.js");
Cu.import("resource://1st-setup/soapFunctions.js");
Cu.import("resource://1st-setup/ecFunctions.js");

var EXPORTED_SYMBOLS = ["erSyncContactsFolderRequest"];

const MAPI_PidTagBody = "4096";

function erSyncContactsFolderRequest(aArgument, aCbOk, aCbError, aListener)
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

	this.creations = {contacts: [], distlists:[]};
	this.updates = {contacts: [], distlists:[]};
	this.deletions = {contacts: [], distlists:[]};

	this.isRunning = true;
	this.execute(aArgument.syncState);
}

erSyncContactsFolderRequest.prototype = {

	execute: function _execute(aSyncState)
	{
//		exchWebService.commonFunctions.LOG("erSyncContactsFolderRequest.execute\n");

		var req = <nsMessages:SyncFolderItems xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;

		req.nsMessages::ItemShape.nsTypes::BaseShape = "AllProperties";
		req.nsMessages::ItemShape.nsTypes::BodyType = 'Text';

		req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
		    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId={MAPI_PidTagBody} PropertyType="String" xmlns:nsTypes={nsTypes}/>
		    </>;

		req.nsMessages::SyncFolderId = makeParentFolderIds("SyncFolderId", this.argument);
	
		if (aSyncState) {
			req.nsMessages::SyncState = aSyncState;
		}

		req.nsMessages::MaxChangesReturned = 512;  // We only want a synstate to ask it fast.
		
		//exchWebService.commonFunctions.LOG(String(this.parent.makeSoapMessage(req))+"\n");
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erSyncContactsFolderRequest.onSendOk:"+String(aResp)+"\n");

		var rm = aResp..nsMessages::SyncFolderItemsResponseMessage;

		var ResponseCode = rm.nsMessages::ResponseCode.toString();

		if (ResponseCode == "NoError") {
			var syncState = rm.nsMessages::SyncState.toString();

			var lastItemInRange = rm.nsMessages::IncludesLastItemInRange.toString();

				for each (var creation in rm.nsMessages::Changes.nsTypes::Create) {
					for each (var contact in creation.nsTypes::Contact) {
						//this.creations.contacts.push(contact);
						this.creations.contacts.push({Id: contact.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: contact.nsTypes::ItemId.@ChangeKey.toString()});
					}
					for each (var distlist in creation.nsTypes::DistributionList) {
						//this.creations.distlists.push(distlist);
						this.creations.distlists.push({Id: distlist.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: distlist.nsTypes::ItemId.@ChangeKey.toString()});
					}
				}
	
				for each (var update in rm.nsMessages::Changes.nsTypes::Update) {
					for each (var contact in update.nsTypes::Contact) {
						//this.updates.contacts.push(contact);
						this.updates.contacts.push({Id: contact.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: contact.nsTypes::ItemId.@ChangeKey.toString()});
					}
					for each (var distlist in update.nsTypes::DistributionList) {
						//this.updates.distlists.push(distlist);
						this.updates.distlists.push({Id: distlist.nsTypes::ItemId.@Id.toString(),
							  ChangeKey: distlist.nsTypes::ItemId.@ChangeKey.toString()});
					}
				}

				for each (var deleted in rm.nsMessages::Changes.nsTypes::Delete) {
					for each (var contact in deleted.nsTypes::Contact) {
						this.deletions.contacts.push(contact);
					}
					for each (var distlist in deleted.nsTypes::DistributionList) {
						this.deletions.distlists.push(distlist);
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
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SYNCFOLDERITEMS_UNKNOWN, "Error during SyncFolderItems:"+ResponseCode);
			return;
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


