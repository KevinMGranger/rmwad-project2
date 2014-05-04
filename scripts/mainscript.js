/*
	OLD SCHOOL - NO jQuery used
	One issue will be that not every version of IE supports the XHR object
*/
"use strict";

window.onload= init;

function init(){
	document.getElementById("logIn").onclick= function(){getInfo('./tests/me.json');};
}

function getInfo(file) {
  var xhr = new XMLHttpRequest();
  if (xhr) {
    xhr.onreadystatechange = function() {
      displayResponseJSON(xhr);
    };
    xhr.open("GET", file, true);
    xhr.send(null);
  }
}

var myJSON;

function displayResponseJSON(xhr) {
  if (xhr.readyState == 4) {
    if (xhr.status == 200 || xhr.status == 304) {
      //alert(xhr.responseText);

      // first remove the log in button
      var parentDiv = document.getElementById('content');
      var removeDiv = document.getElementById('logDiv');
      parentDiv.removeChild(removeDiv);

      // get reference to #load div
      var contentDiv = document.getElementById('load');

      // clear contents of #content div
      contentDiv.innerHTML="";

      myJSON = JSON.parse( xhr.responseText ); 

      var info = myJSON; 
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
    } // end if request.status
  } // end request.readyState
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
