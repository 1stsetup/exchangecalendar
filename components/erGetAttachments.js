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

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");

var EXPORTED_SYMBOLS = ["erGetAttachmentsRequest"];

function erGetAttachmentsRequest(aArgument, aCbOk, aCbError, aListener)
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
exchWebService.commonFunctions.LOG(" == serverUrl:"+aArgument.serverUrl);
	this.attachmentIds = aArgument.attachmentIds;

	this.isRunning = true;
	this.execute();
}

erGetAttachmentsRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erGetAttachmentsRequest.execute");

		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:GetAttachment xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');

		var itemids = exchWebService.commonFunctions.xmlToJxon('<nsMessages:AttachmentIds xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');
		for (var index in this.attachmentIds) {
			itemids.addChildTag("AttachmentId", "nsTypes", null).setAttribute("Id", this.attachmentIds[index]);
		}

		req.addChildTagObject(itemids);

		this.parent.xml2jxon = true;

		//exchWebService.commonFunctions.LOG("erGetAttachmentsRequest.execute:"+this.parent.makeSoapMessage(req));
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erGetAttachmentsRequest.onSendOk: "+String(aResp));

		var rm = aResp.XPath("/s:Envelope/s:Body/m:GetAttachmentResponse/m:ResponseMessages/m:GetAttachmentResponseMessage[@ResponseClass='Success' and m:ResponseCode='NoError']/m:Attachments/*");

		if (rm.length == 0) {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, "Error on getting Attachment.");
			return;
		}

		var attachments = [];
		for each (var e in rm) {
			attachments.push( { id: e.getAttributeByTag("t:AttachmentId","Id"),
				      name: e.getTagValue("t:Name"),
				      content: e.getTagValue("t:Content")}
				);
		} 
	
		if (this.mCbOk) {
			this.mCbOk(this, attachments);
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


