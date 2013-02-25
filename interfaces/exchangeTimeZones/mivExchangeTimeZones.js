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

Cu.import("resource://calendar/modules/calProviderUtils.jsm");

Cu.import("resource://exchangecalendar/erGetTimeZones.js");

function mivExchangeTimeZones() {
	this._timeZones = {};

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

	this.loadBalancer = Cc["@1st-setup.nl/exchange/loadbalancer;1"]  
	                          .getService(Ci.mivExchangeLoadBalancer); 

	this.exchangeStatistics = Cc["@1st-setup.nl/exchange/statistics;1"]
				.getService(Ci.mivExchangeStatistics);

	this.timezoneService = Cc["@mozilla.org/calendar/timezone-service;1"]
				.getService(Ci.calITimezoneProvider);

	// load timezone file from resource. This is for Exchange server version before 2010.
	this.load_timezonedefinitions_file();
}

var PREF_MAINPART = 'extensions.1st-setup.exchangecalendar.timezones.';

var mivExchangeTimeZonesGUID = "16093d9f-a9ac-41ab-9995-0a3a7423b45c";

mivExchangeTimeZones.prototype = {

	// methods from nsISupport

	/* void QueryInterface(
	  in nsIIDRef uuid,
	  [iid_is(uuid),retval] out nsQIResult result
	);	 */
	QueryInterface: XPCOMUtils.generateQI([Ci.mivExchangeTimeZones,
			Ci.nsIClassInfo,
			Ci.nsISupports]),

	// Attributes from nsIClassInfo

	classDescription: "Keeps the Exchange TimeZones retreived from server in memory.",
	classID: components.ID("{"+mivExchangeTimeZonesGUID+"}"),
	contractID: "@1st-setup.nl/exchange/timezones;1",
	flags: Ci.nsIClassInfo.SINGLETON || Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// void getInterfaces(out PRUint32 count, [array, size_is(count), retval] out nsIIDPtr array);
	getInterfaces: function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeTimeZones,
			Ci.nsIClassInfo,
			Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},
	// External methods

	// void addURL(in AUTF8String aURL);
	addURL: function _addURL(aURL, aUser, aCalendar)
	{
		var version = this.exchangeStatistics.getServerVersion(aURL);

		if (!this._timeZones[version]) {

			var self = this;
			this.loadBalancer.addToQueue({ calendar: aCalendar,
					 ecRequest:erGetTimeZonesRequest,
					 arguments: {user: aUser, 
					 serverUrl: aURL,
					 ServerVersion: version,
					 actionStart: Date.now() },
					 cbOk: function(erGetTimeZonesRequest, aTimeZoneDefinitions) { self.getTimeZonesOK(erGetTimeZonesRequest, aTimeZoneDefinitions);}, 
					 cbError: function(erGetTimeZonesRequest, aCode, aMsg) { self.getTimeZonesError(erGetTimeZonesRequest, aCode, aMsg);},
					 listener: null});

		}

	},

	getExchangeTimeZoneIdByCalTimeZone: function _getExchangeTimeZoneIdByCalTimeZone(aCalTimeZone, aURL)
	{
		this.logInfo("getExchangeTimeZoneIdByCalTimeZone:"+aCalTimeZone.tzid);

		var version = this.exchangeStatistics.getServerVersion(aURL);

		if (this._timeZones[version]) {
			
			if (aCalTimeZone.isFloating) {
				var tmpZone = this.globalFunctions.ecDefaultTimeZone();
			}
			else {
				var tmpZone = aCalTimeZone;
			}

			var weHaveAMatch = null;
			var tmpPlaceName = null;
			var tmpId = null;
			if (tmpZone.tzid.indexOf("/") > -1) {
				// Get City/Place name from tzid.
				tmpPlaceName = tmpZone.tzid.substr(tmpZone.tzid.indexOf("/")+1);
			}
			else {
				tmpId = tmpZone.tzid.toString();
			}


			var tmpBiasValues = this.calculateBiasOffsets(tmpZone);
			if (!tmpBiasValues.standard) {
				return "UTC";
			}

			//if (tmpBiasValues.standard.indexOf("PT0") == 0) {
			//	if (this.debug) this.logInfo("Changing tmpBiasValues.standard="+tmpBiasValues.standard+ " -> PT0H");
			//	tmpBiasValues.standard = "PT0H";
			//}
			this.logInfo("tmpBiasValues.standard="+tmpBiasValues.standard);
			if (tmpBiasValues.daylight) {
				if (tmpBiasValues.daylight == tmpBiasValues.standard) {
					if (this.debug) this.logInfo("tmpBiasValues.daylight == tmpBiasValues.standard Not going to use daylight value.");
					tmpBiasValues.daylight = null;
				}
				else {
					if (this.debug) this.logInfo("tmpBiasValues.daylight="+tmpBiasValues.daylight);
				}
			}

			for each(var timeZoneDefinition in this._timeZones[version]) {
				//if (this.debug) this.logInfo("timeZoneDefinition.@Name="+timeZoneDefinition.@Name);
				var placeNameMatch = false;
				if ((tmpPlaceName) && (timeZoneDefinition.getAttribute("Name", "").indexOf(tmpPlaceName) > -1)) {
					// We found our placename in the name of the timezonedefinition
					placeNameMatch = true;
				}

				var idMatch = false;
				if ((tmpId) && (timeZoneDefinition.getAttribute("Id", "") == tmpId)) {
					// We found our tmpId in the id of the timezonedefinition
					idMatch = true;
				}

				var standardMatch = null;
				var periods = timeZoneDefinition.XPath("/t:Periods/t:Period[@Name = 'Standard']");
				if (periods.length > 0) {
					for (var index in periods) {
						//if (this.debug) this.logInfo("xx period.@Bias="+period.@Bias.toString());
						if (this.globalFunctions.convertDurationToSeconds(periods[index].getAttribute("Bias")) == this.globalFunctions.convertDurationToSeconds(tmpBiasValues.standard)) {
							standardMatch = periods[index].getAttribute("Bias", null);
							break;
						}
					}
				}
				periods = null;

				if (standardMatch) {
					var daylightMatch = null;
					if (tmpBiasValues.daylight) {
						var periods = timeZoneDefinition.XPath("/t:Periods/t:Period[@Name = 'Daylight']");
						if (periods.length > 0) {
							for (var index in periods) {
								//if (this.debug) this.logInfo("yy period.@Bias="+period.@Bias.toString());
								if (this.globalFunctions.convertDurationToSeconds(periods[index].getAttribute("Bias")) == this.globalFunctions.convertDurationToSeconds(tmpBiasValues.daylight)) {
									daylightMatch = periods[index].getAttribute("Bias", null);
									break;
								}
							}
						}
						periods = null;
					}
	
					if ((standardMatch) && ((!tmpBiasValues.daylight) || (daylightMatch))) {
						this.logInfo("WE HAVE A TIMEZONE MATCH BETWEEN LIGHTNING AND this.globalFunctions. Cal:"+aCalTimeZone.tzid+", EWS:"+timeZoneDefinition.getAttribute("Name"));
	
						// If we also found the place name this will overrule everything else.
						if ((placeNameMatch) || (idMatch) || (!weHaveAMatch)) {
							weHaveAMatch = timeZoneDefinition.getAttribute("Id");
	
							if (placeNameMatch) {
								this.logInfo("We have a timzonematch on place name");
								break;
							}
							if (idMatch) {
								this.logInfo("We have a timzonematch on id");
								break;
							}
						}
					}
				}

			}

			return weHaveAMatch;
		}

		return "UTC";
	},

	getCalTimeZoneByExchangeTimeZone: function _getCalTimeZoneByExchangeTimeZone(aExchangeTimeZone, aURL)
	{
		if (aExchangeTimeZone == null) return null;

		var result = null;

		var exchangeZoneId = aExchangeTimeZone.getAttribute("Id", "??");
		var exchangeZoneName = aExchangeTimeZone.getAttribute("Name", "??");
		this.logInfo("Exchange timezone:"+exchangeZoneId+"/"+exchangeZoneName);

		var standardPeriods = aExchangeTimeZone.XPath("/t:Periods/t:Period[@Name = 'Standard']");
		var standardBias = null;
		if (standardPeriods.length > 0) {
			// Get last period. Most of the time this is the last in the list.
			standardBias = this.globalFunctions.convertDurationToSeconds(standardPeriods[standardPeriods.length-1].getAttribute("Bias"));
		}

		var daylightPeriods = aExchangeTimeZone.XPath("/t:Periods/t:Period[@Name = 'Daylight']");
		var daylightBias = null;
		if (daylightPeriods.length > 0) {
			// Get last period. Most of the time this is the last in the list.
			daylightBias = this.globalFunctions.convertDurationToSeconds(daylightPeriods[daylightPeriods.length-1].getAttribute("Bias"));
		}

		// Loop through the lightning timezones.
		// First we try to do a fast detection by name
		var zoneScore = 0;
		if ((exchangeZoneId != "??") || (exchangeZoneName != "??")) {
			var timezones = this.timezoneService.timezoneIds;
			var tmpResult = null;
			while (timezones.hasMore()) {
				var tmpZone = timezones.getNext();
				var zoneParts = tmpZone.split("/");

				var tmpScore = 0;
				for each(var zonePart in zoneParts) {
					if (exchangeZoneId.indexOf(zonePart) > -1) {
						tmpScore = tmpScore + 1;
					}
					if (exchangeZoneName.indexOf(zonePart) > -1) {
						tmpScore = tmpScore + 1;
					}
				}

				if (tmpScore > zoneScore) {
					this.logInfo("  --> We have a match between Lightning '"+tmpZone+"' and Exchange '"+exchangeZoneId+"/"+exchangeZoneName+"' on id and name.");
					tmpResult = this.timezoneService.getTimezone(tmpZone);

					var tmpBiasValues = this.calculateBiasOffsets(tmpResult);
					if (!tmpBiasValues.standard) {
						tmpBiasValues.standard = "PT0H";
					}

					if (this.globalFunctions.convertDurationToSeconds(tmpBiasValues.standard) == standardBias) {
						if ((tmpBiasValues.daylight == null) || (this.globalFunctions.convertDurationToSeconds(tmpBiasValues.daylight) == daylightBias)) {
							result = tmpResult;
							zoneScore = tmpScore;
							this.logInfo("  --> a. We have a match between Lightning '"+tmpZone+"' and Exchange '"+exchangeZoneId+"/"+exchangeZoneName+"'  on Bias values.");
						}
					}
				}
			}
		}

		var weHaveAMatch = false;
		if (result == null) {
			// We scan the while list to find a match.
			var timezones = this.timezoneService.timezoneIds;
			var tmpResult = null;
			while (timezones.hasMore() && (!weHaveAMatch)) {
				var tmpZone = timezones.getNext();
				tmpResult = this.timezoneService.getTimezone(tmpZone);

				var tmpBiasValues = this.calculateBiasOffsets(tmpResult);
				if (!tmpBiasValues.standard) {
					tmpBiasValues.standard = "PT0H";
				}

				if (this.globalFunctions.convertDurationToSeconds(tmpBiasValues.standard) == standardBias) {
					if ((tmpBiasValues.daylight == null) || (this.globalFunctions.convertDurationToSeconds(tmpBiasValues.daylight) == daylightBias)) {
						result = tmpResult;
						weHaveAMatch = true;
						this.logInfo("  --> b. We have a match between Lightning '"+tmpZone+"' and Exchange '"+exchangeZoneId+"/"+exchangeZoneName+"' on Bias values.");
					}
				}

			}
		}

		if (result == null) {
			this.logInfo("  --> c. Could not find a matching lightning timezone.");
		}

		return result;
	},

	// Internal methods.

	calculateBiasOffsets: function _calculateBiasOffsets(aCalTimeZone)
	{
		var tzcomp = aCalTimeZone.icalComponent;
		if (!tzcomp) {
			return {};
		}
	
		var dsttz = null;
		for (var comp = tzcomp.getFirstSubcomponent("DAYLIGHT");
		     comp;
		     comp = tzcomp.getNextSubcomponent("DAYLIGHT")) {
			if (!dsttz || dsttz.getFirstProperty("DTSTART").valueAsDatetime.compare(
					comp.getFirstProperty("DTSTART").valueAsDatetime) < 0) {
				dsttz = comp;
			}
		}
		var stdtz = null;
		for (var comp = tzcomp.getFirstSubcomponent("STANDARD");
		     comp;
		     comp = tzcomp.getNextSubcomponent("STANDARD")) {
			if (!stdtz || stdtz.getFirstProperty("DTSTART").valueAsDatetime.compare(
					comp.getFirstProperty("DTSTART").valueAsDatetime) < 0) {
				stdtz = comp;
			}
		}
	
		if (!stdtz) {
			return {};
		}
	
		// Get TZOFFSETTO from standard time.
		var m = stdtz.getFirstProperty("TZOFFSETTO").value.match(/^([+-]?)(\d\d)(\d\d)$/);
		var biasOffset = cal.createDuration();
		biasOffset.hours = m[2];
		biasOffset.minutes = m[3];
		if (m[1] == '+') {
			biasOffset.isNegative = true;
		}

		var tmpBaseOffset = biasOffset.icalString;

		var daylightOffset = null;
		if (dsttz) {
			var m = dsttz.getFirstProperty("TZOFFSETTO").value.match(/^([+-]?)(\d\d)(\d\d)$/);
			daylightOffset = cal.createDuration();
			daylightOffset.hours = m[2];
			daylightOffset.minutes = m[3];
			if (m[1] == '+') {
				daylightOffset.isNegative = true;
			}
		}
	
		if (daylightOffset) {
			return { standard: biasOffset.icalString,
				 daylight: daylightOffset.icalString } ;
		}
		else {
			return { standard: biasOffset.icalString,
				 daylight: null } ;
		}
	},

	getTimeZonesOK: function _getTimeZonesOK(erGetTimeZonesRequest, aTimeZoneDefinitions)
	{
		this.addExchangeTimeZones(aTimeZoneDefinitions, erGetTimeZonesRequest.argument.serverUrl);
		this.logInfo("getTimeZonesOK");
	},

	getTimeZonesError: function _getTimeZonesError(erGetTimeZonesRequest, aCode, aMsg)
	{
		this.logInfo("getTimeZonesError: Msg"+aMsg);
	},

	addExchangeTimeZones: function _addExchangeTimeZones(aTimeZoneDefinitions, aVersion)
	{
		var rm = aTimeZoneDefinitions.XPath("/s:Envelope/s:Body/m:GetServerTimeZonesResponse/m:ResponseMessages/m:GetServerTimeZonesResponseMessage");
		if (rm.length == 0) return null;

		this._timeZones[aVersion] = {};

		var timeZoneDefinitionArray = rm[0].XPath("/m:TimeZoneDefinitions/t:TimeZoneDefinition");
		for (var index in timeZoneDefinitionArray) {
			this._timeZones[aVersion][timeZoneDefinitionArray[index].getAttribute("Id")] = timeZoneDefinitionArray[index];
		}
		rm = null;
		//dump("\nEnd of get ews_2010_timezonedefinitions. We have: "+timeZoneDefinitionArray.length+" definitions.\n");
	},

	load_timezonedefinitions_file: function _load_timezonedefinitions_file()
	{
		var somefile = this.globalFunctions.chromeToPath("chrome://exchangeTimeZones/content/ewsTimesZoneDefinitions_2007.xml");
		var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);

		file.initWithPath(somefile);

		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].  
				 createInstance(Components.interfaces.nsIFileInputStream);  
		istream.init(file, -1, -1, 0);  
		istream.QueryInterface(Components.interfaces.nsILineInputStream);  
		  
		// read lines into array  
		var line = {}, lines = "", hasmore;  
		do {  
			hasmore = istream.readLine(line);  
			lines += line.value;   
		} while(hasmore);  
		  
		istream.close();

		var timezonedefinitions = Cc["@1st-setup.nl/conversion/xml2jxon;1"]
						.createInstance(Ci.mivIxml2jxon);
		timezonedefinitions.processXMLString(lines, 0, null);

		this.addExchangeTimeZones(timezonedefinitions, "Exchange2007_SP1");
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
			this.globalFunctions.LOG("[exchangeStatistics] "+message + " ("+this.globalFunctions.STACKshort()+")");
		}
	},

}

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeTimeZones) {
			// Load main script from lightning that we need.
			NSGetFactory.mivExchangeTimeZones = XPCOMUtils.generateNSGetFactory([mivExchangeTimeZones]);
			
	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}
	return NSGetFactory.mivExchangeTimeZones(cid);
} 

