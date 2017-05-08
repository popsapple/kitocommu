module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      files: {'public/js/result.js': 'public/js/**/*.js' }
    },
    cssmin: {
      files: {
        'public/stylesheets/main.min.css': 'public/stylesheets/main.css'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'public/js/result.js',
        dest: 'public/js/result.min.js'
      }
    }
  });

  // These plugins provide necessary tasks.{% if (min_concat) { %}
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Here is where we would define our task
    grunt.registerTask('default', ['uglify', 'cssmin', 'concat']);
}
