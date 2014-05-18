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
		//onlogin: console.log
		onlogin: "Facebook.checkLoginState()"
	}


	// module init
	Facebook.init = function init(){

		// set up login button
		//this.log("fb init");
		console.log("fb init");
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
			//console.log(response);
			scb(response);
		});
	};



	// called when we have a status object
	Facebook.statusChangeCallback = function statusChangeCallback(response) {
		this.log('login status checked, result:');
		this.log(response);

		switch (response.status) {
			case 'connected': {
				this.log("User is signed in!");
				App.state = App.AppStateEnum.Logged_In;
				break;
			}
			case 'not_authorized': {
				this.log("User is signed in to FB, but not the app.");
				App.state = App.AppStateEnum.Pre_Login;
				break;
			}
			default: {
				this.log("User is not signed in.");
				App.state = App.AppStateEnum.Pre_Login;
				break;
			}
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

	// todo: figure out why stripping headers doesn't work

	Facebook.getBatchUserInfo = function getBatchUserInfo(callback) {
		var userdata = {};
		var wrapper_callback = (function(resp) { 
			//strip out unneeded data
			function want(data) { return { name: data.name, id: data.id }; }
			userdata.main   = JSON.parse(resp[0].body);
			userdata.movies = JSON.parse(resp[1].body).data.map(want);
			userdata.books  = JSON.parse(resp[2].body).data.map(want);
			userdata.music  = JSON.parse(resp[3].body).data.map(want);

			this.log("User data:");
			this.log(userdata);

			if (callback) callback(userdata);
		}).bind(this);
		FB.api("/", "POST", batch_object, wrapper_callback);
		this.userdata = userdata;
	};


	Facebook.onready = function onready() {
	}



	// export facebook module
	window.Facebook = Facebook;
})();
