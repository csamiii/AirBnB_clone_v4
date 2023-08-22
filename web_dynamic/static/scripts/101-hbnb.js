$(document).ready(init);

const HOST = '127.0.0.1';

const amenityObj = {};
const stateObj = {};
const cityObj = {};

function init () {
  $('.amenities .popover input').change(function () {
    if ($(this).is(':checked')) {
      amenityObj[$(this).attr('data-name')] = $(this).attr('data-id');
    } else if ($(this).is(':not(:checked)')) {
      delete amenityObj[$(this).attr('data-name')];
    }
    const names = Object.keys(amenityObj);
    //$('.amenities h4').text(names.sort().join(', '));
  });

  $('.stateInput').change (function () {
    if ($(this).is(':checked')) {
      stateObj[$(this).attr('data-name')] = $(this).attr('data-id');
    } else {
      delete stateObj[$(this).data('id')];
    }
    const state_names = Object.keys(stateObj);
  });

  $('.cityInput').change (function () {
    if ($(this).is(':checked')) {
      cityObj[$(this).attr('data-name')] = $(this).attr('data-id');
    } else {
      delete cityObj[$(this).data('id')];
    }
    const city_names = Object.keys(cityObj);
  });

  apiStatus();

  searchPlacesByAmenitiesStateCity();

  $('button').click(function () {
    searchPlacesByAmenitiesStateCity ()
  });
}


function apiStatus () {
  const API_URL = `http://${HOST}:5001/api/v1/status/`;
  $.get(API_URL, (data, textStatus) => {
    if (textStatus === 'success' && data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
}


function searchPlacesByAmenitiesStateCity () {
   $('article').remove();
   const PLACES_URL = `http://${HOST}:5001/api/v1/places_search/`;
   $.ajax({
    url: PLACES_URL,
    type: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ 
		amenities: Object.values(amenityObj), 
		cities: Object.values(cityObj), 
		states: Object.values(stateObj)
	}),
    success: function (data) {
      for (const place of data) {
		
		$.get(`http://${HOST}:5001/api/v1/places/${place.id}/reviews`, (res) => {
          $('section.places').append(`<article>
            <div class="title_box">
              <h2> ${place.name} </h2>
              <div class="price_by_night"> ${place.price_by_night} </div>
            </div>
            <div class="information">
              <div class="max_guest">
                <i class="fa fa-users fa-3x" aria-hidden="true"></i>
                <br /> ${place.max_guest} Guests</div>
              <div class="number_rooms">
                <i class="fa fa-bed fa-3x" aria-hidden="true"></i>
                <br /> ${place.number_rooms} Bedrooms</div>
              <div class="number_bathrooms">
                <i class="fa fa-bath fa-3x" aria-hidden="true"></i>
                <br /> ${place.number_bathrooms} Bathroom</div>
            </div>
		    <div class="description">${place.description}</div>
	  	    <div class="reviews">
                <h4 class="reviewHead">${res.length} Reviews 
				  <span id="${place.id}" class="reviewSpan" onclick="getReviews(this)">show</span></h4>
                <ul id="${place.id}1" class="listOfReviews"></ul>
            </div>
          </article>`);
		});
      }
    },
    error: function (error) {
      console.log(error);
    }
   });
}

function getReviews (obj) {
  if (obj === undefined) {
    return;
  }
  if (obj.textContent === 'show') {
    obj.textContent = 'hide';
    $.get(`http://${HOST}:5001/api/v1/places/${obj.id}/reviews`, (data, textStatus) => {
      if (textStatus === 'success') {
        for (const review of data) {
			$.get(`http://${HOST}:5001/api/v1/users/${review.user_id}`, (res) => {
	          	$(`#${obj.id}1`).append(
    	      		`<li>
 						<h4>${res.first_name} ${res.last_name} <span class="date">${formatTimeDifference(review.created_at)}</span></h4>
        	  			<p>${review.text}</p>
          	  		</li>`
				);
			});
        }
      }
    });
  } else {
    obj.textContent = 'show';
    $(`#${obj.id}1`).empty();
  }
}

function formatTimeDifference(dateString) {
  const createdDate = new Date(dateString);
  const currentDate = new Date();

  const timeDifference = Math.floor((currentDate - createdDate) / 1000); // Convert to seconds

  if (timeDifference >= 31536000) { // 1 year = 31536000 seconds
    return `${Math.floor(timeDifference / 31536000)} years ago`;
  } else if (timeDifference >= 2592000) { // 1 month = 2592000 seconds
    return `${Math.floor(timeDifference / 2592000)} months ago`;
  } else if (timeDifference >= 604800) { // 1 week = 604800 seconds
    return `${Math.floor(timeDifference / 604800)} weeks ago`;
  } else if (timeDifference >= 86400) { // 1 day = 86400 seconds
    return `${Math.floor(timeDifference / 86400)} days ago`;
  } else if (timeDifference >= 3600) { // 1 hour = 3600 seconds
    return `${Math.floor(timeDifference / 3600)} hours ago`;
  } else if (timeDifference >= 60) { // 1 minute = 60 seconds
    return `${Math.floor(timeDifference / 60)} minutes ago`;
  } else {
    return `${timeDifference} seconds ago`;
  }
}
