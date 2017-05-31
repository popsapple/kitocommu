$(document).ready(function() {
  if($('.main_visual.flexslider')){
    $('.main_visual.flexslider').flexslider({
      animation: "slide",
      customDirectionNav : "#MainSliderButtons button"
    });
  }

  if($(".designcustom .navbar-collapse.in")){
    $(".designcustom .navbar-collapse.in").on('click',function(){
      console.log("????????");
      $(this).removeClass('in');
    });
  }
});
