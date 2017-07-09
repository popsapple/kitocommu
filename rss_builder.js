module.exports.rss_builder = function (app,mongoose) {
  function CreateXmlFile(request, response, next, callback){
    var that = this;
    var builder = require('xmlbuilder');
    var dateFormat = require('dateformat');
    var now = new Date();
    var now_date = dateFormat(now, "yyyy")+dateFormat(now, "mm")+dateFormat(now, "dd")+dateFormat(now, "hh")+dateFormat(now, "MM")+dateFormat(now, "ss");
    var data = {};
    data.board_data = [];
    global.BOARD_DB.getBoardData(data,request,response,mongoose,['title','thumnail','writer_nickname','writed','category','tags','contents'],5,'RecipeIntroduce',function(data){
      var doc = builder.create('rss', {encoding: 'utf-8',version: '1.0'})
      doc.att('version', '2.0');
      var doc_pubDate = doc.ele('pubDate',{},now_date);
      var channel = doc.ele('channel');
      channel.ele('title',{},'키토제닉 커뮤니티 레시피 새소식');
      channel.ele('link',{},'https://kitocommu.herokuapp.com');
      channel.ele('description',{},'키토제닉 커뮤니티 레시피 입니다.');
      channel.ele('language',{},'ko');
      data.board_data['Board_RecipeIntroduce'].forEach(function(arr,index){
        var item = channel.ele('item');
        var title = item.ele('title',{},arr['title']);
        var link = item.ele('link',{},'https://kitocommu.herokuapp.com'+arr['link']);
        var category = item.ele('category',{},arr['category']);
        var author = item.ele('author',{},arr['writer_nickname']);
        var pubDate = item.ele('pubDate',{},arr['writed']);
        var image = item.ele('image',{},arr['thumnail']);
        var description = item.ele('description',{},arr['tags']);
      });
      return callback(that, now_date, request, response, next, doc.end({ pretty: true}));
    });
  }
  app.get('/kitucommu_rss.xml', function(request, response, next) {
    CreateXmlFile(request, response, next, function(that, now_date, request, response, next, xml){
      response.type('text/xml');
      response.send(xml);
      if(typeof next == "function"){
        next();
      }
    });
  });
}
