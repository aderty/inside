var db = require('./db');

function checkConges(conges) {
    if (conges.debut && conges.fin && conges.user && conges.motif) {
        if (typeof conges.debut == "string") {
            conges.debut = new Date(conges.debut);
        }
        if (typeof conges.fin == "string") {
            conges.fin = new Date(conges.fin);
        }
        if (conges.creation) {
            delete conges.creation;
        }
        if (conges.nom) {
            delete conges.nom;
        }
        if (conges.prenom) {
            delete conges.prenom;
        }
        return true;
    }
    return false;
}

function cleanConges(conges) {
    return conges;
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
    // Lecture, via GET
    listToutConges: function (admin, past, fn) {
        var query, values = [];
        if (!past) {
            query = 'SELECT conges.id,conges.user,users.nom, users.prenom, conges.etat, conges.duree, conges.debut, conges.fin, conges.motif, conges.justification, conges.type FROM conges JOIN users on conges.user = users.id WHERE fin > NOW() ORDER BY conges.debut DESC';
        }
        else {
            query = 'SELECT conges.id,conges.user,users.nom, users.prenom, conges.etat, conges.duree, conges.debut, conges.fin, conges.motif, conges.justification, conges.type FROM conges JOIN users on conges.user = users.id ORDER BY conges.debut DESC';
        }
        if (admin > 0) {
            query += ' AND users.admin = ?';
            values.push(admin);
        }
        db.query(query, values, function (err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des congès.");
            }
            fn(null, cleanConges(ret));
        });
    },
    listConges: function (matricule, options, fn) {
        if (!options.past) {          
            if (options.start && options.end) {
                db.query('SELECT * FROM conges WHERE (user = 999999 OR user = ?) AND debut >= ? AND fin <= ? ORDER BY debut DESC;', [matricule, options.start, options.end], function(err, ret) {
                    if (err) {
                        console.log('ERROR: ' + err);
                        return fn("Erreur lors de la récupération des congès.");
                    }
                    fn(null, cleanConges(ret));
                });
                return;
            }
            db.query('SELECT * FROM conges WHERE (user = 999999 OR user = ?) AND fin > NOW() ORDER BY debut DESC;', [matricule], function(err, ret) {
                if (err) {
                    console.log('ERROR: ' + err);
                    return fn("Erreur lors de la récupération des congès.");
                }
                fn(null, cleanConges(ret));
            });
            return;
        }
        db.query('SELECT * FROM conges WHERE (user = 999999 OR user = ?) AND fin <= NOW() ORDER BY debut DESC;', [matricule], function (err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des congès.");
            }
            fn(null, cleanConges(ret));
        });
        /*db.read("conges", { user: matricule }, null, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des congès.");
            }
            fn(null, cleanConges(ret));
        });*/
    },
    listCongesEtat: function (etat, admin, past, fn) {
        var query, values = [etat];
        if (!past) {
            query = 'SELECT conges.id,conges.user,users.nom, users.prenom, conges.etat, conges.duree, conges.debut, conges.fin, conges.motif, conges.justification, conges.type FROM conges JOIN users on conges.user = users.id WHERE conges.etat = ? AND fin > NOW() ORDER BY conges.debut DESC';
        }
        else {
            query = 'SELECT conges.id,conges.user,users.nom, users.prenom, conges.etat, conges.duree, conges.debut, conges.fin, conges.motif, conges.justification, conges.type FROM conges JOIN users on conges.user = users.id WHERE conges.etat = ? ORDER BY conges.debut DESC';
        }
        if (admin > 0) {
            query += ' AND users.admin = ?';
            values.push(admin);
        }
        
        db.query(query, values, function (err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des congès.");
            }
            fn(null, cleanConges(ret));
        });
    },

    getConges: function(id, fn) {
        db.find("conges", id, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération de l'utilisateur " + id);
            }
            fn(null, cleanConges(ret));
        });
    },
    addConges: function(conges, fn) {
        if (!checkConges(conges)) {
            return fn("Congés invalide");
        }
        db.query("CALL AddConges(?, ?, ?, ?, ?, ?, @rowid, @duree, @retour)", [conges.user, conges.type, conges.motif, conges.debut, conges.fin, conges.justification], function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de l'insertion du congés.");
            }
            db.query("select @rowid, @duree,@retour;", function(err2, ret2) {
                if (err2 || ret2.length == 0) {
                    console.log('ERROR: ' + err2);
                    fn("Erreur lors de l'insertion du congés.");
                }
                if (ret2[0]['@retour']) {
                    var error = ret2[0]['@retour'];
                    return fn(errors[error] || error);
                }
                fn(null, {
                    id: ret2[0]['@rowid'],
                    duree: ret2[0]['@duree']
                });
            });
        });
        /*db.insert("conges", conges, function(err, ret) {
        if (err) {
        if (err.code && err.code == "ER_DUP_ENTRY") {
        return fn("Matricule déjà attribué !");
        }
        console.log('ERROR: ' + err);
        return fn("Erreur lors de l'insertion du congés.");
        }
        fn(null, { id: ret.insertId });
        });*/
    },
    // Mise à jour via POST
    updateConges: function(conges, forcer, fn) {
        if (!checkConges(conges)) {
            return fn("Congés invalide");
        }
        if (!conges.id) {
            return fn("Congés inconnu");
        }
        db.query("CALL UpdateConges(?, ?, ?, ?, ?, ?, ?, @duree, @retour)", [conges.id, conges.type, conges.motif, conges.debut, conges.fin, conges.justification, forcer], function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur  de la mise à jour du congés.");
            }
            db.query("select @duree,@retour;", function(err2, ret2) {
                if (err2 || ret2.length == 0) {
                    console.log('ERROR: ' + err2);
                    return fn("Erreur lors de la mise à jour du congés.");
                }
                if (ret2[0]['@retour']) {
                    var error = ret2[0]['@retour'];
                    return fn(errors[error] || error);
                }
                fn(null, {
                    duree: ret2[0]['@duree']
                });
            });
        });

        /*db.updateById("conges", conges.id, conges, function(err, ret) {
        if (err) {
        if (err.code && err.code == "ER_DUP_ENTRY") {
        return fn("Matricule déjà attribué !");
        }
        console.log('ERROR: ' + err);
        return fn("Erreur lors de la modification du congés " + conges.id);
        }
        fn(null, cleanConges(ret));
        });*/
    },
    // Mise à jour via POST
    updateEtatConges: function(conges, fn) {
        if (!checkConges(conges)) {
            return fn("Congés invalide");
        }
        if (!conges.id) {
            return fn("Congés inconnu");
        }
        db.query("CALL UpdateEtatConges(?, ?, ?, @retour)", [conges.id, conges.etat, conges.refus || ''], function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la modification du congés " + conges.id);
            }
            db.query("select @retour;", function(err2, ret2) {
                if (err2 || ret2.length == 0) {
                    console.log('ERROR: ' + err2);
                    return fn("Erreur lors de la modification du congés " + conges.id);
                }
                if (ret2[0]['@retour']) {
                    var error = ret2[0]['@retour'];
                    return fn(errors[error] || error);
                }
                fn(null, true);
            });
        });

        /*db.updateById("conges", conges.id, {etat: conges.etat}, function(err, ret) {
        if (err) {
        console.log('ERROR: ' + err);
        return fn("Erreur lors de la modification du congés " + conges.id);
        }
        fn(null, cleanConges(ret));
        });*/
    },

    removeConges: function(id, fn) {
        if (!id || id == "") {
            return fn("Id de congés invalide");
        }
        db.query("CALL RemoveConges(?, @retour)", [id], function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de l'insertion du congés.");
            }
            db.query("select @retour;", function(err2, ret2) {
                if (err2 || ret2.length == 0) {
                    console.log('ERROR: ' + err2);
                    fn("Erreur lors de l'insertion du congés.");
                }
                if (ret2[0]['@retour']) {
                    var error = ret2[0]['@retour'];
                    return fn(errors[error] || error);
                }
                fn(null, {});
            });
        });
        /*db.removeById("conges", id, function(err, ret) {
        if (err) {
        console.log('ERROR: ' + err);
        return fn("Erreur lors de la suppresion du congés " + id);
        }
        fn(null, true);
        });*/
    },
    listMotifs: function (fn) {
        db.query("SELECT * FROM conges_motifs ORDER BY ordre", null, function (err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des motifs de congés.");
            }
            fn(null, ret);
        });
    }
};
exports.data = data;