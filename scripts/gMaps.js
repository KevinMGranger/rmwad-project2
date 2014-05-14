//	GOOGLE MAPS STUFF

var latitude, longitude = 0;
var infowindow = new google.maps.InfoWindow();
var address = " " ;

// Sets up Google Map
function initializeMap() {

	geocoder = new google.maps.Geocoder();

  if (!navigator.geolocation){
    console.log("Geolocation not supported");
    return;
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
};

// From MDN
function success(position) {
  latitude  = position.coords.latitude;
  longitude = position.coords.longitude;

  var latlng = new google.maps.LatLng(latitude,longitude);

  console.log(latitude + " " + longitude);

  // give map options
  var myOptions = {
    center: latlng,
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // create google map  
  map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

  codeLatLng();
};

// From MDN
function error() {
  console.log("Couldn't retrieve location");
};

// From Google
function codeLatLng() {
  var latlng = new google.maps.LatLng(latitude, longitude);

  // encodes the latitude and longitude of the request
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {

        //console.log(results[1]);

        // takes the resulting location and pulls out the formatted address
        address = results[1].formatted_address;
        //console.log(address);

        // reencode the formatted address and find its location
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {

            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });

      } else {
        alert('No results found');
      }
    } else {
      alert('Geocoder failed due to: ' + status);
    }
  });
};