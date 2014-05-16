(function(){
	"use strict";

	// Facebook module to be exported later.
	// This is for our code, NOT the global 'FB' object
	// which contains their Javascript SDK.
	var Facebook = {};

	// NOTES ON MODULE MEMBERS:
	//
	// init is module init, should be called once the doc is loaded.
	// will start loading FB JS SDK.
	//
	// onready is for when the SDK is fully loaded, NOT when the doc is loaded.
	
	// in case we want to add a logging library later
	Facebook.log = console.log; 


	// required for when the Facebook Javascript SDK is loaded
	window.fbAsyncInit = function() {
		FB.init({
			appId      : '1429551510633574',
			cookie     : true,  // enable cookies to allow the server to access the session
			xfbml      : true,  // parse social plugins on this page
			version    : 'v2.0' // use version 2.0
		});

		console.log("FB SDK loaded.");

		// call any of our first-run facebook code.
		Facebook.onready();
	};

	Facebook.application_permission_scope = "user_about_me,user_friends,user_hometown,user_location,user_interests,user_activities,user_likes,user_education_history";

	Facebook.loginButtonAttributes = {
		"data-size": "xlarge",
		"data-show-faces": "false",
		"data-auto-logout-link": "false",
		"data-scope": Facebook.application_permission_scope,
		"onlogin": "Facebook.checkLoginState"
	}


	// module init
	Facebook.init = function init(){

		// set up login button
		this.log("fb init");
		var loginButton = document.getElementById("logIn");
		this.loginButton = loginButton;
		var attrs = this.loginButtonAttributes;
		for (var attr in attrs) {
			loginButton.setAttribute(attr, attrs[attr]);
		}

		// Load the SDK asynchronously. From FB's docs.
		(function(d, s, id) {
			//console.log("gettin ya facebooks");
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));

		// ^ implicitly calls window.fbAsyncInit when fully loaded

		// set up logout button
		this.appLogoutBtn = document.getElementById("appLogout");
		this.appLogoutBtn.onclick = this.appLogout;
	};


	// From FB's docs:
	// This function is called when someone finishes with the Login
	// Button.  See the onlogin handler attached to it in the sample
	// code below.
	Facebook.checkLoginState = function checkLoginState() {
		this.log("checking login state");

		// because in the function passed to getLoginStatus, 'this' is undefined
		var scb = this.statusChangeCallback.bind(this);
		FB.getLoginStatus(function(response) {
			scb(response);
		});
	};


	// called when we have a status object
	Facebook.statusChangeCallback = function statusChangeCallback(response) {
		this.log('login status checked, result:');
		this.log(response);

		switch (response.status) {
			case 'connected':
				this.log("User is signed in!");
			break;
			case 'not_authorized':
				this.log("User is signed in to FB, but not the app.");
			break;
			default:
				this.log("User is not signed in.");
			break;
		}
	};

	// "log out" of app by revoking all permissions. Really only for testing.
	Facebook.appLogout = function appLogout() {
		this.log("logging out");
		FB.api('/me/permissions', 'DELETE');
		this.checkLoginState();
	};


	// batch request stuff
	var base_info_endpoint = "me?fields=id,link,name,education,favorite_teams"; // base profile info
	var other_endpoints = ["movies", "books", "music"].map(function(str){ return "me/" + str + "?limit=10"});

	var batch_urls = [base_info_endpoint].concat(other_endpoints);
	var batch_object = { batch: batch_urls.map(function(url){ return { "method": "GET", "relative_url": url }; }) }

	Facebook.getBatchUserInfo = function getBatchUserInfo() {
		var userdata = {};
		var callback = function(resp) { 
			//userdata.main   = resp[0];
			//userdata.movies = resp[1];
			//userdata.books  = resp[2];
			//userdata.music  = resp[3];
			userdata.main   = JSON.parse(resp[0].body);
			userdata.movies = JSON.parse(resp[1].body).data;
			userdata.books  = JSON.parse(resp[2].body).data;
			userdata.music  = JSON.parse(resp[3].body).data;
			this.log(userdata);
		};
		FB.api("/", "POST", batch_object, callback);
	};


	Facebook.onready = function onready() {
	}



	// export facebook module
	window.Facebook = Facebook;
})();
