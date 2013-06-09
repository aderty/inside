/// <reference path="~/lib/node-vsdoc.js" />

/**
 * Module dependencies.
 */

var config = require('./config.json');

var express = require('express')
  , http = require('http')
  , stylus = require('stylus')
  , routes = require('./routes')
  , history = require('./history')
  , path = require('path')
  , url = require('url')
  , fs = require('fs')
  //, assetManager = require('connect-assetmanager')
  , PORT = process.env.PORT || config.env.PORT;

const parseCookie = require('connect').utils.parseSignedCookies;

var app = module.exports = express();

//DAL.init(config.getConnectionString());

// Configuration

var stylus_compile = function (str, path) {
    return stylus(str)
            .set('filename', path)
            .set('compress', true)
            .include(require('nib').path)
            .include(require('fez').path);
};

/*app.configure('production', function(){
    app.use(minFile);
});*/

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.engine('.html', require('ejs').__express);
    app.set('view engine', 'html');  
    app.use(express.compress());
    app.use(stylus.middleware({
        src: path.join(__dirname, 'styles'),
        dest: path.join(__dirname, 'public'),
        compile: stylus_compile,
        force: true // this forces the css to be regenerated on every pageview
    }));
    app.use(express.static(__dirname + '/public', { maxAge: 0 }));
    //app.use(assetManager(routes.files));
    // Allow parsing cookies from request headers
    this.use(express.cookieParser(config.secret));
    // Session management
    // Internal session data storage engine, this is the default engine embedded with connect.
    // Much more can be found as external modules (Redis, Mongo, Mysql, file...). look at "npm search connect session store"
    this.sessionStore = new express.session.MemoryStore({ reapInterval: 60000 * 10 });
    //this.sessionStore = new MongoStore({url: config.getConnectionString()});

    app.use(express.session({
        secret : config.secret,
        maxAge : new Date(Date.now() + 3600000), //1 Hour
        store  : this.sessionStore
    }));

    app.use(express.bodyParser({uploadDir: __dirname}));
    app.use(express.methodOverride());
    app.use(app.router);
    /*app.use(function(err, req, res, next){
        console.error(err.stack);
        res.send(500, 'Something broke!');
    });*/
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

/** Middleware for limited access */
function minFile(req, res, next) {
    if (req.url.indexOf(".js") > -1 && req.url.indexOf("libs") == -1 ) {
        req.url = req.url.replace('.js','.min.js');
    }
    next();
}


function cookieKeep(req, res, next){
    if(req.signedCookies._id && !req.session.username){
        var cookie = req.signedCookies._id;
        req.session.username = cookie.username;
        req.session.role = cookie.role;
        req.session.prenom = cookie.prenom;
    }
    next();
}

/** Middleware for limited access */
function requireLogin(req, res, next) {
    if (req.session.username) {
        // User is authenticated, let him in
        next();
    } else {
        // Otherwise, we redirect him to login form
        res.redirect("/index");
    }
}

function dataLogin(req, res, next) {
    if (req.session.username) {
        // User is authenticated, let him in
        next();
    } else {
        // Otherwise, we redirect him to login form
        res.send({error: "Il faut être connecté !"});
    }
}

function dataRh(req, res, next) {
    if (req.session.role && req.session.role > 1) {
        // User is authenticated, let him in
        next();
    } else {
        // Otherwise, we redirect him to login form
        res.send({error: "Il faut être Rh !"});
    }
}

function dataSuperAdmin(req, res, next) {
    if (req.session.role && req.session.role == 4) {
        // User is authenticated, let him in
        next();
    } else {
        // Otherwise, we redirect him to login form
        res.send({error: "Il faut être Super Admin !"});
    }
}

function cleanLogin(req, res, next) {
    if (req && req.session) {
        req.session.destroy(function(err){
            res.redirect('/index');
        });
    }
    else{
        res.redirect('/index');
    }
}

//routes.init(app);

// Routes
//app.get("/rdvmap.manifest", routes.manifest);
/** Home page (requires authentication) */

app.get('/', [cookieKeep], routes.index);
app.get('/index', [cookieKeep], routes.index);
app.get('/partials/:name', routes.partials);
app.get('/admin-partials/:name', [dataLogin, dataRh], routes.partials);
app.get('/forms/:name', [dataLogin], routes.forms);

app.get('/logout', routes.users.logout);


 
// Lecture, via GET
app.get('/data-users', [dataLogin, dataRh], routes.users.list);
app.get('/data-users/:id', [dataLogin], routes.users.get);
 
// Mise à jour via POST
//app.post('/data-users/:id', routes.users.update);
 
// Ajout via POST
app.post('/data-users/:id', [dataLogin, dataRh], routes.users.save);
app.post('/data-users', [dataLogin, dataRh], routes.users.save);

app.put('/data-users', [dataLogin], routes.users.password);

// Suppression via POST
app.delete('/data-users/:id', [dataLogin, dataRh], routes.users.remove);

// Lecture, via GET
app.get('/data-conges', [dataLogin], routes.conges.list);
app.get('/data-conges/:id', [dataLogin], routes.conges.get);
// Lectures des motifs de congés
app.get('/data-conges-motifs', [dataLogin], routes.conges.motifs);

 
// Mise à jour via POST
//app.post('/data-users/:id', routes.users.update);
 
// Ajout via POST
app.post('/data-conges/:id', [dataLogin], routes.conges.save);
app.post('/data-conges', [dataLogin], routes.conges.save);

// Suppression via POST
app.delete('/data-conges/:id', [dataLogin], routes.conges.remove);




// Lecture, via GET
app.get('/data-admin-conges', [dataLogin, dataRh], routes.congesAdmin.list);
app.get('/data-admin-conges/:id', [dataLogin, dataRh], routes.congesAdmin.get);
 
// Mise à jour via POST
//app.post('/data-users/:id', routes.users.update);
 
// Ajout via POST
app.post('/data-admin-conges/:id', [dataLogin, dataRh], routes.congesAdmin.save);
app.post('/data-admin-conges', [dataLogin, dataRh], routes.congesAdmin.save);

// Suppression via POST
app.delete('/data-admin-conges/:id', [dataLogin, dataRh], routes.congesAdmin.remove);


// ACTIVITE
// Lecture, via GET
app.get('/data-activite', [dataLogin], routes.activite.get);
 
// Ajout via POST
app.post('/data-activite/:id', [dataLogin], routes.activite.save);
app.post('/data-activite', [dataLogin], routes.activite.save);

// Suppression via POST
app.delete('/data-admin-activite', [dataLogin, dataSuperAdmin], routes.activiteAdmin.remove);

app.get('/data-admin-activite', [dataLogin, dataSuperAdmin], routes.activiteAdmin.list);
app.get('/data-admin-activite/:id', [dataLogin, dataSuperAdmin], routes.activiteAdmin.get);
// Ajout via POST
app.post('/data-admin-activite/:id', [dataLogin, dataSuperAdmin], routes.activiteAdmin.save);
app.post('/data-admin-activite', [dataLogin, dataSuperAdmin], routes.activiteAdmin.save);

app.post('/data-history', [dataLogin, dataSuperAdmin], history.routes.list);

app.post('/contact', [dataLogin], routes.users.contact);

app.post('/login', routes.users.login);
app.put('/passwordLost', routes.users.passwordLost);
app.post('/passwordLost', routes.users.passwordLostValid);

// redirect all others to the index (HTML5 history)
app.get('*', [requireLogin], routes.index);

if (!module.parent) {
    app.listen(PORT);
    console.log('Server running at http://127.0.0.1:' + PORT);
}

process.on('uncaughtException', function (exception) {
    //exception.response.writeHead(exception.code, {'Content-Type': 'text/html'});
    //exception.response.end('Error ' + exception.code + ' - ' + exception.message);
});