var Mailgun = require('mailgun').Mailgun;
var app = require('../app');
var mg = new Mailgun(app.get('mailgun-api-key'));

module.exports.show = function(req, res) {
    res.render('sayhello', {
        sentOk: req.query.res == 'ok',
        sentError: req.query.res == 'error'
    });
}

module.exports.send = function(req, res) {
    req.body.login
    mg.sendText(app.get('contact-form-sender'), [app.get('strings').sayhello.email],
        'Contact form submitted at gs-studio.eu',
        'From: ' + req.body.name + ' ' + req.body.email
        +'\nSubject: ' + req.body.subject
        +'\n\n' + req.body.message,
        'noreply@example.com', {},
        function(err) {
            if (err) console.log(err);
            var status = err ? 'error' : 'ok';
            res.redirect('/sayhello?res=' + status);
        });
}
