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

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://exchangecalendar/ecFunctions.js");
Cu.import("resource://exchangecalendar/erGetAttachments.js");

if (! exchWebService) var exchWebService = {};

exchWebService.attachments = {

	addAttachmentDialog: function _addAttachmentDialog()
	{
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"]
		            .createInstance(nsIFilePicker);

		var title = "Select attachment";

		fp.init(window, title, nsIFilePicker.modeOpen);

		var ret = fp.show();

		if (ret == nsIFilePicker.returnOK) {
			exchWebService.commonFunctions.LOG("[["+fp.fileURL.spec+"]]");

			// Create attachment for item.
			var newAttachment = createAttachment();
			newAttachment.uri = fp.fileURL.clone();
			this.addAttachment(newAttachment);
		}

	},

	addAttachment: function _addAttachment(aAttachment)
	{
		// We currently only support uri attachments
		var ext2file = { exe: "document-binary.png",
				 xls: "document-excel.png",
				 xlsx: "document-excel.png",
				 csv: "document-excel-csv.png",
				 fls: "document-flash-movie.png",
				 gif: "document-image.png",
				 jpg: "document-image.png",
				 jpeg: "document-image.png",
				 png: "document-image.png",
				 pdf: "document-pdf.png",
				 ps: "document-photoshop.png",
				 php: "document-php.png",
				 txt: "document-text.png",
				 tex: "document-tex.png",
				 doc: "document-word.png",
				 docx: "document-word.png",
				 ppt: "document-powerpoint.png",
				 pptx: "document-powerpoint.png",
				 pfx: "certificate.png",
				 crt: "certificate.png",
				 pkcs12: "certificate.png",
				 };

		exchWebService.commonFunctions.LOG("exchWebService.attachments.addAttachment");
		if (aAttachment.uri) {
			let documentLink = document.getElementById("exchWebService-attachment-link");
			let item = documentLink.appendChild(createXULElement("listitem"));
			item.setAttribute("crop", "end");
			item.setAttribute("class", "listitem-iconic");

			var extension = "";
			var stringForExtension = "";

			let getParams = exchWebService.commonFunctions.splitUriGetParams(aAttachment.uri);
			if (getParams) {
				// Set listitem attributes
				var fileSize = getParams.size;
				var sizeStr = "b";
				if (fileSize > (10*1024)) { 
					fileSize = fileSize / 1024;
					sizeStr = "Kb";
				}
				if (fileSize > (10*1024)) { 
					fileSize = fileSize / 1024;
					sizeStr = "Mb";
				}
				if (fileSize > (10*1024)) { 
					fileSize = fileSize / 1024;
					sizeStr = "Gb";
				}
				if (sizeStr != "b") {
					item.setAttribute("label", getParams.name+" ("+Number(fileSize).toFixed(1)+" "+sizeStr+")");
				}
				else {
					if (fileSize == "") {
						item.setAttribute("label", getParams.name);
					}
					else {
						item.setAttribute("label", getParams.name+" ("+fileSize+")");
					}
				}
				
				stringForExtension =  getParams.name;

			}
			else {
				exchWebService.commonFunctions.LOG("DID NOT FIND VALID get FIELDS FOR ATTACHMENT");
				if (aAttachment.uri.spec.indexOf("file://") > -1) {
					exchWebService.commonFunctions.LOG("Attachment is a local file:"+aAttachment.uri.spec);
					// We have a local file url
					item.setAttribute("label", decodeURIComponent(aAttachment.uri.path));
					stringForExtension = decodeURIComponent(aAttachment.uri.path);
				}
				else {
					exchWebService.commonFunctions.LOG("It is not a valid local file spec");
					return;
				}
			}

			var counter = stringForExtension.length;
			while ((counter > 0) && (stringForExtension.substr(counter-1,1) != ".")) {
				extension = stringForExtension.substr(counter-1,1) + extension;
				counter--;
			}
			exchWebService.commonFunctions.LOG(" == extension:"+extension);

			if (ext2file[extension]) {
				item.setAttribute("image", "chrome://exchangecalendar/skin/" + ext2file[extension]);
			} else {
				item.setAttribute("image", "chrome://exchangecalendar/skin/document--exclamation.png");
			}

			// full attachment object is stored here
			item.attachment = aAttachment;
			try {
				gAttachMap[aAttachment.hashId] = aAttachment;
			} catch(er) {}

			// Update the number of rows and save our attachment globally
			if (documentLink.itemCount < 3) {
				documentLink.rows = documentLink.itemCount;
			}
			else {
				documentLink.rows = 3;
			}

			this.showAttachmentListbox();
		}

	},

	deleteAttachment: function deleteAttachment()
	{
		var documentLink = document.getElementById("exchWebService-attachment-link");
		delete gAttachMap[documentLink.selectedItem.attachment.hashId];
		documentLink.removeItemAt(documentLink.selectedIndex);
	},

	showAttachmentListbox: function _showAttachmentListbox()
	{
		if (this.attachmentListboxVisible) return;

		this.attachmentListboxVisible = true;

		// calendar-event-dialog (show our attachment view)
		try {
			document.getElementById("exchWebService-attachments-row").removeAttribute("collapsed");
		}
		catch (ex) {}
		// calendar-summary-dialog (show our attachment view)
		try {
			document.getElementById("exchWebService-attachment-summary-space").hidden=false;
			document.getElementById("exchWebService-attachment-summary-caption").hidden=false;
			document.getElementById("exchWebService-attachment-summary-box").hidden=false;
			document.getElementById("item-description-box").hidden=false;

		}
		catch (ex) {}

		window.sizeToContent();
	},

	removeItemsFromListbox: function _removeItemsFromListbox()
	{
		var documentLink = document.getElementById("exchWebService-attachment-link");
		while (documentLink.itemCount > 0) {
			exchWebService.commonFunctions.LOG(" == Removing item from listbox");
			documentLink.removeItemAt(0);
		}
	},

	onLoad: function _onLoad()
	{
		// nuke the onload, or we get called every time there's
		// any load that occurs
		window.removeEventListener("load", exchWebService.attachments.onLoad, false);

		if (document.getElementById("calendar-task-tree")) {
			exchWebService.commonFunctions.LOG("  -- calendar-task-tree --");
			document.getElementById("calendar-task-tree").addEventListener("select", exchWebService.attachments.onSelectTask, true);
			return;
		} 

		var args = window.arguments[0];
		var item = args.calendarEvent;

		exchWebService.commonFunctions.LOG("  -- onLoad 2 ("+exchWebService.commonFunctions.STACKshort()+")");
		this.attachmentListboxVisible = false;

		if ((item.calendar) && (item.calendar.type == "exchangecalendar")) {
			exchWebService.commonFunctions.LOG("  -- It is an Exchange Calendar event:"+item.title);

			
			try {
				// Hide Lightning URL button 
				document.getElementById("button-url").hidden = true;
				document.getElementById("event-toolbar").setAttribute("currentset", "button-save,button-attendees,button-privacy,button-url,exchWebService-add-attachment-button,button-delete");
				document.getElementById("exchWebService-add-attachment-button").hidden = false;
				document.getElementById("options-attachments-menuitem").setAttribute("label", document.getElementById("exchWebService-add-attachment-button").getAttribute("label"));
				document.getElementById("options-attachments-menuitem").setAttribute("command", "exchWebService_addAttachmentDialog");
			}
			catch (ex) {exchWebService.commonFunctions.LOG("  -- Could not add exchange attachment buttons:"+ex.toString());}

			// calendar-event-dialog (hide existing attachment view)
			try {
				document.getElementById("event-grid-attachment-row").setAttribute("collapsed", "true");
			}
			catch (ex) {}

			exchWebService.attachments.addAttachmentsFromItem(item);
		}
	},

	addAttachmentsFromItem: function _addAttachmentsFromItem(aItem)
	{
		try {
		exchWebService.attachments.removeItemsFromListbox();
		}
		catch(ex) {exchWebService.commonFunctions.LOG("exchWebService.attachments.addAttachmentsFromItem: foutje:"+ex);}
		exchWebService.commonFunctions.LOG("exchWebService.attachments.addAttachmentsFromItem: title:"+aItem.title);
		var attachments = aItem.getAttachments({});
		if (attachments.length > 0) {
			exchWebService.commonFunctions.LOG("  -- We have attachments:"+attachments.length+" ("+exchWebService.commonFunctions.STACKshort()+")");
			for (var index in attachments) {
				exchWebService.commonFunctions.LOG("  -- processing attachment: "+index);
				exchWebService.attachments.addAttachment(attachments[index]);
			}

			exchWebService.commonFunctions.LOG("  -- processed attachment.");
		}
		else {
			exchWebService.commonFunctions.LOG("No attachments");
		}
	},

	onKeyPress: function _onKeyPress(aEvent)
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.onKeyPress");
		const kKE = Components.interfaces.nsIDOMKeyEvent;
		switch (aEvent.keyCode) {
			case kKE.DOM_VK_BACK_SPACE:
			case kKE.DOM_VK_DELETE:
				if (document.getElementById("calendar-task-details-attachment-rows")) break;

				exchWebService.commonFunctions.LOG("exchWebService.attachments.onKeyPress: Delete");
				this.deleteAttachment();
				break;
			case 13: 
			case kKE.DOM_VK_ENTER:
				exchWebService.commonFunctions.LOG("exchWebService.attachments.onKeyPress: Enter");
				this.openAttachment();
				break;
			default:
				exchWebService.commonFunctions.LOG("exchWebService.attachments.onKeyPress: unknown:"+aEvent.keyCode);

		}
	},

	onDblClick: function _onDblClick(aEvent)
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.onDblClick");
		this.openAttachment();
	},

	onSelectTask: function _onSelectTask()
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelectTask");

		var taskTree = document.getElementById("calendar-task-tree");
		var item = taskTree.currentTask;

		if ((item.calendar) && (item.calendar.type == "exchangecalendar")) {
			// calendar-task-view (hide existing attachment view)
			exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelectTask: it is an Exchange task 1.");
			try {
				document.getElementById("calendar-task-details-attachment-rows").setAttribute("hidden", "true");
				document.getElementById("calendar-task-details-attachment-rows").removeAttribute("flex");
				document.getElementById("calendar-task-details-attachment-rows").setAttribute("width","0px");
			}
			catch (ex) {exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelectTask: Foutje:");}

			exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelectTask: it is an Exchange task 2.");
			try {
			exchWebService.attachments.addAttachmentsFromItem(item);
			}
			catch(ex) { exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelectTask: Foutje2:"+ex);}
			exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelectTask: it is an Exchange task 3.");
		}
	},

	onSelect: function _onSelect(aEvent)
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelect");

		let documentLink = document.getElementById("exchWebService-attachment-link");

		var isReadOnly = "true";
		if ((document.getElementById("calendar-event-dialog")) || (document.getElementById("calendar-task-dialog"))) {
			isReadOnly = "false";
		}

		var calendar = getCurrentCalendar();
		if (calendar.readOnly) {
			isReadOnly = "true";
		}		

		if ((documentLink.selectedItem) && (documentLink.selectedItem.attachment)) {
			var attURI = documentLink.selectedItem.attachment.uri;
			if (attURI.spec.indexOf("file://") == 0) {
					exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelect: localfile");
					document.getElementById("exchWebService-attachment-popup-open").setAttribute("disabled", "false");
					document.getElementById("exchWebService_openAttachment").setAttribute("disabled", "false");
					document.getElementById("exchWebService-attachment-popup-save").setAttribute("disabled", "true");
					document.getElementById("exchWebService_saveAttachment").setAttribute("disabled", "true");
					document.getElementById("exchWebService-attachment-popup-delete").setAttribute("disabled", isReadOnly);
					document.getElementById("exchWebService_deleteAttachment").setAttribute("disabled", isReadOnly);
			}
			else {
				if (attURI.spec.indexOf("http") == 0) {
					exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelect: remotefile");
					document.getElementById("exchWebService-attachment-popup-open").setAttribute("disabled", "false");
					document.getElementById("exchWebService_openAttachment").setAttribute("disabled", "false");
					document.getElementById("exchWebService-attachment-popup-save").setAttribute("disabled", "false");
					document.getElementById("exchWebService_saveAttachment").setAttribute("disabled", "false");
					document.getElementById("exchWebService-attachment-popup-delete").setAttribute("disabled", isReadOnly);
					document.getElementById("exchWebService_deleteAttachment").setAttribute("disabled", isReadOnly);
				}
				else {
					exchWebService.commonFunctions.LOG("exchWebService.attachments.onSelect: Unknown attachment URI. Cannot open:"+attURI.spec);
					document.getElementById("exchWebService-attachment-popup-open").setAttribute("disabled", "true");
					document.getElementById("exchWebService-attachment-popup-save").setAttribute("disabled", "true");
				}
			}
		}
	},

	openAttachment: function _openAttachment()
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.openAttachment");
		let documentLink = document.getElementById("exchWebService-attachment-link");

		if (documentLink.selectedItem.attachment) {
			var attURI = documentLink.selectedItem.attachment.uri;
			if (attURI.spec.indexOf("file://") == 0) {
					this.openLocalAttachment(documentLink.selectedItem.attachment);
			}
			else {
				if (attURI.spec.indexOf("http") == 0) {
					this.downloadAttachment(documentLink.selectedItem.attachment, false);
				}
				else {
					exchWebService.commonFunctions.LOG("exchWebService.attachments.openAttachment: Unknown attachment URI. Cannot open:"+attURI.spec);
				}
			}
		}
	},

	saveAttachment: function _saveAttachment()
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.saveAttachment");
		let documentLink = document.getElementById("exchWebService-attachment-link");
		this.downloadAttachment(documentLink.selectedItem.attachment, true);
	},

	openLocalAttachment: function _openLocalAttachment(aAttachment)
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.openLocalAttachment");
		if (! aAttachment) { return; }

		var URL = aAttachment.uri;  

		exchWebService.commonFunctions.LOG(" == Going to open:"+URL.prePath + URL.path);

		var externalLoader = Cc["@mozilla.org/uriloader/external-protocol-service;1"]
				.getService(Ci.nsIExternalProtocolService);

		try {
			externalLoader.loadUrl(URL);
		}
		catch (ex) { exchWebService.commonFunctions.LOG(" == ERROR:"+ex); }
	},

	downloadAttachment: function _downloadAttachment(aAttachment, doSave)
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.downloadAttachment");
		if (! aAttachment) { return; }

		var self = this;

		let getParams = exchWebService.commonFunctions.splitUriGetParams(aAttachment.uri);
		let path = aAttachment.uri.path;
		if (path.indexOf("/?") > -1) {
			path = path.substr(0, path.indexOf("/?"));
		}

		var tmpObject = new erGetAttachmentsRequest(
			{user: getParams.user, 
			 serverUrl:  aAttachment.uri.prePath + path ,
			 attachmentIds: [getParams.id],
			 doSave: doSave}, self.onDownloadAttachmentOk, self.onDownloadAttachmentError);

	},

	onDownloadAttachmentOk: function _onDownloadAttachmentOk(aExchangeRequest, aAttachments)
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.onDownloadAttachmentOk:"+aAttachments.length);

		if (aAttachments.length > 0) {
			for (var index in aAttachments) {
				exchWebService.commonFunctions.LOG(" == Going to decode:"+aAttachments[index].name);
				exchWebService.commonFunctions.LOG(" == content:"+aAttachments[index].content.length+" bytes");  
				var fileData = window.atob(aAttachments[index].content);
				exchWebService.commonFunctions.LOG(" == Decoded:"+aAttachments[index].name);

				if (aExchangeRequest.argument.doSave) {
					var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
					fp.init(window, "Save", Ci.nsIFilePicker.modeSave);
					fp.defaultString = aAttachments[index].name;
					var result = fp.show();
					if (result == Ci.nsIFilePicker.returnCancel) {
						// User canceled. // Maybe we should have an option for only this attachment or all. Now for all.
					
						return;
					}
					var file = fp.file;
				}
				else {
					var file = Cc["@mozilla.org/file/directory_service;1"].  
							getService(Ci.nsIProperties).  
							get("TmpD", Ci.nsIFile);  
					file.append(aAttachments[index].name);  
				}
				//file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);  
				// do whatever you need to the created file  
				exchWebService.commonFunctions.LOG(" == new tmp filename:"+file.path);  

				var stream = Cc["@mozilla.org/network/safe-file-output-stream;1"].  
						createInstance(Ci.nsIFileOutputStream);  
				stream.init(file, 0x04 | 0x08 | 0x20, 384, 0); // readwrite, create, truncate  
              
				exchWebService.commonFunctions.LOG(" == writing file:"+file.path);  
				exchWebService.commonFunctions.LOG(" == writing:"+fileData.length+" bytes");  
				stream.write(fileData, fileData.length);  
				if (stream instanceof Ci.nsISafeOutputStream) {  
					stream.finish();  
				} else {  
					stream.close();  
				}

				// Dispose of the converted data in memory;
				//delete fileData;

				exchWebService.commonFunctions.LOG(" == written file:"+file.path);  
				exchWebService.commonFunctions.LOG(" == written:"+fileData.length+" bytes");  

				if (! aExchangeRequest.argument.doSave) {
					// file is nsIFile  
					var ios = Cc["@mozilla.org/network/io-service;1"].  
							getService(Ci.nsIIOService);  
					var URL = ios.newFileURI(file);  
	
					exchWebService.commonFunctions.LOG(" == Going to open:"+URL.prePath + URL.path);

					var externalLoader = Cc["@mozilla.org/uriloader/external-protocol-service;1"]
							.getService(Ci.nsIExternalProtocolService);

					try {
						externalLoader.loadUrl(URL);
					}
					catch (ex) { exchWebService.commonFunctions.LOG(" == ERROR:"+ex); }
				}
			}
		}
	},

	onDownloadAttachmentError: function _onDownloadAttachmentError(aExchangeRequest, aCode, aMsg)
	{
		exchWebService.commonFunctions.LOG("exchWebService.attachments.onDownloadAttachmentError: aCode:"+aCode+", aMsg:"+aMsg);
	},

}

window.addEventListener("load", exchWebService.attachments.onLoad, true);


