var db = require('../data/db'),
    moment = require('moment');

db.events.once('connected', function (result) {
    console.log("TASK 4 : " + new moment().format("DD/MM/YYYY HH:mm"));
    console.log("TASK 4 : Début du calcul des congès acquis en CP et RTT.");
    db.query("CALL CalculCongesAcquis();", null, function (err, ret) {
        if (err) {
            console.log('TASK 4 : ERROR: ' + err);
            console.log("TASK 4 : Erreur lors du calcul des congès acquis en CP et RTT.");
            process.exit(1);
            return;
        }
        console.log('TASK 4 : Calcul des congès acquis en CP et RTT terminé avec succés.');
        process.exit(0);
        return;
    });
});
