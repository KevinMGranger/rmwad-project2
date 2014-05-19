var express = require('express');
var app = express();

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
	res.send(200, "dingus");
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
	next();
	if (user.validate(req.body)) {
		next();
	} else {
		res.send(400, "sent data did not validate"); // malformed
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
		res.send(500); // internal server error
	}
}



function get_suggestions(req, res, next) {
	// get similar users
	

	var uid = req.body

	console.log(uid);
	
	res.send(200, uid);
}

process.on('uncaughtException', function(err) {
	console.error(err.stack);
});

app.listen(3000);
