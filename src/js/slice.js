/* jshint esversion: 6 */

import app from './app';
/**
 * this array contains a list of modules
 * that are automatically instantiated.
 */
const modules = [
];

const instance = app(modules);
instance.bootstrap();