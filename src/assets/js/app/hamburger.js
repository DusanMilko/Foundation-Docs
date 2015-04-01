var $ = require('jquery');

module.exports = function() {
  $('.js-hamburger').on( "click", function(e) {
    e.preventDefault;

    if( $(this).hasClass('is-active') ){
      $(this).removeClass('is-active');
      $('.js-hamburger-cont').removeClass('is-active');
    } else {
      $(this).addClass('is-active');
      $('.js-hamburger-cont').addClass('is-active');
    }

    return false;
  });
}