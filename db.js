var md = require('mongodb');
var Db = md.Db, Connection = md.Connection, Server = md.Server;

var host = 'localhost';
var port = Connection.DEFAULT_PORT;
// j: true means wait for FS journal to confirm write
var db = new Db('tigerfinder', new Server(host, port), {j: true});

// The Dark Side of Asynchronicity:
// to re-use a single connection, there will be a closured connection
// that will be instantiated if not there yet, but nothing will happen
// if it is.
//
// This will be done in a function that takes a callback as an argument,
// only calling the function when ready.
//
// The "proper" way of doing this is with functions that take the connection
// as an argument, not this global variable stuff... but hey, it works.
//
// Inspiration from http://stackoverflow.com/questions/11991544/nodejs-mongodb-use-an-opening-connection

// global database connection. undefined until db is connected to
var tigers;

// call the callback only if the database connection is ready. if it's not,
// set it up, then call.
// If you want arguments on the callback, use .bind()
function get_db_tigers(callback) {
	if (tigers) {
		callback();
		return;
	}
	
	db.open(function(err, database) {
		if (err) throw err;

		database.collection('tigers', function(err, col) {
			if (err) throw err;

			tigers = col;

			callback();
		});
	});
}

// get a collection of users similar to the user of given id.
// Throws an error if the id is not found.
// callback is the passed the collection when done.
// Otherwise, will log results to console.
// If logged, it is array-ified, so might use a lot of memory!
function _similar_users(id, callback) {
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
exports.similar_users = get_db_tigers.bind(undefined, _similar_users);

// add the given user or add new data to their userdata.
function _add_or_update_user(userdata) {
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
exports.add_or_update_user = get_db_tigers.bind(undefined, _add_or_update_user);
