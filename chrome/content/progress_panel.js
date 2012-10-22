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

Cu.import("resource://exchangecalendar/ecFunctions.js");

if (! exchWebService) var exchWebService = {};

exchWebService.progressPanel = {

	queueSizeTotal: 0,
	calendarQueues: {},
	runningJobs: 0,
	changeQueue: [],
	busy: false,
	isLoaded: false,
	imageCounter: 1,
	firstLoad: true,
	imageList: {    image1: "chrome://exchangecalendar/skin/arrow-circle.png",
			image2: "chrome://exchangecalendar/skin/arrow-circle-315.png",
			image3: "chrome://exchangecalendar/skin/arrow-circle-225.png",
			image4: "chrome://exchangecalendar/skin/arrow-circle-135.png"
			},

	notify: function _notify() 
	{
		if (exchWebService.progressPanel.isLoaded) {
			exchWebService.progressPanel.imageCounter = Number(exchWebService.progressPanel.imageCounter) + Number(1);
			if (exchWebService.progressPanel.imageCounter > 4) {
				exchWebService.progressPanel.imageCounter = 1;
			}
			if (document) {
				document.getElementById("exchWebService-progress-image").style.listStyleImage = "url('"+exchWebService.progressPanel.imageList["image"+exchWebService.progressPanel.imageCounter]+"')";
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
			if (this.firstLoad) {
				var tooltip=document.getElementById("exchWebServicesprogresstip");
				if (tooltip) {
				dump("\ntooltip:"+tooltip+"\n");
					var vboxes = tooltip.getElementsByTagName('vbox');
					if (vboxes.length > 0) {
						var vbox = vboxes[0];
	dump("\n WHOEPI\n");
						var counter=1;
						while (counter <= 100) {
							var progressLabel=document.createElement("label");
							progressLabel.setAttribute("id","exchWebServiceProgress"+counter);
							progressLabel.id = "exchWebServiceProgress"+counter;
							progressLabel.value = "__"+counter;
							vbox.appendChild(progressLabel);
							counter++;
						}
						document.getElementById("exchWebService-progress-panel").tooltip = tooltip.id;
						this.firstLoad = false;
					}
				}
			}

			exchWebService.progressPanel.changeQueue.push({ jobchange: Number(data), calendar: subject});
		}

		if (!exchWebService.progressPanel.busy) {
			exchWebService.progressPanel.busy = true;
			while (exchWebService.progressPanel.changeQueue.length > 0) {
				if (exchWebService.progressPanel.changeQueue[0].jobchange != 0) {

					exchWebService.progressPanel.queueSizeTotal = exchWebService.progressPanel.queueSizeTotal + exchWebService.progressPanel.changeQueue[0].jobchange;

					if (!exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id]) {
						exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id] = {};
					}
					exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id].name = exchWebService.progressPanel.changeQueue[0].calendar.name;
					if (exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id].queueSize) {
						exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id].queueSize = exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id].queueSize + exchWebService.progressPanel.changeQueue[0].jobchange; 
					}
					else {
						exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id].queueSize = exchWebService.progressPanel.changeQueue[0].jobchange; 
					}

					if (exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id].queueSize == 0) {
						if (document.getElementById(exchWebService.progressPanel.changeQueue[0].calendar.id)) {
							document.getElementById("exchWebServiceProgressvbox").deleteChild(document.getElementById(exchWebService.progressPanel.changeQueue[0].calendar.id));
						}
						delete exchWebService.progressPanel.calendarQueues[exchWebService.progressPanel.changeQueue[0].calendar.id];
					}

				}
				exchWebService.progressPanel.changeQueue.shift();
			}

			if (exchWebService.progressPanel.isLoaded) {
				if (exchWebService.progressPanel.queueSizeTotal == 0) {
					document.getElementById("exchWebService-progress-panel").hidden = true;
					exchWebService.progressPanel.timer.cancel();
				}
				else {
					if (document.getElementById("exchWebService-progress-panel").hidden) {
						if (exchWebService.progressPanel.queueSizeTotal > 1) {
							document.getElementById("exchWebService-progress-panel").hidden = false;
							exchWebService.progressPanel.timer.initWithCallback(exchWebService.progressPanel, 200, exchWebService.progressPanel.timer.TYPE_REPEATING_SLACK);
						}
					}
					var tmpStr = exchWebService.progressPanel.queueSizeTotal + " job";
					if (exchWebService.progressPanel.queueSizeTotal > 1) {
						tmpStr = tmpStr + "s";
					}
					document.getElementById("exchWebService-progress-label").value = tmpStr;
				}

				// Update the tooltip
				var counter = 1;
				for (var calendarQueue in exchWebService.progressPanel.calendarQueues) {
					document.getElementById("exchWebServiceProgress"+counter).value = exchWebService.progressPanel.calendarQueues[calendarQueue].name+": "+exchWebService.progressPanel.calendarQueues[calendarQueue].queueSize;
					document.getElementById("exchWebServiceProgress"+counter).hidden = false;
					counter = counter + 1;
				}
				while (counter <= 100) {
					document.getElementById("exchWebServiceProgress"+counter).hidden = true;
					counter = counter + 1;
				}
			}

			exchWebService.progressPanel.busy = false;
		}

        },

	init: function _init()
	{
		exchWebService.progressPanel.observerService = Cc["@mozilla.org/observer-service;1"]  
                          .getService(Ci.nsIObserverService);

		exchWebService.progressPanel.observerService.addObserver(exchWebService.progressPanel, "onExchangeProgressChange", false);
		exchWebService.progressPanel.observerService.addObserver(exchWebService.progressPanel, "onExchangeReadOnlyChange", false);

		exchWebService.progressPanel.timer = Cc["@mozilla.org/timer;1"]
				.createInstance(Ci.nsITimer);

	},

	destroy: function _destroy()
	{
		exchWebService.progressPanel.observerService.removeObserver(exchWebService.progressPanel, "onExchangeProgressChange");
		exchWebService.progressPanel.observerService.removeObserver(exchWebService.progressPanel, "onExchangeReadOnlyChange");
	},

	loaded: function ecProgressPanel_loaded()
	{
		exchWebService.progressPanel.isLoaded = true;
	},

	onLoad: function _onLoad(event) {

		// nuke the onload, or we get called every time there's
		// any load that occurs
		document.removeEventListener("load", exchWebService.progressPanel.onLoad, true);

		// Do init
		exchWebService.progressPanel.loaded();

		// Add an unload function to the window so we don't leak any listeners
		window.addEventListener("unload", exchWebService.progressPanel.onFinish, false);


	},

	onFinish: function _onFinish() {
		// Do some cleanup
		exchWebService.progressPanel.destroy();
	},

	openProgressDialog: function _openProgressDialog()
	{
	},
}

exchWebService.progressPanel.init();
document.addEventListener("load", exchWebService.progressPanel.onLoad, true);
