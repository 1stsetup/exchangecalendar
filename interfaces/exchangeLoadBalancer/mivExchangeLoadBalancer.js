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
	classID: components.ID("{"+mivExchangeLoadBalancerGUID+"}"),
	contractID: "@1st-setup.nl/exchange/loadbalancer;1",
	flags: Ci.nsIClassInfo.SINGLETON || Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// External methods

	// Internal methods.
	get maxJobs()
	{
		return this.globalFunctions.safeGetIntPref(null, PREF_MAINPART+"maxjobs", 3, true);
	},

	notify: function _notify() {
		dump("notify\n");
		this.processQueue();
	},

	addToQueue: function _addToQueue(aJob)
	{

		if (!this.serverQueue[aJob.arguments.serverUrl]) {
			this.serverQueue[aJob.arguments.serverUrl] = { currentCalendar: 0,
									calendarList: new Array(),
									runningJobs: new Array(),
									jobs: {} };
		}

		if (!this.serverQueue[aJob.arguments.serverUrl].jobs[aJob.calendar.id]) {
			this.serverQueue[aJob.arguments.serverUrl].jobs[aJob.calendar.id] = new Array();
		}

		this.serverQueue[aJob.arguments.serverUrl].jobs[aJob.calendar.id].push(aJob);
		dump("Adding job to queue for server '"+aJob.arguments.serverUrl+"' for calendar '"+aJob.calendar.id+"'. We now have:"+this.serverQueue[aJob.arguments.serverUrl].jobs[aJob.calendar.id].length+" jobs.\n");

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

		this.observerService.notifyObservers(aJob.calendar, "onExchangeProgressChange", "1"); 

		if (!this.timer) {
			dump("Start timer\n");
			this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
			this.timer.initWithCallback(this, 5, this.timer.TYPE_REPEATING_SLACK);
		}
	},

	processQueue: function _processQueue()
	{
		var jobCount = 0;

dump("start processQueue\n");
try {

		for (var server in this.serverQueue) {

dump("server:"+server+"\n");
			// Cleanup jobs with have finished
			var oldList = this.serverQueue[server].runningJobs;
			this.serverQueue[server].runningJobs = new Array();
			for (var runningJob in oldList) {
				if (oldList[runningJob].exchangeRequest.isRunning) {
dump("Server:"+server+", job:"+runningJob+" is still running.\n");
					this.serverQueue[server].runningJobs.push(oldList[runningJob]);
				}
				else {
					// Running job stopped.
					dump("Job stopped to queue for server '"+server+"' for calendar '"+oldList[runningJob].job.calendar.id+"'. We now have:"+this.serverQueue[server].runningJobs.length+" jobs running.\n");
					this.jobsRunning--;
				}
			}

			// See if we can start another job for this url/server
dump("Runningjobs:"+this.serverQueue[server].runningJobs.length+", maxJobs:"+this.maxJobs+"\n");
			if (this.serverQueue[server].runningJobs.length < this.maxJobs) {
dump("xx\n");
				if (this.serverQueue[server].currentCalendar >= this.serverQueue[server].calendarList.length) {
					this.serverQueue[server].currentCalendar = 0;
				}
				var initialCurrentCalendar = this.serverQueue[server].currentCalendar;
dump("yy\n");
				var noJobsLeft = false
dump("CurrentCalendar x:"+this.serverQueue[server].currentCalendar+", id:"+this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]+", jobs:"+this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].length+"\n");
				while ((!noJobsLeft) && (this.serverQueue[server].currentCalendar < this.serverQueue[server].calendarList.length) && (this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].length == 0)) {
					this.serverQueue[server].currentCalendar++;

					if (this.serverQueue[server].currentCalendar == initialCurrentCalendar) {
						// Stop processing for this server because there are now jobs left.
						noJobsLeft = true;
						
					}
					if ((!noJobsLeft) && (this.serverQueue[server].currentCalendar >= this.serverQueue[server].calendarList.length)) {
						this.serverQueue[server].currentCalendar = 0;
					}
dump("CurrentCalendar y:"+this.serverQueue[server].currentCalendar+", id:"+this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]+", jobs:"+this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].length+", noJobsLeft:"+noJobsLeft+"\n");

				}
dump("zz\n");
				if ((!noJobsLeft) && (this.serverQueue[server].currentCalendar < this.serverQueue[server].calendarList.length) && (this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].length > 0)) {
dump("01\n");
					jobCount += this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].length;

					var job = this.serverQueue[server].jobs[this.serverQueue[server].calendarList[this.serverQueue[server].currentCalendar]].shift();
dump("02\n");

					this.serverQueue[server].currentCalendar++;
dump("03\n");
					if (this.serverQueue[server].currentCalendar >= this.serverQueue[server].calendarList.length) {
						this.serverQueue[server].currentCalendar = 0;
					}

dump("04\n");
					this.observerService.notifyObservers(job.calendar, "onExchangeProgressChange", "-1"); 
	 
dump("05\n");
					job.arguments["cbOk"] = job.cbOk;
					job.arguments["cbError"] = job.cbError;
					job.arguments["job"] = job;
					job.arguments["calendar"] = job.calendar;
				
dump("06\n");
					var self = this;

					var newJob = { job: job,
							exchangeRequest: new job.ecRequest(job.arguments, 
							function myOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) { self.onRequestOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);}, 
							function myError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {self.onRequestError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);}
							, job.listener)
									};
dump("newJob isRunning:"+newJob.exchangeRequest.isRunning+"\n");
					this.serverQueue[server].runningJobs.push(newJob);

					dump("Starting job to queue for server '"+server+"' for calendar '"+job.calendar.id+"'. We now have:"+this.serverQueue[server].jobs[job.calendar.id].length+" jobs in queue and "+this.serverQueue[server].runningJobs.length+" jobs running.\n");
					this.jobsRunning++;
				}				
			}
dump("The end\n");
		}

		if (this.jobsRunning == 0) {
			dump("No more jobs left. Stop Timer.\n");
			this.timer.cancel();
			delete this.timer;
			this.timer = null;
		}

} catch(err){dump("07: Error:"+err+"\n");}
dump("end processQueue\n");
	},

	onRequestOk: function _onRequestOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)
	{
		dump("onRequestOk job to queue for server '"+arg1.argument.serverUrl+"' for calendar '"+arg1.argument.job.calendar.id+"'. We now have:"+this.serverQueue[arg1.argument.serverUrl].jobs[arg1.argument.calendar.id].length+" jobs in queue and "+this.serverQueue[arg1.argument.serverUrl].runningJobs.length+" jobs running.\n");
try{
		arg1.argument.cbOk(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
}catch(err) { dump("onRequestOk Error:"+err+"\n");}
	},

	onRequestError: function _onRequestError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)
	{
		dump("onRequestError job to queue for server '"+arg1.argument.serverUrl+"' for calendar '"+arg1.argument.job.calendar.id+"'. We now have:"+this.serverQueue[arg1.argument.serverUrl].jobs[arg1.argument.calendar.id].length+" jobs in queue and "+this.serverQueue[arg1.argument.serverUrl].runningJobs.length+" jobs running.\n");
try{
		arg1.argument.cbError(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
}catch(err) { dump("onRequestError Error:"+err+"\n");}
	},

	clearQueueForCalendar: function _clearQueueForCalendar(aCalendar)
	{
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

