﻿var data = require('../data'),
    mail = require('../mail')
, history = require('../history').history;

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
        var options = {
            past: false
        };
        if (req.query.start) {
            options.start = new Date(req.query.start);
        }
        if (req.query.end) {
            options.end = new Date(req.query.end);
        }
        data.conges.listConges(req.session.username, options, dataCallback(res));
    },

    get: function(req, res) {
        res.header('Cache-Control', 'no-cache');
        data.conges.getConges(req.params.id, dataCallback(res));
    },

    // Ajout ou Mise à jour via POST
    save: function(req, res) {
        var conges = req.body;
        conges.user = req.session.username;
        conges.type = 'N';
        if (conges.create) {
            delete conges.create;
            data.conges.addConges(conges, dataCallback(res));
            history.log(req.session.username, "Création d'un congé " + JSON.stringify(conges));
            return;
        }
        data.conges.updateConges(conges, false, dataCallback(res));
        history.log(req.session.username, "Modification du congé " + JSON.stringify(conges));
    },

    // Ajout via POST
    /*add: function (req, res) {
    data.users.insertUser(req.body, dataCallback(res));
    },*/

    remove: function(req, res) {
        data.conges.removeConges(req.params.id, dataCallback(res));
        history.log(req.session.username, "Suppression du congé " + JSON.stringify(conges));
    },

    motifs: function (req, res) {
        data.conges.listMotifs(dataCallback(res));
    }
};

var routesAdmin = {
    // Lecture, via GET
    list: function (req, res) {
        res.header('Cache-Control', 'no-cache');
        var superAdmin = false;
        if (req.session.role == 4) {
            superAdmin = true;
        }
        if (req.query.etat) {
            data.conges.listCongesEtat(req.query.etat, superAdmin ? -1 : req.session.username, false, dataCallback(res));
        }
        else {
            data.conges.listToutConges(superAdmin ? -1 : req.session.username, false, dataCallback(res));
        }
    },
    get: function (req, res) {
        res.header('Cache-Control', 'no-cache');
        data.conges.getConges(req.params.id, dataCallback(res));
    },
    // Ajout ou Mise à jour via POST
    save: function (req, res) {
        var conges = req.body;
        conges.type = 'R';
        if (conges.create) {
            delete conges.create;
            data.conges.addConges(conges, dataCallback(res));
            history.log(conges.user, "[Admin " + req.session.username + "] Création d'un congé " + JSON.stringify(conges));
            return;
        }
        if (req.query.etat) {
            data.conges.updateEtatConges(conges, function(err, ret){
                if (conges.etat == 2 || conges.etat == 3) {
                    data.users.getUser(conges.user.id, function(err, user){
                        if(err) return;
                        mail.Mail.validationConges(user, conges, req.session.prenom);
                    });
                }
                dataCallback(res)(err, ret);
                history.log(conges.user, "[Admin " + req.session.username + "] Modification de l'état d'un congé " + JSON.stringify(conges));
            });
            return;
        }
        data.conges.updateConges(conges, true, dataCallback(res));
        history.log(conges.user, "[Admin " + req.session.username + "] Modification du congé " + JSON.stringify(conges));
    },
    remove: function (req, res) {
        data.conges.removeConges(req.params.id, dataCallback(res));
        history.log(conges.user, "[Admin " + req.session.username + "] Suppression du congé " + JSON.stringify(conges));
    }
};

exports.routes = routes;
exports.routesAdmin = routesAdmin;
exports.getNextId = function (fn) {
    data.users.getNextId(fn);
}