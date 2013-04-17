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

// Lecture, via GET
list: function (req, res) {
    data.users.listUsers(dataCallback(res));
},

get: function (req, res) {
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