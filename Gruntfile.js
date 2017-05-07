/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat:{
       options: {
           banner: '/ 작업자 :: 현가람, 최종작업일 :: <%= grunt.template.today("yyyy-mm-dd") %> / ',  // 합치고 맨 처음에 출력할 내용
           footer: '/ Keep his decrees and commands, which I am giving you today, so that it may go well with you and your children after you and that you may live long in the land the LORD your God gives you for all time.  / ',  // 합치고 맨 나중에 출력할 내용
           separator: '/ separate /', // 각 파일이 합쳐지는 시점에 들어갈 내용
           stripBanners:  { //각각의 파일에 쓰여있는 JavaScript banner comments 제거여부
               force: false,
               all: false
           }
       },
       basic: {
           src: [
           'public/js/common/form_check.js'
         ],
         dest: 'public/result.js'
       }
   }
  });

  // These plugins provide necessary tasks.{% if (min_concat) { %}
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat']);
};
