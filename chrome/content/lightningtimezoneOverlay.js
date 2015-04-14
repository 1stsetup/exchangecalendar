var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
 

function lightningTimzone(aDocument, aWindow)
{
	this._document = aDocument;
	this._window = aWindow;

	this.globalFunctions = Cc["@1st-setup.nl/global/functions;1"]
				.getService(Ci.mivFunctions);
	
	this.prefs = Cc["@mozilla.org/preferences-service;1"]
                    .getService(Ci.nsIPrefService); 
}

lightningTimzone.prototype = {
		onload: function _onload(){   
		    this.resetTimezone = this.globalFunctions.safeGetBoolPref(this.prefs, "calendar.timezone.local.auto");
 			var timezone = this.globalFunctions.safeGetCharPref(this.prefs, "calendar.timezone.local") ;
			if( timezone ){
				if( this.resetTimezone === "true" ){ 
 					this.prefs.setCharPref("calendar.timezone.local","");
 					this.globalFunctions.LOG("lightningTimzone : Timzone Changed");
				} 
			}
			else{
				this.prefs.setCharPref("calendar.timezone.local","");
				this.globalFunctions.LOG("lightningTimzone : Timzone Changed"); 
			} 
			
 			this.onTimezoneChange(); 
		},
		
		onTimezoneChange:function _onTimezoneChange(self){
			
 			var oldOffset; 
 			var currentOffset;
 			var self = this;
 			
 			function change2()
 			{
 				var resetTimezone = self.globalFunctions.safeGetBoolPref(self.prefs, "calendar.timezone.local.auto");
 				if( resetTimezone == true ){ 
						var nowdate = new Date(); 
						currentOffset = nowdate.getTimezoneOffset();
 						
						if( oldOffset != currentOffset && oldOffset != undefined && currentOffset  != undefined ){
							self.prefs.setCharPref("calendar.timezone.local","");
							self.globalFunctions.LOG("lightningTimzone : Timzone Changed");
							self.infoPopup("Timezone Information","System timezone changed and set to lightning automatically!");
						} 
						oldOffset = currentOffset;
					} 	
 			}
 			
 			function change(){ 
				change2();
 			}
 			setInterval(change,3000);				
 		},
		
		infoPopup:function _infoPopup(title, msg) {
			 var image = "chrome://exchangecalendar/skin/notify-icon.png";
			  var win = Components.classes['@mozilla.org/embedcomp/window-watcher;1'].
			                      getService(Components.interfaces.nsIWindowWatcher).
			                      openWindow(null, 'chrome://global/content/alerts/alert.xul',
			                                  '_blank', 'chrome,titlebar=no,popup=yes', null);
			  win.arguments = [image,  title, msg, true, ''];
		},
		
}

var tmpLightningTimezone = new lightningTimzone(document, window);
window.addEventListener("load",function(){tmpLightningTimezone.onload();},false);