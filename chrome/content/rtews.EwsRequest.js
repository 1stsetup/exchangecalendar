Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * @Constructor
 * Soap request object
 *
 */
rtews.EwsRequest = function(url, cred, method, parameters, callback, errorCallback) {
    this.request = null;
    this.url = url;
    this.cred = cred;
    this.namespace = "http://schemas.microsoft.com/exchange/services/2006/messages";
    this.method = method;
    this.parameters = parameters;
    this.callback = callback;
    this.errorCallback = errorCallback;
    this.status = null;
    this.loginTimeout = 15000;
    this.tmeoutTimer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
};

rtews.EwsRequest.prototype = {
    send : function() {
        try {
            var body = null, soapaction;

            soapaction = this.namespace + "/" + this.method;

            this.request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
            this.request.addEventListener("load", this, false);
            this.request.addEventListener("error", this, false);
            this.request.addEventListener("abort", this, false);
            this.request.overrideMimeType('text/xml');
            this.request.open("POST", this.url, true, this.cred.email);
            this.request.setRequestHeader("Content-Type", "text/xml");
            this.request.setRequestHeader("SOAPAction", soapaction);
            this.request.channel.notificationCallbacks = this;
            this.request.channel instanceof Components.interfaces.nsIHttpChannel;
            this.request.channel.redirectionLimit = 0;

            var srm = new rtews.EwsRequestMessage();
            body = srm[this.method](this.parameters);

            rtews.Utils.log("SOAP request", this.method + ": " + this.url + ": \n" + body);

            this.request.send(body);
        } catch(e) {
            rtews.Utils.log("SoapRequest " + this.method + " send", e);
        }

    },
    handleEvent : function(event) {
        this.cancelTimeout();

        var xml = this.request.responseXML;
        if (this.request.readyState == 4) {
            if (this.request.status == 200 && this.checkSuccess(xml)) {
                this.status = "success";
                this.callback(xml, this);
            } else {
                this.status = "error";

                if (this.errorCallback) {
                    this.errorCallback(this);
                }
                rtews.Utils.log("SOAP request error", this.method + ": " + this.url + "Returned " + this.request.status + " response code.");
            }
            rtews.Utils.log("SOAP response", this.method + ": " + this.url + ": \n" + this.request.responseText);
        }
    },
    checkSuccess : function(response) {
        if (this.method == "AutoDiscover") {
            return response.getElementsByTagName("Autodiscover")[0] != null;
        } else {
            var resCodeElm = response.getElementsByTagName("m:ResponseCode")[0];
            return resCodeElm && resCodeElm.childNodes[0].nodeValue == "NoError";
        }
    },
    getCredentials : function(hostname) {
        var cred = {
            password : null,
            username : null
        };
        try {
            var loginManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
            var logins = loginManager.findLogins({}, hostname, null, hostname);

            // Find user from returned array of nsILoginInfo objects
            for (var i = 0; i < logins.length; i++) {
                var login = logins[i];
                var username = login.username;
                var foundLogin = false;

                if (username == this.cred.username) {
                    foundLogin = true;
                }

                if (foundLogin) {
                    cred = {
                        password : login.password,
                        username : username
                    };

                    break;
                }
            }
        } catch(e) {
            rtews.Utils.log("rtews.EwsRequest getCredentials", e);
        }
        return cred;
    },
    asyncPromptAuth : function(authChannel, authCallback, authContext, aLevel, authInfo) {
        var authChannelHostname = authChannel.URI.scheme + "://" + authChannel.URI.host;

        return this.asyncPromptAuth2(authChannelHostname, authCallback, authContext, authInfo);
    },
    asyncPromptAuth2 : function _asyncPromptAuth2(authChannelHostname, authCallback, authContext, authInfo) {
        this.cancelTimeout();

        var authDomain = this.cred.domain;
        var authUserName = this.cred.username;

        var domainAndUser = authDomain && authDomain.length ? authDomain + "\\" + authUserName : authUserName;

        try {
            var credentials = this.getCredentials(authChannelHostname);

            // setup authInfo to support domain
            if (authDomain && authDomain.length) {
                authInfo.domain = authDomain;
                authInfo.flags |= Components.interfaces.nsIAuthInformation.NEED_DOMAIN;
            }
            authInfo.username = authUserName;
            authInfo.password = credentials.password;

            var cancelable = this.asyncPromptConsumer(authCallback, authContext);

            //For first attempt pass the credentials if we have them
            if (!(authInfo.flags & Components.interfaces.nsIAuthInformation.PREVIOUS_FAILED) && credentials.password != null) {
                this.startTimeout();

                this.timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);

                this.timer.initWithCallback(function() {
                    authCallback.onAuthAvailable(authContext, authInfo);
                }, 0, Components.interfaces.nsITimer.TYPE_ONE_SHOT);

                return cancelable;
            }

            //Prompt for password
            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
            var username = {
                value : authUserName
            };
            var password = {
                value : ""
            };
            var check = {
                value : true
            };

            var bundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
            var dialogStringBundle = bundleService.createBundle("chrome://global/locale/commonDialogs.properties");
            var passMgrStringBundle = bundleService.createBundle("chrome://passwordmgr/locale/passwordmgr.properties");

            var authenticationRequired = dialogStringBundle.GetStringFromName("PromptPassword2");
            var enterPasswordFor = dialogStringBundle.formatStringFromName("EnterPasswordFor", [domainAndUser, authChannelHostname], 2);
            var rememberPassword = passMgrStringBundle.GetStringFromName("rememberPassword");

            var result = prompts.promptPassword(null, authenticationRequired, enterPasswordFor, password, rememberPassword, check);

            if (result) {
                if (check.value) {
                    this.savePassword(authChannelHostname, username.value, password.value);
                }

                authInfo.username = username.value;
                authInfo.password = password.value;

                this.startTimeout();
                this.timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
                this.timer.initWithCallback(function() {
                    authCallback.onAuthAvailable(authContext, authInfo);
                }, 0, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
            } else {
                authCallback.onAuthCancelled(authContext, true);
            }

            return cancelable;

        } catch (e) {
            rtews.Utils.log("rtews.EwsRequest asyncPromptAuth2", e);
        }
    },
    asyncPromptConsumer : function(authCallback, authContext) {
        var consumer = {
            QueryInterface : XPCOMUtils.generateQI([Components.interfaces.nsICancelable]),
            callback : authCallback,
            context : authContext,
            cancel : function() {
                this.callback.onAuthCancelled(this.context, false);
                this.callback = null;
                this.context = null;
            }
        };

        return consumer;
    },
    savePassword : function(hostname, username, password) {
        try {
            var foundLogins = Services.logins.findLogins({}, hostname, null, hostname);
            var newLoginInfo = Components.classes["@mozilla.org/login-manager/loginInfo;1"].createInstance(Components.interfaces.nsILoginInfo);
            newLoginInfo.init(hostname, null, hostname, username, password, "", "");

            if (foundLogins && foundLogins.length) {
                for each (login in foundLogins) {
                    if (login.matches(newLoginInfo, true)) {
                        Services.logins.removeLogin(login);
                    }
                }
            }
            Services.logins.addLogin(newLoginInfo);
        } catch(e) {
            rtews.Utils.log("rtews.EwsRequest savePassword", e);
        }
    },
    promptAuth : function(authChannel, level, authInfo) {
        throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    },
    getInterface : function(iid) {
        return this.QueryInterface(iid);
    },
    QueryInterface : function(iid) {
        if (!iid.equals(Components.interfaces.nsIBadCertListener2) && !iid.equals(Components.interfaces.nsIAuthPrompt2) && !iid.equals(Components.interfaces.nsIDOMEventListener) && !iid.equals(Components.interfaces.nsIInterfaceRequestor) && !iid.equals(Components.interfaces.nsISupports))
            throw Components.results.NS_ERROR_NO_INTERFACE;
        return this;
    },
    startTimeout : function() {
        var that = this;
        this.tmeoutTimer.initWithCallback(function() {
            that.request.abort();
        }, this.loginTimeout, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    },

    cancelTimeout : function() {
        this.tmeoutTimer.cancel();
    },
};
