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

function mivExchangeLoadBalancer() {
	this.serverQueue = {};
	this.runningJobs = {};
	this.calendarQueue = {};

	this.timer = null;

	this.observerService = Cc["@mozilla.org/observer-service;1"]  
	                          .getService(Ci.nsIObserverService);  

}

var PREF_MAINPART = 'extensions.1st-setup.exchangecalendar.loadbalancer.';

var mivExchangeLoadBalancerGUID = "2db8c940-1927-11e2-892e-0800200c9a66";

mivExchangeLoadBalancer.prototype = {

	// methods from nsISupport

	_refCount: 0,

	//nsrefcnt AddRef();
	AddRef: function _AddRef()
	{
		this._refCount++;
		return this._refCount;
	},

	/* void QueryInterface(
	  in nsIIDRef uuid,
	  [iid_is(uuid),retval] out nsQIResult result
	);	 */
	QueryInterface: XPCOMUtils.generateQI([Ci.mivExchangeLoadBalancer,
			Ci.nsIClassInfo,
			Ci.nsISupports]),

	//nsrefcnt Release();
	Release: function _Release()
	{
		this._refCount--;
		return this._refCount;
	},

	// methods from nsIClassInfo

	// nsISupports getHelperForLanguage(in PRUint32 language);
	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},

	// void getInterfaces(out PRUint32 count, [array, size_is(count), retval] out nsIIDPtr array);
	getInterfaces: function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeLoadBalancer,
			Ci.nsIClassInfo,
			Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

	// Attributes from nsIClassInfo

	classDescription: "Load balancer for requests to Exchange server.",
	classID: components.ID("{"+mivUpdateGUID+"}"),
	contractID: "@1st-setup.nl/exchange/loadbalancer;1",
	flags: Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// External methods

	// Internal methods.
	get maxJobs()
	{
		return this.safeGetIntPref(null, PREF_MAINPART+"maxjobs", 3, true);
	},

	addToQueue: function _addToQueue(aJob)
	{

		if (!this.serverQueue[aJob.arguments.serverUrl]) {
			this.serverQueue[aJob.arguments.serverUrl] = {};
			this.serverQueue[aJob.arguments.serverUrl]['pos'] = null;
		}
		this.serverQueue[aJob.arguments.serverUrl][aJob.calendar.id].push(aJob);

	        var self = this;
		var timerCallback = {
			notify: function _notify() {
				self.processQueue();
			}
		};

		if (!this.timer) {
			this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
			this.timer.initWithCallback(timerCallback, 5, this.timer.TYPE_REPEATING_SLACK);
		}
	},

	processQueue: function _processQueue()
	{
		var jobCount = 0;

		for (var server in this.serverQueue) {
			if (this.runningJobs[server].length < this.maxJobs) {
				var job = this.serverQueue[server].shift();

				this.observerService.notifyObservers(aJob.calendar, "onExchangeProgressChange", "-1"); 
 
				job.arguments["cbOk"] = job.cbOk;
				job.arguments["cbError"] = job.cbError;
				
				this.runningJobs[server].push({ job: job,
								exchangeRequest: new job.ecRequest(job.arguments, this.onRequestOk, this.onRequestError, job.listener)
								});
				
			}
		}
	},

	onRequestOk: function _onRequestOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)
	{
		arg1.argument.cbOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
	},

	onRequestError: function _onRequestError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)
	{
		arg1.argument.cbError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
	},

	clearQueueForCalendar: function _clearQueueForCalendar(aCalendar)
	{
	},


	getBranch: function _getBranche(aName)
	{
		var lBranche = "";
		var lName = "";
		var lastIndexOf = aName.lastIndexOf(".");
		if (lastIndexOf > -1) {
			lBranche = aName.substr(0,lastIndexOf+1);
			lName = aName.substr(lastIndexOf+1); 
		}
		else {
			lName = aName;
		}

		return { branch: Cc["@mozilla.org/preferences-service;1"]
		                    .getService(Ci.nsIPrefService)
				    .getBranch(lBranche),
			   name: lName };
	},

	safeGetIntPref: function _safeGetIntPref(aBranch, aName, aDefaultValue, aCreateWhenNotAvailable)
	{
		if (!aBranch) {
			var realBranche = this.getBranch(aName);
			if (!realBranche.branch) {
				return aDefaultValue;
			}
			var aBranch = realBranche.branch;
			var aName = realBranche.name;
		}
	
		if (!aCreateWhenNotAvailable) { var aCreateWhenNotAvailable = false; }

		try {
			return aBranch.getIntPref(aName);
		}
		catch(err) {
			if (aCreateWhenNotAvailable) { 
				try {
					aBranch.setIntPref(aName, aDefaultValue); 
				}
				catch(er) {
					aBranch.deleteBranch(aName);
					aBranch.setIntPref(aName, aDefaultValue); 
				}
			}
			return aDefaultValue;
		}
	},


}

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeLoadBalancer) {
			// Load main script from lightning that we need.
			NSGetFactory.mivExchangeLoadBalancer = XPCOMUtils.generateNSGetFactory([mivExchangeLoadBalancer]);
			
	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeLoadBalancer(cid);
} 

