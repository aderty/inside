//var db = require('./db');

var donnees = [
        { matricule: "1205", role: 0, nom: "Moroni", prenom: "Moroni", email: "toto@test.com", pwd: "popo1664", pwd: "popo1664", age: 50, cp: 15, cp_acc: 15, rtt: 0, dateNaissance: "1983-08-16T22:00:00.000Z" },
        { matricule: "1206", role: 0, nom: "Tiancum", prenom: "Jean-Marie", email: "toto@test.com", pwd: "popo1664", age: 43, cp: 20, cp_acc: 15, rtt: 10, dateNaissance: "1964-02-26T22:00:00.000Z" },
        { matricule: "1207", role: 0, nom: "Jacob", prenom: "Pierre-Simon", email: "toto@test.com", pwd: "popo1664", age: 27, cp: 9, cp_acc: 15, rtt: 5, dateNaissance: "1982-09-16T22:00:00.000Z" },
        { matricule: "1208", role: 0, nom: "Nephi", prenom: "Moroni", email: "toto@test.com", pwd: "popo1664", age: 29, cp: 10.5, cp_acc: 15, rtt: 6, dateNaissance: "1989-03-08T22:00:00.000Z" },
        { matricule: "1209", role: 0, nom: "Enos", prenom: "Moroni", email: "toto@test.com", pwd: "popo1664", age: 34, cp: 18.5, cp_acc: 15, rtt: 8, dateNaissance: "1985-07-15T22:00:00.000Z" }
];

function checkUser(user) {
    if (user && user.matricule != "" && user.nom != "" && user.prenom != "" && user.email != "") {
        return true;
    }
    return false;
}

var data = {

    // Lecture, via GET
    listUsers: function (fn) {
        fn(null,
            donnees
            );
    },

    getUser: function (id, fn) {
        //data.getUser(req.params.id, dataCallback(res));
    },

    // Mise à jour via POST
    saveUser: function (user, fn) {
        if (!checkUser(user)) {
            return fn("Utilisateur invalide");
        }
        var index = -1;
        for (var i = 0, l = donnees.length; i < l; i++) {
            if (donnees[i].matricule == user.matricule) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            donnees[index] = user;
        }
        else {
            donnees.push(user);
        }
        fn(null, user);
        //data.updateUser(req.params.id, req.body, dataCallback(res));
    },

    removeUser: function (id, fn) {
        if (!id || id == "") {
            return fn("Id d'utilisateur invalide");
        }
        var index = -1;
        for (var i = 0, l = donnees.length; i < l; i++) {
            if (donnees[i].matricule == id) {
                index = i;
                break;
            }
        }
        //var index = donnees.indexOf(id);
        if (index > -1) {
            donnees.splice(index, 1);
            fn(null, true);
        }
        return fn("Pas trouvé");
        //data.removeUser(req.params.id, dataCallback(res));
    }
};
exports.data = data;