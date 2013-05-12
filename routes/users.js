var data = require('../data'),
    mail = require('../mail');

/// Routes
function dataCallback(res) {
    return function (err, data) {
        if (err) {
            res.send({ error: err });
        } else {
            // Il serait intéressant de fournir une réponse plus lisible en
            // cas de mise à jour ou d'insertion...
            res.send(data);
        }
    }
}

function setSession(req, user) {
    req.session.username = user.id;
    req.session.role = user.role;
    req.session.prenom = user.prenom;
}

function setCookie(res, user) {
    res.cookie('_id', {
        username: user.id,
        role: user.role,
        prenom: user.prenom
    }, { expires: new Date(new Date().getTime() + 31539285000), path: '/', signed: true });
}

function removeCookie(res) {
    res.clearCookie('_id');
}

var routes = {
    login: function (req, res) {
        data.users.login(req.body.email, req.body.pwd, function (err, user) {
            if (user) {
                setSession(req, user);
                if (req.body.options && req.body.options.keep) {
                    setCookie(res, user);
                }
            }
            dataCallback(res)(err, user);
        });
    },
    logout: function (req, res) {
        removeCookie(res);
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
        if (req.query.search) {
            return data.users.search({ type: req.query.type, search: req.query.search }, dataCallback(res));
        }
        data.users.listUsers(dataCallback(res));
    },

    get: function (req, res) {
        res.header('Cache-Control', 'no-cache');
        data.users.getUser(req.session.username, dataCallback(res));
    },

    // Ajout ou Mise à jour via POST
    save: function (req, res) {
        var user = req.body;
        var pwd = user.pwd;
        data.users.saveUser(user, function (err, ret) {
            if (!err && ret.create) {
                mail.Mail.ajoutUser(user, pwd, function (err) {
                });
            }
            dataCallback(res)(err, ret);
        });
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
exports.setUser = function (req, res, user) {
    setSession(req, user);
    setCookie(res, user);
}
exports.infos = function (req, res, fn) {
    if (!req.session || !req.session.username) {
        return fn(null, {});
    }
    data.users.infos(req.session.username, req.session.role, function (err, infos) {
        if (infos.roleChanged) {
            exports.setUser(req, res, {
                id: req.session.username,
                role: parseInt(infos.roleChanged),
                prenom: req.session.prenom
            });
        }
        fn(err, infos);
    });
}
exports.getNextId = function (fn) {
    data.users.getNextId(fn);
}
