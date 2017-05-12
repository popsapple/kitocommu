exports = module.exports = {BoardDbSetting  : function (mongoose,request,response,collection){
    var obj = this;
    var Schema = mongoose.Schema;

    var Memberschema = new Schema({
      post_index: Number,
      reply: String,
      writed:  { type: Date, default: Date.now },
      category:  String,
      is_notice:  String,
      writer:  String,
      title:  String,
      contents:  String,
      tags:  String,
      thumnail:  String
    }, { collection: collection });

    mongoose.models = {};
    mongoose.modelSchemas = {};

    exports.model = mongoose.model('board', Memberschema);
  },getBoardLastIndex : function (obj,mongoose,request,response,type,callback){

    var BOARD_DB_MODEL = global.BOARD_DB.model;
    if (type == 'save'){

      BOARD_DB_MODEL.count({}, function(error, numOfDocs){
          obj.post_index = numOfDocs;
          // 동기적으로 실행해야 하므로 콜백으로 처리한 함수.
          callback(obj);
      });
    }
  },setBoardSortIndex : function(obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var save_data = BOARD_DB_MODEL.find().update({$sort: { post_index: -1 }});
  },getBoardListByIndex : function (obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    page_num = page_num*page_length;
    page_length = page_num+page_length-1;
    var data = {};
    BOARD_DB_MODEL.find({post_index: { $gte: page_num, $lte: page_length }}, function(err, board){
      data.board_list = board;
      data.page_ = request.query.page;
      callback(data,mongoose,request,response);
    });
  },getBoardListBySearch : function (obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    var search_option = request.query.searchoption;
    var search_value = request.query.searchvalue;
    var search_hint;
    if(search_option == "title"){
      search_hint = {title: search_value};
    }else if(search_option == "tags"){
      search_hint = {tag: search_value};
    }else if(search_option == "writer"){
      search_hint = {writer: search_value};
    }
    page_num = page_num*page_length;
    page_length = page_num+page_length-1;
    var data = {};
    BOARD_DB_MODEL.find(search_hint, function(err, board){
      data.board_list = board;
      obj.board_post_length = data.board_list.length;
      console.log("DDDDDDDDDDDDDD ::: "+obj.board_post_length);
      data.board_list = data.board_list.slice(page_num,page_length);
      data.page_ = request.query.page;
      data.searchoption = search_option;
      data.searchvalue = search_value;
      callback(data,mongoose,request,response);
    });
  },getBoardPostByIndex : function (mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.post_index);
    BOARD_DB_MODEL.findOne({post_index: page_num}, function(err,board){
      response.render('board/view',board);
    });
  },getBoardPagingByIndex : function (obj,mongoose,request,response,type,board_post_length){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.page);
    var page_num_ = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    var page_length_ = parseInt(request.query.page_length);
    page_num = page_num*page_length;
    page_length = ((page_num*page_length)+page_length)-1;
    var numOfDocs;
    var pageOfDocs;
    var pageOfCount = [];
    obj.board_table_id = request.query.board_table_id;
    if(type == 'search'){
      numOfDocs = board_post_length;
      console.log("AAAAAAAAAAA ::: "+numOfDocs);
      numOfDocs%page_length_ == 0 ? pageOfDocs = (numOfDocs/page_length_)-1 : pageOfDocs = (numOfDocs/page_length_);
      numOfDocs <= page_length_ ? pageOfDocs = 0 : '';
      for(var i = 0; i <= pageOfDocs; i++){
        pageOfCount[i] = i;
      }
      this.getCountArray = function(obj,type,callback){
        obj.board_paging = [];
        if(type == 'all'){
          var countarray = pageOfCount.slice(0,page_length_);
          for(var c = 0; c < countarray.length; c++){
            obj.board_paging.push({"paging":c});
          }
        }
        else{
          for(var j = page_num_-4; j <= (page_num_+5); j++){
            if(pageOfCount[j]){
              obj.board_paging.push({"paging":j});
            }
          }
        }
        callback(obj);
      };
      if(page_num_ < (page_length_-1)){
        this.getCountArray(obj,'all',function(obj){
          response.render('board/list',obj);
        });
      }else{
        this.getCountArray(obj,'',function(obj){
          response.render('board/list',obj);
        });
      }
      return;
    }
    BOARD_DB_MODEL.count({}, function(error, numOfDocs){
      numOfDocs = numOfDocs;
      numOfDocs%page_length_ == 0 ? pageOfDocs = (numOfDocs/page_length_)-1 : pageOfDocs = (numOfDocs/page_length_);
      numOfDocs <= page_length_ ? pageOfDocs = 0 : '';
      for(var i = 0; i <= pageOfDocs; i++){
        pageOfCount[i] = i;
      }
      this.getCountArray = function(obj,type,callback){
        obj.board_paging = [];
        if(type == 'all'){
          var countarray = pageOfCount.slice(0,page_length_);
          for(var c = 0; c < countarray.length; c++){
            obj.board_paging.push({"paging":c});
          }
        }
        else{
          for(var j = page_num_-4; j <= (page_num_+5); j++){
            if(pageOfCount[j]){
              obj.board_paging.push({"paging":j});
            }
          }
        }
        callback(obj);
      };
      if(page_num_ < (page_length_-1)){
        this.getCountArray(obj,'all',function(obj){
          response.render('board/list',obj);
        });
      }else{
        this.getCountArray(obj,'',function(obj){
          response.render('board/list',obj);
        });
      }
    });
  }
}
