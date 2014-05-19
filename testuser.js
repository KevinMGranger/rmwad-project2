var user = require('./user.js');

var testuser = {
	main: {
		id: 123,
		favorite_teams: [],
		education: []
	},
	movies: [],
	music: [],
	books: [],
}

debugger;
console.log(user.validate(testuser));
