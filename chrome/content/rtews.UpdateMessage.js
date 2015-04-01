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
            var messages = Components.classes["@mozilla.org/array;1"].createInstance(Components.interfaces.nsIMutableArray);
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