/*
 * Used by `grunt` - see gruntjs.com.
 *
 * The purpose of this file is to help with working on the eden-js grammar, the
 * 'jison' task will generate the parser, the default task runs a web server
 * for testing the grammar and automatically regenerates the parser when the
 * grammar file changes.
 */

'use strict';

module.exports = function (grunt) {


  grunt.initConfig({

	'gh-pages': {
		options: {
			base: 'build',
			add: false,
			repo: 'https://github.com/knicos/SBML.git',
			branch: 'gh-pages',
			message: 'Deploy SBML Build'
		},
		src: ['latest/sbml.*', 'samples/*']
	},

	browserify: {
		'build/latest/sbml.js': ['js/exports.js']
	},

	uglify: {
		core: {
			files: {
				'build/latest/sbml.min.js': ['build/latest/sbml.js']
			}
		}
	}
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.registerTask('default', ['browserify','uglify']);
};

