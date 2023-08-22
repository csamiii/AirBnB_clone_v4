$(document).ready(init);

const HOST = '127.0.0.1';

const amenityObj = {};
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

  apiStatus();

  get_places();

  $('button').click(function () {
    searchPlacesByAmenities();
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

function get_places () {
  const API_URL = `http://${HOST}:5001/api/v1/places_search/`
  $.ajax({
    type: 'POST',
    url: API_URL,
    data: JSON.stringify({}),
    contentType: 'application/json',
    success: function (data) {
      for (let i = 0; i < data.length; i++) {
        $('section.places').append(`<article>
          <div class="title_box">
            <h2>${data[i].name}</h2>
            <div class="price_by_night"> ${data[i].price_by_night} </div>
          </div>
          <div class="information">
            <div class="max_guest">
              <i class="fa fa-users fa-3x" aria-hidden="true"></i>
              <br /> ${data[i].max_guest} Guests</div>
              <div class="number_rooms"><i class="fa fa-bed fa-3x" aria-hidden="true"></i><br /> ${data[i].number_rooms} Bedrooms</div>
              <div class="number_bathrooms"><i class="fa fa-bath fa-3x" aria-hidden="true"></i><br /> ${data[i].number_bathrooms} Bathroom</div>
            </div>
            <div class="description"> ${data[i].description} '</div>
         </article>`);
      }
    }
  });
}

function searchPlacesByAmenities () {
   $('article').remove();
   const PLACES_URL = `http://${HOST}:5001/api/v1/places_search/`;
   $.ajax({
    url: PLACES_URL,
    type: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ amenities: Object.values(amenityObj) }),
    success: function (data) {
      for (let i = 0; i < data.length; i++) {
        $('section.places').append(`<article>
          <div class="title_box">
            <h2> ${data[i].name} </h2>
            <div class="price_by_night"> ${data[i].price_by_night} </div>
          </div>
          <div class="information">
            <div class="max_guest">
              <i class="fa fa-users fa-3x" aria-hidden="true"></i>
              <br /> ${data[i].max_guest} Guests</div>
              <div class="number_rooms">
                <i class="fa fa-bed fa-3x" aria-hidden="true"></i>
                <br /> ${data[i].number_rooms} Bedrooms</div>
              <div class="number_bathrooms">
                <i class="fa fa-bath fa-3x" aria-hidden="true"></i>
                <br /> ${data[i].number_bathrooms} Bathroom</div>
            </div>
            <div class="description">${data[i].description}</div>
        </article>`);
      }
    },
    error: function (error) {
      console.log(error);
    }
   });
}
