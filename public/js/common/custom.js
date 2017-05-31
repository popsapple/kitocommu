$(document).ready(function() {
  if($('.main_visual.flexslider')){
    $('.main_visual.flexslider').flexslider({
      animation: "slide",
      manualControls: "#MainSliderButtons button"
    });
  }

  if($(".designcustom .navbar-collapse")){
    $(".designcustom .navbar-collapse").on('click',function(event){
      if($(event.target).hasClass("navbar-collapse") || $(event.target).hasClass("close_btn")){
        $(this).removeClass('in');
        return false;
      }
    });
  }
});
