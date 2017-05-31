$(document).ready(function() {
  if($('.main_visual.flexslider')){
    $('.main_visual.flexslider').flexslider({
      animation: "slide",
      customDirectionNav : "#MainSliderButtons button"
    });
  }

  if($(".designcustom .navbar-collapse")){
    $(".designcustom .navbar-collapse").on('click',function(){
      $(this).removeClass('in');
    });
  }
});
