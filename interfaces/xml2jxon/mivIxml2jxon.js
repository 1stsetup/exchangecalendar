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

function isArray(obj) {
	return (typeString(obj) == "array");
}

function isInList(inArray, inStr)
{
	return (inArray[inStr] !== undefined);
}

const specialChars1 = {	" ": true, 
			"\n" : true, 
			"\r" : true, 
			"\t" : true };

function findCharacter(aStr, aSP, aChar)
{
	if (!aStr) return -1;

	var pos = aSP;
	var strLength = aStr.length;
	while ((pos < strLength) && (aStr[pos] != aChar)) {
		pos++;
	}

	if (pos < strLength) {
		return pos;
	}

	return -1;
}

function findString(aStr, aSP, aNeedle)
{
	if (!aStr) return -1;

	var pos = aSP;
	var needleLength = aNeedle.length;
	var strLength = aStr.length - needleLength + 1;
	while ((pos < strLength) && (aStr.substr(pos, needleLength) != aNeedle)) {
		pos++;
	}

	if (pos < strLength) {
		return pos;
	}

	return -1;
}

function splitOnCharacter(aStr, aSP, aSplitCharacter)
{
	if (!aStr) {
		return null;
	}

	var tmpPos = aSP;
	var result = "";
	var notClosed = true;
	var notQuoteOpen = true;
	var quotesUsed = "";
	var strLen = aStr.length;
	var splitCharIsArray = isArray(aSplitCharacter);
	while ((tmpPos < strLen) && (notClosed)) {
		if ((aStr[tmpPos] == "'") || (aStr[tmpPos] == '"')) {
			// We found quotes. Do they belong to our string.
			if (notQuoteOpen) {
				quotesUsed = aStr[tmpPos];
				notQuoteOpen = false;
			}
			else {
				if (aStr[tmpPos] == quotesUsed) {
					quotesUsed = "";
					notQuoteOpen = true;
				}
			}
		}

		var hitSplitCharacter = false;
		if (notQuoteOpen) {
			if (splitCharIsArray) {
				for (var index in aSplitCharacter) {
					if (aStr.substr(tmpPos,aSplitCharacter[index].length) == aSplitCharacter[index]) {
						hitSplitCharacter = true;
						break;
					}
				}
			}
			else {
				if (aStr.substr(tmpPos,aSplitCharacter.length) == aSplitCharacter) {
					hitSplitCharacter = true;
				}
			}
		}

		if (hitSplitCharacter) {
			notClosed = false;
		}
		else {
			result += aStr[tmpPos];
		}
		tmpPos++;
	}

	if (!notClosed) {
		return result;
	}
	else {
		return null;
	}
}

var replaceFromXML = function _replaceFromXML(str, r1)
{
	var result = str;
	if (r1[0] == "#") {
		if (r1[1] == "x") {
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
	return result;
}

function convertSpecialCharatersFromXML(aStr)
{
	if (!aStr) return aStr;

	var result = aStr;
	// Convert special characters
	result = result.replace(/&(quot|apos|lt|gt|amp|#x[0123456789ancdefABCDEF][0123456789ancdefABCDEF]?[0123456789ancdefABCDEF]?[0123456789ancdefABCDEF]?|#[0123456789][0123456789]?[0123456789]?[0123456789]?);/g, replaceFromXML); 

	return result;
}

var replaceToXML = function _replaceToXML(str, r1)
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
}

function convertSpecialCharatersToXML(aStr)
{
	if ((aStr === null) || (aStr === undefined)) return aStr;

	var result = aStr.toString();
	// Convert special characters
	result = result.replace(/(&|\x22|\x27|<|>)/g, replaceToXML);  

	return result;
}

function trim(aValue)
{
	var strLength = aValue.length;
	var leftPos = 0;
	while ((leftPos < strLength) && (aValue[leftPos] == " ")) {
		leftPos++;
	}
	var rightPos = strLength-1;
	while ((rightPos >= 0) && (aValue[rightPos] == " ")) {
		rightPos--;
	}
	return aValue.substr(leftPos, rightPos - leftPos + 1);
}

var nameSpaceMgr = Cc["@1st-setup.nl/conversion/namespaces;1"]
			.getService(Ci.mivNameSpaces);

var tagNameMgr = Cc["@1st-setup.nl/conversion/tagnames;1"]
			.getService(Ci.mivTagNames);

const cId = "@1st-setup.nl/conversion/xml2jxon;1";

var EXPORTED_SYMBOLS = ["mivIxml2jxon"];

function mivIxml2jxon(aXMLString, aSP, aParent) {
//	var statisticsMgr = Cc["@1st-setup.nl/exchange/statistics;1"]
//				.getService(Ci.mivExchangeStatistics);
//	statisticsMgr.addXML2JXONObject();
	this.content = {};
	this.itemCount = 0;
	this.messageLength = 0;
	this._c1 = false;
	this.nameSpaces = {};
	this.tags = {};
	this.attr = {};
	this._siblings = new Array();
	this.uuid = Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator).generateUUID().toString().replace(/[{}]/g, '');
	if (aXMLString) {this.processXMLString(aXMLString, aSP, aParent);}
}

const xguid = "d7165a60-7d64-42b2-ac48-6ccfc0962abb";
const tsep = ":";

mivIxml2jxon.prototype = {
	QueryInterface: XPCOMUtils.generateQI([Ci.mivIxml2jxon,Ci.nsIClassInfo,Ci.nsISupports]),
	getHelperForLanguage: function _getHelperForLanguage(language) {return null;},
	getInterfaces: function _getInterfaces(c){c.value = 3;return [Ci.mivIxml2jxon,Ci.nsIClassInfo,Ci.nsISupports];},
	classDescription: "XML2JXON",
	classID: components.ID("{"+xguid+"}"),
	contractID: cId,
	flags: Ci.nsIClassInfo.THREADSAFE,
	implementationLanguage: Ci.nsIProgrammingLanguage.JAVASCRIPT,
	get closed(){return this._c1;},
	set closed(a){this._c1 = a;},
	addToContent: function _addToContent(a){
		if ((this.itemCount > 0) && (trim(a) == "")) {return;}
		this.content[this.itemCount] = a;
		this.itemCount++;
	},

	explodeAttribute: function _explodeAttribute(a){
		// Remove any of the special characters
		a = a.replace(/\n/g, "").replace(/\r/g, "").replace(/\t/g, "");
		var sp = a.indexOf("=");
		if (sp == -1) {throw Ci.mivIxml2jxon.ERR_WRONG_ATTRIBUTE_SEPARATOR;}
		var an = trim(a.substr(0, sp));
		var av = trim(a.substr(sp+1));
		var tc = av[0];
		if ((tc == "'") || (tc == '"')) {
			let vl = av.length;
			if (tc == av[vl-1]) {av = av.substr(1, vl-2);}
			else {throw Ci.mivIxml2jxon.ERR_ATTRIBUTE_VALUE_QUOTES;}
		}
		if (an.toLowerCase().indexOf("xmlns") == 0) {
			let xp = an.indexOf(":");
			if (xp > -1) {this.addNameSpace(an.substr(xp+1), av);}
			else {this.addNameSpace("" , av);}
		}
		else {this.attr[an] = av;}
	},

	getNameSpace: function _getNameSpace(a){
		if (a === undefined) {return null;}
		if (a == "") {a = "_default_";}
		return nameSpaceMgr.getNameSpace(this.nameSpaces[a]);
	},

	addNameSpace: function _addNameSpace(a, b){
		var index = a;
		if ((a == "") || (a === undefined)) {index = "_default_";}
		this.nameSpaces[index] = nameSpaceMgr.addNameSpace(a, b);
		for each(var child in this.tags) {child.addNameSpace(index, b);}
	},

	setAttribute: function _setAttribute(a, b){
		this.attr[a] = convertSpecialCharatersToXML(b);
	},

	getAttribute: function _getAttribute(a, b){
		if (this.attr[a]) {return convertSpecialCharatersFromXML(this.attr[a]);}
		else {return b;}
	},

	getAttributeByTag: function _getAttributeByTag(a, b, c){
		var to = this.getTag(a);
		if (to) {return to.getAttribute(b, c);}
		else {return c;}
	},

	get tagName(){
		if (this._tagNameIndex === undefined) return "";
		return tagNameMgr.getTagName(this._tagNameIndex);
	},

	set tagName(a){
		this._tagNameIndex = tagNameMgr.addTagName(a);
	},

	getTag: function _getTag(a){
		if (this.tags[a]) {return this.tags[a];}
		var it = a;
		var sp = it.indexOf(tsep);
		if (sp > -1) {it = it.substr(sp);}
		var ri;
		var rt;
		for (let index in this.tags) {
			let childTag = this.tags[index];
			if ((childTag instanceof Ci.mivIxml2jxon) || (childTag instanceof mivIxml2jxon)) {
				// this[index] is an xml2jxon object.
				ri = childTag.realTagName(index);
				rt = childTag.realTagName(a);
				if (ri == rt) {return childTag;}
			}
			else {for (let arrayIndex in childTag) {
					ri = childTag[arrayIndex].realTagName(index);
					rt = childTag[arrayIndex].realTagName(a);
					if (ri == rt) {return childTag;}
				}
			}
		}
		return null;
	},

	getTags: function _getTags(a)	{
		var to = this.getTag(a);
		if (!to) {return [];}
		if (isArray(to)) {return to;}
		var r = new Array;
		r.push(to);
		return r;
	},

	getTagValue: function _getTagValue(a, b){
		var to = this.getTag(a);
		if (to) {return to.value;}
		else {return b;}
	},

	getTagValueByXPath: function _getTagValueByXPath(a, b)	{
		var rs = this.XPath(a);
		var r = b;
		if (rs.length > 0) {r = rs[0].value;}
		rs = null;
		return r;
	},

	addParentNameSpaces: function _addParentNameSpaces(a){
		if (!a.nameSpaces) return;
		if (!this.nameSpaces) {this.nameSpaces = {};}
		for (let index in a.nameSpaces) {
			if (!this.nameSpaces[index]) {this.nameSpaces[index] = a.nameSpaces[index];}
		}
	},

	addChildTagObject: function _addChildTagObject(a){
//dump("addChildTagObject:\n");
		if (!a) {return;}
		if (a.uuid != this.uuid) {a.addParentNameSpaces(this);}
		var ntn = a.nameSpace+tsep+a.tagName;
		if (!this.tags[ntn]) {this.tags[ntn] = a;}
		else {
			if (!isArray(this.tags[ntn])) {
				let fo = this.tags[ntn];
				this.tags[ntn] = new Array();
				this.tags[ntn].push(fo);
			}
			this.tags[ntn].push(a);
		}
	},

	addChildTag: function _addChildTag(a, b, c){
		var ns;
		if (b) {ns = b;}
		else {if (this.nameSpace) {ns = this.nameSpace;}
			else {ns = "_default_";}
		}
		if (c === false) {c = "false";}
		if (c === 0) { c = "0";}
		if ((c !== undefined) && (c !== null) && (c != "")) {var xml = "<"+ns+tsep+a+">"+convertSpecialCharatersToXML(c)+"</"+ns+tsep+a+">"}
		else {var xml = "<"+ns+tsep+a+"/>"}
		var r = new mivIxml2jxon(xml,0, this);
		return r;
	},

	addSibblingTag: function _addSibblingTag(a, b, c){
		if (b) {var nameSpace = b;}
		else {var nameSpace = "_default_";}
		var r = new mivIxml2jxon("<"+nameSpace+tsep+a+"/>", 0, null);
		r.addToContent(c);
		this._siblings.push(r);
		return r;
	},

	contentStr: function _contentStr(){
		if (this.content[0]) {return this.content[0];}
		else {return "";}
	},

	get value(){return convertSpecialCharatersFromXML(this.contentStr().toString());},

	attributesToString: function _attributesToString(){
		var r = "";
		for (let i in this.attr) {r += " "+i + '="'+this.attr[i]+'"';}
		return r;
	},

	nameSpacesToString: function _nameSpacesToString(){
		var r = "";
		for (let i in this.nameSpaces) {
			if (i == "_default_") {r += ' xmlns="'+nameSpaceMgr.getNameSpace(this.nameSpaces[i])+'"';}
			else {r += " xmlns:"+i+'="'+nameSpaceMgr.getNameSpace(this.nameSpaces[i])+'"';}
		}
		return r;
	},

	clone: function _clone(){return new mivIxml2jxon(this.toString(), 0, null);},

	toString: function _toString(a){
		var nss = this.nameSpacesToString();
		var r = "";
		var cc = 0;
		for (let index in this.tags) {
			cc++;
			if (isArray(this.tags[index])) {
				for each(let tag in this.tags[index]) {
					r += tag.toString(nss);
				}
			}
			else {
				r += this.tags[index].toString(nss);
			}
			
		}
		for (let index in this.content) {
			cc++;
			if ((typeof this.content[index] === "string") || (this.content[index] instanceof String)) {
				r += this.content[index];
			}
		}
		if ((a) && (nss == a)) {nss = "";}
		var at = this.attributesToString();
		var ns = this.nameSpace;
		if (ns == "_default_") {ns = "";}
		else {ns += tsep;}
		if (cc == 0) {
			r = "<"+ns+this.tagName+at+nss+"/>";
		}
		else {
			r = "<"+ns+this.tagName+at+nss+">" + r + "</"+ns+this.tagName+">";
		}
		for each(let s in this._siblings) {r = r + s.toString();}
		return r;
	},

	convertComparisonPart: function _convertComparisonPart(a){
		var r = new Array();
		var tc = a[0];
		if ((tc == "/") || (tc == ".") || (tc == "@")) {r = this.XPath(a);}
		else {
			r = new Array();
			if ( (tc == "'") || (tc == '"')) {
				r.push(new String(a.substr(1,a.length-2)));
			}
			else {
				if (isNaN(a)) {r = this.XPath(a);}
				else {r.push(Number(a));}
			}
		}
		return r;
	},

	if: function _if(aCondition){
		var level = 0;
		var tmpCondition = trim(aCondition);
		var compareList = new Array();
		while (tmpCondition != "") {
			var startPos = 0;
			var weHaveSubCondition = false;
			if (tmpCondition[0] == "(") {
				var subCondition = splitOnCharacter(tmpCondition.substr(1), 0, ")");
				if (subCondition) {
					startPos = subCondition.length;
					weHaveSubCondition = true;
				}
				else {
					throw "XPath error: Did not find closing round bracket '"+this.tagName+"' for condition:"+aCondition;
				}
			}

			var splitPart = splitOnCharacter(tmpCondition.toLowerCase(), startPos, [" and ", " or "]);
			var operator = null;
			var comparison = null;
			if (splitPart) {
				splitPart = tmpCondition.substr(0, splitPart.length);
				tmpCondition = tmpCondition.substr(splitPart.length + 1);

				if (tmpCondition[0] == "a") {
					operator = "and";
					tmpCondition = tmpCondition.substr(4);
				}
				else {
					operator = "or";
					tmpCondition = tmpCondition.substr(3);
				}
			}
			else {
				splitPart = tmpCondition;
				tmpCondition = "";
			}
			if (weHaveSubCondition) {
				compareList.push( { left: subCondition, right: "", operator: operator, comparison: comparison, subCondition: subCondition} );
			}
			else {
				var splitPart2 = splitOnCharacter(splitPart, 0, ["!=", "<=", ">=", "<", "=", ">"]);
				if (splitPart2) {
					// Get comparison type
					var smallerThen = false;
					var equalTo = false;
					var biggerThen = false;
					var splitPos2 = splitPart2.length;
					switch (splitPart[splitPos2]) {
						case "!":comparison = "!=";break;
						case "<":comparison = "<";if (splitPart[splitPos2+1] == "=") comparison = "<=";break;
						case "=":comparison = "=";break;
						case ">":comparison = ">";if (splitPart[splitPos2+1] == "=") comparison = ">=";break;
					}
					compareList.push( { left: trim(splitPart2), right: trim(splitPart.substr(splitPart2.length+comparison.length)), operator: operator, comparison: comparison, subCondition: subCondition} );
				}
				else {
					compareList.push( { left: trim(splitPart), right: "", operator: operator, comparison: comparison, subCondition: subCondition} );
				}
			}
		}
		var totalResult = true;
		var lastOperator = null;
		for (let index in compareList) {
			var tmpResult = false;
			if (compareList[index].subCondition) {tmpResult = this.if(compareList[index].left);}
			else {
				let tmpLeft = this.convertComparisonPart(compareList[index].left);
				let tmpRight = this.convertComparisonPart(compareList[index].right);
				if (tmpLeft.length > 0) {
					if (compareList[index].comparison) {
						// Filter out ony the valid ones.
						if (tmpRight.length > 0) {
							var x = 0;
							tmpResult = false;
							while ((x < tmpLeft.length) && (!tmpResult)) {
								if ((typeof tmpLeft[x] === "string") || (tmpLeft[x] instanceof String) || (typeof tmpLeft[x] === "number")) {
									var evalConditionLeft = tmpLeft[x].toString();
								}
								else {
									var evalConditionLeft = tmpLeft[x].value.toString();
								}
								var y = 0;
								while ((y < tmpRight.length) && (!tmpResult)) {
									if ((typeof tmpRight[y] === "string") || (tmpRight[y] instanceof String) || (typeof tmpRight[y] === "number")) {
										var evalConditionRight = tmpRight[y].toString();
									}
									else {var evalConditionRight = tmpRight[y].value.toString();}
									switch (compareList[index].comparison) {
									case "!=":tmpResult = (evalConditionLeft != evalConditionRight);break;
									case "<=":tmpResult = (evalConditionLeft <= evalConditionRight);break;
									case ">=":tmpResult = (evalConditionLeft >= evalConditionRight);break;
									case "<":tmpResult = (evalConditionLeft < evalConditionRight);break;
									case "=":tmpResult = (evalConditionLeft==evalConditionRight);break;
									case ">":tmpResult = (evalConditionLeft > evalConditionRight);break;
									}
									y++;
								}
								x++;
							}
						}
					}
					else {tmpResult = true;}
				}
				else {tmpResult = false;}
				tmpLeft = null;
				tmpRight = null;
			}
			switch (lastOperator) {
			case "and":totalResult = (totalResult && tmpResult);break;
			case "or":totalResult = (totalResult || tmpResult);break;
			case null:totalResult = tmpResult;break;
			}
			if (compareList[index].operator) {
				if ((compareList[index].operator == "and") && (!totalResult)) {return false;}
				if ((compareList[index].operator == "or") && (totalResult)) {return true;}
			}
			lastOperator = compareList[index].operator;
		}
		return totalResult;
	},

	realTagName: function _realTagName(a){
		var r = a;
		var ta = "_default_";
		var tn = "";
		var ap = a.indexOf(tsep);
		if (ap > -1) {
			ta = a.substr(0,ap);
			tn = a.substr(ap+1);
		}
		else {tn = a;}
		var ns = this.getNameSpace(ta);
		if (ns) {r = ns + tsep + tn;}
		return r;
	},

	XPath: function XPath(aPath){
		var tmpPath = aPath;
		var result = new Array();
		if (tmpPath[0] == "/") {tmpPath = tmpPath.substr(1);}

		switch (tmpPath[0]) {
		case "/" : // Find all elements by specified element name
			var allTag = splitOnCharacter(tmpPath.substr(1), 0, ["/", "["]);
			if (!allTag) {allTag = tmpPath.substr(1);}
			for (let index in this.tags) {result.push(this.tags[index]);}
			tmpPath = "/"+tmpPath;
			break;
		case "@" : // Find attribute within this element
			if (this.attr[tmpPath.substr(1)]) {result.push(this.attr[tmpPath.substr(1)]);}
			tmpPath = "";
			break;
		case "*" : // Wildcard. Will parse all children.
			tmpPath = tmpPath.substr(1);
			for (let index in this.tags) {
				let tmpTagName = "";
				var tmpIsArray = isArray(this.tags[index]);
				if (tmpIsArray) {tmpTagName = this.tags[index][0].tagName;}
				else {tmpTagName = this.tags[index].tagName;}

				if (tmpTagName != this.tagName) {
					if (tmpIsArray) {for (let index2 in this.tags[index]) {result.push(this.tags[index][index2]);}}
					else {result.push(this.tags[index]);}
				}
			}
			break;
		case "[" : // Compare/match function
			var index = splitOnCharacter(tmpPath.substr(1), 0, "]");
			if (!index) {throw "XPath error: Did not find closing square bracket. tagName:"+this.tagName+", tmpPath:"+tmpPath;}
			tmpPath = tmpPath.substr(index.length+2);
			index = trim(index); 
			if (index != "") {
				if (this.if(index)) {result.push(this);}
				else {return result;}
			}
			else {throw "XPath compare error:No Value between square brackets:"+this.tagName+"["+index+"]";}
			break;
		default:
			var bracketPos = tmpPath.indexOf("[");
			var forwardSlashPos = tmpPath.indexOf("/");
			var splitPos = tmpPath.length;
			if ((bracketPos < splitPos) && (bracketPos > -1)) {splitPos = bracketPos;}
			if ((forwardSlashPos < splitPos) && (forwardSlashPos > -1)) {splitPos = forwardSlashPos;}
			var tmpPath2 = tmpPath.substr(0, splitPos);
			tmpPath = tmpPath.substr(splitPos);
			if (tmpPath2 != "") {
				var equalTags = this.getTags(tmpPath2);
				for (let index in equalTags) {result.push(equalTags[index]);}
			}
		}
		if ((result.length > 0) && (tmpPath != "")) {
			var finalResult = new Array();
			for (let index in result) {
				if ((typeof result[index] === "string") || (result[index] instanceof String)) {finalResult.push(result[index]);}
				else {
					if (isArray(result[index])) {
						for (let index2 in result[index]) {
							let tmpResult = result[index][index2].XPath(tmpPath);
							if (tmpResult) {
								for (let index3 in tmpResult) {
									finalResult.push(tmpResult[index3]);
									tmpResult[index3] = null;
								}
							}
							tmpResult = null;
						}
					}
					else {
						let tmpResult = result[index].XPath(tmpPath);
						if (tmpResult) {
							for (let index2 in tmpResult) {
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
				let tmpResult = this.XPath(tmpPath);
				if (tmpResult) {
					for (let index2 in tmpResult) {
						finalResult.push(tmpResult[index2]);
						tmpResult[index2] = null;
					}
				}
				tmpResult = null;
				result = finalResult;
			}
		}
		if ((tmpPath != "") && (tmpPath.substr(0,2) == "//") && (this.tags[allTag]) && (this.tagName == this.tags[allTag].tagName)) {
			tmpPath = tmpPath.substr(1);
			if ((tmpPath != "") && (tmpPath.substr(0,2) != "//")) {
				var finalResult = new Array();
				let tmpResult = this.XPath(tmpPath);
				if (tmpResult) {
					for (let index2 in tmpResult) {
						finalResult.push(tmpResult[index2]);
						tmpResult[index2] = null;
					}
				}
				tmpResult = null;
				result = finalResult;
			}
		}
		return result;
	},

	get lastPos(){return this._lastPos;},

	set lastPos(aValue){this._lastPos = aValue;},

	processXMLString: function _processXMLString(aStr, aSP, aParent)
	{
//dump(" processXMLString 1: aSP:"+aSP+", aStr.substr:"+aStr.substr(aSP)+"\n");
		if (!aStr) return;
try{
		var pos = findCharacter(aStr, aSP, "<");
		var strLength = aStr.length;
//dump(" processXMLString 2: pos:"+pos+"\n");
		if (pos > -1) {
			this.startPos = pos;
			let skipped = pos - aSP;
//dump(" processXMLString 3: skipped:"+skipped+"\n");
			if ((skipped > 0) && (aParent)) {
//dump(" going to add to content 1: aSP:"+aSP+", skipped:"+skipped+"\n");
//dump(" going to add to content 2:"+aStr.substr(aSP, skipped)+"\n");
				aParent.addToContent(aStr.substr(aSP, skipped));
//dump(" going to add to content 3.\n");
			}
//dump(" processXMLString 4.\n");
			pos++;
			var tc = aStr[pos];
			if ( (pos < strLength) && (tc == "?")) {
				pos++;
				if (aStr.substr(pos, 4) == "xml ") {
					var tmpPos = findString(aStr, pos, "?>");
					if (tmpPos == -1) {throw Ci.mivIxml2jxon.ERR_INVALID_SPECIAL_TAG;}
					else {
						this.processXMLString(aStr, tmpPos+2, null);
						this.closed = true; 
						return;						
					}
				}
				else {throw Ci.mivIxml2jxon.ERR_MISSING_SPECIAL_TAG;}
			}
			else {
				if ( (pos < strLength) && (tc == "/")) {
					pos++;
					var tmpStartPos = pos;
					if (pos < strLength) {
						var tmpPos = findCharacter(aStr, pos, ">");
						if (tmpPos > -1) {
							var closingTag = aStr.substr(tmpStartPos, tmpPos-tmpStartPos);
							var xmlnsPos = closingTag.indexOf(tsep);
							if (xmlnsPos > -1) {
								var nameSpace = closingTag.substr(0, xmlnsPos);
								closingTag = closingTag.substr(xmlnsPos+1);
							}
							else {var nameSpace = "_default_";}

							if ((aParent) && (closingTag == aParent.tagName) && (nameSpace == aParent.nameSpace)) {
								this.lastPos = tmpPos;
								this.closed = true;
								return;
							}
							else {throw Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG;}
						}
						else {throw Ci.mivIxml2jxon.ERR_INVALID_TAG;}
					}
					else {throw Ci.mivIxml2jxon.ERR_INVALID_TAG;}
				}
				else {if (pos < strLength) {
						var tmpPos = findCharacter(aStr, pos, ">");
						if (tmpPos > -1) {
							var tmpStart = this.startPos + 1;
							let tmpTagName = "";
							tc = aStr[tmpStart];
							while ((tmpStart < strLength) && (tc != ">") && 
								(tc != "/") && (!(isInList(specialChars1,tc)))) {
								tmpTagName = tmpTagName + tc;
								tmpStart++;
								tc = aStr[tmpStart];
							}
							var xmlnsPos = tmpTagName.indexOf(tsep);
							if (xmlnsPos > -1) {
								this.nameSpace = tmpTagName.substr(0, xmlnsPos);
								tmpTagName = tmpTagName.substr(xmlnsPos+1);
							}
							else {this.nameSpace = "_default_";}
							this.tagName = tmpTagName;
							if (aParent) {aParent.addChildTagObject(this);}
							if ((tmpStart < strLength) && (tc == "/")) {
								this.messageLength = tmpStart - this.startPos + 2;
								this.lastPos = tmpStart+1;
								return;
							}
							else {if ((tmpStart < strLength) && (isInList(specialChars1,tc))) {
									var attribute = "";
									tmpStart++;
									tc = aStr[tmpStart];
									var quoteOpen = false;
									var seenAttributeSeparator = false;
									var quoteChar = "";
									while ((tmpStart < strLength) && 
										(((tc != ">") && (tc != "/")) || (quoteOpen)) ) {
										attribute = attribute + tc;
										if ((!seenAttributeSeparator) && (tc == "=") && (!quoteOpen)){seenAttributeSeparator = true;}
										else {if (seenAttributeSeparator) {
												if ((tc == '"') || (tc == "'")) {
													if ((!quoteOpen) || ((quoteOpen) && (quoteChar == tc))) {
														quoteOpen = !quoteOpen;
														if (quoteOpen) {quoteChar = tc;}
													}
												}
											}
										}
										tmpStart++;
										tc = aStr[tmpStart];
										if ((seenAttributeSeparator) && (tmpStart < strLength) && (isInList(specialChars1,tc)) && (!quoteOpen)) {
											this.explodeAttribute(attribute);
											attribute = "";
											seenAttributeSeparator = false;
											tmpStart++;
											tc = aStr[tmpStart];
										}
									}
									if ((seenAttributeSeparator) && (!quoteOpen) && (tmpStart < strLength) && (attribute.length > 0)) {
										this.explodeAttribute(attribute);
										seenAttributeSeparator = false;
										attribute = "";
									}
									if ((tmpStart < strLength) && (tc == "/")) {
										// Found opening tag with attributes which is also closed.
										this.messageLength = tmpStart - this.startPos + 2;
										this.lastPos = tmpStart+1;
										return;
									}
									else {if (!((tmpStart < strLength) && (tc == ">"))) {throw Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG;}}

								}
								else {if (!((tmpStart < strLength) && (tc == ">"))) {throw Ci.mivIxml2jxon.ERR_WRONG_CLOSING_TAG;}}
							}
							var tmpChild = null;
							while (((!tmpChild) || (!tmpChild.closed)) && (tmpPos)) {
								tmpChild = new mivIxml2jxon(aStr,tmpPos+1, this);
								this.messageLength = tmpChild.lastPos - this.startPos + 1;
								tmpPos = tmpChild.lastPos;
							}
							tmpChild = null;
							this.lastPos = tmpPos;
						}
						else {throw Ci.mivIxml2jxon.ERR_INVALID_TAG;}
					}
					else {throw Ci.mivIxml2jxon.ERR_INVALID_TAG;}
				}
			}
		}
		else {
//dump("nothing left.\n");
			if (aParent) {
				aParent.addToContent(new String(aStr));
				aParent.messageLength = aParent.messageLength+aStr.length; 
			}
			this.lastPos = aStr.length - 1;
			this.closed = true;
		}
}
catch(err){ dump(" !! err:"+err+"\n");}
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

