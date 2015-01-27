module.exports = function(grunt) {

  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-env');

  grunt.initConfig({
    
    env: {
      test: {
        NODE_ENV:'test'
      }
    },
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*_spec.js']
      }
    }
  });

  grunt.registerTask('test', ['env','mochaTest']);

};