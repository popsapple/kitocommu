exports = module.exports = {BoardDbSetting  : function (mongoose,request,response,collection){
    var obj = this;
    var Schema = mongoose.Schema;

    var Memberschema = new Schema({
      _index: Number,
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
      this.settingIndex  = function(){
        BOARD_DB_MODEL.findOne({_index: obj._index}, function(err, member){
          if(err) {
            return false;
          }
          if(member){
            console.log("인덱스값 증가됩니다");
            obj._index += 1;
            that.settingIndex();
          } else {
            console.log("인덱스값을 그대로 내보냅니다");
            return false;
          }
        });
      }();
    }
    //obj._index += 1;
  }
}
