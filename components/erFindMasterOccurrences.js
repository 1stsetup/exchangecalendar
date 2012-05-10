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

var Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://calendar/modules/calAlarmUtils.jsm");
Cu.import("resource://calendar/modules/calProviderUtils.jsm");
Cu.import("resource://calendar/modules/calAuthUtils.jsm");

Cu.import("resource://1st-setup/ecFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/soapFunctions.js");

var EXPORTED_SYMBOLS = ["erFindMasterOccurrencesRequest"];

const MAPI_PidLidTaskAccepted = "33032";
const MAPI_PidLidTaskLastUpdate = "33045";
const MAPI_PidLidTaskHistory = "33050";
const MAPI_PidLidTaskOwnership = "33065";
const MAPI_PidLidTaskMode = "34072";
const MAPI_PidLidTaskGlobalId = "34073";
const MAPI_PidLidTaskAcceptanceState = "33066";
const MAPI_PidLidReminderSignalTime = "34144";
const MAPI_PidLidReminderSet = "34051";
const MAPI_PidLidReminderDelta = "34049";

function erFindMasterOccurrencesRequest(aArgument, aCbOk, aCbError, aListener)
{
	this.mCbOk = aCbOk;
	this.mCbError = aCbError;

	var self = this;

	this.parent = new ExchangeRequest(aArgument, 
		function(aExchangeRequest, aResp) { self.onSendOk(aExchangeRequest, aResp);},
		function(aExchangeRequest, aCode, aMsg) { self.onSendError(aExchangeRequest, aCode, aMsg);},
		aListener);

	this.argument = aArgument;
	this.serverUrl = aArgument.serverUrl;
	this.listener = aListener;
	this.occurrences = aArgument.occurrences;

	this.folderClass = aArgument.folderClass;

	this.isRunning = true;
	this.execute();
}

erFindMasterOccurrencesRequest.prototype = {

	execute: function _execute()
	{
//		exchWebService.commonFunctions.LOG("erFindMasterOccurrencesRequest.execute\n");

		var req = <nsMessages:GetItem xmlns:nsMessages={nsMessages} xmlns:nsTypes={nsTypes}/>;

//		req.nsMessages::ItemShape.nsTypes::BaseShape = "AllProperties";
		req.nsMessages::ItemShape.nsTypes::BaseShape = "IdOnly";
		req.nsMessages::ItemShape.nsTypes::BodyType = 'Text';

		req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content = <>
				<nsTypes:FieldURI FieldURI="item:ItemId" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:ParentFolderId" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:ItemClass" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:Attachments" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:Subject" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:DateTimeReceived" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:Size" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:Categories" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:HasAttachments" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:Importance" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:IsDraft" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:IsFromMe" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:IsResend" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:IsSubmitted" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:IsUnmodified" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:DateTimeSent" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:DateTimeCreated" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:Body" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:ResponseObjects" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:Sensitivity" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:ReminderDueBy" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:ReminderIsSet" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="item:ReminderMinutesBeforeStart" xmlns:nsTypes={nsTypes}/>
			    </>;

		req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
		    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId={MAPI_PidLidReminderSignalTime} PropertyType="SystemTime" xmlns:nsTypes={nsTypes}/>
		    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId={MAPI_PidLidReminderSet} PropertyType="Boolean" xmlns:nsTypes={nsTypes}/>
		    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId={MAPI_PidLidReminderDelta} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
		    </>;

			// Calendar fields
		switch (this.folderClass) {
		case "IPF.Appointment":
			req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
				<nsTypes:FieldURI FieldURI="calendar:Start" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:End" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:OriginalStart" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:IsAllDayEvent" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:LegacyFreeBusyStatus" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:Location" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:When" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:IsMeeting" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:IsCancelled" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:IsRecurring" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:MeetingRequestWasSent" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:IsResponseRequested" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:CalendarItemType" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:MyResponseType" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:Organizer" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:RequiredAttendees" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:OptionalAttendees" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:Resources" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:Duration" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:TimeZone" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:Recurrence" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:ConferenceType" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:AllowNewTimeProposal" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:IsOnlineMeeting" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:MeetingWorkspaceUrl" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:UID" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="calendar:RecurrenceId" xmlns:nsTypes={nsTypes}/>
				</>;
				if (this.argument.ServerVersion.indexOf("Exchange2010") == 0) {
//				if ((this.argument.ServerVersion == "Exchange2010_SP1") || (this.argument.ServerVersion == "Exchange2010_SP2")) {
					req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
						<nsTypes:FieldURI FieldURI="calendar:StartTimeZone" xmlns:nsTypes={nsTypes}/>
						<nsTypes:FieldURI FieldURI="calendar:EndTimeZone" xmlns:nsTypes={nsTypes}/>
						</>;
				}
				else { // Exchange2007
					req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
						<nsTypes:FieldURI FieldURI="calendar:MeetingTimeZone" xmlns:nsTypes={nsTypes}/>
						</>;
				}
			break;	

		case "IPF.Task":
			//Task fields
			req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
				<nsTypes:FieldURI FieldURI="task:ActualWork" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:AssignedTime" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:BillingInformation" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:ChangeCount" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:Companies" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:CompleteDate" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:Contacts" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:DelegationState" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:Delegator" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:DueDate" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:IsAssignmentEditable" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:IsComplete" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:IsRecurring" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:IsTeamTask" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:Mileage" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:Owner" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:PercentComplete" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:Recurrence" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:StartDate" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:Status" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:StatusDescription" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="task:TotalWork" xmlns:nsTypes={nsTypes}/>
				</>;

			req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskAccepted} PropertyType="Boolean" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskLastUpdate} PropertyType="SystemTime" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskAcceptanceState} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskMode} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskGlobalId} PropertyType="Binary" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskHistory} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskOwnership} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
			    </>;
		}
/*
			//meeting fields
			req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
				<nsTypes:FieldURI FieldURI="meeting:AssociatedCalendarItemId" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="meeting:IsDelegated" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="meeting:IsOutOfDate" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="meeting:HasBeenProcessed" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="meeting:ResponseType" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="meetingRequest:MeetingRequestType" xmlns:nsTypes={nsTypes}/>
				<nsTypes:FieldURI FieldURI="meetingRequest:IntendedFreeBusyStatus" xmlns:nsTypes={nsTypes}/>
				</>;
*/

/*		if (this.argument.GUID) {
			req.nsMessages::ItemShape.nsTypes::AdditionalProperties.content += <>
			    	<nsTypes:ExtendedFieldURI PropertySetId={this.argument.GUID} PropertyName="alarmLastAck" PropertyType="SystemTime" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI PropertySetId={this.argument.GUID} PropertyName="lastLightningModified" PropertyType="SystemTime" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId={MAPI_PidLidReminderSignalTime} PropertyType="SystemTime" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId={MAPI_PidLidReminderSet} PropertyType="Boolean" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Common" PropertyId={MAPI_PidLidReminderDelta} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskAccepted} PropertyType="Boolean" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskLastUpdate} PropertyType="SystemTime" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskAcceptanceState} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskMode} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskGlobalId} PropertyType="Binary" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskHistory} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>
			    	<nsTypes:ExtendedFieldURI DistinguishedPropertySetId="Task" PropertyId={MAPI_PidLidTaskOwnership} PropertyType="Integer" xmlns:nsTypes={nsTypes}/>

			    </>;
		}
*/

		var itemids = <nsMessages:ItemIds xmlns:nsMessages={nsMessages}/>;

		for each (var master in this.occurrences) {
			itemids.nsTypes::RecurringMasterItemId += <nsTypes:RecurringMasterItemId OccurrenceId={master.Id} ChangeKey={master.ChangeKey} xmlns:nsTypes={nsTypes} />;
		}

		req.appendChild(itemids);

                this.parent.sendRequest(this.parent.makeSoapMessage(req), this.serverUrl);
	},

	onSendOk: function _onSendOk(aExchangeRequest, aResp)
	{
//		exchWebService.commonFunctions.LOG("erFindMasterOccurrencesRequest.onSendOk>"+String(aResp)+"\n");

		var items = [];
		for each (var e in aResp..nsMessages::GetItemResponseMessage) {
			var responseCode = e.nsMessages::ResponseCode.toString();

			if (responseCode == "NoError") {
				var calendarItem = e.nsMessages::Items.nsTypes::CalendarItem; 
				items.push(calendarItem);
			}

		}
		
		if (this.mCbOk) {
			this.mCbOk(this, items);
		}
		this.isRunning = false;
	},

	onSendError: function _onSendError(aExchangeRequest, aCode, aMsg)
	{
		this.isRunning = false;
		if (this.mCbError) {
			this.mCbError(this, aCode, aMsg);
		}
	},
};


