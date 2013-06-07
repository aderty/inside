var db = require('./db')
, connectedDb = false;

db.events.once('connected', function(result) {
    connectedDb = true;
});

var data = {
    log: function(user, log, fn) {
        var histo = {
            user: user,
            log: log
        };
        db.insert("history", histo, function(err, ret) {
            if (err) {
                console.log('ERROR: ' + err);
                return fn("Erreur lors de l'insertion du log " + log);
            }
            fn(null, ret);
        });
    },
    get: function(user, options, fn) {
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