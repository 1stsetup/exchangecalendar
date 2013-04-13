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

function mivExchangeAutoCompleteSearch() {


}

var mivExchangeAutoCompleteSearchGUID = "c073f5cf-15d7-47d4-b30e-9498fd728544";

mivExchangeAutoCompleteSearch.prototype = {

	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeAutoCompleteSearch,
				Ci.nsIAutoCompleteSearch,
				Ci.nsIClassInfo,
				Ci.nsISupports]),

	classDescription : "Exchange Autocomplete Search",

	classID : components.ID("{"+mivExchangeAutoCompleteSearchGUID+"}"),
	contractID : "@mozilla.org/autocomplete/search;1?name=exchangeAutoCompleteSearch",
	flags : Ci.nsIClassInfo.SINGLETON || Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

	getInterfaces : function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeAutoCompleteSearch,
				Ci.nsIAutoCompleteSearch,
				Ci.nsIClassInfo,
				Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param searchString - The string to search for
   * @param searchParam - An extra parameter
   * @param previousResult - A previous result to use for faster searching
   * @param listener - A listener to notify when the search is complete
   */
  //void startSearch(in AString searchString,
  //                 in AString searchParam,
  //                 in nsIAutoCompleteResult previousResult,
  //                 in nsIAutoCompleteObserver listener);

	startSearch: function _startSearch(searchString, searchParam, previousResult, listener)
	{
		dump("mivExchangeAutoCompleteSearch: startSearch\n");
		dump("    searchString:"+searchString+"\n");
		dump("     searchParam:"+searchParam+"\n");
		dump("  previousResult:"+previousResult+"\n");
		dump("        listener:"+listener+"\n\n");
	},

  /*
   * Stop all searches that are in progress
   */
  //void stopSearch();
	stopSearch: function _stopSearch()
	{
		dump("mivExchangeAutoCompleteSearch: stopSearch\n");
	},

};

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeAutoCompleteSearch) {
			// Load main script from lightning that we need.
			NSGetFactory.mivExchangeAutoCompleteSearch = XPCOMUtils.generateNSGetFactory([mivExchangeAutoCompleteSearch]);

	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeAutoCompleteSearch(cid);
} 

