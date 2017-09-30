var fs = require('fs');
var gm = require('gm');
var app = require('../app');
var async = require('async');

module.exports.on = function(req, res) {
	if (!req.session.loggedIn) {
		req.session.backUrl = '/editmode';
		res.redirect('/login');
	} else {
		req.session.editMode = true;
		res.redirect('/');
	}
}

module.exports.off = function(req, res) {
	req.session.editMode = false;
	res.redirect('/');
}

module.exports.save = function(req, res) {
	if (!req.session.loggedIn) res.json({status: "error", description: "permission violation"});
	// get id and value, save, return true
	var id = req.body.contentId;
 	var content = req.body.content;
	req.db.run(
		'INSERT OR REPLACE INTO strings (id, value) VALUES ($id, $value)',
		{
			$id: id,
			$value: content
		},
		sqlCallback.bind(null, res)
	);
}

module.exports.saveProject = function(req, res) {
	if (!req.session.loggedIn) res.json({status: "error", description: "permission violation"});
	// key e.g. "project:2.description"
	var key = req.body.contentId;
	var id = parseInt(key.split(':').pop());
    var field = key.split('.').pop();
    var allowedFields = ['title', 'description', 'tags'];
    if (allowedFields.indexOf(field) == -1) throw new Error('Property write access violation: '. field);
 	var content = req.body.content;
	if (id == 0) {
		req.db.run('INSERT INTO projects (title, img) VALUES ($title, "proj-noimage.jpg")', {
			$title: content
		}, function(err) { sqlCallback(res, err, this); });
	} else {
		req.db.run('UPDATE projects SET '+field+'=$content WHERE id=$id', {
			$id: id,
			$content: content
		}, function(err) { sqlCallback(res, err, this); });
	}
}

module.exports.fileUpload = function(req, res) {
	if (!req.session.loggedIn) res.json({status: 'error', description: 'permission violation'});
	var oldPath = req.file.path;
	var id = parseInt(req.body.id);
	var fileName
        = req.body.role == 'cover'
        ? 'proj-'+id+'.jpg'
        : 'proj-'+id+'-'+req.body.role.split('/').pop()+'.jpg'
    ;
    var origFileName
        = req.body.role == 'cover'
        ? 'proj-'+id+'-orig.jpg'
        : 'proj-'+id+'-'+req.body.role.split('/').pop()+'-orig.jpg'
    ;
	var newPath = [app.get('uploads-dir'), '/img/', fileName].join('');
    var origPath = [app.get('uploads-dir'), '/img/', origFileName].join('');
    if (req.body.role != 'cover') {
        // only covers currently need resizing
        // so just move end return
        fs.rename(oldPath, newPath, function(err){
            sqlCallback(res, err, {lastID: id});
        });
        return;
    }
	var im = gm.subClass({ imageMagick: true });
	var width = req.body.role == 'cover' ? 765 : 765;
	var height = req.body.role == 'cover' ? 556 : 459;
	im(oldPath)
	.resize(width, height, '^')
	.gravity('Center')
	.crop(width, height)
	.write(newPath, function (err) {
		if (err) throw err;
		fs.rename(oldPath, origPath, function(){
			if (req.body.role == 'cover') {
				req.db.run('UPDATE projects SET img=$img WHERE id=$id', {
					$img: fileName,
					$id: id
				}, function(err){ sqlCallback(res, err, {lastID: id}) });
			} else {
				sqlCallback(res, err, {lastID: id});
			}
		});
	});
}

module.exports.deleteProject = function (req, res) {
	if (!req.session.loggedIn) res.json({status: 'error', description: 'permission violation'});
	var id = parseInt(req.body.id);
	req.db.run('DELETE FROM projects WHERE id = $id', {
		$id: id
	}, function(err) {
		if (err) throw err;
        async.parallel({
            deleteCover: function(callback) {
                fs.unlink([app.get('uploads-dir'), '/img/proj-', id, '.jpg'].join(''), function() {
                    // ignore unlink error - project may not have image at all
                    callback(null);
                });
            },
            deleteOriginalCover: function(callback) {
                fs.unlink([app.get('uploads-dir'), '/img/proj-', id, '-orig.jpg'].join(''), function() {
                    callback(null);
                });
            }
            //todo: delete screenshots
        }, function(err) {
            res.json({status: "ok"});
        });

	});
	// todo: delete screenshots
}

function sqlCallback(res, err, statement) {
	if (err) {
		console.log(err);
		res.json({status: "error", description: "SQL error"});
	} else {
		if (typeof statement != 'undefined' && statement.lastID) {
			res.json({status:"ok", id:statement.lastID});
		} else {
			res.json({status:"ok"});
		}
	}
}
