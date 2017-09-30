var async = require('async');
var app = require('../app');

module.exports.loginForm = function (req, res) {
	if (
		req.body.login == app.get('admin-login')
		&& req.body.password == app.locals.getAdminPassword()
	) {
		req.session.loggedIn = true;
		res.redirect(req.session.backUrl ? req.session.backUrl : '/');
	} else {
		res.render('login-form', req.body);
	}
}

module.exports.logout = function(req, res) {
	req.session.loggedIn = false;
	res.redirect('/');
}


module.exports.changePasswordScreen = function(req, res) {
	if (!req.session.loggedIn) {
		res.status(401);
		return res.render('permission-denied');
	}
	var data = {
		wrongPassword: req.query.err == 'wrongpw',
		passwordsDoNotMatch: req.query.err == 'nomatch',
		changedOk: req.query.ok == 1
	};

	res.render('change-password', data);
}

module.exports.changePassword = function(req, res) {
    if (!req.session.loggedIn) {
        res.status(401);
        return res.render('permission-denied');
    }
    if (req.body.currentPassword != app.locals.getAdminPassword()) {
        return res.redirect('/change-password?err=wrongpw');
    }
    if (req.body.newPassword != req.body.newPassword2) {
        return res.redirect('/change-password?err=nomatch');
    }
	app.locals.setAdminPassword(req.body.newPassword);
    return res.redirect('/change-password?ok=1');
}
