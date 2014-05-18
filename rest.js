var express = require('express');
var md = require('mongodb');
var Db = md.Db, Connection = md.Connection, Server = md.Server;

var host = 'localhost';
var port = Connection.DEFAULT_PORT;
var db = new Db('tigerfinder', new Server(host, port));
var tigers;

var app = express();




app.put('/me',function handleMe(req, res, next) {
	// create or update
	//res.json({chg_user: "indeed", id: req.params.id});
	
	var userdata = req.body;

	//change it up
	userdata._id = userdata.main.id;
	delete userdata.main.id;

	if (!tigers.findOne({_id: userdata._id})) {
		tigers.insert(userdata);
	} else {
		tigers.update({_id: userdata._id}, { $addToSet: {
			movies: { $each: userdata.movies },
			music: { $each: userdata.music },
			books: { $each: userdata.books },
			"main.favorite_teams": { $each: userdata.main.favorite_teams },
			"main.education": { $each: userdata.main.education }
		}});
	}
});

app.get('/me/suggestions', function(req, res, next) {
	// get similar users
	tigers.findOne(req.body, function(err, me){
		if (err) throw err;

		// AGGREGATION:
		// 1. mutate data: interests are intersections of sets
		// 2. "reduce" (aka sum) interests
		// 3. sort by number of interests
		// 4. format output
		tigers.aggregate({
			$project: { 
				movies: { $setIntersection: ["$movies", me.movies] },
				music: { $setIntersection: ["$music", me.music] },
				books: { $setIntersection: ["$books", me.books] },
				"main.favorite_teams": { $setIntersection: ["$main.favorite_teams", me.main.favorite_teams] }
			}
		});
		//TODO: aggregation pipeline
		tigers.find({_id: {$ne: me._id},
					$or: [
						{movies: {$in: me.movies}},
						{music: {$in: me.music}},
						{books: {$in: me.books}},
						{"main.favorite_teams": {$in: me.main.favorite_teams}}
					]
		}, function(err, results){
			if (err) throw err;

			results.count(function(err, count) 
				if (count) {


		});


		
				  
				  
				  
	});
	



});


db.open(function(err, db) {
	if (err) throw err;

	db.collection('tigers', function(err, col) {
		if (err) throw err;

		tigers = col;
		app.listen(3000);
	});
});
