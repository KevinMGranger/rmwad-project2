//	GOOGLE MAPS STUFF

var latitude, longitude = 0;
var infowindow = new google.maps.InfoWindow();
var address = " ";
var bounds = new google.maps.LatLngBounds();

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
// bounds from 
// http://wrightshq.com/playground/placing-multiple-markers-on-a-google-map-using-api-3/
function success(position) {
  latitude  = position.coords.latitude;
  longitude = position.coords.longitude;

  var latlng = new google.maps.LatLng(latitude,longitude);

  //console.log(latitude + " " + longitude);

  // give map options
  var myOptions = {
    center: latlng,
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(43.083848,-77.6799),
    title:"RIT"
  });

  // add RIT's lat lng to the bounds
  bounds.extend(marker.position);

  // create google map  
  map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

  // To add the marker to the map, call setMap();
  marker.setMap(map);

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

            bounds.extend(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });

            // add user's obfuscated lat lng to bounds
            map.fitBounds(bounds);
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