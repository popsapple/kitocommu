$(document).ready(function() {
  console.log("AAAAAAA");
  if($('.main_visual.flexslider')){
    $('.main_visual.flexslider').flexslider({
      animation: "slide",
      customDirectionNav : "#MainSliderButtons button"
    });
  }

  if($(".designcustom .navbar-collapse.in")){
    $(".designcustom .navbar-collapse.in").on('click',function(){
      $(this).removeClass('in');
    });
  }
});
