var config = require('../config.json'),
    data = require('../data'),
    url = require('url'),
    redis = require('redis'),    
    redisUrl = url.parse(config.redis || "redis://redis:@127.0.0.1:6379"),
    redisAuth = redisUrl.auth.split(':'),
    mail = require('../mail'),
    uuid = require('node-uuid'),
    history = require('../history').history,
    config = require('../config.json');

redisClient = redis.createClient(redisUrl.port, redisUrl.hostname);
redisClient.auth(redisAuth[1], function(err){
    if(err) console.log("REDIS : Error " + err);
});

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });
var redisReady = false;
redisClient.on("error", function (err) {
        console.log("REDIS : Error " + err);
});
redisClient.on("connect", function (err) {
        console.log("REDIS : Connected to redis ");
        redisReady = true;
});

//var listLostPasswordKeys = {};

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
    req.session.username = user.id; // Utilisé partout
    req.session.role = user.role; // Utilisé pour la vérification des droits
    req.session.prenom = user.prenom; // Utilisé pour le mail de la validation congés
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
    login: function(req, res) {
        data.users.login(req.body.email, req.body.pwd, function(err, user) {
            if (user) {
                setSession(req, user);
                if (req.body.options && req.body.options.keep) {
                    setCookie(res, user);
                }
            }
            dataCallback(res)(err, user);
        });
    },
    logout: function(req, res) {
        removeCookie(res);
        if (req && req.session) {
            req.session.destroy(function(err) {
                res.redirect('/index');
            });
            return;
        }
        res.redirect('/index');
    },
    // Lecture, via GET
    list: function(req, res) {
        res.header('Cache-Control', 'no-cache');
        if (req.query.search) {
            return data.users.search({ type: req.query.type, search: req.query.search }, dataCallback(res));
        }
        data.users.listUsers(dataCallback(res));
    },

    get: function(req, res) {
        res.header('Cache-Control', 'no-cache');
        data.users.getUser(req.session.username, dataCallback(res));
    },

    // Ajout ou Mise à jour via POST
    save: function(req, res) {
        var user = req.body;
        var pwd = user.pwd;
        data.users.saveUser(user, function(err, ret) {
            if (!err && ret.create) {
                mail.Mail.ajoutUser(user, pwd, function(err) {
                });
            }
            if (ret.create) {
                history.log(user.id, "[Admin " + req.session.username + "] Création de l'utilisateur " + JSON.stringify(user));
            }
            else {
                history.log(user.id, "[Admin " + req.session.username + "] Modification de l'utilisateur " + JSON.stringify(user));
            }
            dataCallback(res)(err, ret);
        });
    },
    password: function(req, res) {
        data.users.passwordTest(req.session.username, req.body.oldPwd, function (err, ret) {
            if (err) {
                return dataCallback(res)(err);
            }
            data.users.passwordUpdate(req.session.username, req.body.pwd, dataCallback(res));
        });
    },
    // Ajout via POST
    /*add: function (req, res) {
    data.users.insertUser(req.body, dataCallback(res));
    },*/

    remove: function(req, res) {
        data.users.removeUser(req.params.id, dataCallback(res));
        history.log(req.params.id, "[Admin " + req.session.username + "] Suppression de l'utilisateur " + req.params.id);
    },
    passwordLost: function(req, res) {
        if (!req.body.email) {
            return dataCallback(res)("Pas d'email renseigné.");
        }
        var key = uuid.v4();
        data.users.getUser(req.body.email, function(err, user) {
            if (err) {
                return dataCallback(res)(err);
            }
            //listLostPasswordKeys[key] = req.body.email;
            redisClient.set(key, req.body.email);
            redisClient.expire(key, 480);
            
            mail.Mail.passwordLost(user, key);
            dataCallback(res)(null, { success: true });
        });
    },
    passwordLostValid: function(req, res) {
        if (!req.body.email) {
            return dataCallback(res)("Pas d'email renseigné.");
        }
        if (!req.body.key) {
            return dataCallback(res)("Pas de code renseigné.");
        }

        /*if (!listLostPasswordKeys[req.body.key] || listLostPasswordKeys[req.body.key] != req.body.email) {
            return dataCallback(res)("Le code saisi est incorrect.");
        }*/

        redisClient.get(req.body.key, function(err, email) {
            // reply is null when the key is missing
            if (!email || email != req.body.email) {
                return dataCallback(res)("Le code saisi est incorrect.");
            }
            data.users.getUser(req.body.email, function (err, user) {
                //delete listLostPasswordKeys[req.body.key];
                redisClient.del(req.body.key);
                if (err) {
                    return dataCallback(res)(err);
                }
                data.users.passwordUpdate(user.id, req.body.pwd, function (err, ret) {
                    if (err) {
                        return dataCallback(res)(err);
                    }
                    data.users.infos(user.id, user.role, function (err, infos) {
                        if (err) {
                            return dataCallback(res)(err);
                        }
                        user.infos = infos;
                        return dataCallback(res)(null, user);
                    });
                });
            });
        });
    },
    contact: function(req, res) {
        if (!req.body.sujet) {
            return dataCallback(res)("Pas de sujet.");
        }
        if (!req.body.message) {
            return dataCallback(res)("Pas de message.");
        }
        data.users.getUser(req.session.username, function(err, user) {
            if (err) {
                return dataCallback(res)(err);
            }
            mail.Mail.contact(config.admin, user.prenom + " " + user.nom, req.body.sujet, req.body.message, function (err, ret) {
                if (err) return console.log(err);
                history.log(req.session.username, "Demande d'information " + req.body.sujet + ", message : " + req.body.message);
            });
            dataCallback(res)(null, { success: true });
        });
    }
};
exports.routes = routes;
exports.setUser = function (req, res, user) {
    setSession(req, user);
    setCookie(res, user);
}
exports.infos = function (req, res, fn) {
    if (!req.session || req.session.username == undefined) {
        return fn(null, {});
    }
    data.users.infos(req.session.username, req.session.role, function (err, infos) {
        if (infos && infos.roleChanged) {
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
