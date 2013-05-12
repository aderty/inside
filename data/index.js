/// <reference path="~/lib/node-vsdoc.js" />

/**
 * Module dependencies.
 */

var path = require('path')
  , fs = require('fs')
  , url = require('url')
  , zlib = require('zlib')
  , users = require('./users')
  , conges = require('./conges')
  , activite = require('./activite');
  //, db = require('./db');

/*var DAL = {
    db: function () {
        return db;
    }
}
exports.DAL = DAL;*/

exports.users = users.data;
exports.conges = conges.data;
exports.activite = activite.data;