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

function typeString(o) {
  if (typeof o != 'object')
    return typeof o;

  if (o === null)
      return "null";
  //object, array, function, date, regexp, string, number, boolean, error
  var internalClass = Object.prototype.toString.call(o)
                                               .match(/\[object\s(\w+)\]/)[1];
  return internalClass.toLowerCase();
}

var isArray = function(obj) {
        return typeString(obj) == "array";
    }

function isInList(inArray, inStr)
{
	return (inArray[inStr] !== undefined);
}

var specialChars1 = {	" ": true, 
			"\n" : true, 
			"\r" : true, 
			"\t" : true };

function xmlErrorObject(aName, aMessage, aCode) {
	this.name = aName;
	this.message = aMessage;
	this.code = aCode;
}

function mivIxml2jxon(aXMLString, aStartPos, aParent) {

	this.content = {};
	this.itemCount = 0;
	this.messageLength = 0;
	this.closed = false;
	this.nameSpaces = {};
	this.tags = {};
	this.attr = {};

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);

	this.uuid = this.globalFunctions.getUUID();

	//this.logInfo("mivIxml2jxon.init",2);

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

	// Internal methods.

	xmlError: function _xmlError(aErrorID)
	{
		switch (aErrorID) {
			case Ci.mivIxml2jxon.ERR_MISSING_SPECIAL_TAG: 
				//this.logInfo(this.tagName+":Error:ERR_MISSING_SPECIAL_TAG. ("+this.globalFunctions.STACKshort()+")");
				return new xmlErrorObject("ERR_MISSING_SPECIAL_TAG","A special tag like '?' is missing",aErrorID);
			case Ci.mivIxml2jxon.ERR_INVALID_TAG: 
				//this.logInfo(this.tagName+":Error:ERR_INVALID_SPECIAL_TAG. ("+this.globalFunctions.STACKshort()+")");
				return new xmlErrorObject("ERR_INVALID_SPECIAL_TAG", "Tag is invalid", aErrorID);
			case Ci.mivIxml2jxon.ERR_INVALID_SPECIAL_TAG: 
				//this.logInfo(this.tagName+":Error:ERR_INVALID_SPECIAL_TAG. ("+this.globalFunctions.STACKshort()+")");
				return new xmlErrorObject("ERR_INVALID_SPECIAL_TAG", "Special Tag is invalid", aErrorID);
			case Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG: 
				//this.logInfo(this.tagName+":Error:ERR_WRONG_CLOSING_TAG. ("+this.globalFunctions.STACKshort()+")");
				return new xmlErrorObject("ERR_WRONG_CLOSING_TAG", "Found wrong closing tag. Expected another.", aErrorID);
			case Ci.mivIxml2jxon.ERR_WRONG_ATTRIBUTE_SEPARATOR: 
				//this.logInfo(this.tagName+":Error:ERR_WRONG_ATTRIBUTE_SEPARATOR. ("+this.globalFunctions.STACKshort()+")");
				return new xmlErrorObject("ERR_WRONG_ATTRIBUTE_SEPARATOR", "Found wrong attribute separator. Expected '=' character.", aErrorID);
			case Ci.mivIxml2jxon.ERR_ATTRIBUTE_VALUE_QUOTES: 
				//this.logInfo(this.tagName+":Error:ERR_ATTRIBUTE_VALUE_QUOTES. ("+this.globalFunctions.STACKshort()+")");
				return new xmlErrorObject("ERR_ATTRIBUTE_VALUE_QUOTES", "Found error in attribute value quotes.", aErrorID);
		}
	},

	addToContent: function _addToContent(aValue)
	{
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
		// Remove any of the special characters
		aValue = aValue.replace(/\n/g, "");
		aValue = aValue.replace(/\r/g, "");
		aValue = aValue.replace(/\t/g, "");


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
				//this.logInfo("Found xml namespace:"+attributeName.substr(xmlnsPos+1)+"="+attributeValue, 2);
				this.addNameSpace(attributeName.substr(xmlnsPos+1), attributeValue);
				//this.nameSpaces[attributeName.substr(xmlnsPos+1)] = attributeValue;
			}
			else {
				//this.logInfo("Found xml namespace:_default_="+attributeValue, 2);
				this.addNameSpace("" , attributeValue);
				//this.nameSpaces["_default_"] = attributeValue;
			}
		}
		else {
			//this.logInfo("Added attribute to tag '"+this.tagName+"'. "+attributeName+"="+attributeValue,2);

			this.attr[attributeName] = attributeValue;
		}
	},

	getNameSpace: function _getNameSpace(aAlias)
	{
		// Check if we have this nameSpace alias our selfs.
		//this.logInfo("getNameSpace: aAlias:'"+aAlias+"'.(tagName:"+this.tagName+")", 2);
		if (aAlias === undefined) {
			return null;
		}

		if (aAlias == "") {
			aAlias = "_default_";
		}

		if ((this.nameSpaces) && (this.nameSpaces[aAlias])) {
			//this.logInfo("getNameSpace: found namespace '"+this.nameSpaces[aAlias]+"' for aAlias '"+aAlias+"' in tag:"+this.tagName+".", 2);
			return this.nameSpaces[aAlias];
		}

		return null;
	},

	addNameSpace: function _addNameSpace(aAlias, aValue)
	{
		if (!this.nameSpaces) {
			this.nameSpaces = {};
		}

		var index = aAlias;
		if ((aAlias == "") || (aAlias === undefined)) {
			index = "_default_";
		}

		this.logInfo("addNameSpace: aAlias:"+index+", aValue:"+aValue+" to tag:"+this.tagName, 1);
		this.nameSpaces[index] = aValue;

		// Add new namespace to children.
		for each(var child in this.tags) {
			child.addNameSpace(index, aValue);
		}
	},

	deleteNameSpace: function _deleteNameSpace(aAlias)
	{
		if ((aAlias == "") || (aAlias === undefined)) {
			aAlias = "_default_";
		}

		if (this.nameSpaces[aAlias]) {
			delete this.nameSpaces[aAlias];
		}
	},

	setAttribute: function _setAttribute(aAttribute, aValue)
	{
		//this.logInfo("setAttribute: aAttribute="+aAttribute+", aValue="+aValue, 0);
		this.attr[aAttribute] = this.convertSpecialCharatersToXML(aValue);
	},

	getAttribute: function _getAttribute(aAttribute, aDefaultValue)
	{
		if (this.attr[aAttribute]) {
			//this.logInfo("@"+aAttribute+"="+this["@"+aAttribute]);
			return this.convertSpecialCharatersFromXML(this.attr[aAttribute]);
		}
		else {
			return aDefaultValue;
		}
	},

	getAttributeByTag: function _getAttributeByTag(aTagName, aAttribute, aDefaultValue)
	{
		var tmpObject = this.getTag(aTagName);
		if (tmpObject) {
			return tmpObject.getAttribute(aAttribute, aDefaultValue);
		}
		else {
			return aDefaultValue;
		}
	},

	getTag: function _getTag(aTagName)
	{
		if (this.tags[aTagName]) {
			return this.tags[aTagName];
		}

		var realIndex;
		for (var index in this.tags) {
			if (index.indexOf(tagSeparator) > -1) {
				if ((this.tags[index] instanceof Ci.mivIxml2jxon) || (this.tags[index] instanceof mivIxml2jxon)) {
					// this[index] is an xml2jxon object.
					realIndex = this.tags[index].realTagName(index);
					realATagName = this.tags[index].realTagName(aTagName);
					if (realIndex == realATagName) {
						return this.tags[index];
					}
				}
				else {
					if (isArray(this.tags[index])) {
						// this[index] is an array of xml2jxon objects. We pick the first
						var arrayIndex = 0;
						var continueArray = true;
						while ((arrayIndex < this.tags[index].length) && (continueArray)) {
							if ((this.tags[index][arrayIndex] instanceof Ci.mivIxml2jxon) || (this.tags[index][arrayIndex] instanceof mivIxml2jxon)) {
								realIndex = this.tags[index][arrayIndex].realTagName(index);
								realATagName = this.tags[index][arrayIndex].realTagName(aTagName);
								if (realIndex == realATagName) {
									return this.tags[index];
								}
							}
							arrayIndex++;
						}
					}
				}
			}
		}

		return null;
	},

	getTags: function _getTags(aTagName)
	{
		var tmpObject = this.getTag(aTagName);
		if (!tmpObject) {
			return [];
		}

		if (isArray(tmpObject)) {
			return tmpObject;
		}

		var result = new Array;
		result.push(tmpObject);
		return result;
	},

	getTagValue: function _getTagValue(aTagName, aDefaultValue)
	{
		var tmpObject = this.getTag(aTagName);
		if (tmpObject) {
			return tmpObject.value;
		}
		else {
			return aDefaultValue;
		}
	},

	getTagValueByXPath: function _getTagValueByXPath(aXPath, aDefaultValue)
	{
		var results = this.XPath(aXPath);

		var result = aDefaultValue;
		if (results.length > 0) {
			result = results[0].value;
		}
		
		results = null;
		return result;
	},

	addParentNameSpaces: function _addParentNameSpaces(aParent)
	{
		if (!this.nameSpaces) {
			this.nameSpaces = {};
		}

		for (var index in aParent.nameSpaces) {
			this.nameSpaces[index] = aParent.nameSpaces[index];
		}
	},

	addChildTagObject: function _addChildTagObject(aObject)
	{
		if (!aObject) {
			return;
		}

		if (aObject.uuid != this.uuid) {
			aObject.addParentNameSpaces(this);
		}

		var aNameSpace = aObject.nameSpace;
		var aTagName = aObject.tagName;
		if (!this.tags[aNameSpace+tagSeparator+aTagName]) {
			//this.logInfo("First childTag: "+this.tagName+"."+aNameSpace+tagSeparator+aTagName+"="+aObject,2);
			this.tags[aNameSpace+tagSeparator+aTagName] = aObject;
			//this[aNameSpace+tagSeparator+aTagName] = aObject;
			this.addToContent(aObject);
		}
		else {
			if (!isArray(this.tags[aNameSpace+tagSeparator+aTagName])) {
				var firstObject = this.tags[aNameSpace+tagSeparator+aTagName];
				////this.logInfo("creating array:'"+aNameSpace+tagSeparator+aTagName+"'",1);
				this.tags[aNameSpace+tagSeparator+aTagName] = new Array();
				this.tags[aNameSpace+tagSeparator+aTagName].push(firstObject);
			}
			//this.logInfo("childTag : "+this.tagName+"."+aNameSpace+tagSeparator+aTagName+"["+(this[aNameSpace+tagSeparator+aTagName].length+1)+"]",2);
			////this.logInfo("adding item to array:'"+aNameSpace+tagSeparator+aTagName+"'",1);
			this.tags[aNameSpace+tagSeparator+aTagName].push(aObject);
			//this[aNameSpace+tagSeparator+aTagName] = this.tags[aNameSpace+tagSeparator+aTagName];
			this.addToContent(aObject);
		}
	},

	addChildTag: function _addChildTag(aTagName, aNameSpace, aValue)
	{
		if (aNameSpace) {
			var nameSpace = aNameSpace;
		}
		else {
			if (this.nameSpace) {
				var nameSpace = this.nameSpace;
			}
			else {
				var nameSpace = "_default_";
			}
		}

		if ((aValue) && (aValue != "")) {
			var result = new mivIxml2jxon("<"+nameSpace+tagSeparator+aTagName+">"+this.convertSpecialCharatersToXML(aValue)+"</"+nameSpace+tagSeparator+aTagName+">", 0, this);
		}
		else {
			var result = new mivIxml2jxon("<"+nameSpace+tagSeparator+aTagName+"/>", 0, this);
		}

//		this.addChildTagObject(result);
		return result;
	},

	addSibblingTag: function _addChildTag(aTagName, aNameSpace, aValue)
	{
		if (!aParent) return null;

		if (aNameSpace) {
			var nameSpace = aNameSpace;
		}
		else {
			if (aParent.nameSpace) {
				var nameSpace = aParent.nameSpace;
			}
			else {
				var nameSpace = "_default_";
			}
		}

		var result = new mivIxml2jxon("<"+nameSpace+tagSeparator+aTagName+"/>", 0, this);
		result.addToContent(aValue);
		aParent.addToContent(result);
		return result;
	},

	contentStr: function _contentStr()
	{
		if (this.content[0]) {
			//this.logInfo("We have content getting first string record.", 2);
			var index = 0;
			var value = "";
			while ((index < this.itemCount) && (value == "")) {
				if ((typeof this.content[index] === "string") || (this.content[index] instanceof String)) {
					//this.logInfo(" @@: index:"+index+", content:"+this.content[index], 2);
					value = this.content[index];
				}
				index++;
			}
			return value;
		}
		else {
			//this.logInfo("We have no content.tagName:"+this.tagName, 2);
			return "";
		}
	},

	replaceFromXML: function _replaceFromXML(str, r1)
	{
		//this.globalFunctions.LOG("replaceFromXML: str:"+str+"|r1:"+r1);
		var result = str;
//try{
		if (r1.substr(0,1) == "#") {
			if (r1.substr(1,1) == "x") {
				// hexadecimal
				result = String.fromCharCode(parseInt(r1.substr(2),16))
			}
			else {
				// Decimal
				result = String.fromCharCode(parseInt(r1.substr(1),10))
			}
		}
		else {
			switch (r1) {
			case "amp": result = "&"; break;
			case "quot": result = '"'; break;
			case "apos": result = "'"; break;
			case "lt": result = "<"; break;
			case "gt": result = ">"; break;
			}
		}
//}
//catch(exc){ this.globalFunctions.LOG("replaceFromXML: Error:"+exc);}
		return result;
	},

	convertSpecialCharatersFromXML: function _convertSpecialCharatersFromXML(aString)
	{
		//this.logInfo(aString+" !! ");
		if (!aString) return aString;

		var result = aString;
		// Convert special characters
//try{
		result = result.replace(/&(quot|apos|lt|gt|amp|#x[0123456789ancdefABCDEF][0123456789ancdefABCDEF]?[0123456789ancdefABCDEF]?[0123456789ancdefABCDEF]?|#[0123456789][0123456789]?[0123456789]?[0123456789]?);/g, this.replaceFromXML); 
//} 
//catch(exc) { this.globalFunctions.LOG("[xml2jxon] Error:"+exc + " ("+this.globalFunctions.STACKshort()+")");}
		//this.logInfo(aString+" > "+result);

		return result;
	},

	replaceToXML: function _replaceToXML(str, r1)
	{
		var result = str;
		switch (r1) {
		case "&": result = "&amp;"; break;
		case '"': result = "&quot;"; break;
		case "'": result = "&apos;"; break;
		case "<": result = "&lt;"; break;
		case ">": result = "&gt;"; break;
		}

		return result;
	},
	
	convertSpecialCharatersToXML: function _convertSpecialCharatersToXML(aString)
	{
		//this.logInfo(aString+" !! ");

		if (!aString) return aString;

		var result = aString.toString();
		// Convert special characters
		result = result.replace(/(&|\x22|\x27|<|>)/g, this.replaceToXML);  
		//this.logInfo(aString+" > "+result);

		return result;
	},

	get value()
	{
		var result = this.convertSpecialCharatersFromXML(this.contentStr().toString());


		return result;
	},

	attributesToString: function _attributesToString()
	{
		var result = "";
		for (var index in this.attr) {
				result += " "+index + '="'+this.attr[index]+'"';
		}
		return result;
	},

	nameSpacesToString: function _nameSpacesToString()
	{
		var result = "";
		for (var index in this.nameSpaces) {
			if (index == "_default_") {   
				result += ' xmlns="'+this.nameSpaces[index]+'"';
			}
			else {
				result += " xmlns:"+index+'="'+this.nameSpaces[index]+'"';
			}
		}
		return result;
	},

	toString: function _toString(parentNameSpace)
	{
		//this.logInfo(this.tagName+":toString", 2);
		var nameSpaces = this.nameSpacesToString();
		var result = "";
		var contentCount = 0;
		for (var index in this.content) {
			contentCount++;
			if ((this.content[index] instanceof Ci.mivIxml2jxon) || (this.content[index] instanceof mivIxml2jxon)) {

				//this.logInfo(this.tagName+":Found object at content index '"+index+"'.", 2);
				result += this.content[index].toString(nameSpaces);
			}
			else {
				if ((typeof this.content[index] === "string") || (this.content[index] instanceof String)) {
					//this.logInfo(this.tagName+":Found string at content index '"+index+"'.", 2);
					result += this.content[index];
				}
				else {
					//this.logInfo(this.tagName+":Found UNKNOWN at content index '"+index+"'.", 2);
				}
			}
		}

		if ((parentNameSpace) && (nameSpaces == parentNameSpace)) {
			nameSpaces = "";
		}

		var attributes = this.attributesToString();

		var nameSpace = this.nameSpace;
		if (nameSpace == "_default_") {
			nameSpace = "";
		}
		else {
			nameSpace += tagSeparator;
		}

		if (contentCount == 0) {
			result = "<"+nameSpace+this.tagName+attributes+nameSpaces+"/>";
		}
		else {
			result = "<"+nameSpace+this.tagName+attributes+nameSpaces+">" + result + "</"+nameSpace+this.tagName+">";
		}

		return result;
	},

	convertComparisonPart: function _convertComparisonPart(aPart)
	{
		//this.logInfo(" == convertComparisonPart:"+aPart,2);
		var result = new Array();
		if ((aPart.substr(0,1) == "/") || (aPart.substr(0,1) == ".") || (aPart.substr(0,1) == "@")) {
			// Left side is a XPath query.
			//this.logInfo("  convertComparisonPart: this is a XPath query 1. aPart:"+aPart,2);
			result = this.XPath(aPart);
		}
		else {
			// Left side is a number or string.
			var result = new Array();
			if ( (aPart.substr(0,1) == "'") || (aPart.substr(0,1) == '"')) {
				result.push(new String(aPart.substr(1,aPart.length-2)));
			}
			else {
				if (isNaN(aPart)) {
					//this.logInfo("  convertComparisonPart: this is a XPath query 2. aPart:"+aPart,2);
					result = this.XPath(aPart);
				}
				else {
					result.push(Number(aPart));
				}
			}
		}
		return result;
	},

	if: function _if(aCondition)
	{
		var level = 0;

		//this.logInfo("if: aCondition:"+aCondition, level);

		var tmpCondition = this.trim(aCondition);

		var compareList = new Array();
		while (tmpCondition != "") {
			var startPos = 0;
			var weHaveSubCondition = false;

			if (tmpCondition.substr(0,1) == "(") {
				//this.logInfo("if: found opening round bracker.", level);
				var subCondition = this.globalFunctions.splitOnCharacter(tmpCondition.substr(1), 0, ")");
				//this.logInfo("if: subCondition:"+subCondition, level);
				if (subCondition) {
					startPos = subCondition.length;
					weHaveSubCondition = true;
				}
				else {
					throw "XPath error: Did not find closing round bracket '"+this.tagName+"' for condition:"+aCondition;
				}
			}

			var splitPart = this.globalFunctions.splitOnCharacter(tmpCondition.toLowerCase(), startPos, [" and ", " or "]);

			var operator = null;
			var comparison = null;
			if (splitPart) {
				splitPart = tmpCondition.substr(0, splitPart.length);
				tmpCondition = tmpCondition.substr(splitPart.length + 1);

				// Findout which operator was specified.
			
				if (tmpCondition.substr(0,1) == "a") {
					//this.logInfo("if: found 'and' operator.", level);
					var operator = "and";
					tmpCondition = tmpCondition.substr(4);
				}
				else {
					//this.logInfo("if: found 'or' operator.", level);
					var operator = "or";
					tmpCondition = tmpCondition.substr(3);
				}
			}
			else {
				splitPart = tmpCondition;
				tmpCondition = "";
			}
			//this.logInfo(" == splitPart:"+splitPart+", subCondition:"+subCondition+", tmpCondition="+tmpCondition, level);

			// Findout which comparison is requested.
			if (weHaveSubCondition) {
				//this.logInfo("--Add compare: left:'"+subCondition+"', right:'', operator:"+operator+", comparison:"+comparison, level);
				compareList.push( { left: subCondition, right: "", operator: operator, comparison: comparison, subCondition: subCondition} );
			}
			else {
				var splitPart2 = this.globalFunctions.splitOnCharacter(splitPart, 0, ["!=", "<=", ">=", "<", "=", ">"]);
				if (splitPart2) {
					// Get comparison type
					var smallerThen = false;
					var equalTo = false;
					var biggerThen = false;
					var splitPos2 = splitPart2.length;
					switch (splitPart.substr(splitPos2, 1)) {
						case "!" : 
							comparison = "!=";
							break;
						case "<" : 
							comparison = "<";
							if (splitPart.substr(splitPos2+1, 1) == "=") comparison = "<="; 
							break;
						case "=" : 
							comparison = "="; 
							break;
						case ">" : 
							comparison = ">";
							if (splitPart.substr(splitPos2+1, 1) == "=") comparison = ">="; 
							break;
					}
					//this.logInfo("--Add compare: left:'"+this.trim(splitPart2)+"', right:'"+this.trim(splitPart.substr(splitPart2.length+comparison.length))+"', operator:"+operator+", comparison:"+comparison, level);
					compareList.push( { left: this.trim(splitPart2), right: this.trim(splitPart.substr(splitPart2.length+comparison.length)), operator: operator, comparison: comparison, subCondition: subCondition} );
				}
				else {
					//this.logInfo("--Add compare: left:'"+this.trim(splitPart)+"', right:'', operatoroperatorcomparison:"+comparison, level);
					compareList.push( { left: this.trim(splitPart), right: "", operator: operator, comparison: comparison, subCondition: subCondition} );
				}
			}
		}

		var totalResult = true;
		var lastOperator = null;
		for (var index in compareList) {
			
			var tmpResult = false;

			if (compareList[index].subCondition) {
				//this.logInfo(" ------------------------------------1",level);
				tmpResult = this.if(compareList[index].left);
			}
			else {
				//this.logInfo(" ------------------------------------2: compareList[index].left:"+compareList[index].left+", compareList[index].right:"+compareList[index].right, level);
				var tmpLeft = this.convertComparisonPart(compareList[index].left);
				var tmpRight = this.convertComparisonPart(compareList[index].right);

				if (tmpLeft.length > 0) {
					//this.logInfo("tmpLeft.length:"+tmpLeft.length,level);
					if (compareList[index].comparison) {
						// Filter out ony the valid ones.
						if (tmpRight.length > 0) {
							//this.logInfo("tmpRight.length:"+tmpRight.length,level);
							//this.logInfo("Going to match found results to compare function",level);
							var x = 0;
							tmpResult = false;
							while ((x < tmpLeft.length) && (!tmpResult)) {

								if ((typeof tmpLeft[x] === "string") || (tmpLeft[x] instanceof String) || (typeof tmpLeft[x] === "number")) {
									//this.logInfo("  ** a", level);
									var evalConditionLeft = tmpLeft[x].toString();
								}
								else {
									//this.logInfo("  ** b", level);
									var evalConditionLeft = tmpLeft[x].value.toString();
								}

								var y = 0;
								while ((y < tmpRight.length) && (!tmpResult)) {

									if ((typeof tmpRight[y] === "string") || (tmpRight[y] instanceof String) || (typeof tmpRight[y] === "number")) {
										//this.logInfo("  ** c", level);
										var evalConditionRight = tmpRight[y].toString();
									}
									else {
										this.logInfo("  ** d", level);
										var evalConditionRight = tmpRight[y].value.toString();
									}

									//this.logInfo(" +++ Going to compare:'"+evalConditionLeft+compareList[index].comparison+evalConditionRight+"'",level);
									//this.logInfo("   + typeof evalConditionLeft:"+typeof evalConditionLeft, level);
									//this.logInfo("   + typeof evalConditionRight:"+typeof evalConditionRight, level);
									switch (compareList[index].comparison) {
									case "!=":
										tmpResult = (evalConditionLeft != evalConditionRight);
										break;
									case "<=":
										tmpResult = (evalConditionLeft <= evalConditionRight);
										break;
									case ">=":
										tmpResult = (evalConditionLeft >= evalConditionRight);
										break;
									case "<":
										tmpResult = (evalConditionLeft < evalConditionRight);
										break;
									case "=":
										tmpResult = (evalConditionLeft==evalConditionRight);
										break;
									case ">":
										tmpResult = (evalConditionLeft > evalConditionRight);
										break;
									}

									y++;
								}
								x++;
							}
						}
					}
					else {
						// Return all results.
						tmpResult = true;
					}
				}
				else {
					tmpResult = false;
				}

				tmpLeft = null;
				tmpRight = null;
			}

			//this.logInfo(" @@@@@@@@@@@@ -------- MATCHFOUND["+index+"]:"+tmpResult+" ---------- @@@@@@@@@@@@@", level);
			switch (lastOperator) {
			case "and":
				totalResult = (totalResult && tmpResult);
				break;
			case "or":
				totalResult = (totalResult || tmpResult);
				break;
			case null:
				totalResult = tmpResult;
				break;
			}
			if (compareList[index].operator) {
				if ((compareList[index].operator == "and") && (!totalResult)) { // We are done false is the endresult.
					return false;
				}
				if ((compareList[index].operator == "or") && (totalResult)) {// We are done true is the endresult.
					return true;
				}
			}

			lastOperator = compareList[index].operator;
			//this.logInfo(" @@@@@@@@@@@@ -------- totalResult["+index+"]:"+totalResult+" ---------- @@@@@@@@@@@@@", level);
		}

		return totalResult;
	},

	realTagName: function _realTagName(aCurrentTagName)
	{
		var result = aCurrentTagName;
		var tmpAlias = "_default_";
		var tmpTagName = "";
		var aliasPos = aCurrentTagName.indexOf(tagSeparator);
		if (aliasPos > -1) {
			tmpAlias = aCurrentTagName.substr(0,aliasPos);
			tmpTagName = aCurrentTagName.substr(aliasPos+1);
		}
		else {
			tmpTagName = aCurrentTagName;
		}
		var newNameSpace = this.getNameSpace(tmpAlias);
		if (newNameSpace) {
			result = newNameSpace + tagSeparator + tmpTagName;
		}

		return result;
	},

	XPath: function XPath(aPath)
	{
		//this.logInfo("XPath:"+aPath,0);
		var tmpPath = aPath;
		var result = new Array();

		if (tmpPath.substr(0, 1) == "/") {
			tmpPath = tmpPath.substr(1);
		}

		switch (tmpPath.substr(0,1)) {
		case "/" : // Find all elements by specified element name
			var allTag = this.globalFunctions.splitOnCharacter(tmpPath.substr(1), 0, ["/", "["]);
			if (!allTag) {
				allTag = tmpPath.substr(1);
			}

			//this.logInfo(" @@ allTag="+allTag, 2);

			for (var index in this.tags) {
				if (index.indexOf(tagSeparator) > -1) {
					result.push(this.tags[index]);
				}
			}
			tmpPath = "/"+tmpPath;
			break;

		case "@" : // Find attribute within this element
			//this.logInfo("Attribute search:"+tmpPath+" in tag '"+this.tagName+"'", 0);
			if (this.attr[tmpPath.substr(1)]) {
				//this.logInfo("  --==--:"+this[tmpPath], 0);
				result.push(this.attr[tmpPath.substr(1)]);
			}
			tmpPath = "";
			break;

		case "*" : // Wildcard. Will parse all children.
			tmpPath = tmpPath.substr(1);
			for (var index in this.tags) {

				if ((this.tags[index]) && (index.indexOf(tagSeparator) > -1)) {
					var tmpTagName = "";
					var tmpIsArray = isArray(this.tags[index]);
					if (tmpIsArray) {
						tmpTagName = this.tags[index][0].tagName;
					}
					else {
						tmpTagName = this.tags[index].tagName;
					}

					if (tmpTagName != this.tagName) {
						//this.logInfo(" -- tag:"+index, 2);
						if (tmpIsArray) {
							for (var index2 in this.tags[index]) {
								result.push(this.tags[index][index2]);
							}
						}
						else {
							result.push(this.tags[index]);
						}
					}
					
				}

			}
			break;

		case "[" : // Compare/match function
			//this.logInfo("Requested XPath contains an index, attribute or compare request.", 0);

			var index = this.globalFunctions.splitOnCharacter(tmpPath.substr(1), 0, "]");
			if (!index) {
				throw "XPath error: Did not find closing square bracket. tagName:"+this.tagName+", tmpPath:"+tmpPath;
			}

			tmpPath = tmpPath.substr(index.length+2);
			//this.logInfo("Condition: ["+index+"], tmpPath:"+tmpPath,0);

			index = this.trim(index); 

			if (index != "") {

				//this.logInfo("Going to see what condition we have. index="+index);
				if (this.if(index)) {
					//this.logInfo(" %%%%%%%%%%%%%% -------- MATCHFOUND ---------- %%%%%%%%%%%%%%", 2);
					result.push(this);
				}

			}
			else {
				//this.logInfo("Nothing specified between the square brackets!!??",1);
				throw "XPath compare error:No Value between square brackets:"+this.tagName+"["+index+"]";
			}
			break;

		default:
			var bracketPos = tmpPath.indexOf("[");
			var forwardSlashPos = tmpPath.indexOf("/");
			var splitPos = tmpPath.length;
			if ((bracketPos < splitPos) && (bracketPos > -1)) {
				splitPos = bracketPos;
			}
			if ((forwardSlashPos < splitPos) && (forwardSlashPos > -1)) {
				splitPos = forwardSlashPos;
			}

			var tmpPath2 = tmpPath.substr(0, splitPos);
			tmpPath = tmpPath.substr(splitPos);

			if (tmpPath2 != "") {

				tmpPath2 = this.realTagName(tmpPath2);

				//this.logInfo("We will check if specified element '"+tmpPath2+"' exists as child in '"+this.tagName+"'", 0);
				for (var index in this.tags) {
					if (index.indexOf(tagSeparator) > -1) {
						//this.logInfo(" %%:"+index, 2);

						var realIndex = index;
						if (realIndex != tmpPath2) {
							if ((this.tags[index] instanceof Ci.mivIxml2jxon) || (this.tags[index] instanceof mivIxml2jxon)) {
								// this[index] is an xml2jxon object.
								realIndex = this.tags[index].realTagName(index);
							}
							else {
								if (isArray(this.tags[index])) {
									// this[index] is an array of xml2jxon objects. We pick the first
									var arrayIndex = 0;
									var continueArray = true;
									while ((arrayIndex < this.tags[index].length) && (continueArray)) {
										if ((this.tags[index][arrayIndex] instanceof Ci.mivIxml2jxon) || (this.tags[index][arrayIndex] instanceof mivIxml2jxon)) {
											realIndex = this.tags[index][arrayIndex].realTagName(index);
											continueArray = false;
										}
										arrayIndex++;
									}
								}
							}
						}

						if (realIndex == tmpPath2) {
							if (isArray(this.tags[index])) {
								//this.logInfo(" ^^ found tag:"+index+" and is an array with "+this[index].length+" elements.", 2);
								for (var index2 in this.tags[index]) {
									result.push(this.tags[index][index2]);
								}
							}
							else {
								//this.logInfo(" ^^ found tag:"+index, 2);
								result.push(this.tags[index]);
							}
						}
					}
				}

			}

		} // End of switch

			//this.logInfo("tmpPath:"+tmpPath+", result.length="+result.length,2);
		if ((result.length > 0) && (tmpPath != "")) {
			//this.logInfo("tmpPath:"+tmpPath,2);
			var finalResult = new Array();
			for (var index in result) {

				if ((typeof result[index] === "string") || (result[index] instanceof String)) {
					finalResult.push(result[index]);
				}
				else {
					if (isArray(result[index])) {
						for (var index2 in result[index]) {
							//this.logInfo("~~a:"+result[index][index2].tagName, 2);
							var tmpResult = result[index][index2].XPath(tmpPath);
							if (tmpResult) {
								for (var index3 in tmpResult) {
									finalResult.push(tmpResult[index3]);
									tmpResult[index3] = null;
								}
							}
							tmpResult = null;
						}
					}
					else {
						//this.logInfo("~~aa:index:"+index, 2);
						//this.logInfo("~~ab:"+result[index].tagName, 2);
						var tmpResult = result[index].XPath(tmpPath);
						if (tmpResult) {
							for (var index2 in tmpResult) {
								finalResult.push(tmpResult[index2]);
								tmpResult[index2] = null;
							}
						}
						tmpResult = null;
					}
				}
			}
			result = finalResult;
		}
		else {
			if ((tmpPath != "") && (tmpPath.substr(0,2) != "//")) {
				var finalResult = new Array();
				//this.logInfo("~~b:"+this.tagName, 2);
				var tmpResult = this.XPath(tmpPath);
				if (tmpResult) {
					for (var index2 in tmpResult) {
						finalResult.push(tmpResult[index2]);
						tmpResult[index2] = null;
					}
				}
				tmpResult = null;
				result = finalResult;
			}
		}

			//this.logInfo("@@ tmpPath:"+tmpPath+", tag:"+this.tagName+", allTag:"+allTag+", result.length="+result.length,2);
		if ((tmpPath != "") && (tmpPath.substr(0,2) == "//") && (this.tags[allTag]) && (this.tagName == this.tags[allTag].tagName)) {
			//this.logInfo(" !!:tag:"+this.tagName, 2);
dump("3. !!??\n");
			tmpPath = tmpPath.substr(1); // We remove one of double forward slash so it becomes a normal xpath and filtering will take place.
			if ((tmpPath != "") && (tmpPath.substr(0,2) != "//")) {
				var finalResult = new Array();
				//this.logInfo("~~c:"+this.tagName, 2);
				var tmpResult = this.XPath(tmpPath);
				if (tmpResult) {
					for (var index2 in tmpResult) {
						finalResult.push(tmpResult[index2]);
						tmpResult[index2] = null;
					}
				}
				tmpResult = null;
				result = finalResult;
			}

//			result.push(this);
		}

		//this.logInfo("XPath return.....",2);
		return result;
	},

	processXMLString: function _processXMLString(aString, aStartPos, aParent)
	{
		//Search for Tag opening character "<"
		if (!aString) return;

		var pos = this.findCharacter(aString, aStartPos, "<");
		var strLength = aString.length;

		if (pos > -1) {
			// Found opening character for Tag.
			this.startPos = pos;
			this.skipped = pos - aStartPos;
			if ((this.skipped > 0) && (aParent)) {
				//this.logInfo("Added content '"+aString.substr(aStartPos, this.skipped)+"' to tag '"+aParent.tagName+"'.", 2);
				aParent.addToContent(new String(aString.substr(aStartPos, this.skipped)));
			}

			pos++;
			// check if next character is special character "?"
			var tmpChar = aString.substr(pos, 1);
			if ( (pos < strLength) && (tmpChar == "?")) {
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
				if ( (pos < strLength) && (tmpChar == "/")) {
					// found special character "/" at start of tag
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
							var xmlnsPos = closingTag.indexOf(tagSeparator);
							if (xmlnsPos > -1) {
								var nameSpace = closingTag.substr(0, xmlnsPos);
								closingTag = closingTag.substr(xmlnsPos+1);
							}
							else {
								var nameSpace = "_default_";
							}

							if ((aParent) && (closingTag == aParent.tagName) && (nameSpace == aParent.nameSpace)) {
								//this.logInfo("Found closing tag '"+closingTag+"' in namespace '"+nameSpace+"'",2);
								this.lastPos = tmpPos;
								this.closed = true;
								return;
							}
							else {
								//this.logInfo("Found closing tag '"+closingTag+"' in namespace '"+nameSpace+"' but expected tag '"+aParent.tagName+"' in namespace '"+aParent.nameSpace+"'",1);
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
							tmpChar = aString.substr(tmpStart,1);
							while ((tmpStart < strLength) && (tmpChar != ">") && 
								(tmpChar != "/") && (!(isInList(specialChars1,tmpChar)))) {
								this.tagName = this.tagName + tmpChar;
								tmpStart++;
								tmpChar = aString.substr(tmpStart,1);
							}

							var xmlnsPos = this.tagName.indexOf(tagSeparator);
							if (xmlnsPos > -1) {
								this.nameSpace = this.tagName.substr(0, xmlnsPos);
								this.tagName = this.tagName.substr(xmlnsPos+1);
							}
							else {
								this.nameSpace = "_default_";
							}
							//this.logInfo("Found opening tag '"+this.tagName+"' in xml namespace '"+this.nameSpace+"'",2);
							if (aParent) {
								aParent.addChildTagObject(this);
							}

							if ((tmpStart < strLength) && (tmpChar == "/")) {
								//this.logInfo("a. Found close character '/' at end of opening tag.",2); 
								this.messageLength = tmpStart - this.startPos + 2;
								this.lastPos = tmpStart+1;
								return;
							}
							else {
								if ((tmpStart < strLength) && (isInList(specialChars1,tmpChar))) {
									//this.logInfo("Found special character. There are attributes.",2); 

									// get attributes &
									// get namespaces
									var attribute = "";
									var attributes = [];
									tmpStart++;
									tmpChar = aString.substr(tmpStart,1);
									var quoteOpen = false;
									var seenAttributeSeparator = false;
									var quoteChar = "";
									while ((tmpStart < strLength) && 
										(((tmpChar != ">") && (tmpChar != "/")) || (quoteOpen)) ) {

										attribute = attribute + tmpChar;

										if ((!seenAttributeSeparator) && (tmpChar == "=") && (!quoteOpen)) {
											//this.logInfo("seenAttributeSeparator: pos:"+tmpStart+", attribute:"+attribute,2);
											seenAttributeSeparator = true;
										}
										else {
											if (seenAttributeSeparator) {
//												if (((tmpChar == '"') || (tmpChar == "'")) && (seenAttributeSeparator)) {
												if ((tmpChar == '"') || (tmpChar == "'")) {
													if ((!quoteOpen) || ((quoteOpen) && (quoteChar == tmpChar))) {
														quoteOpen = !quoteOpen;
														if (quoteOpen) {
															//this.logInfo("Found opening quote:"+tmpStart,2);
															quoteChar = tmpChar;
														}
/* Removed it from the code for performance														else {
															//this.logInfo("Found closing quote:"+tmpStart,2);
														}*/
													}
												}
											}
										}

										tmpStart++;
										tmpChar = aString.substr(tmpStart,1);

										if ((seenAttributeSeparator) && (tmpStart < strLength) && (isInList(specialChars1,tmpChar)) && (!quoteOpen)) {
											//this.logInfo("a. Found attribute '"+attribute+"' for tag '"+this.tagName+"'",2);
											attributes.push(attribute);
											this.explodeAttribute(attribute);
											attribute = "";
											seenAttributeSeparator = false;
											tmpStart++;
											tmpChar = aString.substr(tmpStart,1);
										}
									}

									if ((seenAttributeSeparator) && (!quoteOpen) && (tmpStart < strLength) && (attribute.length > 0)) {
										//this.logInfo("b. Found attribute '"+attribute+"' for tag '"+this.tagName+"'",2);
										attributes.push(attribute);
										this.explodeAttribute(attribute);
										seenAttributeSeparator = false;
										attribute = "";
									}
/* Removed it from the code for performance									else {
										if ((!seenAttributeSeparator) && (tmpStart < strLength) && (attribute.length > 0)) {
											// We might have hit some blank space.
											// For now do nothing with it.
										}
									}*/

									if ((tmpStart < strLength) && (tmpChar == "/")) {
										// Found opening tag with attributes which is also closed.
										//this.logInfo("b. Found close character '/' at end of opening tag.",2); 
										this.messageLength = tmpStart - this.startPos + 2;
										this.lastPos = tmpStart+1;
										return;
									}
									else {
										if (!((tmpStart < strLength) && (tmpChar == ">"))) {
											// Found opening tag with attributes.
//										}
//										else {
											// Found opening tag but is not closed and we reached end of string.
											throw this.xmlError(Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG);
										}
									}

								}
								else {
									if (!((tmpStart < strLength) && (tmpChar == ">"))) {
										// Found opening tag without attributes and not a closing character '/'
//									}
//									else {
										// Found opening tag but is not closed and we reached end of string.
										throw this.xmlError(Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG);
									}
								}
						
							}


							var tmpChild = null;
							while ((!tmpChild) || (!tmpChild.closed)) {
								//this.logInfo("Going to proces content of tag '"+this.tagName+"'.startPos:"+this.startPos+", messageLength:"+this.messageLength, 2);
								tmpChild = new mivIxml2jxon(aString, tmpPos+1, this);
								this.messageLength = tmpChild.lastPos - this.startPos + 1;
								tmpPos = tmpChild.lastPos;

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
				//this.logInfo(" =======++++++++++");
				aParent.addToContent(new String(aString));
				aParent.messageLength = aParent.messageLength+aString.length; 
			}
			this.lastPos = aString.length - 1;
			return;
		}

	},

	findCharacter: function _findCharacter(aString, aStartPos, aChar)
	{
		if (!aString) return -1;

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
		if (!aString) return -1;

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

		return;

		if (!aDebugLevel) {
			var debugLevel = 1;
		}
		else {
			var debugLevel = aDebugLevel;
		}

		var prefB = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		var storedDebugLevel = this.globalFunctions.safeGetIntPref(prefB, "extensions.1st-setup.xml2jxon", 0, true);
		var storedDebugLevel = 1;
		if (debugLevel <= storedDebugLevel) {
			this.globalFunctions.LOG("[xml2jxon] "+message + " ("+this.globalFunctions.STACKshort()+")");
		}
	},

}

function NSGetFactory(cid) {

	try {
		if (!NSGetFactory.xml2json) {
			// Load main script from lightning that we need.
			NSGetFactory.xml2json = XPCOMUtils.generateNSGetFactory([mivIxml2jxon]);
			
	}

	} catch(e) {
		Components.utils.reportError(e);
		dump(e);
		throw e;
	}

	return NSGetFactory.xml2json(cid);
} 

