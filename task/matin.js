var data = require('../data'),
    mail = require('../mail'),
    config = require('../config.json');


data.events.once('connected', function (result) {
    console.log("connected to MySQL");
    data.conges.listCongesEtat(1, false, function (err, conges) {
        if (err) {
            console.log('ERROR: ' + err);
            return;
        }
        mail.Mail.recapConges(config.admin, conges, function (err, result) {
            if (err) {
                console.log('ERROR: ' + err); return;
            }
            console.log('Envoie terminé avec succés.');
            return;
        });
    });
});
