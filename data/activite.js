﻿var db = require('./db');

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
            var request = "INSERT INTO activite_jour (user, jour, type, information) VALUES ";
            var values = [];
            for (var i = 0, l = activite.activite.length; i < l; i++) {
                request += " (?,?,?,?)"
                values.push(id);
                values.push(new Date(activite.activite[i].jour));
                values.push(activite.activite[i].type);
                values.push(activite.activite[i].information || "");
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
        request += "INSERT INTO activite_jour (user, jour, type, information) VALUES ";
        for (var i = 0, l = activite.activite.length; i < l; i++) {
            request += " (?,?,?,?)"
            values.push(id);
            values.push(new Date(activite.activite[i].jour));
            values.push(activite.activite[i].type);
            values.push(activite.activite[i].information || "");
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
        db.query('UPDATE activite SET etat = ? WHERE user = ? AND YEAR(mois) = YEAR(?) AND MONTH(mois) = MONTH(?)', [activite.etat, activite.user, activite.mois, activite.mois], function (error, ret) {
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
    var query = "SELECT activite.mois, activite.user, users.nom, users.prenom, activite.etat, (IFNULL(t1.nb,0) + IFNULL(t2.nb,0) * 0.5) AS nbJoursTravailles, (IFNULL(t3.nb,0) + IFNULL(t4.nb,0) * 0.5) as nbJoursNonTravailles" +
                    " FROM activite JOIN users on activite.user = users.id " +
                    " LEFT JOIN (SELECT count(*) as nb, user FROM activite_jour WHERE type = 'JT' AND HOUR(jour) = 0 AND YEAR(activite_jour.jour) = ? AND MONTH(activite_jour.jour) = ? group by user) as t1 on t1.user = activite.user" +
                    " LEFT JOIN (SELECT count(*) as nb, user FROM activite_jour WHERE type = 'JT' AND HOUR(jour) > 0 AND YEAR(activite_jour.jour) = ? AND MONTH(activite_jour.jour) = ? group by user) as t2 on t2.user = activite.user" +
                    " LEFT JOIN (SELECT count(*) as nb, user FROM activite_jour WHERE type <> 'JT' AND HOUR(jour) = 0 AND YEAR(activite_jour.jour) = ? AND MONTH(activite_jour.jour) = ? group by user) as t3 on t3.user = activite.user" +
                    " LEFT JOIN (SELECT count(*) as nb, user FROM activite_jour WHERE type <> 'JT' AND HOUR(jour) > 0 AND YEAR(activite_jour.jour) = ? AND MONTH(activite_jour.jour) = ? group by user) as t4 on t4.user = activite.user" +
                    " WHERE YEAR(activite.mois) = ? AND MONTH(activite.mois) = ?;",
        values = [options.annee, options.mois, options.annee, options.mois, options.annee, options.mois, options.annee, options.mois, options.annee, options.mois];
        db.query(query, values, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des activités du mois " + options.mois + "/" + options.annee + ".");
            }
            fn(null, ret);
        });
    }
};
exports.data = data;