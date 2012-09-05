# Exchnage 2007/2010 Calendar and task provider#

* Sync Calendar en Task/Todo items from an EWS (Exchange) server.  Syncing is done on a user settable poll interval. It will track changes on the server and update the local memory cache.
* Create, modify and delete calendar events and task/todo items. They will get synced immediately with the EWS server.
* During creation of a new calendar you can use the Exchange Autodiscover functionality (when enabled on the Exchange server) to find the right server and mailbox settings. Selecting the right folder is easy with the build-in folder browser.
* You can access any Calendar or Task folder on your EWS server as long as you have the right primarySMTP or alias email address and enough permissions for the used user.
* Let it poll your inbox for meeting invitation request or cancellations. They will show up in your calendar.
* Manage how meeting invitations or cancellations are automatically handled (responded to).
* Add as many calendar objects as you wish and Lightning will allow.
* Manage “Out of Office”settings for each calendar mailbox (since TB 12 broken).
* Import ICS files.
* Export to ICS files. (Experimental: new since 1.8.0a4 not a full calendar yet only local memory cache)
* Manage and view attachments.
* User availability (Free/Busy) information.
* Currently in Dutch (Nederlands), English, French (Français) (Thanks to Dominique Fillon) , Swedish, and German (Deutsch) (Thanks to Christian A. Meyer) localizations. When you would like to make a translation for your language please let me know .




## Steps to make XPI from the code and installing on thunderbird ##

* Download the code in a folder
* Compress all the files (not the folder) in .ZIP format
* rename the file from .ZIP file to .xpi
* install it on thunderbird from Tools->Add-ons-> (from drop down button) ->Install Add-on from file... 


For help please see the [project home page](http://www.1st-setup.nl/wordpress/).
