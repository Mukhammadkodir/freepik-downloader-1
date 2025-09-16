/* Add here all your JS customizations */

$(document).ready(function () {
  $("#callback").submit(function (event) {
    var formData = {
      name: $("#name").val(),
      phone: $("#phone").val(),
    };

    $.ajax({
      type: "POST",
      url: "/ajax/telegram.php",
      data: formData,
      dataType: "json",
      encode: true,
    }).done(function (data) {
      console.log(data);
      $('#success_text').html(data);
    });

    event.preventDefault();
  });
});












$(document).ready(function () {
	
	$('.multiple_items').slick({
	      dots: true,
	      slidesToShow: 4,
	      slidesToScroll: 1,
	      arrows: true,
	      adaptiveHeight: true,
	      responsive: [
	                   {
	                     breakpoint: 1024,
	                     settings: {
	                       slidesToShow: 3,
	                       slidesToScroll: 3,
	                       infinite: true,
	                       dots: true
	                     }
	                   },
	                   {
	                     breakpoint: 600,
	                     settings: {
	                       slidesToShow: 2,
	                       slidesToScroll: 2
	                     }
	                   },
	                   {
	                     breakpoint: 480,
	                     settings: {
	                       slidesToShow: 1,
	                       slidesToScroll: 1
	                     }
	                   }
	                   // You can unslick at a given breakpoint now by adding:
	                   // settings: "unslick"
	                   // instead of a settings object
	                 ]
	    });
	
	
	$('.portfolio_vidoes').slick({
		  infinite: false,
		  dots:true,
		  slidesToShow: 2,
		  slidesToScroll: 1,
		  autoplay: true,
		  autoplaySpeed: 1500,
		});
					
	
	
	  $('.dropdown-menu-col a').click(function () {
	      //get the selected flag class
	      var selectedFlag = $(this).find('span').attr('class');
	      $('.current').text($(this).text());
	      //remove the previous flag class
	      $('.dropdown.dropdown-lang').find('button>span').removeClass();
	      //add the newly selected flag class
	      $('.dropdown.dropdown-lang').find('button>span').addClass(selectedFlag);
	  });
	});


$(document).ready(function(){
    $('.match_height').matchHeight();
})