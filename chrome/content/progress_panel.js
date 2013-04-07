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
 * -- Exchange 2007/2010 Calendar and Tasks Provider.
 * -- For Thunderbird with the Lightning add-on.
 *
 * This work is a combination of the Storage calendar, part of the default Lightning add-on, and 
 * the "Exchange Data Provider for Lightning" add-on currently, october 2011, maintained by Simon Schubert.
 * Primarily made because the "Exchange Data Provider for Lightning" add-on is a continuation 
 * of old code and this one is build up from the ground. It still uses some parts from the 
 * "Exchange Data Provider for Lightning" project.
 *
 * Author: Michel Verbraak (info@1st-setup.nl)
 * Website: http://www.1st-setup.nl/wordpress/?page_id=133
 * email: exchangecalendar@extensions.1st-setup.nl
 *
 *
 * ***** BEGIN LICENSE BLOCK *****/

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;

//Cu.import("resource://exchangecalendar/ecFunctions.js");

//if (! exchWebService) var exchWebService = {};

function exchProgressPanel(aDocument, aWindow)
{
	this._document = aDocument;
	this._window = aWindow;

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
}

exchProgressPanel.prototype = {

	queueSizeTotal: 0,
	calendarQueues: {},
	runningJobs: 0,
	changeQueue: [],
	busy: false,
	isLoaded: false,
	imageCounter: 1,
	imageList: {    image1: "chrome://exchangecalendar/skin/arrow-circle.png",
			image2: "chrome://exchangecalendar/skin/arrow-circle-315.png",
			image3: "chrome://exchangecalendar/skin/arrow-circle-225.png",
			image4: "chrome://exchangecalendar/skin/arrow-circle-135.png"
			},
	loadBalancer : Cc["@1st-setup.nl/exchange/loadbalancer;1"]  
	                          .getService(Ci.mivExchangeLoadBalancer),  
	timerRunning: false,

	notify: function _notify() 
	{
		if (this.isLoaded) {

			var jobList = this.loadBalancer.jobList;
			var running = 0;
			var waiting = 0;

			// Update the tooltip
			var rows = document.getElementById("exchWebServices.progress.rows");
			if (rows) {
				var counter = 1;
				var row;
				var rowCount = 0;
				for (var server in jobList) {
					if (!document.getElementById("exchWebServiceProgress.progress.row"+rowCount)) {
						row = document.createElement("row");
						row.setAttribute("id","exchWebServiceProgress.progress.row"+rowCount);
						rows.appendChild(row);
					}
					else {
						row = document.getElementById("exchWebServiceProgress.progress.row"+rowCount);
					}

					var lineCount = 0;
					var calLine;
					if (!document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount)) {
						var serverLine = document.createElement("label");
						serverLine.setAttribute("id","exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount);
						serverLine.setAttribute("value",server+":"+jobList[server].runningJobs.length);
						row.appendChild(serverLine);

						calLine = document.createElement("vbox");
						calLine.setAttribute("id","exchWebServiceProgress.progress.row"+rowCount+".calcol.line"+lineCount);
						row.appendChild(calLine);
					}
					else {
						document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount).setAttribute("value",server+":"+jobList[server].runningJobs.length);
						document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount).hidden = false;

						calLine = document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".calcol.line"+lineCount);
					}
					running = running + jobList[server].runningJobs.length;


					lineCount++;
					for (var calendarid in jobList[server].jobs) {

						var calendarName =  jobList[server].calendarNames[calendarid];

						if (!document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount)) {
							var line=document.createElement("label");
							line.setAttribute("id","exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount);
							line.setAttribute("value",calendarName+":"+jobList[server].jobs[calendarid].length);
							calLine.appendChild(line);
						}
						else {
							document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount).setAttribute("value", calendarName+":"+jobList[server].jobs[calendarid].length);
							document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount).hidden = false;
						}
						waiting = waiting +jobList[server].jobs[calendarid].length; 
						lineCount++;							
					}
					while (document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount)) {
						document.getElementById("exchWebServiceProgress.progress.row"+rowCount+".servercol.line"+lineCount).hidden = true;
						lineCount++;
					}

					rowCount++;
				}

			}

			if ((waiting == 0) && (running == 0)) {
				document.getElementById("exchWebService-progress-panel").hidden = true;
				this.timer.cancel();
				this.timerRunning = false;
			}
			else {
				if (document.getElementById("exchWebService-progress-panel").hidden) {
					if ((waiting > 1) || (running > 0)) {
						document.getElementById("exchWebService-progress-panel").hidden = false;
						if (!this.timerRunning) {
							this.timerRunning = true;
							this.timer.initWithCallback(this, 200, this.timer.TYPE_REPEATING_SLACK);
						}
					}
				}
				var tmpStr = running + "/" + waiting + " (r/w job";
				if ((waiting+running) > 1) {
					tmpStr = tmpStr + "s";
				}
				tmpStr = tmpStr + ")";
				document.getElementById("exchWebService-progress-label").value = tmpStr;
			}


			this.imageCounter = Number(this.imageCounter) + Number(1);
			if (this.imageCounter > 4) {
				this.imageCounter = 1;
			}
			if (document) {
				document.getElementById("exchWebService-progress-image").style.listStyleImage = "url('"+this.imageList["image"+this.imageCounter]+"')";
			}
		}
	},

	observe: function _observe(subject, topic, data) 
	{
		if (topic == "onExchangeReadOnlyChange") {
			calendarUpdateNewItemsCommand();
			//document.commandDispatcher.updateCommands("calendar_commands");
			return;
		}

		if (topic == "onExchangeProgressChange") {
			if ((!this.timerRunning) && (!this.timerRunning)) {
				this.timerRunning = true;
				this.timer.initWithCallback(this, 200, this.timer.TYPE_REPEATING_SLACK);
			}
		}
        },

	init: function _init()
	{
		this.observerService = Cc["@mozilla.org/observer-service;1"]  
                          .getService(Ci.nsIObserverService);

		this.observerService.addObserver(this, "onExchangeProgressChange", false);
		this.observerService.addObserver(this, "onExchangeReadOnlyChange", false);

		this.timer = Cc["@mozilla.org/timer;1"]
				.createInstance(Ci.nsITimer);
		this.timerRunning = false;

	},

	destroy: function _destroy()
	{
		this.observerService.removeObserver(this, "onExchangeProgressChange");
		this.observerService.removeObserver(this, "onExchangeReadOnlyChange");
	},

	onLoad: function _onLoad(event) {
		this.init();

		// Do init
		this.isLoaded = true;

		// Add an unload function to the window so we don't leak any listeners
		var self = this;
		window.addEventListener("unload", function(){ window.removeEventListener("unload",arguments.callee,false); self.destroy();}, false);

	},

	openProgressDialog: function _openProgressDialog()
	{
	},
}

var myExchProgressPanel = new exchProgressPanel(document, window);
window.addEventListener("load", function () { window.removeEventListener("load",arguments.callee,false); myExchProgressPanel.onLoad(); }, true);

