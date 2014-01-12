/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      version: '<%= pkg.version %>',
      banner_main:
              ' * Tableling v<%= meta.version %>\n' +
              ' * Copyright (c) 2012-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
              ' * Distributed under MIT license\n' +
              ' * <%= pkg.homepage %>\n',
      banner_header: '/*!\n',
      banner_footer: ' */',
      banner_incl_basics:
        ' * Includes JSON2\n' +
        ' * https://github.com/douglascrockford/JSON-js\n' +
        ' * Includes jQuery\n' +
        ' * http://jquery.com' +
        ' * Includes Underscore\n' +
        ' * http://underscorejs.org\n',
      banner_incl_backbone:
        ' * Includes Backbone\n' +
        ' * http://backbonejs.org\n' +
        ' * Includes Backbone.Marionette\n' +
        ' * https://github.com/marionettejs/backbone.marionette\n',
      banner: '<%= meta.banner_header %>' +
              '<%= meta.banner_main %>' +
              '<%= meta.banner_footer %>' +
              '\n',
      banner_backbone: '<%= meta.banner_header %>' +
                       '<%= meta.banner_main %>' +
                       ' *\n' +
                       '<%= meta.banner_incl_backbone %>' +
                       '<%= meta.banner_footer %>' +
                       '\n',
      banner_world: '<%= meta.banner_header %>' +
                    '<%= meta.banner_main %>' +
                    ' *\n' +
                    '<%= meta.banner_incl_basics %>' +
                    '<%= meta.banner_incl_backbone %>' +
                    '<%= meta.banner_footer %>' +
                    '\n'
    },

    concat: {
      standard: {
        options: {
          banner: '<%= meta.banner %>',
        },
        src: [
          'res/tableling.header.js',
          'src/tableling.core.js',
          'src/tableling.modular.js',
          'src/tableling.plain.js',
          'src/tableling.bootstrap.js',
          'res/tableling.footer.js'
        ],
        dest: 'lib/tableling.js'
      },
      backbone: {
        banner: '<%= meta.banner_backbone %>',
        src: [
          'vendor/backbone.js',
          'vendor/backbone.marionette.js',
          'lib/tableling.js'
        ],
        dest: 'lib/bundles/tableling.backbone.js'
      },
      world: {
        src: [
          'vendor/json2.js',
          'vendor/jquery.js',
          'vendor/underscore.js',
          'vendor/backbone.js',
          'vendor/backbone.marionette.js',
          'lib/tableling.js'
        ],
        dest: 'lib/bundles/tableling.world.js'
      }
    },

    uglify: {
      options: {
        report: 'min'
      },
      standard: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          'lib/tableling.min.js': [ '<%= concat.standard.dest %>' ]
        }
      },
      backbone: {
        options: {
          banner: '<%= meta.banner_backbone %>'
        },
        files: {
          'lib/bundles/tableling.backbone.min.js': [ '<%= concat.backbone.dest %>' ]
        }
      },
      world: {
        options: {
          banner: '<%= meta.banner_world %>'
        },
        files: {
          'lib/bundles/tableling.world.min.js': [ '<%= concat.world.dest %>' ]
        }
      }
    },

    copy: {
      demo: {
        files: [
          { expand: true, cwd: 'lib/bundles/', src: 'tableling.world.*', dest: 'docs/demo/', flatten: true, filter: 'isFile' }
        ]
      }
    },

    jasmine: {
      standard: {
        src: [
          'vendor/jquery.js',
          'vendor/json2.js',
          'vendor/underscore.js',
          'vendor/backbone.js',
          'vendor/backbone.marionette.js',
          'lib/tableling.js'
        ],
        options: {
          helpers: 'spec/javascripts/helpers/*.js',
          specs: 'spec/javascripts/**/*.spec.js'
        }
      }
    },

    jshint: {
      standard: {
        src: [ 'src/*.js' ],
        globals: {
          Backbone: true,
          _: true,
          $: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [ 'jshint', 'concat', 'jasmine', 'uglify', 'copy' ]);
};
