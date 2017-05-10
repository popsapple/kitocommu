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
  },getBoardListByIndex : function (obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    page_num = page_num*page_length;
    page_length = ((page_num*page_length)+page_length)-1;
    var data = {};
    BOARD_DB_MODEL.find({post_index: { $gte: page_num, $lte: page_length }}, function(err, board){
      data.board_list = board;
      callback(data,mongoose,request,response);
    });
  },getBoardPagingByIndex : function (obj,mongoose,request,response){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    var page_length_ = parseInt(request.query.page_length);
    page_num = page_num*page_length;
    page_length = ((page_num*page_length)+page_length)-1;
    var numOfDocs;
    var pageOfDocs;
    var pageOfCount = [];
    obj.board_table_id = request.query.board_table_id;
    BOARD_DB_MODEL.count({}, function(error, numOfDocs){
      numOfDocs = numOfDocs;
      numOfDocs%page_length_ == 0 ? pageOfDocs = (numOfDocs/page_length_) : pageOfDocs = (numOfDocs/page_length_)+1;
      numOfDocs <= page_length_ ? pageOfDocs = 0 : '';
      for(var i = 0; i <= pageOfDocs; i++){
        pageOfCount[i] = i;
      }
      var renderOfCount = pageOfCount.slice(0); // slice 를 이용한 깊은 복사.
      if(page_num <= page_length){
        obj.board_paging = renderOfCount.slice(0,page_length);
      }else{
        obj.board_paging = renderOfCount.slice((page_num-4),(page_num+5));
      }
      response.render('board/list',obj);
    });
  }
}
