﻿var data = require('../data');

/// Routes
function dataCallback(res) {
    return function (err, data) {
        if (err) {
            res.send({ error: err });
        } else {
            // Il serait intéressant de fournir une réponse plus lisible en
            // cas de mise à jour ou d'insertion...
            res.send(data);
        }
    }
}

var routes = {
    // Lecture, via GET
    list: function(req, res) {
        res.header('Cache-Control', 'no-cache');
        data.conges.listConges(req.session.username, dataCallback(res));
    },

    get: function(req, res) {
        res.header('Cache-Control', 'no-cache');
        data.conges.getConges(req.params.id, dataCallback(res));
    },

    // Ajout ou Mise à jour via POST
    save: function (req, res) {
        var conges = req.body;
        conges.user = req.session.username;
        if (conges.create) {
            delete conges.create;
            data.conges.addConges(conges, dataCallback(res));
            return;
        }

        data.conges.updateConges(conges, dataCallback(res));
    },

    // Ajout via POST
    /*add: function (req, res) {
    data.users.insertUser(req.body, dataCallback(res));
    },*/

    remove: function(req, res) {
        data.conges.removeConges(req.params.id, dataCallback(res));
    }
};
exports.routes = routes;
exports.getNextId = function (fn) {
    data.users.getNextId(fn);
}