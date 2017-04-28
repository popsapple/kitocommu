module.exports.member = function (app) {
  app.get('/join_member_step1', function(request, response) {
    response.render('member/join_member_step1');
  });
  app.get('/join_member_step2', function(request, response) {
  response.render('member/join_member_step2');
  });
  app.get('/join_member_step3', function(request, response) {
  response.render('member/join_member_step3');
  });
};
