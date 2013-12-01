var data = require('../data'),
    mail = require('../mail'),
    config = require('../config.json');


data.events.once('connected', function (result) {
    console.log("TASK 1 : Début envois des congès à valider");
    data.conges.listCongesEtat(1, -1, false, function (err, conges) {
        if (err) {
            console.log('TASK 1 : ERROR: ' + err);
            process.exit(1);
            return;
        }
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
    });
});
