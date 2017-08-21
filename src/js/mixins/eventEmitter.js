/* jshint esversion: 6 */

/**
 * @module
 * a simple factory for creating an event emitter similar
 * to nodes eventEmitter.
 */
const eventEmitter = function() {
  const listeners = {};

  /**
   * adds an event listener to the event with the provided name
   * @param {String} name the name of the event
   * @param {Function} fn the function to run when event is triggered
   * @return {Object} returns the event emitter.
   */
  const on = function(name, fn) {
    if (typeof fn !== 'function') {
      throw new Error('you must supply a callback');
    }
    if (listeners.hasOwnProperty(name)) {
      listeners[name].push(fn);
      return;
    }
    listeners[name] = [fn];
    return this;
  };

  /**
   * removs an or all event listeners
   * @param {String} name the name of the event
   * @param {Function} fn the callback
   * @return {Object} returns the event emitter.
   */
  const off = function(name, fn) {
    if (!listeners.hasOwnProperty(name)) { return; }
    if (!fn) { delete listeners[name]; }
    var index = listeners[name].indexOf(fn);
    if (index === -1) { return this; }
    listeners[name].splice(index, 1);
    return this;
  };

  /**
   * triggers all the listeners listening to the event name
   * and supply the data.
   * @param {String} name the name of the event
   * @param {Object} data the data to supply to the callbacks
   * @return {Object} the eventemitter.
   */
  const trigger = function(name, ...eventData) {
    if (listeners.hasOwnProperty(name)) {
      for(let i = 0; i < listeners[name].length; i++) {
        listeners[name][i].apply(this, eventData);
      }
    }
    return this;
  };

  /**
   * checks whether any listeners have been registered
   * on the event with the provided name.
   * @param {String} name the name of the event
   * @return {Boolean} whether any listeners are registered
   */
  const hasListeners = function(name) {
    return listeners.hasOwnProperty(name);
  };

  return { on, off, trigger, hasListeners };
};

export default eventEmitter;
