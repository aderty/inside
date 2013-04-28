
var path = require('path'),
    users = require('./users'),
    conges = require('./conges');

exports.manifest = function (req, res) {
    res.header("Content-Type", "text/cache-manifest");
    res.header('Cache-Control', 'no-cache');
    var ins = fs.createReadStream(path.join(__dirname, '../manifest.manifest'));
    ins.pipe(res);
};

/*
 * GET home page.
 */

exports.index = function (req, res) {
    //res.setHeader('Cache-Control', 'public, max-age=' + 31557600000);
    res.setHeader('Cache-Control', 'no-cache');
    res.render('index', {
        connected: req.session.username ? true : false,
        role: req.session.role ? req.session.role : 0,
        prenom: req.session.prenom
    });
};

exports.partials = function (req, res) {
    var name = req.params.name;
    if (name == "users.html") {
        users.getNextId(function (err, id) {
            res.render('partials/' + name, {
                max: id
            });
        });
        return;
    }
    res.render('partials/' + name);
};

exports.forms = function (req, res) {
    var name = req.params.name;
    res.render('forms/' + name);
};


exports.users = users.routes;
exports.conges = conges.routes;
exports.congesAdmin = conges.routesAdmin;
