exports = module.exports = { BoardrMethod : function (obj,mongoose,request,response){
    /** 나중에 스팸방지 달 때 필요할지 모르지 일단 넣어두자  **/
  },
  BoardDbSetting  : function (mongoose,request,response){
    var obj = this;
    var Schema = mongoose.Schema;

    var Memberschema = new Schema({
      reply:    String,
      writed:  { type: Date, default: Date.now },
      category:  String,
      is_notice:  String,
      writer:  String,
      title:  String,
      contents:  String,
      tags:  String,
      thumnail:  String
    }, { collection: 'Board_MemberIntroduce' });

    mongoose.models = {};
    mongoose.modelSchemas = {};

    exports.model = mongoose.model('board', Memberschema);
  }
}
