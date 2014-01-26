var db = require('./db')
, connectedDb = false;

db.events.once('connected', function(result) {
    connectedDb = true;
});

var data = {
    log: function(req, user, log, fn) {
        var histo = {
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            user: user,
            log: log
        };
        db.insert("history", histo, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                if (fn) fn("Erreur lors de l'insertion du log " + log);
                return;
            }
            if(fn) fn(null, ret);
        });
    },
    list: function (user, options, fn) {
        var query, values;
        if (!options) {
            query = "SELECT * FROM history WHERE user = ? ORDER BY date";
            values = [user];
        }
        else {
            query = "SELECT * FROM history WHERE user = ? AND DATE >= ? AND date <= ? ORDER BY date";
            values = [user, options.start, options.end];
        }
        db.query(query, values, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de l'insertion du log " + log);
            }
            fn(null, ret);
        });
    }
};
exports.data = data;