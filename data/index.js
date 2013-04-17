/// <reference path="~/lib/node-vsdoc.js" />

/**
 * Module dependencies.
 */

var path = require('path')
  , fs = require('fs')
  , url = require('url')
  , zlib = require('zlib')
  , db = require('./db');

var DAL = {
    db: function () {
        return db;
    }
}
exports.DAL = DAL;