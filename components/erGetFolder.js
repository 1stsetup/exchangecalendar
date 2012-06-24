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

/*Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://calendar/modules/calAlarmUtils.jsm");
Cu.import("resource://calendar/modules/calProviderUtils.jsm");
Cu.import("resource://calendar/modules/calAuthUtils.jsm");*/

Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");

var EXPORTED_SYMBOLS = ["erGetFolderRequest"];

function erGetFolderRequest(aArgument, aCbOk, aCbError, aListener)
{
	this.mCbOk = aCbOk;
	this.mCbError = aCbError;

	var self = this;

	this.parent = new ExchangeRequest(aArgument, 
		function(aExchangeRequest, aResp) { self.onSendOk(aExchangeRequest, aResp);},
		function(aExchangeRequest, aCode, aMsg) { self.onSendError(aExchangeRequest, aCode, aMsg);},
		aListener);

	this.parent.debug = false;
	this.argument = aArgument;
	
	this.serverUrl = aArgument.serverUrl;
	this.folderID = aArgument.folderID;
	this.folderBase = aArgument.folderBase;
	this.changeKey = aArgument.changeKey;
	this.listener = aListener;

/*	while ((aArgument.folderPath.length > 0) && (aArgument.folderPath.indexOf("/") == 0)) {
		aArgument.folderPath = aArgument.folderPath.substr(1);
	}*/

	this.isRunning = true;
	this.execute();
}

erGetFolderRequest.prototype = {

	execute: function _execute()
	{
		//exchWebService.commonFunctions.LOG("erGetFolderRequest.execute 1");

/*		var req = <nsMessages:GetFolder xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;

		req.nsMessages::FolderShape.nsTypes::BaseShape = "AllProperties";

		req.nsMessages::FolderIds = makeParentFolderIds("FolderIds", this.argument);
		//exchWebService.commonFunctions.LOG(" ++ E4X ++:"+this.parent.makeSoapMessage(req));*/

		var req = exchWebService.commonFunctions.xmlToJxon('<nsMessages:GetFolder xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');

		req.addChildTag("FolderShape", "nsMessages", null).addChildTag("BaseShape", "nsTypes", "AllProperties");

exchWebService.commonFunctions.LOG(" ###1 ");
		var parentFolder = makeParentFolderIds2("FolderIds", this.argument);
exchWebService.commonFunctions.LOG(" ###2 ");
		req.addChildTagObject(parentFolder);
exchWebService.commonFunctions.LOG(" ###3 ");

		//exchWebService.commonFunctions.LOG(" ++ xml2jxon ++:"+this.parent.makeSoapMessage(req));

		//exchWebService.commonFunctions.LOG("erGetFolderRequest.execute:"+String(this.parent.makeSoapMessage(req)));
                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);

	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		//exchWebService.commonFunctions.LOG("erGetFolderRequest.onSendOk:"+String(aResp));
		// Get FolderID and ChangeKey
		var aContinue = true;
		var aError = false;
		var aCode = 0;
		var aMsg = "";
		var aResult = undefined;

		try {
			var responseCode = aResp..nsMessages::ResponseCode.toString();
		}
		catch(err) {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_RESPONS_NOT_VALID, "Respons does not contain expected field");
			return;
		}

		if (responseCode != "NoError") {
			this.onSendError(aExchangeRequest, this.parent.ER_ERROR_SOAP_ERROR, "Error on getfolder:"+responseCode);
			return;
		}
		else {
			try {
				var folderID = aResp.nsSoap::Body.nsMessages::GetFolderResponse..nsTypes::FolderId.@Id.toString();
				var changeKey = aResp.nsSoap::Body.nsMessages::GetFolderResponse..nsTypes::FolderId.@ChangeKey.toString();
				var folderClass = aResp.nsSoap::Body.nsMessages::GetFolderResponse..nsTypes::FolderClass.toString();
			}
			catch(err) {
				aMsg = err;
				aCode = this.parent.ER_ERROR_FINDFOLDER_FOLDERID_DETAILS;
				aContinue = false;
				aError = true;
			}
		}

		if (aError) {
			this.onSendError(aExchangeRequest, aCode, aMsg);
		}
		else {
			if (this.mCbOk) {
				this.properties = aResp;
				this.displayName = aResp.nsSoap::Body.nsMessages::GetFolderResponse..nsTypes::DisplayName[0].toString();
				this.mCbOk(this, folderID, changeKey, folderClass);
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


