
var path = require('path');

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
    res.setHeader('Cache-Control', 'public, max-age=' + 31557600000);
    res.render('index');
};

exports.partials = function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};