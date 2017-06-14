var geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json';
var geocodeKey = 'AIzaSyBomPH1s3ajX87qrX0YeRJ6iiaVuGbVwpU';
var openStatesLegislatorURL = 'https://openstates.org/api/v1/legislators/geo/';
var openStatesBillURL = 'https://openstates.org/api/v1/bills/';
var openStatesKey = 'ad0a422f-9bf4-4eb9-808a-0d1bb03d0867';
var renderLegislatorTemplate = function(item){
  return `
  <div class="col-xs-12 col-md-5 col-md-offset-2 legislator-card">
    <div class="image-cropper">
      <img src="${item.photo_url}" class="leg-img" alt="${item.full_name}"/>
    </div>
    <h3>${item.chamber} ${item.full_name} </br></h3>
    <p>
      Party: ${item.party} </br>
      ${item.chamber} </br>
      District: ${item.district} </br>
      Email: ${item.email}</br>
      Phone: ${item.phone}</br>
      <a href="${item.url}" target="_blank">Legislator Profile</a></br>
      <button id="billButton" class="btn btn-info" onclick="displayBillResults('${item.leg_id}', true) "> Take Action on Legislation ${item.full_name} Sponsored</button>
    </p>

  </div>
  `;
}


var renderBillTemplate = function(item){
  return `
  <div class="col-md-12">
    <a href="https://www.takebackyourstate.com/#/${item.state}/bills/${item.bill_id}?year=${item.session.substring(0,4)}" target= "_blank"><span class="bold">${item.bill_id}</span> ${item.title}</a> </br></br>
  </div>
  `;
}

var state = {
legislatorResults: [],
billResults:{},
cursor: 5,
currentPosition: 0
};


function renderNextButton(state, leg_id){
  if (state.currentPosition <= state.billResults[leg_id].length - 1 ){
    return $(".js-bill-results").append(`<button class="next" onclick="displayNextBillResults('${leg_id}')"; >next</button>`);
  } else {
    return $(".js-bill-results").append('');
  }
}

function renderPrevButton(state, leg_id){
  if (state.currentPosition >= state.cursor - 1){
    return $(".js-bill-results").append(`<button class="prev" onclick="displayPrevBillResults('${leg_id}'); animateScrollToBills()"; >prev</button>`);
  } else {
    return $(".js-bill-results").append('');
  }
}

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
    state.billResults[item.leg_id] = [];
    getBillsSponsoredByLegislator(item.leg_id);
  });
}

function openStatesBillSuccessHandler(data, leg_id) {
  data.forEach(function(item){
    item.bill_id = item.bill_id.replace(/\s/g, '');
    item.state = item.state.toUpperCase();
    item.leg_id = leg_id;
    state.billResults[leg_id].push(item);
  });
console.log(state.billResults);
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
    item.chamber = item.chamber === 'lower' ? 'Representative' : 'Senator';
    item.email = item.offices[0].email ? item.offices[0].email : 'No data provided';
    item.phone = item.offices[0].phone ? item.offices[0].phone : 'No data provided';
    return renderLegislatorTemplate(item);

  });
  $('.js-search-results').html(results);

}

function displayNextBillResults(leg_id) {

  var results = [];
  for (var i = state.currentPosition + 1; i <= (state.cursor + state.currentPosition); i++){
    if(i < state.billResults[leg_id].length - 1){
      item = state.billResults[leg_id][i];
      results.push(renderBillTemplate(item));
    }
  }
  state.currentPosition+=state.cursor;
  $('.js-bill-results').html(results);
  renderNextButton(state, leg_id);
  renderPrevButton(state, leg_id);

}

function displayPrevBillResults(leg_id) {

  var results = [];
  var position = state.currentPosition > state.billResults[leg_id].length - 1 ? state.billResults[leg_id].length - 1 : state.currentPosition;
  for (var i = position; (position - state.cursor + 1) <= i; i--){
    if(i >= 0){
      item = state.billResults[leg_id][i];
      results.push(renderBillTemplate(item));
    }
  }
  results = results.reverse();
  state.currentPosition-=state.cursor;
  if (state.currentPosition < 0) {
    state.currentPosition = 4;
  }
  $('.js-bill-results').html(results);
  renderNextButton(state, leg_id);
  renderPrevButton(state, leg_id);

}

function displayBillResults(leg_id, reset){
  if(reset){
    state.currentPosition = 4;
  }
  var results = [];

  for (var i = 0; i < state.cursor; i++){
    if(i < state.billResults[leg_id].length - 1){
      item = state.billResults[leg_id][i];
      results.push(renderBillTemplate(item));
    }
  }
  animateScrollToBills();
  $('.js-bill-results').html(results);
  renderNextButton(state, leg_id);
}


function listenForSubmit() {
  $('.js-search').click(function(event) {
    event.preventDefault();
    var address = $('.js-query').val();
    $('.js-query').val("");
    getDataFromGeocodeApi(address);

  });

  $('.js-search').click(function() {
    $('html, body').animate({
        scrollTop: $("#legislators").offset().top
    }, 500);
});
}

function animateScrollToBills(){
  $('#billButton').click(function() {
    $('html, body').animate({
        scrollTop: $("#bills").offset().top

    }, 500);
});
}


$(listenForSubmit);
