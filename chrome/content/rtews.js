/* ***** BEGIN LICENSE BLOCK *****
 * Version: GPL 3.0
 *
 * The contents of this file are subject to the General Public License
 * 3.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.gnu.org/licenses/gpl.html
*/

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils; 

Cu.import("resource:///modules/iteratorUtils.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

 
if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * Utility methods
 *
 */
rtews.Utils = {
    log : function(title, msg) {
        dump("\n[RemoteTaggerEWS]: " + title + " **: " + msg + "\n");
    }
};
  
/*
 * @Constructor
 * Preference listener
 */

rtews.PrefListener = function(branch_name, callback) {
    var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);

    this._branch = prefService.getBranch(branch_name);
    this._branch.QueryInterface(Ci.nsIPrefBranch2);
    this._callback = callback;
};

rtews.PrefListener.prototype.observe = function(subject, topic, data) {
    if (topic == 'nsPref:changed') {
        this._callback(this._branch, data);
    }
};

/*
 * @param {boolean=} trigger if true. triggers the registered function
 *   on registration, that is, when this method is called.
 */
rtews.PrefListener.prototype.register = function(trigger) {
    this._branch.addObserver('', this, false);

    if (trigger) {
        var that = this;
        this._branch.getChildList('', {}).forEach(function(pref_leaf_name) {
            that._callback(that._branch, pref_leaf_name);
        });
    }
};

rtews.PrefListener.prototype.unregister = function() {
    if (this._branch) {
        this._branch.removeObserver('', this);
    }
}; 





if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * Maintains folder table
 *
 */
rtews.FolderTable = {
    folderByEwsId : {},
    folderByImapPath : {},
    foldersByIdentity : {},

    processFolders : function(response, identity) {
        function Folder(id, name, parentId, changeKey) {
            this.id = id;
            this.name = name;
            this.pId = parentId;
            this.changeKey = changeKey;
            this.path = "";
        };

        var folderElms = response.getElementsByTagName("t:Folder");
        var folders = [];
        var obj = {};

        for (var x = 0, len = folderElms.length; x < len; x++) {
            var folderClass = folderElms[x].getElementsByTagName("t:FolderClass")[0].childNodes[0].nodeValue;
            if (folderClass == "IPF.Note") {
                var fId = rtews.getItemIdFromResponse(folderElms[x].getElementsByTagName("t:FolderId")[0]);
                var fName = folderElms[x].getElementsByTagName("t:DisplayName")[0].childNodes[0].nodeValue;
                var fPId = rtews.getItemIdFromResponse(folderElms[x].getElementsByTagName("t:ParentFolderId")[0]);

                var fo = new Folder(fId.id, fName, fPId.id, fId.changeKey);

                obj[fId.id] = fo;
            }
        }

        //Find path of the folder
        var __parents = [];
        //Find parent of the given objects. Loops parent of parent to build the path
        function getParent(o) {
            var parent = obj[o.pId];

            __parents.push(o.name);

            if (parent) {
                getParent(parent);
            }
        }

        this.foldersByIdentity[identity.email] = [];

        for (var p in obj) {
            __parents = [];

            getParent(obj[p]);

            var path = [];
            path.push(identity.serverURI);
            path.push(__parents.reverse().join("/"));

            obj[p].path = path.join("/").toLowerCase();

            folders.push(obj[p]);

            this.folderByEwsId[obj[p].id] = obj[p];
            this.folderByImapPath[obj[p].path] = obj[p];
            this.foldersByIdentity[identity.email].push(obj[p]);
        }
    },

    getFoldersByIdentity : function(identity) {
        return this.foldersByIdentity[identity.email] != undefined ? this.foldersByIdentity[identity.email] : null;
    },

    gerFolderByEwsId : function(id) {
        return this.folderByEwsId[id] != undefined ? this.folderByEwsId[id] : null;
    },
    gerFolderByImapPath : function(path) {
        return this.folderByImapPath[path.toLowerCase()] != undefined ? this.folderByImapPath[path.toLowerCase()] : null;
    },
};




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
    this.tmeoutTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
};

rtews.EwsRequest.prototype = {
    send : function() {
        try {
            var body = null, soapaction;

            soapaction = this.namespace + "/" + this.method;

            this.request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
            this.request.addEventListener("load", this, false);
            this.request.addEventListener("error", this, false);
            this.request.addEventListener("abort", this, false);
            this.request.overrideMimeType('text/xml');
            this.request.open("POST", this.url, true, this.cred.email);
            this.request.setRequestHeader("Content-Type", "text/xml");
            this.request.setRequestHeader("SOAPAction", soapaction);
            this.request.channel.notificationCallbacks = this;
            this.request.channel instanceof Ci.nsIHttpChannel;
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
            var loginManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
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
                authInfo.flags |= Ci.nsIAuthInformation.NEED_DOMAIN;
            }
            authInfo.username = authUserName;
            authInfo.password = credentials.password;

            var cancelable = this.asyncPromptConsumer(authCallback, authContext);

            //For first attempt pass the credentials if we have them
            if (!(authInfo.flags & Ci.nsIAuthInformation.PREVIOUS_FAILED) && credentials.password != null) {
                this.startTimeout();

                this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

                this.timer.initWithCallback(function() {
                    authCallback.onAuthAvailable(authContext, authInfo);
                }, 0, Ci.nsITimer.TYPE_ONE_SHOT);

                return cancelable;
            }

            //Prompt for password
            var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
            var username = {
                value : authUserName
            };
            var password = {
                value : ""
            };
            var check = {
                value : true
            };

            var bundleService = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
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
                this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
                this.timer.initWithCallback(function() {
                    authCallback.onAuthAvailable(authContext, authInfo);
                }, 0, Ci.nsITimer.TYPE_ONE_SHOT);
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
            QueryInterface : XPCOMUtils.generateQI([Ci.nsICancelable]),
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
            var newLoginInfo = Cc["@mozilla.org/login-manager/loginInfo;1"].createInstance(Ci.nsILoginInfo);
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
        if (!iid.equals(Ci.nsIBadCertListener2) && !iid.equals(Ci.nsIAuthPrompt2) && !iid.equals(Ci.nsIDOMEventListener) && !iid.equals(Ci.nsIInterfaceRequestor) && !iid.equals(Ci.nsISupports))
            throw Components.results.NS_ERROR_NO_INTERFACE;
        return this;
    },
    startTimeout : function() {
        var that = this;
        this.tmeoutTimer.initWithCallback(function() {
            that.request.abort();
        }, this.loginTimeout, Ci.nsITimer.TYPE_ONE_SHOT);
    },

    cancelTimeout : function() {
        this.tmeoutTimer.cancel();
    },
};


if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * @Constructor
 * EWS Operations handler
 *
 */
rtews.EwsHandler = function(identity) {
    this.server = identity.server;
    this.url = identity.ewsUrl;
    this.email = identity.email;
    this.folders = identity.folders;
    this.session = null;
    this.pollInterval = null;
    this.cred = {
        username : identity.username,
        domain : identity.domain,
        email : identity.email,
        server : identity.server
    };
};

rtews.EwsHandler.prototype = {
    subscribe : function() {
        var that = this;
        var subParams = {
            email : this.email,
            folders : this.folders
        };

        new rtews.EwsRequest(this.url, this.cred, "Subscribe", subParams, function(response) {
            that.session = that.getSubscriptionDetails(response);
            that.poll();
        }).send();
    },
    unSubscribe : function(callback) {
        var that = this;
        window.clearInterval(this.pollInterval);

        new rtews.EwsRequest(this.url, this.cred, "Unsubscribe", this.session, function() {
            callback();
        }).send();
    },
    poll : function() {
        var that = this;
        this.pollInterval = setInterval(function() {
            if (that.session == null) {
                return;
            }

            //Check for new event on the mail box
            that.getEvent();

        }, rtews.prefBranch.getIntPref("pollinterval"));
    },
    getSubscriptionDetails : function(response) {
        var sub = null;
        var idElm = response.getElementsByTagName("m:SubscriptionId")[0];
        var wmElm = response.getElementsByTagName("m:Watermark")[0];

        if (idElm && wmElm) {
            sub = {
                subscriptionId : idElm.childNodes[0].nodeValue,
                watermark : wmElm.childNodes[0].nodeValue
            };
        }

        return sub;
    },
    getEvent : function() {
        var that = this;

        new rtews.EwsRequest(that.url, that.cred, "GetEvents", that.session, function(response) {
            var watermarklElm, folderIdElms, moreEvents;

            watermarklElm = response.getElementsByTagName("t:Watermark");
            that.session.watermark = watermarklElm[watermarklElm.length - 1].childNodes[0].nodeValue;

            //Check if there are more events to be fetched
            moreEvents = response.getElementsByTagName("t:MoreEvents")[0].childNodes[0].nodeValue;
            if (moreEvents.toLowerCase() == "true") {
                that.getEvent();
            }

            var itemIds = response.getElementsByTagName("t:ItemId");
            var newItemIds = [];
            var oldItemIds = response.getElementsByTagName("t:OldItemId");

            if (itemIds.length == 0) {
                return;
            }

            if (oldItemIds.length > 0) {
                //Filter out old ids. create a new list of ids
                for (var x = 0; x < itemIds.length; x++) {
                    var id = itemIds[x].getAttribute("Id");
                    for (var i = 0; i < oldItemIds.length; i++) {
                        var oId = oldItemIds[i].getAttribute("Id");
                        if (id != oId) {
                            newItemIds.push(itemIds[x]);
                        }
                    }
                }
            } else {
                newItemIds = itemIds;
            }

            if (newItemIds.length == 0) {
                return;
            }

            var itemList = [];

            for (var x = 0; x < newItemIds.length; x++) {
                var item = rtews.getItemIdFromResponse(newItemIds[x]);
                itemList.push(item);
            }

            if (itemList.length > 0) {
                that.getAndUpdateItems(itemList);
            }

        }).send();
    },
    getAndUpdateItems : function(itemList) {
        var that = this;

        this.getItems(itemList, function(response) {
            var returnItems = response.getElementsByTagName("m:Items");
            var updates = [];

            for (var x = 0; x < returnItems.length; x++) {
                var returnItem = returnItems[x];

                var itemId = rtews.getItemIdFromResponse(returnItem.getElementsByTagName("t:ItemId")[0]);
                var parentItemId = rtews.getItemIdFromResponse(returnItem.getElementsByTagName("t:ParentFolderId")[0]);
                var categoriesElm = returnItem.getElementsByTagName("t:Categories")[0];
                var valueElm = returnItem.getElementsByTagName("t:Value")[0];

                if (!valueElm) {
                    continue;
                }

                var messageId = valueElm.childNodes[0].nodeValue.replace('<', '').replace('>', '');

                if (messageId.length == 0) {
                    continue;
                }

                var categories = [];
                var tags = [];
                if (categoriesElm) {
                    var categoryValueElms = categoriesElm.getElementsByTagName("t:String");
                    var errCategory = [];

                    for (var i = 0, len = categoryValueElms.length; i < len; i++) {
                        var category = categoryValueElms[i].childNodes[0].nodeValue;
                        var tKey = rtews.Tags.getKeyForTag(category);

                        if (tKey != null) {
                            tags.push(tKey);
                        } else {
                            var newTagKey = rtews.Tags.addTag(category);

                            if (newTagKey != null) {
                                tags.push(newTagKey);
                            } else {
                                errCategory.push(category);
                            }
                        }
                    }

                    //Prompt categories that were not converted to tags.
                    if (errCategory.length) {
                        var stringBundle = document.getElementById("string-bundle");
                        Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService).alert(null, stringBundle.getString("rtews.title"), stringBundle.getString("rtews.tagAddError") + " " + errCategory.join(", "));
                    }
                }

                var fo = rtews.FolderTable.gerFolderByEwsId(parentItemId.id);
                if (fo != null) {
                    updates.push({
                        msgId : messageId,
                        tags : tags,
                        path : fo.path
                    });
                }
            }

            if (updates.length) {
                setTimeout(function() {
                    var updateMsg = new rtews.UpdateMessage(updates);
                    updateMsg.update();
                }, 500);
            }
        });
    },
    getItems : function(itemList, callback) {
        var that = this;

        var getItemParams = {
            items : itemList
        };

        new rtews.EwsRequest(this.url, this.cred, "GetItem", getItemParams, function(response) {
            callback(response);
        }).send();
    },
    findFolders : function(callback) {
        var ffReqParams = {
            email : this.email
        };

        new rtews.EwsRequest(this.url, this.cred, "FindFolder", ffReqParams, function(response, request) {
            callback(response, request);
        }).send();
    },
    findItem : function(messageId, folder, callback) {
        var folders = (folder == null) ? this.folders : new Array(folder);

        var findItemParams = {
            messageid : messageId,
            folders : folders,
        };

        new rtews.EwsRequest(this.url, this.cred, "FindItem", findItemParams, function(response) {
            var itemId = rtews.getItemIdFromResponse(response.getElementsByTagName("t:ItemId")[0]);

            callback(itemId);

            if (itemId == null) {
                rtews.Utils.log("SOAP Response", "FindItem: Message item not found on server");
            }

        }).send();
    },
    updateItem : function(item, categories, callback) {
        var updateItemParams = {
            itemid : item.id,
            changekey : item.changeKey,
            categories : categories
        };

        new rtews.EwsRequest(this.url, this.cred, "UpdateItem", updateItemParams, function(response) {
            callback();
        }).send();
    }
};

if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * @Constructor
 * EWS SOAP request message
 *
 */
rtews.EwsRequestMessage = function() {
    var sr = "";
    sr += '<?xml version="1.0" encoding="utf-8"?>';
    sr += '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">';
    sr += '<soap:Body>';
    sr += 'MESSAGEBODY';
    sr += '</soap:Body>';
    sr += '</soap:Envelope>';

    this.src = sr;
};

rtews.EwsRequestMessage.prototype = {
    UpdateItem : function(parameters) {
        var sr = "";
        sr += '<UpdateItem MessageDisposition="SaveOnly" ConflictResolution="AlwaysOverwrite" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<ItemChanges>';
        sr += '<t:ItemChange>';
        sr += '<t:ItemId Id="' + parameters.itemid + '" ChangeKey="' + parameters.changekey + '" />';
        sr += '<t:Updates>';
        sr += '<t:SetItemField>';
        sr += '<t:FieldURI FieldURI="item:Categories"/>';
        sr += '<t:Message>';
        sr += '<t:Categories>';
        for (var category in parameters.categories) {
            sr += '<t:String>' + parameters.categories[category] + '</t:String>';
        }
        sr += '</t:Categories>';
        sr += '</t:Message>';
        sr += '</t:SetItemField>';
        sr += '</t:Updates>';
        sr += '</t:ItemChange>';
        sr += '</ItemChanges>';
        sr += '</UpdateItem>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    FindItem : function(parameters) {
        var sr = "";
        sr += '<FindItem Traversal="Shallow" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += ' <ItemShape>';
        sr += '<t:BaseShape>IdOnly</t:BaseShape>';
        sr += '</ItemShape>';
        sr += '<IndexedPageItemView MaxEntriesReturned="10" Offset="0" BasePoint="Beginning" />';
        sr += '<Restriction>';
        sr += '<t:IsEqualTo>';
        sr += '<t:ExtendedFieldURI PropertyTag="0x1035" PropertyType="String"/>';
        sr += '<t:FieldURIOrConstant>';
        sr += '<t:Constant Value="' + parameters.messageid + '" />';
        sr += '</t:FieldURIOrConstant>';
        sr += '</t:IsEqualTo>';
        sr += '</Restriction>';
        sr += '<ParentFolderIds>';
        for (var x = 0, len = parameters.folders.length; x < len; x++) {
            sr += '<t:FolderId Id="' + parameters.folders[x].id + '" />';
        }
        sr += '</ParentFolderIds>';
        sr += '</FindItem>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    GetItem : function(parameters) {
        var sr = "";
        sr += '<GetItem xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<ItemShape>';
        sr += '<t:BaseShape>IdOnly</t:BaseShape>';
        sr += '<t:AdditionalProperties>';
        sr += '<t:FieldURI FieldURI="item:Categories"/>';
        sr += '<t:FieldURI FieldURI="item:ParentFolderId"/>';
        sr += '<t:ExtendedFieldURI PropertyTag="0x1035" PropertyType="String"/>';
        sr += '</t:AdditionalProperties>';
        sr += '</ItemShape>';
        sr += '<ItemIds>';
        for (var x = 0, len = parameters.items.length; x < len; x++) {
            sr += '<t:ItemId Id="' + parameters.items[x].id + '" ChangeKey="' + parameters.items[x].changeKey + '" />';
        }
        sr += '</ItemIds>';
        sr += '</GetItem>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    Subscribe : function(parameters) {
        var sr = "";
        sr += '<Subscribe xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<PullSubscriptionRequest>';
        sr += '<t:FolderIds>';
        for (var x = 0, len = parameters.folders.length; x < len; x++) {
            sr += '<t:FolderId Id="' + parameters.folders[x].id + '" />';
        }
        sr += '</t:FolderIds>';
        sr += '<t:EventTypes>';
        sr += '<t:EventType>NewMailEvent</t:EventType>';
        sr += '<t:EventType>ModifiedEvent</t:EventType>';
        sr += '<t:EventType>MovedEvent</t:EventType>';
        sr += '<t:EventType>CopiedEvent</t:EventType>';
        sr += '<t:EventType>CreatedEvent</t:EventType>';
        sr += '</t:EventTypes>';
        sr += '<t:Timeout>1440</t:Timeout>';
        sr += '</PullSubscriptionRequest>';
        sr += '</Subscribe>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    Unsubscribe : function(parameters) {
        var sr = "";
        sr += '<Unsubscribe xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<SubscriptionId>' + parameters.subscriptionId + '</SubscriptionId>';
        sr += '</Unsubscribe>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    GetEvents : function(parameters) {
        var sr = "";
        sr += '<GetEvents xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<SubscriptionId>' + parameters.subscriptionId + '</SubscriptionId>';
        sr += '<Watermark>' + parameters.watermark + '</Watermark>';
        sr += '</GetEvents>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    FindFolder : function(parameters) {
        var sr = "";
        sr += '<FindFolder Traversal="Deep" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<FolderShape>';
        sr += '<t:BaseShape>AllProperties</t:BaseShape>';
        sr += '</FolderShape>';
        sr += '<ParentFolderIds>';
        sr += '<t:DistinguishedFolderId Id="msgfolderroot">';
        sr += '<t:Mailbox>';
        sr += '<t:EmailAddress>' + parameters.email + '</t:EmailAddress>';
        sr += '</t:Mailbox>';
        sr += '</t:DistinguishedFolderId>';
        sr += '</ParentFolderIds>';
        sr += '</FindFolder>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    AutoDiscover : function(parameters) {
        var sr = "";
        sr += '<?xml version="1.0" encoding="utf-8"?>';
        sr += '<Autodiscover xmlns="' + parameters.ns + '">';
        sr += '<Request>';
        sr += '<EMailAddress>' + encodeURI(parameters.email) + '</EMailAddress>';
        sr += '<AcceptableResponseSchema>' + parameters.schema + '</AcceptableResponseSchema>';
        sr += '</Request>';
        sr += '</Autodiscover>';

        return sr;
    }
};

  
if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * @Constructor
 * Message updater
 *
 */
rtews.UpdateMessage = function(updates) {
    this.updates = updates;
    this.pendingUpdates = [];
    this.pendingAttempts = 0;
};

rtews.UpdateMessage.prototype = {
    update : function() {
        var that = this;
        var messageId = this.updates[0].msgId;
        var tags = this.updates[0].tags;
        var folderPath = this.updates[0].path;

        that.searchGloda(messageId, folderPath, function(msgHdrs) {
            rtews.Utils.log("UpdateMessage.update", folderPath + " : " + messageId);
            
            if (msgHdrs.length == 0) {
                rtews.Utils.log("GetItem callback:", "Message not found in database with id " + messageId);
                that.pendingUpdates.push(that.updates[0]);
            } else {
                for (var x = 0; x < msgHdrs.length; x++) {
                    rtews.removeAllMessageTagsPostEwsUpdate(msgHdrs[x]);
                    if (tags.length > 0) {
                        that.addKeywordsToMessage(msgHdrs[x], tags);
                    }
                }
            }

            that.updates.shift();

            if (that.updates.length > 0) {
                that.update();
            } else {
                if (that.pendingUpdates.length > 0 && that.pendingAttempts < 60) {
                    setTimeout(function() {
                        that.updates = that.pendingUpdates;
                        that.pendingUpdates = [];
                        that.update();
                        that.pendingAttempts++;
                    }, 2000);
                }
            }
        });

    },

    /*
     * Upated message with categories received
     */
    addKeywordsToMessage : function(msgHdr, keywords) {
        try {
            var messages = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
            messages.appendElement(msgHdr, false);

            var toggler = "addKeywordsToMessages";
            for (var t = 0; t < keywords.length; t++) {
                msgHdr.folder[toggler](messages, keywords[t]);
            }
        } catch(e) {
            rtews.Utils.log("rtews.addKeywordsToMessage", e);
        }

        OnTagsChange();
    },

    /*
     * Search the GLODA for message
     *
     */
    searchGloda : function(messageId, folderPath, callback) {
        try {
            var query = Gloda.newQuery(Gloda.NOUN_MESSAGE);
            query.headerMessageID(messageId);

            var queryListener = {
                /* called when new items are returned by the database query or freshly indexed */
                onItemsAdded : function queryListener_onItemsAdded(aItems, aCollection) {
                },
                /* called when items that are already in our collection get re-indexed */
                onItemsModified : function queryListener_onItemsModified(aItems, aCollection) {
                },
                /* called when items that are in our collection are purged from the system */
                onItemsRemoved : function queryListener_onItemsRemoved(aItems, aCollection) {
                },
                /* called when our database query completes */
                onQueryCompleted : function queryListener_onQueryCompleted(aCollection) {
                    var msgHdrs = [];
                    try {
                        for (var j = 0; j < aCollection.items.length; j++) {
                            if (aCollection.items[j].folder.uri.toLowerCase().endsWith(folderPath.toLowerCase())) {
                                if (aCollection.items[j].folderMessage != null) {
                                    msgHdrs.push(aCollection.items[j].folderMessage);
                                }
                            }
                        }
                        callback(msgHdrs);
                    } catch (e) {
                        rtews.Utils.log("Gloda serch complete", e);
                        callback(msgHdrs);
                    }
                }
            };
            var collection = query.getCollection(queryListener);
        } catch(e) {
            rtews.Utils.log("Gloda serch", e);
        }
    }
};

if ( typeof (rtews) == "undefined")
    var rtews = {};

rtews.Tags = {
    tagService : Cc["@mozilla.org/messenger/tagservice;1"].getService(Ci.nsIMsgTagService),

    getKeyForTag : function(name) {
        return this.tagService.getKeyForTag(name) ? this.tagService.getKeyForTag(name) : null;
    },

    getTagForKey : function(key) {
        try {
            return this.tagService.getTagForKey(key);
        } catch (e) {

        }
        return null;
    },

    getTagsForKeys : function(keys) {
        var tags = [];

        for (var x = 0; x < keys.length; x++) {
            var tag = this.getTagForKey(keys[x]);
            if (tag != null) {
                tags.push(tag);
            }
        }

        return tags;
    },

    addTag : function(name) {
        this.tagService.addTag(name, "", "");

        return this.getKeyForTag(name);
    }
};
 
if ( typeof (rtews) == "undefined")
    var rtews = {};

rtews.identities = null;
rtews.folderMap = {};

/*
 * Handler to launch the configuration window
 */
rtews.launchConfigWizard = function() {
    window.openDialog("chrome://exchangecalendar/content/rtewsConfigWizard.xul", "rtewsConfigWizard", "chrome,modal,titlebar,centerscreen", {});
};

/*
 * Fetch configured identity based on the email
 */
rtews.getIdentity = function(server) {
    var ids = rtews.identities;
    for (var x = 0, len = ids.length; x < len; x++) {
        if (ids[x] && ids[x].enabled == true && ids[x].server == server) {
            return ids[x];
        }
    }
    return null;
};

/*
 * Gets the ItemId element from response of the FindItem SOAP request
 *
 */
rtews.getItemIdFromResponse = function(itemIdElm) {
    return {
        id : itemIdElm.getAttribute('Id'),
        changeKey : itemIdElm.getAttribute('ChangeKey')
    };
};

/*
 * Initialize each identity. Creates new EWS Handler for each identity
 *
 */
rtews.processIdentity = function(identity) {
    var ewsHandler = new rtews.EwsHandler(identity);
    identity.ewsObj = ewsHandler;

    ewsHandler.findFolders(function(response, request) {
        rtews.FolderTable.processFolders(response, identity);
        var folders = rtews.FolderTable.getFoldersByIdentity(identity);

        rtews.Utils.log("rtews.processIdentity folders:", JSON.stringify(folders));

        if (folders.length > 0) {
            ewsHandler.folders = folders;
            ewsHandler.subscribe();
        }
    });
};

/*
 *  Initialize the plugin.
 */
rtews.load = function() {
    var that = this;
    this.prefBranch = Services.prefs.getBranch("extensions.rtews.");

    var prefListener = new rtews.PrefListener("extensions.rtews.", function(branch, name) {
        switch (name) {
            case "users":
                //If there is change in identities, disable current jobs and remove the subscriptions
                if (that.identities != null) {
                    for (var x = 0, len = that.identities.length; x < len; x++) {
                        if (that.identities[x].ewsObj) {
                            that.identities[x].ewsObj.unSubscribe(function() {
                                delete that.identities[x].ewsObj;
                                delete that.identities[x];
                            });
                        }
                    }
                    that.identities = null;
                }

                //Fetch the updated identities preferences
                try {
                    var userPref = that.prefBranch.getCharPref("users");
                    that.identities = JSON.parse(userPref);
                } catch(e) {
                    that.identities = [];
                }

                //Initialize the identities
                for (var x = 0, len = that.identities.length; x < len; x++) {
                    if (that.identities[x].ewsUrl && that.identities[x].enabled) {
                        that.processIdentity(that.identities[x]);
                    }
                }

                break;
        }

    });
    prefListener.register(true);
};

rtews.addSyncMenu = function(menuPopup) {
    var newMenuItem = document.createElement("menuitem");
    newMenuItem.setAttribute('oncommand', 'rtews.syncTags(event.target);');
    newMenuItem.setAttribute("label", "EWS Sync Tags");
    menuPopup.appendChild(newMenuItem);

    var newMenuSeperator = document.createElement("menuseparator");
    newMenuSeperator.setAttribute("id", "mailContext-sep-afterTagSync");
    menuPopup.appendChild(newMenuSeperator);
};

/*
 * Event handler for Sync Tags menu item.
 *
 */
rtews.syncTags = function() {
    var selectedMessages = gFolderDisplay.selectedMessages;
    var identity = rtews.getIdentity(gFolderDisplay.displayedFolder.server.prettyName);

    if (!identity) {
        var prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
        prompts.alert(null, "", document.getElementById("string-bundle").getString("rtews.accNotConfigured"));

        return;
    }

    var ewsObj = identity.ewsObj;

    if (!ewsObj) {
        return;
    }

    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];
        var messageId = "&lt;" + msgHdr.messageId + "&gt;";
        var folder = rtews.FolderTable.gerFolderByImapPath(msgHdr.folder.URI);

        rtews.Utils.log("rtews.syncTags folder:", JSON.stringify(folder) + " " + messageId);

        if (!folder) {
            continue;
        }

        ewsObj.findItem(messageId, folder, function(item) {
            if (item != null) {
                var itemList = [];
                itemList.push(item);

                ewsObj.getAndUpdateItems(itemList);
            }
        });
    }
};

/*
 * Updates the tags (categories) on exchange server before updating locally.
 *
 */
rtews.toggleTags = function(msgHdr, identity, toggleType, categories, key, addKey) {
    var ewsObj = identity.ewsObj;
    var folder = rtews.FolderTable.gerFolderByImapPath(msgHdr.folder.URI);
    var messageId = "&lt;" + msgHdr.messageId + "&gt;";

    rtews.Utils.log("rtews.toggleTags folder:", JSON.stringify(folder) + " " + messageId);

    if (!folder) {
        return;
    }

    ewsObj.findItem(messageId, folder, function(item) {
        if (item != null) {
            ewsObj.updateItem(item, categories, function() {
                if (toggleType == "removeAll") {
                    rtews.removeAllMessageTagsPostEwsUpdate();
                } else {
                    rtews.toggleMessageTagPostEwsUpdate(key, addKey);
                }
            });
        }
    });
};

/*
 * Custom method to handle tag menu click event
 *
 */
rtews.toggleMessageTagPostEwsUpdate = function(key, addKey) {
    var messages = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
    var msg = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
    var selectedMessages = gFolderDisplay.selectedMessages;
    var toggler = addKey ? "addKeywordsToMessages" : "removeKeywordsFromMessages";
    var prevHdrFolder = null;
    // this crudely handles cross-folder virtual folders with selected messages
    // that spans folders, by coalescing consecutive msgs in the selection
    // that happen to be in the same folder. nsMsgSearchDBView does this
    // better, but nsIMsgDBView doesn't handle commands with arguments,
    // and (un)tag takes a key argument.
    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];

        if (msgHdr.label) {
            // Since we touch all these messages anyway, migrate the label now.
            // If we don't, the thread tree won't always show the correct tag state,
            // because resetting a label doesn't update the tree anymore...
            msg.clear();
            msg.appendElement(msgHdr, false);
            msgHdr.folder.addKeywordsToMessages(msg, "$label" + msgHdr.label);
            msgHdr.label = 0;
            // remove legacy label
        }
        if (prevHdrFolder != msgHdr.folder) {
            if (prevHdrFolder)
                prevHdrFolder[toggler](messages, key);
            messages.clear();
            prevHdrFolder = msgHdr.folder;
        }
        messages.appendElement(msgHdr, false);
    }
    if (prevHdrFolder)
        prevHdrFolder[toggler](messages, key);
    OnTagsChange();
};

/*
 * Custom method for remove all tags menuitem
 *
 */
rtews.removeAllMessageTagsPostEwsUpdate = function(msgHdr) {
    //Check if a message header is passed
    //Else use the selected messages
    if (msgHdr == undefined) {
        var selectedMessages = gFolderDisplay.selectedMessages;
    } else {
        var selectedMessages = [msgHdr];
    }

    if (!selectedMessages.length)
        return;

    var messages = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
    var tagService = Cc["@mozilla.org/messenger/tagservice;1"].getService(Ci.nsIMsgTagService);
    var tagArray = tagService.getAllTags({});

    var allKeys = "";
    for (var j = 0; j < tagArray.length; ++j) {
        if (j)
            allKeys += " ";
        allKeys += tagArray[j].key;
    }

    var prevHdrFolder = null;
    // this crudely handles cross-folder virtual folders with selected messages
    // that spans folders, by coalescing consecutive messages in the selection
    // that happen to be in the same folder. nsMsgSearchDBView does this better,
    // but nsIMsgDBView doesn't handle commands with arguments, and untag takes a
    // key argument. Furthermore, we only delete legacy labels and known tags,
    // keeping other keywords like (non)junk intact.

    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];
        msgHdr.label = 0;
        // remove legacy label
        if (prevHdrFolder != msgHdr.folder) {
            if (prevHdrFolder)
                prevHdrFolder.removeKeywordsFromMessages(messages, allKeys);
            messages.clear();
            prevHdrFolder = msgHdr.folder;
        }
        messages.appendElement(msgHdr, false);
    }
    if (prevHdrFolder)
        prevHdrFolder.removeKeywordsFromMessages(messages, allKeys);
    OnTagsChange();
};

/*
 * Overrides default method for applying tag.
 *
 */
function ToggleMessageTag(key, addKey) {
    var identity = rtews.getIdentity(gFolderDisplay.displayedFolder.server.prettyName);

    //if we don't have the id configured run the default toggle functionality
    if (identity == null) {
        rtews.toggleMessageTagPostEwsUpdate(key, addKey);
        return;
    }

    var selectedMessages = gFolderDisplay.selectedMessages;

    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];
        var keywords = Array.prototype.slice.call(msgHdr.getStringProperty('keywords').trim().split(" "));

        if (addKey) {
            keywords.push(key);
        } else {
            keywords.splice(keywords.indexOf(key), 1);
        }

        var categories = rtews.Tags.getTagsForKeys(keywords);

        rtews.toggleTags(msgHdr, identity, "single", categories, key, addKey);
    }
}

/*
 * Overrides default remove all method.
 *
 */
function RemoveAllMessageTags() {
    var identity = rtews.getIdentity(gFolderDisplay.displayedFolder.server.prettyName);

    //if we don't have the id configured run the default toggle functionality
    if (identity == null) {
        rtews.removeAllMessageTagsPostEwsUpdate();
        return;
    }

    var selectedMessages = gFolderDisplay.selectedMessages;

    for (var i = 0; i < selectedMessages.length; ++i) {
        var msgHdr = selectedMessages[i];

        rtews.toggleTags(msgHdr, identity, "removeAll", []);
    }
}

/*
 * Overrides default method for initialize tag menu
 *
 */
function InitMessageTags(menuPopup) {
    var tagService = Cc["@mozilla.org/messenger/tagservice;1"].getService(Ci.nsIMsgTagService);
    var tagArray = tagService.getAllTags({});
    var tagCount = tagArray.length;

    // Remove any existing non-static entries... (clear tags list before rebuilding it)
    // "5" is the number of menu items (including separators) on the top of the menu
    // that should not be cleared.
    for (var i = menuPopup.childNodes.length; i > 5; --i)
        menuPopup.removeChild(menuPopup.lastChild);

    // create label and accesskey for the static remove item
    var tagRemoveLabel = document.getElementById("bundle_messenger").getString("mailnews.tags.remove");
    SetMessageTagLabel(menuPopup.lastChild.previousSibling, 0, tagRemoveLabel);

    rtews.addSyncMenu(menuPopup);

    // now rebuild the list
    var msgHdr = gFolderDisplay.selectedMessage;
    var curKeys = msgHdr.getStringProperty("keywords");
    if (msgHdr.label)
        curKeys += " $label" + msgHdr.label;

    for (var i = 0; i < tagCount; ++i) {
        var taginfo = tagArray[i];
        // TODO we want to either remove or "check" the tags that already exist
        var newMenuItem = document.createElement("menuitem");
        SetMessageTagLabel(newMenuItem, i + 1, taginfo.tag);
        newMenuItem.setAttribute("value", taginfo.key);
        newMenuItem.setAttribute("type", "checkbox");
        var removeKey = (" " + curKeys + " ").indexOf(" " + taginfo.key + " ") > -1;
        newMenuItem.setAttribute('checked', removeKey);
        newMenuItem.setAttribute('oncommand', 'ToggleMessageTagMenu(event.target);');
        var color = taginfo.color;
        if (color)
            newMenuItem.setAttribute("class", "lc-" + color.substr(1));
        menuPopup.appendChild(newMenuItem);
    }
}

window.addEventListener("load", rtews.load());
