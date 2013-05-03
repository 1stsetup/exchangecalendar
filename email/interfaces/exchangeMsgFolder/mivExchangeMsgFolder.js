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

function mivExchangeMsgFolder() {

	//this.logInfo("mivExchangeMsgFolder: init");

}

var mivExchangeMsgFolderGUID = "364ed353-d3ad-41d2-9df3-2fab209d9ac1";

mivExchangeMsgFolder.prototype = {

	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeMsgFolder,
				Ci.nsIMsgProtocolInfo,
				Ci.nsIClassInfo,
				Ci.nsISupports]),

	_className : "mivExchangeMsgFolder",

	classDescription : "Exchange EWS Msg Folder",

	classID : components.ID("{"+mivExchangeMsgFolderGUID+"}"),
	contractID : "@1st-setup.nl/exchange/msgfolder;1",
	flags : Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// nsISupports getHelperForLanguage(in PRUint32 language);
	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},

	getInterfaces : function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeMsgFolder,
				Ci.nsIMsgProtocolInfo,
				Ci.nsIClassInfo,
				Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},


//  const nsMsgBiffState nsMsgBiffState_NewMail = 0; // User has new mail waiting.
//  const nsMsgBiffState nsMsgBiffState_NoMail =  1; // No new mail is waiting.
//  const nsMsgBiffState nsMsgBiffState_Unknown = 2; // We dunno whether there is new mail.

  /// Returns an enumerator containing the messages within the current database.
//  readonly attribute nsISimpleEnumerator messages;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  void startFolderLoading();
//  void endFolderLoading();

  /* get new headers for db */
//  void updateFolder(in nsIMsgWindow aWindow);

//  readonly attribute AString prettiestName;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * URL for this folder
   */
//  readonly attribute ACString folderURL;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * should probably move to the server
   */
//  readonly attribute boolean showDeletedMessages;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * this folder's parent server
   */
//  readonly attribute nsIMsgIncomingServer server;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * is this folder the "phantom" server folder?
   */
//  readonly attribute boolean isServer;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute boolean canSubscribe;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute boolean canFileMessages;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute boolean noSelect;  // this is an imap no select folder
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute boolean imapShared; // this is an imap shared folder
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute boolean canDeleteMessages; // can't delete from imap read-only
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * does this folder allow subfolders?
   * for example, newsgroups cannot have subfolders, and the INBOX
   * on some IMAP servers cannot have subfolders
   */
//  readonly attribute boolean canCreateSubfolders;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * can you change the name of this folder?
   * for example, newsgroups
   * and some special folders can't be renamed
   */
//  readonly attribute boolean canRename;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute boolean canCompact;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * the phantom server folder
   */
//  readonly attribute nsIMsgFolder rootFolder;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * Get the server's list of filters. (Or in the case of news, the 
   * filter list for this newsgroup)
   * This list SHOULD be used for all incoming messages.
   *
   * Since the returned nsIMsgFilterList is mutable, it is not necessary to call
   * setFilterList after the filters have been changed.
   *
   * @param aMsgWindow  @ref msgwindow "The standard message window"
   * @return            The list of filters
   */
//  nsIMsgFilterList getFilterList(in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Set the server's list of filters.
   *
   * Note that this does not persist the filter list. To change the contents
   * of the existing filters, use getFilterList and mutate the values as
   * appopriate.
   *
   * @param aFilterList The new list of filters.
   */
//  void setFilterList(in nsIMsgFilterList filterList);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Get user editable filter list. This does not have to be the same as
   * the filterlist above, typically depending on the users preferences.
   * The filters in this list are not processed, but only to be edited by
   * the user.
   * @see getFilterList
   *
   * @param aMsgWindow  @ref msgwindow "The standard message window"
   * @return            The list of filters
   */
//  nsIMsgFilterList getEditableFilterList(in nsIMsgWindow aMsgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Set user editable filter list.
   * This does not persist the filterlist, @see setFilterList
   * @see getEditableFilterList
   * @see setFilterList
   *
   * @param aFilterList The new list of filters.
   */
//  void setEditableFilterList(in nsIMsgFilterList aFilterList);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void ForceDBClosed ();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},
  /**
   * Close and backup a folder database prior to reparsing
   *
   * @param  newName  New name of the corresponding message folder.
   *                  Used in rename to set the file name to match the renamed
   *                  folder. Set to empty to use the existing folder name.
   */
//  void closeAndBackupFolderDB(in ACString newName);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void Delete ();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void deleteSubFolders(in nsIArray folders, in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void propagateDelete(in nsIMsgFolder folder, in boolean deleteStorage,
//                       in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void recursiveDelete(in boolean deleteStorage, in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Create a subfolder of the current folder with the passed in name.
   * For IMAP, this will be an async operation and the folder won't exist
   * until it is created on the server.
   *
   * @param folderName name of the folder to create.
   * @param msgWindow msgWindow to display status feedback in.
   *
   * @exception NS_MSG_FOLDER_EXISTS
   */
//  void createSubfolder(in AString folderName, in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Adds the subfolder with the passed name to the folder hierarchy.
   * This is used internally during folder discovery; It shouldn't be
   * used to create folders since it won't create storage for the folder,
   * especially for imap. Unless you know exactly what you're doing, you
   * should be using createSubfolder + getChildNamed or createLocalSubfolder.
   *
   * @param aFolderName Name of the folder to add.
   * @returns The folder added.
   */
//  nsIMsgFolder addSubfolder(in AString aFolderName);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /* this method ensures the storage for the folder exists.
    For local folders, it creates the berkeley mailbox if missing.
    For imap folders, it subscribes to the folder if it exists,
    or creates it if it doesn't exist
  */
//  void createStorageIfMissing(in nsIUrlListener urlListener);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Compact this folder. For IMAP folders configured for offline use,
   * it will also compact the offline store, and the completed notification
   * will occur when the Expunge is finished, not the offline store compaction.
   *
   * @param aListener   Notified of completion, can be null.
   * @param aMsgWindow  For progress/status, can be null.
   */
//  void compact(in nsIUrlListener aListener, in nsIMsgWindow aMsgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Compact all folders in the account corresponding to this folder/
   * Optionally compact their offline stores as well (imap/news)
   * 
   * @param aListener   Notified of completion, can be null.
   * @param aMsgWindow  For progress/status, can be null.
   * @param aCompactOfflineAlso  This controls whether we compact all 
   *                             offline stores as well.
   */
//  void compactAll(in nsIUrlListener aListener, in nsIMsgWindow aMsgWindow,
//                  in boolean aCompactOfflineAlso);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void compactAllOfflineStores(in nsIUrlListener aListener,
//                               in nsIMsgWindow aMsgWindow,
//                               in nsIArray aOfflineFolderArray);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void emptyTrash(in nsIMsgWindow aMsgWindow, in nsIUrlListener aListener);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * change the name of the folder
   *
   * @param name the new name of the folder
   */
//  void rename(in AString name, in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void renameSubFolders( in nsIMsgWindow msgWindow, in nsIMsgFolder oldFolder);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  AString generateUniqueSubfolderName(in AString prefix,
//                                      in nsIMsgFolder otherFolder);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void updateSummaryTotals(in boolean force);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void summaryChanged();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * get the total number of unread messages in this folder,
   * or in all subfolders
   *
   * @param deep if true, descends into all subfolders and gets a grand total
   */
//  long getNumUnread(in boolean deep);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * get the total number of messages in this folder,
   * or in all subfolders
   *
   * @param deep if true, descends into all subfolders and gets a grand total
   */
//  long getTotalMessages(in boolean deep);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

 /**
  * does this folder have new messages
  *
  */
//  attribute boolean hasNewMessages;
	get hasNewMessages()
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

  /**
   * return the first new message in the folder
   *
   */
//  readonly attribute nsIMsgDBHdr firstNewMessage;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * clear new status flag of all of the new messages
   */
//  void clearNewMessages();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  readonly attribute unsigned long expungedBytes;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * Can this folder be deleted?
   * For example, special folders and isServer folders cannot be deleted.
   */
//  readonly attribute boolean deletable;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * should we be displaying recipients instead of the sender?
   * for example, in the Sent folder, recipients are more relevant
   * than the sender
   */
//  readonly attribute boolean displayRecipients;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * used to determine if it will take a long time to download all
   * the headers in this folder - so that we can do folder notifications
   * synchronously instead of asynchronously
   */
//  readonly attribute boolean manyHeadersToDownload;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute boolean requiresCleanup;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  void clearRequiresCleanup();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * this should go into a news-specific interface
   */
//  readonly attribute boolean knowsSearchNntpExtension;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * this should go into a news-specific interface
   */
//  readonly attribute boolean allowsPosting;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute ACString relativePathName;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * size of this folder on disk (not including .msf file)
   * for imap, it's the sum of the size of the messages
   */
//  attribute unsigned long sizeOnDisk;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  readonly attribute ACString username;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  readonly attribute ACString hostname;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * Sets a flag on the folder. The known flags are defined in
   * nsMsgFolderFlags.h.
   *
   * @param flag  The flag to set on the folder.
   */
//  void setFlag(in unsigned long flag);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Clears a flag on the folder. The known flags are defined in
   * nsMsgFolderFlags.h.
   *
   * @param flag  The flag to clear on the folder.
   */
//  void clearFlag(in unsigned long flag);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Determines if a flag is set on the folder or not. The known flags are
   * defined in nsMsgFolderFlags.h.
   *
   * @param flag  The flag to check on the folder.
   * @return      True if the flag exists.
   */
//  boolean getFlag(in unsigned long flag);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Toggles a flag on the folder. The known flags are defined in
   * nsMsgFolderFlags.h.
   *
   * @param flag  The flag to toggle
   */
//  void toggleFlag(in unsigned long flag);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Called to notify the database and/or listeners of a change of flag. The
   * known flags are defined in nsMsgFolderFlags.h 
   *
   * @note        This doesn't need to be called for normal flag changes via
   *              the *Flag functions on this interface.
   *
   * @param flag  The flag that was changed.
   */
//  void onFlagChange(in unsigned long flag);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Direct access to the set/get all the flags at once.
   */
//  attribute unsigned long flags;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

  /**
   * Gets the first folder that has the specified flags set.
   *
   * @param flags    The flag(s) to check for.
   * @return         The folder or the first available child folder that has
   *                 the specified flags set, or null if there are none.
   */
//  nsIMsgFolder getFolderWithFlags(in unsigned long flags);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Gets the folders that have the specified flag set.
   *
   * @param flags    The flag(s) to check for.
   * @return         An array of folders that have the specified flags set.
   *                 The array may have zero elements.
   */
//  nsIArray getFoldersWithFlags(in unsigned long flags);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Lists the folders that have the specified flag set.
   *
   * @param flags    The flag(s) to check for.
   * @param folders  The array in which to append the found folder(s).
   */
//  void listFoldersWithFlags(in unsigned long flags,
//                            in nsIMutableArray folders);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Check if this folder (or one of its ancestors) is special.
   *
   * @param flags          The "special" flags to check.
   * @param checkAncestors Should ancestors be checked too.
   */
//  boolean isSpecialFolder(in unsigned long flags,
//                          [optional] in boolean checkAncestors);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  ACString getUriForMsg(in nsIMsgDBHdr msgHdr);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Deletes the messages from the folder.
   *
   * @param messages      The array of nsIMsgDBHdr objects to be deleted.
   * @param msgWindow     The standard message window object, for alerts et al.
   * @param deleteStorage Whether or not the message should be truly deleted, as
                          opposed to moving to trash.
   * @param isMove        Whether or not this is a deletion for moving messages.
   * @param allowUndo     Whether this action should be undoable.
   */
//  void deleteMessages(in nsIArray messages,
//                      in nsIMsgWindow msgWindow,
//                      in boolean deleteStorage, in boolean isMove,
//                      in nsIMsgCopyServiceListener listener, in boolean allowUndo);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void copyMessages(in nsIMsgFolder srcFolder, in nsIArray messages,
//                    in boolean isMove, in nsIMsgWindow msgWindow,
//                    in nsIMsgCopyServiceListener listener, in boolean isFolder,
//                    in boolean allowUndo);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void copyFolder(in nsIMsgFolder srcFolder, in boolean isMoveFolder,
//                  in nsIMsgWindow msgWindow, in nsIMsgCopyServiceListener listener );
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void copyFileMessage(in nsIFile file, in nsIMsgDBHdr msgToReplace,
//                       in boolean isDraft, in unsigned long newMsgFlags,
//                       in ACString aKeywords,
//                       in nsIMsgWindow msgWindow,
//                       in nsIMsgCopyServiceListener listener);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void acquireSemaphore (in nsISupports semHolder);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void releaseSemaphore (in nsISupports semHolder);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  boolean testSemaphore (in nsISupports semHolder);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  readonly attribute boolean locked;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  void getNewMessages(in nsIMsgWindow aWindow, in nsIUrlListener aListener);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * write out summary data for this folder
   * to the given folder cache (i.e. panacea.dat)
   */
//  void writeToFolderCache(in nsIMsgFolderCache folderCache, in boolean deep);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * the charset of this folder
   */
//  attribute ACString charset;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  attribute boolean charsetOverride;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  attribute unsigned long biffState;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

  /**
   * the number of new messages since this folder was last visited
   * @param deep if true, descends into all subfolders and gets a grand total
   */

//   long getNumNewMessages (in boolean deep);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//   void setNumNewMessages(in long numNewMessages);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * are we running a url as a result of the user clicking get msg?
   */
//  attribute boolean gettingNewMessages;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

  /**
   * local path of this folder
   */
//  attribute nsIFile filePath;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  readonly attribute ACString baseMessageURI;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  ACString generateMessageURI(in nsMsgKey msgKey);

//  const nsMsgDispositionState nsMsgDispositionState_None = -1;
//  const nsMsgDispositionState nsMsgDispositionState_Replied = 0;
//  const nsMsgDispositionState nsMsgDispositionState_Forwarded = 1;
//  void addMessageDispositionState(in nsIMsgDBHdr aMessage,
//                                  in nsMsgDispositionState aDispositionFlag);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void markMessagesRead(in nsIArray messages, in boolean markRead);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void markAllMessagesRead(in nsIMsgWindow aMsgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void markMessagesFlagged(in nsIArray messages, in boolean markFlagged);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void markThreadRead(in nsIMsgThread thread);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void setLabelForMessages(in nsIArray messages, in nsMsgLabelValue label);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Gets the message database for the folder.
   *
   * Note that if the database is out of date, the implementation MAY choose to
   * throw an error. For a handle to the database which MAY NOT throw an error,
   * one can use getDBFolderInfoAndDB.
   *
   * @exception NS_MSG_ERROR_FOLDER_SUMMARY_MISSING If the database does not
   *                         exist.
   * @exception NS_MSG_ERROR_FOLDER_SUMMARY_OUT_OF_DATE If the database contains
   *                         out of date information.
   * @see nsIMsgFolder::getDBFolderInfoAndDB.
   */
//  attribute nsIMsgDatabase msgDatabase;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

  /**
   * Get the backup message database, used in reparsing. This database must
   * be created first using closeAndBackupFolderDB()
   *
   * @return   backup message database
   */
//  nsIMsgDatabase getBackupMsgDatabase();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Remove the backup message database file
   */
//  void removeBackupMsgDatabase();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Open the backup message database file
   */
//  void openBackupMsgDatabase();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  nsIMsgDatabase getDBFolderInfoAndDB(out nsIDBFolderInfo folderInfo);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  nsIMsgDBHdr GetMessageHeader(in nsMsgKey msgKey);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  readonly attribute boolean supportsOffline;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  boolean shouldStoreMsgOffline(in nsMsgKey msgKey);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  boolean hasMsgOffline(in nsMsgKey msgKey);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Get an input stream to read the offline contents of an imap or news
   * message.
   *
   * @param aMsgKey key of message to get input stream for.
   * @param[out] aOffset filled in with the offset into the stream of the message.
   * @param[out] aSize filled in with the size of the message in the offline store.
   *
   * @returns input stream to read the message from.
   */
//  nsIInputStream getOfflineFileStream(in nsMsgKey aMsgKey,
//                                      out long long aOffset,
//                                      out unsigned long aSize);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Get the folder where the msg could be present.
   * @param msgKey  key of the msg for which we are trying to get the folder;
   * @returns aMsgFolder  required folder;
   *
   */
//  nsIMsgFolder GetOfflineMsgFolder(in nsMsgKey msgKey);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Get an offline store output stream for the passed message header.
   *
   * @param aHdr hdr of message to get outputstream for
   * @returns An output stream to write to.
   */
//  nsIOutputStream getOfflineStoreOutputStream(in nsIMsgDBHdr aHdr);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Get an input stream for the passed message header. The stream will
   * be positioned at the start of the message.
   *
   * @param aHdr hdr of message to get the input stream for.
   * @param[out] aReusable set to true if the stream can be re-used, in which
                           case the caller might not want to close it.
   * @returns an input stream to read the message from
   */
//  nsIInputStream getMsgInputStream(in nsIMsgDBHdr aHdr, out boolean aReusable);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  readonly attribute nsIInputStream offlineStoreInputStream;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  void DownloadMessagesForOffline(in nsIArray messages,
//                                  in nsIMsgWindow window);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  nsIMsgFolder getChildWithURI(in ACString uri, in boolean deep,
//                               in boolean caseInsensitive);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void downloadAllForOffline(in nsIUrlListener listener, in nsIMsgWindow window);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   *  Turn notifications on/off for various notification types. Currently only
   *  supporting allMessageCountNotifications which refers to both total and
   *  unread message counts.
   */
//  const unsigned long allMessageCountNotifications    = 0;
//  void enableNotifications(in long notificationType, in boolean enable,
//                           in boolean dbBatching);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  boolean isCommandEnabled(in ACString command);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  boolean matchOrChangeFilterDestination(in nsIMsgFolder folder,
//                                         in boolean caseInsensitive);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  boolean confirmFolderDeletionForFilter(in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void alertFilterChanged(in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void throwAlertMsg(in string msgName, in nsIMsgWindow msgWindow);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  AString getStringWithFolderNameFromBundle(in string msgName);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void notifyCompactCompleted();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  long compareSortKeys(in nsIMsgFolder msgFolder);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Returns a sort key that can be used to sort a list of folders.
   *
   * Prefer nsIMsgFolder::compareSortKeys over this function.
   */
//  void getSortKey(out unsigned long length, [array, size_is(length), retval] out octet key);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  attribute nsIMsgRetentionSettings retentionSettings;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  attribute nsIMsgDownloadSettings downloadSettings;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  boolean callFilterPlugins(in nsIMsgWindow aMsgWindow);
  /**
   * used for order in the folder pane, folder pickers, etc.
   */
//  attribute long sortOrder;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  attribute nsIDBFolderInfo dBTransferInfo;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  ACString getStringProperty(in string propertyName);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void setStringProperty(in string propertyName, in ACString propertyValue);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /* does not persist across sessions */
//  attribute nsMsgKey lastMessageLoaded;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

  /* old nsIFolder properties and methods */
//  readonly attribute ACString URI;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  attribute AString name;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  attribute AString prettyName;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

//  readonly attribute AString abbreviatedName;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  attribute nsIMsgFolder parent;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

	set hasNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: get hasNewMessages\n");
	},

  /**
   * Returns an enumerator containing a list of nsIMsgFolder items that are
   * subfolders of the instance this is called on.
   */
//  readonly attribute nsISimpleEnumerator subFolders;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * Returns true if this folder has sub folders.
   */
//  readonly attribute boolean hasSubFolders;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * Returns the number of sub folders that this folder has.
   */
//  readonly attribute unsigned long numSubFolders;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * Determines if this folder is an ancestor of the supplied folder.
   *
   * @param folder  The folder that may or may not be a descendent of this
   *                folder.
   */
//  boolean isAncestorOf(in nsIMsgFolder folder);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Looks in immediate children of this folder for the given name.
   *
   * @param name the name of the target subfolder
   */
//  boolean containsChildNamed(in AString name);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Return the child folder which the specified name.
   *
   * @param aName  The name of the child folder to find
   * @return       The child folder
   * @exception NS_ERROR_FAILURE Thrown if the folder with aName does not exist
   */
//  nsIMsgFolder getChildNamed(in AString aName);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Finds the sub folder with the specified name.
   *
   * @param escapedSubFolderName  The name of the sub folder to find.
   * @note                        Even if the folder doesn't currently exist,
   *                              a nsIMsgFolder may be returned.
   */
//  nsIMsgFolder findSubFolder(in ACString escapedSubFolderName);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void AddFolderListener(in nsIFolderListener listener);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void RemoveFolderListener(in nsIFolderListener listener);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void NotifyPropertyChanged(in nsIAtom property,
//                             in ACString oldValue,
//                             in ACString newValue);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void NotifyIntPropertyChanged(in nsIAtom property,
//                                in long oldValue,
//                                in long newValue);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void NotifyBoolPropertyChanged(in nsIAtom property,
//                                 in boolean oldValue,
//                                 in boolean newValue);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void NotifyPropertyFlagChanged(in nsIMsgDBHdr item,
//                                 in nsIAtom property,
//                                 in unsigned long oldValue,
//                                 in unsigned long newValue);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void NotifyUnicharPropertyChanged(in nsIAtom property,
//                                    in AString oldValue,
//                                    in AString newValue);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void NotifyItemAdded(in nsISupports item);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void NotifyItemRemoved(in nsISupports item);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void NotifyFolderEvent(in nsIAtom event);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  //  void NotifyFolderLoaded();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  //  void NotifyDeleteOrMoveMessagesCompleted(in nsIMsgFolder folder);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  // lists all descendents, not just first level children
//  void ListDescendents(in nsISupportsArray descendents);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void Shutdown(in boolean shutdownChildren);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  readonly attribute boolean inVFEditSearchScope;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

//  void setInVFEditSearchScope(in boolean aSearchThisFolder, in boolean aSetOnSubFolders);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void copyDataToOutputStreamForAppend(in nsIInputStream aIStream,
//                     in long aLength, in nsIOutputStream outputStream);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void copyDataDone();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void setJunkScoreForMessages(in nsIArray aMessages, in ACString aJunkScore);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void applyRetentionSettings();
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Get the beginning of the message bodies for the passed in keys and store
   * them in the msg hdr property "preview". This is intended for
   * new mail alerts, title tips on folders with new messages, and perhaps
   * titletips/message preview in the thread pane.
   *
   * @param aKeysToFetch   keys of msgs to fetch
   * @param aNumKeys       number of keys to fetch
   * @param aLocalOnly     whether to fetch msgs from server (imap msgs might
   *                       be in memory cache from junk filter)
   * @param aUrlListener   url listener to notify if we run url to fetch msgs
   *
   * @result aAsyncResults if true, we ran a url to fetch one or more of msg bodies
   *
   */
//  boolean fetchMsgPreviewText([array, size_is (aNumKeys)] in nsMsgKey aKeysToFetch,
//                      in unsigned long aNumKeys, in boolean aLocalOnly,
//                      in nsIUrlListener aUrlListener);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  // used to set/clear tags - we could have a single method to setKeywords which
  // would figure out the diffs, but these methods might be more convenient.
  // keywords are space delimited, in the case of multiple keywords
//  void addKeywordsToMessages(in nsIArray aMessages, in ACString aKeywords);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  void removeKeywordsFromMessages(in nsIArray aMessages, in ACString aKeywords);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Extract the message text from aStream.
   *
   * @param aStream stream to read from
   * @param aCharset character set to use to interpret the body. If an empty string, then the
   *        charset is retrieved from the headers. msgHdr.charset is recommended in case you have it.
   * @param aBytesToRead number of bytes to read from the stream. The function will read till the end
   *        of the line, and there will also be some read ahead due to NS_ReadLine
   * @param aMaxOutputLen desired length of the converted message text. Used to control how many characters
   *        of msg text we want to store.
   * @param aCompressQuotes Replace quotes and citations with " ... " in the preview text
   * @param aStripHTMLTags strip HTML tags from the output, if present
   * @param[out] aContentType the content type of the MIME part that was used to generate the text --
   *             for an HTML part, this will be "text/html" even though aStripHTMLTags might be true
   */
//  AUTF8String getMsgTextFromStream(in nsIInputStream aStream, in ACString aCharset,
//                                   in unsigned long aBytesToRead, in unsigned long aMaxOutputLen, 
//                                   in boolean aCompressQuotes, in boolean aStripHTMLTags,
//                                   out ACString aContentType);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

//  AString convertMsgSnippetToPlainText(in AString aMessageText);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  // this allows a folder to have a special identity. E.g., you might want to
  // associate an identity with a particular newsgroup, or for IMAP shared folders in
  // the other users namespace, you might want to create a delegated identity
//  readonly attribute nsIMsgIdentity customIdentity;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

  /**
   * @{
   * Processing flags, used to manage message processing.
   *
   * @param msgKey   message key
   * @return         processing flags
   */
//  unsigned long getProcessingFlags(in nsMsgKey msgKey);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * @param msgKey   message key
   * @param mask     mask to OR into the flags
   */
//  void orProcessingFlags(in nsMsgKey msgKey, in unsigned long mask);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * @param msgKey   message key
   * @param mask     mask to AND into the flags
   */
//  void andProcessingFlags(in nsMsgKey msgKey, in unsigned long mask);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /** @} */

  /**
   * Gets an inherited string property from the folder.
   *
   * If the forcePropertyEmpty boolean is set (see below), return an
   * empty string.
   *
   * If the specified folder has a non-empty value for the property,
   * return that value. Otherwise, return getInheritedStringProperty
   * for the folder's parent.
   *
   * If a folder is the root folder for a server, then instead of
   * checking the folder property, check the property of the same name
   * for the server using nsIMsgIncomingServer.getCharValue(...)
   *
   * Note nsIMsgIncomingServer.getCharValue for a server inherits from
   * the preference mail.server.default.(propertyName) as a global value
   * 
   * (ex: if propertyName = "IAmAGlobal" and no folder nor server properties
   * are set, then the inherited property will return the preference value
   * mail.server.default.IAmAGlobal)
   *
   * If the propertyName is undefined, returns an empty, void string.
   *
   * @param propertyName  The name of the property for the value to retrieve.
   */
//  ACString getInheritedStringProperty(in string propertyName);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Set a boolean to force an inherited propertyName to return empty instead
   * of inheriting from a parent folder, server, or the global
   *
   * @param propertyName         The name of the property
   * @param aForcePropertyEmpty  true if an empty inherited property should be returned
   */
//  void setForcePropertyEmpty(in string propertyName, in boolean aForcePropertyEmpty);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Get a boolean to force an inherited propertyName to return empty instead
   * of inheriting from a parent folder, server, or the global
   *
   * @param propertyName      The name of the property
   *
   * @return                  true if an empty inherited property should be returned
   */
//  boolean getForcePropertyEmpty(in string propertyName);
	getFilterList: function _getFilterList(msgWindow)
	{
dump("mivExchangeMsgFolder: get getFilterList\n");
	},

  /**
   * Pluggable store for this folder. Currently, this will always be the same
   * as the pluggable store for the server.
   */
//  readonly attribute nsIMsgPluggableStore msgStore;
	get msgStore()
	{
dump("mivExchangeMsgFolder: get msgStore\n");
		return true;
	},

};

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeMsgFolder) {
			NSGetFactory.mivExchangeMsgFolder = XPCOMUtils.generateNSGetFactory([mivExchangeMsgFolder]);

	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeMsgFolder(cid);
} 

