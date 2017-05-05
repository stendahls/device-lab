module.exports = function(grunt) {

    var compression = require('compression');
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        settings: {
            dist: 'dist',
            src: 'src',
            build: 'build',
            npm: 'node_modules',
            grunt: ''
        },

        clean: {
            dist: '<%= settings.dist %>'
        },

        concat: {
            radar: {
                src: [
                    '<%= settings.npm %>/fontfaceobserver/fontfaceobserver.js',
                    '<%= settings.npm %>/jquery/dist/jquery.js',
                    '<%= settings.npm %>/csvtojson/dist/csvtojson.js',
                    '<%= settings.npm %>/ua-parser-js/dist/ua-parser.min.js',
                    '<%= settings.src %>/js/base/utilities.js',
                    '<%= settings.src %>/js/base/storage.js',
                    '<%= settings.src %>/js/base/webfontObserver.js',
                    '<%= settings.src %>/js/config/01.config.browsers.js',
                    '<%= settings.src %>/js/config/02.config.gapi.js',
                    '<%= settings.src %>/js/config/03.config.view.js',
                    '<%= settings.src %>/js/display/01.svg.js',
                    '<%= settings.src %>/js/display/05.ballpit.js',
                    '<%= settings.src %>/js/display/10.display.js',
                    '<%= settings.src %>/js/display/20.control.js',
                    '<%= settings.src %>/js/process/10.chooseData.js',
                    '<%= settings.src %>/js/process/20.oauth.js',
                    '<%= settings.src %>/js/process/30.retrieve-radar.js',
                    '<%= settings.src %>/js/process/40.process.js',
                    '<%= settings.src %>/js/process/45.process.browsers.js',
                    '<%= settings.src %>/js/process/50.whoAmI.js',
                    '<%= settings.src %>/js/process/70.lookup.js'
                ],
                dest: '<%= settings.dist %>/js/radar.js'
            },
            lab: {
                src: [
                    '<%= settings.npm %>/fontfaceobserver/fontfaceobserver.js',
                    '<%= settings.npm %>/jquery/dist/jquery.js',
                    '<%= settings.npm %>/csvtojson/dist/csvtojson.js',
                    '<%= settings.npm %>/flickity/dist/flickity.pkgd.js',
                    '<%= settings.src %>/js/base/utilities.js',
                    '<%= settings.src %>/js/base/storage.js',
                    '<%= settings.src %>/js/base/webfontObserver.js',
                    '<%= settings.src %>/js/config/01.config.browsers.js',
                    '<%= settings.src %>/js/config/02.config.gapi.js',
                    '<%= settings.src %>/js/config/03.config.view.js',
                    '<%= settings.src %>/js/process/20.oauth.js',
                    '<%= settings.src %>/js/process/30.retrieve-lab.js'
                ],
                dest: '<%= settings.dist %>/js/lab.js'
            }
        },

        uglify: {
            options: {
                compress: {
                    warnings: false
                },
                mangle: true,
                preserveComments: 'some'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: '<%= settings.dist %>/js/script.min.js'
            }
        },

        sass: {
            options: {
                sourceMap: false
            },
            core: {
                files: {
                    '<%= settings.dist %>/css/radar.css': '<%= settings.src %>/scss/radar.scss',
                    '<%= settings.dist %>/css/lab.css': '<%= settings.src %>/scss/lab.scss'
                }
            }
        },

        autoprefixer: {
            options: {
              "config": {
                "autoprefixerBrowsers": [
                  "Android 2.3",
                  "Android >= 4",
                  "Chrome >= 20",
                  "Firefox >= 24",
                  "Explorer >= 8",
                  "iOS >= 6",
                  "Opera >= 12",
                  "Safari >= 6"
                ]
              }
            },
            radar: {
                options: {
                    map: true
                },
                src: '<%= settings.dist %>/css/radar.css'
            },
            lab: {
                options: {
                    map: true
                },
                src: '<%= settings.dist %>/css/lab.css'
            }
        },

        cssmin: {
            options: {
                compatibility: 'ie8',
                keepSpecialComments: '*',
                advanced: false
            },
            radar: {
                src: '<%= settings.dist %>/css/radar.css',
                dest: '<%= settings.dist %>/css/radar.min.css'
            },
            lab: {
                src: '<%= settings.dist %>/css/lab.css',
                dest: '<%= settings.dist %>/css/lab.min.css'
            }
        },

        copy: {
            root: {
                expand: true,
                cwd: '<%= settings.src %>/',
                src: [ '*.html', '*.txt', '*.json' ],
                dest: '<%= settings.dist %>/'
            },
            imgs: {
                expand: true,
                cwd: '<%= settings.src %>/imgs',
                src: [ '*.png','*.jpg','*.gif','*.svg' ],
                dest: '<%= settings.dist %>/imgs/'
            },
            rootjs: {
                expand: true,
                cwd: '<%= settings.src %>/js/root',
                src: [ '*.js' ],
                dest: '<%= settings.dist %>/'
            },
            swToolbox: {
                expand: true,
                cwd: '<%= settings.npm %>/sw-toolbox',
                src: [ '*.js','*.js.map' ],
                dest: '<%= settings.dist %>/js'
            }
        },

        watch: {

            options: {
                event: ['added', 'changed', 'deleted']
            },

            root: {
                files: ['<%= settings.src %>/*.txt', '<%= settings.src %>/*.html', '!<%= settings.src %>/index.html'],
                tasks: ['copy:root']
            },

            scripts: {
                files: ['<%= settings.src %>/**/*.js'],
                tasks: ['concat', 'copy:rootjs', 'copy:swToolbox']
            },

            sass: {
                files: ['<%= settings.src %>/**/*.scss'],
                tasks: ['sass','autoprefixer']
            },

            img: {
                files: ['<%= settings.src %>/imgs/*'],
                tasks: ['copy:img']
            },

            fonts: {
                files: ['<%= settings.src %>/fonts/**/*'],
                tasks: ['copy:fonts']
            },

            data: {
                files: ['<%= settings.src %>/data/**/*'],
                tasks: ['copy:data']
            },

            views: {
                files: ['<%= settings.src %>/views/**/*', '<%= settings.src %>/index.html', '<%= settings.src %>/radar.html', '<%= settings.src %>/label.html'],
                tasks: ['copy']
            }

        },

        connect: {
          server: {
            options: {
              port: 3000,
              base: '<%= settings.dist %>/',
              middleware: function(connect, options, middlewares) {
                middlewares.unshift(compression());
                return middlewares;
              }
            }
          }
        },
        'gh-pages': {
          options: {
            base: '<%= settings.dist %>'
          },
          src: ['**']
        }
    });

    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
    require('time-grunt')(grunt);
    grunt.loadNpmTasks('grunt-gh-pages');

    grunt.registerTask('main', [ 'clean:dist', 'copy', 'sass', 'autoprefixer:radar', 'autoprefixer:lab', 'cssmin:radar', 'cssmin:lab', 'concat:radar', 'concat:lab', ]);

    grunt.registerTask('default', [ 'main', 'connect', 'watch' ]);
    grunt.registerTask('deploy', [ 'main', 'gh-pages' ]);

};
