var md = require('mongodb');
var Db = md.Db, Connection = md.Connection, Server = md.Server;
//var MC = md.MongoClient;

var host = 'localhost';
var port = Connection.DEFAULT_PORT;
var db = new Db('tigerfinder', new Server(host, port), {j: true});
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
function similar_users(id) {
	tigers.findOne({_id: id}, function(err, me){
		if (err) throw err;

		// AGGREGATION:
		// 1. mutate data: interests are intersections of sets
		// 2. get sum of common interests
		// 3. sort by number of interests
		// 4. remove self and those with nothing in common
		tigers.aggregate([
			// get common interests
			{ $project: { 
				movies: { $setIntersection: ["$movies", me.movies] },
				music: { $setIntersection: ["$music", me.music] },
				books: { $setIntersection: ["$books", me.books] },
				favorite_teams: { $setIntersection: ["$main.favorite_teams", me.main.favorite_teams] }
			}},
			// count how many common interests there are
			{ $project: {
				movies: 1,
				music: 1,
				books: 1,
				favorite_teams: 1,
				like_count: {$add: [ 
				{$size: "$movies"}, 
				{$size: "$music"}, 
				{$size: "$books"}, 
				{$size: "$favorite_teams"}]},
			}},
			// sort by number of common interests, descending
			{ $sort: { like_count: -1 } },
			// do not suggest self (that's sad) or those with nothing in common
			{ $match: { 
				_id: { $ne: id },
				like_count: { $lt: 1 }
			} }
		],function(err, col){
			if (err) throw err;
			dingus = col;
			console.log(col);
		});
	});
}

function add_or_update_user(userdata) {
	//format id correctly
	userdata._id = userdata.main.id;
	delete userdata.main.id;

	tigers.findOne({_id: userdata._id},function(err,tiger) {
		if (err) throw err;
		if (!tiger) {
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
}

function user(id, movies) {
	return { main: { id: id, favorite_teams: [], education: [] },
		movies: movies, books: [], music: [] };
}
