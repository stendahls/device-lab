/* jshint esversion: 6 */

(global => {
  'use strict';

  // Load the sw-toolbox library.
  importScripts('js/sw-toolbox.js');
  
  global.toolbox.options.debug = true;
  
  // Ensure that our service worker takes control of the page as soon as possible.
  global.addEventListener('install', event => event.waitUntil(global.skipWaiting()));
  global.addEventListener('activate', event => event.waitUntil(global.clients.claim()));
  
  toolbox.router.get('(.*)', toolbox.fastest, {
    cache: {
      name: 'deviceRadar10',
      maxEntries: 10
    }
  });
  toolbox.precache([
    'index.html', 
    'radar.html', 
    'css/radar.min.css', 
    'js/radar.js', 
    'slice.html', 
    'css/lab.min.css', 
    'js/lab.js'
  ]);

})(self);