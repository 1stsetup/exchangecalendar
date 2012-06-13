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

function mivIxml2jxon(aXMLString, aStartPos, aParent) {

	this.content = {};
	this.itemCount = 0;
	this.messageLength = 0;
	this.closed = false;

	this.logInfo("mivIxml2jxon.init",2);

	if (aXMLString) {
		this.processXMLString(aXMLString, aStartPos, aParent);
	}
	else {
		this.isXMLHeader = true;
		this.XMLHeader = '<?xml version="1.0" encoding="utf-8"?>';
	}
}

var xml2jxonGUID = "d7165a60-7d64-42b2-ac48-6ccfc0962abb";

const tagSeparator = ":";


mivIxml2jxon.prototype = {

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
	QueryInterface: XPCOMUtils.generateQI([Ci.mivIxml2jxon,
			Ci.nsIClassInfo,
			Ci.nsISupports]),

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
		var ifaces = [Ci.mivIxml2jxon,
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
/*	ERR_MISSING_SPECIAL_TAG: 1,
	ERR_INVALID_TAG: 2,
	ERR_INVALID_SPECIAL_TAG: 3,
	ERR_WRONG_CLOSING_TAG: 4,*/

	// Internal methods.

	xmlError: function _xmlError(aErrorID)
	{
		switch (aErrorID) {
			case Ci.mivIxml2jxon.ERR_MISSING_SPECIAL_TAG: 
				return { name: "ERR_MISSING_SPECIAL_TAG",
					 message: "A special tag like '?' is missing",
				         code: aErrorID};
			case Ci.mivIxml2jxon.ERR_INVALID_TAG: 
				return { name: "ERR_INVALID_TAG",
					 message: "Tag is invalid",
				         code: aErrorID};
			case Ci.mivIxml2jxon.ERR_INVALID_SPECIAL_TAG: 
				return { name: "ERR_INVALID_SPECIAL_TAG",
					 message: "Special Tag is invalid",
				         code: aErrorID};
			case Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG: 
				return { name: "ERR_WRONG_CLOSING_TAG",
					 message: "Found wrong closing tag. Expected another.",
				         code: aErrorID};
			case Ci.mivIxml2jxon.ERR_WRONG_ATTRIBUTE_SEPARATOR: 
				return { name: "ERR_WRONG_ATTRIBUTE_SEPARATOR",
					 message: "Found wrong attribute separator. Expected '=' character.",
				         code: aErrorID};
			case Ci.mivIxml2jxon.ERR_ATTRIBUTE_VALUE_QUOTES: 
				return { name: "ERR_ATTRIBUTE_VALUE_QUOTES",
					 message: "Found error in attribute value quotes.",
				         code: aErrorID};
		}
	},

	addToContent: function _addToContent(aValue)
	{
		if (aValue == "NoError") {
			this.logInfo("-- tagName:"+this.tagName+"placed value '"+aValue+"' into slot '"+this.itemCount+"'", 2);
		}
		this.content[this.itemCount] = aValue;
		this.itemCount++;
	},

	trim: function _trim(aValue)
	{
		var strLength = aValue.length;
		var leftPos = 0;
		while ((leftPos < strLength) && (aValue.substr(leftPos,1) == " ")) {
			leftPos++;
		}
		var rightPos = strLength-1;
		while ((rightPos >= 0) && (aValue.substr(rightPos,1) == " ")) {
			rightPos--;
		}
		return aValue.substr(leftPos, rightPos - leftPos + 1);
	},

	explodeAttribute: function _explodeAttribute(aValue)
	{
		var splitPos = aValue.indexOf("=");
		if (splitPos == -1) {
			throw this.xmlError(Ci.mivIxml2jxon.ERR_WRONG_ATTRIBUTE_SEPARATOR);
		}
 
		// trim left and right.
		var attributeName = this.trim(aValue.substr(0, splitPos));
		var attributeValue = this.trim(aValue.substr(splitPos+1));

		if ((attributeValue.substr(0,1) == "'") || (attributeValue.substr(0,1) == '"')) {
			var valueLength = attributeValue.length;
			if (attributeValue.substr(0,1) == attributeValue.substr(valueLength-1,1)) {
				// Remove quote around attribute value.
				attributeValue = attributeValue.substr(1, valueLength-2);
			}
			else {
				throw this.xmlError(Ci.mivIxml2jxon.ERR_ATTRIBUTE_VALUE_QUOTES);
			}
		}

		if (attributeName.toLowerCase().indexOf("xmlns") == 0) {
			if (!this.nameSpaces) {
				this.nameSpaces = {};
			}
			var xmlnsPos = attributeName.indexOf(":");
			if (xmlnsPos > -1) {
				this.logInfo("Found xml namespace:"+attributeName.substr(xmlnsPos+1)+"="+attributeValue, 2);
				this.nameSpaces[attributeName.substr(xmlnsPos+1)] = attributeValue;
			}
			else {
				this.logInfo("Found xml namespace:_default_="+attributeValue, 2);
				this.nameSpaces["_default_"] = attributeValue;
			}
		}
		else {
			this.logInfo("Added attribute to tag '"+this.tagName+"'. "+attributeName+"="+attributeValue,2);

			this["@"+attributeName] = attributeValue;
		}
	},

	addChildTagObject: function _addChildTagObject(aTagName, aNameSpace, aObject)
	{
		if (!this[aNameSpace+tagSeparator+aTagName]) {
			this.logInfo("First childTag: "+this.tagName+"."+aNameSpace+tagSeparator+aTagName+"="+aObject,2);
			this[aNameSpace+tagSeparator+aTagName] = aObject;
			this.isNotAnArray = true;
		}
		else {
			if (this.isNotAnArray) {
				var firstObject = this[aNameSpace+tagSeparator+aTagName];
				this[aNameSpace+tagSeparator+aTagName] = new Array();
				this[aNameSpace+tagSeparator+aTagName].push(firstObject);
				this.isNotAnArray = false;
			}
			this.logInfo("childTag : "+this.tagName+"."+aNameSpace+tagSeparator+aTagName+"["+(this[aNameSpace+tagSeparator+aTagName].length+1)+"]",2);
			this[aNameSpace+tagSeparator+aTagName].push(aObject);
		}
	},

	addChildTag: function _addChildTag(aTagName, aNameSpace, aValue)
	{
		if (aNameSpace) {
			var nameSpace = aNameSpace;
		}
		else {
			var nameSpace = aParent.nameSpace;
		}

		var result = new mivIxml2jxon("<"+nameSpace+":"+aTagName+"/>", 0, this);
		result.addToContent(aValue);
		this.addToContent(result);
		return result;
	},

	contentStr: function _contentStr()
	{
		if (this.content[0]) {
			this.logInfo("We have content getting first record.", 2);
			return this.content[0];
		}
		else {
			this.logInfo("We have no content.tagName:"+this.tagName, 2);
			return "";
		}
	},

	XPath: function XPath(aPath)
	{
		var tmpPath = aPath;
		var result = null;

		if (tmpPath.substr(0, 1) == "/") {
			tmpPath = tmpPath.substr(1);
		}

		try {
			while (tmpPath.indexOf("/") > -1) {
				this.logInfo("XPath:"+tmpPath, 2);
				var pathPart = tmpPath.substr(0, tmpPath.indexOf("/"));
				this.logInfo("--pathPart="+pathPart, 2);
				if (!result) {
					result = this[pathPart];
				}
				else {
					result = result[pathPart];
				}
				tmpPath = tmpPath.substr(tmpPath.indexOf("/")+1);
			}
			this.logInfo("last XPath:"+tmpPath, 2);
			if (tmpPath != "") {
				if (tmpPath.indexOf("[") > -1) {
					this.logInfo("Requested XPath contains an index or attribute request.", 2);
					var pathPart = tmpPath.substr(0, tmpPath.indexOf("["));
					var index = tmpPath.substr(tmpPath.indexOf("[")+1);
					index = index.substr(0, index.length-1);
				}

				// Currently only the object, Array index [#], Attribute [@att] or content () are supported.
				if ((!index) || ((index) && (isNaN(index)))) {

					if (index) {
						if (index.substr(0,1) == "@") {
							this.logInfo("Requested XPath contains attribute request.", 2);
							if (!result) {
								result = this[pathPart][index];
							}
							else {
								result = result[pathPart][index];
							}
						}
					}
					else {
						if (tmpPath.indexOf("()") > -1) {
							pathPart = tmpPath.substr(0, tmpPath.indexOf("()"));
							this.logInfo("Requested XPath contains content request.", 2);
							if (!result) {
								result = this[pathPart].contentStr();
							}
							else {
								result = result[pathPart].contentStr();
							}
						}
					}
				}
				else {
					this.logInfo("Requested XPath contains an index:"+Number(index), 2);
					if (!result) {
						result = this[pathPart][Number(index)];
					}
					else {
						result = result[pathPart][Number(index)];
					}
				}
			}
		}
		catch(exc) {
			this.logInfo("XPath Error:"+exc);
			result = null;
		}

		return result;
	},

	processXMLString: function _processXMLString(aString, aStartPos, aParent)
	{
		//Search for Tag opening character "<"
		var pos = this.findCharacter(aString, aStartPos, "<");
		var strLength = aString.length;

		if (pos > -1) {
			// Found opening character for Tag.
			this.startPos = pos;
			this.skipped = pos - aStartPos;
			if ((this.skipped > 0) && (aParent)) {
				this.logInfo("Added content '"+aString.substr(aStartPos, this.skipped)+"' to tag '"+aParent.tagName+"'.", 2);
				aParent.addToContent(aString.substr(aStartPos, this.skipped));
			}

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
						throw this.xmlError(Ci.mivIxml2jxon.ERR_INVALID_SPECIAL_TAG);
					}
					else {
						// found complete special tag.
						this.isXMLHeader = true;
						this.XMLHeader = aString.substr(this.startPos, tmpPos-this.startPos+1);
						this.addToContent(new mivIxml2jxon(aString, tmpPos+2, this));
						this.messageLength = tmpPos - this.startPos + 3;
						this.closed = true; 
						return;						
					}
				}
				else {
					// Error no valid header.
					throw this.xmlError(Ci.mivIxml2jxon.ERR_MISSING_SPECIAL_TAG);
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
						var tmpPos = this.findCharacter(aString, pos, ">");
						if (tmpPos > -1) {
							// We found a closing character.
							// Disassemble the tag. And see if it is the same tag as our parent. If so return else Error.
							var closingTag = aString.substr(tmpStartPos, tmpPos-tmpStartPos);
							var xmlnsPos = closingTag.indexOf(":");
							if (xmlnsPos > -1) {
								var nameSpace = closingTag.substr(0, xmlnsPos);
								closingTag = closingTag.substr(xmlnsPos+1);
							}
							else {
								var nameSpace = "_default_";
							}

							if ((aParent) && (closingTag == aParent.tagName) && (nameSpace == aParent.nameSpace)) {
								this.logInfo("Found closing tag '"+closingTag+"' in namespace '"+nameSpace+"'",2);
								this.lastPos = tmpPos;
								this.closed = true;
								return;
							}
							else {
								this.logInfo("Found closing tag '"+closingTag+"' in namespace '"+nameSpace+"' but expected tag '"+aParent.tagName+"' in namespace '"+aParent.nameSpace+"'",2);
								throw this.xmlError(Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG);
							}
						}
						else {
							throw this.xmlError(Ci.mivIxml2jxon.ERR_INVALID_TAG);
						}
					}
					else {
						// No more characters left in aString.
						throw this.xmlError(Ci.mivIxml2jxon.ERR_INVALID_TAG);
					}
				}
				else {
					// did not find special character or aString is not long enough.
					if (pos < strLength) {
						// We still have characters left.
						var tmpPos = this.findCharacter(aString, pos, ">");
						if (tmpPos > -1) {
							// We found a closing character.
							// Disassemble the tag. And process the content.
						
							// get tag name.
							var tmpStart = this.startPos + 1;
							this.tagName = "";
							while ((tmpStart < strLength) && (aString.substr(tmpStart,1) != ">") && 
								(aString.substr(tmpStart,1) != "/") && (aString.substr(tmpStart,1) != " ")) {
								this.tagName = this.tagName + aString.substr(tmpStart,1);
								tmpStart++;
							}

							var xmlnsPos = this.tagName.indexOf(":");
							if (xmlnsPos > -1) {
								this.nameSpace = this.tagName.substr(0, xmlnsPos);
								this.tagName = this.tagName.substr(xmlnsPos+1);
							}
							else {
								this.nameSpace = "_default_";
							}
							this.logInfo("Found opening tag '"+this.tagName+"' in xml namespace '"+this.nameSpace+"'",2);
							if (aParent) {
								aParent.addChildTagObject(this.tagName, this.nameSpace, this);
							}
							else {
								this.addChildTagObject(this.tagName, this.nameSpace, this);
							}

							if ((tmpStart < strLength) && (aString.substr(tmpStart,1) == "/")) {
								this.logInfo("a. Found close character '/' at end of opening tag.",2); 
								this.messageLength = tmpStart - this.startPos + 2;
								this.lastPos = tmpStart+1;
								this.closed = true;
								return;
							}
							else {
								if ((tmpStart < strLength) && (aString.substr(tmpStart,1) == " ")) {
									this.logInfo("Found space character ' '. There are attributes.",2); 

									// get attributes &
									// get namespaces
									var attribute = "";
									var attributes = [];
									tmpStart++;
									var quoteOpen = false;
									var quoteChar = "";
									while ((tmpStart < strLength) && 
										(((aString.substr(tmpStart,1) != ">") && (aString.substr(tmpStart,1) != "/")) || (quoteOpen)) ) {
										attribute = attribute + aString.substr(tmpStart,1);
										if ((aString.substr(tmpStart,1) == '"') || (aString.substr(tmpStart,1) == "'")) {
											if ((!quoteOpen) || ((quoteOpen) && (quoteChar == aString.substr(tmpStart,1)))) {
												quoteOpen = !quoteOpen;
												if (quoteOpen) {
													this.logInfo("Found opening quote:"+tmpStart,2);
													quoteChar = aString.substr(tmpStart,1);
												}
												else {
													this.logInfo("Found closing quote:"+tmpStart,2);
												}
											}
										}

										tmpStart++;

										if ((tmpStart < strLength) && (aString.substr(tmpStart,1) == " ") && (!quoteOpen)) {
											this.logInfo("a. Found attribute '"+attribute+"' for tag '"+this.tagName+"'",2);
											attributes.push(attribute);
											this.explodeAttribute(attribute);
											attribute = "";
											tmpStart++;
										}
									}

									if ((tmpStart < strLength) && ((aString.substr(tmpStart,1) == "/") || (aString.substr(tmpStart,1) == ">"))) {
										this.logInfo("b. Found attribute '"+attribute+"' for tag '"+this.tagName+"'",2);
										attributes.push(attribute);
										this.explodeAttribute(attribute);
									}

									if ((tmpStart < strLength) && (aString.substr(tmpStart,1) == "/")) {
										// Found opening tag with attributes which is also closed.
										this.logInfo("b. Found close character '/' at end of opening tag.",2); 
										this.messageLength = tmpStart - this.startPos + 2;
										this.lastPos = tmpStart+1;
										return;
									}
									else {
										if ((tmpStart < strLength) && (aString.substr(tmpStart,1) == ">")) {
											// Found opening tag with attributes.
										}
										else {
											// Found opening tag but is not closed and we reached end of string.
											throw this.xmlError(Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG);
										}
									}

								}
								else {
									if ((tmpStart < strLength) && (aString.substr(tmpStart,1) == ">")) {
										// Found opening tag without attributes and not a closing character '/'
									}
									else {
										// Found opening tag but is not closed and we reached end of string.
										throw this.xmlError(Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG);
									}
								}
						
							}


							var tmpChild = null;
							while ((!tmpChild) || (!tmpChild.closed)) {
								this.logInfo("Going to proces content of tag '"+this.tagName+"'.startPos:"+this.startPos+", messageLength:"+this.messageLength, 2);
								tmpChild = new mivIxml2jxon(aString, tmpPos+1, this);
								this.addToContent(tmpChild);
								this.messageLength = tmpChild.lastPos - this.startPos + 1;
								tmpPos = tmpChild.lastPos;
								this.logInfo("finished processing content of tag '"+this.tagName+"'.startPos:"+this.startPos+", messageLength:"+this.messageLength+",tmpChild.lastpos:"+tmpChild.lastPos, 2);
							}
							this.lastPos = tmpPos;

							
						}
						else {
							throw this.xmlError(Ci.mivIxml2jxon.ERR_INVALID_TAG);
						}
					}
					else {
						// No more characters left in aString.
						throw this.xmlError(Ci.mivIxml2jxon.ERR_INVALID_TAG);
					}
				}
			}
		}
		else {
			// Did not find opening character for Tag.
			// We stop here.
			if (aParent) {
				aParent.addToContent(aString);
				aParent.messageLength = aParent.messageLength+aString.length; 
			}
			this.lastPos = aString.length - 1;
			return;
		}
	},

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
			exchWebService.commonFunctions.LOG("[xml2jxon] "+message + " ("+exchWebService.commonFunctions.STACKshort()+")");
		}
	},

}

function NSGetFactory(cid) {

	exchWebService.commonFunctions.LOG("--NSGetFactory xml.js -- 1");
	try {
		if (!NSGetFactory.xml2json) {
			// Load main script from lightning that we need.
			NSGetFactory.xml2json = XPCOMUtils.generateNSGetFactory([mivIxml2jxon]);
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

