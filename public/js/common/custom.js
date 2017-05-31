$(document).ready(function() {
  if($('.main_visual.flexslider')){
    $('.main_visual.flexslider').flexslider({
      animation: "slide",
      customDirectionNav : "#MainSliderButtons button"
    });
  }

  if($(".designcustom .navbar-collapse")){
    $(".designcustom .navbar-collapse").on('click',function(event){
      if($(event.target).hasClass("navbar-collapse");){
        $(this).removeClass('in');
        return false;
      }
    });
  }
});
