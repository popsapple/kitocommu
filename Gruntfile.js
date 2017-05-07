module.exports = function(grunt) {

   // Project configuration.
   grunt.initConfig({
       pkg: grunt.file.readJSON('package.json'),

       concat:{
           options: {
               banner: '/ <%= grunt.template.today("yyyy-mm-dd") %> / ',  //동작 시점의 날짜가 출력
               separator: '/ concat separator /',
               stripBanners:  {
                   force: true,
                   all: true
               }
           },
           basic: {
               src: [
             'public/js/common/util.js',
             'public/js/app.js',
             'public/js/ctrl/.js'
           ],
               dest: 'public/build/result.js'
           }
       }
   });

   // Load the plugin that provides the "concat" task.
   grunt.loadNpmTasks('grunt-contrib-concat');

   // Default task(s).
   grunt.registerTask('default', ['concat']);

};
