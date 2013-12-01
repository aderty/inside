var db = require('../data/db'),
    moment = require('moment');

db.events.once('connected', function (result) {
    console.log("TASK 2 : " + new moment().format("DD/MM/YYYY HH:mm"));
    console.log("TASK 2 : Début ré-initialisation des compteurs de congès.");
    db.query("CALL RazCompteurs();", null, function (err, ret) {
        if (err) {
            console.log('TASK 2 : ERROR: ' + err);
            console.log("TASK 2 : Erreur lors de la ré-initialisation des compteurs de congès.");
            process.exit(1);
            return;
        }
        console.log('TASK 2 : Ré-initialisation des compteurs de congès terminé avec succés.');
        process.exit(0);
        return;
    });
});
