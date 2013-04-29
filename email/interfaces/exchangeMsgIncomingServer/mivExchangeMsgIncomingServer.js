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

function mivExchangeMsgIncomingServer() {

	//this.logInfo("mivExchangeMsgIncomingServer: init");

}

var mivExchangeMsgIncomingServerGUID = "79d87edc-020e-48d4-8c04-b894edab4bd2";

mivExchangeMsgIncomingServer.prototype = {

	QueryInterface : XPCOMUtils.generateQI([Ci.mivExchangeMsgIncomingServer,
				Ci.nsIMsgIncomingServer,
				Ci.nsIClassInfo,
				Ci.nsISupports]),

	_className : "mivExchangeMsgIncomingServer",

	classDescription : "Exchange EWS Msg Incoming server",

	classID : components.ID("{"+mivExchangeMsgIncomingServerGUID+"}"),
	contractID : "@mozilla.org/messenger/protocol/info;1?type=exchangeWebServiceMail",
	flags : Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

	getInterfaces : function _getInterfaces(count) 
	{
		var ifaces = [Ci.mivExchangeMsgIncomingServer,
				Ci.nsIMsgIncomingServer,
				Ci.nsIClassInfo,
				Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

  /**
   * internal pref key - guaranteed to be unique across all servers
   */
//  attribute ACString key;

  /**
   * pretty name - should be "userid on hostname"
   * if the pref is not set
   */
//  attribute AString prettyName;

  /**
  * helper function to construct the pretty name in a server type
  * specific way - e.g., mail for foo@test.com, news on news.mozilla.org
  */
//  readonly attribute AString constructedPrettyName;

  /**
   * hostname of the server
   */
//  attribute ACString hostName;
  
  /**
   * real hostname of the server (if server name is changed it's stored here)
   */
//  attribute ACString realHostName;
  
  /* port of the server */
//  attribute long port;

  /**
   * userid to log into the server
   */
//  attribute ACString username;

  /**
   * real username of the server (if username is changed it's stored here)
   */
//  attribute ACString realUsername;

  /**
   * protocol type, i.e. "pop3", "imap", "nntp", "none", etc
   * used to construct URLs
   */
//  attribute ACString type;

//  readonly attribute AString accountManagerChrome;

  /**
   * the schema for the local mail store, such
   * as "mailbox", "imap", or "news"
   * used to construct URIs
   */
//  readonly attribute ACString localStoreType;

  // Perform specific tasks (reset flags, remove files, etc) for account user/server name changes.
//  void onUserOrHostNameChanged(in ACString oldName, in ACString newName,
//                               in bool hostnameChanged);

  /* cleartext version of the password */
//  attribute ACString password;

  /**
   * Attempts to get the password first from the password manager, if that
   * fails it will attempt to get it from the user if aMsgWindow is supplied.
   *
   * @param aPromptString  The text of the prompt if the user is prompted for
   *                       password.
   * @param aPromptTitle   The title of the prompt if the user is prompted.
   * @param aMsgWindow     A message window to associate the prompt with.
   * @return               The obtained password. Could be an empty password.
   *
   * @exception NS_ERROR_FAILURE  The password could not be obtained.
   *
   * @note NS_MSG_PASSWORD_PROMPT_CANCELLED is a success code that is returned
   *       if the prompt was presented to the user but the user cancelled the
   *       prompt.
   */
//  ACString getPasswordWithUI(in AString aPromptString, in AString aPromptTitle,
//                             in nsIMsgWindow aMsgWindow);

  /* forget the password in memory and in single signon database */
//  void forgetPassword();

  /* forget the password in memory which is cached for the session */
//  void forgetSessionPassword();

  /* should we download whole messages when biff goes off? */
//  attribute boolean downloadOnBiff;

  /* should we biff the server? */
//  attribute boolean doBiff;

  /* how often to biff */
//  attribute long biffMinutes;

  /* current biff state */
//  attribute unsigned long biffState;

  /* are we running a url as a result of biff going off? (different from user clicking get msg) */
//  attribute boolean performingBiff; 

  /* the on-disk path to message storage for this server */
//  attribute nsIFile localPath;

  /// message store to use for the folders under this server.
//  readonly attribute nsIMsgPluggableStore msgStore;

  /* the RDF URI for the root mail folder */
//  readonly attribute ACString serverURI;

  /* the root folder for this server, even if server is deferred */
//  attribute nsIMsgFolder rootFolder;

  /* root folder for this account 
     - if account is deferred, root folder of deferred-to account */
//  readonly attribute nsIMsgFolder rootMsgFolder;

  /* are we already getting new Messages on the current server..
     This is used to help us prevent multiple get new msg commands from
     going off at the same time. */
//  attribute boolean serverBusy;

  /**
   * Is the server using a secure channel (SSL or STARTTLS).
   */
//  readonly attribute boolean isSecure;

  /**
   * Authentication mechanism.
   *
   * @see nsMsgAuthMethod (in MailNewsTypes2.idl)
   * Same as "mail.server...authMethod" pref
   */
//  attribute nsMsgAuthMethodValue authMethod;

  /**
   * Whether to SSL or STARTTLS or not
   *
   * @see nsMsgSocketType (in MailNewsTypes2.idl)
   * Same as "mail.server...socketType" pref
   */
//  attribute nsMsgSocketTypeValue socketType;

  /* empty trash on exit */
//  attribute boolean emptyTrashOnExit;

  /**
   * Get the server's list of filters.
   *
   * This SHOULD be the same filter list as the root folder's, if the server
   * supports per-folder filters. Furthermore, this list SHOULD be used for all
   * incoming messages.
   *
   * Since the returned nsIMsgFilterList is mutable, it is not necessary to call
   * setFilterList after the filters have been changed.
   *
   * @param aMsgWindow  @ref msgwindow "The standard message window"
   * @return            The list of filters.
   */
//  nsIMsgFilterList getFilterList(in nsIMsgWindow aMsgWindow);

  /**
   * Set the server's list of filters.
   *
   * Note that this does not persist the filter list. To change the contents
   * of the existing filters, use getFilterList and mutate the values as
   * appopriate.
   *
   * @param aFilterList The new list of filters.
   */
//  void setFilterList(in nsIMsgFilterList aFilterList);

  /**
   * Get user editable filter list. This does not have to be the same as
   * the filterlist above, typically depending on the users preferences.
   * The filters in this list are not processed, but only to be edited by
   * the user.
   * @see getFilterList
   *
   * @param aMsgWindow  @ref msgwindow "The standard message window"
   * @return            The list of filters.
   */
//  nsIMsgFilterList getEditableFilterList(in nsIMsgWindow aMsgWindow);

  /**
   * Set user editable filter list.
   * This does not persist the filterlist, @see setFilterList
   * @see getEditableFilterList
   * @see setFilterList
   *
   * @param aFilterList The new list of filters.
   */
//  void setEditableFilterList(in nsIMsgFilterList aFilterList);

  /* we use this to set the default local path.  we use this when migrating prefs */
//  void setDefaultLocalPath(in nsIFile aDefaultLocalPath);

  /**
   * Verify that we can logon
   * 
   * @param  aUrlListener - gets called back with success or failure.
   * @param aMsgWindow         nsIMsgWindow to use for notification callbacks.
   * @return - the url that we run.
   */
//  nsIURI verifyLogon(in nsIUrlListener aUrlListener, in nsIMsgWindow aMsgWindow);

  /* do a biff */
//  void performBiff(in nsIMsgWindow aMsgWindow);
  
  /* get new messages */
//  void getNewMessages(in nsIMsgFolder aFolder, in nsIMsgWindow aMsgWindow, 
//                      in nsIUrlListener aUrlListener);
  /* this checks if a server needs a password to do biff */
//  readonly attribute boolean serverRequiresPasswordForBiff;
  
  /* this gets called when the server is expanded in the folder pane */
//  void performExpand(in nsIMsgWindow aMsgWindow);

  /* Write out all known folder data to panacea.dat */
//  void writeToFolderCache(in nsIMsgFolderCache folderCache);

  /* close any server connections */
//  void closeCachedConnections();
 
  /* ... */
//  void shutdown();

  /**
   * Get or set the value as determined by the preference tree.
   *
   * These methods MUST NOT fail if the preference is not set, and therefore
   * they MUST have a default value. This default value is provided in practice
   * by use of a default preference tree. The standard format for the pref
   * branches are <tt>mail.server.<i>key</i>.</tt> for per-server preferences,
   * such that the preference is <tt>mail.server.<i>key</i>.<i>attr</i></tt>.
   *
   * The attributes are passed in as strings for ease of access by the C++
   * consumers of this method.
   *
   * @param attr  The value for which the preference should be accessed.
   * @param value The value of the preference to set.
   * @return      The value of the preference.
   * @{
   */
//  boolean getBoolValue(in string attr);
//  void setBoolValue(in string attr, in boolean value);

//  ACString getCharValue(in string attr);
//  void setCharValue(in string attr, in ACString value);

//  AString getUnicharValue(in string attr);
//  void setUnicharValue(in string attr, in AString value);
  
//  long getIntValue(in string attr);
//  void setIntValue(in string attr, in long value);
  /** @} */

  /**
   * Get or set the value as determined by the preference tree.
   *
   * These methods MUST NOT fail if the preference is not set, and therefore
   * they MUST have a default value. This default value is provided in practice
   * by use of a default preference tree. The standard format for the pref
   * branches are <tt>mail.server.<i>key</i>.</tt> for per-server preferences,
   * such that the preference is <tt>mail.server.<i>key</i>.<i>attr</i></tt>.
   *
   * The attributes are passed in as strings for ease of access by the C++
   * consumers of this method.
   *
   * There are two preference names on here for legacy reasons, where the first
   * is the name which will be using a (preferred) relative preference and the
   * second a deprecated absolute preference. Implementations that do not have
   * to worry about supporting legacy preferences can safely ignore this second
   * parameter. Callers must still provide a valid value, though.
   *
   * @param relpref The name of the relative file preference.
   * @param absref  The name of the absolute file preference.
   * @param aValue  The value of the preference to set.
   * @return        The value of the preference.
   * @{
   */
//  nsIFile getFileValue(in string relpref, in string abspref);
//  void setFileValue(in string relpref, in string abspref, in nsIFile aValue);
  /** @} */

  /**
   * this is really dangerous. this destroys all pref values
   * do not call this unless you know what you're doing!
   */
//  void clearAllValues();

  /** 
   * this is also very dangerous.  this will remove the files
   * associated with this server on disk.
   */
//  void removeFiles();
  
//  attribute boolean valid;
  
//  AString toString();

//  void displayOfflineMsg(in nsIMsgWindow aWindow);

  /* used for comparing nsIMsgIncomingServers */
//  boolean equals(in nsIMsgIncomingServer server);

  /* Get Messages at startup */
//  readonly attribute boolean downloadMessagesAtStartup; 

  /* check to this if the server supports filters */
//  attribute boolean canHaveFilters;

  /**
   * can this server be removed from the account manager?  for
   * instance, local mail is not removable, but an imported folder is 
   */
//  attribute boolean canDelete;

//  attribute boolean loginAtStartUp;

//  attribute boolean limitOfflineMessageSize;
//  attribute long maxMessageSize;

//  attribute nsIMsgRetentionSettings retentionSettings;

  /* check if this server can be a default server */
//  readonly attribute boolean canBeDefaultServer;

  /* check if this server allows search operations */
//  readonly attribute boolean canSearchMessages;

  /* check if this server allows canEmptyTrashOnExit operations */
//  readonly attribute boolean canEmptyTrashOnExit;

  /* display startup page once per account per session */
//  attribute boolean displayStartupPage;
//  attribute nsIMsgDownloadSettings downloadSettings;

  /*
   * Offline support level. Support level can vary based on abilities 
   * and features each server can offer wrt to offline service.
   * Here is the legend to determine the each support level details
   *
   * supportLevel == 0  --> no offline support (default) 
   * supportLevel == 10 --> regular offline feature support
   * supportLevel == 20 --> extended offline feature support 
   *
   * Each server can initialize itself to the support level if needed
   * to override the default choice i.e., no offline support.
   *
   * POP3, None and Movemail will default to 0. 
   * IMAP level 10 and NEWS with level 20. 
   * 
   */
//  attribute long offlineSupportLevel;

  /* create pretty name for migrated accounts */
//  AString generatePrettyNameForMigration(); 

  /* does this server have disk space settings? */
//  readonly attribute boolean supportsDiskSpace;

  /**
   * Hide this server/account from the UI - used for smart mailboxes.
   * The server can be retrieved from the account manager by name using the
   * various Find methods, but nsIMsgAccountManager's GetAccounts and 
   * GetAllServers methods won't return the server/account.
   */
//  attribute boolean hidden;

  /**
   * If the server supports Fcc/Sent/etc, default prefs can point to 
   * the server. Otherwise, copies and folders prefs should point to
   * Local Folders.
   *
   * By default this value is set to true via global pref 'allows_specialfolders_usage'
   * (mailnews.js). For Nntp, the value is overridden to be false.
   * If ISPs want to modify this value, they should do that in their rdf file
   * by using this attribute. Please look at mozilla/mailnews/base/ispdata/aol.rdf for
   * usage example.
   */
//  attribute boolean defaultCopiesAndFoldersPrefsToServer;

  /* can this server allows sub folder creation */
//  attribute boolean canCreateFoldersOnServer;

  /* can this server allows message filing ? */
//  attribute boolean canFileMessagesOnServer;

  /* can this server allow compacting folders ? */
//  readonly attribute boolean canCompactFoldersOnServer;

  /* can this server allow undo delete ? */
//  readonly attribute boolean canUndoDeleteOnServer;

  /* used for setting up the filter UI */
//  readonly attribute nsMsgSearchScopeValue filterScope;

  /* used for setting up the search UI */
//  readonly attribute nsMsgSearchScopeValue searchScope;

  /** 
   * If the password for the server is available either via authentication 
   * in the current session or from password manager stored entries, return
   * false. Otherwise, return true. If password is obtained from password 
   * manager, set the password member variable.
   */ 
//  readonly attribute boolean passwordPromptRequired;

  /**
   * for mail, this configures both the MDN filter, and the server-side
   * spam filter filters, if needed.
   *
   * If we have set up to filter return receipts into
   * our Sent folder, this utility method creates
   * a filter to do that, and adds it to our filterList
   * if it doesn't exist.  If it does, it will enable it.
   *
   * this is not used by news filters (yet).
   */
//  void configureTemporaryFilters(in nsIMsgFilterList filterList);

  /**
   * If Sent folder pref is changed we need to clear the temporary 
   * return receipt filter so that the new return receipt filter can
   * be recreated (by ConfigureTemporaryReturnReceiptsFilter()).
   */
//  void clearTemporaryReturnReceiptsFilter();

  /**
   * spam settings
   */
//  readonly attribute nsISpamSettings spamSettings;
//  readonly attribute nsIMsgFilterPlugin spamFilterPlugin;

//  nsIMsgFolder getMsgFolderFromURI(in nsIMsgFolder aFolderResource, in ACString aURI);

//  readonly attribute boolean isDeferredTo;

//  const long keepDups = 0;
//  const long deleteDups = 1;
//  const long moveDupsToTrash = 2;
//  const long markDupsRead = 3;

//  attribute long incomingDuplicateAction;

  // check if new hdr is a duplicate of a recently arrived header
//  boolean isNewHdrDuplicate(in nsIMsgDBHdr aNewHdr);

  /**
   * Set a boolean to force an inherited propertyName to return empty instead
   * of inheriting from a parent folder, server, or the global
   *
   * @param propertyName         The name of the property
   * @param aForcePropertyEmpty  true if an empty inherited property should be returned
   */
//  void setForcePropertyEmpty(in string propertyName, in boolean aForcePropertyEmpty);

  /**
   * Get a boolean to force an inherited propertyName to return empty instead
   * of inheriting from a parent folder, server, or the global
   *
   * @param propertyName      The name of the property
   *
   * @return                  true if an empty inherited property should be returned
   */
//  boolean getForcePropertyEmpty(in string propertyName);

  /**
   * Return the order in which this server type should appear in the folder pane.
   * This sort order is a number between 100000000 and 900000000 so that RDF can
   * use it as a string.
   * The current return values are these:
   * 0 = default account,       100000000 = mail accounts (POP3/IMAP4),
   * 200000000 = Local Folders, 300000000 = IM accounts,
   * 400000000 = RSS,           500000000 = News
   * If a new server type is created a TB UI reviewer must decide its sort order.
   */
//  readonly attribute long sortOrder;
	get sortOrder()
	{
		return 100000000;
	},


};

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.mivExchangeMsgIncomingServer) {
			NSGetFactory.mivExchangeMsgIncomingServer = XPCOMUtils.generateNSGetFactory([mivExchangeMsgIncomingServer]);

	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.mivExchangeMsgIncomingServer(cid);
} 

