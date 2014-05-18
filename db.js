var md = require('mongodb');
var Db = md.Db, Connection = md.Connection, Server = md.Server;
//var MC = md.MongoClient;

var host = 'localhost';
var port = Connection.DEFAULT_PORT;
var db = new Db('tigerfinder', new Server(host, port));
var tigers;

db.open(function(err, db) {
	if (err) throw err;

	db.collection('tigers', function(err, col) {
		if (err) throw err;

		tigers = col;

		main();
	});
});

function main() {
	if (require.main === module) {
		if (process.argv.length > 2) {
			switch (process.argv[2]) {
				case 'ag': {
					ag();
					break;
				}
			}
		}
	}
}

var dingus;
function ag() {
	tigers.findOne({_id: 11}, function(err, me){
		if (err) throw err;

		// AGGREGATION:
		// 1. mutate data: interests are intersections of sets
		// 2. "reduce" (aka sum) interests
		// 3. sort by number of interests
		// 4. format output
		tigers.aggregate([
			{ $project: { 
				movies: { $setIntersection: ["$movies", me.movies] },
				music: { $setIntersection: ["$music", me.music] },
				books: { $setIntersection: ["$books", me.books] },
				favorite_teams: { $setIntersection: ["$main.favorite_teams", me.main.favorite_teams] }
			}},
			{ $group: {
				_id: "$_id",
				movies: "$movies",
				music: "$music",
				books: "$books",
				favorite_teams: "$favorite_teams",
				like_count: { $sum : {$add: [ 
				{$size: "$movies"}, 
				{$size: "$music"}, 
				{$size: "$books"}, 
				{$size: "$favorite_teams"}, 
			]}}
			}},
			{ $sort: { like_count: -1 } }
		],function(err, col){
			if (err) throw err;
			dingus = col;
			console.log(col);
		});
	});
}



/*
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
*/
