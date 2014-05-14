"use strict";

var geocoder;
var map;

window.addEventListener("onload", init);

function init(){
	//document.getElementById("logIn").onclick= function(){getInfo('./tests/me.json');};
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

	var allInfo = json; 

	var info = json; 
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

	// append new elements to new <div> 
	userDiv.appendChild(nameElement); 
	userDiv.appendChild(detailsDiv);

	// add a google map to the user's div
	var mapDiv = document.createElement('div');
	mapDiv.setAttribute("id", "map-canvas");

	userDiv.appendChild(mapDiv);

	// add a button to prompt comparison on the page
	var compareButton = document.createElement('button');
	compareButton.setAttribute("id", "find");
	compareButton.innerHTML = "Find other Tigers!";

	userDiv.appendChild(compareButton);

	// add div to document 
	contentDiv.appendChild(userDiv); 

	document.getElementById("find").onclick= function(){doAjax('./tests/testDetails.json', compareUsers, true);};

	initializeMap();
} // end display response

// USER COMPARISON PAGE

function compareUsers(xhr){
	var myJSON = JSON.parse( xhr.responseText ); 
	parseUserCompare(myJSON);
}

function parseUserCompare(json){
	// get reference to #content div
	var contentDiv = document.getElementById('load');

	// clear contents of #content div
	contentDiv.innerHTML="";

	var info = json; 
	console.log(info);

	// create a div to hold all the match data
	var matchDiv = document.createElement('div');

	var foundUser = info.match1;
	var foundUserElement = document.createElement('h2');
	foundUserElement.innerHTML = "You were matched with " + foundUser;

	matchDiv.appendChild(foundUserElement);

	var matches = info.similarities;

	if(matches["highschool"])
	{
		var highschool = matches["highschool"];
		var highschoolElement = document.createElement('p');
		highschoolElement.innerHTML = "You both go to " + highschool;

		matchDiv.appendChild(highschoolElement);
	}

	if(matches["state"])
	{
		var state = matches["state"];
		var stateElement = document.createElement('p');
		stateElement.innerHTML = "You both live in " + state;

		matchDiv.appendChild(stateElement);
	}

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

	// add a button to prompt comparison on the page
	var backButton = document.createElement('button');
	backButton.setAttribute("id", "back");
	backButton.innerHTML = "<- Back";

	 matchDiv.appendChild(backButton);

	contentDiv.appendChild(matchDiv);

	document.getElementById("back").onclick= function(){FB.api('/me?fields=education,name,inspirational_people,favorite_athletes,favorite_teams,inspirational_people', function(resp) { updateStatusGoodLogin(resp); parsePersonalInfo(resp);});};

}
