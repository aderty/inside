var path = require('path')
    , email = require("mailer")
    , moment = require('moment')
    , dirTemplate = path.join(__dirname, 'templates')
    , config = require('../config.json').mail;
    //, Constantes = require('../constantes.js').Constantes;

moment.lang('fr');

/*var config = {
            host: config.host,              // smtp server hostname
            port: config.port,                     // smtp server port
            ssl: config.ssl,                        // for SSL support - REQUIRES NODE v0.3.x OR HIGHER
            domain: config.domain,            // domain used by client to identify itself to server
            authentication: config.authentication,
            username: config.username, //(new Buffer("usernamet")).toString("base64"),
            password: config.password //(new Buffer("password")).toString("base64"),
};*/

function extend(dest, from) {
    var props = Object.getOwnPropertyNames(from), destination;

    props.forEach(function(name) {
        if (typeof from[name] === 'object') {
            if (typeof dest[name] !== 'object') {
                dest[name] = {}
            }
            extend(dest[name], from[name]);
        } else {
            destination = Object.getOwnPropertyDescriptor(from, name);
            Object.defineProperty(dest, name, destination);
        }
    });
    return dest;
}

var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var Mail = {
    ajoutUser: function(user, password, fn) {
        //return fn(null);
        if (!user) return fn("Utilisateur invalide");
        if (!re.test(user.email)) {
            return fn("Email utilisateur invalide");
        }
        console.log("envois de l'email à : " + user.email);

        email.send(extend({
            to: user.email,
            subject: "[InsideConsulting] Création de votre compte !",
            //body: "Hello! This is a test of the node_mailer."
            template: path.join(dirTemplate, 'ajoutUser.html'),   // path to template name
            data: {
                "email": user.email,
                "prenom": user.prenom,
                "password": password,
                "url": "http://176.31.188.68:81/",
                "color": function() {
                    var arr = ["purple", "red", "green", "yello"];
                    return arr[Math.floor(Math.random() * 3)];
                }
            }
        }, config),
        function(err, result) {
            if (err) { console.log(err); }
            if (fn) fn(err);
        });
    },
    validationConges: function(user, conges, owner, fn) {
        //return fn(null);
        if (!user) return fn("Utilisateur invalide");
        if (!re.test(user.email)) {
            return fn("Email utilisateur invalide");
        }
        if (!conges) {
            return fn("Pas de congé");
        }
        console.log("envois de l'email à : " + user.email);

        var subject = conges.etat == 2 ? "[InsideConsulting] Validation de votre demande de congés du " : "[InsideConsulting] Refus de votre demande de congés du ";
        if (moment(conges.debut.date).diff(moment(conges.fin.date), 'days') != 0) {
            subject += moment(conges.debut.date).format('D MMMM YYYY') + " au " + moment(conges.fin.date).format('D MMMM YYYY') + " !";
        }
        else {
            subject += moment(conges.debut.date).format('D MMMM YYYY') + " !";
        }

        email.send(extend({
            to: user.email,
            subject: subject,
            //body: "Hello! This is a test of the node_mailer."
            template: path.join(dirTemplate, conges.etat == 2 ? 'validationConges.html' : 'refusConges.html'),   // path to template name
            data: {
                "email": user.email,
                "prenom": user.prenom,
                "nom": user.nom,
                "debut": moment(conges.debut.date).format('D MMMM YYYY'),
                "fin": moment(conges.fin.date).format('D MMMM YYYY'),
                "debutType": conges.debut.type == 1 ? "après-midi" : "matin",
                "finType": conges.fin.type == 1 ? "soir" : "midi",
                "motif": conges.libelle,
                "refus": conges.refus || "Non communiqué",
                "owner": owner
            }
        }, config),
        function(err, result) {
            if (err) { console.log(err); }
            if (fn) fn(err);
        });
    },
    passwordLost: function(user, key, fn) {
        //return fn(null);
        if (!user) return fn("Utilisateur invalide");
        if (!re.test(user.email)) {
            return fn("Email utilisateur invalide");
        }
        if (!key) {
            return fn("Pas de code");
        }
        console.log("envois de l'email à : " + user.email);

        var subject = "[InsideConsulting] Récupération de compte après la perte de votre mot de passe";
        
        email.send(extend({
            to: user.email,
            subject: subject,
            //body: "Hello! This is a test of the node_mailer."
            template: path.join(dirTemplate, 'passwordLost.html'),   // path to template name
            data: {
                "email": user.email,
                "prenom": user.prenom,
                "nom": user.nom,
                "code": key
            }
        }, config),
        function(err, result) {
            if (err) { console.log(err); }
            if (fn) fn(err);
        });
    },
    recapConges: function (email_admin, conges, fn) {
        //return fn(null);
        if (!email_admin) return fn("Pas d'email");
        if (!conges) return fn("Congés invalide");
        if (!re.test(email_admin)) {
            return fn("Email utilisateur invalide");
        }

        console.log("envois de l'email à : " + email_admin);

        var subject = "[InsideConsulting] Listes des congés à valider.";

        for (var i = 0, l = conges.length; i < l; i++) {
            conges[i].debutType = conges[i].debut.getHours() >= 8 ? "après-midi" : "matin";
            conges[i].finType = conges[i].fin.getHours() > 14 ? "soir" : "midi";

            conges[i].debut = moment(conges[i].debut).format('D MMMM YYYY');
            conges[i].fin = moment(conges[i].fin).format('D MMMM YYYY');
        }

        email.send(extend({
            to: email_admin,
            subject: subject,
            //body: "Hello! This is a test of the node_mailer."
            template: path.join(dirTemplate, 'recapConges.html'),   // path to template name
            data: {
                "date": moment(new Date()).format('D MMMM YYYY'),
                "conges": conges,
                "nom": ""
            }
        }, config),
        function (err, result) {
            if (err) { console.log(err); }
            if (fn) fn(err);
        });
    },
    contact: function (email_admin, user, sujet, message, fn) {
        //return fn(null);
        if (!email_admin) return fn("Pas d'email");
        if (!user) return fn("Pas d'utilisateur");
        if (!re.test(email_admin)) {
            return fn("Email utilisateur invalide");
        }

        console.log("envois de l'email Ã  : " + email_admin);

        var subject = "[InsideConsulting] Demande d'information de " + user + " : " + sujet;

        email.send(extend({
            to: email_admin,
            subject: subject,
            //body: "Hello! This is a test of the node_mailer."
            template: path.join(dirTemplate, 'contact.html'),   // path to template name
            data: {
                "user": user,
                "sujet": sujet,
                "message": message
            }
        }, config),
        function (err, result) {
            if (err) { console.log(err); }
            if (fn) return fn(err);
            fn(err, true);
        });
    }
}

exports.Mail = Mail;