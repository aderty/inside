var db = require('./db');
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

var data = {
    login: function (email, pwd, fn) {
        // Chiffrage du pass en sha1
        var hash = crypto.createHash('sha1').update(pwd).digest("hex");
        // On test l'existance du compte
        db.query('SELECT * FROM users WHERE email="' + email + '" AND pwd="' + hash + '" AND etat=1', function (error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return fn("Erreur lors de la tentative de login.");
            }
            if (ret && ret.length == 1) {
                return fn(null, cleanUsers(ret[0]));
            }
            return fn(null, false);
        });
    },
    // Lecture, via GET
    listUsers: function (fn) {
        db.findAll("users", { etat: 1 }, function (err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération des utilisateurs.");
            }
            fn(null, cleanUsers(ret));
        });
    },
    search: function (search, fn) {
        if (search.type == "id") {
            db.query('SELECT * FROM users WHERE id= ? AND etat=1', [search.search], function (error, ret) {
                if (error) {
                    console.log('ERROR: ' + error);
                    return fn("Erreur lors de la tentative de login.");
                }
                return fn(null, cleanUsers(ret));
            });
            return;
        }
        db.query('SELECT * FROM users WHERE nom LIKE "%' + db.escape(search.search) + '%" OR prenom LIKE "%' + db.escape(search.search) + '%"', function (error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return fn("Erreur lors de la tentative de login.");
            }
            return fn(null, cleanUsers(ret));
        });
    },
    getUser: function (id, fn) {
        db.find("users", id, function (err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la récupération de l'utilisateur " + id);
            }
            fn(null, cleanUsers(ret)[0]);
        });
    },

    // Mise à jour via POST
    saveUser: function (user, fn) {
        if (!checkUser(user)) {
            return fn("Utilisateur invalide");
        }
        if (user.pwd) {
            // Chiffrage du pass en sha1
            user.pwd = crypto.createHash('sha1').update(user.pwd).digest("hex");
        }
        if (user.create) {
            // Suppression du flag
            delete user.create;
            db.insert("users", user, function (err, ret) {
                if (err) {
                    if (err.code && err.code == "ER_DUP_ENTRY") {
                        return fn("Matricule déjà attribué !");
                    }
                    console.log('ERROR: ' + err);
                    return fn("Erreur lors de l'insertion de l'utilisateur " + user.nom);
                }
                fn(null, { id: ret.insertId });
            });
            return;
        }
        var id = user.lastId || user.id;
        if (user.lastId) {
            delete user.lastId;
        }
        db.updateById("users", id, user, function (err, ret) {
            if (err) {
                if (err.code && err.code == "ER_DUP_ENTRY") {
                    return fn("Matricule déjà attribué !");
                }
                console.log('ERROR: ' + err);
                return fn("Erreur lors de la modification de l'utilisateur " + user.id);
            }
            fn(null, cleanUsers(ret));
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

    removeUser: function (id, fn) {
        if (!id || id == "") {
            return fn("Id d'utilisateur invalide");
        }
        db.query('UPDATE users SET etat=3 WHERE id="' + id + '"', function (error, ret) {
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
    getNextId: function (fn) {
        db.query('SELECT MAX(id) + 1 AS next FROM users', function (error, ret) {
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