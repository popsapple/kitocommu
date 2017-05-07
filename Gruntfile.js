module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
          js: {
              files: {'public/result.js': 'public/js/**/*.js' }
          }
    },
    cssmin: {
        target: {
            files: {
                'public/stylesheets/main.min.css': 'public/stylesheets/main.css'
            }
        }
    }
  });

  // These plugins provide necessary tasks.{% if (min_concat) { %}
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['concat','cssmin']);
}
