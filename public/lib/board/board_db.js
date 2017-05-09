exports = module.exports = {BoardDbSetting  : function (mongoose,request,response){
    console.log("들어옵니다");
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
