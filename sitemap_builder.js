module.exports.rss_builder = function (app,mongoose) {
  function CreateXmlFile(request, response, next, callback){
    var that = this;
    var builder = require('xmlbuilder');
    var dateFormat = require('dateformat');
    var now = new Date();
    var now_date = dateFormat(now, "yyyy")+dateFormat(now, "mm")+dateFormat(now, "dd")+dateFormat(now, "hh")+dateFormat(now, "MM")+dateFormat(now, "ss");
    var data = {};
    data.board_data = [];
    var doc = builder.create('urlset', {encoding: 'utf-8',version: '1.0'})
    doc.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

    /*** 게시판이 아닌 페이지는 수동으로 추가 ***/
    var url = doc.ele('url');
    var loc = url.ele('loc',{},'https://kitocommu.herokuapp.com');
    var lastmod = url.ele('lastmod',{},new Date());
    //var changefreq = url.ele('changefreq',{},'always');
    var priority = url.ele('priority',{},'0.9');

    global.BOARD_DB.getBoardData(data,request,response,mongoose,['writed'],100,'MemberDiary',function(data){
      data.board_data['Board_MemberDiary'].forEach(function(arr,index){
        var url = doc.ele('url');
        var loc = url.ele('loc',{},'https://kitocommu.herokuapp.com'+arr['link']);
        var lastmod = url.ele('lastmod',{},arr['writed']);
      //  var changefreq = url.ele('changefreq',{},'always');
        var priority = url.ele('priority',{},'0.5');
      });
      global.BOARD_DB.getBoardData(data,request,response,mongoose,['writed'],100,'MemberIntroduce',function(data){
        data.board_data['Board_MemberIntroduce'].forEach(function(arr,index){
          var url = doc.ele('url');
          var loc = url.ele('loc',{},'https://kitocommu.herokuapp.com'+arr['link']);
          var lastmod = url.ele('lastmod',{},arr['writed']);
          //var changefreq = url.ele('changefreq',{},'always');
          var priority = url.ele('priority',{},'0.5');
        });
        global.BOARD_DB.getBoardData(data,request,response,mongoose,['writed'],100,'DiteFaq',function(data){
          data.board_data['Board_DiteFaq'].forEach(function(arr,index){
            var url = doc.ele('url');
            var loc = url.ele('loc',{},'https://kitocommu.herokuapp.com'+arr['link']);
            var lastmod = url.ele('lastmod',{},arr['writed']);
          //  var changefreq = url.ele('changefreq',{},'always');
            var priority = url.ele('priority',{},'0.5');
          });
          global.BOARD_DB.getBoardData(data,request,response,mongoose,['writed'],100,'RecipeIntroduce',function(data){
            data.board_data['Board_RecipeIntroduce'].forEach(function(arr,index){
              var url = doc.ele('url');
              var loc = url.ele('loc',{},'https://kitocommu.herokuapp.com'+arr['link']);
              var lastmod = url.ele('lastmod',{},arr['writed']);
              //var changefreq = url.ele('changefreq',{},'always');
              var priority = url.ele('priority',{},'0.5');
            });
            return callback(that, now_date, request, response, next, doc.end({ pretty: true}));
          });
        });
      });
    });
  }
  app.get('/kitucommu_sitemap.xml', function(request, response, next) {
    CreateXmlFile(request, response, next, function(that, now_date, request, response, next, xml){
      response.type('text/xml');
      response.send(xml);
      if(typeof next == "function"){
        next();
      }
    });
  });
}
