"use strict";

var AppStateEnum = new Enum("Pre_Login", "Logged_In", "Get_Similar");
var App = {
		AppStateEnum: AppStateEnum,
		set state (new_state) {
				this.on_state_change(new_state, this._app_state);
				this._app_state = new_state;
		},
		get state () { return this._app_state; },
		log: console.log,
};

App.on_state_change = function on_app_state_change(new_state, prev_state) {
		console.log("state change: " + prev_state + " -> " + new_state);

		var ase = AppStateEnum;

		if (prev_state !== ase.Logged_In && new_state === ase.Logged_In) {
				if (!Facebook.userdata) {
						Facebook.getBatchUserInfo(parsePersonalInfo);
				}
		}
}

window.App = App;

var geocoder;
var map;


window.onload = function init(){
		Facebook.init();
}

/** Perform an AJAX request
 * url: the url to send the request to
 * callback: the function to call, passing the response. If falsy, log the output.
 * wrap: if true, only call the callback on readyState 4 and HTTP status 200 or 304.
 * If callback is falsy, output is not wrapped.
 */
function doAjax(url, callback, wrap) {
	var xhr = new XMLHttpRequest();
	if (xhr) {
		if (callback) {
			if (wrap) {
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
						callback(xhr);
					}
				}
			} else {
				xhr.onreadystatechange = function() {
					callback(xhr);
				}
			}
		} else {
			xhr.onreadystatechange = function() {
				console.log(xhr);
			}
		}
		xhr.open("GET", url, true);
		xhr.send(null);
	} else {
		throw "couldn't create an XHR";
	}
}

// USER LOGIN PAGE

function parsePersonalInfoResponse(xhr) {
	var myJSON = JSON.parse( xhr.responseText ); 
	parsePersonalInfo(myJSON);
}
function parsePersonalInfo(json) {
	//alert(xhr.responseText);

	// get reference to #content div
	var contentDiv = document.getElementById('load');

	// clear contents of #content div
	contentDiv.innerHTML="";

	// set user's image
	getUserImage(json.pic_url);

	// query all of user's basic info
	var info = json.main; 

	// find information for the name, high school, first choice major, and favorite sports team
	var name = info.name;
	//console.log(name);

	var highSchools = info.education.filter(function(skool){ return skool.type == "High School"});
	if (highSchools.length) {
		var highSchool = highSchools[0].school.name;
	}
	//console.log(highSchool);

	var colleges = info.education.filter(function(skool){ return skool.type == "College"; } );
	var majors = colleges.filter(function(skool){ return skool.concentration;}).map(function(skool){ return skool.concentration[0].name; });
	var firstChoice = majors[0];
	//console.log(firstChoice); 

	var favoriteTeam = info.favorite_teams[0].name;
	//console.log(favoriteTeam);

	// create HTML elements to hold the info
	// user's div will contain their name, details, the map, and the compare button
	var userDiv = document.createElement('div');

	// store all of user's relevant details
	var detailsDiv = document.createElement('div');
	detailsDiv.setAttribute("id", "details");

	var nameElement = document.createElement('h1'); 
	nameElement.innerHTML = name;
	nameElement.setAttribute("id", "name");

	var highSchoolElement = document.createElement('h2'); 
	highSchoolElement.innerHTML = highSchool;
	highSchoolElement.setAttribute("id", "highSchool");

	var majorElement = document.createElement('h2');
	majorElement.innerHTML = firstChoice;
	majorElement.setAttribute("id", "major");

	var favoriteTeamElement = document.createElement('p');
	favoriteTeamElement.innerHTML = favoriteTeam;
	favoriteTeamElement.setAttribute("id", "favoriteTeam");

	// add the elements to the details
	detailsDiv.appendChild(highSchoolElement);
	detailsDiv.appendChild(majorElement);
	detailsDiv.appendChild(favoriteTeamElement);

	var buttonDiv = document.createElement('div');
	buttonDiv.setAttribute("id", "buttonDiv");

	// add a button to prompt comparison on the page
	var compareButton = document.createElement('button');
	compareButton.setAttribute("id", "find");
	compareButton.innerHTML = "Find other Tigers!";

	buttonDiv.appendChild(compareButton);

	detailsDiv.appendChild(buttonDiv);

	// append new elements to new <div> 
	userDiv.appendChild(nameElement); 
	userDiv.appendChild(detailsDiv);

	// add a google map to the user's div
	var mapDiv = document.createElement('div');
	mapDiv.setAttribute("id", "map-canvas");

	userDiv.appendChild(mapDiv);

	// add div to document 
	contentDiv.appendChild(userDiv); 

	document.getElementById("find").onclick= function(){doAjax('./tests/testDetails.json', compareUsers, true);};

	initializeMap();
} // end display response

function getUserImage(url){
	// find banner div
	var imgDiv = document.getElementById('banner');

	imgDiv.setAttribute('src', url);
}

// USER COMPARISON PAGE

function compareUsers(xhr){
	var myJSON = JSON.parse( xhr.responseText ); 
	parseUserCompare(myJSON);
}

// need other user image
// need other user url
// need error log
function parseUserCompare(json){
	// get reference to #content div
	var contentDiv = document.getElementById('load');

	// clear contents of #content div
	contentDiv.innerHTML="";

	var info = json; 
	console.log(info);

	// create a div to hold all the match data
	var matchDiv = document.createElement('div');

	// ****check if json.error == false

	// find the match's name
	var foundUser = info.match1;

	// ****add image at the top

	// print the name on screen
	var foundUserElement = document.createElement('h2');
	foundUserElement.innerHTML = "You were matched with " + foundUser;
	matchDiv.appendChild(foundUserElement);

	// find all the similarities
	var matches = info.similarities;

	// if the users are from the same high school, print the school
	if(matches["highschool"])
	{
		var highschool = matches["highschool"];
		var highschoolElement = document.createElement('p');
		highschoolElement.innerHTML = "You both go to " + highschool;

		matchDiv.appendChild(highschoolElement);
	}

	// if the users are from the same state, print the state
	if(matches["state"])
	{
		var state = matches["state"];
		var stateElement = document.createElement('p');
		stateElement.innerHTML = "You both live in " + state;

		matchDiv.appendChild(stateElement);
	}

	// if the match has favorites, print out all similarities
	if(matches.favorites){
		var favorites = matches.favorites;
		var allFavorites = "";
		console.log(favorites);
		for(var thing in favorites)
		{
			allFavorites += favorites[thing] + " ";
		}

		var favoritesElement = document.createElement('p');
		favoritesElement.innerHTML = "You both like " + allFavorites;

		matchDiv.appendChild(favoritesElement);
	}

	// ****add user's link at the bottom

	// ****else append nothing

	// add a button to prompt comparison on the page
	var backButton = document.createElement('button');
	backButton.setAttribute("id", "find");
	backButton.innerHTML = "Back";

	// append everything to the content div
	matchDiv.appendChild(backButton);
	contentDiv.appendChild(matchDiv);

	// reload user's data into the main page
	document.getElementById("find").onclick= function(){Facebook.getBatchUserInfo(parsePersonalInfo);};

}
