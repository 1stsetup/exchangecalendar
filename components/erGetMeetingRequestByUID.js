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

Cu.import("resource://exchangecalendar/ecFunctions.js");

Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");

const MAPI_PidLidTaskAccepted = "33032";
const MAPI_PidLidTaskLastUpdate = "33045";
const MAPI_PidLidTaskHistory = "33050";
const MAPI_PidLidTaskOwnership = "33065";
const MAPI_PidLidTaskMode = "34072";
const MAPI_PidLidTaskGlobalId = "34073";
const MAPI_PidLidTaskAcceptanceState = "33066";
const MAPI_PidLidReminderSignalTime = "34144";
const MAPI_PidLidReminderSet = "34051";
const MAPI_PidLidReminderDelta = "34049";

var EXPORTED_SYMBOLS = ["erGetMeetingRequestByUIDRequest"];

function erGetMeetingRequestByUIDRequest(aArgument, aCbOk, aCbError, aListener)
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
	this.folderBase = aArgument.folderBase;
	this.listener = aListener;

	this.isRunning = true;
	this.execute();
}

erGetMeetingRequestByUIDRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erGetMeetingRequestByUIDRequest.execute\n");

		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:FindItem xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
		req.setAttribute("Traversal", "Shallow");

		var itemShape = req.addChildTag("ItemShape", "nsMessages", null); 
		itemShape.addChildTag("BaseShape", "nsTypes", "AllProperties");
		itemShape.addChildTag("BodyType", "nsTypes", "Text");


		var restr = exchWebService.commonFunctions.xmlToJxon('<nsMessages:Restriction xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
		var isEqualTo = restr.addChildTag("IsEqualTo", "nsTypes", null);
		isEqualTo.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "item:ItemClass");
		isEqualTo.addChildTag("FieldURIOrConstant", "nsTypes", null).addChildTag("Constant", "nsTypes", null).setAttribute("Value", "IPM.Schedule.Meeting.Request");

		/*var and = restr.addChildTag("And", "nsTypes", null);
		var isEqualTo1 = and.addChildTag("IsEqualTo", "nsTypes", null);
		isEqualTo1.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "item:ItemClass");
		isEqualTo1.addChildTag("FieldURIOrConstant", "nsTypes", null).addChildTag("Constant", "nsTypes", null).setAttribute("Value", "IPM.Schedule.Meeting.Request");

		var isEqualTo2 = and.addChildTag("IsEqualTo", "nsTypes", null);
		isEqualTo2.addChildTag("FieldURI", "nsTypes", null).setAttribute("FieldURI", "calendar:UID");
		isEqualTo2.addChildTag("FieldURIOrConstant", "nsTypes", null).addChildTag("Constant", "nsTypes", null).setAttribute("Value", this.argument.uid);*/

		req.addChildTagObject(restr);

		var parentFolder = makeParentFolderIds2("ParentFolderIds", this.argument);
		req.addChildTagObject(parentFolder);

		this.parent.xml2jxon = true;

		//exchWebService.commonFunctions.LOG("erGetMeetingRequestByUIDRequest.execute:"+String(this.parent.makeSoapMessage(req)));
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erGetMeetingRequestByUIDRequest.onSendOk:"+String(aResp));

		var rm = aResp.XPath("/s:Envelope/s:Body/m:FindItemResponse/m:ResponseMessages/m:FindItemResponseMessage/m:ResponseCode");

		if (rm.length == 0) {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_RESPONS_NOT_VALID, "Respons does not contain expected field responsecode");
			return;
		}

		var responseCode = rm[0].value;

		if (responseCode != "NoError") {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, "Error on getting erGetMeetingRequestByUIDRequest:"+responseCode);
			return;
		}

		var rootFolder = aResp.XPath("/s:Envelope/s:Body/m:FindItemResponse/m:ResponseMessages/m:FindItemResponseMessage/m:RootFolder");
		if (rootFolder.length == 0) {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_RESPONS_NOT_VALID, "Respons does not contain expected field rootfolder");
			return;
		}

		var totalItemsInView = rootFolder[0].getAttribute("TotalItemsInView", 0);
		var includesLastItemInRange = rootFolder[0].getAttribute("IncludesLastItemInRange", "true");

		var aMeetingRequests = [];
		for each(var tmpItem in rootFolder[0].XPath("/t:Items/*")) {
			if (tmpItem.getTagValue("t:UID") == this.argument.uid) {
				aMeetingRequests.push(tmpItem);
			}
		}

		
		if (this.mCbOk) {
			this.mCbOk(this, aMeetingRequests);
		}
		this.isRunning = false;
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};


