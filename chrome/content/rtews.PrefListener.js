if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * @Constructor
 * Preference listener
 */

rtews.PrefListener = function(branch_name, callback) {
    var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);

    this._branch = prefService.getBranch(branch_name);
    this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
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