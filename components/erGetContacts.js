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

var EXPORTED_SYMBOLS = ["erGetContactsRequest"];

const MAPI_PidTagBody = "4096";

function erGetContactsRequest(aArgument, aCbOk, aCbError, aListener)
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
	this.ids = aArgument.ids;

	this.isRunning = true;
	this.execute();
}

erGetContactsRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erGetContactsRequest.execute\n");

		var req = <nsMessages:GetItem xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;

		req.nsMessages::ItemShape.nsTypes::BaseShape = "AllProperties";
		req.nsMessages::ItemShape.nsTypes::BodyType = 'Text';

		req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content = <>
		    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId={MAPI_PidTagBody} PropertyType="String" xmlns:nsTypes={nsTypes}/>
		    </>;

		var itemids = <nsMessages:ItemIds xmlns:nsMessages={nsMessages}/>;
		for each (var item in this.ids) {
			itemids.nsTypes::ItemId += <nsTypes:ItemId Id={item.Id} ChangeKey={item.ChangeKey} xmlns:nsTypes={nsTypes} />;
		}

		req.appendChild(itemids);


		exchWebService.commonFunctions.LOG("erGetContactsRequest.execute 11:"+String(req));
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		exchWebService.commonFunctions.LOG("erGetContactsRequest.onSendOk:"+String(aResp));

		var contacts = [];
		for each (var e in aResp..nsMessages::Items.*) {
			contacts.push(e);
		}

		if (this.mCbOk) {
			this.mCbOk(this, contacts);
		}
		this.isRunning = false;
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		exchWebService.commonFunctions.LOG("erGetContactsRequest.onSendError.aMsg:"+aMsg);
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};


