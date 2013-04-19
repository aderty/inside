var data = require('../data');

/// Routes
function dataCallback(res) {
    return function(err, data) {
        if (err) {
            res.send({error : err});
        } else {
            // Il serait intéressant de fournir une réponse plus lisible en
            // cas de mise à jour ou d'insertion...
            res.send(data);
        }
    }
}

var routes = {
    login: function (req, res) {
        data.users.login(req.body.email, req.body.pwd, function (err, ret) {
            if (ret) {
                req.session.username = ret.id;
                req.session.prenom = ret.prenom;
            }
            dataCallback(res)(err, ret);
        });
    },
    logout: function (req, res) {
        if (req && req.session) {
            req.session.destroy(function (err) {
                res.redirect('/index');
            });
            return;
        }
        res.redirect('/index');
    },
// Lecture, via GET
list: function (req, res) {
        res.header('Cache-Control', 'no-cache');
    data.users.listUsers(dataCallback(res));
},

get: function (req, res) {
        res.header('Cache-Control', 'no-cache');
    data.users.getUser(req.params.id, dataCallback(res));
},

// Ajout ou Mise à jour via POST
save: function (req, res) {
    data.users.saveUser(req.body, dataCallback(res));
},

// Ajout via POST
/*add: function (req, res) {
    data.users.insertUser(req.body, dataCallback(res));
},*/

remove: function (req, res) {
    data.users.removeUser(req.params.id, dataCallback(res));
}
};
exports.routes = routes;