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
  , activite = require('./activite')
  , history = require('./history')
  , db = require('./db');

  var EventEmitter = require('events').EventEmitter;
  var events = new EventEmitter();

 db.events.once('connected', function (result) {
      console.log("connected to MySQL");
      events.emit('connected', null);
  });

exports.events = events;
exports.users = users.data;
exports.conges = conges.data;
exports.activite = activite.data;
exports.history = history.data;