var locations = ko.observableArray([{
        title: 'San Francisco Mechanics Institute',
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
        title: 'San Francisco Model Yacht Club',
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
var visibleMarkers = ko.observableArray([]);
var selectedMarker = ko.observable(); // Blank object to hold selected marker from dropdown menu
var map;
var marker;
// function to display selected marker from dropdown, including animation and infowindow, and hide other markers
var showSelected = ko.computed(function() {
    if (markers().length === 5 && typeof(selectedMarker()) === 'object') {
        for (i = 0; i < 5; i++) {
            markers()[i].setVisible(false);
        }
        selectedMarker().setVisible(true);
        map.setCenter(selectedMarker().position);
        if (selectedMarker().getAnimation() === null) {
            selectedMarker().setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                selectedMarker().setAnimation(null);
            }, 1400);
        }
        populateInfoWindow(selectedMarker(), new google.maps.InfoWindow());
    }
});

var query = ko.observable('');

function initMap() {
    // Google Maps error handling
    var googleMapsTimeout = setTimeout(function() {
        alert("Uh oh, Google Maps has failed to load!");
    }, 4000);
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
    clearTimeout(googleMapsTimeout);
    ko.applyBindings(new MapViewModel());
}


function MapViewModel() {
    var self = this;

    var infoWindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    // marker creation
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
        });
        markers.push(marker);
        visibleMarkers.push(marker);
      //  console.log(markers());
        marker.addListener('click', function() {
            populateInfoWindow(this, infoWindow);
        });
        bounds.extend(markers()[i].position);
    }
    map.fitBounds(bounds);
    // window resizing
    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
        map.setCenter({
            lat: 37.7636505,
            lng: -122.4556266
        });
    });


    // http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
    self.filteredListItems = ko.computed(function() {
        var newBounds = new google.maps.LatLngBounds();
        var searchString = query().toLowerCase();
       // console.log(searchString);
       console.log("--------");
        if (!searchString) {
          for (i = 0; i < 5; i++) {
              visibleMarkers()[i].setVisible(true);
          }
         //   console.log("no input");
            return visibleMarkers();
        } else {
          //console.log("input");
          //return [];
            return ko.utils.arrayFilter(visibleMarkers(), function(marker) {
                var title = marker.title.toLowerCase();
                var match = title.indexOf(searchString) != -1;
                if (match === true) {
                  marker.setVisible(true);
                  newBounds.extend(marker.position);
                  map.fitBounds(newBounds);
                } else {
                  marker.setVisible(false);
                 }

                console.log(title, searchString, match);


               return match;
            });
        }

    });


}
// InfoWindow population function
function populateInfoWindow(marker, infowindow) {
    map.setCenter(marker.position);
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        titleHtml = '<h4>' + marker.title + '</h4>';
        wikiFail = '<div>' + 'Wikipedia has failed to load' + '</div>';
        // WIKIPEDIA api
        var WikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        var wikiRequestTimeout = setTimeout(function() {
            infowindow.setContent(titleHtml + wikiFail);
        }, 4000);

        $.ajax({
            url: WikiUrl,
            dataType: 'jsonp',
        }).done(function(response) {
            var articleList = response[1];
            var articleStr = articleList[0];
            var url = 'https://en.wikipedia.org/wiki/' + articleStr;
            var wikiHtml = '<div>' + 'Learn more: ' + '<a href="' + url + '">' + articleStr + '</a></div>';
            infowindow.setContent(titleHtml + wikiHtml);
            clearTimeout(wikiRequestTimeout);
            if (marker.title === 'Letterform Archive') {
                var letterFormHtml = '<div>' + 'Letterform Archive has no wiki page, check out their' + '<a href="http://letterformarchive.org/"> website.</a>' + '</div>';
                infowindow.setContent(titleHtml + letterFormHtml);
            }
        });
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
    }
    // Add bounce animation to marker on click
    if (marker.getAnimation() === null) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }
}
function googleError() {
  alert("Uh oh, Google Maps API has failed to load!");
};
