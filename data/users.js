var db = require('./db');
var crypto = require('crypto');
var shasum = crypto.createHash('sha1');
shasum.update("utf8");

var donnees = [
        { id: "1205", role: 0, nom: "Moroni", prenom: "Moroni", email: "toto@test.com", pwd: "popo1664", pwd: "popo1664", age: 50, cp: 15, cp_acc: 15, rtt: 0, dateNaissance: "1983-08-16T22:00:00.000Z" },
        { id: "1206", role: 0, nom: "Tiancum", prenom: "Jean-Marie", email: "toto@test.com", pwd: "popo1664", age: 43, cp: 20, cp_acc: 15, rtt: 10, dateNaissance: "1964-02-26T22:00:00.000Z" },
        { id: "1207", role: 0, nom: "Jacob", prenom: "Pierre-Simon", email: "toto@test.com", pwd: "popo1664", age: 27, cp: 9, cp_acc: 15, rtt: 5, dateNaissance: "1982-09-16T22:00:00.000Z" },
        { id: "1208", role: 0, nom: "Nephi", prenom: "Moroni", email: "toto@test.com", pwd: "popo1664", age: 29, cp: 10.5, cp_acc: 15, rtt: 6, dateNaissance: "1989-03-08T22:00:00.000Z" },
        { id: "1209", role: 0, nom: "Enos", prenom: "Moroni", email: "toto@test.com", pwd: "popo1664", age: 34, cp: 18.5, cp_acc: 15, rtt: 8, dateNaissance: "1985-07-15T22:00:00.000Z" }
];

function checkUser(user) {
    if (user && user.id != "" && user.nom != "" && user.prenom != "" && user.email != "") {
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

var data = {
    login: function (email, pwd, fn) {
        // Chiffrage du pass en sha1
        var hash = crypto.createHash('sha1').update(pwd).digest("hex");
        // On test l'existance du compte
        db.query('SELECT * FROM users WHERE email="' + email + '" AND pwd="' + hash + '"', function (error, ret) {
            if (error) {
                console.log('ERROR: ' + error);
                return;
            }
            if (ret && ret.length == 1) {
                return fn(null, cleanUsers(ret[0]));
            }
            return fn(null, false);
        });
    },
    // Lecture, via GET
    listUsers: function (fn) {
        db.findAll("users", function (err, ret) {
            if (err) fn("Erreur lors de la récupération des utilisateurs.");
            fn(null, cleanUsers(ret));
        });
    },

    getUser: function (id, fn) {
        db.find("users", id, function (err, ret) {
            if (err) fn("Erreur lors de la récupération de l'utilisateur " + id);
            fn(null, cleanUsers(ret));
        });
    },

    // Mise à jour via POST
    saveUser: function (user, fn) {
        if (!checkUser(user)) {
            return fn("Utilisateur invalide");
        }
        db.find("users", user.id, function (err, ret1) {
            if (err) fn("Erreur lors de la récupération de l'utilisateur " + user.id);
            if (ret1 && ret1.length > 0) {
                db.updateById("users", user.id, user, function (err, ret) {
                    if (err) fn("Erreur lors de la modification de l'utilisateur " + user.id);
                    fn(null, cleanUsers(ret));
                });
                return;
            }
            // Chiffrage du pass en sha1
            var hash = crypto.createHash('sha1').update(user.pwd).digest("hex");
            user.pwd = hash;
            db.insert("users", user, function (err, ret) {
                if (err) fn("Erreur lors de l'insertion de l'utilisateur " + user.id);
                fn(null, cleanUsers(ret));
            });
            
        });
    },

    removeUser: function (id, fn) {
        if (!id || id == "") {
            return fn("Id d'utilisateur invalide");
        }
        db.removeById("users", id, function (err, ret) {
            if (err) fn("Erreur lors de la suppresion de l'utilisateur " + id);
            fn(null, true);
        });
    }
};
exports.data = data;