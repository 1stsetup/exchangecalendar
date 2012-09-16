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

		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:FindItem xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
		req.setAttribute("Traversal", "Shallow");

		var itemShape = req.addChildTag("ItemShape", "nsMessages", null); 
		itemShape.addChildTag("BaseShape", "nsTypes", "IdOnly");

		var restr = exchWebService.commonFunctions.xmlToJxon('<nsMessages:Restriction xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
		var or = restr.addChildTag("Or", "nsTypes", null);
		var isEqualTo1 = or.addChildTag("IsEqualTo", "nsTypes", null);
		isEqualTo1.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "item:ItemClass");
		isEqualTo1.addChildTag("FieldURIOrConstant", "nsTypes", null).addChildTag("Constant", "nsTypes", null).setAttribute("Value", "IPM.Contact");

		var isEqualTo2 = or.addChildTag("IsEqualTo", "nsTypes", null);
		isEqualTo2.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "item:ItemClass");
		isEqualTo2.addChildTag("FieldURIOrConstant", "nsTypes", null).addChildTag("Constant", "nsTypes", null).setAttribute("Value", "IPM.DistList");

		req.addChildTagObject(restr);

		var parentFolder = makeParentFolderIds2("ParentFolderIds", this.argument);
		req.addChildTagObject(parentFolder);

		this.parent.xml2jxon = true;

		//exchWebService.commonFunctions.LOG("erFindContactsRequest.execute:"+String(this.parent.makeSoapMessage(req)));

                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erFindContactsRequest.onSendOk:"+String(aResp));

		var rm = aResp.XPath("/s:Envelope/s:Body/m:FindItemResponse/m:ResponseMessages/m:FindItemResponseMessage/m:ResponseCode");

		if (rm.length == 0) {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_RESPONS_NOT_VALID, "Respons does not contain expected field");
			return;
		}

		var responseCode = rm[0].value;

		if (responseCode == "NoError") {

			var contacts = [];
			var distlists = [];

			var rootFolder = aResp.XPath("/s:Envelope/s:Body/m:FindItemResponse/m:ResponseMessages/m:FindItemResponseMessage/m:RootFolder");
			if (rootFolder.length == 0) {
				this.onSendError(aExchangeRequest, this.parent.ER_ERROR_RESPONS_NOT_VALID, "Did not find a rootfolder element.");
				return;
			}

			// For now we do not do anything with the following two values.
			var totalItemsInView = rootFolder[0].getAttribute("TotalItemsInView", 0);
			var includesLastItemInRange = rootFolder[0].getAttribute("IncludesLastItemInRange", "true");

			var contacts = rootFolder[0].XPath("/t:Items/t:Contact");
			for each (var contact in contacts) {
				contacts.push({Id: contact.getAttributeByTag("t:ItemId", "Id"),
					  ChangeKey: contact.getAttributeByTag("t:ItemId", "ChangeKey")});
			}
		
			var distributionLists = rootFolder[0].XPath("/t:Items/t:DistributionList");
			for each (var distlist in distributionLists) {
				distlists.push({Id: distlist.getAttributeByTag("t:ItemId", "Id"),
					  ChangeKey: distlist.getAttributeByTag("t:ItemId", "ChangeKey")});
			}
		
			if (this.mCbOk) {
				this.mCbOk(this, contacts, distlists);
			}
			this.isRunning = false;
		}
		else {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, responseCode);
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


