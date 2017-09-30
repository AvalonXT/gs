var async = require('async');

module.exports = function (req, res) {
    async.waterfall([
        function(callback) {
            req.db.all("SELECT * FROM projects", function(err, projects) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, projects);
            });
        },
        function(projects, callback) {
            var templateData = {};
            if (req.session.editMode && req.session.loggedIn) projects.push({id:0, 'title':'Name your project', img: 'proj-0.jpg', description: ''});
			templateData['portfolioRows'] = getPortfolioRows(projects, 3);
            callback(null, templateData);
        }
    ], function(err, templateData) {
        if (err) console.log('err:', err);
        res.render('home', templateData || {});
    });
}

function getPortfolioRows(projects, projectsByRow) {
	var portfolioRows = [];
	var rowIdx = 0;
	projects.forEach(function(project){
		if (typeof portfolioRows[rowIdx] == 'undefined') portfolioRows[rowIdx] = [];
		if (portfolioRows[rowIdx].length >= projectsByRow) {
            rowIdx++;
            portfolioRows[rowIdx] = [];
        }
		portfolioRows[rowIdx].push(project);
	});
	return portfolioRows;
}
