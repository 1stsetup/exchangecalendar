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

function mivExchangeStatistics() {
	this.serverVersions = {};

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
}

var PREF_MAINPART = 'extensions.1st-setup.exchangecalendar.statistics.';

var mivExchangeStatisticsGUID = "e491a5d9-678a-4b2c-8d7f-c1a8f8ff40e8";

mivExchangeStatistics.prototype = {

	// methods from nsISupport

	_refCount: 0,

	//nsrefcnt AddRef();
	AddRef: function _AddRef()
	{
		this._refCount++;
		return this._refCount;
	},

	/* void QueryInterface(
	  in nsIIDRef uuid,
	  [iid_is(uuid),retval] out nsQIResult result
	);	 */
	QueryInterface: XPCOMUtils.generateQI([Ci.mivExchangeStatistics,
			Ci.nsISupports]),

	//nsrefcnt Release();
	Release: function _Release()
	{
		this._refCount--;
		return this._refCount;
	},

	// Attributes from nsIClassInfo

	classDescription: "Statistics maintainer for requests to Exchange server.",
	classID: components.ID("{"+mivExchangeStatisticsGUID+"}"),
	contractID: "@1st-setup.nl/exchange/statistics;1",
	flags: Ci.nsIClassInfo.SINGLETON || Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// External methods

	setServerVersion: function _setServerVersion(aURL, aVersion)
	{
		if (aVersion == "Exchange2010_SP2") {
			this.serverVersions[aURL] = "Exchange2010_SP1";
		}
		else {
			this.serverVersions[aURL] = aVersion;
		}
	},

	getServerVersion: function _getServerVersion(aURL)
	{
		if ((aURL) && (this.serverVersions[aURL])) {
			return this.serverVersions[aURL];
		}
	
		return "Exchange2007_SP1";
	},

	// Internal methods.

	logInfo: function _logInfo(message, aDebugLevel) {

		if (!aDebugLevel) {
			var debugLevel = 1;
		}
		else {
			var debugLevel = aDebugLevel;
		}

		this.storedDebugLevel = this.globalFunctions.safeGetIntPref(null, PREF_MAINPART+"debuglevel", 0, true);
		if (debugLevel <= this.storedDebugLevel) {
			this.globalFunctions.LOG("[exchangeStatistics] "+message + " ("+this.globalFunctions.STACKshort()+")");
		}
	},

}

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeStatistics) {
			// Load main script from lightning that we need.
			NSGetFactory.mivExchangeStatistics = XPCOMUtils.generateNSGetFactory([mivExchangeStatistics]);
			
	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeStatistics(cid);
} 

