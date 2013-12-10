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
 * Author: Deepak Kumar
 * email: deepk2u@gmail.com
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

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/erForewardItem.js");


//if (! exchWebService) var exchWebService = {};

function exchEventSummaryBrowserProgressListener(aDialog)
{
	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
	this.dialog = aDialog;
}

exchEventSummaryBrowserProgressListener.prototype = {

	QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference,
						Ci.nsIWebProgressListener,
						Ci.nsISupports]),

	GetWeakReference: function _GetWeakReference()
	{
			Cc["@mozilla.org/consoleservice;1"]
	                     .getService(Ci.nsIConsoleService).logStringMessage("GetWeakReference");
		return null;
	},

//void onLocationChange(in nsIWebProgress aWebProgress, in nsIRequest aRequest, in nsIURI aLocation, [optional] in unsigned long aFlags);
	onLocationChange: function _onLocationChange(aWebProgress, aRequest, aLocation, aFlags)
	{
			var flagStr = "("+aFlags+")";
			if (aFlags & 0x1) flagStr += ",LOCATION_CHANGE_SAME_DOCUMENT";
			if (aFlags & 0x2) flagStr += ",LOCATION_CHANGE_ERROR_PAGE";
			if (aLocation) {
			Cc["@mozilla.org/consoleservice;1"]
	                     .getService(Ci.nsIConsoleService).logStringMessage("onLocationChange: aLocation.spec:"+aLocation.spec+", aFlags:"+flagStr);
			}
			else {
			Cc["@mozilla.org/consoleservice;1"]
	                     .getService(Ci.nsIConsoleService).logStringMessage("onLocationChange: aLocation:"+aLocation+", aFlags:"+flagStr);
			}
	},

//void onProgressChange(in nsIWebProgress aWebProgress, in nsIRequest aRequest, in long aCurSelfProgress, in long aMaxSelfProgress, in long aCurTotalProgress, in long aMaxTotalProgress);
	onProgressChange: function _onProgressChange(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress)
	{
			Cc["@mozilla.org/consoleservice;1"]
	                     .getService(Ci.nsIConsoleService).logStringMessage("onProgressChange: aCurSelfProgress:"+aCurSelfProgress+", aMaxSelfProgress:"+aMaxSelfProgress+", aCurTotalProgress:"+aCurTotalProgress+", aMaxTotalProgress:"+aMaxTotalProgress);
			if ((aCurSelfProgress == aMaxSelfProgress) && (this.dialog)) {
				//this.dialog.removeTmpFile(); // Will be done by the DOMContentLoaded event.
			}
	},

//void onSecurityChange(in nsIWebProgress aWebProgress, in nsIRequest aRequest, in unsigned long aState);
	onSecurityChange: function _onSecurityChange(aWebProgress, aRequest, aState)
	{
			var flagStr = "("+aState+")";
			if (aState & 0x1) flagStr += ",STATE_IS_BROKEN";
			if (aState & 0x2) flagStr += ",STATE_IS_SECURE";
			if (aState & 0x4) flagStr += ",STATE_IS_INSECURE";
			if (aState & 0x10000) flagStr += ",STATE_SECURE_MED";
			if (aState & 0x20000) flagStr += ",STATE_SECURE_LOW";
			if (aState & 0x40000) flagStr += ",STATE_SECURE_HIGH";
			if (aState & 0x100000) flagStr += ",STATE_IDENTITY_EV_TOPLEVEL";
			
			Cc["@mozilla.org/consoleservice;1"]
	                     .getService(Ci.nsIConsoleService).logStringMessage("onSecurityChange: aState:"+flagStr);
	},

//void onStateChange(in nsIWebProgress aWebProgress, in nsIRequest aRequest, in unsigned long aStateFlags, in nsresult aStatus);
	onStateChange: function _onStateChange(aWebProgress, aRequest, aStateFlags, aStatus)
	{
			var flagStr = "("+aStateFlags+")";
			if (aStateFlags & 0x1) flagStr += ",STATE_START";
			if (aStateFlags & 0x2) flagStr += ",STATE_REDIRECTING";
			if (aStateFlags & 0x4) flagStr += ",STATE_TRANSFERRING";
			if (aStateFlags & 0x8) flagStr += ",STATE_NEGOTIATING";
			if (aStateFlags & 0x10) flagStr += ",STATE_STOP";
			if (aStateFlags & 0x10000) flagStr += ",STATE_IS_REQUEST";
			if (aStateFlags & 0x20000) flagStr += ",STATE_IS_DOCUMENT";
			if (aStateFlags & 0x40000) flagStr += ",STATE_IS_NETWORK";
			if (aStateFlags & 0x80000) flagStr += ",STATE_IS_WINDOW";
			if (aStateFlags & 0x1000000) flagStr += ",STATE_RESTORING";

			Cc["@mozilla.org/consoleservice;1"]
	                     .getService(Ci.nsIConsoleService).logStringMessage("onStateChange: aStateFlags:"+flagStr+", aStatus:"+aStatus);

	},

//void onStatusChange(in nsIWebProgress aWebProgress, in nsIRequest aRequest, in nsresult aStatus, in wstring aMessage);
	onStatusChange: function _onStatusChange(aWebProgress, aRequest, aStatus, aMessage)
	{
			Cc["@mozilla.org/consoleservice;1"]
	                     .getService(Ci.nsIConsoleService).logStringMessage("onStatusChange: aStatus:"+aStatus+", aMessage:"+aMessage);
	},


}

function exchEventSummaryDialog(aDocument, aWindow)
{
	this._document = aDocument;
	this._window = aWindow;

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
}

exchEventSummaryDialog.prototype = {

//exchWebService.forewardEvent2 = {
	onForward : function _onForward()
	{	
		var args = this._window.arguments[0];
		var item = args.calendarEvent;
		item =item.clone();
		var calendar = item.calendar;
		var args = new Object();
		args.startTime = item.startDate;
		args.endTime = item.endDate;
		args.organizer = item.organizer;
		args.item = item;
		args.attendees =item.organizer;
		args.calendar =calendar;
		var self = this;
		args.onOk = function(attendee,organizer,startTime,endTime) { self.callOnOk(attendee,organizer,startTime,endTime);};
		args.opener="exchWebService-onForward";
		this._window.openDialog("chrome://calendar/content/calendar-event-dialog-attendees.xul","_blank", "chrome,titlebar,modal,resizable",args);
		
	},	
	
	callOnOk : function(attendee,organizer,startTime,endTime){
		
		var args = this._window.arguments[0];
		var item = args.calendarEvent;
		var calendar = item.calendar;
		var calId = calendar.id;
		var calPrefs = Cc["@mozilla.org/preferences-service;1"]
		            .getService(Ci.nsIPrefService)
			    .getBranch("extensions.exchangecalendar@extensions.1st-setup.nl."+calId+".");
		
		var self = this;
		var tmpObject = new erForewardItemRequest(
			{user: this.globalFunctions.safeGetCharPref(calPrefs, "ecDomain")+"\\"+this.globalFunctions.safeGetCharPref(calPrefs, "ecUser"), 
			mailbox: this.globalFunctions.safeGetCharPref(calPrefs, "ecMailbox"),
			serverUrl: this.globalFunctions.safeGetCharPref(calPrefs, "ecServer"), 
			item: item, 
			attendees: attendee}, 
			function(aForewardItemRequest, aResp){self.erForewardItemRequestOK(aForewardItemRequest, aResp);}, 
			function(aForewardItemRequest, aCode, aMsg){self.erForewardItemRequestError(aForewardItemRequest, aCode, aMsg);});		
	},

	erForewardItemRequestOK : function _erForewardItemRequestOK(aForewardItemRequest, aResp)
	{
		alert(aResp);
	},

	erForewardItemRequestError: function _erForewardItemRequestError(aForewardItemRequest, aCode, aMsg)
	{
		alert(aCode+":"+aMsg);
	},

	removeTmpFile: function _removeTmpFile()
	{
		if ((this.tmpFile) && (this.tmpFile.exists())) {
			//dump("Removing tmp file:"+this.tmpFile.path+"\n");
			this.tmpFile.remove(false);
		}
	},

	saveToFile: function _saveToFile(aContent, aItem)
	{
		var file = Cc["@mozilla.org/file/directory_service;1"]
				.getService(Ci.nsIProperties)
				.get("ProfD", Ci.nsIFile);
		file.append("exchange-data");
		if ( !file.exists() || !file.isDirectory() ) {
			file.create(Ci.nsIFile.DIRECTORY_TYPE, this.globalFunctions.fromOctal("0777"));  
		}

		file.append("tmp");
		if ( !file.exists() || !file.isDirectory() ) {
			file.create(Ci.nsIFile.DIRECTORY_TYPE, this.globalFunctions.fromOctal("0777"));  
		}

		file.append(this.globalFunctions.getUUID()+".html");

		if (file.exists()) {
			file.remove(false);
		}

//		file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, this.globalFunctions.fromOctal("0777"));  

		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
				 createInstance(Components.interfaces.nsIFileOutputStream);  
		foStream.init(file, 0x02 | 0x08 | 0x20, this.globalFunctions.fromOctal("0777"), 0);  

		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
				createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(aContent);
		converter.close(); // this closes foStream
		  
		this.tmpFile = file;
		return file;
	},

	onMouseOver: function _onMouseOver(event)
	{
		var ceParams = this.hrefAndLinkNodeForClickEvent(event);
		if (!ceParams)	{
			return true;
		}

		var href = ceParams.href;

		//dump("onMouseEnter: href='"+href+"'\n");
		this.mouseEnterHRef = href;
		this._document.getElementById("exchWebService-summary-description-label").value = href;
		this._document.getElementById("exchWebService-body-editor").setAttribute("tooltip", "exchWebService-summary-description-tooltip");
		event.preventDefault();
		return true;
	},

	onMouseOut: function _onMouseOut(event)
	{
		var ceParams = this.hrefAndLinkNodeForClickEvent(event);
		if (!ceParams)	{
			return true;
		}

		var href = ceParams.href;

		if (href != this.mouseEnterHRef) {
			return true;
		}

		//dump("onMouseLeave: href='"+href+"'\n");
		this._document.getElementById("exchWebService-body-editor").removeAttribute("tooltip");
		event.preventDefault();
		return true;
	},

	onLoadedData: function _onLoadedData(aStr)
	{
		this._document.getElementById("exchWebService-body-editor").removeEventListener("DOMContentLoaded",arguments.callee,true);
		//dump("onLoadedData:\n");
		this.removeTmpFile();
	},

	browserLoad: function _browserLoad(aStr, aItem)
	{
		this._document.getElementById("exchWebService-body-editor").removeEventListener("load",this.browserLoadFunction,true);
		//dump("browserLoad:\n");
		var self = this;
		this._document.getElementById("exchWebService-body-editor").addEventListener("DOMContentLoaded", function(aEvent){ self.onLoadedData(aEvent);}, true);
		var tmpListener = new exchEventSummaryBrowserProgressListener(this);
try{
		this._document.getElementById("exchWebService-body-editor").addProgressListener(tmpListener, 0x1ff);
		var filename = this.saveToFile(aItem.body, aItem);
		this._document.getElementById("exchWebService-body-editor").loadURI("file://" + filename.path, null,"utf-8");
}catch(err){dump("browserLoad: loadURI err:"+err+"\n");}

		this._document.getElementById("exchWebService-body-editor").addEventListener("mouseover", function(aEvent){ self.onMouseOver(aEvent);}, false);
		this._document.getElementById("exchWebService-body-editor").addEventListener("mouseout", function(aEvent){ self.onMouseOut(aEvent);}, false);
	},

	onLoad: function _onLoad()
	{
		//dump("onLoad\n");
		if (this._document.getElementById("calendar-event-summary-dialog")) {
			//this._window.removeEventListener("load", this.onLoad, false);
			var args = this._window.arguments[0];
			var item = args.calendarEvent;
			var calendar = item.calendar;
			var tmpButtons = this._document.getElementById("calendar-event-summary-dialog").getAttribute("buttons");
			if (calendar.getProperty("exchWebService.offlineOrNotConnected")) {
				var tmpArray = tmpButtons.split(",");
				var newArray = [];
				for (var index in tmpArray) {
					if (tmpArray[index] != "extra1") {
						newArray.push(tmpArray[index]);
					}
				}
				this._document.getElementById("calendar-event-summary-dialog").buttons = newArray.join(",");
			}
			else {
				if ((item.calendar.type == "exchangecalendar") && (item.responseObjects) && (item.responseObjects.ForwardItem)) {
					this._document.getElementById("calendar-event-summary-dialog").buttons += ",extra1";
				}
			}

			//Cc["@mozilla.org/consoleservice;1"]
	                //     .getService(Ci.nsIConsoleService).logStringMessage(item.exchangeXML);
//dump("summary.dialog: item.exchangeXML:"+item.exchangeXML+"\n");
			if (item.bodyType == "HTML") {
				if (this._document.getElementById("item-description")) {
					this._document.getElementById("item-description").parentNode.appendChild(this._document.getElementById("exchWebService-body-editor"));
					this._document.getElementById("item-description").hidden = true;
				}
				if (this._document.getElementById("exchWebService-body-editor")) {
					this._document.getElementById("item-description-box").hidden = false;
					this._document.getElementById("exchWebService-body-editor").hidden = false;
					//this._document.getElementById("exchWebService-body-editor").content = item.body;

					// We Wait until the browser object has been loaded completely.
					var self = this;
					this.browserLoadFunction = function(aEvent){ self.browserLoad(aEvent, item);}
					this._document.getElementById("exchWebService-body-editor").addEventListener("load", this.browserLoadFunction, true);
				}
			}
			else {
				if (this._document.getElementById("item-description")) {
					this._document.getElementById("item-description").hidden = false;
				}
				if (this._document.getElementById("exchWebService-body-editor")) {
					this._document.getElementById("exchWebService-body-editor").hidden = true;
				}
			}
		}
	},

	hrefAndLinkNodeForClickEvent: function _hrefAndLinkNodeForClickEvent(event)
	{
		var href = "";
		var isKeyCommand = (event.type == "command");
		var linkNode = isKeyCommand ? this._document.commandDispatcher.focusedElement
				        : event.originalTarget;

		while (linkNode instanceof Element) {
			if (linkNode instanceof HTMLAnchorElement ||
			  linkNode instanceof HTMLAreaElement ||
			  linkNode instanceof HTMLLinkElement) {
				href = linkNode.href;
				if (href)
				  break;
			}
			// Try MathML href
			else if (linkNode.namespaceURI == "http://www.w3.org/1998/Math/MathML" &&
			       linkNode.hasAttribute("href")) {
				href = linkNode.getAttribute("href");
				href = makeURLAbsolute(linkNode.baseURI, href);
				break;
			}
			// Try simple XLink
			else if (linkNode.hasAttributeNS("http://www.w3.org/1999/xlink", "href")) {
				href = linkNode.getAttributeNS("http://www.w3.org/1999/xlink", "href");
				href = makeURLAbsolute(linkNode.baseURI, href);
				break;
			}
			linkNode = linkNode.parentNode;
		}

		return href ? {href: href, linkNode: linkNode} : null;
	},

	onClick: function _onClick(event)
	{
		// Following is copied from mailWindow.js script for emails.
		var ceParams = this.hrefAndLinkNodeForClickEvent(event);
		if (!ceParams && !event.button)	{
			var target = event.target;
			// is this an image that we might want to scale?
			if (target instanceof Components.interfaces.nsIImageLoadingContent) {
				// make sure it loaded successfully
				var req = target.getRequest(Components.interfaces.nsIImageLoadingContent.CURRENT_REQUEST);
				if (!req || req.imageStatus & Components.interfaces.imgIRequest.STATUS_ERROR)
				return true;
				// is it an inline attachment?
				if (/^moz-attached-image/.test(target.className)) {
					if (target.hasAttribute("isshrunk"))
					{
						// currently shrunk to fit, so unshrink it
						target.removeAttribute("isshrunk");
						target.removeAttribute("shrinktofit");
						target.setAttribute("overflowing", "true");
					}
					else if (target.hasAttribute("overflowing"))
					{
						// user wants to shrink now
						target.setAttribute("isshrunk", "true");
						target.setAttribute("shrinktofit", "true");
						target.removeAttribute("overflowing");
					}
				}
			}
			return true;
		}
		var href = ceParams.href;

		try {
			var extProtService = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService();
			extProtService = extProtService.QueryInterface(Ci.nsIExternalProtocolService);
			var scheme = href.substring(0, href.indexOf(":"));
			if (extProtService.isExposedProtocol(scheme)) {
				var ioService = Cc["@mozilla.org/network/io-service;1"]
					  .getService(Ci.nsIIOService);
				extProtService.loadUrl(ioService.newURI(href, null, null));
			}
		} 
		catch (ex) {
			alert("Do not know how to handle this reference:"+href);
		}

		event.preventDefault();
		return true;
	},
}

//this._window.addEventListener("load", exchWebService.forewardEvent2.onLoad, false);
var tmpEventSummaryDialog = new exchEventSummaryDialog(document, window);
window.addEventListener("load", function () { window.removeEventListener("load",arguments.callee,false); tmpEventSummaryDialog.onLoad(); }, true);


