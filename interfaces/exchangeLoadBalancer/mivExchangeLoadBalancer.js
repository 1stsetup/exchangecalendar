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
	this.jobsRunning = 0;


	this.timer = null;

	this.observerService = Cc["@mozilla.org/observer-service;1"]  
	                          .getService(Ci.nsIObserverService); 

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

}

var PREF_MAINPART = 'extensions.1st-setup.exchangecalendar.loadbalancer.';

var mivExchangeLoadBalancerGUID = "2db8c940-1927-11e2-892e-0800200c9a55";

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
			Ci.nsISupports]),

	//nsrefcnt Release();
	Release: function _Release()
	{
		this._refCount--;
		return this._refCount;
	},

	// Attributes from nsIClassInfo

	classDescription: "Load balancer for requests to Exchange server.",
	classID: components.ID("{"+mivExchangeLoadBalancerGUID+"}"),
	contractID: "@1st-setup.nl/exchange/loadbalancer;1",
	flags: Ci.nsIClassInfo.SINGLETON || Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// External methods

	// Internal methods.
	get maxJobs()
	{
		return 1;  // Currently going for default one at a time to the same server because the xmlhttprequest cannot handle more simultaniously.
		//return this.globalFunctions.safeGetIntPref(null, PREF_MAINPART+"maxJobs", 3, true);
	},

	get sleepBetweenJobs()
	{
		return 0;  // Currently going for default zero because it works.
		//return this.globalFunctions.safeGetIntPref(null, PREF_MAINPART+"sleepBetweenJobs", 2, true);
	},

	notify: function _notify() {
		this.processQueue();
	},

	addToQueue: function _addToQueue(aJob)
	{

		if (!aJob.arguments) {
			this.logInfo("addToQueue: arguments is not defined!!!????:"+this.globalFunctions.STACK());
			return;
		}

		if (!this.serverQueue[aJob.arguments.serverUrl]) {
			this.serverQueue[aJob.arguments.serverUrl] = { currentCalendar: 0,
									calendarList: new Array(),
									calendarNames: {},
									runningJobs: new Array(),
									jobs: {} };
		}

		if (!this.serverQueue[aJob.arguments.serverUrl].jobs[aJob.calendar.id]) {
			this.serverQueue[aJob.arguments.serverUrl].jobs[aJob.calendar.id] = new Array();
			this.serverQueue[aJob.arguments.serverUrl].calendarNames[aJob.calendar.id] = aJob.calendar.name;
		}

		this.serverQueue[aJob.arguments.serverUrl].jobs[aJob.calendar.id].push(aJob);
		this.logInfo("Adding job to queue for server '"+aJob.arguments.serverUrl+"' for calendar '"+aJob.calendar.id+"'. We now have:"+this.serverQueue[aJob.arguments.serverUrl].jobs[aJob.calendar.id].length+" jobs.",2);

		// Check if the calendar.id is allready in the list.
		var inList = false;
		var counter = 0;
		while ((!inList) && (counter < this.serverQueue[aJob.arguments.serverUrl].calendarList.length)) {
			if (this.serverQueue[aJob.arguments.serverUrl].calendarList[counter] == aJob.calendar.id) {
				inList = true;
			}
			counter++;
		}
		if (!inList) {
			this.serverQueue[aJob.arguments.serverUrl].calendarList.push(aJob.calendar.id);
		}

		this.observerService.notifyObservers(aJob.calendar, "onExchangeProgressChange", null); 

		if (!this.timer) {
			this.logInfo("Start timer");
			this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
			this.timer.initWithCallback(this, this.sleepBetweenJobs, this.timer.TYPE_REPEATING_SLACK);
		}
	},

	get jobList()
	{
		return this.serverQueue;
	},

	processQueue: function _processQueue()
	{
		var jobCount = 0;

		for (var server in this.serverQueue) {

			// Cleanup jobs with have finished
			var oldList = this.serverQueue[server].runningJobs;
			this.serverQueue[server].runningJobs = new Array();
			for (var runningJob in oldList) {
				if (oldList[runningJob].exchangeRequest.isRunning) {
					this.serverQueue[server].runningJobs.push(oldList[runningJob]);
				}
				else {
					// Running job stopped.
					this.jobsRunning--;
					this.logInfo("this.jobsRunning:"+this.jobsRunning);
				}
			}

			// See if we can start another job for this url/server
			//this.logInfo("Runningjobs:"+this.serverQueue[server].runningJobs.length+", maxJobs:"+this.maxJobs);
			if (this.serverQueue[server].runningJobs.length < this.maxJobs) {
				if (this.serverQueue[server].currentCalendar >= this.serverQueue[server].calendarList.length) {
					this.serverQueue[server].currentCalendar = 0;
				}
				var initialCurrentCalendar = this.serverQueue[server].currentCalendar;
				var noJobsLeft = false
				while ((!noJobsLeft) && (this.serverQueue[server].currentCalendar < this.serverQueue[server].calendarList.length) && (this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].length == 0)) {
					this.serverQueue[server].currentCalendar++;

					if (this.serverQueue[server].currentCalendar >= this.serverQueue[server].calendarList.length) {
						this.serverQueue[server].currentCalendar = 0;
					}

					if (this.serverQueue[server].currentCalendar == initialCurrentCalendar) {
						// Stop processing for this server because there are now jobs left.
						noJobsLeft = true;
						
					}

				}
				if ((!noJobsLeft) && (this.serverQueue[server].currentCalendar < this.serverQueue[server].calendarList.length) && (this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].length > 0)) {
					jobCount += this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].length;

					var job = this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].shift();

					this.serverQueue[server].currentCalendar++;
					if (this.serverQueue[server].currentCalendar >= this.serverQueue[server].calendarList.length) {
						this.serverQueue[server].currentCalendar = 0;
					}

					this.observerService.notifyObservers(job.calendar, "onExchangeProgressChange", null); 
	 
					job.arguments["cbOk"] = job.cbOk;
					job.arguments["cbError"] = job.cbError;
					job.arguments["job"] = job;
					job.arguments["calendar"] = job.calendar;
				
					var self = this;

					var newJob = { job: job,
							exchangeRequest: new job.ecRequest(job.arguments, 
							function myOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) { self.onRequestOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);}, 
							function myError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {self.onRequestError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);}
							, job.listener)
									};
					this.serverQueue[server].runningJobs.push(newJob);

					this.logInfo("Starting job to queue for server '"+server+"' for calendar '"+job.calendar.id+"'. We now have:"+this.serverQueue[server].jobs[job.calendar.id].length+" jobs in queue and "+this.serverQueue[server].runningJobs.length+" jobs running.",2);
					this.jobsRunning++;
					this.logInfo("this.jobsRunning:"+this.jobsRunning,1);
				}				
			}
		}

		if (this.jobsRunning == 0) {
			this.logInfo("No more jobs left. Stop Timer.",2);
			this.timer.cancel();
			delete this.timer;
			this.timer = null;
		}

	},

	onRequestOk: function _onRequestOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)
	{

		try{
			this.logInfo("onRequestOk job to queue for server '"+arg1.argument.serverUrl+"' for calendar '"+arg1.argument.job.calendar.id+"'. We now have:"+this.serverQueue[arg1.argument.serverUrl].jobs[arg1.argument.calendar.id].length+" jobs in queue and "+this.serverQueue[arg1.argument.serverUrl].runningJobs.length+" jobs running.");
			arg1.argument.cbOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
		}
		catch(err) { 
			this.globalFunctions.LOG("onRequestOk Error:"+err + " ("+this.globalFunctions.STACK()+")", -1);
		}
	},

	onRequestError: function _onRequestError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)
	{
		try{
			this.logInfo("onRequestError job to queue for server '"+arg1.argument.serverUrl+"' for calendar '"+arg1.argument.job.calendar.id+"'. We now have:"+this.serverQueue[arg1.argument.serverUrl].jobs[arg1.argument.calendar.id].length+" jobs in queue and "+this.serverQueue[arg1.argument.serverUrl].runningJobs.length+" jobs running.");
			arg1.argument.cbError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
		}
		catch(err) { 
			this.globalFunctions.LOG("onRequestError Error:"+err + " ("+this.globalFunctions.STACK()+")", -1);
		}
	},

	clearQueueForCalendar: function _clearQueueForCalendar(aServer, aCalendar)
	{
		if (this.serverQueue[aServer]) {
			if (this.serverQueue[aServer].jobs[aCalendar.id]) {
				this.observerService.notifyObservers(aCalendar, "onExchangeProgressChange", null); 
				this.serverQueue[aServer].jobs[aCalendar.id] = new Array();
			}			
		}
	},

	stopRunningJobsForCalendar: function _stopRunningJobsForCalendar(aServer, aCalendar)
	{
		if (this.serverQueue[aServer]) {
			for (var index in this.serverQueue[aServer].runningJobs) {
				// only stop for current calendar
				try {
					if ((this.serverQueue[aServer].runningJobs[index].exchangeRequest.isRunning) && (this.serverQueue[aServer].runningJobs[index].calendar) && (this.serverQueue[aServer].runningJobs[index].calendar.id == aCalendar.id)) {
						this.serverQueue[aServer].runningJobs[index].exchangeRequest.stopRequest();
					}
				}
				catch(err) {
					this.globalFunctions.LOG("stopRunningJobsForCalendar Error:"+err + " ("+this.globalFunctions.STACKshort()+")", -1);
				}
			}
		}
	},

	logInfo: function _logInfo(message, aDebugLevel) {

		if (!aDebugLevel) {
			var debugLevel = 1;
		}
		else {
			var debugLevel = aDebugLevel;
		}

		this.storedDebugLevel = this.globalFunctions.safeGetIntPref(null, PREF_MAINPART+"debuglevel", 0, true);
		if (debugLevel <= this.storedDebugLevel) {
			this.globalFunctions.LOG("[exchangeLoadBalancer] "+message + " ("+this.globalFunctions.STACKshort()+")");
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

