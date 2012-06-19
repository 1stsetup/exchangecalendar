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

Cu.import("resource://exchangecalendar/ecFunctions.js");

var EXPORTED_SYMBOLS = ["ExchangeRequest","nsSoap","nsTypes","nsMessages", "nsSoapStr","nsTypesStr","nsMessagesStr","nsAutodiscoverResponse", "xml_tag", "getEWSServerVersion"];

var xml_tag = '<?xml version="1.0" encoding="utf-8"?>\n';
var nsSoap = new Namespace("nsSoap", "http://schemas.xmlsoap.org/soap/envelope/");
var nsTypes = new Namespace("nsTypes", "http://schemas.microsoft.com/exchange/services/2006/types");
var nsMessages = new Namespace("nsMessages", "http://schemas.microsoft.com/exchange/services/2006/messages");

const nsSoapStr = "http://schemas.xmlsoap.org/soap/envelope/";
const nsTypesStr = "http://schemas.microsoft.com/exchange/services/2006/types";
const nsMessagesStr = "http://schemas.microsoft.com/exchange/services/2006/messages";

var nsAutodiscoverResponse = new Namespace("nsAutodiscoverResponse", "http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a");

var gExchangeRequestVersion = "0.1";

var gEWSServerVersion = {};

function getEWSServerVersion(aURL)
{
	
	//return "Exchange2007_SP1";
	if ((aURL) && (gEWSServerVersion[aURL])) {
		return gEWSServerVersion[aURL];
	}

	return "Exchange2007_SP1";
}

if (! exchWebService) var exchWebService = {};

exchWebService.prePasswords = {};

function ExchangeRequest(aArgument, aCbOk, aCbError, aListener)
{
	this.mData = "";
	this.mArgument = aArgument;
	this.mCbOk   = aCbOk;
	this.mCbError   = aCbError;
	this.retries = 0;
	this.urllist = [];
	this.currentUrl = "";
	this.listener = aListener;
	this.e4x = true;
	this.xml2jxon_receive = false;
	this.xml2jxon_send = false;
	this.retryCount = 0;

	this.mAuthFail = 0;
	this.xmlReq = null;
	this.shutdown = false;
	this.badCert = false;
	this.badCertCount = 0;
	this._notificationCallbacks = null;

	this.uuid = exchWebService.commonFunctions.getUUID();

	this.debug = true;

	this.prePassword = "";

	this.kerberos = true;

	this.prefB = Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefBranch);


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

	ERR_PASSWORD_ERROR: -300, // To many password errors.

	logInfo: function _logInfo(aMsg, aLevel)
	{
		this.debug = exchWebService.commonFunctions.safeGetBoolPref(this.prefB, "extensions.1st-setup.network.debug", false, true);
		this.debuglevel = exchWebService.commonFunctions.safeGetIntPref(this.prefB, "extensions.1st-setup.network.debuglevel", 1, true);

		if (!aLevel) var aLevel = 1;

		if ((this.debug) && (aLevel <= this.debuglevel)) {
			exchWebService.commonFunctions.LOG(this.uuid+": "+aMsg);
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

	make_basic_auth: function _make_basic_auth(user, password) {
	  var tok = user + ':' + password;
	  var hash = btoa(tok);
	  return "Basic " + hash;
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

		// remove domain part in xmlhttprequest.open call
		this.logInfo(": 1 ExchangeRequest.sendRequest : user="+this.mArgument.user+", url="+this.currentUrl);

		if ((this.prePassword == "") && (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl])) {
			this.prePassword = exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].prePassword;
		}

		this._notificationCallbacks = new ecnsIAuthPrompt2(this);

		try {
			if (this.prePassword != "") {
				this.logInfo("We have a prePassword: *******");
			}

			if (this.prePassword == "") {
				this.xmlReq.open("POST", this.currentUrl, true);
			}
			else {
				this.xmlReq.open("POST", this.currentUrl, true, this.mArgument.user, this.prePassword);
			}

			if (!this.kerberos) {
				var basicAuthPw = this.getPrePassword(this.currentUrl, this.mArgument.user);
				if (basicAuthPw) {
					var auth = this.make_basic_auth(this.mArgument.user,basicAuthPw);
					this.xmlReq.setRequestHeader('Authorization', auth);
				}
				else {
					this.onUserStop(this.ER_ERROR_USER_ABORT_AUTHENTICATION, "ExchangeRequest.sendRequest: User cancelation or error.");
					return;
				}
			}
			else {
				this.logInfo("We leave the basic auth details out of the request because we are trying for Kerberos Authentication.");
			}

		}
		catch(err) {
			this.logInfo(": ERROR on ExchangeRequest.sendRequest to URL:"+this.currentUrl+". err:"+err); 

			if (this.tryNextURL()) {
				return;
			}

			this.fail(this.ER_ERROR_OPEN_FAILED,"Could not connect to specified host:"+err);
		}

		this.xmlReq.overrideMimeType('text/xml');
		this.xmlReq.setRequestHeader("Content-Type", "text/xml");
		this.xmlReq.setRequestHeader("User-Agent", "extensions.1st-setup.nl/" + gExchangeRequestVersion+"/username="+this.mArgument.user);

		// This is required for NTLM authenticated sessions. Which is default for a default EWS install.
		this.xmlReq.setRequestHeader("Connection", "keep-alive");

		/* set channel notifications for password processing */
		this.xmlReq.channel.notificationCallbacks = this._notificationCallbacks;
		this.xmlReq.channel.loadGroup = null;

		var httpChannel = this.xmlReq.channel.QueryInterface(Ci.nsIHttpChannel);

		// XXX we want to preserve POST across 302 redirects TODO: This might go away because header params are copyied right now.
		httpChannel.redirectionLimit = 0;

		this.logInfo(": sendRequest Sending: " + this.mData+"\n", 2);

		this.xmlReq.send(this.mData);
	},

	loadstart: function _loadtstart(evt)
	{
		this.logInfo(": ExchangeRequest.loadstart");
		this.shutdown = false;
		this.badCert = false;
	},

	loadend: function _loadend(evt)
	{
		this.logInfo(": ExchangeRequest.loadend");
	},

	progress: function _progress(evt)
	{
		this.logInfo(": ExchangeRequest.progress. loaded:"+evt.loaded+", total:"+evt.total);
	},

	error: function _error(evt)
	{
		let xmlReq = this.mXmlReq;

		this.logInfo(": ExchangeRequest.error :"+evt.type+", readyState:"+xmlReq.readyState+", status:"+xmlReq.status+", lastStatus:"+this._notificationCallbacks.lastStatus);

		if ((!this.shutdown) && (this.badCert)) {
			// On this connection a bad certificate was seen. Wait until it resets.
			//this.sendRequest(this.mData, this.currentUrl);
			return;
		}

		if (this.isHTTPRedirect(evt)) return;

		if (this.tryNextURL()) return;

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
		this.logInfo("ExchangeRequest.abort: type:"+evt.type);
		if (evt.type != "abort") {
			this.logInfo("ecExchangeRequest.abort: "+evt.type);
		}
//		this.fail(-3, "User aborted data transfer.");
	},

	onUserStop: function _onUserStop(aCode, aMsg)
	{
		this.logInfo("ecExchangeRequest.onUserStop: aCode:"+aCode+", aMsg:"+aMsg);
		this.mXmlReq.abort();
		this.fail(aCode, aMsg);
	},

	isHTTPRedirect: function(evt)
	{
		this.logInfo("exchangeRequest.isHTTPRedirect");
		let xmlReq = this.mXmlReq;

		if (xmlReq.readyState != 4)
			return false;

		switch (xmlReq.status) {
		case 301:  // Moved Permanently
		case 302:  // Found
		case 307:  // Temporary redirect (since HTTP/1.1)
			this.logInfo(": ExchangeRequest.redirect :"+evt.type+", readyState:"+xmlReq.readyState+", status:"+xmlReq.status);

			let httpChannel = xmlReq.channel.QueryInterface(Ci.nsIHttpChannel);
			let loc = httpChannel.getResponseHeader("Location");

			// The location could be a relative path
			if (loc.indexOf("http") == -1) {
				this.logInfo("new location looks to be relative.");
				if (loc.indexOf("/") == 0) {
					this.logInfo("Relative to the root of the server.");
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
					this.logInfo("it is relative to the last dir. Currently not able to handle this. Will be available in future version.");
				}
			}

			this.logInfo(": Redirect: " + loc + "\n");

                        // XXX pheer loops.
                        xmlReq.abort();
                        this.sendRequest(this.mData, loc);

			return true;
		}

		return false;
	},

	onLoad:function _onLoad(evt) 
	{
		let xmlReq = this.mXmlReq;

		this.logInfo(": ExchangeRequest.onLoad :"+evt.type+", readyState:"+xmlReq.readyState+", status:"+xmlReq.status);
		this.logInfo(": ExchangeRequest.onLoad :"+xmlReq.responseText,2);

		if (xmlReq.readyState != 4) {
			this.logInfo("readyState < 4. THIS SHOULD NEVER HAPPEN. PLEASE REPORT.");
			return;
		}

		if (this.isHTTPRedirect(evt)) {
			return;
		}

		if (this.isHTTPError()) {
			return;
		}

		var xml = xmlReq.responseText; // bug 270553
		xml = xml.replace(/^<\?xml\s+version\s*=\s*(?:"[^"]+"|'[^']+')[^?]*\?>/, ""); // bug 336551

		xml = xml.replace(/&#x10;/g, ""); // BUG 61 remove hexadecimal code 0x10. It will fail in xml conversion.

		// START VERY EXPERIMENTAL
		try {
		    var newXML = Cc["@1st-setup.nl/conversion/xml2jxon;1"]
				       .createInstance(Ci.mivIxml2jxon);
		}
		catch(exc) { this.logInfo("createInstance error:"+exc);}

		try {
			newXML.processXMLString(xml, 0, null);
		}
		catch(exc) { this.logInfo("processXMLString error:"+exc.name+", "+exc.message+"\n"+xml);} 
		// END VERY EXPERIMENTAL 

		try {
			xml = new XML(xml);
		}
		catch(er) {
			this.logInfo("XML conversion error 1: "+ er);
			// BUG 61 Convert all Hex codes to decimal
			xml = xml.replace(/&#x([0123456789ABCDEF][0123456789ABCDEF]?);/g, function(str, ent) { return "&#"+parseInt(ent,16)+";"; }); 
			try {
				xml = new XML(xml);
			}
			catch(er2) {
				this.logInfo("XML conversion error 2: "+ er);
				 // BUG 61 remove all decimal codes below character 32 (space) 
				xml = xml.replace(/&#([0123456789]?);/g, function(str, ent) parseInt(ent,10) < 32 ? "" : "&#"+parseInt(ent,10)+";" );
				try {
					xml = new XML(xml);
				}
				catch (er3) {
					this.logInfo("FATAL XML conversion error 3: "+ er3);
					this.logInfo("          String which fails: "+ xml, 2);

					var answer = xmlReq.responseText.substr(0,100)+"\n\n";
					
					this.fail(this.ER_ERROR_XML_CONVERSION_ERROR, "Fatal XML conversion error. Probably because we did not receive a page with XML. (onLoad)\n\n"+answer);
					if (this.tryNextURL()) {
						return;
					}

					xmlReq.abort();
					return;
				}
			}
		}

		this.mAuthFail = 0;
		this.mRunning  = false;

		var resp;
		if (this.e4x) {
			resp = xml;
		} else {
			resp = xmlReq.responseXML;
		}

		if (this.mCbOk) {
			// Try to get server version and store it.
			try {
				var serverVersion = resp.nsSoap::Header.nsTypes::ServerVersionInfo;
				if ((serverVersion) && (serverVersion.@Version != "")) {
					if (serverVersion.@Version == "Exchange2010_SP2") {
						gEWSServerVersion[this.currentUrl] = "Exchange2010_SP1";
					}
					else {
						gEWSServerVersion[this.currentUrl] = serverVersion.@Version;
					}
				}
			}
			catch(err) { }

			this.retryCount = 0;

			if (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) {
				exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount = 0;
			}

			this.mCbOk(this, resp);
		}

	},

	retryCurrentUrl: function()
	{
		this.sendRequest(this.mData, this.currentUrl);
	},

	tryNextURL: function _tryNextURL()
	{
		this.logInfo("exchangeRequest.tryNextURL");
                let xmlReq = this.mXmlReq;
		if (xmlReq.readyState != 4) {
			xmlReq.abort();
		}

		if (this.urllist.length > 0) {
			this.logInfo("exchangeRequest.tryNextURL: We have another URLto try the request on.");
			this.sendRequest(this.mData);
			return true;
		}
		return false;
	},

/*	retry: function() 
	{
                let xmlReq = this.mXmlReq;
		xmlReq.abort();

		// Loop through the urllist
		try {
			this.sendRequest(this.mData);
			return true;
		}
		catch(err) {
		}

		this.fail(this.ER_ERROR_INVALID_URL, "No url to send request to. (retry)");
		xmlReq.abort();
		return true;
	},*/

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

	retryForBasicAuth: function _retryForBasicAuth()
	{
		this.logInfo("exchangeRequest.retryForBasicAuth: We will try Basic Auth Authentication.");
		this.kerberos = true;

                let xmlReq = this.mXmlReq;
		//if (xmlReq.readyState != 4) {
			xmlReq.abort();
		//}

		this.sendRequest(this.mData, this.currentUrl);
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

			/*	if ((xmlReq.status == 401) && (!this.kerberos)) {
					this.retryForBasicAuth();
					return true;
				}*/

                                this.logInfo(": isConnError req.status="+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText, 2);

				if (this.tryNextURL()) {
					return false;
				}

 				this.fail(this.ER_ERROR_HTTP_ERROR4XX, "HTTP Client error "+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText.substr(0,300)+"\n\n");
                        	return true;
                        }

                        if ((xmlReq.status > 499) && (xmlReq.status < 600)) {

				var errMsg = "";
				switch (xmlReq.status) {
				case 500: errMsg = "Internal server error"; 

						// This might be generated because of a password not yet supplied in open function during a request so we try again
						//if ((this.prePassword == "") && 
						if	((!exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) || (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount < 3)) {
							this.logInfo("isHTTPError: We are going to ask the user or password store for a password and try again.");
							this.prePassword = this.getPrePassword(this.currentUrl, this.mArgument.user);

/*							var tmpURL = this.currentUrl;
							if (this.mArgument.user != "") {
								// We insert the username into the URL the prePassword needs it.
								// https://webmail.example.com/ews/exchange.asmx

								var tmpColon = tmpURL.indexOf("://");
								tmpURL = tmpURL.substr(0, tmpColon+3) + this.mArgument.user + "@" + tmpURL.substr(tmpColon+3);
							}
							this.prePassword = this._notificationCallbacks.getPrePassword(this.mArgument.user, tmpURL);*/

							if (this.prePassword) {

								this.logInfo("isHTTPError: We received a prePassword. Going to retry current URL");

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
							this.logInfo("isHTTPError: User canceled request for prePassword.");
						}

						if	((exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl]) && (exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount > 2)) {
							// Failed three times. Remove password also from password store.
							this.logInfo("isHTTPError: Failed password "+exchWebService.prePasswords[this.mArgument.user+"@"+this.currentUrl].tryCount+" times. Stopping communication.");
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

                                this.logInfo(": isConnError req.status="+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText, 2);

				if (this.tryNextURL()) {
					return false;
				}

 				this.fail(this.ER_ERROR_HTTP_ERROR4XX, "HTTP Server error "+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText.substr(0,300)+"\n\n");
                        	return true;
                        }

			if (this.tryNextURL()) {
				return false;
			}
                        // XXX parse it
 			this.fail(this.ER_ERROR_FROM_SERVER, "Unknown error from server"+xmlReq.status+": "+errMsg+"\nURL:"+this.currentUrl+"\n"+xmlReq.responseText.substr(0,300)+"\n\n");
                        return true;
                }

                return false;
        },

	fail: function(aCode, aMsg)
	{
		this.logInfo("ecExchangeRequest.fail: aCode:"+aCode+", aMsg:"+aMsg);
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},

	makeSoapMessage: function erMakeSoapMessage(aReq)
	{
		if (typeof(aReq) == "xml") {
			var msg = <nsSoap:Envelope xmlns:nsSoap={nsSoap} xmlns:nsTypes={nsTypes} xmlns:nsMessages={nsMessages}/>;

			if (this.mArgument.ServerVersion) {
				msg.nsSoap::Header.nsTypes::RequestServerVersion.@Version = this.mArgument.ServerVersion; 
			}
			else {
				msg.nsSoap::Header.nsTypes::RequestServerVersion.@Version = getEWSServerVersion(); 
			}
			msg.nsSoap::Body.request = aReq;

			return xml_tag + String(msg);
		}
		else {

			this.logInfo("makeSoapMessage: aReq is NOT xml.");

			var msg = exchWebService.commonFunctions.xmlToJxon('<nsSoap:Envelope xmlns:nsSoap="'+nsSoap+'" xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');

			if (this.mArgument.ServerVersion) {
//				msg.nsSoap::Header.nsTypes::RequestServerVersion.@Version = this.mArgument.ServerVersion; 
				msg.addChildTag("Header", "nsSoap", null).addChildTag("RequestServerVersion", "nsTypes", null).setAttribute("Version", this.mArgument.ServerVersion);
			}
			else {
//				msg.nsSoap::Header.nsTypes::RequestServerVersion.@Version = getEWSServerVersion(); 
				msg.addChildTag("Header", "nsSoap", null).addChildTag("RequestServerVersion", "nsTypes", null).setAttribute("Version", getEWSServerVersion());
			}
//			msg.nsSoap::Body.request = aReq;
			msg.addChildTag("Body", "nsSoap", null).addChildTagObject(aReq);

			return xml_tag + msg.toString();
		}
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
	this.uuid = exchWebService.commonFunctions.getUUID();
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
			return this;
		} 

		if ((Ci.nsIBadCertListener2) && (iid.equals(Ci.nsIBadCertListener2))) {
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIBadCertListener2");
			if (!this.exchangeRequest.badCert) {
	        		return this;
			}
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
        		return this;
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
		if ((Ci.nsILoadContext) && (iid.equals(Ci.nsILoadContext))) {   // iid == 386806c3-c4cb-4b3d-b05d-c08ea10f5585
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsILoadContext");
			return Cr.NS_NOINTERFACE;  // We do not support this.
		}

		// The next iid is called when the TB goes into offline mode.
		if ((Ci.nsIApplicationCacheContainer) && (iid.equals(Ci.nsIApplicationCacheContainer))) {   // iid == bbb80700-1f7f-4258-aff4-1743cc5a7d23
			this.logInfo("ecnsIAuthPrompt2.getInterface: Ci.nsIApplicationCacheContainer");
			return Cr.NS_NOINTERFACE;  // We do not support this.
		}

		exchWebService.commonFunctions.LOG("  >>>>>>>>>>> MAIL THIS LINE TO exchangecalendar@extensions.1st-setup.nl: ecnsIAuthPrompt2.getInterface("+iid+")");
		throw Cr.NS_NOINTERFACE;
	},

	// nsIBadCertListener2
	notifyCertProblem: function _nsIBadCertListener2_notifyCertProblem(socketInfo, status, targetSite) 
	{
		this.logInfo("ecnsIAuthPrompt2.notifyCertProblem: status:"+status);
		if (!status) {
			return true;
		}

		this.exchangeRequest.badCert = true;

		// Unfortunately we can't pass js objects using the window watcher, so
		// we'll just take the first available calendar window. We also need to
		// do this on a timer so that the modal window doesn't block the
		// network request.
		let wm = Cc["@mozilla.org/appshell/window-mediator;1"]
      	                    .getService(Ci.nsIWindowMediator);
		let calWindow = wm.getMostRecentWindow("mail:3pane") ;

		let timerCallback = {
			exchangeRequest: this.exchangeRequest,
			notify: function(timer) {
				let params = { exceptionAdded: false,
						prefetchCert: true,
						location: targetSite };
				calWindow.openDialog("chrome://pippki/content/exceptionDialog.xul",
						"",
						"chrome,centerscreen,modal",
						params);

				if (params.exceptionAdded) {
					this.exchangeRequest.badCert = false;
					this.exchangeRequest.retryCurrentUrl();
				}
				else {
					this.exchangeRequest.onUserStop(this.exchangeRequest.ER_ERROR_USER_ABORT_ADD_CERTIFICATE, "User did not add needed certificate.");
				}
				} // function(timer)
			};

		let timer = Components.classes["@mozilla.org/timer;1"]
				.createInstance(Components.interfaces.nsITimer);
		timer.initWithCallback(timerCallback, 0,
				Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		return true;
	},

	// nsIProgressEventSink
	onProgress: function _nsIProgressEventSink_onProgress(aRequest, aContext, aProgress, aProgressMax)
	{
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
	
	// nsIAuthPromptProvider
	//void getAuthPrompt(in PRUint32 aPromptReason, in nsIIDRef iid, [iid_is(iid),retval] out nsQIResult result);
	getAuthPrompt: function _nsIAuthPromptProvider_getAuthPrompt(aPromptReason, iid)
	{
		this.logInfo("  --- ecnsIAuthPrompt2.getAuthPrompt:aPromptReason:"+aPromptReason+", iid:"+iid);
		if (iid.equals(Ci.nsIAuthPrompt2)) {    // id == 651395eb-8612-4876-8ac0-a88d4dce9e1e
			this.logInfo("  --- ecnsIAuthPrompt2.getAuthPrompt: iid=nsIAuthPrompt2");
			return this;
		} 

		this.logInfo("  --- ecnsIAuthPrompt2.getAuthPrompt:aPromptReason:"+aPromptReason+", iid:"+iid);
		exchWebService.commonFunctions.LOG("  >>>>>>>>>>> MAIL THIS LINE TO exchangecalendar@extensions.1st-setup.nl: ecnsIAuthPrompt2.getAuthPrompt("+iid+")");
  
		return null;
	},

	//void cancel(in nsresult aReason);
	cancel: function _cancel(aReason)
	{
		if (this.callback) {
			this.callback.onAuthCancelled(this.context, false);
		}
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

	notify: function _nsIAuthPrompt2_timercb() {
		if (this.callback) {
			var password = this.getPassword();
			if (password) {
				if (!(this.authInfo.flags & Ci.nsIAuthInformation.ONLY_PASSWORD)) {
					if (this.authInfo.flags & Ci.nsIAuthInformation.NEED_DOMAIN) {
						if (this.username.indexOf("\\") > -1) {
							this.authInfo.domain = this.username.substr(0,this.username.indexOf("\\"));
							this.authInfo.username = this.username.substr(this.username.indexOf("\\")+1);
						}
						else {
							this.authInfo.domain = "";
							this.authInfo.username = this.username;
						}
					}
					else {
						this.authInfo.username = this.username;
					}
				}
				this.authInfo.password = password;
				//this.logInfo(" USING password for connection:["+password+"]");
				try {
					this.callback.onAuthAvailable(this.context, this.authInfo);
				}
				catch(err) {
					this.logInfo("ecnsIAuthPrompt2.notify ERROR:"+err);
					this.callback.onAuthCancelled(this.context, false);
				}
			}
			else {
				this.callback.onAuthCancelled(this.context, true);
				this.exchangeRequest.onUserStop(this.exchangeRequest.ER_ERROR_USER_ABORT_AUTHENTICATION, "User canceled entering authentication details.");
			}
		}
	},

	cleanURL: function _cleanURL(aURL)
	{
		var result = aURL;

		// Clean the URL as it might contain the password for the user
		// https://domain\username:password@webmail.exmaple.com/ews/exchange.asmx

		// Get second colon if it exists
		var tmpColon = -1;
		var firstColon = false;
		for (var counter=0; counter < result.length; counter++) {
			if (result.substr(counter, 1) == ":") {
				if (!firstColon) {
					firstColon = true;
				}
				else {
					tmpColon = counter;
					break;
				}
			}
		}
		var tmpAmpersand = this.URL.indexOf("@");
		if ((tmpAmpersand > tmpColon) && (tmpColon > -1)) {
			// We have a password remove it.
			result = result.substr(0, tmpColon) + result.substr(tmpAmpersand);
		}

		return result;
	},

	// nsIAuthPrompt2
	//nsICancelable asyncPromptAuth(in nsIChannel aChannel, in nsIAuthPromptCallback aCallback, in nsISupports aContext, in PRUint32 level, in nsIAuthInformation authInfo);
	asyncPromptAuth: function _asyncPromptAuth(aChannel, aCallback, aContext, level, authInfo)
	{
		this.username = this.exchangeRequest.mArgument.user;
		this.password = null;

		this.URL = decodeURI(aChannel.URI.prePath+aChannel.URI.path);

		this.URL = this.cleanURL(this.URL);

		this.logInfo("asyncPromptAuth: aChannel.URI="+this.URL+", username="+this.username+", password="+this.password);

		this.channel = aChannel;
		this.callback = aCallback;
		this.context = aContext;
		this.level = level;
		this.authInfo = authInfo;
		this.trycount++;
		if ((ecPasswordErrorList[this.URL]) && (ecPasswordErrorList[this.URL] > 3)) {
			this.logInfo("ecnsIAuthPrompt2.asyncPromptAuth reset count to big.");
			this.exchangeRequest.passwordError("ecnsIAuthPrompt2.asyncPromptAuth reset count to big.");
			return null;
		}

		if (this.trycount > 4) {
			if (!this.resetPassword()) {
				this.logInfo("ecnsIAuthPrompt2.asyncPromptAuth COULD NOT RESET PASSWORD");
			}
			else {
				this.trycount = 0;
			}
		}
		this.timer.initWithCallback(this, 5, Ci.nsITimer.TYPE_ONE_SHOT);
		return this;
	},

	// nsIAuthPrompt2
	//boolean promptAuth(in nsIChannel aChannel, in PRUint32 level, in nsIAuthInformation authInfo);
	promptAuth: function _promptAuth(aChannel, level, authInfo)
	{
		this.username = this.exchangeRequest.mArgument.user;
		this.password = null;

		this.URL = decodeURI(aChannel.URI.prePath+aChannel.URI.path);;

		this.URL = this.cleanURL(this.URL);

		this.logInfo("asyncPromptAuth: aChannel.URI="+this.URL+", username="+this.username+", password="+this.password);

		var password = this.getPassword();
		if (password) {
			if (!(authInfo.flags & Ci.nsIAuthInformation.ONLY_PASSWORD)) {
				if (authInfo.flags & Ci.nsIAuthInformation.NEED_DOMAIN) {
					if (this.username.indexOf("\\") > -1) {
						authInfo.domain = this.username.substr(0,this.username.indexOf("\\"));
						authInfo.username = this.username.substr(this.username.indexOf("\\")+1);
					}
					else {
						authInfo.domain = "";
						authInfo.username = this.username;
					}
				}
				else {
					authInfo.username = this.username;
				}
			}
			authInfo.password = password;
			return true;
		}
		else {
			this.exchangeRequest.onUserStop(this.exchangeRequest.ER_ERROR_USER_ABORT_AUTHENTICATION, "User canceled entering authentication details.");
			return false;
		}
		return false;
	},

	getPrePassword: function _getPrePassword(aUsername, aURL)
	{
		this.logInfo("getPrePassword for user:"+aUsername+", server url:"+aURL);
		this.username = aUsername;
		this.URL = aURL;
		return this.getPassword();
	},

	getPassword: function _getPassword()
	{
                var username = { value: this.username };

		this.logInfo("getPassword for user:"+username.value+", server url:"+this.URL);

                var password = { value: "" };
		if (this.password) {
	                password = { value: this.password };
		}
                var persist  = { value: false };
		var title = "Microsoft Exchange EWS";
		var realm = this.URL;

		var got = this.passwordManagerGet(username.value, password, realm, title);

		if (got) {
			ecPasswordErrorList[this.URL] = 0;
			this.logInfo(" USING password from passwordmanager:[********]");
			return password.value;
		}

		this.logInfo(" Not a valid password from passwordmanager. Going to ask user to specify credentials.");

		try {
			if ((this.username) && (this.username != "")) {
				var ok = this.getCredentials(title, realm, username, password, persist, true);
			}
			else {
				var ok = this.getCredentials(title, realm, username, password, persist, false);
			}
		}
		catch(exc) {
			this.logInfo(exc);
			return null;
		}

		if (!ok) {
			this.logInfo(" User canceled entering credentials.");
			if (ecPasswordErrorList[this.URL]) {
				ecPasswordErrorList[this.URL] = ecPasswordErrorList[this.URL] + 1;
			}
			else {
				ecPasswordErrorList[this.URL] = 1;
			}
			return null;
		}

		var tmpStr = ".";
		if (persist.value) {
			tmpStr = " and save them into the passwordmanager.";
		}

		this.logInfo(" User gave credentials. Going to use them"+tmpStr);

		ecPasswordErrorList[this.URL] = 0;
		this.exchangeRequest.user = username.value;
		this.username = username.value;

		if (persist.value) {
			this.passwordManagerSave(username.value, password.value, realm, title);
		}

		//this.logInfo(" USING password from userinput:["+password.value+"]");
		return password.value;
	},

	resetPassword: function()
	{
		if (!this.username) {
			return false;
		}

		var title = "Microsoft Exchange EWS";
		var realm = this.URL;
		this.passwordManagerRemove(this.username, realm, title);
		return true;
	},

	logInfo: function _logInfo(aMsg)
	{
		var prefB = Cc["@mozilla.org/preferences-service;1"]
			.getService(Ci.nsIPrefBranch);

		this.debug = exchWebService.commonFunctions.safeGetBoolPref(prefB, "extensions.1st-setup.authentication.debug", false, true);
		if (this.debug) {
			exchWebService.commonFunctions.LOG(this.uuid+": "+aMsg);
		}
	},

	// Following functions taken from calAuthUtils.jsm from Lightning

    /**
     * Tries to get the username/password combination of a specific calendar name
     * from the password manager or asks the user.
     *
     * @param   in aTitle           The dialog title.
     * @param   in aRealm    The calendar name or url to look up. Can be null.
     * @param   inout aUsername     The username that belongs to the calendar.
     * @param   inout aPassword     The password that belongs to the calendar.
     * @param   inout aSavePassword Should the password be saved?
     * @param   in aFixedUsername   Whether the user name is fixed or editable
     * @return  Could a password be retrieved?
     */
    getCredentials: function calGetCredentials(aTitle,
                                               aRealm,
                                               aUsername,
                                               aPassword,
                                               aSavePassword,
                                               aFixedUsername) {

        if (typeof aUsername != "object" ||
            typeof aPassword != "object" ||
            typeof aSavePassword != "object") {
            throw new Components.Exception("", Cr.NS_ERROR_XPC_NEED_OUT_OBJECT);
        }

        let watcher = Cc["@mozilla.org/embedcomp/window-watcher;1"]
                                .getService(Ci.nsIWindowWatcher);
        let prompter = watcher.getNewPrompter(null);

        // Only show the save password box if we are supposed to.
        let savepassword = exchWebService.commonFunctions.getString("passwordmgr", "rememberPassword", null, "passwordmgr");

        let aText;
        if (aFixedUsername) {
            aText = exchWebService.commonFunctions.getString("commonDialogs", "EnterPasswordFor", [aUsername.value, aRealm], "global");
            return prompter.promptPassword(aTitle,
                                           aText,
                                           aPassword,
                                           savepassword,
                                           aSavePassword);
        } else {
            aText = exchWebService.commonFunctions.getString("commonDialogs", "EnterUserPasswordFor", [aRealm], "global");
            return prompter.promptUsernameAndPassword(aTitle,
                                                      aText,
                                                      aUsername,
                                                      aPassword,
                                                      savepassword,
                                                      aSavePassword);
        }
    },

	getHostname: function _getHostname(aName)
	{
		var minLength = 7;
		if (aName.indexOf('https://') > -1) {
			minLength = 8;
		}

		while ((minLength < aName.length) && (aName.substr(minLength,1) != "/")) {
			minLength++;
		}

		if (minLength < aName.length) {
			return aName.substr(0, minLength);
		}

		return aName;
	},

    /**
     * Helper to insert/update an entry to the password manager.
     *
     * @param aUserName     The username
     * @param aPassword     The corresponding password
     * @param aHostName     The corresponding hostname
     * @param aRealm        The password realm (unused on branch)
     */
    passwordManagerSave: function calPasswordManagerSave(aUsername, aPassword, aHostName, aRealm) {

	try {
		exchWebService.commonFunctions.ASSERT(aUsername, "Empty username", true);
		exchWebService.commonFunctions.ASSERT(aPassword, "Empty password", true);
	}
	catch(exc) {
		this.logInfo(exc);
		return;
	}

	var tmpHostname = aHostName; //this.getHostname(aHostName);

        try {
            let loginManager = Cc["@mozilla.org/login-manager;1"]
                                         .getService(Ci.nsILoginManager);
            let logins = loginManager.findLogins({}, tmpHostname, null, aRealm);

            let newLoginInfo = Cc["@mozilla.org/login-manager/loginInfo;1"]
                                         .createInstance(Ci.nsILoginInfo);
            newLoginInfo.init(tmpHostname, null, aRealm, aUsername, aPassword, "", "");
            if (logins.length > 0) {
			var modified = false;
			for each (let loginInfo in logins) {
				if (loginInfo.username == aUsername) {
					this.logInfo("Login credentials updated:username="+aUsername+", aHostname="+aHostName+", aRealm="+aRealm);
					loginManager.modifyLogin(loginInfo, newLoginInfo);
					modified = true;
	                    		break;
				}
			}
			if (!modified) {
				this.logInfo("Login credentials saved:username="+aUsername+", aHostname="+aHostName+", aRealm="+aRealm);
				loginManager.addLogin(newLoginInfo);
			}
            } else {
		this.logInfo("Login credentials saved:username="+aUsername+", aHostname="+aHostName+", aRealm="+aRealm);
                loginManager.addLogin(newLoginInfo);
            }
        } catch (exc) {
		this.logInfo(exc);
		return;
        }
    },

    /**
     * Helper to retrieve an entry from the password manager.
     *
     * @param in  aUsername     The username to search
     * @param out aPassword     The corresponding password
     * @param aHostName         The corresponding hostname
     * @param aRealm            The password realm (unused on branch)
     * @return                  Does an entry exist in the password manager
     */
    passwordManagerGet: function calPasswordManagerGet(aUsername, aPassword, aHostName, aRealm) {

	try {
	        exchWebService.commonFunctions.ASSERT(aUsername, "Empty username", true);
        } catch (exc) {
		this.logInfo(exc);
		return false;
        }

	this.logInfo("passwordManagerGet: username="+aUsername+", aHostname="+aHostName+", aRealm="+aRealm);
	var tmpHostname = aHostName; //this.getHostname(aHostName);

        if (typeof aPassword != "object") {
            throw new Components.Exception("", Cr.NS_ERROR_XPC_NEED_OUT_OBJECT);
        }

        try {
            let loginManager = Cc["@mozilla.org/login-manager;1"]
                                         .getService(Ci.nsILoginManager);

            let logins = loginManager.findLogins({}, tmpHostname, null, aRealm);
            for each (let loginInfo in logins) {
                if (loginInfo.username == aUsername) {
			this.logInfo("passwordManagerGet found password for: username="+aUsername+", aHostname="+aHostName+", aRealm="+aRealm);
                    aPassword.value = loginInfo.password;
                    return true;
                }
            }
        } catch (exc) {
		this.logInfo(exc);
        }
        return false;
    },

    /**
     * Helper to remove an entry from the password manager
     *
     * @param aUsername     The username to remove.
     * @param aHostName     The corresponding hostname
     * @param aRealm        The password realm (unused on branch)
     * @return              Could the user be removed?
     */
    passwordManagerRemove: function calPasswordManagerRemove(aUsername, aHostName, aRealm) {
 	try {
	        exchWebService.commonFunctions.ASSERT(aUsername, "Empty username", true);
        } catch (exc) {
		this.logInfo(exc);
		return false;
        }

	this.logInfo("passwordManagerRemove: username="+aUsername+", aHostname="+aHostName+", aRealm="+aRealm);
 	var tmpHostname = aHostName; //this.getHostname(aHostName);

       try {
            let loginManager = Cc["@mozilla.org/login-manager;1"]
                                         .getService(Ci.nsILoginManager);
            let logins = loginManager.findLogins({}, tmpHostname, null, aRealm);
            for each (let loginInfo in logins) {
                if (loginInfo.username == aUsername) {
                    loginManager.removeLogin(loginInfo);
                    return true;
                }
            }
        } catch (exc) {
		this.logInfo(exc);
        }
        return false;
    }
	// End funcions from calAuthUtils.jsm
}
