var async = require('async'),
    data = require('../data'),
    db = require('../data/db'),
    moment = require('moment'),
    mail = require('../mail'),
    config = require('../config.json');

data.events.once('connected', function (result) {
    console.log("TASK 1 : " + new moment().format("DD/MM/YYYY HH:mm"));
    console.log("TASK 1 : Début envois des congès à valider");
    var toExec = [];
    toExec.push(doRecapConges(-1, config.admin));

    db.query("SELECT DISTINCT userAdmin.id, userAdmin.email FROM users As users1 JOIN users AS userAdmin ON users1.admin = userAdmin.id JOIN conges ON conges.user = users1.id WHERE conges.etat = 1;", function(err, result){
        if (err) {
            console.log('TASK 1 : ERROR: ' + err);
            return;
        }
        var i = 0, l = result.length;
        for(;i<l;i++){
            toExec.push(doRecapConges(result[i].id, result[i].email));
        }
        async.series(toExec, function(err, results){
            // results is now equal to ['one', 'two']
            process.exit(0);
        });
    }); 
});

function doRecapConges(admin, email){
    return function(callback){
        data.conges.listCongesEtat(1, admin, false, function (err, conges) {
            if (err) {
                console.log('TASK 1 : ERROR: ' + err);
                //process.exit(1);
                if(callback) callback(err);
                return;
            }
            if (conges && conges.length) {
                mail.Mail.recapConges(email, conges, function (err, result) {
                    if (err) {
                        console.log('TASK 1 : ERROR: ' + err);
                        //process.exit(1);
                        if(callback) callback(err);
                        return;
                    }
                    console.log('TASK 1 : Envoie terminé avec succés.');
                    //process.exit(0);
                    if(callback) callback(null, true);
                    return;
                });
            }
            else {
                console.log('TASK 1 : Envoie terminé avec succés (Pas de congès à valider).');
                //process.exit(0);
                if(callback) callback(null, true);
                return;
            }
        });
    }
}