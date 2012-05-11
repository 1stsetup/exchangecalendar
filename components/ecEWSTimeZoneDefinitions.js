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

var EXPORTED_SYMBOLS = ["ews_2010_timezonedefinitions", "ecGetEWSTimeZones"];

function ecGetEWSTimeZones(aTimeZoneDefinitions)
{
	var rm = aTimeZoneDefinitions..nsMessages::GetServerTimeZonesResponseMessage;

	var timeZoneDefinitions = {};

	for each( var timeZoneDefinition in rm.nsMessages::TimeZoneDefinitions.nsTypes::TimeZoneDefinition) {
		//cal.LOG("ss:"+timeZoneDefinition.@Name);
		timeZoneDefinitions[timeZoneDefinition.@Id] = timeZoneDefinition;
	}

	return timeZoneDefinitions;
}

var ews_2010_timezonedefinitions = <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Header>
    <h:ServerVersionInfo MajorVersion="14" MinorVersion="1" MajorBuildNumber="289" MinorBuildNumber="6" Version="Exchange2010_SP1" xmlns:h="http://schemas.microsoft.com/exchange/services/2006/types" xmlns="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"/>
  </s:Header>
  <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <m:GetServerTimeZonesResponse xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
      <m:ResponseMessages>
        <m:GetServerTimeZonesResponseMessage ResponseClass="Success">
          <m:ResponseCode>NoError</m:ResponseCode>
          <m:TimeZoneDefinitions>
            <t:TimeZoneDefinition Name="(UTC-12:00) International Date Line West" Id="Dateline Standard Time">
              <t:Periods>
                <t:Period Bias="PT12H" Name="Standard" Id="trule:Microsoft/Registry/Dateline Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Dateline Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-11:00) Coordinated Universal Time-11" Id="UTC-11">
              <t:Periods>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/UTC-11/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/UTC-11/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-11:00) Midway Island, Samoa" Id="Samoa Standard Time">
              <t:Periods>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2009-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2010-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2010-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2011-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2011-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2012-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2012-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2013-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2013-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2014-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2014-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2015-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2015-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2016-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2016-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2017-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2017-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2018-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2018-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2019-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2019-Standard"/>
                <t:Period Bias="PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Samoa Standard Time/2020-Daylight"/>
                <t:Period Bias="PT11H" Name="Standard" Id="trule:Microsoft/Registry/Samoa Standard Time/2020-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2009-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>1</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2012-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2012-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2013-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2013-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2014-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2014-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2015-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2015-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="7">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2016-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2016-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="8">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2017-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2017-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="9">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2018-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2018-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="10">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2019-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2019-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="11">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2020-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Samoa Standard Time/2020-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2012-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2013-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2014-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2015-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">7</t:To>
                  <t:DateTime>2016-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">8</t:To>
                  <t:DateTime>2017-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">9</t:To>
                  <t:DateTime>2018-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">10</t:To>
                  <t:DateTime>2019-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">11</t:To>
                  <t:DateTime>2020-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-10:00) Hawaii" Id="Hawaiian Standard Time">
              <t:Periods>
                <t:Period Bias="PT10H" Name="Standard" Id="trule:Microsoft/Registry/Hawaiian Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Hawaiian Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-09:00) Alaska" Id="Alaskan Standard Time">
              <t:Periods>
                <t:Period Bias="PT9H" Name="Standard" Id="trule:Microsoft/Registry/Alaskan Standard Time/2006-Standard"/>
                <t:Period Bias="PT8H" Name="Daylight" Id="trule:Microsoft/Registry/Alaskan Standard Time/2006-Daylight"/>
                <t:Period Bias="PT9H" Name="Standard" Id="trule:Microsoft/Registry/Alaskan Standard Time/2007-Standard"/>
                <t:Period Bias="PT8H" Name="Daylight" Id="trule:Microsoft/Registry/Alaskan Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Alaskan Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Alaskan Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Alaskan Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Alaskan Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-08:00) Pacific Time (US &amp; Canada)" Id="Pacific Standard Time">
              <t:Periods>
                <t:Period Bias="PT8H" Name="Standard" Id="trule:Microsoft/Registry/Pacific Standard Time/2006-Standard"/>
                <t:Period Bias="PT7H" Name="Daylight" Id="trule:Microsoft/Registry/Pacific Standard Time/2006-Daylight"/>
                <t:Period Bias="PT8H" Name="Standard" Id="trule:Microsoft/Registry/Pacific Standard Time/2007-Standard"/>
                <t:Period Bias="PT7H" Name="Daylight" Id="trule:Microsoft/Registry/Pacific Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-08:00) Tijuana, Baja California" Id="Pacific Standard Time (Mexico)">
              <t:Periods>
                <t:Period Bias="PT8H" Name="Standard" Id="trule:Microsoft/Registry/Pacific Standard Time (Mexico)/1-Standard"/>
                <t:Period Bias="PT7H" Name="Daylight" Id="trule:Microsoft/Registry/Pacific Standard Time (Mexico)/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific Standard Time (Mexico)/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific Standard Time (Mexico)/1-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-07:00) Arizona" Id="US Mountain Standard Time">
              <t:Periods>
                <t:Period Bias="PT7H" Name="Standard" Id="trule:Microsoft/Registry/US Mountain Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/US Mountain Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-07:00) Chihuahua, La Paz, Mazatlan" Id="Mountain Standard Time (Mexico)">
              <t:Periods>
                <t:Period Bias="PT7H" Name="Standard" Id="trule:Microsoft/Registry/Mountain Standard Time (Mexico)/1-Standard"/>
                <t:Period Bias="PT6H" Name="Daylight" Id="trule:Microsoft/Registry/Mountain Standard Time (Mexico)/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mountain Standard Time (Mexico)/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mountain Standard Time (Mexico)/1-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-07:00) Mountain Time (US &amp; Canada)" Id="Mountain Standard Time">
              <t:Periods>
                <t:Period Bias="PT7H" Name="Standard" Id="trule:Microsoft/Registry/Mountain Standard Time/2006-Standard"/>
                <t:Period Bias="PT6H" Name="Daylight" Id="trule:Microsoft/Registry/Mountain Standard Time/2006-Daylight"/>
                <t:Period Bias="PT7H" Name="Standard" Id="trule:Microsoft/Registry/Mountain Standard Time/2007-Standard"/>
                <t:Period Bias="PT6H" Name="Daylight" Id="trule:Microsoft/Registry/Mountain Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mountain Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mountain Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mountain Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mountain Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-06:00) Central America" Id="Central America Standard Time">
              <t:Periods>
                <t:Period Bias="PT6H" Name="Standard" Id="trule:Microsoft/Registry/Central America Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central America Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-06:00) Central Time (US &amp; Canada)" Id="Central Standard Time">
              <t:Periods>
                <t:Period Bias="PT6H" Name="Standard" Id="trule:Microsoft/Registry/Central Standard Time/2006-Standard"/>
                <t:Period Bias="PT5H" Name="Daylight" Id="trule:Microsoft/Registry/Central Standard Time/2006-Daylight"/>
                <t:Period Bias="PT6H" Name="Standard" Id="trule:Microsoft/Registry/Central Standard Time/2007-Standard"/>
                <t:Period Bias="PT5H" Name="Daylight" Id="trule:Microsoft/Registry/Central Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-06:00) Guadalajara, Mexico City, Monterrey" Id="Central Standard Time (Mexico)">
              <t:Periods>
                <t:Period Bias="PT6H" Name="Standard" Id="trule:Microsoft/Registry/Central Standard Time (Mexico)/1-Standard"/>
                <t:Period Bias="PT5H" Name="Daylight" Id="trule:Microsoft/Registry/Central Standard Time (Mexico)/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Standard Time (Mexico)/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Standard Time (Mexico)/1-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-06:00) Saskatchewan" Id="Canada Central Standard Time">
              <t:Periods>
                <t:Period Bias="PT6H" Name="Standard" Id="trule:Microsoft/Registry/Canada Central Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Canada Central Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-05:00) Bogota, Lima, Quito" Id="SA Pacific Standard Time">
              <t:Periods>
                <t:Period Bias="PT5H" Name="Standard" Id="trule:Microsoft/Registry/SA Pacific Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/SA Pacific Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-05:00) Eastern Time (US &amp; Canada)" Id="Eastern Standard Time">
              <t:Periods>
                <t:Period Bias="PT5H" Name="Standard" Id="trule:Microsoft/Registry/Eastern Standard Time/2006-Standard"/>
                <t:Period Bias="PT4H" Name="Daylight" Id="trule:Microsoft/Registry/Eastern Standard Time/2006-Daylight"/>
                <t:Period Bias="PT5H" Name="Standard" Id="trule:Microsoft/Registry/Eastern Standard Time/2007-Standard"/>
                <t:Period Bias="PT4H" Name="Daylight" Id="trule:Microsoft/Registry/Eastern Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Eastern Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Eastern Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Eastern Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Eastern Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-05:00) Indiana (East)" Id="US Eastern Standard Time">
              <t:Periods>
                <t:Period Bias="PT5H" Name="Standard" Id="trule:Microsoft/Registry/US Eastern Standard Time/2005-Standard"/>
                <t:Period Bias="PT5H" Name="Standard" Id="trule:Microsoft/Registry/US Eastern Standard Time/2006-Standard"/>
                <t:Period Bias="PT4H" Name="Daylight" Id="trule:Microsoft/Registry/US Eastern Standard Time/2006-Daylight"/>
                <t:Period Bias="PT5H" Name="Standard" Id="trule:Microsoft/Registry/US Eastern Standard Time/2007-Standard"/>
                <t:Period Bias="PT4H" Name="Daylight" Id="trule:Microsoft/Registry/US Eastern Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/US Eastern Standard Time/2005-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/US Eastern Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/US Eastern Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/US Eastern Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/US Eastern Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2006-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-04:30) Caracas" Id="Venezuela Standard Time">
              <t:Periods>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Venezuela Standard Time/2006-Standard"/>
                <t:Period Bias="PT4H30M" Name="Standard" Id="trule:Microsoft/Registry/Venezuela Standard Time/2007-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Venezuela Standard Time/2006-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Venezuela Standard Time/2007-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-04:00) Asuncion" Id="Paraguay Standard Time">
              <t:Periods>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2008-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2008-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2009-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2009-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2010-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2010-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2011-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2011-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2012-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2012-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2013-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2013-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2014-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2014-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2015-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2015-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2016-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2016-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2017-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2017-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2018-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2018-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2019-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2019-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2020-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2020-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Paraguay Standard Time/2021-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Paraguay Standard Time/2021-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2012-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2012-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2013-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2013-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2014-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2014-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="7">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2015-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2015-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="8">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2016-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2016-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="9">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2017-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2017-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="10">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2018-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2018-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="11">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2019-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2019-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="12">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2020-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2020-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="13">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2021-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Paraguay Standard Time/2021-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2012-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2013-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2014-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">7</t:To>
                  <t:DateTime>2015-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">8</t:To>
                  <t:DateTime>2016-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">9</t:To>
                  <t:DateTime>2017-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">10</t:To>
                  <t:DateTime>2018-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">11</t:To>
                  <t:DateTime>2019-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">12</t:To>
                  <t:DateTime>2020-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">13</t:To>
                  <t:DateTime>2021-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-04:00) Atlantic Time (Canada)" Id="Atlantic Standard Time">
              <t:Periods>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Atlantic Standard Time/2006-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Atlantic Standard Time/2006-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Atlantic Standard Time/2007-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Atlantic Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Atlantic Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Atlantic Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Atlantic Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Atlantic Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-04:00) Georgetown, La Paz, San Juan" Id="SA Western Standard Time">
              <t:Periods>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/SA Western Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/SA Western Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-04:00) Manaus" Id="Central Brazilian Standard Time">
              <t:Periods>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2006-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2006-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2007-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2007-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2008-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2008-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2009-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2009-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2010-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2010-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2011-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2011-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2012-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2012-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2013-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2013-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2014-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2014-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2015-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2015-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2016-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2016-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2017-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2017-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2018-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2018-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2019-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2019-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2020-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2020-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2021-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2021-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2022-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2022-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2023-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2023-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2024-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2024-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2025-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2025-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2026-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2026-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2027-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2027-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2028-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2028-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2029-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2029-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2030-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2030-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2031-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2031-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2032-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2032-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2033-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2033-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2034-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2034-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2035-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2035-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2036-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2036-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2037-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2037-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2038-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2038-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2039-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2039-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2040-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Central Brazilian Standard Time/2040-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2012-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2012-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="7">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2013-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2013-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="8">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2014-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2014-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="9">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2015-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2015-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="10">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2016-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2016-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="11">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2017-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2017-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="12">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2018-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2018-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="13">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2019-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2019-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="14">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2020-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2020-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="15">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2021-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2021-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="16">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2022-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2022-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="17">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2023-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2023-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="18">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2024-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2024-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="19">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2025-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2025-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="20">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2026-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2026-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="21">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2027-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2027-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="22">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2028-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2028-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="23">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2029-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2029-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="24">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2030-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2030-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="25">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2031-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2031-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="26">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2032-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2032-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="27">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2033-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2033-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="28">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2034-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2034-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="29">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2035-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2035-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="30">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2036-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2036-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="31">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2037-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2037-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="32">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2038-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2038-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="33">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2039-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2039-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="34">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2040-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Brazilian Standard Time/2040-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2012-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">7</t:To>
                  <t:DateTime>2013-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">8</t:To>
                  <t:DateTime>2014-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">9</t:To>
                  <t:DateTime>2015-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">10</t:To>
                  <t:DateTime>2016-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">11</t:To>
                  <t:DateTime>2017-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">12</t:To>
                  <t:DateTime>2018-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">13</t:To>
                  <t:DateTime>2019-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">14</t:To>
                  <t:DateTime>2020-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">15</t:To>
                  <t:DateTime>2021-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">16</t:To>
                  <t:DateTime>2022-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">17</t:To>
                  <t:DateTime>2023-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">18</t:To>
                  <t:DateTime>2024-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">19</t:To>
                  <t:DateTime>2025-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">20</t:To>
                  <t:DateTime>2026-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">21</t:To>
                  <t:DateTime>2027-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">22</t:To>
                  <t:DateTime>2028-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">23</t:To>
                  <t:DateTime>2029-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">24</t:To>
                  <t:DateTime>2030-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">25</t:To>
                  <t:DateTime>2031-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">26</t:To>
                  <t:DateTime>2032-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">27</t:To>
                  <t:DateTime>2033-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">28</t:To>
                  <t:DateTime>2034-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">29</t:To>
                  <t:DateTime>2035-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">30</t:To>
                  <t:DateTime>2036-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">31</t:To>
                  <t:DateTime>2037-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">32</t:To>
                  <t:DateTime>2038-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">33</t:To>
                  <t:DateTime>2039-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">34</t:To>
                  <t:DateTime>2040-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-04:00) Santiago" Id="Pacific SA Standard Time">
              <t:Periods>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2007-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2007-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2008-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2008-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2009-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2009-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2010-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2010-Standard"/>
                <t:Period Bias="PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2011-Daylight"/>
                <t:Period Bias="PT4H" Name="Standard" Id="trule:Microsoft/Registry/Pacific SA Standard Time/2011-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pacific SA Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-03:30) Newfoundland" Id="Newfoundland Standard Time">
              <t:Periods>
                <t:Period Bias="PT3H30M" Name="Standard" Id="trule:Microsoft/Registry/Newfoundland Standard Time/2006-Standard"/>
                <t:Period Bias="PT2H30M" Name="Daylight" Id="trule:Microsoft/Registry/Newfoundland Standard Time/2006-Daylight"/>
                <t:Period Bias="PT3H30M" Name="Standard" Id="trule:Microsoft/Registry/Newfoundland Standard Time/2007-Standard"/>
                <t:Period Bias="PT2H30M" Name="Daylight" Id="trule:Microsoft/Registry/Newfoundland Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Newfoundland Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT1M</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Newfoundland Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT1M</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Newfoundland Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT1M</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Newfoundland Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT1M</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-03:00) Brasilia" Id="E. South America Standard Time">
              <t:Periods>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2006-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2006-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2007-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2007-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2008-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2008-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2009-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2009-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2010-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2010-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2011-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2011-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2012-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2012-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2013-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2013-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2014-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2014-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2015-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2015-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2016-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2016-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2017-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2017-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2018-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2018-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2019-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2019-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2020-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2020-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2021-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2021-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2022-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2022-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2023-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2023-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2024-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2024-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2025-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2025-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2026-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2026-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2027-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2027-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2028-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2028-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2029-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2029-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2030-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2030-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2031-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2031-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2032-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2032-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2033-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2033-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2034-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2034-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2035-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2035-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2036-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2036-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2037-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2037-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2038-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2038-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2039-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2039-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/E. South America Standard Time/2040-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. South America Standard Time/2040-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2012-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2012-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="7">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2013-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2013-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="8">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2014-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2014-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="9">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2015-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2015-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="10">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2016-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2016-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="11">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2017-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2017-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="12">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2018-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2018-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="13">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2019-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2019-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="14">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2020-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2020-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="15">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2021-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2021-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="16">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2022-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2022-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="17">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2023-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2023-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="18">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2024-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2024-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="19">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2025-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2025-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="20">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2026-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2026-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="21">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2027-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2027-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="22">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2028-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2028-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="23">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2029-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2029-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="24">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2030-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2030-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="25">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2031-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2031-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="26">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2032-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2032-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="27">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2033-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2033-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="28">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2034-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2034-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="29">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2035-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2035-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="30">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2036-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2036-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="31">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2037-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2037-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="32">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2038-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2038-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="33">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2039-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2039-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="34">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2040-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>2</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. South America Standard Time/2040-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2012-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">7</t:To>
                  <t:DateTime>2013-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">8</t:To>
                  <t:DateTime>2014-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">9</t:To>
                  <t:DateTime>2015-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">10</t:To>
                  <t:DateTime>2016-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">11</t:To>
                  <t:DateTime>2017-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">12</t:To>
                  <t:DateTime>2018-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">13</t:To>
                  <t:DateTime>2019-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">14</t:To>
                  <t:DateTime>2020-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">15</t:To>
                  <t:DateTime>2021-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">16</t:To>
                  <t:DateTime>2022-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">17</t:To>
                  <t:DateTime>2023-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">18</t:To>
                  <t:DateTime>2024-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">19</t:To>
                  <t:DateTime>2025-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">20</t:To>
                  <t:DateTime>2026-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">21</t:To>
                  <t:DateTime>2027-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">22</t:To>
                  <t:DateTime>2028-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">23</t:To>
                  <t:DateTime>2029-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">24</t:To>
                  <t:DateTime>2030-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">25</t:To>
                  <t:DateTime>2031-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">26</t:To>
                  <t:DateTime>2032-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">27</t:To>
                  <t:DateTime>2033-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">28</t:To>
                  <t:DateTime>2034-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">29</t:To>
                  <t:DateTime>2035-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">30</t:To>
                  <t:DateTime>2036-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">31</t:To>
                  <t:DateTime>2037-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">32</t:To>
                  <t:DateTime>2038-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">33</t:To>
                  <t:DateTime>2039-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">34</t:To>
                  <t:DateTime>2040-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-03:00) Buenos Aires" Id="Argentina Standard Time">
              <t:Periods>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Argentina Standard Time/2006-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Argentina Standard Time/2007-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Argentina Standard Time/2007-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Argentina Standard Time/2008-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Argentina Standard Time/2008-Standard"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Argentina Standard Time/2009-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Argentina Standard Time/2009-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Argentina Standard Time/2010-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Argentina Standard Time/2006-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Argentina Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>1</t:Month>
                    <t:DayOfWeek>Monday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Argentina Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>12</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Argentina Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Argentina Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Argentina Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>1</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Argentina Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Argentina Standard Time/2010-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-03:00) Cayenne" Id="SA Eastern Standard Time">
              <t:Periods>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/SA Eastern Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/SA Eastern Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-03:00) Greenland" Id="Greenland Standard Time">
              <t:Periods>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2008-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2008-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2009-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2009-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2010-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2010-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2011-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2011-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2012-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2012-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2013-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2013-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2014-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2014-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2015-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2015-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2016-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2016-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2017-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2017-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2018-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2018-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2019-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2019-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2020-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2020-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Greenland Standard Time/2021-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Greenland Standard Time/2021-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2012-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2012-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2013-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2013-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2014-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2014-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="7">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2015-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2015-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="8">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2016-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2016-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="9">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2017-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2017-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="10">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2018-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2018-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="11">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2019-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2019-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="12">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2020-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2020-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="13">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2021-Daylight</t:To>
                    <t:TimeOffset>PT22H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenland Standard Time/2021-Standard</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2012-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2013-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2014-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">7</t:To>
                  <t:DateTime>2015-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">8</t:To>
                  <t:DateTime>2016-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">9</t:To>
                  <t:DateTime>2017-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">10</t:To>
                  <t:DateTime>2018-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">11</t:To>
                  <t:DateTime>2019-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">12</t:To>
                  <t:DateTime>2020-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">13</t:To>
                  <t:DateTime>2021-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-03:00) Montevideo" Id="Montevideo Standard Time">
              <t:Periods>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Montevideo Standard Time/2006-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Montevideo Standard Time/2006-Standard"/>
                <t:Period Bias="PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Montevideo Standard Time/2007-Daylight"/>
                <t:Period Bias="PT3H" Name="Standard" Id="trule:Microsoft/Registry/Montevideo Standard Time/2007-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Montevideo Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Montevideo Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Montevideo Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Montevideo Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-02:00) Coordinated Universal Time-02" Id="UTC-02">
              <t:Periods>
                <t:Period Bias="PT2H" Name="Standard" Id="trule:Microsoft/Registry/UTC-02/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/UTC-02/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-02:00) Mid-Atlantic" Id="Mid-Atlantic Standard Time">
              <t:Periods>
                <t:Period Bias="PT2H" Name="Standard" Id="trule:Microsoft/Registry/Mid-Atlantic Standard Time/1-Standard"/>
                <t:Period Bias="PT1H" Name="Daylight" Id="trule:Microsoft/Registry/Mid-Atlantic Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mid-Atlantic Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mid-Atlantic Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-01:00) Azores" Id="Azores Standard Time">
              <t:Periods>
                <t:Period Bias="PT1H" Name="Standard" Id="trule:Microsoft/Registry/Azores Standard Time/1-Standard"/>
                <t:Period Bias="PT0H" Name="Daylight" Id="trule:Microsoft/Registry/Azores Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Azores Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Azores Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC-01:00) Cape Verde Is." Id="Cape Verde Standard Time">
              <t:Periods>
                <t:Period Bias="PT1H" Name="Standard" Id="trule:Microsoft/Registry/Cape Verde Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Cape Verde Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC) Casablanca" Id="Morocco Standard Time">
              <t:Periods>
                <t:Period Bias="PT0H" Name="Standard" Id="trule:Microsoft/Registry/Morocco Standard Time/2007-Standard"/>
                <t:Period Bias="PT0H" Name="Standard" Id="trule:Microsoft/Registry/Morocco Standard Time/2008-Standard"/>
                <t:Period Bias="-PT1H" Name="Daylight" Id="trule:Microsoft/Registry/Morocco Standard Time/2008-Daylight"/>
                <t:Period Bias="PT0H" Name="Standard" Id="trule:Microsoft/Registry/Morocco Standard Time/2009-Standard"/>
                <t:Period Bias="-PT1H" Name="Daylight" Id="trule:Microsoft/Registry/Morocco Standard Time/2009-Daylight"/>
                <t:Period Bias="PT0H" Name="Standard" Id="trule:Microsoft/Registry/Morocco Standard Time/2010-Standard"/>
                <t:Period Bias="-PT1H" Name="Daylight" Id="trule:Microsoft/Registry/Morocco Standard Time/2010-Daylight"/>
                <t:Period Bias="PT0H" Name="Standard" Id="trule:Microsoft/Registry/Morocco Standard Time/2011-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Morocco Standard Time/2007-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Morocco Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>5</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Morocco Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>8</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Morocco Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>5</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Morocco Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>8</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Morocco Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>5</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Morocco Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>8</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Morocco Standard Time/2011-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC) Coordinated Universal Time" Id="UTC">
              <t:Periods>
                <t:Period Bias="PT0H" Name="Standard" Id="trule:Microsoft/Registry/UTC/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/UTC/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London" Id="GMT Standard Time">
              <t:Periods>
                <t:Period Bias="PT0H" Name="Standard" Id="trule:Microsoft/Registry/GMT Standard Time/1-Standard"/>
                <t:Period Bias="-PT1H" Name="Daylight" Id="trule:Microsoft/Registry/GMT Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/GMT Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT1H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/GMT Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC) Monrovia, Reykjavik" Id="Greenwich Standard Time">
              <t:Periods>
                <t:Period Bias="PT0H" Name="Standard" Id="trule:Microsoft/Registry/Greenwich Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Greenwich Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna" Id="W. Europe Standard Time">
              <t:Periods>
                <t:Period Bias="-PT1H" Name="Standard" Id="trule:Microsoft/Registry/W. Europe Standard Time/1-Standard"/>
                <t:Period Bias="-PT2H" Name="Daylight" Id="trule:Microsoft/Registry/W. Europe Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Europe Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Europe Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague" Id="Central Europe Standard Time">
              <t:Periods>
                <t:Period Bias="-PT1H" Name="Standard" Id="trule:Microsoft/Registry/Central Europe Standard Time/1-Standard"/>
                <t:Period Bias="-PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Central Europe Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Europe Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Europe Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+01:00) Brussels, Copenhagen, Madrid, Paris" Id="Romance Standard Time">
              <t:Periods>
                <t:Period Bias="-PT1H" Name="Standard" Id="trule:Microsoft/Registry/Romance Standard Time/1-Standard"/>
                <t:Period Bias="-PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Romance Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Romance Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Romance Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb" Id="Central European Standard Time">
              <t:Periods>
                <t:Period Bias="-PT1H" Name="Standard" Id="trule:Microsoft/Registry/Central European Standard Time/1-Standard"/>
                <t:Period Bias="-PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Central European Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central European Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central European Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+01:00) West Central Africa" Id="W. Central Africa Standard Time">
              <t:Periods>
                <t:Period Bias="-PT1H" Name="Standard" Id="trule:Microsoft/Registry/W. Central Africa Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Central Africa Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Windhoek" Id="Namibia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Namibia Standard Time/2010-Standard"/>
                <t:Period Bias="-PT1H" Name="Daylight" Id="trule:Microsoft/Registry/Namibia Standard Time/2010-Daylight"/>
                <t:Period Bias="-PT2H" Name="Daylight" Id="trule:Microsoft/Registry/Namibia Standard Time/2011-Daylight"/>
                <t:Period Bias="-PT1H" Name="Standard" Id="trule:Microsoft/Registry/Namibia Standard Time/2011-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Namibia Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Namibia Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Namibia Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Namibia Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Amman" Id="Jordan Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Jordan Standard Time/2006-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Jordan Standard Time/2006-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Jordan Standard Time/2007-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Jordan Standard Time/2007-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Jordan Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Jordan Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT1H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Jordan Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Jordan Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT1H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Athens, Bucharest, Istanbul" Id="GTB Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/GTB Standard Time/1-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/GTB Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/GTB Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/GTB Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT4H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Beirut" Id="Middle East Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2009-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2010-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2010-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2011-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2011-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2012-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2012-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2013-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2013-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2014-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2014-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2015-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2015-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2016-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2016-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2017-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2017-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2018-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2018-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2019-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2019-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2020-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2020-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Middle East Standard Time/2021-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Middle East Standard Time/2021-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2012-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2012-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2013-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2013-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2014-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2014-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2015-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2015-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="7">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2016-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2016-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="8">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2017-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2017-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="9">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2018-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2018-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="10">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2019-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2019-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="11">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2020-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2020-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="12">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2021-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Middle East Standard Time/2021-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2012-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2013-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2014-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2015-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">7</t:To>
                  <t:DateTime>2016-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">8</t:To>
                  <t:DateTime>2017-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">9</t:To>
                  <t:DateTime>2018-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">10</t:To>
                  <t:DateTime>2019-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">11</t:To>
                  <t:DateTime>2020-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">12</t:To>
                  <t:DateTime>2021-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Cairo" Id="Egypt Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Egypt Standard Time/2005-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Egypt Standard Time/2005-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Egypt Standard Time/2006-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Egypt Standard Time/2006-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Egypt Standard Time/2007-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Egypt Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Egypt Standard Time/2008-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Egypt Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Egypt Standard Time/2009-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Egypt Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Egypt Standard Time/2010-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Egypt Standard Time/2010-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Egypt Standard Time/2011-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Egypt Standard Time/2011-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2005-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2005-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>8</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>8</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Egypt Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2006-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Damascus" Id="Syria Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2006-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2006-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2007-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2008-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2009-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2010-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2010-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2011-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2011-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2012-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2012-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2013-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2013-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2014-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2014-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2015-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2015-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2016-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2016-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Syria Standard Time/2017-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Syria Standard Time/2017-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Wednesday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2012-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2012-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="7">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2013-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2013-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="8">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2014-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2014-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="9">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2015-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2015-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="10">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2016-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2016-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="11">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2017-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Syria Standard Time/2017-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2012-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">7</t:To>
                  <t:DateTime>2013-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">8</t:To>
                  <t:DateTime>2014-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">9</t:To>
                  <t:DateTime>2015-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">10</t:To>
                  <t:DateTime>2016-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">11</t:To>
                  <t:DateTime>2017-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Harare, Pretoria" Id="South Africa Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/South Africa Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/South Africa Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius" Id="FLE Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/FLE Standard Time/1-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/FLE Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/FLE Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/FLE Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT4H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Jerusalem" Id="Israel Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2004-Standard"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2005-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2005-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2006-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2006-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2007-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2008-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2009-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2010-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2010-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2011-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2011-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2012-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2012-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2013-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2013-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2014-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2014-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2015-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2015-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2016-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2016-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2017-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2017-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2018-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2018-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2019-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2019-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2020-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2020-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2021-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2021-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2022-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/Israel Standard Time/2022-Daylight"/>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/Israel Standard Time/2023-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2004-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2005-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2005-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="6">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="7">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2011-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2011-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="8">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2012-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2012-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="9">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2013-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2013-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="10">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2014-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2014-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="11">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2015-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2015-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="12">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2016-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2016-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="13">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2017-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2017-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="14">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2018-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2018-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="15">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2019-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2019-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="16">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2020-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2020-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="17">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2021-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2021-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="18">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2022-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2022-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="19">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Israel Standard Time/2023-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2005-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2006-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">6</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">7</t:To>
                  <t:DateTime>2011-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">8</t:To>
                  <t:DateTime>2012-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">9</t:To>
                  <t:DateTime>2013-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">10</t:To>
                  <t:DateTime>2014-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">11</t:To>
                  <t:DateTime>2015-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">12</t:To>
                  <t:DateTime>2016-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">13</t:To>
                  <t:DateTime>2017-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">14</t:To>
                  <t:DateTime>2018-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">15</t:To>
                  <t:DateTime>2019-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">16</t:To>
                  <t:DateTime>2020-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">17</t:To>
                  <t:DateTime>2021-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">18</t:To>
                  <t:DateTime>2022-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">19</t:To>
                  <t:DateTime>2023-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+02:00) Minsk" Id="E. Europe Standard Time">
              <t:Periods>
                <t:Period Bias="-PT2H" Name="Standard" Id="trule:Microsoft/Registry/E. Europe Standard Time/1-Standard"/>
                <t:Period Bias="-PT3H" Name="Daylight" Id="trule:Microsoft/Registry/E. Europe Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. Europe Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. Europe Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+03:00) Baghdad" Id="Arabic Standard Time">
              <t:Periods>
                <t:Period Bias="-PT3H" Name="Standard" Id="trule:Microsoft/Registry/Arabic Standard Time/2006-Standard"/>
                <t:Period Bias="-PT4H" Name="Daylight" Id="trule:Microsoft/Registry/Arabic Standard Time/2006-Daylight"/>
                <t:Period Bias="-PT3H" Name="Standard" Id="trule:Microsoft/Registry/Arabic Standard Time/2007-Standard"/>
                <t:Period Bias="-PT4H" Name="Daylight" Id="trule:Microsoft/Registry/Arabic Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT3H" Name="Standard" Id="trule:Microsoft/Registry/Arabic Standard Time/2008-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Arabic Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Arabic Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT4H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Arabic Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Arabic Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT4H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Monday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Arabic Standard Time/2008-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+03:00) Kuwait, Riyadh" Id="Arab Standard Time">
              <t:Periods>
                <t:Period Bias="-PT3H" Name="Standard" Id="trule:Microsoft/Registry/Arab Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Arab Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+03:00) Moscow, St. Petersburg, Volgograd" Id="Russian Standard Time">
              <t:Periods>
                <t:Period Bias="-PT3H" Name="Standard" Id="trule:Microsoft/Registry/Russian Standard Time/1-Standard"/>
                <t:Period Bias="-PT4H" Name="Daylight" Id="trule:Microsoft/Registry/Russian Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Russian Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Russian Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+03:00) Nairobi" Id="E. Africa Standard Time">
              <t:Periods>
                <t:Period Bias="-PT3H" Name="Standard" Id="trule:Microsoft/Registry/E. Africa Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. Africa Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+03:30) Tehran" Id="Iran Standard Time">
              <t:Periods>
                <t:Period Bias="-PT3H30M" Name="Standard" Id="trule:Microsoft/Registry/Iran Standard Time/2005-Standard"/>
                <t:Period Bias="-PT4H30M" Name="Daylight" Id="trule:Microsoft/Registry/Iran Standard Time/2005-Daylight"/>
                <t:Period Bias="-PT3H30M" Name="Standard" Id="trule:Microsoft/Registry/Iran Standard Time/2006-Standard"/>
                <t:Period Bias="-PT3H30M" Name="Standard" Id="trule:Microsoft/Registry/Iran Standard Time/2007-Standard"/>
                <t:Period Bias="-PT3H30M" Name="Standard" Id="trule:Microsoft/Registry/Iran Standard Time/2008-Standard"/>
                <t:Period Bias="-PT4H30M" Name="Daylight" Id="trule:Microsoft/Registry/Iran Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT3H30M" Name="Standard" Id="trule:Microsoft/Registry/Iran Standard Time/2009-Standard"/>
                <t:Period Bias="-PT4H30M" Name="Daylight" Id="trule:Microsoft/Registry/Iran Standard Time/2009-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Iran Standard Time/2005-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Iran Standard Time/2005-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Tuesday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Iran Standard Time/2006-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Iran Standard Time/2007-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Iran Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Iran Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Iran Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Iran Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Monday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2006-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+03:00) Tbilisi" Id="Georgian Standard Time">
              <t:Periods>
                <t:Period Bias="-PT4H" Name="Standard" Id="trule:Microsoft/Registry/Georgian Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Georgian Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+04:00) Abu Dhabi, Muscat" Id="Arabian Standard Time">
              <t:Periods>
                <t:Period Bias="-PT4H" Name="Standard" Id="trule:Microsoft/Registry/Arabian Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Arabian Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+04:00) Baku" Id="Azerbaijan Standard Time">
              <t:Periods>
                <t:Period Bias="-PT4H" Name="Standard" Id="trule:Microsoft/Registry/Azerbaijan Standard Time/1-Standard"/>
                <t:Period Bias="-PT5H" Name="Daylight" Id="trule:Microsoft/Registry/Azerbaijan Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Azerbaijan Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT4H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Azerbaijan Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT5H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+04:00) Port Louis" Id="Mauritius Standard Time">
              <t:Periods>
                <t:Period Bias="-PT4H" Name="Standard" Id="trule:Microsoft/Registry/Mauritius Standard Time/2007-Standard"/>
                <t:Period Bias="-PT5H" Name="Daylight" Id="trule:Microsoft/Registry/Mauritius Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT4H" Name="Standard" Id="trule:Microsoft/Registry/Mauritius Standard Time/2008-Standard"/>
                <t:Period Bias="-PT4H" Name="Standard" Id="trule:Microsoft/Registry/Mauritius Standard Time/2009-Standard"/>
                <t:Period Bias="-PT5H" Name="Daylight" Id="trule:Microsoft/Registry/Mauritius Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT4H" Name="Standard" Id="trule:Microsoft/Registry/Mauritius Standard Time/2010-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mauritius Standard Time/2007-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mauritius Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>1</t:Month>
                    <t:DayOfWeek>Tuesday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mauritius Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mauritius Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>1</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mauritius Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Mauritius Standard Time/2010-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+04:00) Yerevan" Id="Caucasus Standard Time">
              <t:Periods>
                <t:Period Bias="-PT4H" Name="Standard" Id="trule:Microsoft/Registry/Caucasus Standard Time/1-Standard"/>
                <t:Period Bias="-PT5H" Name="Daylight" Id="trule:Microsoft/Registry/Caucasus Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Caucasus Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Caucasus Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+04:30) Kabul" Id="Afghanistan Standard Time">
              <t:Periods>
                <t:Period Bias="-PT4H30M" Name="Standard" Id="trule:Microsoft/Registry/Afghanistan Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Afghanistan Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+05:00) Ekaterinburg" Id="Ekaterinburg Standard Time">
              <t:Periods>
                <t:Period Bias="-PT5H" Name="Standard" Id="trule:Microsoft/Registry/Ekaterinburg Standard Time/1-Standard"/>
                <t:Period Bias="-PT6H" Name="Daylight" Id="trule:Microsoft/Registry/Ekaterinburg Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Ekaterinburg Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Ekaterinburg Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+05:00) Islamabad, Karachi" Id="Pakistan Standard Time">
              <t:Periods>
                <t:Period Bias="-PT5H" Name="Standard" Id="trule:Microsoft/Registry/Pakistan Standard Time/2007-Standard"/>
                <t:Period Bias="-PT5H" Name="Standard" Id="trule:Microsoft/Registry/Pakistan Standard Time/2008-Standard"/>
                <t:Period Bias="-PT6H" Name="Daylight" Id="trule:Microsoft/Registry/Pakistan Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT5H" Name="Standard" Id="trule:Microsoft/Registry/Pakistan Standard Time/2009-Standard"/>
                <t:Period Bias="-PT6H" Name="Daylight" Id="trule:Microsoft/Registry/Pakistan Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT5H" Name="Standard" Id="trule:Microsoft/Registry/Pakistan Standard Time/2010-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pakistan Standard Time/2007-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pakistan Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>5</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pakistan Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pakistan Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Tuesday</t:DayOfWeek>
                    <t:Occurrence>2</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pakistan Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M59.999S</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Saturday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Pakistan Standard Time/2010-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+05:00) Tashkent" Id="West Asia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT5H" Name="Standard" Id="trule:Microsoft/Registry/West Asia Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/West Asia Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi" Id="India Standard Time">
              <t:Periods>
                <t:Period Bias="-PT5H30M" Name="Standard" Id="trule:Microsoft/Registry/India Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/India Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+05:30) Sri Jayawardenepura" Id="Sri Lanka Standard Time">
              <t:Periods>
                <t:Period Bias="-PT5H30M" Name="Standard" Id="trule:Microsoft/Registry/Sri Lanka Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Sri Lanka Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+05:45) Kathmandu" Id="Nepal Standard Time">
              <t:Periods>
                <t:Period Bias="-PT5H45M" Name="Standard" Id="trule:Microsoft/Registry/Nepal Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Nepal Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+06:00) Almaty, Novosibirsk" Id="N. Central Asia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT6H" Name="Standard" Id="trule:Microsoft/Registry/N. Central Asia Standard Time/1-Standard"/>
                <t:Period Bias="-PT7H" Name="Daylight" Id="trule:Microsoft/Registry/N. Central Asia Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/N. Central Asia Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/N. Central Asia Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+06:00) Astana" Id="Central Asia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT6H" Name="Standard" Id="trule:Microsoft/Registry/Central Asia Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Asia Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+06:00) Dhaka" Id="Bangladesh Standard Time">
              <t:Periods>
                <t:Period Bias="-PT6H" Name="Standard" Id="trule:Microsoft/Registry/Bangladesh Standard Time/2008-Standard"/>
                <t:Period Bias="-PT6H" Name="Standard" Id="trule:Microsoft/Registry/Bangladesh Standard Time/2009-Standard"/>
                <t:Period Bias="-PT7H" Name="Daylight" Id="trule:Microsoft/Registry/Bangladesh Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT6H" Name="Standard" Id="trule:Microsoft/Registry/Bangladesh Standard Time/2010-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Bangladesh Standard Time/2008-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Bangladesh Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT23H</t:TimeOffset>
                    <t:Month>6</t:Month>
                    <t:DayOfWeek>Friday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Bangladesh Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT23H59M</t:TimeOffset>
                    <t:Month>12</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Bangladesh Standard Time/2010-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+06:30) Yangon (Rangoon)" Id="Myanmar Standard Time">
              <t:Periods>
                <t:Period Bias="-PT6H30M" Name="Standard" Id="trule:Microsoft/Registry/Myanmar Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Myanmar Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+07:00) Bangkok, Hanoi, Jakarta" Id="SE Asia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT7H" Name="Standard" Id="trule:Microsoft/Registry/SE Asia Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/SE Asia Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+07:00) Krasnoyarsk" Id="North Asia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT7H" Name="Standard" Id="trule:Microsoft/Registry/North Asia Standard Time/1-Standard"/>
                <t:Period Bias="-PT8H" Name="Daylight" Id="trule:Microsoft/Registry/North Asia Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/North Asia Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/North Asia Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi" Id="China Standard Time">
              <t:Periods>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/China Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/China Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+08:00) Irkutsk, Ulaan Bataar" Id="North Asia East Standard Time">
              <t:Periods>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/North Asia East Standard Time/1-Standard"/>
                <t:Period Bias="-PT9H" Name="Daylight" Id="trule:Microsoft/Registry/North Asia East Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/North Asia East Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/North Asia East Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+08:00) Kuala Lumpur, Singapore" Id="Singapore Standard Time">
              <t:Periods>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/Singapore Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Singapore Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+08:00) Perth" Id="W. Australia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/W. Australia Standard Time/2005-Standard"/>
                <t:Period Bias="-PT9H" Name="Daylight" Id="trule:Microsoft/Registry/W. Australia Standard Time/2006-Daylight"/>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/W. Australia Standard Time/2006-Standard"/>
                <t:Period Bias="-PT9H" Name="Daylight" Id="trule:Microsoft/Registry/W. Australia Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/W. Australia Standard Time/2007-Standard"/>
                <t:Period Bias="-PT9H" Name="Daylight" Id="trule:Microsoft/Registry/W. Australia Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/W. Australia Standard Time/2008-Standard"/>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/W. Australia Standard Time/2009-Standard"/>
                <t:Period Bias="-PT9H" Name="Daylight" Id="trule:Microsoft/Registry/W. Australia Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/W. Australia Standard Time/2010-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2005-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>1</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>12</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="3">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="4">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>1</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="5">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/W. Australia Standard Time/2010-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2006-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">3</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">4</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">5</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+08:00) Taipei" Id="Taipei Standard Time">
              <t:Periods>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/Taipei Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Taipei Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+08:00) Ulaanbaatar" Id="Ulaanbaatar Standard Time">
              <t:Periods>
                <t:Period Bias="-PT8H" Name="Standard" Id="trule:Microsoft/Registry/Ulaanbaatar Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Ulaanbaatar Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+09:00) Osaka, Sapporo, Tokyo" Id="Tokyo Standard Time">
              <t:Periods>
                <t:Period Bias="-PT9H" Name="Standard" Id="trule:Microsoft/Registry/Tokyo Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Tokyo Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+09:00) Seoul" Id="Korea Standard Time">
              <t:Periods>
                <t:Period Bias="-PT9H" Name="Standard" Id="trule:Microsoft/Registry/Korea Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Korea Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+09:00) Yakutsk" Id="Yakutsk Standard Time">
              <t:Periods>
                <t:Period Bias="-PT9H" Name="Standard" Id="trule:Microsoft/Registry/Yakutsk Standard Time/1-Standard"/>
                <t:Period Bias="-PT10H" Name="Daylight" Id="trule:Microsoft/Registry/Yakutsk Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Yakutsk Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Yakutsk Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+09:30) Adelaide" Id="Cen. Australia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT10H30M" Name="Daylight" Id="trule:Microsoft/Registry/Cen. Australia Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT9H30M" Name="Standard" Id="trule:Microsoft/Registry/Cen. Australia Standard Time/2007-Standard"/>
                <t:Period Bias="-PT10H30M" Name="Daylight" Id="trule:Microsoft/Registry/Cen. Australia Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT9H30M" Name="Standard" Id="trule:Microsoft/Registry/Cen. Australia Standard Time/2008-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Cen. Australia Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Cen. Australia Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Cen. Australia Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Cen. Australia Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+09:30) Darwin" Id="AUS Central Standard Time">
              <t:Periods>
                <t:Period Bias="-PT9H30M" Name="Standard" Id="trule:Microsoft/Registry/AUS Central Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/AUS Central Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+10:00) Brisbane" Id="E. Australia Standard Time">
              <t:Periods>
                <t:Period Bias="-PT10H" Name="Standard" Id="trule:Microsoft/Registry/E. Australia Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/E. Australia Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+10:00) Canberra, Melbourne, Sydney" Id="AUS Eastern Standard Time">
              <t:Periods>
                <t:Period Bias="-PT11H" Name="Daylight" Id="trule:Microsoft/Registry/AUS Eastern Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT10H" Name="Standard" Id="trule:Microsoft/Registry/AUS Eastern Standard Time/2007-Standard"/>
                <t:Period Bias="-PT11H" Name="Daylight" Id="trule:Microsoft/Registry/AUS Eastern Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT10H" Name="Standard" Id="trule:Microsoft/Registry/AUS Eastern Standard Time/2008-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/AUS Eastern Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/AUS Eastern Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/AUS Eastern Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/AUS Eastern Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+10:00) Guam, Port Moresby" Id="West Pacific Standard Time">
              <t:Periods>
                <t:Period Bias="-PT10H" Name="Standard" Id="trule:Microsoft/Registry/West Pacific Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/West Pacific Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+10:00) Hobart" Id="Tasmania Standard Time">
              <t:Periods>
                <t:Period Bias="-PT11H" Name="Daylight" Id="trule:Microsoft/Registry/Tasmania Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT10H" Name="Standard" Id="trule:Microsoft/Registry/Tasmania Standard Time/2007-Standard"/>
                <t:Period Bias="-PT11H" Name="Daylight" Id="trule:Microsoft/Registry/Tasmania Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT10H" Name="Standard" Id="trule:Microsoft/Registry/Tasmania Standard Time/2008-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Tasmania Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Tasmania Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Tasmania Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Tasmania Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+10:00) Vladivostok" Id="Vladivostok Standard Time">
              <t:Periods>
                <t:Period Bias="-PT10H" Name="Standard" Id="trule:Microsoft/Registry/Vladivostok Standard Time/1-Standard"/>
                <t:Period Bias="-PT11H" Name="Daylight" Id="trule:Microsoft/Registry/Vladivostok Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Vladivostok Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Vladivostok Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+11:00) Magadan" Id="Magadan Standard Time">
              <t:Periods>
                <t:Period Bias="-PT11H" Name="Standard" Id="trule:Microsoft/Registry/Magadan Standard Time/1-Standard"/>
                <t:Period Bias="-PT12H" Name="Daylight" Id="trule:Microsoft/Registry/Magadan Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Magadan Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Magadan Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+11:00) Magadan, Solomon Is., New Caledonia" Id="Central Pacific Standard Time">
              <t:Periods>
                <t:Period Bias="-PT11H" Name="Standard" Id="trule:Microsoft/Registry/Central Pacific Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Central Pacific Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+12:00) Auckland, Wellington" Id="New Zealand Standard Time">
              <t:Periods>
                <t:Period Bias="-PT13H" Name="Daylight" Id="trule:Microsoft/Registry/New Zealand Standard Time/2006-Daylight"/>
                <t:Period Bias="-PT12H" Name="Standard" Id="trule:Microsoft/Registry/New Zealand Standard Time/2006-Standard"/>
                <t:Period Bias="-PT13H" Name="Daylight" Id="trule:Microsoft/Registry/New Zealand Standard Time/2007-Daylight"/>
                <t:Period Bias="-PT12H" Name="Standard" Id="trule:Microsoft/Registry/New Zealand Standard Time/2007-Standard"/>
                <t:Period Bias="-PT13H" Name="Daylight" Id="trule:Microsoft/Registry/New Zealand Standard Time/2008-Daylight"/>
                <t:Period Bias="-PT12H" Name="Standard" Id="trule:Microsoft/Registry/New Zealand Standard Time/2008-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/New Zealand Standard Time/2006-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/New Zealand Standard Time/2006-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/New Zealand Standard Time/2007-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>3</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/New Zealand Standard Time/2007-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/New Zealand Standard Time/2008-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>4</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/New Zealand Standard Time/2008-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>9</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2007-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2008-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+12:00) Coordinated Universal Time+12" Id="UTC+12">
              <t:Periods>
                <t:Period Bias="-PT12H" Name="Standard" Id="trule:Microsoft/Registry/UTC+12/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/UTC+12/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+12:00) Fiji, Marshall Is." Id="Fiji Standard Time">
              <t:Periods>
                <t:Period Bias="-PT12H" Name="Standard" Id="trule:Microsoft/Registry/Fiji Standard Time/2008-Standard"/>
                <t:Period Bias="-PT13H" Name="Daylight" Id="trule:Microsoft/Registry/Fiji Standard Time/2009-Daylight"/>
                <t:Period Bias="-PT12H" Name="Standard" Id="trule:Microsoft/Registry/Fiji Standard Time/2009-Standard"/>
                <t:Period Bias="-PT13H" Name="Daylight" Id="trule:Microsoft/Registry/Fiji Standard Time/2010-Daylight"/>
                <t:Period Bias="-PT12H" Name="Standard" Id="trule:Microsoft/Registry/Fiji Standard Time/2010-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Fiji Standard Time/2008-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="1">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Fiji Standard Time/2009-Standard</t:To>
                    <t:TimeOffset>PT0H</t:TimeOffset>
                    <t:Month>1</t:Month>
                    <t:DayOfWeek>Thursday</t:DayOfWeek>
                    <t:Occurrence>1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Fiji Standard Time/2009-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>11</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
                <t:TransitionsGroup Id="2">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Fiji Standard Time/2010-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Fiji Standard Time/2010-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>4</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">1</t:To>
                  <t:DateTime>2009-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
                <t:AbsoluteDateTransition>
                  <t:To Kind="Group">2</t:To>
                  <t:DateTime>2010-01-01T00:00:00</t:DateTime>
                </t:AbsoluteDateTransition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+12:00) Petropavlovsk-Kamchatsky" Id="Kamchatka Standard Time">
              <t:Periods>
                <t:Period Bias="-PT12H" Name="Standard" Id="trule:Microsoft/Registry/Kamchatka Standard Time/1-Standard"/>
                <t:Period Bias="-PT13H" Name="Daylight" Id="trule:Microsoft/Registry/Kamchatka Standard Time/1-Daylight"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Kamchatka Standard Time/1-Daylight</t:To>
                    <t:TimeOffset>PT2H</t:TimeOffset>
                    <t:Month>3</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                  <t:RecurringDayTransition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Kamchatka Standard Time/1-Standard</t:To>
                    <t:TimeOffset>PT3H</t:TimeOffset>
                    <t:Month>10</t:Month>
                    <t:DayOfWeek>Sunday</t:DayOfWeek>
                    <t:Occurrence>-1</t:Occurrence>
                  </t:RecurringDayTransition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
            <t:TimeZoneDefinition Name="(UTC+13:00) Nuku'alofa" Id="Tonga Standard Time">
              <t:Periods>
                <t:Period Bias="-PT13H" Name="Standard" Id="trule:Microsoft/Registry/Tonga Standard Time/1-Standard"/>
              </t:Periods>
              <t:TransitionsGroups>
                <t:TransitionsGroup Id="0">
                  <t:Transition>
                    <t:To Kind="Period">trule:Microsoft/Registry/Tonga Standard Time/1-Standard</t:To>
                  </t:Transition>
                </t:TransitionsGroup>
              </t:TransitionsGroups>
              <t:Transitions>
                <t:Transition>
                  <t:To Kind="Group">0</t:To>
                </t:Transition>
              </t:Transitions>
            </t:TimeZoneDefinition>
          </m:TimeZoneDefinitions>
        </m:GetServerTimeZonesResponseMessage>
      </m:ResponseMessages>
    </m:GetServerTimeZonesResponse>
  </s:Body>
</s:Envelope>;
