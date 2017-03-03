/*jshint esversion: 6 */
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



self.addEventListener('install', event => {
  console.log('V1 installing…');

  // cache a cat SVG
  event.waitUntil(
    caches.open('static-v1').then(cache => cache.add('/cat.svg'))
  );
});

self.addEventListener('activate', event => {
  console.log('V1 now ready to handle fetches!');
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // serve the cat SVG from the cache if the request is
  // same-origin and the path is '/dog.svg'
  if (url.origin == location.origin && url.pathname == '/dog.svg') {
    event.respondWith(caches.match('/cat.svg'));
  }
});






