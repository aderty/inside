var data = require('../data'),
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
        if (req.query.past == 'true') {
            options.past = true;
        }
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
            data.conges.addConges(conges, function(err, ret){
                dataCallback(res)(err, ret);
                if(!err){
                    history.log(req, req.session.username, "Création d'un congé " + JSON.stringify(conges));
                }
            });
            return;
        }
        data.conges.updateConges(conges, false, function (err, ret) {
            dataCallback(res)(err, ret);
            if (!err) {
                history.log(req, req.session.username, "Modification du congé " + JSON.stringify(conges));
            }
        });
    },

    // Ajout via POST
    /*add: function (req, res) {
    data.users.insertUser(req.body, dataCallback(res));
    },*/

    remove: function(req, res) {
        data.conges.removeConges(req.params.id, function (err, ret) {
            dataCallback(res)(err, ret);
            if (!err) {
                history.log(req, req.session.username, "Suppression du congé " + req.params.id + " : " + JSON.stringify(req.query));
            }
        });
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
        var options = {
            past: false
        };
        if (req.query.past == 'true') {
            options.past = true;
        }
        if (req.query.etat) {
            data.conges.listCongesEtat(req.query.etat, superAdmin ? -1 : req.session.username, options.past, dataCallback(res));
        }
        else {
            if (req.query.user) {
                options.annee = req.query.annee;
                data.conges.listHistoConges(superAdmin ? -1 : req.session.username, req.query.user, options, dataCallback(res));
                return;
            }
            data.conges.listToutConges(superAdmin ? -1 : req.session.username, options.past, dataCallback(res));
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
            // Création d'un congé
            delete conges.create;
            if (conges.user == '999999') {
                // Congé pour tous
                data.conges.addToAllConges(conges, function (err, ret) {
                    dataCallback(res)(err, ret);
                    if (!err) {
                        history.log(req, conges.user, "[Admin " + req.session.username + "] Création d'un congé " + JSON.stringify(conges));
                    }
                });
                return;
            }
            // Congé pour un utilisateur
            data.conges.addConges(conges, function (err, ret) {
                dataCallback(res)(err, ret);
                if (!err) {
                    history.log(req, conges.user, "[Admin " + req.session.username + "] Création d'un congé " + JSON.stringify(conges));
                }
            });
            return;
        }
        if (req.query.etat) {
            // Modification de l'état d'un congé (Validation ou refus)
            data.conges.updateEtatConges(conges, function (err, ret) {
                if (!err) {
                    if (conges.etat == 2 || conges.etat == 3) {
                        data.users.getUser(conges.user, function (err, user) {
                            if (err) return;
                            mail.Mail.validationConges(user, conges, req.session.prenom);
                        });
                    }
                    history.log(req, conges.user, "[Admin " + req.session.username + "] Modification de l'état d'un congé " + JSON.stringify(conges));
                }
                dataCallback(res)(err, ret);
            });
            return;
        }
        // Mise à jour d'un congé particulier
        data.conges.updateConges(conges, true, function (err, ret) {
            dataCallback(res)(err, ret);
            if (!err) {
                history.log(req, conges.user, "[Admin " + req.session.username + "] Modification du congé " + JSON.stringify(conges));
            }
        }); 
    },
    remove: function (req, res) {
        var conges = req.query;
        data.conges.removeConges(req.params.id, function (err, ret) {
            dataCallback(res)(err, ret);
            if (!err) {
                history.log(req, conges.user, "[Admin " + req.session.username + "] Suppression du congé " + req.params.id + " : " + JSON.stringify(conges));
            }
        }); 
    }
};

exports.routes = routes;
exports.routesAdmin = routesAdmin;
exports.getNextId = function (fn) {
    data.users.getNextId(fn);
}