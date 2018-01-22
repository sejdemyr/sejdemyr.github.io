

function initAutocomplete() {
    
    var mapOptions = {

	// Initial zoom
	zoom: 11,

	// Disable zoom on click
	disableDoubleClickZoom: true,

	// Disable scroll wheel scaling
	scrollwheel: false,

	// Disable the map v satellite control
	mapTypeControl: false,

	// Disable Pegman control
	streetViewControl: false, 

	// The latitude and longitude to center the map 
        center: new google.maps.LatLng(40.75, -74.12), 

        // Style the map (function below) 
        styles: getMapTheme()
	
    };

    // Get the HTML element containing the map
    var mapElement = document.getElementById('map');

    // Create the Google Map using out element and options defined above
    var map = new google.maps.Map(mapElement, mapOptions);

    // Add neighborhood boundaries \
    map.data.addGeoJson(neighborhoods); 

    // Set style of boundaries 
    map.data.setStyle({
        fillOpacity: 0,
        strokeWeight: 0.6,
	strokeOpacity: 0.5, 
        strokeColor: 'red'
    });

    // Style of marker
    var icon = {
	url: 'img/map-marker.png',
	size: new google.maps.Size(71, 71),
	origin: new google.maps.Point(0, 0),
	anchor: new google.maps.Point(17, 34),
	scaledSize: new google.maps.Size(28, 40)
    };
  
    // Convert the neighborhood geojson to array of google maps Polygons
    neighborhoods.features.forEach(function(neighbor) {
	var coord = neighbor.geometry.coordinates[0];

	var poly = []; 
	coord.forEach(function(ll) {
	    var latlng = new google.maps.LatLng(ll[1], ll[0]);
	    poly.push(latlng);
	});

	// Construct the polygon and push into array of polygons
	poly = new google.maps.Polygon({paths: poly});
	neighPoly.push(poly);	
    });

    // Create the search box and link it to the UI element
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    
    var maptext = document.getElementById('over_map');
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(maptext);

    // Bias the SearchBox results towards current map's viewport
    map.addListener('bounds_changed', function() {
	searchBox.setBounds(map.getBounds());
    });    

    // Two events - search and double click - potentially moves the marker
    var markers = [];
    
    // Listen for the event fired when the user searches a place
    searchBox.addListener('places_changed', function() {

	// Get the place
	var places = searchBox.getPlaces();

	if (places.length == 0) {
	    return;
	}

	// Get the lat/lng coordinates and bounds of the place 
	var bounds = new google.maps.LatLngBounds(), latlng; 
	places.forEach(function(place) {
	    latlng = place.geometry.location;

	    if (place.geometry.viewport) {
		bounds.union(place.geometry.viewport);
	    } else {
		bounds.extend(latlng);
	    }	    
	});

	// Test whether the place is located in a neighborhood
	neighName = testLocation(latlng);

	// If a neighborhood's name is returned, update map and visualize data
	if(neighName != "No result found") {
	    map.fitBounds(bounds);	    
	    map.setCenter(new google.maps.LatLng(latlng.lat(), latlng.lng() - 0.05));
	    map.setZoom(12);
	    moveMarker(latlng);
	    visualizeData(neighName, "All time");	    
	} else {
	    BootstrapDialog.show({
		type: BootstrapDialog.TYPE_PRIMARY, 
		title: "No information available.", 
		message: "Please search for or double click on a populated place in New York City."
            });
	}
	
	
    });

    // Listen for double clicks on neighborhood polygons 
    map.data.addListener('dblclick', function(e) {
	neighName = testLocation(e.latLng);
	moveMarker(e.latLng);
	visualizeData(neighName, "All time"); 	
    }); 



    // Function for testing whether a searched place is within a neighborhood
    // On success, returns the neighborhood's name; otherwise, return 'No result found'
    function testLocation(latlng) {
	var name;
	for(var i = 0; i < neighN; i++) {

	    name = google.maps.geometry.poly.containsLocation(latlng, neighPoly[i]) ?
		neighborhoods.features[i].properties.neighborhood :
		"No result found";
	    
	    if(name != "No result found") {
		break;
	    } 
	}
	return name;
    }
    
    // Function to position the marker on double click 
    function moveMarker(latlng) {

	// Clear out the old markers
	markers.forEach(function(marker) {
	    marker.setMap(null);
	});
	markers = [];
	
	// Create a new marker
	markers.push(new google.maps.Marker({
	    map: map,
	    icon: icon,
	    position: latlng
	}));
    }

    // Scale map when window is resized
    google.maps.event.addDomListener(window, "resize", function() {
	var center = map.getCenter();
	google.maps.event.trigger(map, "resize");
	map.setCenter(center);
    });

}

function getMapTheme() {

    // Based on Boostrap's grayscale template: 
    // http://ironsummitmedia.github.io/startbootstrap-grayscale/
    
    return [{
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 29
            }, {
                "weight": 0.2
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 18
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 16
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 21
            }]
        }, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#000000"
            }, {
                "lightness": 16
            }]
        }, {
            "elementType": "labels.text.fill",
            "stylers": [{
                "saturation": 36
            }, {
                "color": "#000000"
            }, {
                "lightness": 40
            }]
        }, {
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 19
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 20
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#000000"
            }, {
                "lightness": 17
            }, {
                "weight": 1.2
            }]
        }
]
}
