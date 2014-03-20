var data = require('../data')
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
        activite.mois = new Date(activite.mois);
        if (activite.create) {
            delete activite.create;
            data.activite.addActiviteUser(req.session.username, activite, false, dataCallback(res));
            history.log(req, req.session.username, "Création d'un CRA de "+ activite.mois);
            return;
        }
        data.activite.updateActiviteJoursUser(req.session.username, activite, false, dataCallback(res));
        history.log(req, req.session.username, "Modification du CRA de " + activite.mois);
    }
};

var routesAdmin = {
    // Lecture, via GET
    list: function(req, res) {
        res.header('Cache-Control', 'no-cache');
        var superAdmin = false;
        if (req.session.role == 4) {
            superAdmin = true;
        }
        var options = {};
        options.admin = superAdmin ? -1 : req.session.username;
        if (req.query.annee) {
            options.annee = req.query.annee;
        }
        if (req.query.mois && req.query.mois > 0) {
            options.mois = req.query.mois;
        }
        if (req.query.sans) {
            data.activite.listUserSansActivites(options, dataCallback(res));
            return;
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
            history.log(req, activite.user, "[Admin " + req.session.username + "] Modification de l'état du CRA de " + activite.mois + " : Etat " + req.query.etat);
            return;
        }
        // Création / modification d'activité
        activite.etat = 1;
        activite.mois = new Date(activite.mois);
        if (activite.create) {
            delete activite.create;
            data.activite.addActiviteUser(activite.user, activite, false, dataCallback(res));
            history.log(req, activite.user, "[Admin " + req.session.username + "] Création du CRA de " + activite.mois);
            return;
        }
        data.activite.updateActiviteJoursUser(activite.user, activite, false, dataCallback(res));
        history.log(req, activite.user, "[Admin " + req.session.username + "] Modification du CRA de " + activite.mois);
    },
    remove: function(req, res) {
        var activite = req.query;
        activite.mois = new Date(activite.mois);
        data.activite.removeActivite(activite, dataCallback(res));
        history.log(req, activite.user, "[Admin " + req.session.username + "] Suppression du CRA de " + activite.mois);
    }
};

exports.routes = routes;
exports.routesAdmin = routesAdmin;