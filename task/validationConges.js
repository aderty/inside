var data = require('../data'),
    moment = require('moment'),
    mail = require('../mail'),
    config = require('../config.json');


data.events.once('connected', function (result) {
    console.log("TASK 1 : " + new moment().format("DD/MM/YYYY HH:mm"));
    console.log("TASK 1 : Début envois des congès à valider");
    data.conges.listCongesEtat(1, -1, false, function (err, conges) {
        if (err) {
            console.log('TASK 1 : ERROR: ' + err);
            process.exit(1);
            return;
        }
        if (conges && conges.length) {
            mail.Mail.recapConges(config.admin, conges, function (err, result) {
                if (err) {
                    console.log('TASK 1 : ERROR: ' + err);
                    process.exit(1);
                    return;
                }
                console.log('TASK 1 : Envoie terminé avec succés.');
                process.exit(0);
                return;
            });
        }
        else {
            console.log('TASK 1 : Envoie terminé avec succés (Pas de congès à valider).');
            process.exit(0);
            return;
        }
    });
});
