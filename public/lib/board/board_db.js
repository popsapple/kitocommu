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
  },getBoardLastIndex : function (obj,mongoose,request,response,type){

    var BOARD_DB_MODEL = global.BOARD_DB.model;
    if (type == 'save'){
      var that = this;
      function settingIndex() {
        BOARD_DB_MODEL.findOne({post_index: obj.post_index}, function(err, board){
          if(err) {
            return false;
          }
          if(board){
            console.log("인덱스값 증가됩니다 ::"+obj.post_index);
            obj.post_index += 1;
            setTimeout(settingIndex(),50);
          } else {
            console.log("인덱스값을 그대로 내보냅니다 ::"+obj.post_index);
          //  console.log("인덱스값을 그대로 내보냅니다 ::"+board._index);
            return false;
          }
        });
      };

      setTimeout(settingIndex(),50);
    }
    //obj._index += 1;
  }
}
