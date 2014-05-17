var express = require('express');

var app = express();


app.route('/tiger/:id')
.get(function(req, res, next) {
	// get user from DB
	res.json({get_user: "indeed", id: req.params.id});
})
.put(function(req, res, next) {
	// create or update
	res.json({chg_user: "indeed", id: req.params.id});
});

app.route('/tiger/:id/similar')
.get(function(req, res, next) {
	// get similar users
	res.json({friends: "none :(", id: req.params.id});
});


app.listen(3000);
