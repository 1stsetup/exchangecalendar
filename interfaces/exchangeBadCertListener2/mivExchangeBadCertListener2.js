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
 * Author: Michel Verbraak (info@1st-setup.nl)
 * Website: http://www.1st-setup.nl/
 *
 * This interface/service is used for loadBalancing Request to Exchange
 *
 * ***** BEGIN LICENSE BLOCK *****/

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var Cr = Components.results;
var components = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

function mivExchangeBadCertListener2() {

	this.targetSites = {};
	this.requests = {};

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

}

var PREF_MAINPART = 'extensions.1st-setup.exchangecalendar.abcard.';

var mivExchangeBadCertListener2GUID = "33242776-0e06-4c30-afc1-bd68f3bb2417";

mivExchangeBadCertListener2.prototype = {

	// methods from nsISupport

	/* void QueryInterface(
	  in nsIIDRef uuid,
	  [iid_is(uuid),retval] out nsQIResult result
	);	 */
	QueryInterface: XPCOMUtils.generateQI([Ci.mivExchangeBadCertListener2,
			Ci.nsIBadCertListener2,
			Ci.nsISupports]),

	// Attributes from nsIClassInfo

	classDescription: "Exchange BadCertListener2.",
	classID: components.ID("{"+mivExchangeBadCertListener2GUID+"}"),
	contractID: "@1st-setup.nl/exchange/badcertlistener2;1",
	flags: Ci.nsIClassInfo.SINGLETON || Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// External methods
	// nsIBadCertListener2
	notifyCertProblem: function _notifyCertProblem(socketInfo, status, targetSite) 
	{
		this.logInfo("ecnsIAuthPrompt2.notifyCertProblem: targetSite:"+targetSite);
		this.logInfo("ecnsIAuthPrompt2.notifyCertProblem: status.cipherName:"+status.cipherName);
		this.logInfo("ecnsIAuthPrompt2.notifyCertProblem: status.serverCert.windowTitle:"+status.serverCert.windowTitle);
		if (!status) {
			return true;
		}

		this.targetSites[targetSite] = true;

		// Unfortunately we can't pass js objects using the window watcher, so
		// we'll just take the first available calendar window. We also need to
		// do this on a timer so that the modal window doesn't block the
		// network request.
		var self = this;
		let timerCallback = {
			notify: function notifyCertProblem_notify(targetSite) {
					self.notify(targetSite);
				}
			};

		let timer = Components.classes["@mozilla.org/timer;1"]
				.createInstance(Components.interfaces.nsITimer);
		timer.initWithCallback(timerCallback, 2, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		return true;
	},
	
	addRequest: function _addRequest(aRequest)
	{
		
	},

	// Internal methods.
	notify: function _notify(targetSite) 
	{
		var params = { exceptionAdded: false,
				prefetchCert: true,
				location: targetSite };

		var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
      	                    .getService(Ci.nsIWindowMediator);
		var calWindow = wm.getMostRecentWindow("mail:3pane") ;

		calWindow.openDialog("chrome://pippki/content/exceptionDialog.xul",
				"",
				"chrome,centerscreen,modal",
				params);

		if (params.exceptionAdded) {
			this.targetSites[targetSite] = false;
			self.exchangeRequest.retryCurrentUrl();
		}
		else {
			self.exchangeRequest.onUserStop(this.exchangeRequest.ER_ERROR_USER_ABORT_ADD_CERTIFICATE, "User did not add needed certificate.");
		}
	},

	logInfo: function _logInfo(aMsg, aDebugLevel) 
	{
		var prefB = Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefBranch);

		this.debug = this.globalFunctions.safeGetBoolPref(prefB, "extensions.1st-setup.authentication.debug", false, true);
		if (this.debug) {
			this.globalFunctions.LOG("mivExchangeAuthPrompt2: "+aMsg);
		}
	},

}

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeBadCertListener2) {
			// Load main script from lightning that we need.
			NSGetFactory.mivExchangeBadCertListener2 = XPCOMUtils.generateNSGetFactory([mivExchangeBadCertListener2]);
			
	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeBadCertListener2(cid);
} 

