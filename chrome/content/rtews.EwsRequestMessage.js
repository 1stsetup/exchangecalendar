if ( typeof (rtews) == "undefined")
    var rtews = {};

/*
 * @Constructor
 * EWS SOAP request message
 *
 */
rtews.EwsRequestMessage = function() {
    var sr = "";
    sr += '<?xml version="1.0" encoding="utf-8"?>';
    sr += '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">';
    sr += '<soap:Body>';
    sr += 'MESSAGEBODY';
    sr += '</soap:Body>';
    sr += '</soap:Envelope>';

    this.src = sr;
};

rtews.EwsRequestMessage.prototype = {
    UpdateItem : function(parameters) {
        var sr = "";
        sr += '<UpdateItem MessageDisposition="SaveOnly" ConflictResolution="AlwaysOverwrite" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<ItemChanges>';
        sr += '<t:ItemChange>';
        sr += '<t:ItemId Id="' + parameters.itemid + '" ChangeKey="' + parameters.changekey + '" />';
        sr += '<t:Updates>';
        sr += '<t:SetItemField>';
        sr += '<t:FieldURI FieldURI="item:Categories"/>';
        sr += '<t:Message>';
        sr += '<t:Categories>';
        for (var category in parameters.categories) {
            sr += '<t:String>' + parameters.categories[category] + '</t:String>';
        }
        sr += '</t:Categories>';
        sr += '</t:Message>';
        sr += '</t:SetItemField>';
        sr += '</t:Updates>';
        sr += '</t:ItemChange>';
        sr += '</ItemChanges>';
        sr += '</UpdateItem>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    FindItem : function(parameters) {
        var sr = "";
        sr += '<FindItem Traversal="Shallow" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += ' <ItemShape>';
        sr += '<t:BaseShape>IdOnly</t:BaseShape>';
        sr += '</ItemShape>';
        sr += '<IndexedPageItemView MaxEntriesReturned="10" Offset="0" BasePoint="Beginning" />';
        sr += '<Restriction>';
        sr += '<t:IsEqualTo>';
        sr += '<t:ExtendedFieldURI PropertyTag="0x1035" PropertyType="String"/>';
        sr += '<t:FieldURIOrConstant>';
        sr += '<t:Constant Value="' + parameters.messageid + '" />';
        sr += '</t:FieldURIOrConstant>';
        sr += '</t:IsEqualTo>';
        sr += '</Restriction>';
        sr += '<ParentFolderIds>';
        for (var x = 0, len = parameters.folders.length; x < len; x++) {
            sr += '<t:FolderId Id="' + parameters.folders[x].id + '" />';
        }
        sr += '</ParentFolderIds>';
        sr += '</FindItem>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    GetItem : function(parameters) {
        var sr = "";
        sr += '<GetItem xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<ItemShape>';
        sr += '<t:BaseShape>IdOnly</t:BaseShape>';
        sr += '<t:AdditionalProperties>';
        sr += '<t:FieldURI FieldURI="item:Categories"/>';
        sr += '<t:FieldURI FieldURI="item:ParentFolderId"/>';
        sr += '<t:ExtendedFieldURI PropertyTag="0x1035" PropertyType="String"/>';
        sr += '</t:AdditionalProperties>';
        sr += '</ItemShape>';
        sr += '<ItemIds>';
        for (var x = 0, len = parameters.items.length; x < len; x++) {
            sr += '<t:ItemId Id="' + parameters.items[x].id + '" ChangeKey="' + parameters.items[x].changeKey + '" />';
        }
        sr += '</ItemIds>';
        sr += '</GetItem>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    Subscribe : function(parameters) {
        var sr = "";
        sr += '<Subscribe xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<PullSubscriptionRequest>';
        sr += '<t:FolderIds>';
        for (var x = 0, len = parameters.folders.length; x < len; x++) {
            sr += '<t:FolderId Id="' + parameters.folders[x].id + '" />';
        }
        sr += '</t:FolderIds>';
        sr += '<t:EventTypes>';
        sr += '<t:EventType>NewMailEvent</t:EventType>';
        sr += '<t:EventType>ModifiedEvent</t:EventType>';
        sr += '<t:EventType>MovedEvent</t:EventType>';
        sr += '<t:EventType>CopiedEvent</t:EventType>';
        sr += '<t:EventType>CreatedEvent</t:EventType>';
        sr += '</t:EventTypes>';
        sr += '<t:Timeout>1440</t:Timeout>';
        sr += '</PullSubscriptionRequest>';
        sr += '</Subscribe>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    Unsubscribe : function(parameters) {
        var sr = "";
        sr += '<Unsubscribe xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<SubscriptionId>' + parameters.subscriptionId + '</SubscriptionId>';
        sr += '</Unsubscribe>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    GetEvents : function(parameters) {
        var sr = "";
        sr += '<GetEvents xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<SubscriptionId>' + parameters.subscriptionId + '</SubscriptionId>';
        sr += '<Watermark>' + parameters.watermark + '</Watermark>';
        sr += '</GetEvents>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    FindFolder : function(parameters) {
        var sr = "";
        sr += '<FindFolder Traversal="Deep" xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">';
        sr += '<FolderShape>';
        sr += '<t:BaseShape>AllProperties</t:BaseShape>';
        sr += '</FolderShape>';
        sr += '<ParentFolderIds>';
        sr += '<t:DistinguishedFolderId Id="msgfolderroot">';
        sr += '<t:Mailbox>';
        sr += '<t:EmailAddress>' + parameters.email + '</t:EmailAddress>';
        sr += '</t:Mailbox>';
        sr += '</t:DistinguishedFolderId>';
        sr += '</ParentFolderIds>';
        sr += '</FindFolder>';

        return this.src.replace("MESSAGEBODY", sr);
    },
    AutoDiscover : function(parameters) {
        var sr = "";
        sr += '<?xml version="1.0" encoding="utf-8"?>';
        sr += '<Autodiscover xmlns="' + parameters.ns + '">';
        sr += '<Request>';
        sr += '<EMailAddress>' + encodeURI(parameters.email) + '</EMailAddress>';
        sr += '<AcceptableResponseSchema>' + parameters.schema + '</AcceptableResponseSchema>';
        sr += '</Request>';
        sr += '</Autodiscover>';

        return sr;
    }
};