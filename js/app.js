// Global Variables
var map;
var viewModel;
var markers = [];

var locations = [{
        title: 'Club Atletico River Plate',
        location: {
            lat: -34.55,
            lng: -58.45
        }
    },
    {
        title: 'Boca Juniors',
        location: {
            lat: -34.636,
            lng: -58.365
        }
    },
    {
        title: 'Ferrocarril Oeste',
        location: {
            lat: -34.619,
            lng: -58.448
        }
    },
    {
        title: 'Racing Club de Avellaneda',
        location: {
            lat: -34.667,
            lng: -58.369
        }
    },
    {
        title: 'Club Atlético Vélez Sarsfield',
        location: {
            lat: -34.635,
            lng: -58.521
        }
    },
    {
        title: 'Club Atlético Huracán',
        location: {
            lat: -34.643,
            lng: -58.397
        }
    },
];

// Viewmodel function
function AppViewModel() {
    var self = this;
    self.marker = ko.observableArray(markers);
    self.searchLocation = ko.observable("");
    self.filteredLocations = ko.computed(function() {
        var search = self.searchLocation().toLowerCase();
        if (!self.searchLocation) {
            for (var i = 0; i > self.marker.length; i++) {
                self.marker[i].setVisible(true);
                return self.marker();
            }
        } else {
            return ko.utils.arrayFilter(self.marker(), function(location) {
                var title = location.title.toLowerCase();
                var match = title.indexOf(search) > -1;
                location.setVisible(match);
                return match;
            });
        }

    }, AppViewModel);


    self.openWindow = function(marker) {
        google.maps.event.trigger(marker, 'click');
    };

}

// This function populates the infowindow when the marker is clicked.
function populateInfoWindow(marker, infowindow) {
    var query = marker.title;

    var wikiURL = 'https://en.wikipedia.org/w/api.php?' +
        'action=opensearch&search=' + query +
        '&format=json&callback=wikiCallback';

    var wikiRequestTimeout = setTimeout(function() {
        viewModel.details(" You'll have to try again later.");
        var content = '<div class="info-window"> <h4>' + query + ' </h4> "Wikipedia article not available at the moment."</h4></div>';
        infowindow.setContent(content);
        infowindow.open(map, marker);
    }, 2000);

    $.ajax({
        url: wikiURL,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(response) {
            var title = response[0];
            var url = response[3][0];
            var article = response[2][0];
            var content = '<div class="info-window"><h2>' + title + '</h2>' + article + '<br><a href="' + url + '"target="_blank">Go to Full Article on Wikipedia</a>';
            infowindow.setContent(content);
            infowindow.open(map, marker);
            clearTimeout(wikiRequestTimeout);
            console.log(response);
        }
    });

}

function googleError() {
    alert('Wikipedia article not available at the moment.');
}

//Initalizes google map api and places starting location and markers.
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -34.60,
            lng: -58.38
        },
        zoom: 13,
        mapTypeControl: false
    });
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        markers.push(marker);
        bounds.extend(markers[i].position);
        marker.addListener('click', openInfoWindow);
}
// Funcion to Open Info Window
    function openInfoWindow() {
            var self = this;
            populateInfoWindow(this, largeInfowindow);
            this.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                self.setAnimation(null);
            }, 1400);
        }



    map.fitBounds(bounds);
    viewModel = new AppViewModel();
    ko.applyBindings(viewModel);

}
