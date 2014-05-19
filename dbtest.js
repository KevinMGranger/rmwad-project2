var t = require('./dbclient.js');
var moobies = require('./user.js').moobies;

//t.get_db_tigers(function(col) {
//		col.find({},function(err,col) {
//			console.log("find err: ", err);
//			col.count(function(err, num) {
//				console.log("count err:", err);
//				console.log("num: ", num);
//				});
//			});
//		});

function moobies() { var vies = [];
	for (var i in arguments) {
		vies.push({id: i, dingus: arguments[i]});} return vies; }

t.similar_users(parseInt(process.argv[2]),function(dbErr, col, fnErr, res) {
	debugger;
	console.log("similar:");
	console.log(res);
	t.add_or_update_user({
		main: {
			education: [],
			favorite_teams: [],
			id: 5643,
		},
		movies: moobies("essex", "carl", "indochino"),
		music: [],
		books: []
	},function(dbErr,dbCol,fnErr,fnRes) {
		dbCol.find({},function(err, col) {
			console.log("all entries:");
			col.toArray(console.log);
		});
	});
});
