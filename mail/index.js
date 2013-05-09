var path = require('path')
    , email = require("mailer")
    , dirTemplate = path.join(__dirname, 'templates');
    //, Constantes = require('../constantes.js').Constantes;

var opts = {
    //host: "smtp.laposte.net",
    host: "smtp.free.fr",
        port: "25",
        ssl: false,
        /*authentication: 'login',
        username: "footmap",
        password: "infomilf00t",*/
        domain: 'localhost'
    };

var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var Mail = {
    ajoutUser: function (user, fn) {
        return fn(null);
        if (!user) return fn("Utilisateur invalide");
        if (!re.test(user.email)) {
            return fn("Email utilisateur invalide");
        }
        console.log("envois de l'email à : " + user.email);

        email.send({
            host: opts.host,              // smtp server hostname
            port: opts.port,                     // smtp server port
            ssl: opts.ssl,                        // for SSL support - REQUIRES NODE v0.3.x OR HIGHER
            domain: opts.domain,            // domain used by client to identify itself to server
            authentication: opts.authentication,
            username: opts.username, //(new Buffer("usernamet")).toString("base64"),
            password: opts.password, //(new Buffer("password")).toString("base64"),
            to: user.email,
            from: "no-reply@insideconsulting.fr",
            subject: "Création de votre compte extranet InsideConsulting !",
            //body: "Hello! This is a test of the node_mailer."
            template: path.join(dirTemplate, 'ajoutUser.html'),   // path to template name
            data: {
                "user": user,
                "color": function () {
                    var arr = ["purple", "red", "green", "yello"];
                    return arr[Math.floor(Math.random() * 3)];
                }
            }
        },
        function (err, result) {
            console.log("err " + err);
            if (err) { console.log(err); }
            if (fn) fn(err);
        });
    }
}

exports.Mail = Mail;