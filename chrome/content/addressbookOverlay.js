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
var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var Cr = Components.results;
var components = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource:///modules/mailServices.js");

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/exchangeAbFunctions.js");

if (! exchWebService) var exchWebService = {};

exchWebService.addressbookOverlay = {

	deletePrevStatus : null,

	doAddExchangeAccount: function _doAddExchangeAccount()
	{
		// TODO: We should open a dialog and ask for ActiveDirectory details.
	//	var newName = getUUID();

		var input = { selectedDirectory: null,
			      answer: "",
			      newAccountObject: null
				};
		window.openDialog("chrome://exchangecalendar/content/exchangeContactSettings.xul",
				"createexchangeaccount",
				"chrome,titlebar,toolbar,centerscreen,dialog,modal=yes,resizable=yes",
				input); 

	/*	var newAccountObject = {
				description: newName,
				mailbox: "MVerbraak@intercommit.nl",
				user: "michelv",
				domain: "office",
				serverUrl: "https://mail.intercommit.nl/EWS/Exchange.asmx",
				folderBase: "contacts",
				folderPath: "/",
				folderID: null,
				changeKey: null };*/

		if (input.answer == "saved") {
			var newUUID = exchWebService.commonAbFunctions.addAccount(input.newAccountObject);	


			this.prefs = Cc["@mozilla.org/preferences-service;1"]
			    	.getService(Ci.nsIPrefService)
			    	.getBranch("extensions.exchangecontacts@extensions.1st-setup.nl.account."+newUUID+".");

			this.prefs.setIntPref("pollinterval", input.newAccountObject.pollinterval);
			this.prefs.setBoolPref("globalAddressList", input.newAccountObject.addGlobalAddressList);


			var theParentDirectory = MailServices.ab.getDirectory("exchWebService-contactRoot-directory://")
							.QueryInterface(Ci.nsIAbDirectory);

			var targetURI = "exchWebService-contactRoot-directory://" + newUUID;
			var theChildDirectory = MailServices.ab.getDirectory(targetURI)
							.QueryInterface(Ci.nsIAbDirectory);

			MailServices.ab.notifyDirectoryItemAdded(theParentDirectory, theChildDirectory);
		}
	},

	doDeleteExchangeAccount:function _doDeleteExchangeAccount()
	{
		exchWebService.commonAbFunctions.logInfo("1. doDeleteExchangeAccount\n");

		var theParentDirectory = MailServices.ab.getDirectory("exchWebService-contactRoot-directory://")
						.QueryInterface(Ci.nsIAbDirectory);

		var theChildDirectory = MailServices.ab.getDirectory(GetSelectedDirectory())
						.QueryInterface(Ci.nsIAbDirectory);

		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]		
						.getService(Components.interfaces.nsIPromptService);
		if (promptService.confirm(null, exchWebService.commonFunctions.getString("ExchangeContacts","promtpDeleteDirectoryTitle",[],"exchangecalendar"), 
				exchWebService.commonFunctions.getString("ExchangeContacts","promptDeleteDirectoryText",[theChildDirectory.dirName],"exchangecalendar"))) {	
			exchWebService.commonAbFunctions.deleteAccount(theChildDirectory.uuid);

			MailServices.ab.notifyDirectoryItemDeleted(theParentDirectory, theChildDirectory);
		}

		exchWebService.commonAbFunctions.logInfo("2. doDeleteExchangeAccount\n");
	},

	onDirTreeSelect: function _onDirTreeSelect()
	{
		var selectedDir = GetSelectedDirectory();

		if ((selectedDir) && (selectedDir == "exchWebService-contactRoot-directory://")) {

			document.getElementById("button-deleteexchangeaccount").hidden = true;
			document.getElementById("button-addexchangeaccount").hidden = false;

			document.getElementById("button-newcard").disabled = true;
			document.getElementById("menu_newContact").disabled = true;


			//document.getElementById("cmd_delete").setAttribute('disabled','true');
			document.getElementById("button_delete").setAttribute('disabled','true');

			document.getElementById("cmd_deleteexchange").setAttribute('disabled','true');

			document.getElementById("menu_deleteexchangecontact").setAttribute('disabled','true');

			document.getElementById("dirTreeContext-delete").hidden = false;
			document.getElementById("dirTreeContext_deleteexchangecontact").hidden = true;
		} 
		else {
			if ((selectedDir) && (selectedDir.indexOf("exchWebService-contactFolder-directory://") > -1)) {

				document.getElementById("button-deleteexchangeaccount").hidden = false;
				document.getElementById("button-addexchangeaccount").hidden = true;

				//document.getElementById("cmd_delete").setAttribute('disabled','true');
				document.getElementById("button_delete").setAttribute('disabled','true');

				document.getElementById("cmd_deleteexchange").setAttribute('disabled','false');

				document.getElementById("button-newcard").disabled = false;
				document.getElementById("menu_newContact").disabled = false;

				document.getElementById("menu_deleteexchangecontact").setAttribute('disabled','false');

				document.getElementById("dirTreeContext-delete").hidden = true;
				document.getElementById("dirTreeContext_deleteexchangecontact").hidden = false;
			}
			else {

				document.getElementById("button-deleteexchangeaccount").hidden = true;
				document.getElementById("button-addexchangeaccount").hidden = false;

				document.getElementById("button-newcard").disabled = false;
				document.getElementById("menu_newContact").disabled = false;

				document.getElementById("cmd_deleteexchange").setAttribute('disabled','true');

				document.getElementById("menu_deleteexchangecontact").setAttribute('disabled','true');

				document.getElementById("dirTreeContext-delete").hidden = false;
				document.getElementById("dirTreeContext_deleteexchangecontact").hidden = true;
			}
		}

		exchWebService.commonAbFunctions.logInfo("ondirTreeSelect selectedDir:"+selectedDir+"\n");
	},

	onLoad: function _onLoad()
	{
		document.getElementById("dirTree").addEventListener("select", function(){exchWebService.addressbookOverlay.onDirTreeSelect()}, true);
		document.getElementById("dirTree").addEventListener("focus", function(){exchWebService.addressbookOverlay.onDirTreeSelect()}, true);
		document.getElementById("dirTree").addEventListener("addrbook-select", function(){exchWebService.addressbookOverlay.onDirTreeSelect()}, true);
	},
}

window.addEventListener("load", function(){exchWebService.addressbookOverlay.onLoad();}, false);
