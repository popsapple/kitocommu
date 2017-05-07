/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  });

  // These plugins provide necessary tasks.{% if (min_concat) { %}

  // Default task(s).
  grunt.registerTask('default');
};
