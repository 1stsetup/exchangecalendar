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
 * Website: http://www.1st-setup.nl/wordpress/?page_id=133
 * email: exchangecalendar@extensions.1st-setup.nl
 *
 * This XML interface can be used to convert from xml-string to JXON object
 * and back.
 *
 * ***** BEGIN LICENSE BLOCK *****/

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var Cr = Components.results;
var components = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

Cu.import("resource://1st-setup/ecFunctions.js");

function xml2jxon(aXMLString, aStartPos, aParent) {

	this.content = {};
	this.itemCount = 0;

	if (aXMLString) {
		this.processXMLString(aXMLString, aStartPos, aParent);
	}
	else {
		this.isXMLHeader = true;
		this.XMLHeader = '<?xml version="1.0" encoding="utf-8"?>';
	}
}

var xml2jxonGUID = "d7165a60-7d64-42b2-ac48-6ccfc0962abb";

xml2jxon.prototype = {

	// methods from nsISupport

	_refCount: 0,

	//nsrefcnt AddRef();
	AddRef: function _AddRef()
	{
		this._refCount++;
		return this._refCount;
	},

	/* void QueryInterface(
	  in nsIIDRef uuid,
	  [iid_is(uuid),retval] out nsQIResult result
	);	 */
	QueryInterface: function _QueryInterface(aIID) {
		return cal.doQueryInterface(this, calExchangeCalendar.prototype, aIID,null, this);
	},

	//nsrefcnt Release();
	Release: function _Release()
	{
		this._refCount--;
		return this._refCount;
	},

	// methods from nsIClassInfo

	// nsISupports getHelperForLanguage(in PRUint32 language);
	getHelperForLanguage: function _getHelperForLanguage(language) {
		return null;
	},

	// void getInterfaces(out PRUint32 count, [array, size_is(count), retval] out nsIIDPtr array);
	getInterfaces: function _getInterfaces(count) 
	{
		var ifaces = [Ci.1st-setupIxml2jxon,
			Ci.nsIClassInfo,
			Ci.nsISupports];
		count.value = ifaces.length;
		return ifaces;
	},

	// Attributes from nsIClassInfo

	classDescription: "XML to JXON and back conversion functionality.",
	classID: components.ID("{"+xml2jxonGUID+"}"),
	contractID: "@1st-setup.nl/conversion/xml2jxon;1",
	flags: Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,

	// External methods

	// External attributes
	ERR_MISSING_SPECIAL_TAG: 1,
	ERR_INVALID_TAG: 2,
	ERR_INVALID_SPECIAL_TAG: 3,
	ERR_WRONG_CLOSING_TAG: 4,

	// Internal methods.

	findCharacter: function _findCharacter(aString, aStartPos, aChar)
	{
		var pos = aStartPos;
		var strLength = aString.length;
		while ((pos < strLength) && (aString.substr(pos, 1) != aChar)) {
			pos++;
		}

		if ((pos < strLength) && (aString.substr(pos, 1) == aChar)) {
			return pos;
		}
		
		return -1;
	},

	findString: function _findString(aString, aStartPos, aNeedle)
	{
		var pos = aStartPos;
		var strLength = aString.length;
		var needleLength = aNeedle.length;
		while ((pos < strLength) && (aString.substr(pos, needleLength) != aNeedle)) {
			pos++;
		}

		if ((pos < strLength) && (aString.substr(pos, needleLength) == aNeedle)) {
			return pos;
		}
		
		return -1;
	},

	addToContent: function _addToContent(aValue)
	{
		this.itemCount++;
		this.content[this.itemCount] = aValue;
	},

	processXMLString: function _processXMLString(aString, aStartPos, aParent)
	{
		//Search for Tag opening character "<"
		var pos = this.findChar(aString, aStartPos, "<");
		var strLength = aString.length;

		if (pos > -1) {
			// Found opening character for Tag.
			this.startPos = pos;

			pos++;
			// check if next character is special character "?"
			if ( (pos < strLength) && (aString.substr(pos, 1) == "?")) {
				// found special character "?"
				// Next four characters should be "xml " or else error.
				pos++;
				if (aString,substr(pos, 4) == "xml ") {
					// We have a header.
					var tmpPos = this.findString(aString, pos, "?>");
					if (tmpPos == -1) {
						throw ERR_INVALID_SPECIAL_TAG;
					}
					else {
						// found complete special tag.
						this.isXMLHeader = true;
						this.XMLHeader = aString.substr(this.startPos, tmpPos-this.startPos+1);
						this.addToContent(new xml2jxon(aString, tmpPos+2, this));
						return;						
					}
				}
				else {
					// Error no valid header.
					throw ERR_MISSING_SPECIAL_TAG;
				}
			}
			else {
				if ( (pos < strLength) && (aString.substr(pos, 1) == "/")) {
					// found special character "/"
					// this should be a closing tag.
					pos++;
					var tmpStartPos = pos;
					if (pos < strLength) {
						// We still have characters left.
						var tmpPos = this.findChar(aString, pos, ">");
						if (tmpPos > -1) {
							// We found a closing character.
							// Disassemble the tag. And see if it is the same tag as our parent. If so return else Error.
							var closingTag = aString.substr(tmpStartPos, tmpPos-tmpStartPos);
							if ((aParent) && (closingTag == aParent.tagName)) {
								aParent.messageLength = tmpPos - aParent.startPos + 1; 
								return;
							}
							else {
								throw ERR_WRONG_CLOSING_TAG;
							}
						}
						else {
							throw ERR_INVALID_TAG;
						}
					}
					else {
						// No more characters left in aString.
						throw ERR_INVALID_TAG;
					}
				}
				else {
					// did not find special character or aString is not long enough.
					if (pos < strLength) {
						// We still have characters left.
						var tmpPos = this.findChar(aString, pos, ">");
						if (tmpPos > -1) {
							// We found a closing character.
							// Disassemble the tag. And process the content.
						
							// get tag name.

							// get attributes

							// get namespaces


							this.addToContent(new xml2jxon(aString, tmpPos+1, this));

							// When this one returns this.messageLength should be set and specifies where we should continue.
							
						}
						else {
							throw ERR_INVALID_TAG;
						}
					}
					else {
						// No more characters left in aString.
						throw ERR_INVALID_TAG;
					}
				}
			}
		}
		else {
			// Did not find opening character for Tag.
			// We stop here.
			if (aParent) {
				aParent.addToContent(aString);
			}
			return;
		}
	},

	logInfo: function _logInfo(message, aDebugLevel) {

		if (!aDebugLevel) {
			var debugLevel = 1;
		}
		else {
			var debugLevel = aDebugLevel;
		}

		var prefB = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		var storedDebugLevel = exchWebService.commonFunctions.safeGetIntPref(prefB, "extensions.1st-setup.core.debuglevel", 0, true);

		if (debugLevel <= storedDebugLevel) {
			exchWebService.commonFunctions.LOG("["+this.contractID+"] "+message + " ("+exchWebService.commonFunctions.STACKshort()+")");
		}
	},


}

function NSGetFactory(cid) {

	exchWebService.commonFunctions.LOG("--NSGetFactory xml.js -- 1");
	try {
		if (!NSGetFactory.xml2json) {
			// Load main script from lightning that we need.
			NSGetFactory.xml2json = XPCOMUtils.generateNSGetFactory([xml2jxon]);
			exchWebService.commonFunctions.LOG("--NSGetFactory xml.js -- 2");
			
	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	exchWebService.commonFunctions.LOG("--NSGetFactory xml.js -- 3");
	return NSGetFactory.xml2json(cid);
} 

