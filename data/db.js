﻿// On utilise le module node-mysql
var mysql = require('mysql'),
config = require('../config.json').db;
config.multipleStatements = true;
config.checkInterval = 5000;

// Module natif filesystem pour lire le fichier de configuration
var fs = require('fs');

var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();

var connectionState = false, first = true;
var client = mysql.createConnection(config);

function attemptConnection() {
    if (!connectionState) {
        // On initialise un nouveau client qui exécutera nos requêtes, en lui passant
        // l'objet config précédemment initialisé.
        client = mysql.createConnection(config);
        client.connect(function(err) {
            // connected! (unless `err` is set)
            if (err) {
                console.error('mysql db unable to connect: ' + err);
                connectionState = false;
            } else {
                console.info('mysql connect!');
                connectionState = true;
                // -> Transmission de l'event "connected"
                events.emit('connected', null);
            }
        });
        client.on('close', function(err) {
            console.error('mysqldb conn close');
            connectionState = false;
        });
        client.on('error', function(err) {
            console.error('mysqldb error: ' + err);
            connectionState = false;

            /*
            if (!err.fatal) {
            return;
            }
            if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
            }
            console.log('Re-connecting lost connection: ' + err.stack);
            */
        });
    }
}
attemptConnection();

var dbConnChecker = setInterval(function() {
    if (!connectionState) {
        console.info('not connected, attempting reconnect');
        attemptConnection();
    }
}, config.checkInterval);

// Nous déclarons quelques fonctions utilitaires
function hashToClause(hash, separator) {
    var result = '';
    var values = [];
    var first = true;
    for (var key in hash) {
        result += (first ? '' : separator) + key + ' = ?';
        values.push(hash[key]);
        first = false;
    }
    return { clause: result, values: values };
}

// Nous pouvons à présent écrire les fonctions CRUD qui seront exposées par
// le module

// L'insertion prend en paramètres
// - le nom de la table
// - Un hash ayant pour clés les noms de colonnes, pour valeurs les valeurs
// associées respectives
// - Un callback (optionnel) au format function(err, data)
function insert(table, values, callback) {
    // On construit la requête dynamiquement
    var q = 'INSERT INTO ' + table + ' SET ';
    var clause = hashToClause(values, ', ');
    q += clause.clause + ';';
    // On envoie la reqûete avec le callback fourni.
    // Les paramètres dans clause.values sont automatiquement échappés.
    callQuery(q, clause.values, callback);
}

// La suppression prend en paramètres :
// - La table sur laquelle elle est effectuée
// - Un hash ayant pour clés les colonnes contraintes, pour valeurs les
// contraintes. Les différentes contraintes sont des égalitées liées par des
// 'AND'.
function remove(table, where, callback) {
    var q = 'DELETE FROM ' + table + ' WHERE ';
    var clause = hashToClause(where, ' AND ');
    q += clause.clause;
    callQuery(q, clause.values, callback);
}

// La lecture prend les mêmes paramètres que la suppression à l'exception
// du troisième qui précise les colonnes qui sont ramenées dans un tableau.
// si le paramètre est null, on exécute un SELECT *
function read(table, where, columns, callback) {
    var columnsClause = (columns ? columns.join(', ') : '*');
    var q = 'SELECT ' + columnsClause + ' FROM ' + table;
    if (where) {
        var clause = hashToClause(where, ' AND ');
        q += ' WHERE ' + clause.clause;
    }
    callQuery(q, (where ? clause.values : callback), callback);
}

// la mise à jour prend les paramètres suivants :
// - table
// - hash where (identique read, delete)
// - hash values (identique insert)
// - callback
function update(table, where, values, callback) {
    var whereClause = hashToClause(where, ' AND ');
    var valuesClause = hashToClause(values, ' , ');
    var q = 'UPDATE ' + table + ' SET ' + valuesClause.clause + ' WHERE ' +
        whereClause.clause + ';';
    var inputs = valuesClause.values.concat(whereClause.values);
    callQuery(q, inputs, callback);
}

// On expose maintenant les méthodes au travers de l'objet exports
exports.insert = insert;
exports.remove = remove;
exports.read = read;
exports.update = update;
exports.escape = escape;

// On peut simplifier les opérations courantes (liste, modification via
// l'id, etc.) avec les fonctions suivantes.
exports.updateById = function (table, id, values, callback) {
    update(table, { 'id': id }, values, callback);
}

exports.find = function (table, id, callback) {
    read(table, { 'id': id }, null, callback);
}

exports.removeById = function (table, id, callback) {
    remove(table, { 'id': id }, callback);
}

exports.findAll = function (table, where, callback) {
    read(table, where, null, callback);
}

// Dans certains cas les méthodes CRUD simples ne suffisent pas à obtenir le
// résultat escompté. On donne donc accès à la méthode query pour pouvoir
// utiliser du SQL directement si besoin est.
exports.query = function(query, values, callback) {
    return callQuery(query, values, callback);
}

var callQuery = function(query, values, callback) {
    if (!connectionState) {
        // Si la fonction callback se trouve en second argument    
        if (callback == undefined && typeof values == "function") {
            callback = values;
        }
        if (callback) {
            callback("Problème de connection à la base de données");
        }
        return;
    }
    return client.query(query, values, callback);
};

exports.events = events;