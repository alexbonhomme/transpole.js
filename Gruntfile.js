/*global module:false*/
module.exports = function (grunt) {
    'use strict';

    var LIBRARY_NAME,
        MODULE_LIST,
        DIST_HEAD_LIST,
        DEV_HEAD_LIST,
        TAIL_LIST,
        BANNER;

    // Helper methods
    function sub(str) {
        return str.replace(/%s/g, LIBRARY_NAME);
    }

    function wrapModules(head, tail) {
        return head.concat(MODULE_LIST).concat(tail);
    }

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // You will want to chage the value of this constant to whatever your library
    // is called.
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    LIBRARY_NAME = 'transpole';

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Add your modules to this list
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    MODULE_LIST = [
        sub('src/%s.ajax.js'),
        sub('src/%s.promise.js')
    ];

    DIST_HEAD_LIST = [
        sub('src/%s.intro.js'),
        // sub('src/%s.const.js'),
        sub('src/%s.core.js')
    ];

    // This is the same as DIST_HEAD_LIST, just without *.const.js (which is just
    // there UglifyJS conditional compilation).
    DEV_HEAD_LIST = [
        sub('src/%s.intro.js'),
        sub('src/%s.core.js')
    ];

    TAIL_LIST = [
        sub('src/%s.init.js'),
        sub('src/%s.outro.js')
    ];

    // Gets inserted at the top of the generated files in dist/.
    BANNER = [
        '/*! <%= pkg.name %> - v<%= pkg.version %> - ',
        '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n'
    ].join('');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                options: {
                    banner: BANNER
                },
                src: wrapModules(DIST_HEAD_LIST, TAIL_LIST),
                dest: sub('dist/%s.js')
            },
            dev: {
                options: {
                    banner: BANNER
                },
                src: wrapModules(DEV_HEAD_LIST, TAIL_LIST),
                dest: sub('dist/%s.js')
            }
        },
        uglify: {
            dist: {
                files: (function () {
                    // Using an IIFE so that the destination property name can be
                    // created dynamically with sub().
                    var obj = {};
                    obj[sub('dist/%s.min.js')] = [sub('dist/%s.js')];
                    return obj;
                }())
            },
            options: {
                banner: BANNER
            }
        },
        qunit: {
            files: ['test/qunit*.html']
        },
        jshint: {
            all_files: [
                'grunt.js',
                // sub('src/%s.!(intro|outro|const)*.js')
                sub('src/%s.!(intro|outro)*.js')
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        }
    });

    grunt.registerTask('default', [
        'jshint',
        'build',
        'qunit'
    ]);

    grunt.registerTask('build', [
        'concat:dist',
        'uglify:dist',
        'concat:dev'
    ]);
};
