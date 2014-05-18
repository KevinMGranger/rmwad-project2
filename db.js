var md = require('mongodb');
var Db = md.Db, Connection = md.Connection, Server = md.Server;

var host = 'localhost';
var port = Connection.DEFAULT_PORT;
// j: true means wait for FS journal to confirm write
var db = new Db('tigerfinder', new Server(host, port), {j: true});
var tigers;

// "constructor" for database -- opens connection to db and creates
// reference to collection. Not a real ctor because there can only be one,
// and all values are closured and not in an object.
// Note: means methods will be attached to constructor itself,
// NOT the prototype
function database_connect() {
		debugger;
	db.open(function(err, db) {
		debugger;
		if (err) throw err;

		db.collection('tigers', function(err, col) {
		debugger;
			if (err) throw err;

			//console.log(col);
			tigers = col;
		});
	});
}

// get a collection of users similar to the user of given id.
// Throws an error if the id is not found.
// callback is the passed the collection when done.
// Otherwise, will log results to console.
// If logged, it is array-ified, so might use a lot of memory!
function similar_users(id, callback) {
	debugger;
	callback = callback || console.log;
	//callback = callback || function(data) {
//		data.toArray(function(err, arr) {
//			console.log(arr);
//		});
//	};

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

			callback(col);
		});
	});
}
database_connect.similar_users = similar_users;

// add the given user or add new data to their userdata.
function add_or_update_user(userdata) {
	//format id correctly (fb app-scoped user id -> database _id)
	userdata._id = userdata.main.id;
	delete userdata.main.id;

	tigers.findOne({_id: userdata._id},function(err,tiger) {
		if (err) throw err;

		// if not found, create new entry
		if (!tiger) {
			tigers.insert(userdata);
		} else { // otherwise, add any new entries
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
database_connect.add_or_update_user = add_or_update_user;

module.exports = database_connect;

debugger;
database_connect();
console.log(tigers);
/*
similar_users(parseInt(process.argv[2], 10));
*/
