"use strict";

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
	console.log(name);

	var highSchools = info.education.filter(function(skool){ return skool.type == "High School"});
	if (highSchools.length) {
		var highSchool = highSchools[0].school.name;
	}
	console.log(highSchool);

	var colleges = info.education.filter(function(skool){ return skool.type == "College"; } );
	var majors = colleges.filter(function(skool){ return skool.concentration;}).map(function(skool){ return skool.concentration[0].name; });
	var firstChoice = majors[0];
	console.log(firstChoice); 

	var favoriteTeam = info.favorite_teams[0].name;
	console.log(favoriteTeam);

	// create HTML elements to hold the info
	// first a new container <div> 
	var userDiv = document.createElement('div');
	var detailsDiv = document.createElement('div');
	detailsDiv.setAttribute("id", "details");

	// then everything else
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
	//var imgElement = document.createElement("img");
	//imgElement.src = img["#text"];

	detailsDiv.appendChild(highSchoolElement);
	detailsDiv.appendChild(majorElement);
	detailsDiv.appendChild(favoriteTeamElement);

	// append new elements to new <div> 
	userDiv.appendChild(nameElement); 
	userDiv.appendChild(detailsDiv);

	// add div to document 
	contentDiv.appendChild(userDiv); 


      var mapDiv = document.createElement('div');
      mapDiv.setAttribute("id", "map-canvas");

      userDiv.appendChild(mapDiv);

      initializeMap();
} // end display response

// Sets up Google Map
function initializeMap() {

  if (!navigator.geolocation){
    console.log("Geolocation not supported");
    return;
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
};

// From MDN
function success(position) {
  var latitude  = position.coords.latitude;
  var longitude = position.coords.longitude;

  console.log(latitude + " " + longitude);

  // give map options
  var myOptions = {
    center: new google.maps.LatLng(latitude,longitude),
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // create google map  
  var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
};

// From MDN
function error() {
  console.log("Couldn't retrieve location");
};
