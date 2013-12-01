var db = require('../data/db');

db.events.once('connected', function (result) {
    console.log("TASK 3 : Début du transfert des CP anticipés vers CP.");
    db.query("CALL TransfertCP();", null, function (err, ret) {
        if (err) {
            console.log('TASK 3 : ERROR: ' + err);
            console.log("TASK 3 : Erreur lors du transfert des CP anticipés vers CP.");
            process.exit(1);
            return;
        }
        console.log('TASK 3 : Transfert des CP anticipés vers CP terminé avec succés.');
        process.exit(0);
        return;
    });
});
