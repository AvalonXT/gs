var async = require('async');
var fs = require('fs');
var app = require('../app');

module.exports = function (req, res) {
    var projectId = req.params['id'];
    async.parallel({
        project: function(callback) {
            req.db.get("SELECT * FROM projects WHERE id=$id", {
                $id: projectId
            },function(err, project){
                callback(err, project);
            });
        },
        otherProjects: function(callback) {
            req.db.all("SELECT * FROM projects WHERE id<>$id ORDER BY RANDOM() LIMIT 3", {
                    $id: projectId
            }, function(err, projects) {
                callback(err, projects);
            });
        },
        projectImageExists: function(callback) {
            fs.stat(app.get('uploads-dir') + '/img/proj-' + projectId + '-orig.jpg', function(err, stats) {
                callback(null, stats ? stats.isFile() : false);
            });
        },
        screen1ImageExists: function(callback) {
            fs.stat(app.get('uploads-dir') + '/img/proj-' + projectId + '-screen-1.jpg', function(err, stats) {
                callback(null, stats ? stats.isFile() : false);
            });
        },
        screen2ImageExists: function(callback) {
            fs.stat(app.get('uploads-dir') + '/img/proj-' + projectId + '-screen-2.jpg', function(err, stats) {
                callback(null, stats ? stats.isFile() : false);
            });
        },
        screen3ImageExists: function(callback) {
            fs.stat(app.get('uploads-dir') + '/img/proj-' + projectId + '-screen-3.jpg', function(err, stats) {
                callback(null, stats ? stats.isFile() : false);
            });
        },
        screen4ImageExists: function(callback) {
            fs.stat(app.get('uploads-dir') + '/img/proj-' + projectId + '-screen-4.jpg', function(err, stats) {
                callback(null, stats ? stats.isFile() : false);
            });
        }
    }, function(err, results){
        if (err) throw err;
        res.render('project', {
            screen1ImageExists: results.screen1ImageExists,
            screen2ImageExists: results.screen2ImageExists,
            screen3ImageExists: results.screen3ImageExists,
            screen4ImageExists: results.screen4ImageExists,
            project: results.project,
            projectImageExists: results.projectImageExists,
            otherProjects: results.otherProjects
        });
    });
}
