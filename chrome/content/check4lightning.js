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
 * ***** BEGIN LICENSE BLOCK *****/

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

Cu.import("resource://exchangecalendar/ecFunctions.js");

if (! exchWebService) var exchWebService = {};

var globalUpdateCheckDone = false;

exchWebService.check4Lightning = {


	lightningIsInstalled: -1,
	// -1 = Check for Lightning has not yet run.
	// 0 = Lightning is not installed.
	// 1 = Lightning is installed but not active.
	// 2 = Lightning is installed and active.
	checkingIfLightnigIsInstalled: false,

	lightningAlertTimer: Cc["@mozilla.org/timer;1"]
					.createInstance(Ci.nsITimer),
	lightningAlertTimer2: Cc["@mozilla.org/timer;1"]
					.createInstance(Ci.nsITimer),

	lightningAlertCallback: function _lightningAlertCallback() 
	{
		exchWebService.commonFunctions.LOG("lightningAlertCallback.");

		var prefB = Cc["@mozilla.org/preferences-service;1"].
				getService(Ci.nsIPrefBranch);
		var promptStr = "";
		var promptTitle = "";

		switch (exchWebService.check4Lightning.lightningIsInstalled) {
			case 0:
				promptTitle = "Lightning is not installed.";
				promptStr = "Please install the Lightning Add-on if you wish\nto use the Exchange 2007/2010 Calendar and Tasks add-on.";
				break;
			case 1:
				promptTitle = "Lightning is not active.";
				promptStr = "Please activate the Lightning Add-on if you wish\nto use the Exchange 2007/2010 Calendar and Tasks add-on.";
				break;
		}

		if (!exchWebService.commonFunctions.safeGetBoolPref(prefB, "extensions.1st-setup.lightningCheck.showWarning", true)) {
			exchWebService.commonFunctions.LOG("lightningAlertCallback: Not showing warning dialog:"+promptStr);
			return;
		}

		var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].  
			getService(Ci.nsIPromptService);  

		var answer = { value: false };
		prompts.alertCheck(null, promptTitle, promptStr, "Do not show this prompt anymore.", answer); 
		exchWebService.commonFunctions.LOG("lightningAlertCallback. Answer:"+answer.value); 		

		prefB.setBoolPref("extensions.1st-setup.lightningCheck.showWarning", !answer.value);

		switch (exchWebService.check4Lightning.lightningIsInstalled) {
			case 0:
				openContentTab("https://addons.mozilla.org/en-US/thunderbird/addon/lightning/", "tab", "addons.mozilla.org");
				break;
			case 1:
				openContentTab("about:addons", "tab", "addons.mozilla.org");
				break;
		}

		exchWebService.check4Lightning.checkingIfLightnigIsInstalled = false;
	},

	checkLightningIsInstalledCallback: function _checkLightningIsInstalledCallback(aAddOn)
	{
		if (!aAddOn) {
			exchWebService.check4Lightning.lightningIsInstalled = 0;
		}
		else {
			exchWebService.check4Lightning.lightningIsInstalled = 1;
			exchWebService.commonFunctions.LOG("Lightning is installed.");
		}

		if (exchWebService.check4Lightning.lightningIsInstalled == 0) {
			// Lightning is not installed. Try to install it.
			exchWebService.commonFunctions.WARN("Lightning is not installed.");
			exchWebService.check4Lightning.lightningAlertTimer.initWithCallback(exchWebService.check4Lightning.lightningAlertCallback, 1500, exchWebService.check4Lightning.lightningAlertTimer.TYPE_ONE_SHOT);

		}
		else {
			// Ligntning is installed check if it is enabled.
			try {
				exchWebService.commonFunctions.LOG("Lightning was installed from:"+aAddOn.sourceURI.prePath+aAddOn.sourceURI.path);
			}
			catch(er) {
				exchWebService.commonFunctions.LOG("Lightning was installed from unknown source. Probably manualy outside the AddOnManager.");
			}
			if (aAddOn.isActive) {
				exchWebService.check4Lightning.lightningIsInstalled = 2;
			}
			else {
				// Not Active.  
				exchWebService.commonFunctions.WARN("Lightning is not active.1");
				exchWebService.check4Lightning.lightningAlertTimer.initWithCallback(exchWebService.check4Lightning.lightningAlertCallback, 1500, exchWebService.check4Lightning.lightningAlertTimer.TYPE_ONE_SHOT);
			}
		}
	},

	checkLightningIsInstalled: function _checkLightningIsInstalled()
	{
		if (exchWebService.check4Lightning.lightningIsInstalled > 1) {
			// Lightning is allready installed.
			return;
		}

		if (exchWebService.check4Lightning.checkingIfLightnigIsInstalled) {
			return;
		}

		exchWebService.check4Lightning.checkingIfLightnigIsInstalled = true;

		if (exchWebService.check4Lightning.lightningIsInstalled == -1) {
			Cu.import("resource://gre/modules/AddonManager.jsm");
		}
		AddonManager.getAddonByID("{e2fda1a4-762b-4020-b5ad-a41df1933103}", exchWebService.check4Lightning.checkLightningIsInstalledCallback);
	},

	onLoad: function _onLoad(event) {

		if ((exchWebService) && (exchWebService.check4Lightning)) {
			document.removeEventListener("load", exchWebService.check4Lightning.onLoad, true);
			exchWebService.check4Lightning.checkLightningIsInstalled();
			
			if ((exchWebService.commonFunctions.safeGetBoolPref(null, "extensions.1st-setup.others.checkForNewAddOnVersion", true, true)) && (!globalUpdateCheckDone)) {
				globalUpdateCheckDone = true;
				var updatecheck = Cc["@1st-setup.nl/checkers/updater;1"]
							       .createInstance(Ci.mivUpdater);
				updatecheck.checkForUpdate("exchangecalendar@extensions.1st-setup.nl" , exchWebService.check4Lightning.updaterCallBack);
			}
		}
	},

	updaterCallBack: function _updaterCallBack(aResult)
	{
				if (aResult.versionChanged <= 0) {
					exchWebService.commonFunctions.LOG("No new version available.");
				}
				else {
					exchWebService.commonFunctions.LOG("New version available.");
					exchWebService.commonFunctions.LOG(" ++ Version:"+aResult.updateDetails.newVersion);
					exchWebService.commonFunctions.LOG(" ++ URL:"+aResult.updateDetails.updateURL);
					if (exchWebService.commonFunctions.safeGetBoolPref(null, "extensions.1st-setup.others.warnAboutNewAddOnVersion", true, true)) {
						exchWebService.check4Lightning.lightningAlertTimer2.initWithCallback(function(){ exchWebService.check4Lightning.lightningAlertCallback2(aResult);}, 15000, exchWebService.check4Lightning.lightningAlertTimer2.TYPE_ONE_SHOT);
					}
				}
	},

	lightningAlertCallback2: function _lightningAlertCallback2(aResult) 
	{
		exchWebService.commonFunctions.LOG("lightningAlertCallback2.");

		var prefB = Cc["@mozilla.org/preferences-service;1"].
				getService(Ci.nsIPrefBranch);
		var promptStr = "There is an update available for the Exchange Calendar and Tasks provider on the main website.";
		promptStr += "\n\nDo you want to install this newer version: "+aResult.updateDetails.newVersion;
		promptStr += "\nCurrent version is: "+aResult.addon.version;
		if (aResult.updateDetails.msg != "") {
			promptStr += "\n\nChanges:\n"+aResult.updateDetails.msg;
		}
		promptStr += "\n\nOr read the info on "+aResult.updateDetails.infoURL;
		var promptTitle = "Update available";

		var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].  
			getService(Ci.nsIPromptService);  

		var answer = { value: false };

		var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_YES +
				prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_NO +
				prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

		var button = prompts.confirmEx(null, promptTitle, promptStr, flags, "", "", "Info", "Do not show this prompt anymore.", answer);

		exchWebService.commonFunctions.LOG("lightningAlertCallback2. button:"+button); 		
		prefB.setBoolPref("extensions.1st-setup.others.warnAboutNewAddOnVersion", !answer.value);

		if (button == 0) {
			aResult.updater.installNewVersion(aResult, true);
		}
		if (button == 2) {
			openContentTab(aResult.updateDetails.infoURL, "tab", "www.1st-setup.nl");
		}

	},

}

document.addEventListener("load", exchWebService.check4Lightning.onLoad, true);
