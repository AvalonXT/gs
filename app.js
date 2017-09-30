#!/bin/env node

var express = require('express');
var nunjucks = require('nunjucks');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer  = require('multer');
var fs = require('fs');

var upload = multer({ dest: __dirname + '/var/tmp-uploads' });

var app = module.exports = express();

// first lookup static files (e.g. uploaded images) in openshift persistent directory
if (process.env.OPENSHIFT_DATA_DIR) app.use(express.static(process.env.OPENSHIFT_DATA_DIR));
app.use(express.static('public'));
app.set('uploads-dir', process.env.OPENSHIFT_DATA_DIR || __dirname + '/public');

app.use(bodyParser.urlencoded({ extended: false }));

var env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});
app.set('view engine', 'html');

app.use(function (req, res, next) {
    var sqlite3 = require('sqlite3').verbose();
    var dbDir = process.env.OPENSHIFT_DATA_DIR || (__dirname + '/');
    req.db = new sqlite3.Database(dbDir + 'storage2.db3');
    next();
});

app.use(session({
    secret: 'gAm3Space',
    resave: false,
    saveUninitialized: false
}));
app.use(function (req, res, next) {
  env.addGlobal('loggedIn', req.session.loggedIn);
  env.addGlobal('editMode', req.session.editMode);
  env.addGlobal('enableEditMode', req.session.loggedIn && req.session.editMode);
  // get strings from DB and put to global "strings" value
  req.db.all('SELECT * FROM strings', function(err, rows) {
      if (err) throw err;
      var strings = rows.reduce(function(previousValue, currentValue) {
          var idParts = currentValue.id.split('.');
          idParts.reduce(function(outputArray, idPart, idx) {
              if (idx == idParts.length-1) {
                  outputArray[idPart] = currentValue.value;
              } else if (typeof outputArray[idPart] == 'undefined') {
                  outputArray[idPart] = {};
              }
              return outputArray[idPart];
          }, previousValue);
          return previousValue;
      }, {});
      env.addGlobal('strings', strings);
      env.addGlobal('thisYear', new Date().getFullYear());
      app.set('strings', strings);
      next();
  });
});
app.set('admin-login', 'admin');
app.set('admin-password', 'm1ghtyMe');
app.set('mailgun-api-key', 'key-3vxlqwjpfpxtlsjhpqcdqhvgharz9nk5');
app.set('contact-form-sender', 'gs-studio@gs-studio.eu');

app.get('/', require('./controllers/home'));
app.get('/project/:id(\\d+)', require('./controllers/project'));
app.get('/sayhello', require('./controllers/sayhello').show);
app.post('/sayhello', require('./controllers/sayhello').send);

app.get('/editmode', require('./controllers/editmode').on);
app.get('/noeditmode', require('./controllers/editmode').off);
app.post('/editmode/save', require('./controllers/editmode').save);
app.post('/editmode/save-project', require('./controllers/editmode').saveProject);
app.post('/editmode/file-upload', upload.single('file'), require('./controllers/editmode').fileUpload);
app.post('/editmode/delete-project', require('./controllers/editmode').deleteProject);

app.get('/login', require('./controllers/auth').loginForm);
app.post('/login', require('./controllers/auth').loginForm);
app.get('/logout', require('./controllers/auth').logout);
app.get('/change-password', require('./controllers/auth').changePasswordScreen);
app.post('/change-password', require('./controllers/auth').changePassword);

(function() {
    var passwordFileDir = process.env.OPENSHIFT_DATA_DIR || __dirname;
    var passwordFile = passwordFileDir + '/' + '.pwd';

    app.locals.getAdminPassword = function() {
        var passwordFileContents = false;
        try {
            passwordFileContents = fs.readFileSync(passwordFile, 'utf8');
        } catch (e) {};
        return passwordFileContents ? passwordFileContents : app.get('admin-password');
    }

    app.locals.setAdminPassword = function(password) {
        fs.writeFile(passwordFile, password, 'utf8');
    }
})();

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000, process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
