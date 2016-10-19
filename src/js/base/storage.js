// test to see if local/session storage is enabled in the current client
var testForLocalStorage = function() {
    try {
        sessionStorage.setItem('null', 'null');
        sessionStorage.removeItem('null');
        return true;
    } catch (e) {
        return false;
    }
};
var stringifyResult = function(value) {
    // flatten objects
    if (typeof value === 'object') {
        // if the object is a document, take the document part
        if (typeof value.documentElement !== 'undefined') {
            value = value.documentElement;
        }
        value = new XMLSerializer().serializeToString(value);
    }
    return value;
};
var storageSet = function(key,value) {
    localStorage.setItem(key + 'DateStamp', Date.now());
    return localStorage.setItem(key, value);
};
var storageGet = function(key,dateStamp) {
    return localStorage.getItem(key + ( dateStamp ? 'DateStamp' : ''));
};
var storageRemove = function(key) {
    localStorage.removeItem(key + 'DateStamp');
    return localStorage.removeItem(key);
};