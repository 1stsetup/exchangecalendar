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

Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");
Cu.import("resource://exchangecalendar/ecFunctions.js");

var EXPORTED_SYMBOLS = ["erFindContactsRequest"];

function erFindContactsRequest(aArgument, aCbOk, aCbError, aListener)
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

	this.isRunning = true;
	this.execute();
}

erFindContactsRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erFindContactsRequest.execute\n");

		var req = <nsMessages:FindItem xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;
		req.@Traversal = "Shallow";

		req.nsMessages::ItemShape.nsTypes::BaseShape = "IdOnly";

		var restr = 
			<nsMessages:Restriction xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}>
        			<nsTypes:Or>
					<nsTypes:IsEqualTo>
						<nsTypes:FieldURI FieldURI="item:ItemClass"/>
						<nsTypes:FieldURIOrConstant>
							<nsTypes:Constant Value="IPM.Contact"/>
						</nsTypes:FieldURIOrConstant>
					</nsTypes:IsEqualTo>
					<nsTypes:IsEqualTo>
						<nsTypes:FieldURI FieldURI="item:ItemClass"/>
						<nsTypes:FieldURIOrConstant>
							<nsTypes:Constant Value="IPM.DistList"/>
						</nsTypes:FieldURIOrConstant>
					</nsTypes:IsEqualTo>
        			</nsTypes:Or>
			</nsMessages:Restriction>;

		req.appendChild(restr);

		req.nsMessages::ParentFolderIds = makeParentFolderIds("ParentFolderIds", this.argument);
		//exchWebService.commonFunctions.LOG("erFindContactsRequest.execute:"+String(this.parent.makeSoapMessage(req)));

                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		exchWebService.commonFunctions.LOG("erFindContactsRequest.onSendOk:"+String(aResp));

		var rm = aResp..nsMessages::ResponseMessages.nsMessages::FindItemResponseMessage;
		var ResponseCode = rm.nsMessages::ResponseCode.toString();
		if (ResponseCode == "NoError") {

			var contacts = [];
			var distlists = [];

			for each (var contact in aResp..nsTypes::Contact) {
				contacts.push({Id: contact.nsTypes::ItemId.@Id.toString(),
					  ChangeKey: contact.nsTypes::ItemId.@ChangeKey.toString()});
			}
		
			for each (var distlist in aResp..nsTypes::DistributionList) {
				distlists.push({Id: distlist.nsTypes::ItemId.@Id.toString(),
					  ChangeKey: distlist.nsTypes::ItemId.@ChangeKey.toString()});
			}
		
			if (this.mCbOk) {
				this.mCbOk(this, contacts, distlists);
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


