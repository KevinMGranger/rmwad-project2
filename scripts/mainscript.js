/*
	OLD SCHOOL - NO jQuery used
	One issue will be that not every version of IE supports the XHR object
*/
"use strict";

window.onload= init;

function init(){
	document.getElementById("logIn").onclick= function(){getInfo('tests/me.json');};
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

function displayResponseJSON(xhr) {
  if (xhr.readyState == 4) {
    if (xhr.status == 200 || xhr.status == 304) {
     //alert(xhr.responseText);
     // get reference to #content div
      var contentDiv = document.getElementById('load');
      
      // clear contents of #content div
      contentDiv.innerHTML="";

      var myJSON = JSON.parse( xhr.responseText ); 
      var allInfo = myJSON; 

      // loop through all information
      for (var i=0;i<allInfo.length;i++){ 
        var info = allInfo[i]; 
        // find information for the name, high school, first choice major, and favorite sports team
        var name = info.name;
        console.log(name);

        var highSchool = info.education[0].school.name;
        console.log(highSchool);

        var majors = info.education["concentration"];
        var firstChoice = majors[0].name;
        console.log(firstChoice); 

        var favoriteTeam = info.favorite_teams[0];
        console.log(favoriteTeam);

        // create HTML elements to hold the info
        // first a new container <div> 
        var div = document.createElement('div'); 

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

        // append new elements to new <div> 
        div.appendChild(nameElement); 
        div.appendChild(highSchoolElement); 
        div.appendChild(majorElement);
        div.appendChild(favoriteTeamElement);
        //div.appendChild(document.createElement('hr')); 

        // add div to document 
        contentDiv.appendChild(div); 

        // keep looping 
      } // end for
      
    } // end if request.status
  } // end request.readyState
} // end display response