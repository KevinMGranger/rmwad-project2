var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser());

var db = require('./dbclient.js');
var user = require('./user.js');


app.use('/user/:id?', user_id_param_handler);
app.route('/user/:id?')
.put(validate_user_data, user_put)
.post(validate_user_data, user_put)
.all(user_deny);

// put last. if got here, must not have been good.
function user_deny(req, res, next) {
	res.send(405); // method not allowed
}

function user_id_param_handler(req, res, next, id) {
	console.log("in idparam");
	console.log("id: ", id);
	if (id === "me") {
		next();
	} else if (id === req.body.main.id) { 
		next();
	} else {
		res.send(400, "url id did not match sent data id"); // malformed
	}
}


function validate_user_data(req, res, next) {
	console.log(req.body);
	res.send(req.body);
	debugger;
	if (user.validate(req.body)) {
		next();
	} else {
		console.log("bad data: ", req);
		res.send(400, req.body); // malformed
	}
}
	

function user_put(req, res, next) {
	// create or update
	
	var userdata = req.body;

	try {
		db.add_or_update_user(userdata,function(dbErr, _, fnErr, userdata) {
			res.send(200);
		});
	} catch (e) {
		console.error(e);
		console.error("sent data: ", userdata);
		res.send(500, "db whoopsie"); // internal server error
	}
}


app.route("/user/:id/similar")
.get(function get_suggestions(req, res, next) {
	// get similar users
	
	var uid = parseInt(req.param("id"), 10);

	console.log("Getting similar users for: ", uid, " (", typeof(uid), ")");

	try {
		db.similar_users(uid,function(dbErr, _, fnErr, users) {
			debugger;
			console.error("FNERR: ", fnErr);
			if (fnErr) res.send(200, {error: "No users were found to match you."});

			if (users) res.send(200, users);
		});
	} catch (e) {
		console.error(e);
		res.send(500, "db whoopsie"); // internal server error
	}
});

function getIndex(req, res, next) {
	res.sendfile('./index.html');
}

app.get('/', express.static('/'));
//app.get('/index.html', express.static('./');

process.on('uncaughtException', function(err) {
	console.error(err.stack);
});

var listening_port = 3000;

if (process.argv.length >= 3) {
	listening_port = process.argv[2];
}

app.listen(listening_port);
