
function addInviteColumn()
{
	let threadcols=document.getElementById("threadCols");
	let threadcol=document.createElement("treecol");
	threadcol.setAttribute("fixed","true");
	threadcol.setAttribute("cycler","true");
	threadcol.setAttribute("persist","hidden ordinal");  
	threadcol.setAttribute("id","inviteCol");
	threadcol.setAttribute("currentView","unthreaded");
	threadcol.setAttribute("class","treecol-image inviteColumnHeader");
	threadcol.setAttribute("label","Calendar Invite");
	threadcol.setAttribute("tooltiptext","Calendar Invite");	
	threadcol.setAttribute("width","25");
	threadcol.setAttribute("fixed","true");   
	threadcols.appendChild(threadcol); 
  }
  
function updateInviteCell()
{ 
    var extrasObserver = {
			observe: function(aMsgFolder, aTopic, aData) {  
 		    if (gDBView) {
	    			var columnHandler = {
	    					
	    			    getCellText: function(row, col) {}, 
	    			    getSortStringForRow: function(hdr) {}, 
	    			    isString: function() {}, 
	    			    _atoms: {}, 
	    			    _getAtom: function(aName) {}, 
	    			    setProperty: function(prop, value) {}, 
	    			    getExtensionProperties: function(row, props, which) {}, 
	    			    getCellProperties: function(row, col, props) {}, 
	    			    getRowProperties: function(row, props) { }, 
	    			    getImageSrc: function(row, col) { 
		    				var hdr = gDBView.getMsgHdrAt(row); 
 	    				    var Subject  =  hdr.subject; 
	    				    var res = Subject.match(/Accepted:/);  
							 if(!res){
								 res = Subject.match(/Declined:/);  
							 }
							 else
							 {   return "chrome://exchangeCalendar/skin/accepted.png"; 
							 }
							  
							 if(!res){
								 res = Subject.match(/Tentative:/);  
							 }
							 else
							 { 	return "chrome://exchangeCalendar/skin/declined.png"; 
							 } 
							 if(!res){
								 return;
								// return "chrome://exchangeCalendar/skin/invited.png"; 
							 }
							 else
							 {   return "chrome://exchangeCalendar/skin/tentative.png"; 
							 }   
	    			    }, 
	    			    getSortLongForRow: function(hdr) {}
	    			}; 
	
	    			try {
	    			    columnHandler.old = gDBView.getColumnHandler("inviteCol");
	    			}
	    			catch (ex) {}
	    			
	    			gDBView.addColumnHandler("inviteCol", columnHandler); 
	    			
    		    }//ifend
    		}
	    };
var ObserverService = Cc["@mozilla.org/observer-service;1"]
    .getService(Ci.nsIObserverService);
	ObserverService.addObserver( extrasObserver, "MsgCreateDBView", false);
  
}

window.addEventListener("load",addInviteColumn(),false);
window.addEventListener("load",updateInviteCell(),false);