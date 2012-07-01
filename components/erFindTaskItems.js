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

var EXPORTED_SYMBOLS = ["erFindTaskItemsRequest"];

function erFindTaskItemsRequest(aArgument, aCbOk, aCbError, aListener)
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
	this.itemFilter = aArgument.itemFilter;

	this.isRunning = true;
	this.execute();
}

erFindTaskItemsRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erGetTaskItemsRequest.execute\n");

		var req = <nsMessages:FindItem xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;
		req.@Traversal = "Shallow";

//		req.nsMessages::ItemShape.nsTypes::BaseShape = "IdOnly";
		req.nsMessages::ItemShape.nsTypes::BaseShape = "AllProperties";

/*		req.nsMessages::Restriction.nsTypes::IsEqualTo.content = <>
		    	<nsTypes:FieldURI FieldURI="item:ItemClass" xmlns:nsTypes={nsTypes}/>

		    	<nsTypes:FieldURIOrConstant xmlns:nsTypes={nsTypes}>
			    	<nsTypes:Constant Value="IPM.Task" xmlns:nsTypes={nsTypes}/>
		    	</nsTypes:FieldURIOrConstant>
		    </>;*/



		req.nsMessages::ParentFolderIds = makeParentFolderIds("ParentFolderIds", this.argument);

                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
		/*
		 * We want to include all Single items, all Exception items, but also
		 * at least one Occurrence or Exception item for each master.
		 * If we include too many Occurrences, we will query for the master
		 * too often, but if we don't include any, we might not query for the
		 * master at all.
		 *
		 * We first collect all non-Occurrences, and after that we fill in
		 * Occurrence for those masters that did not yet see any Exception.
		 */

		var uids = {};
		var ids = [];
		for each (var e in aResp..nsTypes::Task) {
			ids.push({Id: e.nsTypes::ItemId.@Id.toString(),
				  ChangeKey: e.nsTypes::ItemId.@ChangeKey.toString()});
		}
	
		if (this.mCbOk) {
			this.mCbOk(this, ids);
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


