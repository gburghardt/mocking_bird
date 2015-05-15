module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    concat: {
      options: {
        banner: "/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today(\"yyyy-mm-dd\") %> */\n"
      },

      base: {
        src: [
          "src/MockingBird.js",
          "src/MockingBird/XMLHttpRequest.js",
          "src/MockingBird/XMLHttpRequest/ConnectionBuilderStrategy.js",
          "src/MockingBird/XMLHttpRequest/MockBuilder.js",
          "src/MockingBird/XMLHttpRequest/RequestInfo.js",
          "src/MockingBird/XMLHttpRequest/SimpleConnectionStrategy.js",
          "src/MockingBird/XMLHttpRequestInterceptor.js",
          "src/MockingBird/XMLHttpRequestProxy.js"
        ],
        dest: "dist/<%= pkg.name %>.js"
      }
    },

    min: {
      base: {
        src: "dist/<%= pkg.name %>.js",
        dest: "dist/<%= pkg.name %>.min.js"
      }
    },

    jsdoc: {
      dist: {
        src: ["src/**/*.js"],
        dest: "docs"
      }
    }
  });

  // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Load the plugin that provides the "min" task.
  grunt.loadNpmTasks('grunt-yui-compressor');

  // Load the plugin that provides the "jsdoc" task.
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'min', 'jsdoc']);
}