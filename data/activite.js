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
        db.query("CALL GetActivite(?, ?, ?, @etat, @mois);SELECT @etat, CAST(@mois as DATE) as mois", [id, options.start, options.end], function(err, ret) {
            if (err || !ret || ret.length < 3) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération de l'activité de " + id);
            }
            fn(null, {
                etat: ret[2][0]['@etat'],
                mois: ret[2][0]['mois'],
                activite: ret[0]
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
            mois: activite.mois, //new Date(activite.mois),
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
        request += "INSERT INTO activite_jour (user, jour, type, information, heuresSup, heuresAstreinte, heuresNuit, heuresInt) VALUES ";
        for (var i = 0, l = activite.activite.length; i < l; i++) {
            request += " (?,?,?,?,?,?,?,?)";
            values.push(id);
            values.push(new Date(activite.activite[i].jour));
            values.push(activite.activite[i].type);
            values.push(activite.activite[i].information || "");
            values.push(activite.activite[i].heuresSup || 0);
            values.push(activite.activite[i].heuresAstreinte || 0);
            values.push(activite.activite[i].heuresNuit || 0);
            values.push(activite.activite[i].heuresInt || 0);
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
        if (!options.mois) {
            options.mois = -1;
        }
        db.query("CALL GetListActivites(?, ?, ?)", [options.annee, options.mois, options.admin], function(err, ret) {
            if (err || !ret || !ret.length) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des activités du mois " + options.mois + "/" + options.annee + ".");
            }
            //console.log(ret);
            var i = 0, l = ret[0].length, result = {}, item;
            for (; i < l; i++) {
                item = ret[0][i];
                if (!result[item.user + item.mois]) {
                    result[item.user + item.mois] = item;
                }
                result[item.user + item.mois][item.type] = item.nb;
                if (result[item.user + item.mois].nb) {
                    delete result[item.user + item.mois].nb;
                    delete result[item.user + item.mois].type;
                }
            }
            i = 0, l = ret[1].length, item = null;
            for (; i < l; i++) {
                item = ret[1][i];
                for (typeHeure in item) {
                    if (typeHeure.indexOf('heures') == 0) {
                        if (!result[item.user + item.mois][typeHeure]) {
                            result[item.user + item.mois][typeHeure] = {
                                total: 0,
                                details: []
                            };
                        }
                        if (item[typeHeure] > 0) {
                            result[item.user + item.mois][typeHeure].total = result[item.user + item.mois][typeHeure].total + item[typeHeure] || item[typeHeure];
                            result[item.user + item.mois][typeHeure].details.push({
                                jour: item.jour,
                                nb: item[typeHeure]
                            });
                        }
                    }
                }
            }
            var resultActivite = [];
            for (var user in result) {
                resultActivite.push(result[user]);
            }
            fn(null, resultActivite);
        });

        /*
        
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
            

            var query = "SELECT activite.mois, activite.user, users.nom, users.prenom, activite.etat,  IFNULL(tJT1.heuresSup,0) + IFNULL(tJT1bis.heuresSup,0) + IFNULL(tJT2.heuresSup,0) + IFNULL(tJT2bis.heuresSup,0) + IFNULL(tJT3.heuresSup,0) + IFNULL(tJT3bis.heuresSup,0) as heuresSup,  IFNULL(tJT1.heuresAstreinte,0) + IFNULL(tJT1bis.heuresAstreinte,0) + IFNULL(tJT2.heuresAstreinte,0) + IFNULL(tJT2bis.heuresAstreinte,0) + IFNULL(tJT3.heuresAstreinte,0) +  IFNULL(tJT3bis.heuresAstreinte,0) as heuresAstreinte, IFNULL(tJT1.heuresNuit,0) + IFNULL(tJT1bis.heuresNuit,0) + IFNULL(tJT2.heuresNuit,0) + IFNULL(tJT2bis.heuresNuit,0) + IFNULL(tJT3.heuresNuit,0) + IFNULL(tJT3bis.heuresNuit,0) as heuresNuit " +
        getActiviteSelectRequest('JT1') +
        getActiviteSelectRequest('JT2') +
        getActiviteSelectRequest('JT3') +
        getActiviteSelectRequest('FOR') +
        getActiviteSelectRequest('INT') +
        getActiviteSelectRequest('CP') +
        getActiviteSelectRequest('CP_ANT') +
        getActiviteSelectRequest('RTT') +
        getActiviteSelectRequest('RCE') +
        getActiviteSelectRequest('AE') +
        " FROM activite JOIN users on activite.user = users.id " +
        getActiviteRequest('JT1', true) +
        getActiviteRequest('JT2', true) +
        getActiviteRequest('JT3', true) +
        getActiviteRequest('FOR', true) +
        getActiviteRequest('INT', true) +
        getActiviteRequest('CP', true) +
        getActiviteRequest('CP_ANT', true) +
        getActiviteRequest('RTT', true) +
        getActiviteRequest('RCE', true) +
        getActiviteRequest('AE', true) +
        " WHERE YEAR(activite.mois) = ? AND MONTH(activite.mois) = ? ",
        values = []; //options.annee, options.mois, options.annee, options.mois, options.annee, options.mois, options.annee, options.mois, options.annee, options.mois];
        for (var i = 0, l = 21; i < l; i++) {
        values.push(options.annee);
        values.push(options.mois);
        }
        if (options.admin > 0) {
        query += ' AND users.admin = ?';
        values.push(options.admin);
        }
        query = query + ' ORDER BY activite.mois;';
        db.query(query, values, function(err, ret) {
        if (err) {
        console.log('ERROR: ' + err);
        return fn("Erreur lors de la récupération des activités du mois " + options.mois + "/" + options.annee + ".");
        }
        fn(null, ret);
        });
        }
        else {
        var query = "SELECT activite.mois, activite.user, users.nom, users.prenom, activite.etat, IFNULL(tJT1.heuresSup,0) +  IFNULL(tJT1bis.heuresSup,0) + IFNULL(tJT2.heuresSup,0) +  IFNULL(tJT2bis.heuresSup,0) + IFNULL(tJT3.heuresSup,0) +  IFNULL(tJT3bis.heuresSup,0) as heuresSup,  IFNULL(tJT1.heuresAstreinte,0) +  IFNULL(tJT1bis.heuresAstreinte,0) + IFNULL(tJT2.heuresAstreinte,0) +  IFNULL(tJT2bis.heuresAstreinte,0) + IFNULL(tJT3.heuresAstreinte,0) +  IFNULL(tJT3bis.heuresAstreinte,0) as heuresAstreinte,  IFNULL(tJT1.heuresNuit,0) +  IFNULL(tJT1bis.heuresNuit,0) +  IFNULL(tJT2.heuresNuit,0) +  IFNULL(tJT2bis.heuresNuit,0) +  IFNULL(tJT3.heuresNuit,0) +  IFNULL(tJT3bis.heuresNuit,0) as heuresNuit " +
        getActiviteSelectRequest('JT1') +
        getActiviteSelectRequest('JT2') +
        getActiviteSelectRequest('JT3') +
        getActiviteSelectRequest('FOR') +
        getActiviteSelectRequest('INT') +
        getActiviteSelectRequest('CP') +
        getActiviteSelectRequest('CP_ANT') +
        getActiviteSelectRequest('RTT') +
        getActiviteSelectRequest('RCE') +
        getActiviteSelectRequest('AE') +
        " FROM activite JOIN users on activite.user = users.id " +
        getActiviteRequest('JT1', false) +
        getActiviteRequest('JT2', false) +
        getActiviteRequest('JT3', false) +
        getActiviteRequest('FOR', false) +
        getActiviteRequest('INT', false) +
        getActiviteRequest('CP', false) +
        getActiviteRequest('CP_ANT', false) +
        getActiviteRequest('RTT', false) +
        getActiviteRequest('RCE', false) +
        getActiviteRequest('AE', false) +
        " WHERE YEAR(activite.mois) = ? ",
        values = []; //options.annee, options.annee, options.annee, options.annee, options.annee];
        for (var i = 0, l = 17; i < l; i++) {
        values.push(options.annee);
        }
        if (options.admin > 0) {
        query += ' AND users.admin = ?';
        values.push(options.admin);
        }
        query = query + ' ORDER BY activite.mois;';
        db.query(query, values, function(err, ret) {
        if (err) {
        console.log('ERROR: ' + err);
        return fn("Erreur lors de la récupération des activités de l'année " + options.annee + ".");
        }
        fn(null, ret);
        });
        }*/
    },
    listUserSansActivites: function(options, fn) {
        var query = "SELECT users.id, users.nom, users.prenom, users.debutActivite, users.finActivite, DATE('" + options.annee + "-" + options.mois + "-1') AS mois FROM users WHERE users.id <> 0 AND users.id <> 999999 AND users.id <> 111111 AND users.etat = 1 " +
                    " AND ((YEAR(users.debutActivite) = ? AND MONTH(users.debutActivite) <= ?) OR YEAR(users.debutActivite) < ?) " +
                    " AND (users.finActivite is null or ((YEAR(users.finActivite) = ? AND MONTH(users.finActivite) >= ?) OR YEAR(users.finActivite) > ?) ) " +
                    " AND users.id NOT IN(SELECT activite.user FROM activite WHERE YEAR(activite.mois) = ? AND MONTH(activite.mois) = ?) ";
        values = [options.annee, options.mois, options.annee, options.annee, options.mois, options.annee, options.annee, options.mois];
        if (options.admin > 0) {
            query += ' AND users.admin = ?';
            values.push(options.admin);
        }
        db.query(query, values, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des activités de l'année du mois " + options.mois + "/" + options.annee + ".");
            }
            fn(null, ret);
        });
    },
    genererChequesResto: function(options, fn) {

        db.query("CALL GenererChequesResto(?, ?)", [options.annee, options.mois], function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la génération des chéques déjeuner du mois " + options.mois + "/" + options.annee + ".");
            }
            //console.log(ret);
            fn(null, ret[0]);
        });
    }
};
exports.data = data;