exports = module.exports = {getMemberListByIndex : function (mongoose,request,response,callback,type){
  var that = this;
  that.db_model = global.MEMBER_DB.model;
  var page_num;
  var page_num_;
  var page_length;
  var page_length_;
  if(request.query.page == undefined){
    page_num = 0;
    page_num_ = 0;
    page_length = 10;
    page_length_ = 10;
  }else{
    page_num = parseInt(request.query.page);
    page_num_ = parseInt(request.query.page);
    page_length = parseInt(request.query.page_length);
    page_length_ = parseInt(request.query.page_length);
  }

  var board_id = 'Memberschema';
  that.getListing = function(){
    that.db_model.count({}, function(error, numOfDocs){
      page_num = numOfDocs-(page_num*page_length);
      page_length = page_num-page_length+1;
      var data = {};

      if(type == 'search'){
        var search_option = request.query.searchoption;
        var value = request.query.searchvalue.toString();
        if(search_option == "nickname"){
          data = {"nickname": value};
        }else if(search_option == "id"){
          data = {"id": value};
        }else if(search_option == "member_level"){
          data = {"member_level": value};
        }
      }
      that.db_model.find(data, function(err, member_list){
        var count = 0;
        member_list.member_list = [];
        member_list.forEach(function(arr,index){
          if(arr.nickname != undefined){
            member_list.member_list[count] = arr; //member_list.splice(page_length,page_length_);
            count++;
          }
          if(index == (member_list.length-1)){
            console.log("끝");
            member_list.page_ = page_num_;
            global.ADMIN_DB.getMemberPagingByIndex(member_list,mongoose,request,response,type);
          }
        });
      });
    });
  }();
},getMemberPagingByIndex : function (member_list,mongoose,request,response,type){
    console.log("getMemberPagingByIndex");
    var member_db = global.MEMBER_DB.model;
    var page_num;
    var page_num_;
    var page_length;
    var page_length_;
    if(request.query.page == undefined){
      page_num = 0;
      page_num_ = 0;
      page_length = 10;
      page_length_ = 10;
    }else{
      page_num = parseInt(request.query.page);
      page_num_ = parseInt(request.query.page);
      page_length = parseInt(request.query.page_length);
      page_length_ = parseInt(request.query.page_length);
    }
    page_num = page_num*page_length;
    page_length = ((page_num*page_length)+page_length)-1;
    var numOfDocs;
    var pageOfDocs;
    var pageOfCount = [];
    var board_id = 'Memberschema';

    member_db.count({}, function(error, numOfDocs){
      numOfDocs = numOfDocs;
      numOfDocs%page_length_ == 0 ? pageOfDocs = (numOfDocs/page_length_)-1 : pageOfDocs = (numOfDocs/page_length_);
      numOfDocs <= page_length_ ? pageOfDocs = 0 : '';
      for(var i = 0; i <= pageOfDocs; i++){
        pageOfCount[i] = i;
      }
      this.getCountArray = function(member_list,type,callback){
        member_list.board_paging = [];
        if(type == 'all'){
          var countarray = pageOfCount.slice(0,page_length_);
          for(var c = 0; c < countarray.length; c++){
            member_list.board_paging.push({"paging":c});
          }
        }
        else{
          for(var j = page_num_-4; j <= (page_num_+5); j++){
            if(pageOfCount[j]){
              member_list.board_paging.push({"paging":j});
            }
          }
        }
        if(typeof callback == "function"){
          callback(member_list);
        }
      };
      if(page_num_ < (page_length_-1)){
        this.getCountArray(member_list,'all',function(member_list){ // 맨 마지막 페이지일때
          console.log("getCountArray == all");
          member_list.board_id = board_id;
          response.render('admin/member_list',member_list);
        });
      }else{
        this.getCountArray(member_list,'',function(member_list){
          console.log("getCountArray == none");
          member_list.board_id = board_id;
          response.render('admin/member_list',member_list);
        });
      }
    });
  }
}
