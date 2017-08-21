/* jshint esversion: 6 */

import assign           from 'lodash.assign';
import vue              from 'vue';
import configGapi       from './config/gapi';

/**
 * @module
 * the app is responsible for global events and
 * responsibilities.
 */

const app = function(modules) {
  
  const config    = {};
  config.gapi     = configGapi();
  
  /**
   * bootstraps the app by creating the modules
   * and start listening to global events.
   */
  const bootstrap = function() {
    modules.forEach((module) => {
      var moduleSelectors = document.querySelectorAll(module.selector);
      for (var i=0; i<moduleSelectors.length; i++) {
        module(moduleSelectors[i], this);
      }
    });
  };

  return assign(
    {
      bootstrap
    }
  );
};

export default app;
