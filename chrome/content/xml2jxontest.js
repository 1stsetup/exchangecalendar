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
var Cu = Components.utils;
var Ci = Components.interfaces;
var Cc = Components.classes;

Cu.import("resource://interfaces/xml2jxon/mivIxml2jxon.js");

function testObject()
{
}

testObject.prototype = {
	toString: function _toString()
	{
		return "testObject";
	},
}

function exchXML2JXonTestDialog(aDocument, aWindow)
{
	this._document = aDocument;
	this._window = aWindow;

	this.items = [];
}


const xmltest1 = '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Header><h:ServerVersionInfo MajorVersion="14" MinorVersion="3" MajorBuildNumber="123" MinorBuildNumber="3" Version="Exchange2010_SP2" xmlns:h="http://schemas.microsoft.com/exchange/services/2006/types" xmlns="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"/></s:Header><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><m:GetItemResponse xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"><m:ResponseMessages><m:GetItemResponseMessage ResponseClass="Success"><m:ResponseCode>NoError</m:ResponseCode><m:Items><t:CalendarItem><t:ItemId Id="AAMkAGQ4OGYyYzE0LTYxY2MtNDhjYi05OTIwLWIzNGExOWZhMTk3ZgBGAAAAAAD5LnbPSb6/ToYGr5bAhK5eBwBCkOY/jjhKQ7mo2IjGzUWvAAAAEiTFAABCkOY/jjhKQ7mo2IjGzUWvAAAAEnegAAA=" ChangeKey="DwAAABYAAABCkOY/jjhKQ7mo2IjGzUWvAAAAEq4d"/><t:ParentFolderId Id="AAMkAGQ4OGYyYzE0LTYxY2MtNDhjYi05OTIwLWIzNGExOWZhMTk3ZgAuAAAAAAD5LnbPSb6/ToYGr5bAhK5eAQBCkOY/jjhKQ7mo2IjGzUWvAAAAEiTFAAA=" ChangeKey="AQAAAA=="/><t:ItemClass>IPM.Appointment</t:ItemClass><t:Subject>test5 (15min)</t:Subject><t:Sensitivity>Normal</t:Sensitivity><t:Body BodyType="Text"/><t:DateTimeReceived>2013-05-19T17:16:37+02:00</t:DateTimeReceived><t:Size>3867</t:Size><t:Importance>Normal</t:Importance><t:IsSubmitted>false</t:IsSubmitted><t:IsDraft>false</t:IsDraft><t:IsFromMe>false</t:IsFromMe><t:IsResend>false</t:IsResend><t:IsUnmodified>false</t:IsUnmodified><t:DateTimeSent>2013-05-19T17:16:37+02:00</t:DateTimeSent><t:DateTimeCreated>2013-05-19T17:16:36+02:00</t:DateTimeCreated><t:ResponseObjects><t:CancelCalendarItem/><t:ForwardItem/></t:ResponseObjects><t:ReminderDueBy>2013-05-20T18:00:00+02:00</t:ReminderDueBy><t:ReminderIsSet>true</t:ReminderIsSet><t:ReminderMinutesBeforeStart>15</t:ReminderMinutesBeforeStart><t:HasAttachments>false</t:HasAttachments><t:ExtendedProperty><t:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId="34144" PropertyType="SystemTime"/><t:Value>2013-05-20T17:45:00+02:00</t:Value></t:ExtendedProperty><t:ExtendedProperty><t:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId="34051" PropertyType="Boolean"/><t:Value>true</t:Value></t:ExtendedProperty><t:ExtendedProperty><t:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId="34049" PropertyType="Integer"/><t:Value>15</t:Value></t:ExtendedProperty><t:EffectiveRights><t:CreateAssociated>false</t:CreateAssociated><t:CreateContents>false</t:CreateContents><t:CreateHierarchy>false</t:CreateHierarchy><t:Delete>true</t:Delete><t:Modify>true</t:Modify><t:Read>true</t:Read><t:ViewPrivateItems>true</t:ViewPrivateItems></t:EffectiveRights><t:UID>040000008200E00074C5B7101A82E008000000001BCFE1DAA354CE01000000000000000010000000A7F20CAF2EF2DA4D8870306202531473</t:UID><t:Start>2013-05-19T18:00:00+02:00</t:Start><t:End>2013-05-19T19:00:00+02:00</t:End><t:IsAllDayEvent>false</t:IsAllDayEvent><t:LegacyFreeBusyStatus>Busy</t:LegacyFreeBusyStatus><t:Location/><t:IsMeeting>true</t:IsMeeting><t:IsCancelled>false</t:IsCancelled><t:IsRecurring>false</t:IsRecurring><t:MeetingRequestWasSent>false</t:MeetingRequestWasSent><t:IsResponseRequested>true</t:IsResponseRequested><t:CalendarItemType>RecurringMaster</t:CalendarItemType><t:MyResponseType>Organizer</t:MyResponseType><t:Organizer><t:Mailbox><t:Name>alarm test</t:Name><t:EmailAddress>alarmtest@example.com</t:EmailAddress><t:RoutingType>SMTP</t:RoutingType><t:MailboxType>Mailbox</t:MailboxType></t:Mailbox></t:Organizer><t:Duration>PT1H</t:Duration><t:TimeZone>(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna</t:TimeZone><t:Recurrence><t:DailyRecurrence><t:Interval>1</t:Interval></t:DailyRecurrence><t:NumberedRecurrence><t:StartDate>2013-05-19+02:00</t:StartDate><t:NumberOfOccurrences>3</t:NumberOfOccurrences></t:NumberedRecurrence></t:Recurrence><t:StartTimeZone Name="(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna" Id="W. Europe Standard Time"><t:Periods><t:Period Bias="-PT1H" Name="Standard" Id="trule:Microsoft/Registry/W. Europe Standard Time/1-Standard"/><t:Period Bias="-PT2H" Name="Daylight" Id="trule:Microsoft/Registry/W. Europe Standard Time/1-Daylight"/></t:Periods><t:TransitionsGroups><t:TransitionsGroup Id="0"><t:RecurringDayTransition><t:To Kind="Period">trule:Microsoft/Registry/W. Europe Standard Time/1-Daylight</t:To><t:TimeOffset>PT2H</t:TimeOffset><t:Month>3</t:Month><t:DayOfWeek>Sunday</t:DayOfWeek><t:Occurrence>-1</t:Occurrence></t:RecurringDayTransition><t:RecurringDayTransition><t:To Kind="Period">trule:Microsoft/Registry/W. Europe Standard Time/1-Standard</t:To><t:TimeOffset>PT3H</t:TimeOffset><t:Month>10</t:Month><t:DayOfWeek>Sunday</t:DayOfWeek><t:Occurrence>-1</t:Occurrence></t:RecurringDayTransition></t:TransitionsGroup></t:TransitionsGroups><t:Transitions><t:Transition><t:To Kind="Group">0</t:To></t:Transition></t:Transitions></t:StartTimeZone><t:EndTimeZone Name="(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna" Id="W. Europe Standard Time"><t:Periods><t:Period Bias="-PT1H" Name="Standard" Id="trule:Microsoft/Registry/W. Europe Standard Time/1-Standard"/><t:Period Bias="-PT2H" Name="Daylight" Id="trule:Microsoft/Registry/W. Europe Standard Time/1-Daylight"/></t:Periods><t:TransitionsGroups><t:TransitionsGroup Id="0"><t:RecurringDayTransition><t:To Kind="Period">trule:Microsoft/Registry/W. Europe Standard Time/1-Daylight</t:To><t:TimeOffset>PT2H</t:TimeOffset><t:Month>3</t:Month><t:DayOfWeek>Sunday</t:DayOfWeek><t:Occurrence>-1</t:Occurrence></t:RecurringDayTransition><t:RecurringDayTransition><t:To Kind="Period">trule:Microsoft/Registry/W. Europe Standard Time/1-Standard</t:To><t:TimeOffset>PT3H</t:TimeOffset><t:Month>10</t:Month><t:DayOfWeek>Sunday</t:DayOfWeek><t:Occurrence>-1</t:Occurrence></t:RecurringDayTransition></t:TransitionsGroup></t:TransitionsGroups><t:Transitions><t:Transition><t:To Kind="Group">0</t:To></t:Transition></t:Transitions></t:EndTimeZone></t:CalendarItem></m:Items></m:GetItemResponseMessage></m:ResponseMessages></m:GetItemResponse></s:Body></s:Envelope>';

exchXML2JXonTestDialog.prototype = {

	onStart: function _onStart()
	{
		this._document.getElementById("xml2jxon_test_result_label").value = "Start generating memory.";
		for (var i=0; i< 30000; i++) {
//			var xmlDoc = new testObject();
//			var xmlDoc = Cc["@1st-setup.nl/conversion/xml2jxon;1"]
//				.createInstance(Ci.mivIxml2jxon);
			var xmlDoc = new mivIxml2jxon('', 0, null);
//			xmlDoc.processXMLString('<test><pasta naam="Jantje">hallo</pasta></test>', 0, null);
//			xmlDoc.processXMLString(xmltest1, 0, null);
			//xmlDoc.processXMLString('', 0, null);
			this.items.push(xmlDoc);
		}
			dump("..done..\n");
		this._document.getElementById("xml2jxon_test_result_label").value = "Done generating memory.";
	},

	onLoad: function _onLoad()
	{
	},

	onClear: function _onClear()
	{
		while (this.items.length > 0) {
			var xmlDoc = this.items.pop();
			dump(" Removing:"+xmlDoc.toString()+"\n");
			xmlDoc = null;
		}
		this._document.getElementById("xml2jxon_test_result_label").value = "Cleared memory.";
	},
	onClose: function _onClose()
	{
		this.onClear();
		return true;
	},
}

var tmpXML2JXonTestDialog = new exchXML2JXonTestDialog(document, window);
window.addEventListener("load", function () { window.removeEventListener("load",arguments.callee,true); tmpXML2JXonTestDialog.onLoad(); }, true);

