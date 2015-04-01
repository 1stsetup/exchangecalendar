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
                        Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService).alert(null, stringBundle.getString("rtews.title"), stringBundle.getString("rtews.tagAddError") + " " + errCategory.join(", "));
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
