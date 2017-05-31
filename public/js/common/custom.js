$(document).ready(function() {
  alert("AAAAAAA");
  if($('.main_visual.flexslider')){
    $('.main_visual.flexslider').flexslider({
      animation: "slide",
      customDirectionNav : "#MainSliderButtons button"
    });
  }

  if($(".designcustom .navbar-collapse")){
    $(".designcustom .navbar-collapse").on('click',function(){
      $(this).removeClass('in');
      $(this).toggleClass('active');
    });
  }

  if($(".navbar-header > button")){
    $(".navbar-header > button").on('click',function(){
      $(this).toggleClass('active');
    });
  }
});
