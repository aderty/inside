var db = require('./db')
    , moment = require('moment')

function checkActivite(activite) {
    if (activite) {
        return true;
    }
    return false;
}

function cleanActivite(activite) {
    return activite;
}

db.events.once('connected', function (result) {
    console.log("connected to MySQL");
});

var errors = {
    CONGES_PRESENT: "Vous avez dejà posé un congés chevauchant votre demande.",
    ZERO_JOUR_TRAVAIL: "Pas de jour travaillé durant la période demandé.",
    PAS_ASSEZ: "Vous n'avez pas assez de congés.",
    EN_VALIDATION: "La demande est déjà en cours de validation.",
    DEJA_REFUSE: "La demande de congés a été refusée, impossible de modifier son état."
}

var data = {
    getActiviteUser: function(id, options, fn) {
        db.query("CALL GetActivite(?, ?, ?, @etat, @mois)", [id, options.start, options.end], function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération de l'activité de " + id);
            }
            //console.log(ret[0]);
            db.query("SELECT @etat, CAST(@mois as DATE) as mois", function(err2, ret2) {
                if (err2 || ret2.length == 0) {
                    console.log('ERROR: ' + err2);
                    return fn("Erreur lors de la récupération de l'activité de " + id);
                }
                //console.log(ret2);
                fn(null, {
                    etat: ret2[0]['@etat'],
                    mois: ret2[0]['mois'],
                    activite: ret[0]
                });
            });
        });
    },
    // Mise à jour via POST
    addActiviteUser: function(id, activite, forcer, fn) {
        if (!id) {
            return fn("Utilisateur inconnu");
        }
        if (!checkActivite(activite)) {
            return fn("Activité invalide");
        }
        var activ = {
            user: id,
            mois: new Date(activite.mois),
            etat: activite.etat
        }
        db.insert("activite", activ, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de l'insertion de l'activité.");
            }
            data.updateActiviteJoursUser(id, activite, forcer, fn);
        });
    },
    updateActiviteJoursUser: function(id, activite, forcer, fn) {
        if (!id) {
            return fn("Utilisateur inconnu");
        }
        if (!checkActivite(activite)) {
            return fn("Activité invalide");
        }
        
        var request = "DELETE FROM activite_jour WHERE user = ? AND YEAR(jour) = YEAR(?) AND MONTH(jour) = MONTH(?);";
        var values = [id, activite.mois, activite.mois];
        request += "INSERT INTO activite_jour (user, jour, type, information, heuresSup, heuresAstreinte, heuresNuit) VALUES ";
        for (var i = 0, l = activite.activite.length; i < l; i++) {
            request += " (?,?,?,?,?,?, ?)";
            values.push(id);
            values.push(new Date(activite.activite[i].jour));
            values.push(activite.activite[i].type);
            values.push(activite.activite[i].information || "");
            values.push(activite.activite[i].heuresSup || 0);
            values.push(activite.activite[i].heuresAstreinte || 0);
            values.push(activite.activite[i].heuresNuit || 0);
            if (i < l - 1) {
                request += ",";
            }
        }
        db.query(request, values, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de l'insertion de l'activité.");
            }
            return fn(null, { success: true });
        });

        /*for (var i = 0, l = activite.activite.length; i < l; i++) {
        temp = "CALL SetActiviteJour(?,?,?,?);";//"UPDATE activite_jour SET type = ?, information = ? WHERE user = ? AND jour = ? ;";
        request += temp;
        values.push(id);
        values.push(new Date(activite.activite[i].jour));
        values.push(activite.activite[i].type);
        values.push(activite.activite[i].information || "");
        }
        db.query(request, values, function (err, ret) {
        if (err) {
        console.log('ERROR: ' + err);
        return fn("Erreur lors de l'insertion de l'activité.");
        }
        return fn(null, { success: true });
        });*/
    },
    // Mise à jour via POST
    updateEtatActivite: function(activite, fn) {
        if (!checkActivite(activite)) {
            return fn("Activité invalide");
        }
        if (!activite.etat) {
            return fn("Etat de l'activité inconnu");
        }
        db.query('UPDATE activite SET etat = ? WHERE user = ? AND YEAR(mois) = YEAR(?) AND MONTH(mois) = MONTH(?)', [activite.etat, activite.user, activite.mois, activite.mois], function(error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return fn("Erreur lors de la tentative de modification de l'état de l'activité de l'utilisateur " + activite.user + " pour le mois de " + activite.mois + ".");
            }
            return fn(null, { success: true });
        });
    },

    removeActivite: function(activite, fn) {
        if (!checkActivite(activite)) {
            return fn("Activité invalide");
        }
        var request = "DELETE FROM activite WHERE user = ? AND YEAR(mois) = YEAR(?) AND MONTH(mois) = MONTH(?);";
        request += "DELETE FROM activite_jour WHERE user = ? AND YEAR(jour) = YEAR(?) AND MONTH(jour) = MONTH(?);"
        db.query(request, [activite.user, activite.mois, activite.mois, activite.user, activite.mois, activite.mois], function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la suppression de l'activité de l'utilisateur " + activite.user + " pour le mois de " + activite.mois + ".");
            }
            return fn(null, { success: true });
        });
    },
    listActivites: function(options, fn) {
        var getActiviteSelectRequest = function(activite) {
            return ", (IFNULL(t" + activite + ".nb,0) + IFNULL(t" + activite + "bis.nb,0) * 0.5) AS \"" + activite + "\"";
        };
        var getActiviteRequest = function(activite, mois) {
            if (mois) {
                return " LEFT JOIN (SELECT count(*) as nb,sum(heuresSup) as heuresSup,sum(heuresAstreinte) as heuresAstreinte,sum(heuresNuit) as heuresNuit, user FROM activite_jour WHERE type = '" + activite + "' AND HOUR(jour) = 0 AND YEAR(activite_jour.jour) = ? AND MONTH(activite_jour.jour) = ? group by user) as t" + activite + " on t" + activite + ".user = activite.user" +
                " LEFT JOIN (SELECT count(*) as nb,sum(heuresSup)  as heuresSup,sum(heuresAstreinte) as heuresAstreinte,sum(heuresNuit) as heuresNuit, user FROM activite_jour WHERE type = '" + activite + "' AND HOUR(jour) > 0 AND YEAR(activite_jour.jour) = ? AND MONTH(activite_jour.jour) = ? group by user) as t" + activite + "bis on t" + activite + "bis.user = activite.user";
            }
            return " LEFT JOIN (SELECT count(*) as nb,sum(heuresSup)  as heuresSup,sum(heuresAstreinte) as heuresAstreinte,sum(heuresNuit) as heuresNuit, user, jour FROM activite_jour WHERE type = '" + activite + "' AND HOUR(jour) = 0 AND YEAR(activite_jour.jour) = ? group by user, month(jour)) as t" + activite + " on t" + activite + ".user = activite.user AND month(t" + activite + ".jour) = month(activite.mois) " +
                " LEFT JOIN (SELECT count(*) as nb,sum(heuresSup)  as heuresSup,sum(heuresAstreinte) as heuresAstreinte,sum(heuresNuit) as heuresNuit, user, jour FROM activite_jour WHERE type = '" + activite + "' AND HOUR(jour) > 0 AND YEAR(activite_jour.jour) = ? group by user, month(jour)) as t" + activite + "bis on t" + activite + "bis.user = activite.user AND month(t" + activite + "bis.jour) = month(activite.mois) ";
        };

        if (options && options.mois) {
            var query = "SELECT activite.mois, activite.user, users.nom, users.prenom, activite.etat,  IFNULL(tJT.heuresSup,0) +  IFNULL(tJTbis.heuresSup,0) as heuresSup,  IFNULL(tJT.heuresAstreinte,0) +  IFNULL(tJTbis.heuresAstreinte,0) as heuresAstreinte,  IFNULL(tJT.heuresNuit,0) +  IFNULL(tJTbis.heuresNuit,0) as heuresNuit " +
                        getActiviteSelectRequest('JT') +
                        getActiviteSelectRequest('FOR') +
                        getActiviteSelectRequest('INT') +
                        getActiviteSelectRequest('CP') +
                        getActiviteSelectRequest('CP_ANT') +
                        getActiviteSelectRequest('RC') +
                        getActiviteSelectRequest('RCE') +
                        getActiviteSelectRequest('AE') +
                        " FROM activite JOIN users on activite.user = users.id " +
                        getActiviteRequest('JT', true) +
                        getActiviteRequest('FOR', true) +
                        getActiviteRequest('INT', true) +
                        getActiviteRequest('CP', true) +
                        getActiviteRequest('CP_ANT', true) +
                        getActiviteRequest('RC', true) +
                        getActiviteRequest('RCE', true) +
                        getActiviteRequest('AE', true) +
                        " WHERE YEAR(activite.mois) = ? AND MONTH(activite.mois) = ? ORDER BY activite.mois;",
            values = []; //options.annee, options.mois, options.annee, options.mois, options.annee, options.mois, options.annee, options.mois, options.annee, options.mois];
            for (var i = 0, l = 17; i < l; i++) {
                values.push(options.annee);
                values.push(options.mois);
            }
            db.query(query, values, function(err, ret) {
                if (err) {
                    console.log('ERROR: ' + err);
                    return fn("Erreur lors de la récupération des activités du mois " + options.mois + "/" + options.annee + ".");
                }
                fn(null, ret);
            });
        }
        else {
            var query = "SELECT activite.mois, activite.user, users.nom, users.prenom, activite.etat, IFNULL(tJT.heuresSup,0) +  IFNULL(tJTbis.heuresSup,0) as heuresSup,  IFNULL(tJT.heuresAstreinte,0) +  IFNULL(tJTbis.heuresAstreinte,0) as heuresAstreinte,  IFNULL(tJT.heuresNuit,0) +  IFNULL(tJTbis.heuresNuit,0) as heuresNuit " +
                        getActiviteSelectRequest('JT') +
                        getActiviteSelectRequest('FOR') +
                        getActiviteSelectRequest('INT') +
                        getActiviteSelectRequest('CP') +
                        getActiviteSelectRequest('CP_ANT') +
                        getActiviteSelectRequest('RC') +
                        getActiviteSelectRequest('RCE') +
                        getActiviteSelectRequest('AE') +
                        " FROM activite JOIN users on activite.user = users.id " +
                        getActiviteRequest('JT', false) +
                        getActiviteRequest('FOR', false) +
                        getActiviteRequest('INT', false) +
                        getActiviteRequest('CP', false) +
                        getActiviteRequest('CP_ANT', false) +
                        getActiviteRequest('RC', false) +
                        getActiviteRequest('RCE', false) +
                        getActiviteRequest('AE', false) +
                        " WHERE YEAR(activite.mois) = ? ORDER BY activite.mois;",
            values = []; //options.annee, options.annee, options.annee, options.annee, options.annee];
            for (var i = 0, l = 17; i < l; i++) {
                values.push(options.annee);
            }
            db.query(query, values, function(err, ret) {
                if (err) {
                    console.log('ERROR: ' + err);
                    return fn("Erreur lors de la récupération des activités de l'année " + options.annee + ".");
                }
                fn(null, ret);
            });
        }
    },
    listUserSansActivites: function(options, fn) {
        var query = "SELECT users.id, users.nom, users.prenom, DATE('" + options.annee + "-" + options.mois + "-1') AS mois FROM users WHERE users.id <> 1 AND users.id <> 999999 AND users.etat = 1 " +
                    " AND YEAR(users.creation) <= ? AND MONTH(users.creation) <= ? AND " +
                    " users.id NOT IN(SELECT activite.user FROM activite WHERE YEAR(activite.mois) = ? AND MONTH(activite.mois) = ?);";
        values = [options.annee, options.mois, options.annee, options.mois];
        db.query(query, values, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des activités de l'année du mois " + options.mois + "/" + options.annee + ".");
            }
            fn(null, ret);
        });
    }
};
exports.data = data;