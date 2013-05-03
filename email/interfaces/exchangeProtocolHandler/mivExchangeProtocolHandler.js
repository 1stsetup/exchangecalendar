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

function mivExchangeProtocolHandler() {

	//this.logInfo("mivExchangeProtocolHandler: init");

}

var mivExchangeProtocolHandlerGUID = "62eab4a0-d5b1-4ce8-9910-2ed3661d0ff9";

mivExchangeProtocolHandler.prototype = {

	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeProtocolHandler,
				Ci.nsIProtocolHandler,
				Ci.nsIClassInfo,
				Ci.nsISupports]),

	_className : "mivExchangeProtocolHandler",

	classDescription : "Exchange EWS Protocol handler",

	classID : components.ID("{"+mivExchangeProtocolHandlerGUID+"}"),
	contractID : "@mozilla.org/messenger/protocol;1?type=exchangeWebServiceMail",
	flags : Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// nsISupports getHelperForLanguage(in PRUint32 language);
	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},

	getInterfaces : function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeProtocolHandler,
				Ci.nsIProtocolHandler,
				Ci.nsIClassInfo,
				Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

    /**
     * The scheme of this protocol (e.g., "file").
     */
//    readonly attribute ACString scheme;
	get scheme()
	{
dump("exchangeProtocolhandler: get scheme\n");
		return "exchWebServiceMail";
	},

    /** 
     * The default port is the port that this protocol normally uses.
     * If a port does not make sense for the protocol (e.g., "about:")
     * then -1 will be returned.
     */
//    readonly attribute long defaultPort;
	get defaultPort()
	{
dump("exchangeProtocolhandler: get defaultPort\n");
		return 443;
	},

    /**
     * Returns the protocol specific flags (see flag definitions below).  
     */
//    readonly attribute unsigned long protocolFlags;
	get protocolFlags()
	{
dump("exchangeProtocolhandler: get protocolFlags\n");
		return this.URI_LOADABLE_BY_ANYONE;
	},

    /**
     * Makes a URI object that is suitable for loading by this protocol,
     * where the URI string is given as an UTF-8 string.  The caller may
     * provide the charset from which the URI string originated, so that
     * the URI string can be translated back to that charset (if necessary)
     * before communicating with, for example, the origin server of the URI
     * string.  (Many servers do not support UTF-8 IRIs at the present time,
     * so we must be careful about tracking the native charset of the origin
     * server.)
     *
     * @param aSpec          - the URI string in UTF-8 encoding. depending
     *                         on the protocol implementation, unicode character
     *                         sequences may or may not be %xx escaped.
     * @param aOriginCharset - the charset of the document from which this URI
     *                         string originated.  this corresponds to the
     *                         charset that should be used when communicating
     *                         this URI to an origin server, for example.  if
     *                         null, then UTF-8 encoding is assumed (i.e.,
     *                         no charset transformation from aSpec).
     * @param aBaseURI       - if null, aSpec must specify an absolute URI.
     *                         otherwise, aSpec may be resolved relative
     *                         to aBaseURI, depending on the protocol. 
     *                         If the protocol has no concept of relative 
     *                         URI aBaseURI will simply be ignored.
     */
//    nsIURI newURI(in AUTF8String aSpec,
//                  in string aOriginCharset,
//                  in nsIURI aBaseURI);
	newURI: function _newURI(aSpec, aOriginCharset, aBaseURI)
	{
dump("exchangeProtocolhandler: newURI\n");

	},

    /**
     * Constructs a new channel from the given URI for this protocol handler. 
     */
//    nsIChannel newChannel(in nsIURI aURI);
	newChannel: function _newChannel(aURI)
	{
dump("exchangeProtocolhandler: newChannel\n");

	},

    /**
     * Allows a protocol to override blacklisted ports.
     *
     * This method will be called when there is an attempt to connect to a port 
     * that is blacklisted.  For example, for most protocols, port 25 (Simple Mail
     * Transfer) is banned.  When a URI containing this "known-to-do-bad-things" 
     * port number is encountered, this function will be called to ask if the 
     * protocol handler wants to override the ban.  
     */
//    boolean allowPort(in long port, in string scheme);
	allowPort: function _allowPort(aSpec, aOriginCharset, aBaseURI)
	{
dump("exchangeProtocolhandler: allowPort\n");
		return true;
	},

};

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeProtocolHandler) {
			NSGetFactory.mivExchangeProtocolHandler = XPCOMUtils.generateNSGetFactory([mivExchangeProtocolHandler]);

	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeProtocolHandler(cid);
} 

