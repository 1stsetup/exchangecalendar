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

Cu.import("resource://1st-setup/ecFunctions.js");
Cu.import("resource://1st-setup/accountFunctions.js");
Cu.import("resource://exchangecalendar/erAutoDiscover.js");
Cu.import("resource://exchangecalendar/erPrimarySMTPCheck.js");
Cu.import("resource://exchangecalendar/erGetFolder.js");

//Cu.import("resource://calendar/modules/calUtils.jsm");

if (! exchWebService) var exchWebService = {};

exchWebService.manageEWSAccounts = {

	_detailsChecked: false,
	_detailsChanged: false,
	selectedAccount: {},

	set detailsChecked(aValue)
	{
		this._detailsChecked = aValue;

		this.checkRequired();
	},

	set detailsChanged(aValue)
	{
		this._detailsChanged = aValue;
		if (aValue) {
			document.getElementById("exchWebService_manageEWSAccounts_save_button").hidden = false;
		}
		else {
			document.getElementById("exchWebService_manageEWSAccounts_save_button").hidden = true;
		}
	},

	detailsOk: false,

	checkRequired: function _checkRequired()
	{
		let canAdvance = true;
		let vbox = document.getElementById('exchWebService-account-settings');
		if (vbox) {
			let eList = vbox.getElementsByAttribute('required', 'true');
			for (let i = 0; i < eList.length && canAdvance; ++i) {

				if (!eList[i].hidden) {
					canAdvance = (eList[i].value != "");
				}
			}

			if (canAdvance) {
				if (document.getElementById("exchWebService_autodiscover").checked) {
					document.getElementById("exchWebService_autodiscovercheckbutton").hidden = false;
					document.getElementById("exchWebService_servercheckbutton").hidden = true;
				}
				else {
					document.getElementById("exchWebService_autodiscovercheckbutton").hidden = true;
					document.getElementById("exchWebService_servercheckbutton").hidden = false;
				}
			}
			else {
				document.getElementById("exchWebService_autodiscovercheckbutton").hidden = true;
				document.getElementById("exchWebService_servercheckbutton").hidden = true;
			}
		}

		if (window) {
			window.sizeToContent();
		}
	},

	logInfo: function _logInfo(aMsg)
	{
		exchWebService.commonFunctions.LOG(aMsg);
	},

	onLoad: function _onLoad()
	{
		// Load the exchWebService_manageEWSAccounts_accounts_listbox
		var listbox = document.getElementById("exchWebService-manageEWSAccounts-accounts-listbox");
		if (listbox) {
			while (listbox.itemCount > 0) {
				listbox.removeItemAt(0);
			}
		}

		var accounts = exchWebService.accountFunctions.getAccounts();

		for (var index in accounts) {
			if (listbox) {
				var newItem = listbox.appendItem( accounts[index].name, accounts[index].id);
			}
		}
	},

	showDetails: function _showDetails(aAccount)
	{
		document.getElementById("exchWebService_autodiscover").disabled = false;

		document.getElementById("exchWebService_manageEWSAccounts_account_name").value = aAccount.name;
		document.getElementById("exchWebService_manageEWSAccounts_account_name").disabled = false;

		document.getElementById("exchWebService_server").value = aAccount.server;
		document.getElementById("exchWebService_server").disabled = false;

		document.getElementById("exchWebService_mailbox").value = aAccount.mailbox;
		document.getElementById("exchWebService_mailbox").disabled = false;

		document.getElementById("exchWebService_windowsuser").value = aAccount.user;
		document.getElementById("exchWebService_windowsuser").disabled = false;
	},

	disableDetails: function _showDetails(aAccount)
	{
		document.getElementById("exchWebService_autodiscover").disabled = true;

		document.getElementById("exchWebService_manageEWSAccounts_account_name").value = "";
		document.getElementById("exchWebService_manageEWSAccounts_account_name").disabled = true;

		document.getElementById("exchWebService_server").value = "";
		document.getElementById("exchWebService_server").disabled = true;

		document.getElementById("exchWebService_mailbox").value = "";
		document.getElementById("exchWebService_mailbox").disabled = true;

		document.getElementById("exchWebService_windowsuser").value = "";
		document.getElementById("exchWebService_windowsuser").disabled = true;

		this.detailsChanged = false;
		this.detailsChecked = true;
	},

	onSelect: function _onSelect()
	{
		var item = document.getElementById("exchWebService-manageEWSAccounts-accounts-listbox").selectedItem;

		this.selectedAccount = {};
		if (item == null) {
			this.disableDetails();
			document.getElementById("exchWebService_manageEWSAccounts_removeAccount_button").disabled = true;
			return;
		}

		if (!exchWebService.accountFunctions.getAccountById(item.value, this.selectedAccount)) return;

		this.showDetails(this.selectedAccount);			

		document.getElementById("exchWebService_server_status").status = 0;
		document.getElementById("exchWebService_mailbox_status").status = 0;

		document.getElementById("exchWebService_manageEWSAccounts_removeAccount_button").disabled = false;
	},

	onClose: function _onClose()
	{
		return true;
	},

	addNewAccount: function _addNewAccount()
	{
		this.selectedAccount = {
				id : exchWebService.commonFunctions.getUUID(),
				name: "new Account",
				server: "",
				user: "",
				mailbox: "" };
		exchWebService.accountFunctions.saveAccount(this.selectedAccount);
		var listbox = document.getElementById("exchWebService-manageEWSAccounts-accounts-listbox");
		if (listbox) {
			var newItem = listbox.appendItem( this.selectedAccount.name, this.selectedAccount.id);
			listbox.selectedItem = newItem;
		}
	},

	removeAccount: function _removeAccount()
	{
		exchWebService.accountFunctions.removeAccount(this.selectedAccount);
		
		var listbox = document.getElementById("exchWebService-manageEWSAccounts-accounts-listbox");
		if (listbox) {
			var oldIndex = listbox.selectedIndex;
			listbox.selectedIndex = -1;
			listbox.removeItemAt(oldIndex);

			if (listbox.itemCount == 0) {
				this.disableDetails();
				document.getElementById("exchWebService_manageEWSAccounts_removeAccount_button").disabled = true;
			}
			else {
				if (oldIndex == listbox.itemCount) {
					oldIndex--;
				}
				listbox.selectedIndex = oldIndex;
			}
		}

	},

	saveAccount: function _saveAccount()
	{
		this.detailsChanged = false;
		exchWebService.accountFunctions.saveAccount(this.selectedAccount);
		document.getElementById("exchWebService-manageEWSAccounts-accounts-listbox").selectedItem.label = this.selectedAccount.name;
	},

	doAutodiscoverChanged: function _doAutodiscoverChanged(aCheckBox)
	{
		if (aCheckBox.checked) {
			document.getElementById("exchWebService_mailboxrow").hidden = false;
			document.getElementById("exchWebService_mailboxrow").setAttribute("required", "true");
			document.getElementById("exchWebService_serverrow").hidden = true;
		}
		else {
			document.getElementById("exchWebService_mailboxrow").hidden = true;
			document.getElementById("exchWebService_mailboxrow").setAttribute("required", "false");
			document.getElementById("exchWebService_serverrow").hidden = false;
		}
		this.detailsChecked = false;
	},

	doNameChanged: function _doNameChanged(aTextBox)
	{
		this.detailsChanged = true;
		this.selectedAccount.name = aTextBox.value;
	},

	doServerChanged: function _doServerChanged(aTextBox)
	{
		document.getElementById("exchWebService_server_status").status = 0;
		this.detailsChecked = false;
		this.selectedAccount.server = aTextBox.value;
		if (aTextBox.value != "") {
			var serverExists = exchWebService.accountFunctions.getAccountByServer(this.selectedAccount.server);
			if ((serverExists != null) && (serverExists.id != this.selectedAccount.id)) {
				// We allready have an account with the same server. warn and remove save button.
				this.detailsChanged = false;
				return;
			}
		}
		this.detailsChanged = true;
	},

	doMailboxChanged: function _doMailboxChanged(aTextBox)
	{
		document.getElementById("exchWebService_mailbox_status").status = 0;
		this.detailsChecked = false;
		this.detailsChanged = true;
		this.selectedAccount.mailbox = aTextBox.value;
	},

	doUserChanged: function _doUserChanged(aTextBox)
	{
		this.detailsChecked = false;
		this.detailsChanged = true;
		this.selectedAccount.user = aTextBox.value;
	},

	doAutodiscoverCheck: function _doAutodiscoverCheck()
	{
		document.getElementById("exchWebService_autodiscovercheckbutton").disabled = true;

		try {
			window.setCursor("wait");
			var user = document.getElementById("exchWebService_windowsuser").value;
			var mailbox = document.getElementById("exchWebService_mailbox").value;
			var tmpObject = new erAutoDiscoverRequest( 
				{user: user, 
				 mailbox: mailbox}, 
				 this.autodiscoveryOK, 
				 this.autodiscoveryError, null);
		}
		catch(err) {
			window.setCursor("auto");
			exchWebService.commonFunctions.ERROR("Warning: Could not create erAutoDiscoverRequest. Err="+err+"\n");
		}
	},

	autodiscoveryOK: function _autodiscoveryOK(ewsUrls, DisplayName, SMTPAddress)
	{
		exchWebService.commonFunctions.LOG("ecAutodiscoveryOK");
		var selectedEWSUrl = {value:undefined};
		var userCancel = false;

		if (ewsUrls) {
			if (ewsUrls.length() > 1) {
				// We have got multiple ews urls returned. Let the use choose.

				window.openDialog("chrome://exchangecalendar/content/selectEWSUrl.xul",
					"selectfrommultipleews",
					"chrome,titlebar,toolbar,centerscreen,dialog,modal=yes,resizable=no",
					ewsUrls, selectedEWSUrl); 

				if ((!selectedEWSUrl.value) || (selectedEWSUrl.value == "")) {
					exchWebService.commonFunctions.LOG("  ++++ Selection canceled by user");
					userCancel = true;
				}
			}
			else {
				// We only have one url. Use it.
				selectedEWSUrl.value = ewsUrls.text();
			}

		}

		if (!userCancel) {
			document.getElementById("exchWebService_server").value = selectedEWSUrl.value; 
			document.getElementById("exchWebService_serverrow").hidden = false; 
			document.getElementById("exchWebService_mailboxrow").hidden = false; 

			gexchWebServicesDetailsChecked = true;
			document.getElementById("exchWebService_autodiscovercheckbutton").disabled = false;
			document.getElementById("exchWebService_autodiscover").checked = false;
		}
		else {
			document.getElementById("exchWebService_autodiscovercheckbutton").disabled = false;
		}

		window.setCursor("auto");
		this.detailsChecked = true;
		document.getElementById("exchWebService_server_status").status = 2;
		document.getElementById("exchWebService_mailbox_status").status = 2;
	},

	autodiscoveryError: function _autodiscoveryError(aExchangeRequest, aCode, aMsg)
	{
		exchWebService.commonFunctions.LOG("ecAutodiscoveryError. aCode:"+aCode+", aMsg:"+aMsg);
		switch (aCode) {
		case -20:
		case -30:
			break;
		case -6:
		case -9:
		case -10:
		case -14:
		case -15:
		case -16:
		case -17:
		case -18:
			alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorAutodiscoveryURLInvalid", [document.getElementById("exchWebService_mailbox").value], "exchangecalendar"));
			break;
		default:
			alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorAutodiscovery", [aMsg, aCode], "exchangecalendar"));
		}

		document.getElementById("exchWebService_autodiscovercheckbutton").disabled = false;
		window.setCursor("auto");
		this.detailsChecked = false;
		document.getElementById("exchWebService_mailbox_status").status = 1;
	},

	doCheckServer: function _doCheckServer()
	{
		document.getElementById("exchWebService_servercheckbutton").disabled = true;


		try {
			window.setCursor("wait");
			var user = document.getElementById("exchWebService_windowsuser").value;
			var tmpObject = new erGetFolderRequest(
				{user: user, 
				 mailbox: "",
				 folderBase: "publicfoldersroot",
				 folderPath: "/",
				 serverUrl: document.getElementById("exchWebService_server").value}, this.checkServerOK, this.checkServerError)
		}
		catch(err) {
			window.setCursor("auto");
			exchWebService.commonFunctions.ERROR("Warning: Error during creation of erGetFolderRequest. Err="+err+"\n");
		}
	},

	checkServerOK: function _checkServerOK( folderID, changeKey, folderClass)
	{

		document.getElementById("exchWebService_servercheckbutton").disabled = false;
		window.setCursor("auto");
		this.detailsChecked = true;
		document.getElementById("exchWebService_server_status").status = 2;
	},

	checkServerError: function _checkServerError(aExchangeRequest, aCode, aMsg)
	{
		exchWebService.commonFunctions.LOG("exchWebServicesCheckServerError");
		switch (aCode) {
		case -20:
		case -30:
			break;
		case -6:
			alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerCheckURLInvalid", [document.getElementById("exchWebService_server").value], "exchangecalendar"));
			break;
		default:
			alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerCheck", [aMsg, aCode], "exchangecalendar"));
		}
		document.getElementById("exchWebService_servercheckbutton").disabled = false;

		window.setCursor("auto");
		this.detailsChecked = false;
		document.getElementById("exchWebService_server_status").status = 1;
	},
}

