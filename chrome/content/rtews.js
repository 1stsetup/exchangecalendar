Components.utils.import("resource:///modules/iteratorUtils.jsm");

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
        var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
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
    var messages = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
    var msg = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
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

    var messages = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
    var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"].getService(Components.interfaces.nsIMsgTagService);
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
    var tagService = Components.classes["@mozilla.org/messenger/tagservice;1"].getService(Components.interfaces.nsIMsgTagService);
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
