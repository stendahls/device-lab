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
        
        hbs: {
            preview: {
              src: ['<%= settings.src %>/**/*.html',
                    '<%= settings.src %>/**/*.hbt',
                    '<%= settings.src %>/**/*.json'],
              dest: '<%= settings.dist %>',
              cwd:  '',
              rules: [
                      {url: "<%= settings.src %>/pages/*.html" , layout: "<%= settings.src %>/views/layouts/default.hbt"}
                      ]
            }
        },

        concat: {
            dist: {
                src: [
                    '<%= settings.npm %>/fontfaceobserver/fontfaceobserver.js',
                    '<%= settings.npm %>/jquery/dist/jquery.js',
                    '<%= settings.npm %>/csvtojson/dist/csvtojson.js',
                    '<%= settings.npm %>/ua-parser-js/dist/ua-parser.min.js',
                    '<%= settings.src %>/js/*/*.js'
                ],
                dest: '<%= settings.dist %>/js/script.js'
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
                    '<%= settings.dist %>/css/main.css': '<%= settings.src %>/scss/main.scss'
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
            core: {
                options: {
                    map: true
                },
                src: '<%= settings.dist %>/css/style.css'
            }
        },

        cssmin: {
            options: {
                compatibility: 'ie8',
                keepSpecialComments: '*',
                advanced: false
            },
            core: {
                src: '<%= settings.dist %>/css/style.css',
                dest: '<%= settings.dist %>/css/style.min.css'
            }
        },

        copy: {
            root: {
                expand: true,
                cwd: '<%= settings.src %>/',
                src: [ '*.html', '*.txt', '*.json' ],
                dest: '<%= settings.dist %>/'
            },
            scripts: {
                expand: true,
                cwd: '<%= settings.src %>/js/utils',
                src: [ 'google-analytics.js' ],
                dest: '<%= settings.dist %>/js/'
            },
            fonts: {
                expand: true,
                cwd: '<%= settings.src %>/fonts/',
                src: [ '**/*' ],
                dest: '<%= settings.dist %>/fonts/'
            },
            img: {
                expand: true,
                cwd: '<%= settings.src %>/img',
                src: [ '**/*' ],
                dest: '<%= settings.dist %>/img/'
            },
            data: {
                expand: true,
                cwd: '<%= settings.src %>/data',
                src: [ '**/*', '!*', '!**/helpers/**' ],
                dest: '<%= settings.dist %>/tmp/'
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
                tasks: ['concat', 'copy:scripts']
            },

            sass: {
                files: ['<%= settings.src %>/**/*.scss'],
                tasks: ['sass','autoprefixer']
            },

            img: {
                files: ['<%= settings.src %>/img/**/*'],
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
                files: ['<%= settings.src %>/views/**/*', '<%= settings.src %>/index.html', '<%= settings.src %>/oath.html'],
                tasks: ['copy']
            }

        },

        connect: {
          server: {
            options: {
              port: 8000,
              base: '<%= settings.dist %>/',
              middleware: function(connect, options, middlewares) {
                middlewares.unshift(compression());
                return middlewares;
              }
            }
          }
        }
    });

    require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
    require('time-grunt')(grunt);
    grunt.loadNpmTasks('grunt-hbs');

    grunt.registerTask('main', [ 'clean:dist', 'hbs', 'copy', 'sass', 'autoprefixer', 'concat', ]);

    grunt.registerTask('default', [ 'main', 'connect', 'watch' ]);

};
