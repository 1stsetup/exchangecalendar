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

var EXPORTED_SYMBOLS = ["mivExchangeMsgFolder"];

function mivExchangeMsgFolder() {

	//this.logInfo("mivExchangeMsgFolder: init");

}

var mivExchangeMsgFolderGUID = "364ed353-d3ad-41d2-9df3-2fab209d9ac1";

mivExchangeMsgFolder.prototype = {

/*	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeMsgFolder,
				Ci.nsIMsgFolder,
				Ci.nsIClassInfo,
				Ci.nsISupports]),
*/
	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeMsgFolder,
				Ci.nsIMsgFolder,
				Ci.nsISupports]),

	_className : "mivExchangeMsgFolder",

	classDescription : "Exchange EWS Msg Folder",

	classID : components.ID("{"+mivExchangeMsgFolderGUID+"}"),
	contractID : "@1st-setup.nl/exchange/msgfolder;1",
//	flags : Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// nsISupports getHelperForLanguage(in PRUint32 language);
	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},

	getInterfaces : function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeMsgFolder,
				Ci.nsIMsgFolder,
				Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},


//  const nsMsgBiffState nsMsgBiffState_NewMail = 0; // User has new mail waiting.
//  const nsMsgBiffState nsMsgBiffState_NoMail =  1; // No new mail is waiting.
//  const nsMsgBiffState nsMsgBiffState_Unknown = 2; // We dunno whether there is new mail.

  /// Returns an enumerator containing the messages within the current database.
//  readonly attribute nsISimpleEnumerator messages;
	get messages()
	{
dump("mivExchangeMsgFolder: get messages\n");
		return true;
	},

//  void startFolderLoading();
	startFolderLoading: function _startFolderLoading()
	{
dump("mivExchangeMsgFolder: function startFolderLoading\n");
	},

//  void endFolderLoading();
	endFolderLoading: function _endFolderLoading()
	{
dump("mivExchangeMsgFolder: function endFolderLoading\n");
	},

  /* get new headers for db */
//  void updateFolder(in nsIMsgWindow aWindow);
	updateFolder: function _updateFolder(aWindow)
	{
dump("mivExchangeMsgFolder: function updateFolder\n");
	},

//  readonly attribute AString prettiestName;
	get prettiestName()
	{
dump("mivExchangeMsgFolder: get prettiestName\n");
		return true;
	},

  /**
   * URL for this folder
   */
//  readonly attribute ACString folderURL;
	get folderURL()
	{
dump("mivExchangeMsgFolder: get folderURL\n");
		return true;
	},

  /**
   * should probably move to the server
   */
//  readonly attribute boolean showDeletedMessages;
	get showDeletedMessages()
	{
dump("mivExchangeMsgFolder: get showDeletedMessages\n");
		return true;
	},

  /**
   * this folder's parent server
   */
//  readonly attribute nsIMsgIncomingServer server;
	get server()
	{
dump("mivExchangeMsgFolder: get server\n");
		return true;
	},

  /**
   * is this folder the "phantom" server folder?
   */
//  readonly attribute boolean isServer;
	get isServer()
	{
dump("mivExchangeMsgFolder: get isServer\n");
		return true;
	},

//  readonly attribute boolean canSubscribe;
	get canSubscribe()
	{
dump("mivExchangeMsgFolder: get canSubscribe\n");
		return true;
	},

//  readonly attribute boolean canFileMessages;
	get canFileMessages()
	{
dump("mivExchangeMsgFolder: get canFileMessages\n");
		return true;
	},

//  readonly attribute boolean noSelect;  // this is an imap no select folder
	get noSelect()
	{
dump("mivExchangeMsgFolder: get noSelect\n");
		return true;
	},

//  readonly attribute boolean imapShared; // this is an imap shared folder
	get imapShared()
	{
dump("mivExchangeMsgFolder: get imapShared\n");
		return true;
	},

//  readonly attribute boolean canDeleteMessages; // can't delete from imap read-only
	get canDeleteMessages()
	{
dump("mivExchangeMsgFolder: get canDeleteMessages\n");
		return true;
	},

  /**
   * does this folder allow subfolders?
   * for example, newsgroups cannot have subfolders, and the INBOX
   * on some IMAP servers cannot have subfolders
   */
//  readonly attribute boolean canCreateSubfolders;
	get canCreateSubfolders()
	{
dump("mivExchangeMsgFolder: get canCreateSubfolders\n");
		return true;
	},

  /**
   * can you change the name of this folder?
   * for example, newsgroups
   * and some special folders can't be renamed
   */
//  readonly attribute boolean canRename;
	get canRename()
	{
dump("mivExchangeMsgFolder: get canRename\n");
		return true;
	},

//  readonly attribute boolean canCompact;
	get canCompact()
	{
dump("mivExchangeMsgFolder: get canCompact\n");
		return true;
	},

  /**
   * the phantom server folder
   */
//  readonly attribute nsIMsgFolder rootFolder;
	get rootFolder()
	{
dump("mivExchangeMsgFolder: get rootFolder\n");
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
dump("mivExchangeMsgFolder: function getFilterList\n");
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
	setFilterList: function _setFilterList(filterList)
	{
dump("mivExchangeMsgFolder: function setFilterList\n");
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
	getEditableFilterList: function _getEditableFilterList(aMsgWindow)
	{
dump("mivExchangeMsgFolder: function getEditableFilterList\n");
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
	setEditableFilterList: function _setEditableFilterList(aFilterList)
	{
dump("mivExchangeMsgFolder: function setEditableFilterList\n");
	},

//  void ForceDBClosed ();
	ForceDBClosed: function _ForceDBClosed()
	{
dump("mivExchangeMsgFolder: function ForceDBClosed\n");
	},
  /**
   * Close and backup a folder database prior to reparsing
   *
   * @param  newName  New name of the corresponding message folder.
   *                  Used in rename to set the file name to match the renamed
   *                  folder. Set to empty to use the existing folder name.
   */
//  void closeAndBackupFolderDB(in ACString newName);
	closeAndBackupFolderDB: function _closeAndBackupFolderDB(newName)
	{
dump("mivExchangeMsgFolder: function closeAndBackupFolderDB\n");
	},

//  void Delete ();
	Delete: function _Delete()
	{
dump("mivExchangeMsgFolder: function Delete\n");
	},

//  void deleteSubFolders(in nsIArray folders, in nsIMsgWindow msgWindow);
	deleteSubFolders: function _deleteSubFolders(folders, msgWindow)
	{
dump("mivExchangeMsgFolder: function deleteSubFolders\n");
	},

//  void propagateDelete(in nsIMsgFolder folder, in boolean deleteStorage,
//                       in nsIMsgWindow msgWindow);
	propagateDelete: function _propagateDelete(folder, deleteStorage, msgWindow)
	{
dump("mivExchangeMsgFolder: function propagateDelete\n");
	},

//  void recursiveDelete(in boolean deleteStorage, in nsIMsgWindow msgWindow);
	recursiveDelete: function _recursiveDelete(deleteStorage, msgWindow)
	{
dump("mivExchangeMsgFolder: function recursiveDelete\n");
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
	createSubfolder: function _createSubfolder(folderName, msgWindow)
	{
dump("mivExchangeMsgFolder: function createSubfolder\n");
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
	addSubfolder: function _addSubfolder(aFolderName)
	{
dump("mivExchangeMsgFolder: function addSubfolder\n");
	},

  /* this method ensures the storage for the folder exists.
    For local folders, it creates the berkeley mailbox if missing.
    For imap folders, it subscribes to the folder if it exists,
    or creates it if it doesn't exist
  */
//  void createStorageIfMissing(in nsIUrlListener urlListener);
	createStorageIfMissing: function _createStorageIfMissing(urlListener)
	{
dump("mivExchangeMsgFolder: function createStorageIfMissing\n");
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
	compact: function _compact(aListener, aMsgWindow)
	{
dump("mivExchangeMsgFolder: function compact\n");
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
	compactAll: function _compactAll(aListener, aMsgWindow, aCompactOfflineAlso)
	{
dump("mivExchangeMsgFolder: function compactAll\n");
	},

//  void compactAllOfflineStores(in nsIUrlListener aListener,
//                               in nsIMsgWindow aMsgWindow,
//                               in nsIArray aOfflineFolderArray);
	compactAllOfflineStores: function _compactAllOfflineStores(aListener, aMsgWindow, aOfflineFolderArray)
	{
dump("mivExchangeMsgFolder: function compactAllOfflineStores\n");
	},

//  void emptyTrash(in nsIMsgWindow aMsgWindow, in nsIUrlListener aListener);
	emptyTrash: function _emptyTrash(aMsgWindow, aListener)
	{
dump("mivExchangeMsgFolder: function emptyTrash\n");
	},

  /**
   * change the name of the folder
   *
   * @param name the new name of the folder
   */
//  void rename(in AString name, in nsIMsgWindow msgWindow);
	rename: function _rename(name, msgWindow)
	{
dump("mivExchangeMsgFolder: function rename\n");
	},

//  void renameSubFolders( in nsIMsgWindow msgWindow, in nsIMsgFolder oldFolder);
	renameSubFolders: function _renameSubFolders(msgWindow, oldFolder)
	{
dump("mivExchangeMsgFolder: function renameSubFolders\n");
	},

//  AString generateUniqueSubfolderName(in AString prefix,
//                                      in nsIMsgFolder otherFolder);
	generateUniqueSubfolderName: function _generateUniqueSubfolderName(prefix, otherFolder)
	{
dump("mivExchangeMsgFolder: function generateUniqueSubfolderName\n");
	},

//  void updateSummaryTotals(in boolean force);
	updateSummaryTotals: function _updateSummaryTotals(force)
	{
dump("mivExchangeMsgFolder: function updateSummaryTotals\n");
	},

//  void summaryChanged();
	summaryChanged: function _summaryChanged()
	{
dump("mivExchangeMsgFolder: function summaryChanged\n");
	},

  /**
   * get the total number of unread messages in this folder,
   * or in all subfolders
   *
   * @param deep if true, descends into all subfolders and gets a grand total
   */
//  long getNumUnread(in boolean deep);
	getNumUnread: function _getNumUnread(deep)
	{
dump("mivExchangeMsgFolder: function getNumUnread\n");
	},

  /**
   * get the total number of messages in this folder,
   * or in all subfolders
   *
   * @param deep if true, descends into all subfolders and gets a grand total
   */
//  long getTotalMessages(in boolean deep);
	getTotalMessages: function _getTotalMessages(deep)
	{
dump("mivExchangeMsgFolder: function getTotalMessages\n");
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
dump("mivExchangeMsgFolder: set hasNewMessages\n");
	},

  /**
   * return the first new message in the folder
   *
   */
//  readonly attribute nsIMsgDBHdr firstNewMessage;
	get firstNewMessage()
	{
dump("mivExchangeMsgFolder: get firstNewMessage\n");
		return true;
	},

  /**
   * clear new status flag of all of the new messages
   */
//  void clearNewMessages();
	clearNewMessages: function _clearNewMessages()
	{
dump("mivExchangeMsgFolder: function clearNewMessages\n");
	},

//  readonly attribute unsigned long expungedBytes;
	get expungedBytes()
	{
dump("mivExchangeMsgFolder: get expungedBytes\n");
		return true;
	},

  /**
   * Can this folder be deleted?
   * For example, special folders and isServer folders cannot be deleted.
   */
//  readonly attribute boolean deletable;
	get deletable()
	{
dump("mivExchangeMsgFolder: get deletable\n");
		return true;
	},

  /**
   * should we be displaying recipients instead of the sender?
   * for example, in the Sent folder, recipients are more relevant
   * than the sender
   */
//  readonly attribute boolean displayRecipients;
	get displayRecipients()
	{
dump("mivExchangeMsgFolder: get displayRecipients\n");
		return true;
	},

  /**
   * used to determine if it will take a long time to download all
   * the headers in this folder - so that we can do folder notifications
   * synchronously instead of asynchronously
   */
//  readonly attribute boolean manyHeadersToDownload;
	get manyHeadersToDownload()
	{
dump("mivExchangeMsgFolder: get manyHeadersToDownload\n");
		return true;
	},

//  readonly attribute boolean requiresCleanup;
	get requiresCleanup()
	{
dump("mivExchangeMsgFolder: get requiresCleanup\n");
		return true;
	},

//  void clearRequiresCleanup();
	clearRequiresCleanup: function _clearRequiresCleanup()
	{
dump("mivExchangeMsgFolder: function clearRequiresCleanup\n");
	},

  /**
   * this should go into a news-specific interface
   */
//  readonly attribute boolean knowsSearchNntpExtension;
	get knowsSearchNntpExtension()
	{
dump("mivExchangeMsgFolder: get knowsSearchNntpExtension\n");
		return true;
	},

  /**
   * this should go into a news-specific interface
   */
//  readonly attribute boolean allowsPosting;
	get allowsPosting()
	{
dump("mivExchangeMsgFolder: get allowsPosting\n");
		return true;
	},

//  readonly attribute ACString relativePathName;
	get relativePathName()
	{
dump("mivExchangeMsgFolder: get relativePathName\n");
		return true;
	},

  /**
   * size of this folder on disk (not including .msf file)
   * for imap, it's the sum of the size of the messages
   */
//  attribute unsigned long sizeOnDisk;
	get sizeOnDisk()
	{
dump("mivExchangeMsgFolder: get sizeOnDisk\n");
		return true;
	},

	set sizeOnDisk(aValue)
	{
dump("mivExchangeMsgFolder: set sizeOnDisk\n");
	},

//  readonly attribute ACString username;
	get username()
	{
dump("mivExchangeMsgFolder: get username\n");
		return true;
	},

//  readonly attribute ACString hostname;
	get hostname()
	{
dump("mivExchangeMsgFolder: get hostname\n");
		return true;
	},

  /**
   * Sets a flag on the folder. The known flags are defined in
   * nsMsgFolderFlags.h.
   *
   * @param flag  The flag to set on the folder.
   */
//  void setFlag(in unsigned long flag);
	setFlag: function _setFlag(flag)
	{
dump("mivExchangeMsgFolder: function setFlag\n");
	},

  /**
   * Clears a flag on the folder. The known flags are defined in
   * nsMsgFolderFlags.h.
   *
   * @param flag  The flag to clear on the folder.
   */
//  void clearFlag(in unsigned long flag);
	clearFlag: function _clearFlag(flag)
	{
dump("mivExchangeMsgFolder: function clearFlag\n");
	},

  /**
   * Determines if a flag is set on the folder or not. The known flags are
   * defined in nsMsgFolderFlags.h.
   *
   * @param flag  The flag to check on the folder.
   * @return      True if the flag exists.
   */
//  boolean getFlag(in unsigned long flag);
	getFlag: function _getFlag(flag)
	{
dump("mivExchangeMsgFolder: function getFlag\n");
	},

  /**
   * Toggles a flag on the folder. The known flags are defined in
   * nsMsgFolderFlags.h.
   *
   * @param flag  The flag to toggle
   */
//  void toggleFlag(in unsigned long flag);
	toggleFlag: function _toggleFlag(flag)
	{
dump("mivExchangeMsgFolder: function toggleFlag\n");
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
	onFlagChange: function _onFlagChange(flag)
	{
dump("mivExchangeMsgFolder: function onFlagChange\n");
	},

  /**
   * Direct access to the set/get all the flags at once.
   */
//  attribute unsigned long flags;
	get flags()
	{
dump("mivExchangeMsgFolder: get flags\n");
		return 0;
	},

	set flags(aValue)
	{
dump("mivExchangeMsgFolder: set flags\n");
	},

  /**
   * Gets the first folder that has the specified flags set.
   *
   * @param flags    The flag(s) to check for.
   * @return         The folder or the first available child folder that has
   *                 the specified flags set, or null if there are none.
   */
//  nsIMsgFolder getFolderWithFlags(in unsigned long flags);
	getFolderWithFlags: function _getFolderWithFlags(flags)
	{
dump("mivExchangeMsgFolder: function getFolderWithFlags\n");
	},

  /**
   * Gets the folders that have the specified flag set.
   *
   * @param flags    The flag(s) to check for.
   * @return         An array of folders that have the specified flags set.
   *                 The array may have zero elements.
   */
//  nsIArray getFoldersWithFlags(in unsigned long flags);
	getFoldersWithFlags: function _getFoldersWithFlags(flags)
	{
dump("mivExchangeMsgFolder: function getFoldersWithFlags\n");
	},

  /**
   * Lists the folders that have the specified flag set.
   *
   * @param flags    The flag(s) to check for.
   * @param folders  The array in which to append the found folder(s).
   */
//  void listFoldersWithFlags(in unsigned long flags,
//                            in nsIMutableArray folders);
	listFoldersWithFlags: function _listFoldersWithFlags(flags, folders)
	{
dump("mivExchangeMsgFolder: function listFoldersWithFlags\n");
	},

  /**
   * Check if this folder (or one of its ancestors) is special.
   *
   * @param flags          The "special" flags to check.
   * @param checkAncestors Should ancestors be checked too.
   */
//  boolean isSpecialFolder(in unsigned long flags,
//                          [optional] in boolean checkAncestors);
	isSpecialFolder: function _isSpecialFolder(flags, checkAncestors)
	{
dump("mivExchangeMsgFolder: function isSpecialFolder\n");
	},

//  ACString getUriForMsg(in nsIMsgDBHdr msgHdr);
	getUriForMsg: function _getUriForMsg(msgHdr)
	{
dump("mivExchangeMsgFolder: function getUriForMsg\n");
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
	deleteMessages: function _deleteMessages(messages, msgWindow, deleteStorage, isMove, listener, allowUndo)
	{
dump("mivExchangeMsgFolder: function deleteMessages\n");
	},

//  void copyMessages(in nsIMsgFolder srcFolder, in nsIArray messages,
//                    in boolean isMove, in nsIMsgWindow msgWindow,
//                    in nsIMsgCopyServiceListener listener, in boolean isFolder,
//                    in boolean allowUndo);
	copyMessages: function _copyMessages(srcFolder, messages, isMove, msgWindow, listener, isFolder, allowUndo)
	{
dump("mivExchangeMsgFolder: function copyMessages\n");
	},

//  void copyFolder(in nsIMsgFolder srcFolder, in boolean isMoveFolder,
//                  in nsIMsgWindow msgWindow, in nsIMsgCopyServiceListener listener );
	copyFolder: function _copyFolder(srcFolder, isMoveFolder, msgWindow, listener)
	{
dump("mivExchangeMsgFolder: function copyFolder\n");
	},

//  void copyFileMessage(in nsIFile file, in nsIMsgDBHdr msgToReplace,
//                       in boolean isDraft, in unsigned long newMsgFlags,
//                       in ACString aKeywords,
//                       in nsIMsgWindow msgWindow,
//                       in nsIMsgCopyServiceListener listener);
	copyFileMessage: function _copyFileMessage(file, msgToReplace, isDraft, newMsgFlags, aKeywords,
                                                    msgWindow, listener)
	{
dump("mivExchangeMsgFolder: function copyFileMessage\n");
	},

//  void acquireSemaphore (in nsISupports semHolder);
	acquireSemaphore: function _acquireSemaphore(semHolder)
	{
dump("mivExchangeMsgFolder: function acquireSemaphore\n");
	},

//  void releaseSemaphore (in nsISupports semHolder);
	releaseSemaphore: function _releaseSemaphore(semHolder)
	{
dump("mivExchangeMsgFolder: function releaseSemaphore\n");
	},

//  boolean testSemaphore (in nsISupports semHolder);
	testSemaphore: function _testSemaphore(semHolder)
	{
dump("mivExchangeMsgFolder: function testSemaphore\n");
	},

//  readonly attribute boolean locked;
	get locked()
	{
dump("mivExchangeMsgFolder: get locked\n");
		return true;
	},

//  void getNewMessages(in nsIMsgWindow aWindow, in nsIUrlListener aListener);
	getNewMessages: function _getNewMessages(aWindow, aListener)
	{
dump("mivExchangeMsgFolder: function getNewMessages\n");
	},

  /**
   * write out summary data for this folder
   * to the given folder cache (i.e. panacea.dat)
   */
//  void writeToFolderCache(in nsIMsgFolderCache folderCache, in boolean deep);
	writeToFolderCache: function _writeToFolderCache(folderCache, deep)
	{
dump("mivExchangeMsgFolder: function writeToFolderCache\n");
	},

  /**
   * the charset of this folder
   */
//  attribute ACString charset;
	get charset()
	{
dump("mivExchangeMsgFolder: get charset\n");
		return true;
	},

	set charset(aValue)
	{
dump("mivExchangeMsgFolder: set charset\n");
	},

//  attribute boolean charsetOverride;
	get charsetOverride()
	{
dump("mivExchangeMsgFolder: get charsetOverride\n");
		return true;
	},

	set charsetOverride(aValue)
	{
dump("mivExchangeMsgFolder: set charsetOverride\n");
	},

//  attribute unsigned long biffState;
	get biffState()
	{
dump("mivExchangeMsgFolder: get biffState\n");
		return true;
	},

	set biffState(aValue)
	{
dump("mivExchangeMsgFolder: set biffState\n");
	},

  /**
   * the number of new messages since this folder was last visited
   * @param deep if true, descends into all subfolders and gets a grand total
   */

//   long getNumNewMessages (in boolean deep);
	getNumNewMessages: function _getNumNewMessages(deep)
	{
dump("mivExchangeMsgFolder: function getNumNewMessages\n");
	},

//   void setNumNewMessages(in long numNewMessages);
	setNumNewMessages: function _setNumNewMessages(numNewMessages)
	{
dump("mivExchangeMsgFolder: function setNumNewMessages\n");
	},

  /**
   * are we running a url as a result of the user clicking get msg?
   */
//  attribute boolean gettingNewMessages;
	get gettingNewMessages()
	{
dump("mivExchangeMsgFolder: get gettingNewMessages\n");
		return true;
	},

	set gettingNewMessages(aValue)
	{
dump("mivExchangeMsgFolder: set gettingNewMessages\n");
	},

  /**
   * local path of this folder
   */
//  attribute nsIFile filePath;
	get filePath()
	{
dump("mivExchangeMsgFolder: get filePath\n");
		return true;
	},

	set filePath(aValue)
	{
dump("mivExchangeMsgFolder: set filePath\n");
	},

//  readonly attribute ACString baseMessageURI;
	get baseMessageURI()
	{
dump("mivExchangeMsgFolder: get baseMessageURI\n");
		return true;
	},

//  ACString generateMessageURI(in nsMsgKey msgKey);
	generateMessageURI: function _generateMessageURI(msgKey)
	{
dump("mivExchangeMsgFolder: function generateMessageURI\n");
	},

//  const nsMsgDispositionState nsMsgDispositionState_None = -1;
//  const nsMsgDispositionState nsMsgDispositionState_Replied = 0;
//  const nsMsgDispositionState nsMsgDispositionState_Forwarded = 1;
//  void addMessageDispositionState(in nsIMsgDBHdr aMessage,
//                                  in nsMsgDispositionState aDispositionFlag);
	addMessageDispositionState: function _addMessageDispositionState(aMessage, aDispositionFlag)
	{
dump("mivExchangeMsgFolder: function addMessageDispositionState\n");
	},

//  void markMessagesRead(in nsIArray messages, in boolean markRead);
	markMessagesRead: function _markMessagesRead(messages, markRead)
	{
dump("mivExchangeMsgFolder: function markMessagesRead\n");
	},

//  void markAllMessagesRead(in nsIMsgWindow aMsgWindow);
	markAllMessagesRead: function _markAllMessagesRead(aMsgWindow)
	{
dump("mivExchangeMsgFolder: function markAllMessagesRead\n");
	},

//  void markMessagesFlagged(in nsIArray messages, in boolean markFlagged);
	markMessagesFlagged: function _markMessagesFlagged(messages, markFlagged)
	{
dump("mivExchangeMsgFolder: function markMessagesFlagged\n");
	},

//  void markThreadRead(in nsIMsgThread thread);
	markThreadRead: function _markThreadRead(thread)
	{
dump("mivExchangeMsgFolder: function markThreadRead\n");
	},

//  void setLabelForMessages(in nsIArray messages, in nsMsgLabelValue label);
	setLabelForMessages: function _setLabelForMessages(messages, label)
	{
dump("mivExchangeMsgFolder: function setLabelForMessages\n");
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
	get msgDatabase()
	{
dump("mivExchangeMsgFolder: get msgDatabase\n");
		return true;
	},

	set msgDatabase(aValue)
	{
dump("mivExchangeMsgFolder: set msgDatabase\n");
	},

  /**
   * Get the backup message database, used in reparsing. This database must
   * be created first using closeAndBackupFolderDB()
   *
   * @return   backup message database
   */
//  nsIMsgDatabase getBackupMsgDatabase();
	getBackupMsgDatabase: function _getBackupMsgDatabase()
	{
dump("mivExchangeMsgFolder: function getBackupMsgDatabase\n");
	},

  /**
   * Remove the backup message database file
   */
//  void removeBackupMsgDatabase();
	removeBackupMsgDatabase: function _removeBackupMsgDatabase()
	{
dump("mivExchangeMsgFolder: function removeBackupMsgDatabase\n");
	},

  /**
   * Open the backup message database file
   */
//  void openBackupMsgDatabase();
	openBackupMsgDatabase: function _openBackupMsgDatabase()
	{
dump("mivExchangeMsgFolder: function openBackupMsgDatabase\n");
	},

//  nsIMsgDatabase getDBFolderInfoAndDB(out nsIDBFolderInfo folderInfo);
	getDBFolderInfoAndDB: function _getDBFolderInfoAndDB(folderInfo)
	{
dump("mivExchangeMsgFolder: function getDBFolderInfoAndDB\n");
	},

//  nsIMsgDBHdr GetMessageHeader(in nsMsgKey msgKey);
	GetMessageHeader: function _GetMessageHeader(msgKey)
	{
dump("mivExchangeMsgFolder: function GetMessageHeader\n");
	},

//  readonly attribute boolean supportsOffline;
	get supportsOffline()
	{
dump("mivExchangeMsgFolder: get supportsOffline\n");
		return true;
	},

//  boolean shouldStoreMsgOffline(in nsMsgKey msgKey);
	shouldStoreMsgOffline: function _shouldStoreMsgOffline(msgKey)
	{
dump("mivExchangeMsgFolder: function shouldStoreMsgOffline\n");
	},

//  boolean hasMsgOffline(in nsMsgKey msgKey);
	hasMsgOffline: function _hasMsgOffline(msgKey)
	{
dump("mivExchangeMsgFolder: function hasMsgOffline\n");
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
	getOfflineFileStream: function _getOfflineFileStream(aMsgKey, aOffset, aSize)
	{
dump("mivExchangeMsgFolder: function getOfflineFileStream\n");
	},

  /**
   * Get the folder where the msg could be present.
   * @param msgKey  key of the msg for which we are trying to get the folder;
   * @returns aMsgFolder  required folder;
   *
   */
//  nsIMsgFolder GetOfflineMsgFolder(in nsMsgKey msgKey);
	GetOfflineMsgFolder: function _GetOfflineMsgFolder(msgKey)
	{
dump("mivExchangeMsgFolder: function GetOfflineMsgFolder\n");
	},

  /**
   * Get an offline store output stream for the passed message header.
   *
   * @param aHdr hdr of message to get outputstream for
   * @returns An output stream to write to.
   */
//  nsIOutputStream getOfflineStoreOutputStream(in nsIMsgDBHdr aHdr);
	getOfflineStoreOutputStream: function _getOfflineStoreOutputStream(aHdr)
	{
dump("mivExchangeMsgFolder: function getOfflineStoreOutputStream\n");
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
	getMsgInputStream: function _getMsgInputStream(aHdr, aReusable)
	{
dump("mivExchangeMsgFolder: function getMsgInputStream\n");
	},

//  readonly attribute nsIInputStream offlineStoreInputStream;
	get offlineStoreInputStream()
	{
dump("mivExchangeMsgFolder: get offlineStoreInputStream\n");
		return true;
	},

//  void DownloadMessagesForOffline(in nsIArray messages,
//                                  in nsIMsgWindow window);
	DownloadMessagesForOffline: function _DownloadMessagesForOffline(messages, window)
	{
dump("mivExchangeMsgFolder: function DownloadMessagesForOffline\n");
	},

//  nsIMsgFolder getChildWithURI(in ACString uri, in boolean deep,
//                               in boolean caseInsensitive);
	getChildWithURI: function _getChildWithURI(uri, deep, caseInsensitive)
	{
dump("mivExchangeMsgFolder: function getChildWithURI\n");
	},

//  void downloadAllForOffline(in nsIUrlListener listener, in nsIMsgWindow window);
	downloadAllForOffline: function _downloadAllForOffline(listener, window)
	{
dump("mivExchangeMsgFolder: function downloadAllForOffline\n");
	},

  /**
   *  Turn notifications on/off for various notification types. Currently only
   *  supporting allMessageCountNotifications which refers to both total and
   *  unread message counts.
   */
//  const unsigned long allMessageCountNotifications    = 0;
//  void enableNotifications(in long notificationType, in boolean enable,
//                           in boolean dbBatching);
	enableNotifications: function _enableNotifications(notificationType, enable, dbBatching)
	{
dump("mivExchangeMsgFolder: function enableNotifications\n");
	},

//  boolean isCommandEnabled(in ACString command);
	isCommandEnabled: function _isCommandEnabled(command)
	{
dump("mivExchangeMsgFolder: function isCommandEnabled\n");
	},

//  boolean matchOrChangeFilterDestination(in nsIMsgFolder folder,
//                                         in boolean caseInsensitive);
	matchOrChangeFilterDestination: function _matchOrChangeFilterDestination(folder, caseInsensitive)
	{
dump("mivExchangeMsgFolder: function matchOrChangeFilterDestination\n");
	},

//  boolean confirmFolderDeletionForFilter(in nsIMsgWindow msgWindow);
	confirmFolderDeletionForFilter: function _confirmFolderDeletionForFilter(msgWindow)
	{
dump("mivExchangeMsgFolder: function confirmFolderDeletionForFilter\n");
	},

//  void alertFilterChanged(in nsIMsgWindow msgWindow);
	alertFilterChanged: function _alertFilterChanged(msgWindow)
	{
dump("mivExchangeMsgFolder: function alertFilterChanged\n");
	},

//  void throwAlertMsg(in string msgName, in nsIMsgWindow msgWindow);
	throwAlertMsg: function _throwAlertMsg(msgWindow)
	{
dump("mivExchangeMsgFolder: function throwAlertMsg\n");
	},

//  AString getStringWithFolderNameFromBundle(in string msgName);
	getStringWithFolderNameFromBundle: function _getStringWithFolderNameFromBundle(msgName)
	{
dump("mivExchangeMsgFolder: function getStringWithFolderNameFromBundle\n");
	},

//  void notifyCompactCompleted();
	notifyCompactCompleted: function _notifyCompactCompleted()
	{
dump("mivExchangeMsgFolder: function notifyCompactCompleted\n");
	},

//  long compareSortKeys(in nsIMsgFolder msgFolder);
	compareSortKeys: function _compareSortKeys(msgFolder)
	{
dump("mivExchangeMsgFolder: function compareSortKeys\n");
	},

  /**
   * Returns a sort key that can be used to sort a list of folders.
   *
   * Prefer nsIMsgFolder::compareSortKeys over this function.
   */
//  void getSortKey(out unsigned long length, [array, size_is(length), retval] out octet key);
	getSortKey: function _getSortKey(length)
	{
dump("mivExchangeMsgFolder: function getSortKey\n");
	},

//  attribute nsIMsgRetentionSettings retentionSettings;
	get retentionSettings()
	{
dump("mivExchangeMsgFolder: get retentionSettings\n");
		return true;
	},

	set retentionSettings(aValue)
	{
dump("mivExchangeMsgFolder: set retentionSettings\n");
	},

//  attribute nsIMsgDownloadSettings downloadSettings;
	get downloadSettings()
	{
dump("mivExchangeMsgFolder: get downloadSettings\n");
		return true;
	},

	set downloadSettings(aValue)
	{
dump("mivExchangeMsgFolder: set downloadSettings\n");
	},

//  boolean callFilterPlugins(in nsIMsgWindow aMsgWindow);
  /**
   * used for order in the folder pane, folder pickers, etc.
   */
//  attribute long sortOrder;
	get sortOrder()
	{
dump("mivExchangeMsgFolder: get sortOrder\n");
		return true;
	},

	set sortOrder(aValue)
	{
dump("mivExchangeMsgFolder: set sortOrder\n");
	},

//  attribute nsIDBFolderInfo dBTransferInfo;
	get dBTransferInfo()
	{
dump("mivExchangeMsgFolder: get dBTransferInfo\n");
		return true;
	},

	set dBTransferInfo(aValue)
	{
dump("mivExchangeMsgFolder: set dBTransferInfo\n");
	},

//  ACString getStringProperty(in string propertyName);
	getStringProperty: function _getStringProperty(propertyName)
	{
dump("mivExchangeMsgFolder: function getStringProperty\n");
	},

//  void setStringProperty(in string propertyName, in ACString propertyValue);
	setStringProperty: function _setStringProperty(msgWipropertyName, propertyValuendow)
	{
dump("mivExchangeMsgFolder: function setStringProperty\n");
	},

  /* does not persist across sessions */
//  attribute nsMsgKey lastMessageLoaded;
	get lastMessageLoaded()
	{
dump("mivExchangeMsgFolder: get lastMessageLoaded\n");
		return true;
	},

	set lastMessageLoaded(aValue)
	{
dump("mivExchangeMsgFolder: set lastMessageLoaded\n");
	},

  /* old nsIFolder properties and methods */
//  readonly attribute ACString URI;
	get URI()
	{
dump("mivExchangeMsgFolder: get URI\n");
		return "exchangeWebServiceMail://Inbox";
	},

//  attribute AString name;
	get name()
	{
dump("mivExchangeMsgFolder: get name\n");
		return true;
	},

	set name(aValue)
	{
dump("mivExchangeMsgFolder: set name\n");
	},

//  attribute AString prettyName;
	get prettyName()
	{
dump("mivExchangeMsgFolder: get prettyName\n");
		return true;
	},

	set prettyName(aValue)
	{
dump("mivExchangeMsgFolder: set prettyName\n");
	},

//  readonly attribute AString abbreviatedName;
	get abbreviatedName()
	{
dump("mivExchangeMsgFolder: get abbreviatedName\n");
		return true;
	},

//  attribute nsIMsgFolder parent;
	get parent()
	{
dump("mivExchangeMsgFolder: get parent\n");
		return true;
	},

	set parent(aValue)
	{
dump("mivExchangeMsgFolder: set parent\n");
	},

  /**
   * Returns an enumerator containing a list of nsIMsgFolder items that are
   * subfolders of the instance this is called on.
   */
//  readonly attribute nsISimpleEnumerator subFolders;
	get subFolders()
	{
dump("mivExchangeMsgFolder: get subFolders\n");
		return true;
	},

  /**
   * Returns true if this folder has sub folders.
   */
//  readonly attribute boolean hasSubFolders;
	get hasSubFolders()
	{
dump("mivExchangeMsgFolder: get hasSubFolders\n");
		return true;
	},

  /**
   * Returns the number of sub folders that this folder has.
   */
//  readonly attribute unsigned long numSubFolders;
	get numSubFolders()
	{
dump("mivExchangeMsgFolder: get numSubFolders\n");
		return true;
	},

  /**
   * Determines if this folder is an ancestor of the supplied folder.
   *
   * @param folder  The folder that may or may not be a descendent of this
   *                folder.
   */
//  boolean isAncestorOf(in nsIMsgFolder folder);
	isAncestorOf: function _isAncestorOf(folder)
	{
dump("mivExchangeMsgFolder: function isAncestorOf\n");
	},

  /**
   * Looks in immediate children of this folder for the given name.
   *
   * @param name the name of the target subfolder
   */
//  boolean containsChildNamed(in AString name);
	containsChildNamed: function _containsChildNamed(name)
	{
dump("mivExchangeMsgFolder: function containsChildNamed\n");
	},

  /**
   * Return the child folder which the specified name.
   *
   * @param aName  The name of the child folder to find
   * @return       The child folder
   * @exception NS_ERROR_FAILURE Thrown if the folder with aName does not exist
   */
//  nsIMsgFolder getChildNamed(in AString aName);
	getChildNamed: function _getChildNamed(aName)
	{
dump("mivExchangeMsgFolder: function getChildNamed\n");
	},

  /**
   * Finds the sub folder with the specified name.
   *
   * @param escapedSubFolderName  The name of the sub folder to find.
   * @note                        Even if the folder doesn't currently exist,
   *                              a nsIMsgFolder may be returned.
   */
//  nsIMsgFolder findSubFolder(in ACString escapedSubFolderName);
	findSubFolder: function _findSubFolder(escapedSubFolderName)
	{
dump("mivExchangeMsgFolder: function findSubFolder\n");
	},

//  void AddFolderListener(in nsIFolderListener listener);
	AddFolderListener: function _AddFolderListener(listener)
	{
dump("mivExchangeMsgFolder: function AddFolderListener\n");
	},

//  void RemoveFolderListener(in nsIFolderListener listener);
	RemoveFolderListener: function _RemoveFolderListener(listener)
	{
dump("mivExchangeMsgFolder: function RemoveFolderListener\n");
	},

//  void NotifyPropertyChanged(in nsIAtom property,
//                             in ACString oldValue,
//                             in ACString newValue);
	NotifyPropertyChanged: function _NotifyPropertyChanged(property, oldValue, newValue)
	{
dump("mivExchangeMsgFolder: function NotifyPropertyChanged\n");
	},

//  void NotifyIntPropertyChanged(in nsIAtom property,
//                                in long oldValue,
//                                in long newValue);
	NotifyIntPropertyChanged: function _NotifyIntPropertyChanged(property, oldValue, newValue)
	{
dump("mivExchangeMsgFolder: function NotifyIntPropertyChanged\n");
	},

//  void NotifyBoolPropertyChanged(in nsIAtom property,
//                                 in boolean oldValue,
//                                 in boolean newValue);
	NotifyBoolPropertyChanged: function _NotifyBoolPropertyChanged(property, oldValue, newValue)
	{
dump("mivExchangeMsgFolder: function NotifyBoolPropertyChanged\n");
	},

//  void NotifyPropertyFlagChanged(in nsIMsgDBHdr item,
//                                 in nsIAtom property,
//                                 in unsigned long oldValue,
//                                 in unsigned long newValue);
	NotifyPropertyFlagChanged: function _NotifyPropertyFlagChanged(item, property, oldValue, newValue)
	{
dump("mivExchangeMsgFolder: function NotifyPropertyFlagChanged\n");
	},

//  void NotifyUnicharPropertyChanged(in nsIAtom property,
//                                    in AString oldValue,
//                                    in AString newValue);
	NotifyUnicharPropertyChanged: function _NotifyUnicharPropertyChanged(property, oldValue, newValue)
	{
dump("mivExchangeMsgFolder: function NotifyUnicharPropertyChanged\n");
	},

//  void NotifyItemAdded(in nsISupports item);
	NotifyItemAdded: function _NotifyItemAdded(item)
	{
dump("mivExchangeMsgFolder: function NotifyItemAdded\n");
	},

//  void NotifyItemRemoved(in nsISupports item);
	NotifyItemRemoved: function _NotifyItemRemoved(item)
	{
dump("mivExchangeMsgFolder: function NotifyItemRemoved\n");
	},

//  void NotifyFolderEvent(in nsIAtom event);
	NotifyFolderEvent: function _NotifyFolderEvent(event)
	{
dump("mivExchangeMsgFolder: function NotifyFolderEvent\n");
	},

  //  void NotifyFolderLoaded();
	NotifyFolderLoaded: function _NotifyFolderLoaded()
	{
dump("mivExchangeMsgFolder: function NotifyFolderLoaded\n");
	},

  //  void NotifyDeleteOrMoveMessagesCompleted(in nsIMsgFolder folder);
	NotifyDeleteOrMoveMessagesCompleted: function _NotifyDeleteOrMoveMessagesCompleted(folder)
	{
dump("mivExchangeMsgFolder: function NotifyDeleteOrMoveMessagesCompleted\n");
	},

  // lists all descendents, not just first level children
//  void ListDescendents(in nsISupportsArray descendents);
	ListDescendents: function _ListDescendents(descendents)
	{
dump("mivExchangeMsgFolder: function ListDescendents\n");
	},

//  void Shutdown(in boolean shutdownChildren);
	Shutdown: function _Shutdown(shutdownChildren)
	{
dump("mivExchangeMsgFolder: function Shutdown\n");
	},

//  readonly attribute boolean inVFEditSearchScope;
	get inVFEditSearchScope()
	{
dump("mivExchangeMsgFolder: get inVFEditSearchScope\n");
		return true;
	},

//  void setInVFEditSearchScope(in boolean aSearchThisFolder, in boolean aSetOnSubFolders);
	setInVFEditSearchScope: function _setInVFEditSearchScope(aSearchThisFolder, aSetOnSubFolders)
	{
dump("mivExchangeMsgFolder: function setInVFEditSearchScope\n");
	},

//  void copyDataToOutputStreamForAppend(in nsIInputStream aIStream,
//                     in long aLength, in nsIOutputStream outputStream);
	copyDataToOutputStreamForAppend: function _copyDataToOutputStreamForAppend(aIStream, aLength, outputStream)
	{
dump("mivExchangeMsgFolder: function copyDataToOutputStreamForAppend\n");
	},

//  void copyDataDone();
	copyDataDone: function _copyDataDone()
	{
dump("mivExchangeMsgFolder: function copyDataDone\n");
	},

//  void setJunkScoreForMessages(in nsIArray aMessages, in ACString aJunkScore);
	setJunkScoreForMessages: function _setJunkScoreForMessages(aMessages, aJunkScore)
	{
dump("mivExchangeMsgFolder: function setJunkScoreForMessages\n");
	},

//  void applyRetentionSettings();
	applyRetentionSettings: function _applyRetentionSettings()
	{
dump("mivExchangeMsgFolder: function applyRetentionSettings\n");
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
	fetchMsgPreviewText: function _fetchMsgPreviewText(aKeysToFetch, aNumKeys, aLocalOnly, aUrlListener)
	{
dump("mivExchangeMsgFolder: function fetchMsgPreviewText\n");
	},

  // used to set/clear tags - we could have a single method to setKeywords which
  // would figure out the diffs, but these methods might be more convenient.
  // keywords are space delimited, in the case of multiple keywords
//  void addKeywordsToMessages(in nsIArray aMessages, in ACString aKeywords);
	addKeywordsToMessages: function _addKeywordsToMessages(aMessages, aKeywords)
	{
dump("mivExchangeMsgFolder: function addKeywordsToMessages\n");
	},

//  void removeKeywordsFromMessages(in nsIArray aMessages, in ACString aKeywords);
	removeKeywordsFromMessages: function _removeKeywordsFromMessages(aMessages, aKeywords)
	{
dump("mivExchangeMsgFolder: function removeKeywordsFromMessages\n");
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
	getMsgTextFromStream: function _getMsgTextFromStream(aStream, aCharset, aBytesToRead, aMaxOutputLen, 
								aCompressQuotes, aStripHTMLTags, aContentType)
	{
dump("mivExchangeMsgFolder: function getMsgTextFromStream\n");
	},

//  AString convertMsgSnippetToPlainText(in AString aMessageText);
	convertMsgSnippetToPlainText: function _convertMsgSnippetToPlainText(aMessageText)
	{
dump("mivExchangeMsgFolder: function convertMsgSnippetToPlainText\n");
	},

  // this allows a folder to have a special identity. E.g., you might want to
  // associate an identity with a particular newsgroup, or for IMAP shared folders in
  // the other users namespace, you might want to create a delegated identity
//  readonly attribute nsIMsgIdentity customIdentity;
	get customIdentity()
	{
dump("mivExchangeMsgFolder: get customIdentity\n");
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
	getProcessingFlags: function _getProcessingFlags(msgKey)
	{
dump("mivExchangeMsgFolder: function getProcessingFlags\n");
	},

  /**
   * @param msgKey   message key
   * @param mask     mask to OR into the flags
   */
//  void orProcessingFlags(in nsMsgKey msgKey, in unsigned long mask);
	orProcessingFlags: function _orProcessingFlags(msgKey, mask)
	{
dump("mivExchangeMsgFolder: function orProcessingFlags\n");
	},

  /**
   * @param msgKey   message key
   * @param mask     mask to AND into the flags
   */
//  void andProcessingFlags(in nsMsgKey msgKey, in unsigned long mask);
	andProcessingFlags: function _andProcessingFlags(msgKey, mask)
	{
dump("mivExchangeMsgFolder: function andProcessingFlags\n");
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
	getInheritedStringProperty: function _getInheritedStringProperty(propertyName)
	{
dump("mivExchangeMsgFolder: function getInheritedStringProperty\n");
	},

  /**
   * Set a boolean to force an inherited propertyName to return empty instead
   * of inheriting from a parent folder, server, or the global
   *
   * @param propertyName         The name of the property
   * @param aForcePropertyEmpty  true if an empty inherited property should be returned
   */
//  void setForcePropertyEmpty(in string propertyName, in boolean aForcePropertyEmpty);
	setForcePropertyEmpty: function _setForcePropertyEmpty(propertyName, aForcePropertyEmpty)
	{
dump("mivExchangeMsgFolder: function setForcePropertyEmpty\n");
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
	getForcePropertyEmpty: function _getForcePropertyEmpty(propertyName)
	{
dump("mivExchangeMsgFolder: function getForcePropertyEmpty\n");
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

		dump("Joepie 1 !!!!\n");
		try {
			var tmp = new mivExchangeMsgFolder();
		}
		catch(err){ dump("err:"+err+"\n"); }
		dump("Joepie 2 !!!!\n");

	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

try{
	var result = NSGetFactory.mivExchangeMsgFolder(cid);
}catch(err){ dump("Error2:"+err+"\n");}
	return result;
} 

