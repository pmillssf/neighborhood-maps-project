var locations = ko.observableArray([{
        title: 'Mechanics Institute Library and Chess Room',
        location: {
            lat: 37.788862,
            lng: -122.402976
        },
        icon: 'images/2915103_1.png'
    }, {
        title: 'San Francisco Center for the Book',
        location: {
            lat: 37.765357,
            lng: -122.402344
        },
        icon: 'images/book.png'
    }, {
        title: 'Letterform Archive',
        location: {
            lat: 37.763783,
            lng: -122.394046
        },
        icon: 'images/schreibwaren_web.png'
    }, {
        title: 'Golden Gate Park Model Yacht Club',
        location: {
            lat: 37.771221,
            lng: -122.494308
        },
        icon: 'images/sailing.png'
    }, {
        title: 'Book Club of California',
        location: {
            lat: 37.789842,
            lng: -122.405878
        },
        icon: 'images/library.png'
    }

]);
var markers = ko.observableArray([]); // Blank array to hold markers

var map;
var marker;

function initMap() { // add timeout
    var styles = [ // Map color mix of  https://snazzymaps.com/style/30/cobalt and https://snazzymaps.com/style/17/bright-and-bubbly
        {
            featureType: "all",
            elementType: "all",
            stylers: [{
                "invert_lightness": true
            }, {
                "saturation": 10
            }, {
                "lightness": 30
            }, {
                "gamma": 0.5
            }, {
                "hue": "#435158"
            }]
        }, {
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [{
                color: '#ffffff'
            }, {
                weight: 6
            }]
        }, {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#435158'
            }]
        }
    ];
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.7636505,
            lng: -122.4556266
        },
        zoom: 13,
        styles: styles
    });
    ko.applyBindings(new MapViewModel());
}


function MapViewModel() {
  var self = this;
  var infoWindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < locations().length; i++) {
    var position = locations()[i].location;
    var title = locations()[i].title;
    marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      icon: locations()[i].icon,
      animation: google.maps.Animation.DROP,
      id: i
    })
    markers.push(marker);
    console.log(markers());
    marker.addListener('click', function(){
      populateInfoWindow(this, infoWindow);
    });
    //bounds.extend(markers[i].position);
  }
  //map.fitBounds(bounds)

  function populateInfoWindow(marker, infowindow) {
    debugger;
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker(null);
      });
    };
    // Add bounce animation to marker on click
    if (marker.getAnimation() === null) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 1400);
    }
  }
}
