var geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json';
var geocodeKey = 'AIzaSyBomPH1s3ajX87qrX0YeRJ6iiaVuGbVwpU';
var openStatesLegislatorURL = 'https://openstates.org/api/v1/legislators/geo/';
var openStatesBillURL = 'https://openstates.org/api/v1/bills/';
var openStatesKey = 'ad0a422f-9bf4-4eb9-808a-0d1bb03d0867';
var renderLegislatorTemplate = function(item){
  return `
  <div class="col-xs-6 col-md-3">
    <h2>Your Legislators</h2>
    <img src="${item.photo_url}" alt="${item.full_name}"/>
    <p>
      ${item.full_name} </br>
      Party: ${item.party} </br>
      ${item.chamber} </br>
      District: ${item.district} </br>
      Email: ${item.email}</br>
      Phone: ${item.phone}</br>
      <a href="${item.url}" target="_blank">Legislator Profile</a></br>
      <button class="btn btn-info" onclick="displayBillResults('${item.leg_id}')"> button </button>
    </p>

  </div>
  `;
}


var renderBillTemplate = function(item){
  return `
  <div class="col-xs-6 col-md-3">
    <a href="https://www.takebackyourstate.com/#/${item.state}/bills/${item.bill_id}?year=${item.session.substring(0,4)}" target= "_blank">${item.bill_id} ${item.title}</a>

  </div>
  `;
}

var state = {
legislatorResults: [],
billResults:[]
};

function errorHandler(err){
  console.error(err);
}

function geocodeSuccessHandler(data){
	var lat = data.results[0].geometry.location.lat;
  var lng = data.results[0].geometry.location.lng;
	getLegislatorData(lat, lng);

}

function openStatesLegislatorSuccessHandler(data){
  state.legislatorResults = data;
  displayLegislatorResults(state.legislatorResults);
  state.legislatorResults.forEach(function(item) {
    getBillsSponsoredByLegislator(item.leg_id);
  });
}

function openStatesBillSuccessHandler(data, leg_id) {
  data.forEach(function(item){
    item.bill_id = item.bill_id.replace(/\s/g, '');
    item.state = item.state.toUpperCase();
    item.leg_id = leg_id;
    state.billResults.push(item);
  });
}



function getDataFromGeocodeApi(address) {
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

function getLegislatorData(lat, long) {
  var settings = {
    url: openStatesLegislatorURL,
    data: {
      apikey: openStatesKey,
      lat: lat,
      long: long,
    },
    dataType: 'json',
    type: 'GET',
    success: function(data){
      openStatesLegislatorSuccessHandler(data);
    },
    error: function(err){
      errorHandler(err);
    }
  };
  return $.ajax(settings);
}

function getBillsSponsoredByLegislator(leg_id){
  var settings = {
    url: openStatesBillURL,
    data: {
      apikey: openStatesKey,
      sponsor_id: leg_id,
      search_window: 'session'
    },
    dataType: 'json',
    type: 'GET',
    success: function(data){
      openStatesBillSuccessHandler(data, leg_id);
    },
    error: function(err){
      errorHandler(err);
    }
  };
  return $.ajax(settings);
}


function displayLegislatorResults(data) {

  var results = data.map(function(item, index) {
    item.chamber = item.chamber === 'lower' ? 'House Representative' : 'Senator';
    item.email = item.offices[0].email ? item.offices[0].email : 'No data provided';
    item.phone = item.offices[0].phone ? item.offices[0].phone : 'No data provided';
    return renderLegislatorTemplate(item);

  });
  $('.js-search-results').html(results);

}

function displayBillResults(leg_id){
  var results = [];
  state.billResults.map(function(item, index) {
    if (item.leg_id === leg_id){
      results.push(renderBillTemplate(item));
    }
  });
  $('.js-bill-results').html(results);
  console.log(results);
}

function listenForSubmit() {
  $('.js-search').click(function(event) {
    event.preventDefault();
    var address = $('.js-query').val();
    $('.js-query').val("");
    getDataFromGeocodeApi(address);
  });
}


$(listenForSubmit);
