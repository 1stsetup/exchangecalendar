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

Cu.import("resource://exchangecalendar/ecExchangeRequest.js");
Cu.import("resource://exchangecalendar/ecFunctions.js");

var EXPORTED_SYMBOLS = ["makeParentFolderIds2", "publicFoldersMap"];

const publicFoldersMap = { "publicfoldersroot" : true };

// This is the xml2jxon version.
function makeParentFolderIds2(aParentItem, aArgument)
{
	var ParentFolderIds = exchWebService.commonFunctions.xmlToJxon('<nsMessages:'+aParentItem+' xmlns:nsMessages="'+nsMessagesStr+'" xmlns:nsTypes="'+nsTypesStr+'"/>');

	if (! aArgument.folderID) {
		var DistinguishedFolderId = exchWebService.commonFunctions.xmlToJxon('<nsTypes:DistinguishedFolderId xmlns:nsTypes="'+nsTypesStr+'"/>');
		DistinguishedFolderId.setAttribute("Id", aArgument.folderBase);

		// If the folderBase is a public folder then do not provide mailbox if
		// available.
		if (! publicFoldersMap[aArgument.folderBase]) {
			if (aArgument.mailbox) {
				DistinguishedFolderId.addChildTag("Mailbox", "nsTypes", null).addChildTag("EmailAddress", "nsTypes", aArgument.mailbox);
			}
		}
		ParentFolderIds.addChildTagObject(DistinguishedFolderId);
	}
	else {
		var FolderId = exchWebService.commonFunctions.xmlToJxon('<nsTypes:FolderId xmlns:nsTypes="'+nsTypesStr+'"/>');
		FolderId.setAttribute("Id", aArgument.folderID);
		if ((aArgument.changeKey) && (aArgument.changeKey != "")) {
			FolderId.setAttribute("ChangeKey", aArgument.changeKey);
		}
		
		ParentFolderIds.addChildTagObject(FolderId);
	}

	return ParentFolderIds;
}

