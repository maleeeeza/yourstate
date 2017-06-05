var geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json';
var geocodeKey = 'AIzaSyBomPH1s3ajX87qrX0YeRJ6iiaVuGbVwpU';

var state = {
results: []
};

var errorHandler = function(err){
  console.error(err);
}

var successHandler = function(data){
	state.results = data.results;
  console.log(data);
}

function getDataFromGeocodeApi(address, successHandler, errorHandler) {
  var settings = {
    url: geocodeURL,
    data: {
      key: geocodeKey,
      address: address,
    },
    dataType: 'json',
    type: 'GET',
    success: function(data){
      successHandler(data);
    },
    error: function(err){
      errorHandler(err);
    }
  };
  return $.ajax(settings);
}
