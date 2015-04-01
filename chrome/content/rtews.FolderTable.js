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
