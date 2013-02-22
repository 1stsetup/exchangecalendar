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
 * -- Global Functions for Exchange Calendar and Exchange Contacts.
 * -- For Thunderbird.
 *
 * Author: Michel Verbraak (info@1st-setup.nl)
 * Website: http://www.1st-setup.nl/wordpress/?page_id=133
 * email: info@1st-setup.nl
 *
 *
 * ***** BEGIN LICENSE BLOCK *****/

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var Cr = Components.results;
var components = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource:///modules/Services.jsm");
Cu.import("resource://exchangecalendar/ecFunctions.js");

var EXPORTED_SYMBOLS = [];

if (! exchWebService) var exchWebService = {};

exchWebService.accountFunctions = {

		prefs: Cc["@mozilla.org/preferences-service;1"]
		                    .getService(Ci.nsIPrefService)
				    .getBranch("extensions.exchangeWebServices.accounts."),

		logInfo: function _logInfo(message)
		{
			exchWebService.commonFunctions.LOG("[exchWebService.accountFunctions] "+message + " ("+exchWebService.commonFunctions.STACKshort()+")");
		},

		getAccountIds: function _getAccountIds()
		{
			var ids = exchWebService.commonFunctions.safeGetCharPref(this.prefs, "ids", "");
			this.logInfo("ids:"+ids);
			return ids.split(",");
		},

		getAccounts: function _getAccounts()
		{
			var result = {};
			var ids = this.getAccountIds()
			for (var index in ids) {

				if (ids[index] != "") {
					this.logInfo("id:"+ids[index]);
					result[ids[index]] = {};
					this.getAccountById(ids[index], result[ids[index]]);
				}
			}

			return result;
		},

		getAccountById: function _getAccountById(aId, aAccount)
		{
			var result = false;

			this.logInfo("id:"+aId);
			var children = this.prefs.getChildList(aId+".",{});
			if (children.length > 0) {
				result = true;
				aAccount["id"] = aId;
				for (var index in children) {
					var attribute = children[index].substr(children[index].indexOf(".")+1);
					switch (this.prefs.getPrefType(children[index])) {
					case this.prefs.PREF_STRING:
						aAccount[attribute] = this.prefs.getCharPref(children[index]);
						break;
					case this.prefs.PREF_INT:
						aAccount[attribute] = this.prefs.getIntPref(children[index]);
						break;
					case this.prefs.PREF_BOOL:
						aAccount[attribute] = this.prefs.getBoolPref(children[index]);
						break;
					}
				}
			}

			return result;
		},

		getAccountByServer: function _getAccountByServer(aServer)
		{
			var accounts = this.getAccounts();
			var account = null;
			for (var index in accounts) {
				if ((accounts[index].server) && (accounts[index].server.toLowerCase() == aServer.toLowerCase())) {
					return accounts[index];
				}
			}
		},

		saveAccount: function _saveAccount(aAccount)
		{
			for (var index in aAccount) {
				switch (typeof(aAccount[index])) {
				case "string": 
					this.prefs.setCharPref(aAccount.id+"."+index, aAccount[index]);
					break;
				case "number":
					this.prefs.setIntPref(aAccount.id+"."+index, aAccount[index]);
					break;
				case "boolean":
					this.prefs.setBoolPref(aAccount.id+"."+index, aAccount[index]);
					break;
				default:
					this.logInfo("Unknown object index:"+index);
				}
			}

			// Check if the ids all ready exists. If not add it.
			var ids = this.getAccountIds();
			var idExists = false;
			for (var index in ids) {
				if (ids[index] == aAccount.id) {
					idExists = true;
					break;
				}
			}
			if (!idExists) {
				ids.push(aAccount.id);
				ids = ids.join(",");
				this.prefs.setCharPref("ids", ids);
			}
		},

		removeAccount: function _removeAccount(aAccount)
		{
			if (aAccount.id) {
				this.removeAccountById(aAccount.id);
			}
		},

		removeAccountById: function _removeAccountById(aAccountId)
		{
			this.prefs.deleteBranch(aAccountId);
			// Remove from ids list.
			var oldIds = this.getAccountIds();
			var newIds = [];
			for (var index in oldIds) {
				if (oldIds[index] != aAccountId) {
					newIds.push(oldIds[index]);
				}
			}

			if (newIds.length > 0) {
				newIds = newIds.join(",");
			}
			else {
				newIds = "";
			}
			this.prefs.setCharPref("ids", newIds);
		},


}


