Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource:///modules/iteratorUtils.jsm");
Components.utils.import("resource:///modules/mailServices.js");

if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * Configuration wizard
 *
 */
rtews.configWizard = {
    autoDiscUrls : ['https://', 'https://autodiscover.', 'https://mail.', 'https://webmail.'],
    tempAutoDiscUrls : [],
    autoDisTimeout : null,
    accounts : null,
    selectedAccount : null,
    mailIdentBranch : Services.prefs.getBranch("mail.identity."),
    prefBranch : null,
    identities : null,
    verified : false,
    tempEwsUrl : null,
    pattern : /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
    prompts : Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService),
    stringBundle : null,

    load : function() {
        this.prefBranch = Services.prefs.getBranch("extensions.rtews.");
        this.selectedAccount = null;
        this.stringBundle = document.getElementById("string-bundle");

        try {
            var userPref = this.prefBranch.getCharPref("users");
            this.identities = JSON.parse(userPref);
        } catch(e) {
            this.identities = [];
        }

        this.accounts = this.getAccounts();

        if (this.accounts.length == 0) {
            prompts.alert(null, "", this.stringBundle.getString("rtews.noAccount"));
            return;
        }

        var menus = document.getElementById("user-accounts");
        for (var x in this.accounts) {
            var account = this.accounts[x];
            var mItem = document.createElement("menuitem");
            mItem.setAttribute("label", account.name + " <" + account.email + ">");
            mItem.setAttribute("value", account.email);
            menus.appendChild(mItem);
        }

    },
    checkAccountConfigured : function(userAccount) {
        for (var x in this.identities) {
            var identity = this.identities[x];
            if (userAccount.email == identity.email) {
                this.selectedAccount = identity;
                return true;
            }
        }

        return false;
    },
    getAccounts : function() {
        var data = [];

        for each (var account in fixIterator(MailServices.accounts.accounts, Components.interfaces.nsIMsgAccount)) {
            var info = {
                server : null,
                serverURI : null,
                email : null,
                username : null
            };

            var server = account.incomingServer;
            if (server) {
                info.server = server.prettyName;
                info.serverURI = server.serverURI;
                info.username = server.username;
            }

            for each (var id in fixIterator(account.identities, Components.interfaces.nsIMsgIdentity)) {
                if (id.email) {
                    info.email = id.email;
                    info.name = id.fullName;
                    break;
                }
            }
            if (info.email != null) {
                data.push(info);
            }
        }
        return data;
    },
    selectAccount : function(elm) {
        var value = elm.value;
        var that = this;
        var accDetailsElm = document.getElementById("acc-details");
        var accConfigElm = document.getElementById("acc-configured-msg");
        var usrNameElm = document.getElementById("text-username");
        var domainElm = document.getElementById("text-domain");

        function checkAccountDetailsProvided() {
            if (usrNameElm.value.trim().length) {
                document.documentElement.canAdvance = true;
            } else {
                document.documentElement.canAdvance = false;
            }
        }

        //No account selected
        if (value == -1) {
            this.selectedAccount = null;
            document.documentElement.canAdvance = false;

            accConfigElm.setAttribute("hidden", true);
            accDetailsElm.setAttribute("hidden", true);

            return;
        } else {
            //Find account
            for (var x in this.accounts) {
                var account = this.accounts[x];
                if (value == account.email) {
                    this.setSelectedAccount(account);
                    break;
                }
            }

            //Check if already configured
            if (this.checkAccountConfigured(this.selectedAccount)) {
                var enabled = this.selectedAccount.enabled;
                var btnD = document.getElementById("btn-acc-disable");
                var btnE = document.getElementById("btn-acc-enable");

                accConfigElm.setAttribute("hidden", false);
                accDetailsElm.setAttribute("hidden", true);

                if (enabled) {
                    btnD.setAttribute("disabled", false);
                    btnE.setAttribute("disabled", true);
                } else {
                    btnD.setAttribute("disabled", true);
                    btnE.setAttribute("disabled", false);
                }
            } else {
                var nameDomain = this.getUserNameDomain(this.selectedAccount.username);

                accConfigElm.setAttribute("hidden", true);
                accDetailsElm.setAttribute("hidden", false);

                usrNameElm.value = nameDomain.username != null ? nameDomain.username : "";
                domainElm.value = nameDomain.domain != null ? nameDomain.domain : "";

                usrNameElm.onkeyup = function() {
                    that.selectedAccount.username = usrNameElm.value;
                    checkAccountDetailsProvided();
                };

                domainElm.onkeyup = function() {
                    that.selectedAccount.domain = domainElm.value;
                };

                this.selectedAccount.username = usrNameElm.value;
                this.selectedAccount.domain = domainElm.value;
                this.selectedAccount.host = this.selectedAccount.serverURI.split("@")[1];

                checkAccountDetailsProvided();
            }
        }

    },
    setSelectedAccount : function(account) {
        this.selectedAccount = {};

        for (var x in account) {
            this.selectedAccount[x] = account[x];
        }
    },
    getUserNameDomain : function(username) {
        var uname = username.replace(/\//g, "\\");
        var parts = uname.split("\\");

        var rv = {
            domain : null,
            username : null
        };

        if (parts.length >= 2) {
            rv.domain = parts[0];
            rv.username = parts[1];
        } else {
            rv.domain = null;
            rv.username = parts[0];
        }

        return rv;

    },
    doUrlSelectionMode : function() {
        var rg = document.getElementById("ews-url-selection");
        var btnAuto = document.getElementById("btn-autodiscover");
        var txtManual = document.getElementById("text-manual");
        var btnVerify = document.getElementById("btn-test");
        var val = rg.selectedIndex;

        if (val == 0) {
            btnAuto.disabled = false;
            txtManual.disabled = true;
            btnVerify.disabled = true;
        } else if (val == 1) {
            btnAuto.disabled = true;
            txtManual.disabled = false;
            btnVerify.disabled = false;
        }
    },
    onAutoDiscover : function() {
        this.tempAutoDiscUrls = this.autoDiscUrls.concat([]);
        this.doAutoDiscover();
    },
    doAutoDiscover : function() {
        var rg = document.getElementById("ews-url-selection");
        var targetElm = document.getElementById("btn-autodiscover");
        var stringBundle = document.getElementById("string-bundle");

        if (this.tempAutoDiscUrls.length == 0) {
            this.displayAni(false);

            this.prompts.alert(null, "", this.stringBundle.getString("rtews.autoDiscResponse"));

            targetElm.disabled = false;
            rg.disabled = false;

            return;
        }

        var url = this.tempAutoDiscUrls[0] + this.selectedAccount.email.split("@")[1] + '/autodiscover/autodiscover.xml';
        var field = document.getElementById("txt-autodiscover");
        var btnVerify = document.getElementById("btn-test");

        var that = this;

        field.value = url;
        targetElm.disabled = true;
        rg.disabled = true;

        var requestParams = {
            email : this.selectedAccount.email,
            ns : 'http://schemas.microsoft.com/exchange/autodiscover/outlook/requestschema/2006',
            schema : 'http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a'
        };

        var cred = {
            username : this.selectedAccount.username,
            domain : this.selectedAccount.domain,
            email : this.selectedAccount.email,
            server : this.selectedAccount.server
        };

        var ro = new rtews.EwsRequest(url, cred, "AutoDiscover", requestParams, function(response) {
            var actionElm = response.getElementsByTagName("Action")[0];

            if (actionElm && actionElm.childNodes[0].nodeValue == "settings") {
                var ewsUrlElm = response.getElementsByTagName("EwsUrl")[0];

                if (ewsUrlElm) {
                    field.value = that.stringBundle.getString('rtews.found') + ": " + ewsUrlElm.childNodes[0].nodeValue;
                    btnVerify.disabled = false;

                    that.tempEwsUrl = ewsUrlElm.childNodes[0].nodeValue;

                    that.selectedAccount.enabled = true;
                    that.identities.push(that.selectedAccount);

                    that.displayAni(false);
                    clearInterval(rtews.configWizard.autoDisTimeout);
                }
            }
        });

        ro.send();
        this.displayAni(true);

        rtews.configWizard.autoDisTimeout = setInterval(function() {
            if (ro.status != null && ro.status == "error") {
                rtews.configWizard.tempAutoDiscUrls.shift();
                clearInterval(rtews.configWizard.autoDisTimeout);
                rtews.configWizard.doAutoDiscover();
            };
        }, 5000);
    },
    verify : function() {
        var that = this;
        var rg = document.getElementById("ews-url-selection");
        var stringBundle = document.getElementById("string-bundle");
        var url = null;

        if (rg.selectedIndex == 0) {
            url = that.tempEwsUrl;
        } else if (rg.selectedIndex == 1) {
            url = document.getElementById("text-manual").value;
            if (url.trim().length == 0 || url.match(this.pattern) == null) {
                this.prompts.alert(null, this.stringBundle.getString("rtews.title") + ": " + this.stringBundle.getString("rtews.validurl"), this.stringBundle.getString("rtews.enterValidUrl"));
                return;
            }
        }

        var cred = {
            username : this.selectedAccount.username,
            domain : this.selectedAccount.domain,
            email : this.selectedAccount.email,
            server : this.selectedAccount.server
        };

        new rtews.EwsRequest(url, cred, "FindFolder", {
            email : this.selectedAccount.email
        }, function(response) {
            that.displayAni(false);

            that.selectedAccount.ewsUrl = url;

            document.documentElement.canAdvance = true;

            var verified = document.getElementById("verified");
            var ewsurl = document.getElementById("ews-url");
            var doVerify = document.getElementById("do-verify");

            ewsurl.value = url;
            doVerify.style.display = "none";
            verified.style.display = "block";

            document.documentElement.pageIndex = 2;

        }, function() {
            that.displayAni(false);
            that.prompts.alert(null, that.stringBundle.getString("rtews.title") + ": " + that.stringBundle.getString("rtews.validurl"), that.stringBundle.getString("rtews.ewsurlnotverified"));
        }).send();

        this.displayAni(false);

    },
    modifySelected : function(method) {
        for (var x in this.identities) {
            var account = this.identities[x];
            if (this.selectedAccount.email == account.email) {
                this.identities.splice(x, 1);

                if (method == "disable") {
                    this.selectedAccount.enabled = false;
                    this.identities.push(this.selectedAccount);
                } else if (method == "enable") {
                    this.selectedAccount.enabled = true;
                    this.identities.push(this.selectedAccount);
                }
                break;
            }
        }
        this.saveIdentities();
    },
    onTextInput : function() {
        var txtManual = document.getElementById("text-manual");
    },
    disableSelected : function(event) {
        this.modifySelected("disable");

        var btnD = document.getElementById("btn-acc-disable");
        var btnE = document.getElementById("btn-acc-enable");

        btnD.setAttribute("disabled", true);
        btnE.setAttribute("disabled", false);
    },
    enableSelected : function(event) {
        this.modifySelected("enable");
        var btnD = document.getElementById("btn-acc-disable");
        var btnE = document.getElementById("btn-acc-enable");

        btnD.setAttribute("disabled", false);
        btnE.setAttribute("disabled", true);
    },
    removeSelected : function() {
        this.modifySelected();
        var msg = document.getElementById("acc-configured-msg");
        var accList = document.getElementById("user-account-list");

        msg.setAttribute("hidden", true);
        accList.selectedIndex = 0;
    },
    saveIdentities : function() {
        this.prefBranch.setCharPref("users", JSON.stringify(this.identities));
        Services.prefs.savePrefFile(null);
        rtews.Utils.log("Saved identities", JSON.stringify(this.identities));
    },
    onShowPageOne : function() {
        document.documentElement.canAdvance = false;
    },
    onShowPageTwo : function() {
        document.documentElement.canAdvance = false;
        document.documentElement.canRewind = false;
    },
    onShowPageThree : function() {
        document.documentElement.canRewind = false;
    },
    onFinish : function() {
        try {
            this.saveIdentities();
            return true;
        } catch(e) {
            rtews.Utils.log("rtews.configWizard onFinish", e);
        }
    },
    displayAni : function(bool) {
        var indicator = document.getElementById("indicator");
        if (bool) {
            indicator.style.visibility = "visible";
        } else {
            indicator.style.visibility = "hidden";
        }
    }
};

window.addEventListener("load", function() {
    rtews.configWizard.load();
}); 