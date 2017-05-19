module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      basic: {
        src: ['public/js/common/form_check.js','public/js/common/jquery_form.js','public/js/common/board.js'],
        dest: 'public/js/result.js'
      }
    },
    cssmin: {
      minify:{
         expand: true,
         cwd: 'public/stylesheets/',
         src: ['editor_contets.css', 'main.css'],
         dest: 'public/stylesheets',
         ext: '.min.css'
     }
    },
    uglify: {
      build: {
        src: 'public/js/result.js',
        dest: 'public/js/result.min.js'
      }
    }
  });

  // These plugins provide necessary tasks.{% if (min_concat) { %}
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Here is where we would define our task
  grunt.registerTask('default', ['concat', 'cssmin', 'uglify']);
}
