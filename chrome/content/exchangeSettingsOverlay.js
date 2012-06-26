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

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

//Cu.import("resource://calendar/modules/calUtils.jsm");

//Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/erAutoDiscover.js");
Cu.import("resource://exchangecalendar/erPrimarySMTPCheck.js");
Cu.import("resource://exchangecalendar/erConvertID.js");
Cu.import("resource://exchangecalendar/erFindFolder.js");
Cu.import("resource://exchangecalendar/erGetFolder.js");

Cu.import("resource://exchangecalendar/ecFunctions.js");

if (! exchWebService) var exchWebService = {};

var gexchWebServicesDetailsChecked = false;
var gexchWebServices2ndDetailsChecked = true;

var exchWebServicesgAutoDiscover = false;
var exchWebServicesgServer = "";
var exchWebServicesgMailbox = "";
var exchWebServicesgDisplayName = "";
var exchWebServicesgUser = "";
var exchWebServicesgDomain = "";
var exchWebServicesgFolderIdOfShare = "";
var exchWebServicesgFolderBase = "calendar";
var exchWebServicesgFolderPath = "/";
var exchWebServicesgFolderID = "";
var exchWebServicesgChangeKey = "";

function exchWebServicesValidUsernameDomain()
{
	return true;

/*	if ((document.getElementById("exchWebService_windowsuser").value.indexOf("@") > -1) &&
		(document.getElementById("exchWebService_windowsdomain").value == "")) {
		return true;
	}

	if ((document.getElementById("exchWebService_windowsuser").value.indexOf("@") == -1) &&
		(document.getElementById("exchWebService_windowsdomain").value != "")) {
		return true;
	}

	return false; */
}

function exchWebServicesCheckRequired() {

	if (!gexchWebServicesDetailsChecked) {
		document.getElementById("exchWebService_folderbaserow").hidden = true;
		document.getElementById("exchWebService_folderpathrow").hidden = true;
		document.getElementById("exchWebServices-SharedFolderID").hidden = true;
		document.getElementById("exchWebServices-UserAvailability").hidden = true;
	}

	if ((!gexchWebServices2ndDetailsChecked) || (!gexchWebServicesDetailsChecked)) {
		document.getElementById("exchWebService_detailschecked").setAttribute("required", true);
	}
	else {
		document.getElementById("exchWebService_detailschecked").setAttribute("required", false);
	}

	if (document.getElementById("exchWebService_autodiscover").checked) {

		exchWebServicesChangeFolderbaseMenuItemAvailability(false);

		document.getElementById("exchWebService_mailbox").setAttribute("required", true);
		document.getElementById("exchWebService_servercheckrow").hidden = true;

		if ( (document.getElementById("exchWebService_mailbox").value == "") ||
		     (!exchWebServicesValidUsernameDomain()) ) {
			document.getElementById("exchWebService_autodiscovercheckrow").hidden = true;
			document.getElementById("exchWebService_serverandmailboxcheckrow").hidden = true;
		}
		else {
			document.getElementById("exchWebService_autodiscovercheckrow").hidden = false;
			document.getElementById("exchWebService_serverandmailboxcheckrow").hidden = true;
		}
		document.getElementById("exchWebService_server").disabled = true;
	}
	else {
		document.getElementById("exchWebService_mailbox").setAttribute("required", false);

		if (document.getElementById("exchWebService_mailbox").value == "") {

			if (document.getElementById("exchWebService_mailbox").value == "") {
				exchWebServicesChangeFolderbaseMenuItemAvailability(true);
				document.getElementById("menuitem.label.ecfolderbase.publicfoldersroot").disabled = false;
			}

			// No mailbox specified. We only do server check.
			if ( (document.getElementById("exchWebService_server").value == "") ||
			     (!exchWebServicesValidUsernameDomain()) ) {
				document.getElementById("exchWebService_autodiscovercheckrow").hidden = true;
				document.getElementById("exchWebService_serverandmailboxcheckrow").hidden = true;
				document.getElementById("exchWebService_servercheckrow").hidden = true;
			}
			else {
				document.getElementById("exchWebService_autodiscovercheckrow").hidden = true;
				document.getElementById("exchWebService_serverandmailboxcheckrow").hidden = true;
				document.getElementById("exchWebService_servercheckrow").hidden = false;
			}
		}
		else {
			exchWebServicesChangeFolderbaseMenuItemAvailability(false);

			// No mailbox specified. We do server and mailbox check
			// No mailbox specified. We only do server check.
			if ( (document.getElementById("exchWebService_server").value == "") ||
			     (!exchWebServicesValidUsernameDomain()) ) {
				document.getElementById("exchWebService_autodiscovercheckrow").hidden = true;
				document.getElementById("exchWebService_serverandmailboxcheckrow").hidden = true;
				document.getElementById("exchWebService_servercheckrow").hidden = true;
			}
			else {
				document.getElementById("exchWebService_autodiscovercheckrow").hidden = true;
				document.getElementById("exchWebService_serverandmailboxcheckrow").hidden = false;
				document.getElementById("exchWebService_servercheckrow").hidden = true;
			}
		}

		document.getElementById("exchWebService_server").disabled = false;
	}
	
	if (gexchWebServicesDetailsChecked) {
		document.getElementById("exchWebService_autodiscovercheckrow").hidden = true;
		document.getElementById("exchWebService_serverandmailboxcheckrow").hidden = true;
		document.getElementById("exchWebService_servercheckrow").hidden = true;

		document.getElementById("exchWebService_folderbaserow").hidden = (exchWebServicesgFolderIdOfShare != "");
		document.getElementById("exchWebService_folderpathrow").hidden = (exchWebServicesgFolderIdOfShare != "");

		document.getElementById("exchWebServices-SharedFolderID").hidden = (exchWebServicesgFolderIdOfShare == "");
		
	}

	// We determine which to use on the dialog id which is active for the current document.
	if (document.getElementById("exchWebService_ContactSettings_dialog")) {   // Contact settings dialog.
		exchWebService.exchangeContactSettings.checkRequired();
	}
	else {
		if (document.getElementById("exchWebService_ExchangeSettings_dialog")) { // EWS Settings dialog.
			exchWebService.exchangeSettings.checkRequired();
		}
		else {
			if (document.getElementById("exchWebService_CloneSettings_dialog")) { // Clone Settings dialog.
				exchWebService.exchangeCloneSettings.checkRequired();
			}
			else {
				try {
					checkRequired();  // On creating a new calendar. Default Lightning create calendar wizard.
				}
				catch(ex) {
					exchWebService.commonFunctions.LOG("NO checkRequired found.");
				}
			}
		}
	}

	if (window) {
		window.sizeToContent();
	}
}

function exchWebServicesAutodiscoverCheckbox(aCheckBox)
{
	exchWebServicesgAutoDiscover = aCheckBox.checked;
	gexchWebServicesDetailsChecked = false;
	exchWebServicesCheckRequired();
}

function exchWebServicesInitMailbox(aNewValue)
{
	exchWebServicesgMailbox = aNewValue;
	gexchWebServicesDetailsChecked = false;
	exchWebServicesCheckRequired();
}

function exchWebServicesDoMailboxChanged(aTextBox)
{
	exchWebServicesgMailbox = aTextBox.value;
	document.getElementById("exchWebService_displayname").value = "";
	exchWebServicesgDisplayName = "";
	gexchWebServicesDetailsChecked = false;
	exchWebServicesCheckRequired();
}

function exchWebServicesDoUserChanged(aTextBox)
{
	exchWebServicesgUser = aTextBox.value;
	if (exchWebServicesgUser.indexOf("@") > -1) {
		document.getElementById("exchWebService_windowsdomain").disabled = true;
		document.getElementById("exchWebService_windowsdomain").value = "";
		//document.getElementById("exchWebService_windowsdomain").setAttribute("required", false);
		exchWebServicesgDomain = "";
	}
	else {
		document.getElementById("exchWebService_windowsdomain").disabled = false;
		//document.getElementById("exchWebService_windowsdomain").setAttribute("required", true);
	}

	gexchWebServicesDetailsChecked = false;
	exchWebServicesCheckRequired();
}

function exchWebServicesDoDomainChanged(aTextBox)
{
	exchWebServicesgDomain = aTextBox.value;
	gexchWebServicesDetailsChecked = false;
	exchWebServicesCheckRequired();
}

function exchWebServicesDoFolderIdOfShareChanged(aTextBox)
{
	exchWebServicesgFolderIdOfShare = aTextBox.value;
	gexchWebServicesDetailsChecked = false;
	exchWebServicesCheckRequired();
}

function exchWebServicesDoServerChanged(aTextBox)
{
	exchWebServicesgServer = aTextBox.value;
	gexchWebServicesDetailsChecked = false;
	exchWebServicesCheckRequired();
}

// newStatus = true will disable folderbase menuitems
// newStatus = false will enable all folderbase menuitems

function exchWebServicesChangeFolderbaseMenuItemAvailability(newStatus)
{
	var menuItem = document.getElementById("menupopup.ecfolderbase").firstChild;
	while (menuItem) {
		if (! menuItem.hasAttribute("donotchange")) {
			menuItem.disabled = newStatus;
		}
		menuItem = menuItem.nextSibling;
	}
	
}

function exchWebServicesDoFolderBaseChanged(aMenuList)
{
	exchWebServicesgFolderBase = aMenuList.value;

	// Reset folder path
	document.getElementById("exchWebService_folderpath").value = "/";
	exchWebServicesgFolderPath = "/";

	exchWebServicesgFolderID = "";
	exchWebServicesgChangeKey = "";

	if (document.getElementById("exchWebService_folderpath").value != "/") {
		gexchWebServices2ndDetailsChecked = false;
	}
	else {
		gexchWebServices2ndDetailsChecked = true;
	}
	exchWebServicesCheckRequired();
}

function exchWebServicesGetUsername()
{
	if (exchWebServicesgUser.indexOf("@") > -1) {
		return exchWebServicesgUser;
	}
	else {
		if (exchWebServicesgDomain == "") {
			return exchWebServicesgUser;
		}
		else {
			return exchWebServicesgDomain+"\\"+exchWebServicesgUser;
		}
	}
}

function exchWebServicesDoCheckServerAndMailbox()
{
	document.getElementById("exchWebService_serverandmailboxcheckbutton").disabled = true;

	var folderIdOfShare = exchWebServicesgFolderIdOfShare;

	try {
		window.setCursor("wait");
		if ((folderIdOfShare) && (folderIdOfShare != "")) {
			var tmpObject = new erConvertIDRequest(
				{user: exchWebServicesGetUsername(), 
				 mailbox: exchWebServicesgMailbox,
				 serverUrl: exchWebServicesgServer,
				 folderId: folderIdOfShare}, exchWebServicesConvertIDOK, exchWebServicesConvertIDError);
		}
		else {
			var tmpObject = new erPrimarySMTPCheckRequest(
				{user: exchWebServicesGetUsername(), 
				 mailbox: exchWebServicesgMailbox,
				 serverUrl: exchWebServicesgServer,
				 folderBase: "calendar"}, exchWebServicesCheckServerAndMailboxOK, exchWebServicesCheckServerAndMailboxError);
		}
	}
	catch(err) {
		window.setCursor("auto");
		exchWebService.commonFunctions.ERROR("Warning: Error during creation of erPrimarySMTPCheckRequest. Err="+err+"\n");
	}
}

function exchWebServicesConvertIDOK(aFolderID, aMailbox)
{
	exchWebService.commonFunctions.LOG("exchWebServicesConvertIDOK: aFolderID:"+aFolderID+", aMailbox:"+aMailbox);

	try {
		window.setCursor("wait");
		var tmpObject = new erGetFolderRequest(
			{user: exchWebServicesGetUsername(), 
			 mailbox: aMailbox,
			 serverUrl: exchWebServicesgServer,
			 folderID: aFolderID}, exchWebServicesGetFolderOK, exchWebServicesGetFolderError);
	}
	catch(err) {
		window.setCursor("auto");
		exchWebService.commonFunctions.ERROR("Warning: Error during creation of erPrimarySMTPCheckRequest (2). Err="+err+"\n");
	}
}

function exchWebServicesConvertIDError(aExchangeRequest, aCode, aMsg)
{
	gexchWebServicesDetailsChecked = false;
	switch (aCode) {
	case -20:
	case -30:
		break;
	case -6:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerCheckURLInvalid", [exchWebServicesgServer], "exchangecalendar"));
		break;
	default:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerAndMailboxCheck", [aMsg, aCode], "exchangecalendar"));
	}
	document.getElementById("exchWebService_serverandmailboxcheckbutton").disabled = false;
	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesGetFolderOK(aExchangeRequest, aFolderID, aChangeKey, aFolderClass)
{
	exchWebService.commonFunctions.LOG("exchWebServicesGetFolderOK: aFolderID:"+aFolderID+", aChangeKey:"+aChangeKey+", aFolderClass:"+aFolderClass);

	if (aFolderClass == "IPF.Appointment") {
		exchWebServicesgFolderID = aFolderID;
		exchWebServicesgChangeKey = aChangeKey;
		gexchWebServicesDetailsChecked = true;
		gexchWebServices2ndDetailsChecked = true;
		document.getElementById("exchWebServices-SharedFolderID-label").value = aExchangeRequest.displayName;
	}
	else {
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerAndMailboxCheck", [aMsg, aCode], "exchangecalendar"));
	}
	
	document.getElementById("exchWebService_serverandmailboxcheckbutton").disabled = false;

	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesGetFolderError(aExchangeRequest, aCode, aMsg)
{
	gexchWebServicesDetailsChecked = false;
	switch (aCode) {
	case -20:
	case -30:
		break;
	case -6:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerCheckURLInvalid", [exchWebServicesgServer], "exchangecalendar"));
		break;
	default:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerAndMailboxCheck", [aMsg, aCode], "exchangecalendar"));
	}
	document.getElementById("exchWebService_serverandmailboxcheckbutton").disabled = false;
	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesCheckServerAndMailboxOK(newPrimarySMTP)
{

	if (newPrimarySMTP) {
		exchWebServicesgMailbox = newPrimarySMTP
		document.getElementById("exchWebService_mailbox").value = newPrimarySMTP;
	}

	gexchWebServicesDetailsChecked = true;
	document.getElementById("exchWebService_serverandmailboxcheckbutton").disabled = false;

	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesCheckServerAndMailboxError(aExchangeRequest, aCode, aMsg)
{
	exchWebService.commonFunctions.LOG("exchWebServicesCheckServerAndMailboxError");
	gexchWebServicesDetailsChecked = false;
	switch (aCode) {
	case -20:
	case -30:
		break;
	case -6:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerCheckURLInvalid", [exchWebServicesgServer], "exchangecalendar"));
		break;
	case -208:  // folderNotFound. 
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerAndMailboxCheckFolderNotFound", [aMsg, aCode], "exchangecalendar"));
		exchWebServicesCheckServerAndMailboxOK();
		document.getElementById("exchWebService_folderbaserow").hidden = true;
		document.getElementById("exchWebService_folderpathrow").hidden = true;
		document.getElementById("exchWebServices-UserAvailability").hidden = false;
		return;
	default:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerAndMailboxCheck", [aMsg, aCode], "exchangecalendar"));
	}
	document.getElementById("exchWebService_serverandmailboxcheckbutton").disabled = false;
	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesDoCheckServer()
{
	document.getElementById("exchWebService_servercheckbutton").disabled = true;

	
	try {
		window.setCursor("wait");
	var tmpObject = new erGetFolderRequest(
		{user: exchWebServicesGetUsername(), 
		 mailbox: "",
		 folderBase: "publicfoldersroot",
		 folderPath: "/",
		 serverUrl: exchWebServicesgServer}, exchWebServicesCheckServerOK, exchWebServicesCheckServerError)
	}
	catch(err) {
		window.setCursor("auto");
		exchWebService.commonFunctions.ERROR("Warning: Error during creation of erGetFolderRequest. Err="+err+"\n");
	}
}

function exchWebServicesCheckServerOK( folderID, changeKey, folderClass)
{

	gexchWebServicesDetailsChecked = true;
	document.getElementById("exchWebService_servercheckbutton").disabled = false;
//	exchWebServicesChangeFolderbaseMenuItemAvailability(true);
//	document.getElementById("menuitem.label.ecfolderbase.publicfoldersroot").disabled = false;

	if (exchWebServicesgFolderBase != "publicfoldersroot") {
		exchWebServicesgFolderBase = "publicfoldersroot";
		document.getElementById("exchWebService_folderbase").value = "publicfoldersroot";
		document.getElementById("exchWebService_folderpath").value = "/";
	}

	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesCheckServerError(aExchangeRequest, aCode, aMsg)
{
	exchWebService.commonFunctions.LOG("exchWebServicesCheckServerError");
	gexchWebServicesDetailsChecked = false;
	switch (aCode) {
	case -20:
	case -30:
		break;
	case -6:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerCheckURLInvalid", [exchWebServicesgServer], "exchangecalendar"));
		break;
	default:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorServerCheck", [aMsg, aCode], "exchangecalendar"));
	}
	document.getElementById("exchWebService_servercheckbutton").disabled = false;

//	exchWebServicesChangeFolderbaseMenuItemAvailability(false);

	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesDoAutodiscoverCheck()
{
	document.getElementById("exchWebService_autodiscovercheckbutton").disabled = true;

	try {
		window.setCursor("wait");
	var tmpObject = new erAutoDiscoverRequest( 
		{user: exchWebServicesGetUsername(), 
		 mailbox: exchWebServicesgMailbox}, 
		 exchWebServicesAutodiscoveryOK, 
		 exchWebServicesAutodiscoveryError, null)
	}
	catch(err) {
		window.setCursor("auto");
		exchWebService.commonFunctions.ERROR("Warning: Could not create erAutoDiscoverRequest. Err="+err+"\n");
	}
}

function exchWebServicesAutodiscoveryOK(ewsUrls, DisplayName, SMTPAddress)
{
	exchWebService.commonFunctions.LOG("ecAutodiscoveryOK");
	var selectedEWSUrl = {value:undefined};
	var userCancel = false;

	if (ewsUrls) {
		if (ewsUrls.length > 1) {
			// We have got multiple ews urls returned. Let the user choose.

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
//			selectedEWSUrl.value = ewsUrls.text();
			selectedEWSUrl.value = ewsUrls[0].value;
		}

	}

	if (!userCancel) {
		exchWebServicesgDisplayName = DisplayName;
		document.getElementById("exchWebService_displayname").value = DisplayName;

		if ((SMTPAddress) && (SMTPAddress != '')) {
			exchWebServicesgMailbox = SMTPAddress;
			document.getElementById("exchWebService_mailbox").value = SMTPAddress;
		}
	
		exchWebServicesgServer = selectedEWSUrl.value;
		document.getElementById("exchWebService_server").value = selectedEWSUrl.value; 

		gexchWebServicesDetailsChecked = true;
		document.getElementById("exchWebService_autodiscovercheckbutton").disabled = false;
		document.getElementById("exchWebService_autodiscover").checked = false;
	}
	else {
		document.getElementById("exchWebService_autodiscovercheckbutton").disabled = false;
	}

	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesAutodiscoveryError(aExchangeRequest, aCode, aMsg)
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
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorAutodiscoveryURLInvalid", [exchWebServicesgMailbox], "exchangecalendar"));
		break;
	default:
		alert(exchWebService.commonFunctions.getString("calExchangeCalendar", "ecErrorAutodiscovery", [aMsg, aCode], "exchangecalendar"));
	}

	document.getElementById("exchWebService_autodiscovercheckbutton").disabled = false;
	exchWebServicesCheckRequired();
	window.setCursor("auto");
}

function exchWebServicesLoadExchangeSettingsByCalId(aCalId)
{
	var exchWebServicesCalPrefs = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService)
		    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+aCalId+".");

	if (exchWebServicesCalPrefs) {
		document.getElementById("exchWebService_server").value = exchWebServicesCalPrefs.getCharPref("ecServer");
		document.getElementById("exchWebService_windowsuser").value = exchWebServicesCalPrefs.getCharPref("ecUser");
		if (document.getElementById("exchWebService_windowsuser").value.indexOf("@") > -1) {
			//document.getElementById("exchWebService_windowsdomain").setAttribute("required", false);
			document.getElementById("exchWebService_windowsdomain").disabled = true;
		}
		document.getElementById("exchWebService_windowsdomain").value = exchWebServicesCalPrefs.getCharPref("ecDomain");
		document.getElementById("exchWebService_folderpath").value = exchWebServicesCalPrefs.getCharPref("ecFolderpath");

		for (var i=0; i < document.getElementById("exchWebService_folderbase").itemCount; i++) {
			if (document.getElementById("exchWebService_folderbase").getItemAtIndex(i).value == exchWebServicesCalPrefs.getCharPref("ecFolderbase")) {
				document.getElementById("exchWebService_folderbase").selectedIndex = i;
			}
		}
		document.getElementById("exchWebService_mailbox").value = exchWebServicesCalPrefs.getCharPref("ecMailbox");
		if (document.getElementById("exchWebService_mailbox").value == "") {
			exchWebServicesChangeFolderbaseMenuItemAvailability(true);
			document.getElementById("menuitem.label.ecfolderbase.publicfoldersroot").disabled = false;
		}



		exchWebServicesgServer = exchWebServicesCalPrefs.getCharPref("ecServer");
		exchWebServicesgUser = exchWebServicesCalPrefs.getCharPref("ecUser");
		exchWebServicesgDomain = exchWebServicesCalPrefs.getCharPref("ecDomain");

		exchWebServicesgFolderBase = exchWebServicesCalPrefs.getCharPref("ecFolderbase");
		exchWebServicesgFolderPath = exchWebServicesCalPrefs.getCharPref("ecFolderpath");
		exchWebServicesgMailbox = exchWebServicesCalPrefs.getCharPref("ecMailbox");
		try {
			exchWebServicesgFolderID = exchWebServicesCalPrefs.getCharPref("ecFolderID");
		} catch(err) { exchWebServicesgFolderID = ""; }
		try {
			exchWebServicesgChangeKey = exchWebServicesCalPrefs.getCharPref("ecChangeKey");
		} catch(err) { exchWebServicesgChangeKey = ""; }
		try {
			exchWebServicesgFolderIdOfShare = exchWebServicesCalPrefs.getCharPref("ecFolderIDOfShare");
			document.getElementById("exchWebService_folderidofshare").value = exchWebServicesgFolderIdOfShare;
		} catch(err) { exchWebServicesgFolderIdOfShare = ""; }
	}

	gexchWebServicesDetailsChecked = true;
	gexchWebServices2ndDetailsChecked = true;

	exchWebServicesCheckRequired();
}

function exchWebServicesSaveExchangeSettingsByCalId(aCalId)
{
	var exchWebServicesCalPrefs = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService)
		    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+aCalId+".");

	if (exchWebServicesCalPrefs) {
		exchWebServicesCalPrefs.setCharPref("ecServer", exchWebServicesgServer);
		exchWebServicesCalPrefs.setCharPref("ecUser", exchWebServicesgUser);
		exchWebServicesCalPrefs.setCharPref("ecDomain", exchWebServicesgDomain);
		exchWebServicesCalPrefs.setCharPref("ecFolderpath", exchWebServicesgFolderPath);
		exchWebServicesCalPrefs.setCharPref("ecFolderbase", exchWebServicesgFolderBase);
		exchWebServicesCalPrefs.setCharPref("ecMailbox", exchWebServicesgMailbox);
	}

	if ((exchWebServicesgFolderPath == "/") && (exchWebServicesgFolderIdOfShare == "")) {
		exchWebServicesgFolderID = "";
		exchWebServicesgChangeKey = "";
	}
	exchWebServicesCalPrefs.setCharPref("ecFolderID", exchWebServicesgFolderID);
	exchWebServicesCalPrefs.setCharPref("ecChangeKey", exchWebServicesgChangeKey);

	exchWebServicesCalPrefs.setCharPref("ecFolderIDOfShare", exchWebServicesgFolderIdOfShare);

}

function exchWebServicesDoFolderBrowse()
{
	var input = { answer: "",
			parentFolder: {user: exchWebServicesGetUsername(), 
					mailbox: exchWebServicesgMailbox,
					folderBase: exchWebServicesgFolderBase,
					serverUrl: exchWebServicesgServer,
					folderID: null,
					changeKey: null} 
			};

	window.openDialog("chrome://exchangecalendar/content/browseFolder.xul",
			"browseFolder",
			"chrome,titlebar,toolbar,centerscreen,dialog,modal=yes,resizable=no",
			input); 

	if (input.answer == "select") {
		document.getElementById("exchWebService_folderpath").value = input.fullPath;
		exchWebServicesgFolderPath = input.fullPath;

		gexchWebServices2ndDetailsChecked = true;

		if (input.fullPath == "/") {
			exchWebServicesgFolderID = "";
			exchWebServicesgChangeKey = "";
		}
		else {
			exchWebServicesgFolderID = input.selectedFolder.folderID;
			exchWebServicesgChangeKey = input.selectedFolder.changeKey;
		}
		exchWebServicesCheckRequired();
	}
}

function exchWebServicesLoadExchangeSettingsByContactUUID(aUUID)
{
	var exchWebServicesCalPrefs = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService)
		    .getBranch("extensions.exchangecontacts@extensions.1st-setup.nl.account."+aUUID+".");

	if (exchWebServicesCalPrefs) {

		document.getElementById("exchWebService_contact_description").value = exchWebServicesCalPrefs.getCharPref("description");
		document.getElementById("exchWebService_mailbox").value = exchWebServicesCalPrefs.getCharPref("mailbox");
                if (document.getElementById("exchWebService_mailbox").value == "") {
                        exchWebServicesChangeFolderbaseMenuItemAvailability(true);
                        document.getElementById("menuitem.label.ecfolderbase.publicfoldersroot").disabled = false;
                }

		document.getElementById("exchWebService_server").value = exchWebServicesCalPrefs.getCharPref("server");
		document.getElementById("exchWebService_windowsuser").value = exchWebServicesCalPrefs.getCharPref("user");
                if (document.getElementById("exchWebService_windowsuser").value.indexOf("@") > -1) {
                        //document.getElementById("exchWebService_windowsdomain").setAttribute("required", false);
                        document.getElementById("exchWebService_windowsdomain").disabled = true;
                }
		document.getElementById("exchWebService_windowsdomain").value = exchWebServicesCalPrefs.getCharPref("domain");

		document.getElementById("exchWebService_folderpath").value = exchWebServicesCalPrefs.getCharPref("folderpath");

		for (var i=0; i < document.getElementById("exchWebService_folderbase").itemCount; i++) {
			if (document.getElementById("exchWebService_folderbase").getItemAtIndex(i).value == exchWebServicesCalPrefs.getCharPref("folderbase")) {
				document.getElementById("exchWebService_folderbase").selectedIndex = i;
				break;
			}
		}

		exchWebServicesgServer = exchWebServicesCalPrefs.getCharPref("server");
		exchWebServicesgUser = exchWebServicesCalPrefs.getCharPref("user");
		exchWebServicesgDomain = exchWebServicesCalPrefs.getCharPref("domain");

		exchWebServicesgFolderBase = exchWebServicesCalPrefs.getCharPref("folderbase");
		exchWebServicesgFolderPath = exchWebServicesCalPrefs.getCharPref("folderpath");
		exchWebServicesgMailbox = exchWebServicesCalPrefs.getCharPref("mailbox");
		try {
			exchWebServicesgFolderID = exchWebServicesCalPrefs.getCharPref("folderid");
		} catch(err) { exchWebServicesgFolderID = ""; }
		try {
			exchWebServicesgChangeKey = exchWebServicesCalPrefs.getCharPref("changekey");
		} catch(err) { exchWebServicesgChangeKey = ""; }
                try {
                        exchWebServicesgFolderIdOfShare = exchWebServicesCalPrefs.getCharPref("folderIDOfShare");
                        document.getElementById("exchWebService_folderidofshare").value = exchWebServicesgFolderIdOfShare;
                } catch(err) { exchWebServicesgFolderIdOfShare = ""; }
	}

	gexchWebServicesDetailsChecked = true;
	gexchWebServices2ndDetailsChecked = true;

	exchWebServicesCheckRequired();
}

function exchWebServicesSaveExchangeSettingsByContactUUID(isNewDirectory, aUUID)
{

	if (!isNewDirectory) {
		var exchWebServicesCalPrefs = Cc["@mozilla.org/preferences-service;1"]
	                    .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecontacts@extensions.1st-setup.nl.account."+aUUID+".");
	}

	if ((exchWebServicesCalPrefs) && (!isNewDirectory)) {
		exchWebServicesCalPrefs.setCharPref("description", document.getElementById("exchWebService_contact_description").value);
		exchWebServicesCalPrefs.setCharPref("server", exchWebServicesgServer);
		exchWebServicesCalPrefs.setCharPref("user", exchWebServicesgUser);
		exchWebServicesCalPrefs.setCharPref("domain", exchWebServicesgDomain);
		exchWebServicesCalPrefs.setCharPref("folderpath", exchWebServicesgFolderPath);
	exchWebService.commonFunctions.LOG("exchWebServicesSaveExchangeSettingsByContactUUID: folderbase:"+exchWebServicesgFolderBase);
		exchWebServicesCalPrefs.setCharPref("folderbase", exchWebServicesgFolderBase);
		exchWebServicesCalPrefs.setCharPref("mailbox", exchWebServicesgMailbox);
	}

	if (exchWebServicesgFolderPath == "/") {
		exchWebServicesgFolderID = "";
		exchWebServicesgChangeKey = "";
	}

	if (!isNewDirectory) {
		exchWebServicesCalPrefs.setCharPref("folderid", exchWebServicesgFolderID);
		exchWebServicesCalPrefs.setCharPref("changekey", exchWebServicesgChangeKey);
        	exchWebServicesCalPrefs.setCharPref("folderIDOfShare", exchWebServicesgFolderIdOfShare);
	}

	return {
			description: document.getElementById("exchWebService_contact_description").value,
			mailbox: exchWebServicesgMailbox,
			user: exchWebServicesgUser,
			domain: exchWebServicesgDomain,
			serverUrl: exchWebServicesgServer,
			folderBase: exchWebServicesgFolderBase,
			folderPath: exchWebServicesgFolderPath,
			folderID: exchWebServicesgFolderID,
			changeKey: exchWebServicesgChangeKey,
			folderIDOfShare: exchWebServicesgFolderIdOfShare 
		};
}
