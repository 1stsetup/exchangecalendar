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

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;


//Cu.import("resource://calendar/modules/calUtils.jsm");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/ecFunctions.js");

if (! exchWebService) var exchWebService = {};

function exchWebService_permissionsPropertiesView(aProperties) {

	this.properties = aProperties;
				
};

exchWebService_permissionsPropertiesView.prototype = {

  treeBox: null,  
  
  get rowCount()                     { return this.properties.length; },  
  setTree: function(treeBox)         { this.treeBox = treeBox; },  

	getCellText: function(idx, column) 
	{
		switch (column.id) {
			case "exchWebService_permissonTree_userId":
				if (this.properties[idx].UserId) {
					if (this.properties[idx].UserId.DistinguishedUser) {
						return this.properties[idx].UserId.DistinguishedUser;
					}
					if (this.properties[idx].UserId.DisplayName) {
						return this.properties[idx].UserId.DisplayName;
					}
				}

				return "Unknown";

				break;
			case "exchWebService_permissonTree_email":
				if (this.properties[idx].UserId) {
					if (this.properties[idx].UserId.PrimarySmtpAddress) {
						return this.properties[idx].UserId.PrimarySmtpAddress;
					}
				}

				return "";

				break;
		}
	},  

  isContainer: function(idx)         { return false; },  
  isContainerOpen: function(idx)     { return false; },  
  isContainerEmpty: function(idx)    { return false; },  
  isSeparator: function(idx)         { return false; },  
  isSorted: function()               { return false; },  
  isEditable: function(idx, column)  { return false; },  
  
	getParentIndex: function _getParentIndex(idx)
	{
		return -1;
	},  

	getLevel: function _getLevel(idx) 
	{
		return 0;
	},  

	hasNextSibling: function _hasNextSibling(idx, after)
	{
		if (idx < this.properties.length - 1) return true;

		return false;  
	}, 
 
	openFolder: function(idx) 
	{
	},

	toggleOpenState: function _toggleOpenState(idx) 
	{
	},  
  
	getImageSrc: function(idx, column) 
	{
	},
  
  getProgressMode : function(idx,column) {},  
  getCellValue: function(idx, column) {},  
  cycleHeader: function(col, elem) {},  
  selectionChanged: function() {},  
  cycleCell: function(idx, column) {},  
  performAction: function(action) {},  
  performActionOnCell: function(action, index, column) {},  
  getRowProperties: function(idx, prop) {},  
  getCellProperties: function(idx, column, prop) {},  
  getColumnProperties: function(column, element, prop) {}, 

	getPermissions: function _getPermissions(aIndex)
	{
		return this.properties[aIndex];
	}, 

};

exchWebService.exchangeSettings = {

	permissionsPropertiesTreeView: null,

	doOnSelectUserId: function _doOnSelectUserId(aTree)
	{
		var treeIndex = aTree.currentIndex;

		var permissions = this.permissionsPropertiesTreeView.getPermissions(treeIndex);

		if (permissions) {
			document.getElementById("exchWebServices-UserId-EffectiveRights-CanCreateItems").value = permissions.CanCreateItems;
			document.getElementById("exchWebServices-UserId-EffectiveRights-CanCreateSubFolders").value = permissions.CanCreateSubFolders;
			document.getElementById("exchWebServices-UserId-EffectiveRights-IsFolderOwner").value = permissions.IsFolderOwner;
			document.getElementById("exchWebServices-UserId-EffectiveRights-IsFolderVisible").value = permissions.IsFolderVisible;
			document.getElementById("exchWebServices-UserId-EffectiveRights-IsFolderContact").value = permissions.IsFolderContact;
			document.getElementById("exchWebServices-UserId-EffectiveRights-EditItems").value = permissions.EditItems;
			document.getElementById("exchWebServices-UserId-EffectiveRights-DeleteItems").value = permissions.DeleteItems;
			document.getElementById("exchWebServices-UserId-EffectiveRights-ReadItems").value = permissions.ReadItems;
			document.getElementById("exchWebServices-UserId-EffectiveRights-CalendarPermissionLevel").value = permissions.CalendarPermissionLevel;
		}
	},

	checkRequired: function _checkRequired()
	{
	    let canAdvance = true;
	    let vbox = document.getElementById('exchWebService-exchange-settings');
	    if (vbox) {
		let eList = vbox.getElementsByAttribute('required', 'true');
		for (let i = 0; i < eList.length && canAdvance; ++i) {
		    canAdvance = (eList[i].value != "");
		}

		if (canAdvance) {
			document.getElementById("exchWebService_ExchangeSettings_dialog").buttons = "accept,cancel";
		}
		else {
			document.getElementById("exchWebService_ExchangeSettings_dialog").buttons = "cancel";
		}
	    }

		window.sizeToContent() ;

	},

	permissionObject: function _permissionObject(aPermission)
	{
		for each (var item in aPermission) {
			if (item.localName() == "UserId") {
				for each( var userProp in item) {
					if (!this[item.localName()]) {
						this[item.localName()] = {};
					}
					this[item.localName()][userProp.localName()] = userProp.toString();
				}
			}
			else {
				this[item.localName()] = item.toString();
			}
		}
	},

	showFolderProprties: function _showFolderProprties(aProperties)
	{
		var serverVersionInfo = aProperties.nsSoap::Header.nsTypes::ServerVersionInfo;
		document.getElementById("exchWebServices-ServerVersionInfo").value = serverVersionInfo.@Version + " ("+serverVersionInfo.@MajorVersion+"."+serverVersionInfo.@MinorVersion+"."+serverVersionInfo.@MajorBuildNumber+"."+serverVersionInfo.@MinorBuildNumber+")";

		var calendarFolder = aProperties.nsSoap::Body.nsMessages::GetFolderResponse.nsMessages::ResponseMessages.nsMessages::GetFolderResponseMessage.nsMessages::Folders.nsTypes::CalendarFolder;
		var calendarPermissions = calendarFolder.nsTypes::PermissionSet..nsTypes::CalendarPermission;
		var propType = "calendar";

		if (calendarFolder.toString() == "") {
			var calendarFolder = aProperties.nsSoap::Body.nsMessages::GetFolderResponse.nsMessages::ResponseMessages.nsMessages::GetFolderResponseMessage.nsMessages::Folders.nsTypes::TasksFolder;
			var calendarPermissions = calendarFolder.nsTypes::PermissionSet..nsTypes::Permission;
			propType = "task";
		}

		document.getElementById("exchWebServices-CalendarFolder-DisplayName").value = calendarFolder.nsTypes::DisplayName.toString();
		document.getElementById("exchWebServices-CalendarFolder-TotalCount").value = calendarFolder.nsTypes::TotalCount.toString();
		document.getElementById("exchWebServices-CalendarFolder-ChildFolderCount").value = calendarFolder.nsTypes::ChildFolderCount.toString();

		document.getElementById("exchWebServices-CalendarFolder-EffectiveRights-CreateAssociated").value = calendarFolder.nsTypes::EffectiveRights.nsTypes::CreateAssociated.toString();
		document.getElementById("exchWebServices-CalendarFolder-EffectiveRights-CreateContents").value = calendarFolder.nsTypes::EffectiveRights.nsTypes::CreateContents.toString();
		document.getElementById("exchWebServices-CalendarFolder-EffectiveRights-CreateHierarchy").value = calendarFolder.nsTypes::EffectiveRights.nsTypes::CreateHierarchy.toString();
		document.getElementById("exchWebServices-CalendarFolder-EffectiveRights-Delete").value = calendarFolder.nsTypes::EffectiveRights.nsTypes::Delete.toString();
		document.getElementById("exchWebServices-CalendarFolder-EffectiveRights-Modify").value = calendarFolder.nsTypes::EffectiveRights.nsTypes::Modify.toString();
		document.getElementById("exchWebServices-CalendarFolder-EffectiveRights-Read").value = calendarFolder.nsTypes::EffectiveRights.nsTypes::Read.toString();

		// PermissionSet
		var permissions = new Array;
		for each(var permission in calendarPermissions) {
			permissions.push(new this.permissionObject(permission));
		}

		try {
			this.permissionsPropertiesTreeView = new exchWebService_permissionsPropertiesView(permissions);
		} catch(err) { exchWebService.commonFunctions.LOG("ERROR:"+err);}

		document.getElementById('exchWebServicesPermissionsTree').treeBoxObject.view = this.permissionsPropertiesTreeView;
	},

	onLoad: function _onLoad()
	{
		var calId = window.arguments[0].calendar.id;
		document.getElementById("exchWebService_ExchangeSettings-title").value = window.arguments[0].calendar.name;
		exchWebServicesLoadExchangeSettingsByCalId(calId);

		// Load meeting request settings.
		var exchWebServicesCalPrefs = Cc["@mozilla.org/preferences-service;1"]
		            .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+calId+".");

		document.getElementById("exchWebService-poll-inbox").checked = exchWebService.commonFunctions.safeGetBoolPref(exchWebServicesCalPrefs, "ecPollInbox", true);
		document.getElementById("exchWebService-poll-calendar-interval").value = exchWebService.commonFunctions.safeGetIntPref(exchWebServicesCalPrefs, "ecCalendarPollInterval", 60);
		document.getElementById("exchWebService-poll-inbox-interval").value = exchWebService.commonFunctions.safeGetIntPref(exchWebServicesCalPrefs, "ecPollInboxInterval", 180);
		document.getElementById("exchWebService-autorespond-meetingrequest").checked = exchWebService.commonFunctions.safeGetBoolPref(exchWebServicesCalPrefs, "ecAutoRespondMeetingRequest", false); 
		document.getElementById("exchWebService-autorespond-answer").value = exchWebService.commonFunctions.safeGetCharPref(exchWebServicesCalPrefs, "ecAutoRespondAnswer", "TENTATIVE"); 

		document.getElementById("exchWebService-autoremove-invitation_cancellation1").checked = exchWebService.commonFunctions.safeGetBoolPref(exchWebServicesCalPrefs, "ecAutoRemoveInvitationCancellation1", false); 
		document.getElementById("exchWebService-autoremove-invitation_cancellation2").checked = exchWebService.commonFunctions.safeGetBoolPref(exchWebServicesCalPrefs, "ecAutoRemoveInvitationCancellation2", false); 

		document.getElementById("exchWebService-autoremove-invitation_response1").checked = exchWebService.commonFunctions.safeGetBoolPref(exchWebServicesCalPrefs, "ecAutoRemoveInvitationResponse1", true); 

		document.getElementById("exchWebService-doautorespond-meetingrequest-message").checked = exchWebService.commonFunctions.safeGetBoolPref(exchWebServicesCalPrefs, "ecSendAutoRespondMeetingRequestMessage", false); 
		document.getElementById("exchWebService-autorespond-meetingrequest-message").value = exchWebService.commonFunctions.safeGetCharPref(exchWebServicesCalPrefs, "ecAutoRespondMeetingRequestMessage", ""); 

		this.checkFolderSettings();

		document.getElementById("exchWebService_folderbaserow").hidden = (exchWebServicesgFolderIdOfShare != "");
		document.getElementById("exchWebService_folderpathrow").hidden = (exchWebServicesgFolderIdOfShare != "");
		document.getElementById("exchWebServices-SharedFolderID").hidden = true;

		if (window.arguments[0].calendar.getProperty("exchWebService.getFolderProperties")) {
			var folderProperties = new XML(window.arguments[0].calendar.getProperty("exchWebService.getFolderProperties"));
			this.showFolderProprties(folderProperties);
		}
		else {
			document.getElementById("exchWebService-folderproperties-xml").value = "not found";
			document.getElementById("exchWebService_folderbaserow").hidden = true;
			document.getElementById("exchWebService_folderpathrow").hidden = true;
			document.getElementById("exchWebServices-UserAvailability").hidden = false;
		}

		if (window) {
			window.sizeToContent();
		}
	},

	onSave: function _onSave()
	{
		var calId = window.arguments[0].calendar.id;
		var aCalendar = window.arguments[0].calendar;
		exchWebServicesSaveExchangeSettingsByCalId(calId);

		// Save meeting request settings.
		var exchWebServicesCalPrefs = Cc["@mozilla.org/preferences-service;1"]
		            .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+calId+".");

		this.checkFolderSettings();

		exchWebServicesCalPrefs.setBoolPref("ecPollInbox", document.getElementById("exchWebService-poll-inbox").checked); 
		exchWebServicesCalPrefs.setIntPref("ecCalendarPollInterval", document.getElementById("exchWebService-poll-calendar-interval").value); 
		exchWebServicesCalPrefs.setIntPref("ecPollInboxInterval", document.getElementById("exchWebService-poll-inbox-interval").value); 
		exchWebServicesCalPrefs.setBoolPref("ecAutoRespondMeetingRequest", document.getElementById("exchWebService-autorespond-meetingrequest").checked); 
		exchWebServicesCalPrefs.setCharPref("ecAutoRespondAnswer", document.getElementById("exchWebService-autorespond-answer").value); 

		exchWebServicesCalPrefs.setBoolPref("ecAutoRemoveInvitationCancellation1", document.getElementById("exchWebService-autoremove-invitation_cancellation1").checked); 
		exchWebServicesCalPrefs.setBoolPref("ecAutoRemoveInvitationCancellation2", document.getElementById("exchWebService-autoremove-invitation_cancellation2").checked); 

		exchWebServicesCalPrefs.setBoolPref("ecAutoRemoveInvitationResponse1", document.getElementById("exchWebService-autoremove-invitation_response1").checked); 

		exchWebServicesCalPrefs.setBoolPref("ecSendAutoRespondMeetingRequestMessage", document.getElementById("exchWebService-doautorespond-meetingrequest-message").checked); 
		exchWebServicesCalPrefs.setCharPref("ecAutoRespondMeetingRequestMessage", document.getElementById("exchWebService-autorespond-meetingrequest-message").value); 

		window.arguments[0].answer = "saved";

		var observerService = Cc["@mozilla.org/observer-service;1"]  
			                  .getService(Ci.nsIObserverService);  
		observerService.notifyObservers(this, "onCalReset", calId);  

		Cc["@mozilla.org/preferences-service;1"]
		                    .getService(Ci.nsIPrefService).savePrefFile(null);
		return true;
	},

	checkFolderSettings: function _checkFolderSettings()
	{
		if ((document.getElementById("exchWebService_folderbase").value != "calendar") ||
		    (document.getElementById("exchWebService_folderpath").value != "/") ||
		    (!window.arguments[0].calendar.getProperty("exchWebService.getFolderProperties"))) {
			// Disable inbox polling.
			document.getElementById("exchWebService-poll-inbox").checked = false;
			document.getElementById("vbox-exchWebService-meetingrequestsettings").hidden = true;
			document.getElementById("vbox-exchWebService-nomeetingrequestsettings").hidden = false;
		}
		else {
			document.getElementById("vbox-exchWebService-meetingrequestsettings").hidden = false;
			document.getElementById("vbox-exchWebService-nomeetingrequestsettings").hidden = true;
		}

		document.getElementById("exchWebService-poll-inbox-interval").disabled = (!document.getElementById("exchWebService-poll-inbox").checked);

		document.getElementById("exchWebService-autorespond-answer").disabled = (!document.getElementById("exchWebService-autorespond-meetingrequest").checked);
		document.getElementById("exchWebService-doautorespond-meetingrequest-message").disabled = (!document.getElementById("exchWebService-autorespond-meetingrequest").checked);
		document.getElementById("exchWebService-autorespond-meetingrequest-message").disabled = (!document.getElementById("exchWebService-autorespond-meetingrequest").checked);

		window.sizeToContent() ;
	},

	doTabChanged: function _doTabChanged(aTabs)
	{
		this.checkFolderSettings();
	},

	doPollInboxChanged: function _doPollInboxChanged(aCheckbox)
	{
		this.checkFolderSettings();
	},

	doAutoRespondChanged: function doAutoRespondChanged(aCheckbox)
	{
		this.checkFolderSettings();
	},

}
