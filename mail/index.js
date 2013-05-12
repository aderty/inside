var path = require('path')
    , email = require("mailer")
    , dirTemplate = path.join(__dirname, 'templates');
    //, Constantes = require('../constantes.js').Constantes;

var config = require('../config.json').mail;

var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var Mail = {
    ajoutUser: function (user, password, fn) {
        return fn(null);
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
            subject: "Création de votre compte extranet InsideConsulting !",
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
    }
}

exports.Mail = Mail;