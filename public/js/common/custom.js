$(document).ready(function() {
  if($('.main_visual')){
    $('.main_visual').flexslider({
      animation: "slide",
      start: function(slider){
        var slider = $('.main_visual').data('flexslider');
            slider.resize();
      },
      manualControls: ".carousel_buttons button",
      directionNav: false,
      direction:'horizontal'
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
