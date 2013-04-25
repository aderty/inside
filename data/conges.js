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

var data = {
    // Lecture, via GET
    listConges: function (matricule, past, fn) {
        if (!past) {
            db.query('SELECT * FROM conges WHERE user = ? AND fin > NOW();', [matricule], function (err, ret) {
                if (err) return fn("Erreur lors de la récupération des congès.");
                fn(null, cleanConges(ret));
            });
            return;
        }
        db.read("conges", { user: matricule }, null, function(err, ret) {
            if (err) return fn("Erreur lors de la récupération des congès.");
            fn(null, cleanConges(ret));
        });
    },

    getConges: function(id, fn) {
        db.find("conges", id, function(err, ret) {
            if (err) return fn("Erreur lors de la récupération de l'utilisateur " + id);
            fn(null, cleanConges(ret));
        });
    },
    addConges: function (conges, fn) {
        if (!checkConges(conges)) {
            return fn("Congés invalide");
        }
        console.log(conges);
        db.insert("conges", conges, function(err, ret) {
            if (err) {
                if (err.code && err.code == "ER_DUP_ENTRY") {
                    return fn("Matricule déjà attribué !");
                }
                console.log(err);
                return fn("Erreur lors de l'insertion du congés.");
            }
            fn(null, { id: ret.insertId });
        });
    },
    // Mise à jour via POST
    updateConges: function (conges, fn) {
        if (!checkConges(conges)) {
            return fn("Congés invalide");
        }
        db.updateById("conges", conges.id, conges, function(err, ret) {
            if (err) {
                if (err.code && err.code == "ER_DUP_ENTRY") {
                    return fn("Matricule déjà attribué !");
                }
                console.log(err);
                return fn("Erreur lors de la modification du congés " + conges.id);
            }
            fn(null, cleanConges(ret));
        });
    },

    removeConges: function(id, fn) {
        if (!id || id == "") {
            return fn("Id de congés invalide");
        }
        db.removeById("conges", id, function(err, ret) {
            if (err) fn("Erreur lors de la suppresion du congés " + id);
            fn(null, true);
        });
    }
};
exports.data = data;