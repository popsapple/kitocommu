module.exports.member = function (app) {
  app.get('/join_member', function(request, response) {
    response.render('member/join_member');
  });
  app.get('/join_member_step2', function(request, response) {
    response.render('pages/index');
  });
};
