function CheckFormInput(){
  var input_list = ["joinId","joinNickname","joinPassword","joinEmail","joinTel","joinHeight","joinWeight","joinCheckNickname"];
  var dialog_list = ["아이디는 8자 이상 영문소문자, 숫자, 특수문자를 입력해주세요",
  "닉네임은 8자 이상 영문소문자, 숫자, 특수문자",
  "비밀번호는 10자 이상의 영문대소문자, 숫자, 특수문자를 입력해주세요",
  "이메일은 형식에 맞게 입력해주세요",
  "전화번호는 형식에 맞게 입력해주세요",
  "키는 숫자만 입력 가능합니다",
  "몸무게는 숫자만 입력 가능합니다",
  "닉네임 중복체크를 진행해주세요"];
  var reg_list = new Object;
  reg_list.reg_uid = /^[a-z0-9_]{8,}$/; //8자 이상 영문소문자, 숫자, 특수문자 _ 사용가능
  reg_list.reg_nickname = /^[\w\Wㄱ-ㅎㅏ-ㅣ가-힣]{2,20}$/; //2~20자, 한글,영문,숫자 사용가능
  reg_list.reg_upw = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-]|.*[0-9]).{10,}$/; //10자 이상 영문대소문자, 숫자, 특수문자 혼합하여 사용
  reg_list.reg_email = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i; //이메일정규식
  reg_list.reg_phone = /^\d{2,3}\d{3,4}\d{4}$/; // 전화번호 정규표현식
  reg_list.reg_height = /^[0-9]*$/; //키 정규식
  reg_list.reg_weight = /^[0-9]*$/; //몸무게 정규식
  reg_list.reg_double_nick= /(yes)/; //닉네임 중복체크
  var count = 0;
  var is_true = true;
  for(var key in reg_list){
    if(!reg_list[key].test($('#'+input_list[count]).val())){
      //이벤트막고 , 기본동작 중지
      event.stopPropagation();
      event.preventDefault();

      is_true = false;
      alert(dialog_list[count]);
    }
    count++;
  };
  return is_true;
};
//정규표현식
$(".dobule_check").on('click', function(){
  var obj = $(this);
  $.ajax({
    type: "POST",
    url: "/member_double_check",
    data: JSON.stringify({
      "item_key" : $("#"+obj.attr('data-item')).attr('name'),
      "item_val" : $("#"+obj.attr('data-item')).val()
    }),
    contentType: "application/json",
    success: function(data) {
      if(data.isdouble != 'no'){
        alert("중복입니다 사용하실 수 없습니다.");
        obj.val('no');
      }else{
        alert("사용하실 수 있습니다.");
        obj.val('yes');
      }
    },
    error: function(data) {
      alert("사용하실 수 있습니다.");
      obj.val('yes');
    }
  });
});

$(".food_list .detail_submit").on('click', function(){
  $.ajax({
    type: "POST",
        url: "/food_search/seq_code",
        data: JSON.stringify({
          "food_keyword" : $(this).attr("data-keyword"),
          "result_type" : "detail_list",
          "food_category" : $(this).attr("data-category"),
          "food_seq" : $(this).attr("data-sid")
        }),
        contentType: "application/json",
        success: function(data) {
            var html="";
            for (var i = 0; i < data.ing_list.length; i++) {
              var j = 0;
              var c = 0;
              for(var key in data.ing_list[j]) {
                if(key == 'name') {
                  html += '<h2><strong>'+data.ing_list[j][key]+'</strong>';
                }
                else if(key == 'vol_str') {
                  html += data.ing_list[j][key]+'</h2>';
                }
                if(data.ing_list[j].length == c){
                  j++;
                }
                c++;
              }
            }
            $('.food_detail').html(html);
        },
        error: function(data) {
            console.log("Error!!!!!!!!!!!!");
        }
  });
});

$(document).ready(function(){
  $("#joinSex").val($("#joinSex").attr("data-sex"));
});
