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

function mivExchangeMsgProtocolInfo() {

	//this.logInfo("mivExchangeMsgProtocolInfo: init");

}

var mivExchangeMsgProtocolInfoGUID = "ea4d2e73-b0bc-4b70-9f7d-95dbcb648930";

mivExchangeMsgProtocolInfo.prototype = {

	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeMsgProtocolInfo,
				Ci.nsIMsgProtocolInfo,
				Ci.nsIClassInfo,
				Ci.nsISupports]),

	_className : "mivExchangeMsgProtocolInfo",

	classDescription : "Exchange EWS Msg Protocol Info",

	classID : components.ID("{"+mivExchangeMsgProtocolInfoGUID+"}"),
	contractID : "@mozilla.org/messenger/protocol/info;1?type=exchangeWebServiceMail",
	flags : Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// nsISupports getHelperForLanguage(in PRUint32 language);
	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},

	getInterfaces : function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeMsgProtocolInfo,
				Ci.nsIMsgProtocolInfo,
				Ci.nsIClassInfo,
				Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

    /**
     * the default path to store local data for this type of
     * server. Each server is usually in a subdirectory below this
     */
//    attribute nsIFile defaultLocalPath;
	get defaultLocalPath()
	{
dump("msgProtocolInfo: get defaultLocalPath\n");
		var file = Cc["@mozilla.org/file/directory_service;1"].
				getService(Ci.nsIProperties).
				get("ProfD", Ci.nsIFile);
		if (!file) return Cr.NS_ERROR_FAILURE;

		if (!file.exists()) {
			file.create(file.DIRECTORY_TYPE, 0775);
		}
	},

	set defaultLocalPath(aValue)
	{
dump("msgProtocolInfo: set defaultLocalPath\n");
		return Cr.NS_ERROR_NOT_IMPLEMENTED;
	},
    /**
     * the IID of the protocol-specific interface for this server
     * usually used from JS to dynamically get server-specific attributes
     */
//    readonly attribute nsIIDPtr serverIID;
	get serverIID()
	{
dump("msgProtocolInfo: get serverIID\n");
		return Cr.NS_ERROR_NOT_IMPLEMENTED;
	},

    /**
     * does this server type require a username?
     * for instance, news does not but IMAP/POP do
     */
//    readonly attribute boolean requiresUsername;
	get requiresUsername()
	{
dump("msgProtocolInfo: get requiresUsername\n");
		return true;
	},

    /**
     * if the pretty name of the server should
     * just be the e-mail address. Otherwise it usually
     * ends up being something like "news on hostname"
     */
//    readonly attribute boolean preflightPrettyNameWithEmailAddress;
	get preflightPrettyNameWithEmailAddress()
	{
dump("msgProtocolInfo: get preflightPrettyNameWithEmailAddress\n");
		return Cr.NS_ERROR_NOT_IMPLEMENTED;
	},

    /**
     * can this type of server be removed from the account manager?
     * for instance, local mail is not removable
     */
//    readonly attribute boolean canDelete;
	get canDelete()
	{
dump("msgProtocolInfo: get canDelete\n");
		return true;
	},

    /**
     * can this type of server log in at startup?
     */
//    readonly attribute boolean canLoginAtStartUp;
	get canLoginAtStartUp()
	{
dump("msgProtocolInfo: get canLoginAtStartUp\n");
		return true;
	},

    /**
     * can you duplicate this server?
     * for instance, local mail is unique and should not be duplicated.
     */
//    readonly attribute boolean canDuplicate;
	get canDuplicate()
	{
dump("msgProtocolInfo: get canDuplicate\n");
		return true;
	},

    /* the default port
       This is similar to nsIProtocolHanderl.defaultPort,
       but for architectural reasons, there is a mail-specific interface to this.
       When the input param isSecure is set to true, for all supported protocols, 
       the secure port value is returned. If isSecure is set to false the default
       port value is returned  */
//    long getDefaultServerPort(in boolean isSecure);
	getDefaultServerPort: function _getDefaultServerPort(isSecure)
	{
dump("msgProtocolInfo: getDefaultServerPort\n");
		return 443;
	},

    /**
     * An attribute that tell us whether on not we can 
     * get messages for the given server type 
   * this is poorly named right now.
   * it's really is there an inbox for this type?
   * XXX todo, rename this.
     */
//    readonly attribute boolean canGetMessages;
	get canGetMessages()
	{
dump("msgProtocolInfo: get canGetMessages\n");
		return true;
	},

    /** 
   * do messages arrive for this server
   * if they do, we can use our junk controls on it.
   */
//    readonly attribute boolean canGetIncomingMessages;
	get canGetIncomingMessages()
	{
dump("msgProtocolInfo: get canGetIncomingMessages\n");
		return true;
	},

    /**
     * do biff by default?
     */
//    readonly attribute boolean defaultDoBiff;
	get defaultDoBiff()
	{
dump("msgProtocolInfo: get defaultDoBiff\n");
		return true;
	},

    /**
     * do we need to show compose message link in the AccountCentral page ? 
     */
//    readonly attribute boolean showComposeMsgLink;
	get showComposeMsgLink()
	{
dump("msgProtocolInfo: get showComposeMsgLink\n");
		return true;
	},

};

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeMsgProtocolInfo) {
			NSGetFactory.mivExchangeMsgProtocolInfo = XPCOMUtils.generateNSGetFactory([mivExchangeMsgProtocolInfo]);

	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeMsgProtocolInfo(cid);
} 

