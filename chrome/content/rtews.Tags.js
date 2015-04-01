if ( typeof (rtews) == "undefined")
    var rtews = {};

rtews.Tags = {
    tagService : Components.classes["@mozilla.org/messenger/tagservice;1"].getService(Components.interfaces.nsIMsgTagService),

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
