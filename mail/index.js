var path = require('path')
    , fs = require('fs')
    //, email = require("mailer")
    , nodemailer = require('nodemailer')
    ,_ = require('underscore')
    , moment = require('moment')
    , dirTemplate = path.join(__dirname, 'templates')
    , config = require('../config.json').mail;
    //, Constantes = require('../constantes.js').Constantes;

moment.lang('fr');

var email = nodemailer.createTransport("SMTP", config);

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
var templates = {};
function generateFormTemplate(path, data) {
    if(!templates[path]){
        templates[path] = fs.readFileSync(path, "utf8");
    }
    return _.template(templates[path], data);
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

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.defaultFromAddress, //"footmap@laposte.net", // sender address
            to: user.email, // list of receivers
            subject: "[Inside] Création de votre compte !",
            html: generateFormTemplate(path.join(dirTemplate, 'ajoutUser.html'),{
                "email": user.email,
                "prenom": user.prenom,
                "password": password,
                "url": "https://extranet.inside-groupe.com",
                "color": function () {
                    var arr = ["purple", "red", "green", "yello"];
                    return arr[Math.floor(Math.random() * 3)];
                }
            })

        }
        email.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                if (fn) fn(error);
            } else {
                console.log("Message sent: " + response.message);
                if (fn) fn(null, response.message);
            }
            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
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

        var subject = conges.etat == 2 ? "[Inside] Validation de votre demande d'absence du " : "[Inside] Refus de votre demande d'absence du ";
        if (moment(conges.debut).diff(moment(conges.fin), 'days') != 0) {
            subject += moment(conges.debut).format('D MMMM YYYY') + " au " + moment(conges.fin).format('D MMMM YYYY') + " !";
        }
        else {
            subject += moment(conges.debut).format('D MMMM YYYY') + " !";
        }

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.defaultFromAddress, //"footmap@laposte.net", // sender address
            to: user.email, // list of receivers
            subject: subject,
            html: generateFormTemplate(path.join(dirTemplate, conges.etat == 2 ? 'validationConges.html' : 'refusConges.html'), {
                "email": user.email,
                "prenom": user.prenom,
                "nom": user.nom,
                "debut": moment(conges.debut).format('D MMMM YYYY'),
                "fin": moment(conges.fin).format('D MMMM YYYY'),
                "debutType": conges.debut.getHours() >= 8 ? "après-midi" : "matin",
                "finType": conges.fin.getHours() > 14 ? "soir" : "midi",
                "motif": conges.libelle,
                "duree": conges.duree,
                "refus": conges.refus || "Non communiqué",
                "owner": owner
            })
        }
        email.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                if (fn) fn(error);
            } else {
                console.log("Message sent: " + response.message);
                if (fn) fn(null, response.message);
            }
            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
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

        var subject = "[Inside] Récupération de compte après la perte de votre mot de passe";

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.defaultFromAddress, //"footmap@laposte.net", // sender address
            to: user.email, // list of receivers
            subject: subject,
            html: generateFormTemplate(path.join(dirTemplate, 'passwordLost.html'), {
                "email": user.email,
                "prenom": user.prenom,
                "nom": user.nom,
                "code": key
            })
        }
        email.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                if (fn) fn(error);
            } else {
                console.log("Message sent: " + response.message);
                if (fn) fn(null, response.message);
            }
            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
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

        var subject = "[Inside] Listes des congés à valider.";

        for (var i = 0, l = conges.length; i < l; i++) {
            conges[i].debutType = conges[i].debut.getHours() >= 8 ? "après-midi" : "matin";
            conges[i].finType = conges[i].fin.getHours() > 14 ? "soir" : "midi";

            conges[i].debut = moment(conges[i].debut).format('D MMMM YYYY');
            conges[i].fin = moment(conges[i].fin).format('D MMMM YYYY');
        }

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.defaultFromAddress, //"footmap@laposte.net", // sender address
            to: email_admin, // list of receivers
            subject: subject,
            html: generateFormTemplate(path.join(dirTemplate, 'recapConges.html'), {
                "date": moment(new Date()).format('D MMMM YYYY'),
                "conges": conges,
                "nom": ""
            })
        }
        email.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                if (fn) fn(error);
            } else {
                console.log("Message sent: " + response.message);
                if (fn) fn(null, response.message);
            }
            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
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

        var subject = "[Inside] Demande d'information de " + user + " : " + sujet;

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: config.defaultFromAddress, //"footmap@laposte.net", // sender address
            to: email_admin, // list of receivers
            subject: subject,
            html: generateFormTemplate(path.join(dirTemplate, 'contact.html'), {
                "user": user,
                "sujet": sujet,
                "message": message
            })
        }
        email.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                if (fn) fn(error);
            } else {
                console.log("Message sent: " + response.message);
                if (fn) fn(null, response.message);
            }
            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });
    }
}

exports.Mail = Mail;