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
 * This code uses parts of the Microsoft Exchange Calendar Provider code on which the
 * "Exchange Data Provider for Lightning" was based.
 * The Initial Developer of the Microsoft Exchange Calendar Provider Code is
 *   Andrea Bittau <a.bittau@cs.ucl.ac.uk>, University College London
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * ***** BEGIN LICENSE BLOCK *****/
/*
 * The TimeZone information in this file was taken from the
 * GetServerTimeZones SOAP request to an Exchange2010_SP1 server.
 * It is used so we can use the right timezone name in an
 * createitem for a Exchange2007_SP1 server.
 */

var Cu = Components.utils;

Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://1st-setup/ecFunctions.js");

if (! exchWebService) var exchWebService = {};

function urlToPath (aPath) {

    if (!aPath || !/^file:/.test(aPath))
      return ;
    var rv;
   var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
        .createInstance(Components.interfaces.nsIFileProtocolHandler);
    rv = ph.getFileFromURLSpec(aPath).path;
    return rv;
}

function chromeToPath (aPath) {

   if (!aPath || !(/^chrome:/.test(aPath)))
      return; //not a chrome url
   var rv;
   
      var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
        var uri = ios.newURI(aPath, "UTF-8", null);
        var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1'].getService(Components.interfaces["nsIChromeRegistry"]);
        rv = cr.convertChromeURL(uri).spec;

        if (/^file:/.test(rv))
          rv = this.urlToPath(rv);
        else
          rv = this.urlToPath("file://"+rv);

      return rv;
}

exchWebService.timezoneFunctions = {
	_ews_2010_timezonedefinitions: null,

	get ews_2010_timezonedefinitions()
	{
		if (!this._ews_2010_timezonedefinitions) {

			var somefile = chromeToPath("chrome://exchangecalendar/ewsTimeZoneDefinitions_2007.xml");
			var file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
			exchWebService.commonFunctions.LOG("Will use local file for timezone data for 2007. name:"+somefile);
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

			try {
				this._ews_2010_timezonedefinitions = new XML(lines);
			}
			catch(exc) {exchWebService.commonFunctions.LOG("Could not convert timezone xml file into XML object:"+exc); };
		}

		return this._ews_2010_timezonedefinitions;
	},

	getEWSTimeZones: function _getEWSTimeZones(aTimeZoneDefinitions)
	{
		var rm = aTimeZoneDefinitions..nsMessages::GetServerTimeZonesResponseMessage;

		var timeZoneDefinitions = {};

		for each( var timeZoneDefinition in rm.nsMessages::TimeZoneDefinitions.nsTypes::TimeZoneDefinition) {
			//cal.LOG("ss:"+timeZoneDefinition.@Name);
			timeZoneDefinitions[timeZoneDefinition.@Id] = timeZoneDefinition;
		}

		return timeZoneDefinitions;
	},
}

exchWebService.commonFunctions.LOG(" ?????????????????????????????????????????????????");

