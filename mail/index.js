var path = require('path')
    , email = require("mailer")
    , moment = require('moment')
    , dirTemplate = path.join(__dirname, 'templates')
    , config = require('../config.json').mail;
    //, Constantes = require('../constantes.js').Constantes;

moment.lang('fr');

var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var Mail = {
    ajoutUser: function (user, password, fn) {
        //return fn(null);
        if (!user) return fn("Utilisateur invalide");
        if (!re.test(user.email)) {
            return fn("Email utilisateur invalide");
        }
        console.log("envois de l'email à : " + user.email);    

        email.send({
            host: config.host,              // smtp server hostname
            port: config.port,                     // smtp server port
            ssl: config.ssl,                        // for SSL support - REQUIRES NODE v0.3.x OR HIGHER
            domain: config.domain,            // domain used by client to identify itself to server
            authentication: config.authentication,
            username: config.username, //(new Buffer("usernamet")).toString("base64"),
            password: config.password, //(new Buffer("password")).toString("base64"),
            to: user.email,
            from: "footmap@laposte.net", //"no-reply@insideconsulting.fr",
            subject: "[InsideConsulting] Création de votre compte !",
            //body: "Hello! This is a test of the node_mailer."
            template: path.join(dirTemplate, 'ajoutUser.html'),   // path to template name
            data: {
                "email": user.email,
                "prenom": user.prenom,
                "password": password,
                "color": function () {
                    var arr = ["purple", "red", "green", "yello"];
                    return arr[Math.floor(Math.random() * 3)];
                }
            }
        },
        function (err, result) {
            if (err) { console.log(err); }
            if (fn) fn(err);
        });
    },
    validationConges: function (user, conges, owner, fn) {
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

        email.send({
            host: config.host,              // smtp server hostname
            port: config.port,                     // smtp server port
            ssl: config.ssl,                        // for SSL support - REQUIRES NODE v0.3.x OR HIGHER
            domain: config.domain,            // domain used by client to identify itself to server
            authentication: config.authentication,
            username: config.username, //(new Buffer("usernamet")).toString("base64"),
            password: config.password, //(new Buffer("password")).toString("base64"),
            to: user.email,
            from: "footmap@laposte.net", //"no-reply@insideconsulting.fr",
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
                "owner": owner
            }
        },
        function (err, result) {
            if (err) { console.log(err); }
            if (fn) fn(err);
        });
    }
}

exports.Mail = Mail;