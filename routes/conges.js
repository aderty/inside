var data = require('../data'),
    mail = require('../mail');

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
            return;
        }
        data.conges.updateConges(conges, false, dataCallback(res));
    },

    // Ajout via POST
    /*add: function (req, res) {
    data.users.insertUser(req.body, dataCallback(res));
    },*/

    remove: function(req, res) {
        data.conges.removeConges(req.params.id, dataCallback(res));
    },

    motifs: function (req, res) {
        data.conges.listMotifs(dataCallback(res));
    }
};

var routesAdmin = {
    // Lecture, via GET
    list: function (req, res) {
        res.header('Cache-Control', 'no-cache');
        if (req.query.etat) {
            data.conges.listCongesEtat(req.query.etat, false, dataCallback(res));
        }
        else {
            data.conges.listToutConges(false, dataCallback(res));
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
            return;
        }
        if (req.query.etat) {
            data.conges.updateEtatConges(conges, function(err, ret){
                if (conges.etat == 2) {
                    data.users.getUser(conges.user.id, function(err, user){
                        if(err) return;
                        mail.Mail.validationConges(user, conges);
                    });
                }
                dataCallback(res)(err, ret);
            });
            return;
        }
        data.conges.updateConges(conges, true, dataCallback(res));
    },
    remove: function (req, res) {
        data.conges.removeConges(req.params.id, dataCallback(res));
    }
};

exports.routes = routes;
exports.routesAdmin = routesAdmin;
exports.getNextId = function (fn) {
    data.users.getNextId(fn);
}