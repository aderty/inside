var data = require('../data');

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
    get: function (req, res) {
        res.header('Cache-Control', 'no-cache');
        var options = {};
        if (req.query.start) {
            options.start = new Date(req.query.start);
        }
        if (req.query.end) {
            options.end = new Date(req.query.end);
        }
        data.activite.getActiviteUser(req.session.username, options, dataCallback(res));
    },

    // Ajout ou Mise à jour via POST
    save: function (req, res) {
        var activite = req.body;
        activite.etat = 1;
        if (activite.create) {
            delete activite.create;
            data.activite.addActiviteUser(req.session.username, activite, false, dataCallback(res));
            return;
        }
        data.activite.updateActiviteJoursUser(req.session.username, activite, false, dataCallback(res));
    },

    // Ajout via POST
    /*add: function (req, res) {
    data.users.insertUser(req.body, dataCallback(res));
    },*/

    remove: function (req, res) {
        data.activite.removeConges(req.params.id, dataCallback(res));
    },

    motifs: function (req, res) {
        data.activite.listMotifs(dataCallback(res));
    }
};

var routesAdmin = {
    // Lecture, via GET
    list: function(req, res) {
        res.header('Cache-Control', 'no-cache');
        var options = {};
        if (req.query.annee) {
            options.annee = req.query.annee;
        }
        if (req.query.mois && req.query.mois > 0) {
            options.mois = req.query.mois;
        }
        data.activite.listActivites(options, dataCallback(res));
    },
    get: function(req, res) {
        res.header('Cache-Control', 'no-cache');
        var options = {};
        if (req.query.start) {
            options.start = new Date(req.query.start);
        }
        if (req.query.end) {
            options.end = new Date(req.query.end);
        }
        data.activite.getActiviteUser(req.params.id, options, dataCallback(res));
    },
    // Ajout ou Mise à jour via POST
    save: function(req, res) {
        var activite = req.body;
        if (req.query.etat) {
            data.activite.updateEtatActivite(activite, dataCallback(res));
            return;
        }
        data.activite.updateConges(conges, true, dataCallback(res));
    },
    remove: function(req, res) {
        var activite = req.query;
        activite.mois = new Date(activite.mois);
        data.activite.removeActivite(activite, dataCallback(res));
    }
};

exports.routes = routes;
exports.routesAdmin = routesAdmin;