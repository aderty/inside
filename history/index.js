/// <reference path="~/lib/node-vsdoc.js" />

/**
 * Module dependencies.
 */

var data = require('../data');

var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();

 db.events.once('connected', function (result) {
      console.log("connected to MySQL");
      events.emit('connected', null);
  });

  /// Routes
  function dataCallback(res) {
      return function(err, data) {
          if (err) {
              res.send({ error: err });
          } else {
              // Il serait intéressant de fournir une réponse plus lisible en
              // cas de mise à jour ou d'insertion...
              res.send(data);
          }
      }
  }

var history = {
    log: function(user, log, fn) {
        return data.history(user, log, fn);
    }
}

var routes = {
    list: function(req, res) {
        data.history.list(req.query.user, dataCallback(res)(err, histo));
    }
}

exports.events = events;
exports.history = history;
exports.routes = history;