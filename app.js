var geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json';
var geocodeKey = 'AIzaSyBomPH1s3ajX87qrX0YeRJ6iiaVuGbVwpU';
var openStatesURL = 'https://openstates.org/api/v1/legislators/geo/';
var openStatesKey = 'ad0a422f-9bf4-4eb9-808a-0d1bb03d0867';

var state = {
results: []
};

function errorHandler(err){
  console.error(err);
}

function geocodeSuccessHandler(data){
	var lat = data.results[0].geometry.location.lat;
  var lng = data.results[0].geometry.location.lng;
	getLegislatorData(lat, lng, openStatesSuccessHandler, errorHandler);

}


function openStatesSuccessHandler(data){
  state.results = data.results;
  console.log(data);
}

function getDataFromGeocodeApi(address, geocodeSuccessHandler, errorHandler) {
  var settings = {
    url: geocodeURL,
    data: {
      key: geocodeKey,
      address: address,
    },
    dataType: 'json',
    type: 'GET',
    success: function(data){
      geocodeSuccessHandler(data);
    },
    error: function(err){
      errorHandler(err);
    }
  };
  return $.ajax(settings);
}

function getLegislatorData(lat, long, openStatesSuccessHandler, errorHandler) {
  var settings = {
    url: openStatesURL,
    data: {
      apikey: openStatesKey,
      lat: lat,
      long: long,
    },
    dataType: 'json',
    type: 'GET',
    success: function(data){
      openStatesSuccessHandler(data);
    },
    error: function(err){
      errorHandler(err);
    }
  };
  return $.ajax(settings);
}
getDataFromGeocodeApi('745 tiffany lane waconia mn', geocodeSuccessHandler, errorHandler);
