function moobies() { var vies = [];
	for (var i in arguments) {
		vies.push({id: i, dingus: arguments[i]});} return vies; }
var genids = moobies;
exports.moobies = moobies;

var usertemplate = {
	main: {
		id: undefined,
		favorite_teams: [],
		education: []
	},
	movies: [],
	music: [],
	books: [],
};

// not a constructor, I know. chill.
// return a new user-like object.
function User() {
	var user = {
		main: {
			id: undefined,
			favorite_teams: [],
			education: []
		},
		movies: [],
		music: [],
		books: [],
	};

	var argc = arguments.length;

	user.main.id = (argc === 0) ? Math.round(Math.random()*100) : arguments[0];

	if (argc === 1) user.main.favorite_teams = user.main.favorite_teams.concat(arguments[1]);
	if (argc === 2) user.main.education = user.main.education.concat(arguments[2]);
	if (argc === 3) user.main.education = user.main.education.concat(arguments[3]);
	if (argc === 4) user.movies = user.movies.concat(arguments[4]);
	if (argc === 5) user.music = user.music.concat(arguments[5]);
	if (argc === 6) user.books = user.books.concat(arguments[6]);

	return user;
}
exports.User = User;

// validate a user object
function validate(user) {
	if (typeof(user) !== typeof({})) { return false; }
	else {
		if (typeof(user.movies) !== typeof([])) { return false; }
		if (typeof(user.music) !== typeof([])) { return false; }
		if (typeof(user.books) !== typeof([])) { return false; }
		if (typeof(user.main) !== typeof({})) {
			return false;
		} else {
			if (typeof(user.main.education) !== typeof([])) { return false; }
			if (typeof(user.main.favorite_teams) !== typeof([])) { return false; }
			if (typeof(user.main.id) !== typeof(1)) { return false; }
		}
	}
	return true;
}
exports.validate = validate;

// normalize a user object.
function shape_up(user) {
	if (typeof(user) !== typeof({})) { return User(); }
	else {
		if (typeof(user.movies) !== typeof([])) { user.movies = []; }
		if (typeof(user.music) !== typeof([])) { user.music = []; }
		if (typeof(user.books) !== typeof([])) { user.books = []; }
		if (typeof(user.main) !== typeof({})) {
			if (typeof(user.main.education) !== typeof([])) { user.main.education = []; }
			if (typeof(user.main.favorite_teams) !== typeof([])) { user.main.favorite_teams = []; }
			if (typeof(user.main.id) !== typeof(1)) { user.main.id = Math.round(Math.random()*100); }
		} else {
			user.main = {
				education: [],
				favorite_teams: [],
				id: Math.round(Math.random()*100)
			};
		}
	}
	return user;
}
exports.shape_up = shape_up;
