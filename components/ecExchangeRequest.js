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
var Cr = Components.results;
var components = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://calendar/modules/calUtils.jsm");

Cu.import("resource://exchangecalendar/ecFunctions.js");

Cu.import("resource://interfaces/xml2jxon/mivIxml2jxon.js");
Cu.import("resource://interfaces/xml2json/xml2json.js");

var EXPORTED_SYMBOLS = ["ExchangeRequest", "nsSoapStr","nsTypesStr","nsMessagesStr","nsAutodiscoverResponseStr1", "nsAutodiscoverResponseStr2", "nsAutodiscover2010Str", "nsErrors", "nsWSAStr", "nsXSIStr", "xml_tag"];

var xml_tag = '<?xml version="1.0" encoding="utf-8"?>\n';

const nsSoapStr = "http://schemas.xmlsoap.org/soap/envelope/";
const nsTypesStr = "http://schemas.microsoft.com/exchange/services/2006/types";
const nsMessagesStr = "http://schemas.microsoft.com/exchange/services/2006/messages";
const nsAutodiscoverResponseStr1 = "http://schemas.microsoft.com/exchange/autodiscover/responseschema/2006";
const nsAutodiscoverResponseStr2 = "http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a";
const nsAutodiscover2010Str = "http://schemas.microsoft.com/exchange/2010/Autodiscover";
const nsWSAStr = "http://www.w3.org/2005/08/addressing";
const nsXSIStr = "http://www.w3.org/2001/XMLSchema-instance";
const nsErrors = "http://schemas.microsoft.com/exchange/services/2006/errors";

var gExchangeRequestVersion = "0.1";

if (! exchWebService) var exchWebService = {};

exchWebService.prePasswords = {};

function ExchangeRequest(aArgument, aCbOk, aCbError, aListener)
{
	this.mData = "";
	this.mArgument = aArgument;
	this.mCbOk = aCbOk;
	this.mCbError = aCbError;
	this.retries = 0;
	this.urllist = [];
	this.currentUrl = "";
	this.listener = aListener;
	this.retryCount = 0;

	this.mAuthFail = 0;
	this.xmlReq = null;
	this.shutdown = false;
	this.badCert = false;
	this.badCertCount = 0;
	this._notificationCallbacks = null;

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

	this.uuid = this.globalFunctions.getUUID();

	this.prePassword = "";

	this.kerberos = true;

	this.prefB = Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefBranch);

	this.exchangeStatistics = Cc["@1st-setup.nl/exchange/statistics;1"]
			.getService(Ci.mivExchangeStatistics);

	this.exchangeBadCertListener2 = Cc["@1st-setup.nl/exchange/badcertlistener2;1"]
			.getService(Ci.mivExchangeBadCertListener2);

	this.observerService = Cc["@mozilla.org/observer-service;1"]  
	                          .getService(Ci.nsIObserverService); 

	this.timeZones = Cc["@1st-setup.nl/exchange/timezones;1"]
				.getService(Ci.mivExchangeTimeZones);
				
	this.xml2json = false;

}

ExchangeRequest.prototype = {
	ER_ERROR_EMPTY_FOLDERPATH: -2,
	ER_ERROR_INVALID_URL: -6, 	// "No url to send request to."
	ER_ERROR_RESPONS_NOT_VALID: -7, // "Respons does not contain expected field"
	ER_ERROR_SOAP_ERROR: -8,	// "Error on creating item:"+responseCode
	ER_ERROR_RESOLVING_HOST: -9,    // "Error during resolving of hostname"
	ER_ERROR_CONNECTING_TO: -10,    // "Error during connecting to hostname"
	ER_ERROR_CREATING_ITEM_UNKNOWN: -13, // "Error. Unknown item creation:"+String(aResp)

	ER_ERROR_CONNECED_TO: -14, // "Error during connection to hostname '"
	ER_ERROR_SENDING_TO: -15,  // "Error during sending data to hostname '"
	ER_ERROR_WAITING_FOR: -16, // "Error during waiting for data of hostname '" 
	ER_ERROR_RECEIVING_FROM: -17, // "Error during receiving of data from hostname '"
	ER_ERROR_UNKNOWN_CONNECTION: -18, // "Unknown error during communication with hostname 
	ER_ERROR_HTTP_ERROR4XX: -19,  // A HTTP 4XX error code was returned.

	ER_ERROR_USER_ABORT_AUTHENTICATION: -20,	// "User aborted authentication credentials"
	ER_ERROR_USER_ABORT_ADD_CERTIFICATE: -30,	// "User aborted adding required certificate"
	ER_ERROR_OPEN_FAILED: -100,	// "Could not connect to specified host:"+err
	ER_ERROR_FROM_SERVER: -101,	// HTTP error from server.
	ER_ERROR_AUTODISCOVER_GET_EWSULR: -200,  // During auto discovery no EWS URL were discoverd in respons.
	ER_ERROR_FINDFOLDER_NO_TOTALITEMSVIEW: -201, // Field totalitemsview missing in soap response.
	ER_ERROR_FINDFOLDER_FOLDERID_DETAILS: -202, // Could not find folderid details in soap response.
	ER_ERROR_FINDFOLDER_MULTIPLE_RESULTS: -203, // Found more than one results in the findfolder soap response.
	ER_ERROR_FINDOCCURRENCES_INVALIDIDMALFORMED: -204, // Found an malformed id during find occurrences.
	ER_ERROR_GETOCCURRENCEINDEX_NOTFOUND: -205,  // Could not found occurrence index.
	ER_ERROR_SOAP_RESPONSECODE_NOTFOUND: -206, // Could not find the responce field in the soap response.
	ER_ERROR_PRIMARY_SMTP_NOTFOUND: -207, // Primary SMTP address could not be found in soap response.
	ER_ERROR_PRIMARY_SMTP_UNKNOWN: -208,  // Unknown error during Primary SMTP check.
	ER_ERROR_UNKNOWN_MEETING_REPSONSE: -209, // Unknown Meeting Response.
	ER_ERROR_SYNCFOLDERITEMS_UNKNOWN: -210, // Unknown error during SyncFolders.
	ER_ERROR_ITEM_UPDATE_UNKNOWN: -211,  // Unknown error during item ipdate.
	ER_ERROR_SPECIFIED_SMTP_NOTFOUND: -212, // Specified SMTP address does not exist.
	ER_ERROR_CONVERTID: -214, // Specified SMTP address does not exist.
	ER_ERROR_NOACCESSTOFREEBUSY: -215, // Specified user has no access to free/busy information of specified mailbox.
	ER_ERROR_FINDOCCURRENCES_UNKNOWN: -216, // We received an unkown error while trying to get the occurrences. 

	ERR_PASSWORD_ERROR: -300, // To many password errors.

	get debug()
	{
		if ((this.debuglevel == 0) || (!this.globalFunctions.shouldLog())) {
			return false;
		}

		return this.globalFunctions.safeGetBoolPref(this.prefB, "extensions.1st-setup.network.debug", false, true);
	},

	get debuglevel()
	{
		return this.globalFunctions.safeGetIntPref(this.prefB, "extensions.1st-setup.network.debuglevel", 0, true);
	},

	logInfo: function _logInfo(aMsg, aLevel)
	{
		if (!aLevel)  aLevel = 1;

		if ((this.debug) && (aLevel <= this.debuglevel)) {
			this.globalFunctions.LOG(this.uuid+": "+aMsg);
		}
	},

	get argument() {
		return this.mArgument;
	},

	get user() 
	{
		return this.argument.user;
	},

	set user(aValue)
	{
		this.argument.user = aValue;
	},

	stopRequest: function _stopRequest()
	{
		this.shutdown = true;
		this.xmlReq.abort();
	},

	sendRequest: function(aData, aUrl)
	{
		if (this.shutdown) {
			return;
		}

//		this.logInfo(": sendRequest\n");
		this.mData = aData;
		this.currentUrl = "";

		while ((!aUrl) && (this.urllist.length > 0 )) {
			aUrl = this.urllist[0];
			this.urllist.shift();
		}

		if ((!aUrl) || (aUrl == "") || (aUrl == undefined)) {
			this.fail(this.ER_ERROR_INVALID_URL, "No url to send request to (sendRequest).");
			return;
		}

		this.currentUrl = aUrl;

		if (this.exchangeBadCertListener2.userCanceledCertProblem(this.currentUrl)) {
			this.fail(this.ER_ERROR_USER_ABORT_AUTHENTICATION, "User canceled adding server certificate for url="+this.currentUrl+". Aborting this request.");
			return;
		}

		// remove domain part in xmlhttprequest.open call
		var openUser = this.mArgument.user;
/*		if (openUser.indexOf("\\") > -1) {
			openUser = openUser.substr(openUser.indexOf("\\")+1);
		}*/

		var myAuthPrompt2 = Cc["@1st-setup.nl/exchange/authprompt2;1"].getService(Ci.mivExchangeAuthPrompt2);
		if (myAuthPrompt2.getUserCanceled(this.currentUrl)) {
			
			this.fail(this.ER_ERROR_USER_ABORT_AUTHENTICATION, "User canceled providing a valid password for url="+this.currentUrl+". Aborting this request.");
			return;
		}

		try {
			var password = myAuthPrompt2.getPassword(null, openUser, this.currentUrl);
//			var password = myAuthPrompt2.getPassword(null, this.mArgument.user, this.currentUrl);
		}
		catch(err) {
			this.logInfo(err);
			this.fail(this.ER_ERROR_USER_ABORT_AUTHENTICATION, "User canceled providing a valid password for url="+this.currentUrl+". Aborting this request.");
			myAuthPrompt2 = null;
			return;
		}
		myAuthPrompt2 = null;

		this.xmlReq = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();

		this.mXmlReq = this.xmlReq;

		var tmp = this;

		// http://dvcs.w3.org/hg/progress/raw-file/tip/Overview.html
		// https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIXMLHttpRequestEventTarget
		this.xmlReq.addEventListener("loadstart", function(evt) { tmp.loadstart(evt); }, false);
		this.xmlReq.addEventListener("progress", function(evt) { tmp.progress(evt); }, false);
		this.xmlReq.addEventListener("error", function(evt) { tmp.error(evt); }, false);
		this.xmlReq.addEventListener("abort", function(evt) { tmp.abort(evt); }, false);
		this.xmlReq.addEventListener("load", function(evt) { tmp.onLoad(evt); }, false);
		this.xmlReq.addEventListener("loadend", function(evt) { tmp.loadend(evt); }, false);

		if (this.debug) this.logInfo(": 1 ExchangeRequest.sendRequest : user="+this.mArgument.user+", url="+this.currentUrl);

		this._notificationCallbacks = new ecnsIAuthPrompt2(this);

		try {

//				this.xmlReq.open("POST", this.currentUrl, true);
			if (password) {
				if (this.debug) this.logInfo("We have a prePassword: *******");
				this.xmlReq.open("POST", this.currentUrl, true, openUser, password);

				// If we have full credentials we are going to add a Basic auth header just for the case we support Basic.
				var tok = openUser + ':' + password;
				var basicAuthHash = btoa(tok);
				this.xmlReq.setRequestHeader('Authorization', "Basic " + basicAuthHash);
				
				//this.xmlReq.open("POST", this.currentUrl, true, this.mArgument.user, password);
			}
			else {
				this.xmlReq.open("POST", this.currentUrl, true, openUser);
				//this.xmlReq.open("POST", this.currentUrl, true, this.mArgument.user);
			}

		}
		catch(err) {
			dump("\n ERROR sendrequest:"+err+"\n");
			if (this.debug) this.logInfo(": ERROR on ExchangeRequest.sendRequest to URL:"+this.currentUrl+". err:"+err); 

			if (this.tryNextURL()) {
				return;
			}

			this.fail(this.ER_ERROR_OPEN_FAILED,"Could not connect to specified host:"+err);
			return;
		}

		this.xmlReq.overrideMimeType('text/xml');
		this.xmlReq.setRequestHeader("Content-Type", "text/xml");
//		this.xmlReq.setRequestHeader("User-Agent", "extensions.1st-setup.nl/" + gExchangeRequestVersion+"/username="+this.mArgument.user);
		this.xmlReq.setRequestHeader("User-Agent", this.globalFunctions.safeGetCharPref(this.prefB, "extensions.1st-setup.others.userAgent", "exchangecalendar@extensions.1st-setup.nl", true));

		// This is required for NTLM authenticated sessions. Which is default for a default EWS install.
		this.xmlReq.setRequestHeader("Connection", "keep-alive");

		/* set channel notifications for password processing */
		this.xmlReq.channel.notificationCallbacks = this._notificationCallbacks;
		this.xmlReq.channel.loadGroup = null;

		var httpChannel = this.xmlReq.channel.QueryInterface(Ci.nsIHttpChannel);

		// XXX we want to preserve POST across 302 redirects TODO: This might go away because header params are copyied right now.
		httpChannel.redirectionLimit = 0;
try{
		httpChannel.allowPipelining = false;
}
catch(err) {
		this.logInfo("sendRequest: ERROR on httpChannel.allowPipelining to err:"+err); 
}

		if (this.debug) this.logInfo(": sendRequest Sending: " + this.mData+"\n", 2);

		//this.exchangeStatistics.addDataSend(this.currentUrl, this.mData.length);

		this.xmlReq.send(this.mData);
	},

	loadstart: function _loadtstart(evt)
	{
		if (this.debug) this.logInfo(": ExchangeRequest.loadstart");
		this.shutdown = false;
		this.badCert = false;
	},

	loadend: function _loadend(evt)
	{
		if (this.debug) this.logInfo(": ExchangeRequest.loadend");

		let xmlReq = this.mXmlReq;

		if (this.debug) this.logInfo(": ExchangeRequest.loadend :"+evt.type+", readyState:"+xmlReq.readyState+", status:"+xmlReq.status);
		if (this.debug) this.logInfo(": ExchangeRequest.loadend :"+xmlReq.responseText,2);

	},

	progress: function _progress(evt)
	{
		if (this.debug) this.logInfo(": ExchangeRequest.progress. loaded:"+evt.loaded+", total:"+evt.total);
	},

	error: function _error(evt)
	{
		let xmlReq = this.mXmlReq;

		if (this.debug) this.logInfo(": ExchangeRequest.error :"+evt.type+", readyState:"+xmlReq.readyState+", status:"+xmlReq.status+", lastStatus:"+this._notificationCallbacks.lastStatus);
		if (this.debug) this.logInfo(": ExchangeRequest.error :"+xmlReq.responseText,2);
		if (this.debug) this.logInfo(': xmlReq.getResponseHeader("Location") :'+xmlReq.getResponseHeader("Location"),2);

		if ((!this.shutdown) && (xmlReq.readyState == 4) && (xmlReq.status == 0)) {
			this.logInfo(": ExchangeRequest.error : badCert going to check if it is a cert problem.");
try {
			var result = this.exchangeBadCertListener2.checkAndSolveCertProblem(this.currentUrl);
}
catch(err){
			this.logInfo(": ExchangeRequest.error : this.exchangeBadCertListener2.checkAndSolveCertProblem Error:"+err);
}
			if (result.hadProblem) {
				if (result.solved) {
					this.logInfo(": ExchangeRequest.error : badCert problem but solved. going to retry url.");
					this.retryCurrentUrl();
					return;
				}
				else {
					this.logInfo(": ExchangeRequest.error : badCert problem and NOT solved. going to fail.");
				}
			}
			else {
				this.logInfo(": ExchangeRequest.error : badCert no problem.");
			}
		}

		if (this.isHTTPRedirect(evt)) return;

		if (this.tryNextURL()) return;

		this.observerService.notifyObservers(this._notificationCallbacks, "onExchangeConnectionError", this.currentUrl+"|"+this._notificationCallbacks.lastStatus+"|"+this._notificationCallbacks.lastStatusArg);

		switch (this._notificationCallbacks.lastStatus) {
		case 0x804b0003: 
			this.fail(this.ER_ERROR_RESOLVING_HOST, "Error resolving hostname '"+this._notificationCallbacks.lastStatusArg+"'. Did you type the right hostname. (STATUS_RESOLVING)");
			xmlReq.abort();
			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			return;
		case 0x804b000b: 
			this.fail(this.ER_ERROR_RESOLVING_HOST, "Error resolving hostname '"+this._notificationCallbacks.lastStatusArg+"'. Did you type the right hostname. (STATUS_RESOLVED)");
			xmlReq.abort();
			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			return;
		case 0x804b0007:
			this.fail(this.ER_ERROR_CONNECTING_TO, "Error during connecting to hostname '"+this._notificationCallbacks.lastStatusArg+"'. Is the host down?. (STATUS_CONNECTING_TO)");
			xmlReq.abort();
			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			return;
		case 0x804b0004:
			this.fail(this.ER_ERROR_CONNECED_TO, "Error during connection to hostname '"+this._notificationCallbacks.lastStatusArg+"'. (STATUS_CONNECTED_TO)");
			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			break;
		case 0x804b0005:
			this.fail(this.ER_ERROR_SENDING_TO, "Error during sending data to hostname '"+this._notificationCallbacks.lastStatusArg+"'. (STATUS_SENDING_TO)");
			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			break;
		case 0x804b000a:
			this.fail(this.ER_ERROR_WAITING_FOR, "Error during waiting for data of hostname '"+this._notificationCallbacks.lastStatusArg+"'. (STATUS_WAITING_FOR)");
			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			break;
		case 0x804b0006: 
			this.fail(this.ER_ERROR_RECEIVING_FROM, "Error during receiving of data from hostname '"+this._notificationCallbacks.lastStatusArg+"'. (STATUS_RECEIVING_FROM)");
			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			break;
		default:
			this.fail(this.ER_ERROR_UNKNOWN_CONNECTION, "Unknown error during communication with hostname '"+this._notificationCallbacks.lastStatusArg+"'. ("+this._notificationCallbacks.lastStatus+")");
		}

	},

	abort: function _abort(evt)
	{
		if (this.debug) this.logInfo("ExchangeRequest.abort: type:"+evt.type);
		if (evt.type != "abort") {
			if (this.debug) this.logInfo("ecExchangeRequest.abort: "+evt.type);
		}
		dump("Abort!\n");
//		this.fail(-3, "User aborted data transfer.");
	},

	onUserStop: function _onUserStop(aCode, aMsg)
	{
		if (this.debug) this.logInfo("ecExchangeRequest.onUserStop: aCode:"+aCode+", aMsg:"+aMsg);
		this.mXmlReq.abort();
		this.fail(aCode, aMsg);
	},

	isHTTPRedirect: function(evt)
	{
		let xmlReq = this.mXmlReq;
		if (this.debug) this.logInfo("exchangeRequest.isHTTPRedirect.xmlReq. xmlReq.readyState:"+xmlReq.readyState+", xmlReq.status:"+xmlReq.status);

		if (xmlReq.readyState != 4)
			return false;

		switch (xmlReq.status) {
		case 301:  // Moved Permanently
		case 302:  // Found
		case 307:  // Temporary redirect (since HTTP/1.1)
			if (this.debug) this.logInfo(": ExchangeRequest.redirect :"+evt.type+", readyState:"+xmlReq.readyState+", status:"+xmlReq.status);

			let httpChannel = xmlReq.channel.QueryInterface(Ci.nsIHttpChannel);
			let loc = httpChannel.getResponseHeader("Location");

			// The location could be a relative path
			if (loc.indexOf("http") == -1) {
				if (this.debug) this.logInfo("new location looks to be relative.");
				if (loc.indexOf("/") == 0) {
					if (this.debug) this.logInfo("Relative to the root of the server.");
					// Relative to the root of the server
					//Find position of third slash https://xxx/
					var slashCounter = 0;
					var counter = 0;
					while ((slashCounter < 3) && (counter < this.currentUrl.length)) {
						if (this.currentUrl.substr(counter, 1) == "/") {
							slashCounter++;

							if (slashCounter == 3) {
								var tmpUrl = this.currentUrl.substr(0, counter);
								break;
							}
						}
						counter++;
					}
					if (tmpUrl) {
						loc = tmpUrl + loc;
					}
					else {
						loc = this.currentUrl + loc;
					}
				}
				else {
					// Relative to last dir.
					if (this.debug) this.logInfo("it is relative to the last dir. Currently not able to handle this. Will be available in future version.");
				}
			}

			if (this.debug) this.logInfo(": Redirect: " + loc + "\n");

                        // XXX pheer loops.
                        xmlReq.abort();
                        this.sendRequest(this.mData, loc);

			return true;
		}

		return false;
	},

	unchunk: function _unchunk(aStr)
	{
		var pos = aStr.indexOf("\r\n");
		if ((pos > -1) && (pos < 5)) {
			var chunkCounter = 1;
			var chunkLength = parseInt(aStr.substr(0,pos), 16);
			if (isNaN(chunkLength)) {
				if (this.debug) this.logInfo("unchunk: 1st chunk is not a number:"+aStr.substr(0,pos));
				return "";
			}
			if (this.debug) this.logInfo("unchunk: 1st chunk has length:"+chunkLength);
			var newStr = "";
			while (chunkLength > 0) {
				var bytesToCopy = chunkLength;
				pos = pos + 2;
				var charCode;
				while (bytesToCopy > 0) {
					newStr = newStr + aStr.substr(pos, 1);
					charCode = aStr.charCodeAt(pos);
					if (charCode <= 0xFF) {
						bytesToCopy--;
					}
					else {
						if (charCode <= 0xFFFF) {
							if (this.debug) this.logInfo("unchunk: TWO bytes copied '"+aStr.substr(pos, 1)+"'="+charCode);
							bytesToCopy = bytesToCopy - 2;

						}
						else {
							if (charCode <= 0xFFFFFF) {
								if (this.debug) this.logInfo("unchunk: THREE bytes copied '"+aStr.substr(pos, 1)+"'="+charCode);
								bytesToCopy = bytesToCopy - 3;
							}
						}
					}
					pos++;
				}

				//newStr = newStr + aStr.substr(pos+2, chunkLength);
					if (this.debug) this.logInfo("unchunk: pos:"+pos+", CunkStr:"+newStr+"|");
				//pos = pos + chunkLength + 2;
				// Next two bytes should be \r\n
				var check = aStr.substr(pos, 2);
				if (check != "\r\n") {
					if (this.debug) this.logInfo("unchunk: Strange. Expected 0D0A (Cr+Lf) but found:"+check+". Stopping processing of this chunked message.");
					return "";
				}
				pos = pos + 2;
				var tmpStr = aStr.substr(pos, 6);
				var pos2 = tmpStr.indexOf("\r\n");
				chunkCounter++;
				if (pos2 > -1) {
					if (this.debug) this.logInfo("unchunk: Found next chunk. Number:"+chunkCounter+", LengthStr:"+tmpStr.substr(0,pos2));
					chunkLength = parseInt(tmpStr.substr(0,pos2), 16);
					if (isNaN(chunkLength)) {
						if (this.debug) this.logInfo("unchunk: Chunk '"+chunkCounter+"' is not a number:"+tmpStr);
						return "";
					}
					if (this.debug) this.logInfo("unchunk: Chunk '"+chunkCounter+"' has length:"+chunkLength);
					pos = pos + pos2;
				}
				else {
					if (this.debug) this.logInfo("unchunk: Trying to determine chunk '"+chunkCounter+"' length but it is more than 4 bytes big!! size:"+tmpStr);
					return "";
				}
			}
			return newStr;
		}
		else {
			if (this.debug) this.logInfo("unchunk: Trying to determine first chunk length but it is very big...!! size:"+pos);
			return aStr;
		}
	},

	saveToFile: function _saveToFile(aFilename, aContent)
	{
		var file = Cc["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
		file.append("exchange-data");
		if ( !file.exists() || !file.isDirectory() ) {
			file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0777", 8));  
		}

		file.append("responses");
		if ( !file.exists() || !file.isDirectory() ) {
			file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, parseInt("0777", 8));  
		}

		if (!this.fileCount) {
			this.fileCount = 0;
		}
		else {
			this.fileCount++;
		}

		if (this.fileCount < 10) {
			file.append(this.uuid+"-00"+this.fileCount+"."+aFilename);
		}
		else {
			if (this.fileCount < 100) {
				file.append(this.uuid+"-0"+this.fileCount+"."+aFilename);
			}
			else {
				file.append(this.uuid+"-"+this.fileCount+"."+aFilename);
			}
		}

		if (file.exists()) {
			file.remove(false);
		}

//		file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);  

		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
				 createInstance(Components.interfaces.nsIFileOutputStream);  
		foStream.init(file, 0x02 | 0x08 | 0x20, parseInt("0777", 8), 0);  

		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
				createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(aContent);
		converter.close(); // this closes foStream
		  
		return 0;
	},


	onLoad:function _onLoad(evt) 
	{
		let xmlReq = this.mXmlReq;

		if (this.debug) this.logInfo(": ExchangeRequest.onLoad :"+evt.type+", readyState:"+xmlReq.readyState+", status:"+xmlReq.status);

		if (this.debug) this.logInfo(": ExchangeRequest.onLoad :"+xmlReq.getAllResponseHeaders(),2);

		if (this.debug) this.logInfo(": ExchangeRequest.onLoad :"+xmlReq.responseText,2);

		//this.exchangeStatistics.addDataRead(this.currentUrl, xmlReq.responseText.length);

		if (xmlReq.readyState != 4) {

			//if (this.tryNextURL()) return;

			if (this.debug) this.logInfo("readyState < 4. THIS SHOULD NEVER HAPPEN. PLEASE REPORT.");
			this.fail(this.ER_ERROR_OPEN_FAILED,"Ready state != 4, readyState:"+xmlReq.readyState);
			return;
		}

		if (this.isHTTPRedirect(evt)) {
			return;
		}

		if (this.isHTTPError()) {
			return;
		}

		var xml = xmlReq.responseText; // bug 270553
		//this.saveToFile("onload.xml", xml);

// Removed following as this is no longer a problem as we are not using E4X anymore.
//		xml = xml.replace(/&#x10;/g, ""); // BUG 61 remove hexadecimal code 0x10. It will fail in xml conversion.

		var newXML;
		try {
			if (this.xml2json === true) {
				newXML = xml2json.newJSON();
			}
			else {
				newXML = new mivIxml2jxon('', 0, null);
			}
		}
		catch(exc) { if (this.debug) this.logInfo("createInstance error:"+exc);}

		try {
			if (this.xml2json === true) {
				xml2json.parseXML(newXML, xml);
			}
			else {
				newXML.addNameSpace("s", nsSoapStr);
				newXML.addNameSpace("m", nsMessagesStr);
				newXML.addNameSpace("t", nsTypesStr);
				newXML.addNameSpace("a1", nsAutodiscoverResponseStr1);
				newXML.addNameSpace("a2", nsAutodiscoverResponseStr2);
				newXML.processXMLString(xml, 0, null);
			}
		}
		catch(exc) { if (this.debug) this.logInfo("processXMLString error:"+exc.name+", "+exc.message+"\n"+xml);} 

		this.mAuthFail = 0;
		this.mRunning  = false;

		if (this.mCbOk) {
			// Try to get server version and store it.
			try {
				if (this.xml2json === true) {
					let serverVersion = xml2json.XPath(newXML,"/Envelope/Header/ServerVersionInfo");
					if ((serverVersion.length > 0) && (xml2json.getAttribute(serverVersion[0], "Version") !== null)) {
						this.exchangeStatistics.setServerVersion(this.currentUrl, xml2json.getAttribute(serverVersion[0], "Version"), xml2json.getAttribute(serverVersion[0], "MajorVersion"), xml2json.getAttribute(serverVersion[0], "MinorVersion"));
					}
					serverVersion = null;
				}
				else {
					let serverVersion = newXML.XPath("/s:Header/ServerVersionInfo");
					if ((serverVersion.length > 0) && (serverVersion[0].getAttribute("Version") != "")) {
						this.exchangeStatistics.setServerVersion(this.currentUrl, serverVersion[0].getAttribute("Version"), serverVersion[0].getAttribute("MajorVersion"), serverVersion[0].getAttribute("MinorVersion"));
					}
					serverVersion[0] = null;
					serverVersion = null;
				}
			}
			catch(err) { }

			this.retryCount = 0;

			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) {
				exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			}

try {
			this.mCbOk(this, newXML);
}catch(err) { dump("onload: err:"+err+"\n"+this.globalFunctions.STACK()+"\n"+xml+"\n");}
			this.originalReq = null;
		}

//dump(" stat: time1:"+(time2-time1)+", time2:"+(time4-time3)+"\n");
		newXML = null;

		this.observerService.notifyObservers(this._notificationCallbacks, "onExchangeConnectionOk", this.currentUrl);
	},

	retryCurrentUrl: function()
	{
		this.sendRequest(this.mData, this.currentUrl);
	},

	tryNextURL: function _tryNextURL()
	{
		if (this.debug) this.logInfo("exchangeRequest.tryNextURL");
                let xmlReq = this.mXmlReq;
		if (xmlReq.readyState != 4) {
			xmlReq.abort();
		}

		if (this.urllist.length > 0) {
			if (this.debug) this.logInfo("exchangeRequest.tryNextURL: We have another URLto try the request on.");
			this.sendRequest(this.mData);
			return true;
		}
		return false;
	},

	getPrePassword: function _getPrePassword(aCurrentUrl, aUser)
	{
		var tmpURL = aCurrentUrl;
		if (aUser != "") {
			// We insert the username into the URL the prePassword needs it.
			// https://webmail.example.com/ews/exchange.asmx

			var tmpColon = tmpURL.indexOf("://");
			tmpURL = tmpURL.substr(0, tmpColon+3) + aUser + "@" + tmpURL.substr(tmpColon+3);
		}
		return this._notificationCallbacks.getPrePassword(aUser, tmpURL);
	},

        isHTTPError: function()
        {
                let xmlReq = this.mXmlReq;

                if (xmlReq.status != 200) {
			if (xmlReq.status ==  303) {  // See Other (since HTTP/1.1) new request should be a GET instead of a POST.
 				this.fail(this.ER_ERROR_HTTP_ERROR4XX, "HTTP Redirection "+xmlReq.status+": See Other\n"+xmlReq.responseText.substr(0,300)+"\n\n");
                        	return true;
			}

                        if ((xmlReq.status > 399) && (xmlReq.status < 500)) {

				var errMsg = "";
				switch (xmlReq.status) {
				case 400: errMsg = "Bad request"; break;
				case 401: errMsg = "Unauthorized"; break;
				case 402: errMsg = "Payment required"; break;
				case 403: errMsg = "Forbidden"; break;
				case 404: errMsg = "Not found"; break;
				case 405: errMsg = "Method not allowed"; break;
				case 406: errMsg = "Not acceptable"; break;
				case 407: errMsg = "Proxy athentication required"; break;
				case 408: errMsg = "Request timeout"; break;
				case 409: errMsg = "Conflict"; break;
				case 410: errMsg = "Gone"; break;
				case 411: errMsg = "Length required"; break;
				case 412: errMsg = "Precondition failed"; break;
				case 413: errMsg = "Request entity too large"; break;
				case 414: errMsg = "Request-URI too long"; break;
				case 415: errMsg = "Unsupported media type"; break;
				case 416: errMsg = "Request range not satisfiable"; break;
				case 417: errMsg = "Expectation failed"; break;
				case 418: errMsg = "I'm a teapot(RFC 2324)"; break;
				case 420: errMsg = "Enhance your calm (Twitter)"; break;
				case 422: errMsg = "Unprocessable entity (WebDAV)(RFC 4918)"; break;
				case 423: errMsg = "Locked (WebDAV)(RFC 4918)"; break;
				case 424: errMsg = "Failed dependency (WebDAV)(RFC 4918)"; break;
				case 425: errMsg = "Unordered collection (RFC 3648)"; break;
				case 426: errMsg = "Upgrade required (RFC2817)"; break;
				case 428: errMsg = "Precondition required"; break;
				case 429: errMsg = "Too many requests"; break;
				case 431: errMsg = "Request header fields too large"; break;
				case 444: errMsg = "No response"; break;
				case 449: errMsg = "Retry with"; break;
				case 450: errMsg = "Blocked by Windows Parental Controls"; break;
				case 499: errMsg = "Client closed request"; break;
				}

                                if (this.debug) this.logInfo(": isConnError req.status="+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText, 2);

				var myAuthPrompt2 = Cc["@1st-setup.nl/exchange/authprompt2;1"].getService(Ci.mivExchangeAuthPrompt2);
				if ((this.urllist.length > 0) && (!myAuthPrompt2.getUserCanceled(this.currentUrl))) {
					if (this.tryNextURL()) { 
						return true;
					}
	 				this.fail(this.ER_ERROR_HTTP_ERROR4XX, "HTTP Client error "+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText.substr(0,300)+"\n\n");
				}
				else {
					if (myAuthPrompt2.getUserCanceled(this.currentUrl)) {
		 				this.fail(this.ER_ERROR_USER_ABORT_AUTHENTICATION,  "User canceled providing a valid password for url="+this.currentUrl+". Aborting this request.");
					}
					else {
		 				this.fail(this.ER_ERROR_HTTP_ERROR4XX, "HTTP Client error "+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText.substr(0,300)+"\n\n");
					}
				}

                        	return true;

                        }

                        if ((xmlReq.status > 499) && (xmlReq.status < 600)) {

				var errMsg = "";
				switch (xmlReq.status) {
				case 500: errMsg = "Internal server error"; 

						// First check if we have a version mismatch and we need a lower version. This sometimes happens.
						if (xmlReq.responseText.indexOf("ErrorInvalidServerVersion") > -1) {
							if (this.debug) this.logInfo(" ErrorInvalidServerVersion -> RequestServerVersion wrong:"+this.version+".", 2);
							// We are going to retry with a different serverversion.
							var tryAgain = false;
							switch(this.version) {
							case "Exchange2010":
								this.exchangeStatistics.setServerVersion(this.mArgument.serverUrl, "Exchange2007_SP1", null, null);
								tryAgain = true;
								break;
							case "Exchange2010_SP1":
								this.exchangeStatistics.setServerVersion(this.mArgument.serverUrl, "Exchange2010", null, null);
								tryAgain = true;
								break;
							case "Exchange2010_SP2":
								this.exchangeStatistics.setServerVersion(this.mArgument.serverUrl, "Exchange2010_SP1", null, null);
								tryAgain = true;
								break;
							case "Exchange2013":
								this.exchangeStatistics.setServerVersion(this.mArgument.serverUrl, "Exchange2010_SP2", null, null);
								tryAgain = true;
								break;
							default:
								tryAgain = false;
							}
							if (tryAgain) {
								if (this.debug) this.logInfo("Going to retry with lower server version", 2);
								this.sendRequest(this.makeSoapMessage(this.originalReq), this.currentUrl);
								return true;
							}
						}

						// First check if we have a version mismatch and we need a higher version. This sometimes happens.
						if ((xmlReq.responseText.indexOf("ErrorIncorrectSchemaVersion") > -1) &&
							(xmlReq.responseText.indexOf("RequestServerVersion") > -1) ) {
							if (this.debug) this.logInfo(" ErrorIncorrectSchemaVersion -> RequestServerVersion wrong:"+this.version+".", 2);
							// We are going to retry with a different serverversion.
							var tryAgain = false;
							switch(this.version) {
							case "Exchange2007_SP1":
								this.exchangeStatistics.setServerVersion(this.mArgument.serverUrl, "Exchange2010", null, null);
								tryAgain = true;
								break;
							case "Exchange2010":
								this.exchangeStatistics.setServerVersion(this.mArgument.serverUrl, "Exchange2010_SP1", null, null);
								tryAgain = true;
								break;
							case "Exchange2010_SP1":
								this.exchangeStatistics.setServerVersion(this.mArgument.serverUrl, "Exchange2010_SP2", null, null);
								tryAgain = true;
								break;
							case "Exchange2010_SP2":
								this.exchangeStatistics.setServerVersion(this.mArgument.serverUrl, "Exchange2013", null, null);
								tryAgain = true;
								break;
							default:
								tryAgain = false;
							}
							if (tryAgain) {
								if (this.debug) this.logInfo("Going to retry with higher server version", 2);
								this.sendRequest(this.makeSoapMessage(this.originalReq), this.currentUrl);
								return true;
							}
						}

						// This might be generated because of a password not yet supplied in open function during a request so we try again
						//if ((this.prePassword == "") && 
						if	((!exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) || (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount < 3)) {
							if (this.debug) this.logInfo("isHTTPError: We are going to ask the user or password store for a password and try again.");
							this.prePassword = this.getPrePassword(this.currentUrl, this.mArgument.user);

							if (this.prePassword) {

								if (this.debug) this.logInfo("isHTTPError: We received a prePassword. Going to retry current URL");

								if (!exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) {
									exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl] = {};
									exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
								}
								exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].prePassword = this.prePassword;
								exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount++;

								xmlReq.abort();

								this.retryCurrentUrl();

								return true;
							}
							if (this.debug) this.logInfo("isHTTPError: User canceled request for prePassword.");
						}

						if	((exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) && (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount > 2)) {
							// Failed three times. Remove password also from password store.
							if (this.debug) this.logInfo("isHTTPError: Failed password "+exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount+" times. Stopping communication.");
							var title = "Microsoft Exchange EWS";
							var tmpURL = this.currentUrl;
							if (this.mArgument.user != "") {
								// We insert the username into the URL the prePassword needs it.
								// https://webmail.example.com/ews/exchange.asmx

								var tmpColon = tmpURL.indexOf("://");
								tmpURL = tmpURL.substr(0, tmpColon+3) + this.mArgument.user + "@" + tmpURL.substr(tmpColon+3);
							}
							this._notificationCallbacks.passwordManagerRemove(this.mArgument.user, tmpURL, title);
						}

						if (!exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) {
							exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl] = {};
						}
						
						exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;

						this.prePassword = null;

						break;
				case 501: errMsg = "Not implemented"; break;
				case 502: errMsg = "Bad gateway"; break;
				case 503: errMsg = "Service unavailable"; break;
				case 504: errMsg = "Gateway timeout"; break;
				case 505: errMsg = "HTTP version not supported"; break;
				case 506: errMsg = "Variant also negotiates (RFC 2295)"; break;
				case 507: errMsg = "Insufficient Storage (WebDAV)(RFC 4918)"; break;
				case 508: errMsg = "Loop detected (WebDAV)(RFC 4918)"; break;
				case 509: errMsg = "Bandwith limit exceeded (Apache bw/limited extension)"; break;
				case 510: errMsg = "Not extended (RFC 2774)"; break;
				case 511: errMsg = "Network authentication required"; break;
				case 598: errMsg = "Network read timeout error"; break;
				case 599: errMsg = "Network connect timeout error"; break;
				}

                                if (this.debug) this.logInfo(": isConnError req.status="+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText, 2);

				if (this.tryNextURL()) {
					return true;
				}

 				this.fail(this.ER_ERROR_HTTP_ERROR4XX, "HTTP Server error "+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText.substr(0,300)+"\n\n");
                        	return true;
                        }

			if (this.tryNextURL()) {
				return true;
			}
                        // XXX parse it
 			this.fail(this.ER_ERROR_FROM_SERVER, "Unknown error from server"+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText.substr(0,300)+"\n\n");
                        return true;
                }

                return false;
        },

	fail: function(aCode, aMsg)
	{
		if (this.debug) this.logInfo("ecExchangeRequest.fail: aCode:"+aCode+", aMsg:"+aMsg);
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
		this.originalReq = null;
	},

	makeSoapMessage2: function erMakeSoapMessage2(aReq)
	{
		this.originalReq = aReq;

		var root = xml2json.newJSON();
		var msg = xml2json.addTag(root, "Envelope", "nsSoap");
		xml2json.setAttribute(msg, "xmlns:nsSoap", nsSoapStr);
		xml2json.setAttribute(msg, "xmlns:nsMessages", nsMessagesStr);
		xml2json.setAttribute(msg, "xmlns:nsTypes", nsTypesStr);

		this.version = this.exchangeStatistics.getServerVersion(this.mArgument.serverUrl);
		
		var header = xml2json.addTag(msg,"Header", "nsSoap", null);

		var requestServerVersion = xml2json.addTag(header, "RequestServerVersion", "nsTypes", null);
		xml2json.setAttribute(requestServerVersion, "Version", this.version);
		
		var exchTimeZone = this.timeZones.getExchangeTimeZoneByCalTimeZone(this.globalFunctions.ecDefaultTimeZone(), this.mArgument.serverUrl, cal.now());

		if (exchTimeZone) {
				let timeZoneContext = xml2json.addTag(header, "TimeZoneContext", "nsTypes", null);
				let tmpTimeZone = xml2json.addTag(timeZoneContext, "TimeZoneDefinition", "nsTypes");
				if (this.version.indexOf("2007") < 0) {
					xml2json.setAttribute(tmpTimeZone, "Name",exchTimeZone.name);
				}
				xml2json.setAttribute(tmpTimeZone, "Id",exchTimeZone.id);
				tmpTimeZone = null;
				timeZoneContext = null;
		}
		header = null;

		let body = xml2json.addTag(msg, "Body", "nsSoap", null);
		xml2json.addTagObject(body, aReq);
		body = null;

		var tmpStr = xml_tag + xml2json.toString(root);
		msg = null;
		root = null;
		return tmpStr;
	},

	makeSoapMessage: function erMakeSoapMessage(aReq)
	{
		this.originalReq = aReq;

		var msg = new mivIxml2jxon('<nsSoap:Envelope xmlns:nsSoap="'+nsSoapStr+'" xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>', 0, null);

		this.version = this.exchangeStatistics.getServerVersion(this.mArgument.serverUrl);
		
		var header = msg.addChildTag("Header", "nsSoap", null);

/*		if (this.mArgument.ServerVersion) {
			header.addChildTag("RequestServerVersion", "nsTypes", null).setAttribute("Version", this.mArgument.ServerVersion);
		}
		else {*/
			header.addChildTag("RequestServerVersion", "nsTypes", null).setAttribute("Version", this.version);
//		}
		
		var exchTimeZone = this.timeZones.getExchangeTimeZoneByCalTimeZone(this.globalFunctions.ecDefaultTimeZone(), this.mArgument.serverUrl, cal.now());

		if (exchTimeZone) {
				//exchTimeZone.timeZone.tagName = "TimeZoneDefinition";
				//header.addChildTag("TimeZoneContext", "nsTypes", null).addChildTagObject(exchTimeZone.timeZone);

				if (this.version.indexOf("2007") > -1) {
					var tmpTimeZone = new mivIxml2jxon('<t:TimeZoneDefinition xmlns:m="'+nsMessagesStr+'" xmlns:t="'+nsTypesStr+'"/>',0,null);
					tmpTimeZone.setAttribute("Id",exchTimeZone.id); 
				}
				else {
					var tmpTimeZone = new mivIxml2jxon('<t:TimeZoneDefinition xmlns:m="'+nsMessagesStr+'" xmlns:t="'+nsTypesStr+'"/>',0,null);
					tmpTimeZone.setAttribute("Name",exchTimeZone.name); 
					tmpTimeZone.setAttribute("Id",exchTimeZone.id); 
				}
				header.addChildTag("TimeZoneContext", "nsTypes", null).addChildTagObject(tmpTimeZone);
				tmpTimeZone = null;
		}
		header = null;

		msg.addChildTag("Body", "nsSoap", null).addChildTagObject(aReq);

//dump("Going to send1:"+msg.toString().length+", xml:"+msg.getSize()+"\n");
//dump("Going to send2:"+msg.toString()+"\n");

		var tmpStr = xml_tag + msg.toString();
		msg = null;
		return tmpStr;
	},

	getSoapErrorMsg: function _getSoapErrorMsg(aResp)
	{
		if (this.xml2json) {
			var rm = xml2json.XPath(aResp, "/s:Envelope/s:Body/*/m:ResponseMessages/*[@ResponseClass='Error']");
			var result;
			if (rm.length > 0) {
				result = xml2json.getTagValue(rm[0], "m:MessageText").value+"("+xml2json.getTagValue(rm[0], "m:ResponseCode")+")";
			}
			else {
				result = null;
			}
		}
		else {
			var rm = aResp.XPath("/s:Envelope/s:Body/*/m:ResponseMessages/*[@ResponseClass='Error']");
			var result;
			if (rm.length > 0) {
				result = rm[0].getTagValue("m:MessageText").value+"("+rm[0].getTagValue("m:ResponseCode")+")";
			}
			else {
				result = null;
			}

		}
		rm = null;
		return result
	},

	passwordError: function erPasswordError(aMsg)
	{
		this.fail(this.ERR_PASSWORD_ERROR, aMsg);
	},


};

var ecPasswordErrorList = {};

function ecnsIAuthPrompt2(aExchangeRequest)
{
	this.exchangeRequest = aExchangeRequest;

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
	this.uuid = this.globalFunctions.getUUID();

	this.callback = null;
	this.context = null;
	this.level = null;
	this.authInfo = null;
	this.channel = null;
	this.trycount = 0;

	this.username = null;
	this.password = null;
	this.URL = null;
	this.lastStatus = 0;  // set by nsIProgressEventSink onStatus.
	
	this.timer = Cc["@mozilla.org/timer;1"]
					.createInstance(Ci.nsITimer);
}

ecnsIAuthPrompt2.prototype = {

	QueryInterface: XPCOMUtils.generateQI([Ci.nsIAuthPrompt2, Ci.nsIBadCertListener2, Ci.nsIProgressEventSink, 
						Ci.nsISecureBrowserUI, Ci.nsIDocShellTreeItem, Ci.nsIAuthPromptProvider,
						Ci.nsIChannelEventSink, Ci.nsIRedirectResultListener]),

	getInterface: function(iid)
	{
		if ((Ci.nsIAuthPrompt2) && (iid.equals(Ci.nsIAuthPrompt2))) {    // id == 651395eb-8612-4876-8ac0-a88d4dce9e1e
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIAuthPrompt2");
			return 	Cc["@1st-setup.nl/exchange/authprompt2;1"].getService(Ci.mivExchangeAuthPrompt2);
		} 

		if ((Ci.nsIBadCertListener2) && (iid.equals(Ci.nsIBadCertListener2))) {
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIBadCertListener2");
        		return Cc["@1st-setup.nl/exchange/badcertlistener2;1"].getService(Ci.mivExchangeBadCertListener2);
		} 

		if ((Ci.nsIProgressEventSink) && (iid.equals(Ci.nsIProgressEventSink))) {   // iid == d974c99e-4148-4df9-8d98-de834a2f6462
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIProgressEventSink");
        		return this;
		} 

		if ((Ci.nsISecureBrowserUI) && (iid.equals(Ci.nsISecureBrowserUI))) {   // iid == 081e31e0-a144-11d3-8c7c-00609792278c
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsISecureBrowserUI");
        		return this;
		} 

		if ((Ci.nsIDocShellTreeItem) && (iid.equals(Ci.nsIDocShellTreeItem))) {   // iid == 09b54ec1-d98a-49a9-bc95-3219e8b55089
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIDocShellTreeItem");
        		return Cr.NS_NOINTERFACE;
		} 

		if ((Ci.nsIAuthPromptProvider) && (iid.equals(Ci.nsIAuthPromptProvider))) {   // iid == bd9dc0fa-68ce-47d0-8859-6418c2ae8576
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIAuthPromptProvider");
			return 	Cc["@1st-setup.nl/exchange/authpromptprovider;1"].getService();
		} 

		if ((Ci.nsIChannelEventSink) && (iid.equals(Ci.nsIChannelEventSink))) {   // iid == a430d870-df77-4502-9570-d46a8de33154
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIChannelEventSink");
        		return this;
		} 

		if ((Ci.nsIRedirectResultListener) && (iid.equals(Ci.nsIRedirectResultListener))) {   // iid == 85cd2640-e91e-41ac-bdca-1dbf10dc131e
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIRedirectResultListener");
        		return this;
		} 

		// The next iid is available sine TB 13.
		if ((Ci.nsILoadContext) && (iid.equals(Ci.nsILoadContext))) {   // iid == 386806c3-c4cb-4b3d-b05d-c08ea10f5585 also exists as iid == 48b5bf16-e0c7-11e1-b28e-91726188709b
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsILoadContext");
			return Cr.NS_NOINTERFACE;  // We do not support this.
		}

		// The next iid is called when the TB goes into offline mode.
		if ((Ci.nsIApplicationCacheContainer) && (iid.equals(Ci.nsIApplicationCacheContainer))) {   // iid == bbb80700-1f7f-4258-aff4-1743cc5a7d23
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIApplicationCacheContainer");
			return Cr.NS_NOINTERFACE;  // We do not support this.
		}

		this.globalFunctions.LOG("  >>>>>>>>>>> SUBMIT THIS LINE TO https://github.com/Ericsson/exchangecalendar/issues: ecnsIAuthPrompt2.getInterface("+iid+")");
		throw Cr.NS_NOINTERFACE;
	},

	// nsIProgressEventSink
	onProgress: function _nsIProgressEventSink_onProgress(aRequest, aContext, aProgress, aProgressMax)
	{
		if (aRequest  instanceof Ci.nsIChannel) {
			this.logInfo("  --- ecnsIAuthPrompt2.onProgress: this is a nsIChannel");
		}
		this.logInfo("  --- ecnsIAuthPrompt2.onProgress:"+aProgress+" of "+aProgressMax);
	},

	// nsIProgressEventSink
	onStatus: function _nsIProgressEventSink_onStatus(aRequest, aContext, aStatus, aStatusArg)
	{
		this.lastStatus = aStatus;
		this.lastStatusArg = aStatusArg;
		switch (aStatus) {
		case 0x804b0003: this.logInfo("  --- ecnsIAuthPrompt2.onStatus: STATUS_RESOLVING of "+aStatusArg); break;
		case 0x804b000b: this.logInfo("  --- ecnsIAuthPrompt2.onStatus: STATUS_RESOLVED of "+aStatusArg); break;
		case 0x804b0007: this.logInfo("  --- ecnsIAuthPrompt2.onStatus: STATUS_CONNECTING_TO of "+aStatusArg); break;
		case 0x804b0004: this.logInfo("  --- ecnsIAuthPrompt2.onStatus: STATUS_CONNECTED_TO of "+aStatusArg); break;
		case 0x804b0005: this.logInfo("  --- ecnsIAuthPrompt2.onStatus: STATUS_SENDING_TO of "+aStatusArg); break;
		case 0x804b000a: this.logInfo("  --- ecnsIAuthPrompt2.onStatus: STATUS_WAITING_FOR of "+aStatusArg); break;
		case 0x804b0006: this.logInfo("  --- ecnsIAuthPrompt2.onStatus: STATUS_RECEIVING_FROM of "+aStatusArg); break;
		default:
			this.logInfo("  --- ecnsIAuthPrompt2.onStatus:"+aStatus+" of "+aStatusArg);
		}
	},

	// nsISecureBrowserUI
	// void init(in nsIDOMWindow window);
	init: function _nsISecureBrowserUI_init(window)
	{
		this.logInfo("  --- ecnsIAuthPrompt2.init (nsISecureBrowserUI):");
		this.nsISecureBrowserUI_Window = window;
	},

	// nsISecureBrowserUI
	//readonly attribute unsigned long state;
	get state()
	{
		this.logInfo("  --- ecnsIAuthPrompt2.state (nsISecureBrowserUI):");
	},

	// nsISecureBrowserUI
	//readonly attribute AString tooltipText;
	get tooltipText()
	{
		this.logInfo("  --- ecnsIAuthPrompt2.tooltipText (nsISecureBrowserUI):");
		return "ecnsIAuthPrompt2.tooltipText";
	},
	
	// nsIChannelEventSink
	//void asyncOnChannelRedirect(in nsIChannel oldChannel, 
        //                        in nsIChannel newChannel,
        //                        in unsigned long flags,
        //                        in nsIAsyncVerifyRedirectCallback callback);
	asyncOnChannelRedirect: function _nsIChannelEventSink_asyncOnChannelRedirect(oldChannel, newChannel, flags, callback)
	{
		var tmpStr = "";
		if (flags & 1) tmpStr += "REDIRECT_TEMPORARY";
		if (flags & 2) tmpStr += " REDIRECT_PERMANENT";
		if (flags & 4) tmpStr += " REDIRECT_INTERNAL";

		this.logInfo("  --- nsIChannelEventSink.asyncOnChannelRedirect :flags:"+flags+"="+tmpStr);

		
		var url1 = "";
		var url2 = "";

		try { url1 = oldChannel.originalURI.spec; } catch(er) { url1 = "unknown"; }
		try { url2 = newChannel.originalURI.spec; } catch(er) { url2 = "unknown"; }

		this.logInfo("We are going to allow the redirect from '"+url1+"' to '"+url2+"'.");

	        newChannel.notificationCallbacks = this;
	        callback.onRedirectVerifyCallback(Cr.NS_OK);
	},

	// nsIRedirectResultListener
	//void onRedirectResult(in boolean proceeding);
	onRedirectResult: function _nsIRedirectResultListener_onRedirectResult(proceeding)
	{
		this.logInfo("  --- nsIRedirectResultListener.nsIRedirectResultListener :proceeding:"+proceeding);
	},

	getPrePassword: function _getPrePassword(aUsername, aURL)
	{
		this.logInfo("getPrePassword for user:"+aUsername+", server url:"+aURL);
		this.username = aUsername;
		this.URL = aURL;
 		
		var password;
		var myAuthPrompt2 = Cc["@1st-setup.nl/exchange/authprompt2;1"].getService(Ci.mivExchangeAuthPrompt2);
		if (myAuthPrompt2.getUserCanceled(aURL)) {
			return null;
		}
		var openUser = aUsername;

		try {
			password = myAuthPrompt2.getPassword(null,openUser, aURL);
		}
		catch(err) {
		}

		return password;
	},

	logInfo: function _logInfo(aMsg)
	{
		var prefB = Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefBranch);

		this.debug = this.globalFunctions.safeGetBoolPref(prefB, "extensions.1st-setup.authentication.debug", false, true);
		if (this.debug) {
			this.globalFunctions.LOG(this.uuid+": "+aMsg);
		}
	},


}
