﻿var db = require('./db');
var crypto = require('crypto');
var shasum = crypto.createHash('sha1');
shasum.update("utf8");

function checkUser(user) {
    if (user && user.nom != "" && user.prenom != "" && user.email != "") {
        if (user.creation) {
            delete user.creation;
        }
        return true;
    }
    return false;
}

function cleanUsers(users) {
    if (users) {
        for (var i = 0, l = users.length; i < l; i++) {
            delete users[i].pwd;
        }
    }
    return users;
}

db.events.once('connected', function (result) {
    console.log("connected to MySQL");
});

var errors = {
    USER_INVALIDE: "Votre login n'est pas autorisé"
}

var data = {
    infos: function(id, role, fn) {
        db.query("CALL StartUser(?, ?, @retour, @params)", [id, role], function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des informations de démarage.");
            }
            db.query("select @retour,@params;", function(err2, ret2) {
                if (err2 || ret2.length == 0) {
                    console.log('ERROR: ' + err2);
                    fn("Erreur lors de l'insertion du congés.");
                }
                if (ret2[0]['@retour']) {
                    var error = ret2[0]['@retour'];
                    return fn(errors[error] || error);
                }
                var params = ret2[0]['@params'].split('|'),
                infos = {};
                if (params && params.length) {
                    for (var i = 0, l = params.length; i < l; i++) {
                        try {
                            infos[params[i].split(':')[0]] = parseInt(params[i].split(':')[1]);
                        }
                        catch (e) {
                            infos[params[i].split(':')[0]] = params[i].split(':')[1];
                        }
                    }
                }
                fn(null, infos);
            });
        });
    },
    login: function(email, pwd, fn) {
        // Chiffrage du pass en sha1
        var hash = crypto.createHash('sha1').update(pwd).digest("hex");
        // On test l'existance du compte
        db.query('SELECT * FROM users WHERE email="' + email + '" AND pwd="' + hash + '" AND etat=1', function(error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return fn("Erreur lors de la tentative de login.");
            }
            if (ret && ret.length == 1) {
                var user = cleanUsers(ret[0]);
                data.infos(user.id, user.role, function(err, infos) {
                    if (err) {
                        console.log('ERROR: ' + err);
                        return fn("Erreur lors de la récupération des informations de démarage.");
                    }
                    user.infos = infos;
                    return fn(null, user);
                });
                return;
            }
            return fn(null, false);
        });
    },
    // Lecture, via GET
    listUsers: function(fn) {
        //db.query('SELECT * FROM users JOIN conges_compteurs ON users.id = conges_compteurs.user WHERE id <> 999999 AND etat=1', function (err, ret) {
        db.query('SELECT users.*, (SELECT compteur FROM conges_compteurs WHERE user = id AND motif= "CP" ) AS cp, (SELECT compteur FROM conges_compteurs WHERE user = id AND motif= "CP_ant" ) AS cp_ant, (SELECT compteur FROM conges_compteurs WHERE user = id AND motif= "RTT" ) AS rtt FROM users WHERE id <> 999999 AND etat=1', function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des utilisateurs.");
            }
            fn(null, cleanUsers(ret));
        });
        /*db.findAll("users", { etat: 1 }, function(err, ret) {
        if (err) {
        console.log('ERROR: ' + err);
        return fn("Erreur lors de la récupération des utilisateurs.");
        }
        fn(null, cleanUsers(ret));
        });*/
    },
    search: function(search, fn) {
        if (search.type == "id") {
            db.query('SELECT * FROM users WHERE id= ? AND etat=1', [search.search], function(error, ret) {
                if (error) {
                    console.log('ERROR: ' + error);
                    return fn("Erreur lors de la tentative de login.");
                }
                return fn(null, cleanUsers(ret));
            });
            return;
        }
        db.query('SELECT * FROM users WHERE id <> 999999 AND (nom LIKE "%' + db.escape(search.search) + '%" OR prenom LIKE "%' + db.escape(search.search) + '%")', function(error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return fn("Erreur lors de la tentative de login.");
            }
            return fn(null, cleanUsers(ret));
        });
    },
    getUser: function(id, fn) {
        //db.find("users", id, function(err, ret) {
        db.query('SELECT users.*, (SELECT compteur FROM conges_compteurs WHERE user = id AND motif= "CP" ) AS cp, (SELECT compteur FROM conges_compteurs WHERE user = id AND motif= "CP_ant" ) AS cp_ant, (SELECT compteur FROM conges_compteurs WHERE user = id AND motif= "RTT" ) AS rtt FROM users WHERE id = ? AND etat=1', id, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération de l'utilisateur " + id);
            }
            fn(null, cleanUsers(ret)[0]);
        });
    },

    // Mise à jour via POST
    saveUser: function(user, fn) {
        if (!checkUser(user)) {
            return fn("Utilisateur invalide");
        }
        if (user.pwd) {
            // Chiffrage du pass en sha1
            user.pwd = crypto.createHash('sha1').update(user.pwd).digest("hex");
        }
        var cp, cp_ant, rtt;
        if (typeof user.cp != "undefined") {
            cp = user.cp;
            delete user.cp;
        }
        if (typeof user.cp_ant != "undefined") {
            cp_ant = user.cp_ant;
            delete user.cp_ant;
        }
        if (typeof user.rtt != "undefined") {
            rtt = user.rtt;
            delete user.rtt;
        }
        if (user.last_connection) {
            delete user.last_connection;
        }
        if (user.create) {
            // Suppression du flag
            delete user.create;
            db.insert("users", user, function(err, ret) {
                if (err) {
                    if (err.code && err.code == "ER_DUP_ENTRY") {
                        return fn("Matricule déjà attribué !");
                    }
                    console.log('ERROR: ' + err);
                    return fn("Erreur lors de l'insertion de l'utilisateur " + user.nom);
                }
                db.query("CALL AddCompteursUser(?, ?, ?, ?)", [user.id, cp || 0, cp_ant || 0, rtt || 0], function(err2) {
                    if (err2) {
                        console.log('ERROR: ' + err2);
                        return fn("Erreur lors de l'insertion des compteurs de l'utilisateur.");
                    }
                    fn(null, { id: user.id, create: true });
                });
            });
            return;
        }
        var id = user.lastId || user.id;
        if (user.lastId) {
            delete user.lastId;
        }
        db.updateById("users", id, user, function(err, ret) {
            if (err) {
                if (err.code && err.code == "ER_DUP_ENTRY") {
                    return fn("Matricule déjà attribué !");
                }
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la modification de l'utilisateur " + user.id);
            }
            db.query("CALL UpdateCompteursUser(?, ?, ?, ?)", [id, cp || 0, cp_ant || 0, rtt || 0], function(err2) {
                if (err2) {
                    console.log('ERROR: ' + err2);
                    return fn("Erreur lors de l'insertion des compteurs de l'utilisateur.");
                }
                fn(null, cleanUsers(ret));
            });
        });
        /*db.find("users", user.id, function (err, ret1) {
        if (err) fn("Erreur lors de la récupération de l'utilisateur " + user.id);
        if (ret1 && ret1.length > 0) {
        db.updateById("users", user.id, user, function (err, ret) {
        if (err) fn("Erreur lors de la modification de l'utilisateur " + user.id);
        fn(null, cleanUsers(ret));
        });
        return;
        }
        fn("Erreur lors de la récupération de l'utilisateur " + user.id);
        });*/
    },
    password: function(id, options, fn) {
        if (!id || id == "") {
            return fn("Id d'utilisateur invalide");
        }
        if (!options || options.oldPwd == "" || options.pwd == "") {
            return fn("Mot de passe d'utilisateur invalide");
        }
        // Chiffrage du pass en sha1
        var hash = crypto.createHash('sha1').update(options.oldPwd).digest("hex");
        // On test l'existance du compte
        db.query('SELECT * FROM users WHERE id = ? AND pwd = ? AND etat=1', [id, hash], function(error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return fn("Erreur lors de la tentative de modification du mot de passe.");
            }
            if (ret && ret.length == 1) {
                // Chiffrage du pass en sha1
                hash = crypto.createHash('sha1').update(options.pwd).digest("hex");
                db.query('UPDATE users SET pwd = ? WHERE id = ?', [hash, id], function(error, ret) {
                    if (error) {
                        console.log('ERROR: ' + error);
                        return fn("Erreur lors de la tentative de modification du mot de passe.");
                    }
                    return fn(null, { success: true });
                });
                return;
            }
            return fn("Ancien mot de passe incorrect.");
        });
    },
    removeUser: function(id, fn) {
        if (!id || id == "") {
            return fn("Id d'utilisateur invalide");
        }
        db.query('UPDATE users SET etat=3 WHERE id="' + id + '"', function(error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return fn("Erreur lors de la tentative de login.");
            }
            if (ret && ret.length == 1) {
                return fn(null, cleanUsers(ret[0]));
            }
            return fn(null, false);
        });
        /*db.removeById("users", id, function (err, ret) {
        if (err) fn("Erreur lors de la suppresion de l'utilisateur " + id);
        fn(null, true);
        });*/
    },
    getNextId: function(fn) {
        db.query('SELECT MAX(id) + 1 AS next FROM users WHERE id <> 999999', function(error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return fn(error);
            }
            if (ret && ret.length > 0) {
                return fn(null, ret[0].next);
            }
            return fn(null, 1);
        });
    }
};
exports.data = data;