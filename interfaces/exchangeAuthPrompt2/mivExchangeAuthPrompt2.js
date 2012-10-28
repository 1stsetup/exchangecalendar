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

function mivExchangeAuthPrompt2() {
	dump("\nmivExchangeAuthPrompt2.init\n");

	this.queue = {};
	this.prompt = {};
	this.passwordCache = {};
	this.userCancel = {};

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
}

var mivExchangeAuthPrompt2GUID = "b3ab11c0-20f7-11e2-81c1-0800200c9a66";

mivExchangeAuthPrompt2.prototype = {

	// methods from nsISupport

	/* void QueryInterface(
	  in nsIIDRef uuid,
	  [iid_is(uuid),retval] out nsQIResult result
	);	 */
	QueryInterface: XPCOMUtils.generateQI([Ci.mivExchangeAuthPrompt2,
			Ci.nsIAuthPrompt2,
			Ci.nsISupports]),

	// Attributes from nsIClassInfo

	classDescription: "Exchange Add-on AuthPrompt2 interface",
	classID: components.ID("{"+mivExchangeAuthPrompt2GUID+"}"),
	contractID: "@1st-setup.nl/exchange/authprompt2;1",
	flags: Ci.nsIClassInfo.SINGLETON || Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// External methods

	getPassword: function _getPassword(aChannel, username, aURL, realm)
	{
		var error = false;

		this.logInfo("asyncPromptAuthNotifyCallback: Going to check if password is in URI.");

		var password = aChannel.URI.password;
		if (password) {
			password = this.globalFunctions.trim(decodeURI(aChannel.URI.password));
		}
		this.logInfo("asyncPromptAuthNotifyCallback: password(1)="+password);
		if ((!password) || (password == "")) {
			this.logInfo("asyncPromptAuthNotifyCallback: password is not specified. Going to ask passwordManager if it has been saved before.");
			var savedPassword = this.passwordManagerGet(username, aURL, realm);

			if (savedPassword.result) {
				password = savedPassword.password;
			}
		}
		this.logInfo("asyncPromptAuthNotifyCallback: password(2)="+password);

		if ((!password) || (password == "")) {
			this.logInfo("asyncPromptAuthNotifyCallback: password is not specified and not found in passwordManager. Going to search cache.");
			if (this.passwordCache[username+"|"+aURL+"|"+realm)) {
				password = this.passwordCache[username+"|"+aURL+"|"+realm);
			}
		}
		this.logInfo("asyncPromptAuthNotifyCallback: password(3)="+password);

		if ((!password) || (password == "")) {
			this.logInfo("asyncPromptAuthNotifyCallback: password is not specified and not found in passwordManager and not found in cache. Going ask user to provide one.");
			var answer = this.getCredentials(username, aURL);

			if (answer.result) {
				password = answer.password;
				if (answer.save) {
					this.passwordManagerSave(username, password, aURL, realm);
				}
				this.passwordCache[username+"|"+aURL+"|"+realm) = password;
			}
			else {
				// user canceled the entering of a password. 
				// What do we do next.. Clear queue and !!??
				this.userCancel[aURL].canceled = true;
				this.logInfo("asyncPromptAuthNotifyCallback: User canceled entering a password.");
				aCallback.onAuthCancelled(aContext, true);
				error = true;
			}
		}

		if (error) {
			return null;
		}

		return password;
	},
 
	asyncPromptAuthNotifyCallback: function _asyncPromptAuthCallBack(aURL, aUUID)
	{
		if (!this.queue[aURL]) {
			this.logInfo("asyncPromptAuthNotifyCallback: This is strange, We do not have this URL '"+aURL+"' in queue");
			return;
		}

		if (this.prompt[aURL].showing) {
			this.logInfo("asyncPromptAuthNotifyCallback: Allready showing a prompt or trying to get the password for URL '"+aURL+"'. Not going to try again until the active one has finished.");
			return;
		}

		this.prompt[aURL].showing = true;

		if (!this.queue[aURL].length == 0) {
			this.logInfo("asyncPromptAuthNotifyCallback: This is strange, We do no request in queue for URL '"+aURL+"'.");
			return;
		}

		while (this.queue[aURL].length > 0) {

			// We grab the first one from the queue.
			var request = this.queue[aURL].shift();
			this.logInfo("asyncPromptAuthNotifyCallback: Removed request from queue["+aURL+"]. There are now '"+this.queue[aURL].length+"' requests in queue left.");
			var aChannel = request.channel;
			var aCallback = request.callback;
			var aContext = request.context;
			var level = request.level;
			var authInfo = request.authInfo;

			var username;
			var password;

			var error = false;

			if (this.userCancel[URL].canceled) {
				error = true;
				this.logInfo("asyncPromptAuthNotifyCallback: User canceled entering a password in the past so we going to cancel this request also.");
				aCallback.onAuthCancelled(aContext, true);
			}
			else {
				username = aChannel.URI.username;
				if (username)
					username = this.globalFunctions.trim(decodeURI(aChannel.URI.username));
				}

				if (username == "") {
					// We do not have a username. We need to prompt for one.
					// This should always be filled in. So for now we error.
					this.logInfo("asyncPromptAuthNotifyCallback: username is empty. This is not allowed.");
					aCallback.onAuthCancelled(aContext, false);
					error = true;
				}
				this.logInfo("asyncPromptAuthNotifyCallback: username="+username);

				if (!error) {
					// Trying to get realm from response header. This is used when basic authentication is available.
					var realm = "exchange.server";
					try {
						var acceptedAuthentications = aChannel.getResponseHeader("WWW-Authenticate");
						acceptedAuthentications = acceptedAuthentications.split("\n");
						for each (var index in acceptedAuthentications) {
							this.logInfo("asyncPromptAuthNotifyCallback: WWW-Authenticate:"+index);
							if (index.indexOf("realm=") > -1) {
								realm = index.substr(index.indexOf("realm=")+6);
								this.logInfo("asyncPromptAuthNotifyCallback: Found a realm going to use it. realm="+realm);
							}
						}
					}
					catch(err) {
							this.logInfo("asyncPromptAuthNotifyCallback: NO WWW-Authenticate in response header!?");
					}

					password = this.getPassword(aChannel, username, aURL, realm);
					if ((!password) || (password == null)) {
						error = true;
					}
				}
			}

			if (!error) {
				// Return credentials we have obtained
				if (!(authInfo.flags & Ci.nsIAuthInformation.ONLY_PASSWORD)) {
					if (authInfo.flags & Ci.nsIAuthInformation.NEED_DOMAIN) {
						if (username.indexOf("\\") > -1) {
							authInfo.domain = username.substr(0,username.indexOf("\\"));
							authInfo.username = username.substr(username.indexOf("\\")+1);
						}
						else {
							authInfo.domain = "";
							authInfo.username = username;
						}
					}
					else {
						authInfo.username = username;
					}
				}
				authInfo.password = password;
				//this.logInfo(" USING password for connection:["+password+"]");
				try {
					aCallback.onAuthAvailable(aContext, authInfo);
				}
				catch(err) {
					this.logInfo("asyncPromptAuthNotifyCallback: Error on calling onAuthAvailable of provided callback. ERROR:"+err);
					aCallback.onAuthCancelled(aContext, false);
				}
			}
		}

		this.prompt[aURL].showing = false;

	},

	asyncPromptAuthCancelCallback: function _asyncPromptAuthCallBack(aReason, aURL, aUUID)
	{
		// Try to find the canceled request and remove from queue.
		var oldQueue = this.queue[aURL];
		this.queue[aURL] = new Array();
		for (var index in oldQueue) {
			if (oldQueue[index].uuid == aUUID) {
				oldQueue[index].callback.onAuthCancelled(oldQueue[index].context, false);
			}
			else {
				this.queue[aURL].push(oldQueue[index]);
			}
		}
	},

	//nsICancelable asyncPromptAuth(in nsIChannel aChannel, in nsIAuthPromptCallback aCallback, in nsISupports aContext, in PRUint32 level, in nsIAuthInformation authInfo);
	asyncPromptAuth: function _asyncPromptAuth(aChannel, aCallback, aContext, level, authInfo)
	{
		if (!aCallback) {
			this.logInfo("asyncPromptAuth: callback is undefined. This is not allowed!!!");
			return null;
		}

		var channel = aChannel.QueryInterface(Ci.nsIHttpChannel);
		this.logInfo("asyncPromptAuth: level="+level);

		this.logInfo("asyncPromptAuth: channel.responseStatus="+channel.responseStatus);


		try {
			var offeredAuthentications = channel.getRequestHeader("Authorization");
			this.logInfo("asyncPromptAuth: Authorization:"+offeredAuthentications);
		}
		catch(err) {
				this.logInfo("asyncPromptAuth: NO Authorization in request header!?");
		}

		var URL = decodeURI(aChannel.URI.scheme+aChannel.URI.hostPort+aChannel.URI.path);
		this.logInfo("asyncPromptAuth: aChannel.URL="+this.URL+", username="+aChannel.URI.username+", password="+aChannel.URI.password);

		var uuid = this.globalFunctions.getUUID();

		if (!this.prompt[URL]) this.prompt[URL].showing = false;
		if (!this.userCancel[URL]) this.userCancel[URL].canceled = false;

		if (!this.queue[URL]) this.queue[URL] = new Array();
		this.queue[URL].push( {
			uuid: uuid,
			channel: aChannel,
			callback: aCallback,
			context: aContext,
			level: level,
			authInfo: authInfo });
		this.logInfo("asyncPromptAuth: Added request to queue["+URL+"]. There are now '"+this.queue[URL].length+"' request in queue.");

		var self = this;
		var notifyCallback = {
			notify: function asyncPromptAuth_notify() {
				self.asyncPromptAuthNotifyCallback(URL, uuid);
			}
		}
		this.timer.initWithCallback(notifyCallback, 5, Ci.nsITimer.TYPE_ONE_SHOT);

		var cancelCallback = {
			cancel: function asyncPromptAuth_cancel(aReason) {
				self.asyncPromptAuthCancelCallback(aReason, URL, uuid);
			}
		}
		return cancelCallback;
	},

	//boolean promptAuth(in nsIChannel aChannel, in PRUint32 level, in nsIAuthInformation authInfo);
	promptAuth: function _promptAuth(aChannel, level, authInfo)
	{

		var error = false;

		var URL = decodeURI(aChannel.URI.scheme+aChannel.URI.hostPort+aChannel.URI.path);
		var password;
		var username;

		if (this.userCancel[URL].canceled) {
			this.logInfo("promptAuth: User canceled entering a password in the past so we going to cancel this request also.");
			return false;
		}
		else {
			username = aChannel.URI.username;
			if (username) {
				username = this.globalFunctions.trim(decodeURI(aChannel.URI.username));
			}

			if (username == "") {
				// We do not have a username. We need to prompt for one.
				// This should always be filled in. So for now we error.
				this.logInfo("promptAuth: username is empty. This is not allowed.");
				return false;
			}
			this.logInfo("promptAuth: username="+username);

			// Trying to get realm from response header. This is used when basic authentication is available.
			var realm = "exchange.server";
			try {
				var acceptedAuthentications = aChannel.getResponseHeader("WWW-Authenticate");
				acceptedAuthentications = acceptedAuthentications.split("\n");
				for each (var index in acceptedAuthentications) {
					this.logInfo("promptAuth: WWW-Authenticate:"+index);
					if (index.indexOf("realm=") > -1) {
						realm = index.substr(index.indexOf("realm=")+6);
						this.logInfo("promptAuth: Found a realm going to use it. realm="+realm);
					}
				}
			}
			catch(err) {
					this.logInfo("promptAuth: NO WWW-Authenticate in response header!?");
			}

			password = this.getPassword(aChannel, username, URL, realm);
			if ((!password) || (password == null)) {
				this.logInfo("promptAuth: No password.");
				return false;
			}
		}

		if (!(authInfo.flags & Ci.nsIAuthInformation.ONLY_PASSWORD)) {
			if (authInfo.flags & Ci.nsIAuthInformation.NEED_DOMAIN) {
				if (this.username.indexOf("\\") > -1) {
					authInfo.domain = username.substr(0,username.indexOf("\\"));
					authInfo.username = username.substr(username.indexOf("\\")+1);
				}
				else {
					authInfo.domain = "";
					authInfo.username = username;
				}
			}
			else {
				authInfo.username = username;
			}
		}
		authInfo.password = password;
		return true;
	},

	/**
	* Helper to retrieve an entry from the password manager.
	*
	* @param in  aUsername     The username to search
	* @param aHostName         The corresponding hostname
	* @param aRealm            The password realm (unused on branch)
	* @return                  An object of form { result: boolean, [optional] password: <found password> }
	*				result == false when password not found.
	*/
	passwordManagerGet: function _passwordManagerGet(aUsername, aURL, aRealm) 
	{
		if ((!aUsername) || (this.globalFunctions.trim(aUsername) == "")) {
			this.logInfo("passwordManagerGet: username is undefined or empty.")
			return { result: false };
		}

		this.logInfo("passwordManagerGet: username="+aUsername+", aURL="+aURL+", aRealm="+aRealm);

		try {
			var loginManager = Cc["@mozilla.org/login-manager;1"]
						.getService(Ci.nsILoginManager);

			var logins = loginManager.findLogins({}, aURL, null, aRealm);
			for each (var loginInfo in logins) {
				if (loginInfo.username == aUsername) {
					this.logInfo("passwordManagerGet found password for: username="+aUsername+", aURL="+aURL+", aRealm="+aRealm);
					return { result: true, password: loginInfo.password};
				}
			}
		} catch (exc) {
			this.logInfo(exc);
		}
		return { result: false };
	},

	/**
	* Helper to insert/update an entry to the password manager.
	*
	* @param aUserName     The username
	* @param aPassword     The corresponding password
	* @param aURL     The corresponding hostname
	* @param aRealm        The password realm (unused on branch)
	*/

	passwordManagerSave: function _passwordManagerSave(aUsername, aPassword, aURL, aRealm) 
	{

		if ((!aUsername) || (!aURL) || (!aRealm)) {
			this.logInfo("passwordManagerSave: username or hostname or realm is empty. Not allowed!!!");
			return;
		}

		try {
			var loginManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
			var logins = loginManager.findLogins({}, aURL, null, aRealm);

			var newLoginInfo = Cc["@mozilla.org/login-manager/loginInfo;1"].createInstance(Ci.nsILoginInfo);
			newLoginInfo.init(aURL, null, aRealm, aUsername, aPassword, "", "");

			if (logins.length > 0) {
				var modified = false;
				for each (let loginInfo in logins) {
					if (loginInfo.username == aUsername) {
						this.logInfo("Login credentials updated:username="+aUsername+", aURL="+aURL+", aRealm="+aRealm);
						loginManager.modifyLogin(loginInfo, newLoginInfo);
						modified = true;
				    		break;
					}
				}
				if (!modified) {
					this.logInfo("Login credentials saved:username="+aUsername+", aURL="+aURL+", aRealm="+aRealm);
					loginManager.addLogin(newLoginInfo);
				}
			} else {
				this.logInfo("Login credentials saved:username="+aUsername+", aURL="+aURL+", aRealm="+aRealm);
				loginManager.addLogin(newLoginInfo);
			}
		} catch (exc) {
			this.logInfo(exc);
		}
	},

	/**
	* Helper to retrieve a password from the usr via a prompt.
	*
	* @param in  aUsername     The username to search
	* @param in aURL           The corresponding hostname
	* @return                  An object of form { result: boolean, [optional] password: <found password>, save: boolean }
	*				result == false when password not found.
	*/
	getCredentials: function _getCredentials(aUsername, aURL)
	{

		if ((!aUsername) || (!aURL)) {
			this.logInfo("getCredentials: Username or URL is empty. Not allowed!");
			return { result: false };
		}

		var watcher = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);

		var prompter = watcher.getNewPrompter(null);

	// Only show the save password box if we are supposed to.
		var savepassword = exchWebService.commonFunctions.getString("passwordmgr", "rememberPassword", null, "passwordmgr");

		var aTitle = "Microsoft Exchange EWS: Password request.";

		var aText = exchWebService.commonFunctions.getString("commonDialogs", "EnterPasswordFor", [aUsername, aURL], "global");

		var aPassword = { value: null };
		var aSavePassword = { value: null };

		var result = prompter.promptPassword( null,
						aTitle,
						aText,
						aPassword,
						savepassword,
						aSavePassword);

		return { result: result, password: aPassword.value, save: aSavePassword.value };
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
		if (!NSGetFactory.mivExchangeAuthPrompt2) {
			// Load main script from lightning that we need.
			NSGetFactory.mivExchangeAuthPrompt2 = XPCOMUtils.generateNSGetFactory([mivExchangeAuthPrompt2]);
			
		}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeAuthPrompt2(cid);
} 

