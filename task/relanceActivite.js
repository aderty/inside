var async = require('async'),
    data = require('../data'),
    db = require('../data/db'),
    moment = require('moment'),
    mail = require('../mail'),
    config = require('../config.json');

data.events.once('connected', function (result) {
    console.log("TASK 5 : " + new moment().format("DD/MM/YYYY HH:mm"));
    console.log("TASK 5 : Début envois mails de relance de saisie de l'activité");
    var now = new moment(),
    annee = now.year(),
    mois = now.month() + 1,
    values = [annee, mois, annee, annee, mois];

    var query = "SELECT users.id, users.nom, users.prenom,users.email FROM users WHERE users.id <> 0 AND users.id <> 999999 AND users.id <> 111111 AND users.etat = 1 " +
                    " AND ((YEAR(users.debutActivite) = ? AND MONTH(users.debutActivite) <= ?) OR YEAR(users.debutActivite) < ?) " +
                    " AND (users.finActivite is null or period_diff(date_format(current_timestamp, '%Y%m'), date_format(users.finActivite, '%Y%m')) <= 0) " +
                    " AND users.id NOT IN(SELECT activite.user FROM activite WHERE YEAR(activite.mois) = ? AND MONTH(activite.mois) = ?) ";

    db.query(query, values, function(err, ret) {
            if (err) {
                console.log( 'TASK 5 : ERROR: ' + err );
                process.exit(1);
                return;
            }
            if (ret && ret.length) {
                var i = 0, l = ret.length, toExec = [];
                for(;i<l;i++){
                    toExec.push(doRelanceActivite(ret[i].email, annee, now.format('MMMM'), ret[i].prenom));
                }
                async.series(toExec, function(err, results){
                    if (err) {
                        console.log('TASK 5 : ERROR: ' + err);
                        process.exit(1);
                        return;
                    }
                    console.log('TASK 5 : Tous les envoies terminés avec succés.');
                    process.exit(0);
                });
            }
            else {
                console.log('TASK 5 : Envoie terminé avec succés (Pas de relance à effectuer).');
                process.exit(0);
            }
            
    });
});

function doRelanceActivite(email, annee, mois, prenom){
    return function(callback){
        mail.Mail.relanceActivite(email, annee, mois, prenom, function (err, result) {
                    if (err) {
                        console.log('TASK 5 : ERROR: ' + err);
                        //process.exit(1);
                        if(callback) callback(err);
                        return;
                    }
                    console.log('TASK 5 : Envoie terminé avec succés.');
                    //process.exit(0);
                    if(callback) callback(null, true);
                    return;
        });
    }
}