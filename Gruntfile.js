"use strict";

module.exports = function(grunt) {
	
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	
	grunt.loadNpmTasks('assemble');
	
	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),
		
		dirs: {
			input: 'source',
			output: 'samples'
		},
		
		copy: {
			assets: {
				expand: true,
				cwd: '<%= dirs.input %>/images/',
				src: ['**/*.{gif,png,jpeg,jpg,svg,woff,woff2,ttf,eot,mp3,mp4}'],
				dest: '<%= dirs.output %>/images/'
			},
			fonts: {
				expand: true,
				cwd: '<%= dirs.input %>/fonts/',
				src: ['**/*.{gif,woff,woff2,ttf,eot}'],
				dest: '<%= dirs.output %>/fonts/'
			},
			sprites: {
				expand: true,
				cwd: '<%= dirs.input %>/images/sprites/',
				src: ['**/*.{gif,png,jpeg,svg,woff,woff2,ttf,eot,mp3,mp4}'],
				dest: '<%= dirs.output %>/images/sprites/'
			},
			javascripts: {
				expand: true,
				cwd: '<%= dirs.input %>/javascripts/',
				src: ['libs.js'],
				dest: '<%= dirs.output %>/javascripts/'
			}
		},
		
		clean: {
			build: {
				src: ['<%= dirs.output %>']
			},
			stylesheets: {
				src: ['<%= dirs.output %>/**/*.css']
			},
			javascripts: {
				src: ['<%= dirs.output %>/**/*.js']
			}
		},
		
		/*
		sass: {
			options: {
				includePaths: ['bower_components/foundation/scss']
			},
			dist: {
				options: {
					outputStyle: 'nested', // nested, compact, compressed, expanded.
					sourceMap: true,
				},
				files: {
					'<%= dirs.input %>/stylesheets/temp/app.css': '<%= dirs.input %>/stylesheets/app.scss'
				}
			}
		},
		cssmin: {
			stylesheets: {
				files: [{
					expand: true,
					cwd: '<%= dirs.input %>/stylesheets/temp/',
					src: ['*.css', '!*.min.css','!*.css.map'],
					dest: '<%= dirs.input %>/stylesheets/temp/',
					ext: '.min.css'
				}]
			}
		},
		*/
		
		less: {
			build: {
				options: {
					compress: true
				},
				expand: true,
				cwd: '<%= dirs.input %>/stylesheets',
				src: [ '*.less', '!_*.less' ],
				dest: '<%= dirs.input %>/stylesheets/temp',
				ext: '.css'
			}
		},
		
		bless: {
			css: {
				options: {
					compress: true
				},
				files: {
					'<%= dirs.output %>/stylesheets/app.min.css': '<%= dirs.input %>/stylesheets/temp/app.css'
				}
			}
		},
		
		autoprefixer: {
			options: {
				browsers: [
					'last 2 versions',
					'ie >= 9', 
					'Opera >= 12.0',
					'Chrome >= 9.0', 
					'ff >= 5.0',
					'Safari >= 5.0'
				]
			},
			build: {
				src: '<%= dirs.input %>/stylesheets/temp/*.css'
			}
		},
		
		concat: {
			javascripts: {
				options: {
					separator: ';'
				},
				files: {
					'<%= dirs.output %>/javascripts/app.js': ['<%= dirs.input %>/javascripts/app.js'],
				}
			},
			stylesheets: {
				files: {
					'<%= dirs.output %>/stylesheets/app.css': ['<%= dirs.input %>/stylesheets/temp/app.css']
				}
			}
		},
		
		uglify: {
			build: {
				files: {
					'<%= dirs.output %>/javascripts/app.min.js': [
						'<%= dirs.input %>/javascripts/app.js'
					]
				}
			}
		},
		
		assemble: {
			options: {
				helpers: [
					'handlebars-helper-repeat',
					'handlebars-helpers'
				],
				layoutdir: '<%= dirs.input %>/templates/layouts',
				partials: ['<%= dirs.input %>/templates/partials/**/*.html'],
				data: ['bower.json']
			},
			site: {
				expand: true,
				cwd: '<%= dirs.input %>/templates/pages/',
				src: '**/*.html',
				dest: './<%= dirs.output %>'
			}
		},
		
		sprite: {
			all: {
				src: [
					'<%= dirs.input %>/images/sprites/*.png',
					'!<%= dirs.input %>/images/sprites/sprite.png'
				],
				dest: '<%= dirs.output %>/images/sprites/sprite.png',
				destCss: '<%= dirs.input %>/stylesheets/sprites/sprites.less',
				cssTemplate: '<%= dirs.input %>/stylesheets/sprites/template-handlebars/less.template.handlebars',
				imgPath: '../images/sprites/sprite.png',
				algorithm: 'binary-tree',
				padding: 10
			}
		},
		
		connect: {
			server: {
				options: {
					port: '3000',
					base: '<%= dirs.output %>',
					open: true,
					livereload: true
				}
			}
		},
		/*
		livereload: {
			options: {
				base: '<%= dirs.output %>',
			},
			files: ['<%= dirs.output %>']
		},
		*/
		
		// browserSync: {
  //           dev: {
  //               bsFiles: {
  //                   src : [
  //                       '<%= dirs.input %>/stylesheets/**/*.less',
  //                       '<%= dirs.input %>/templates/**/*.html'
  //                   ]
  //               },
  //               options: {
		// 			injectChanges: false,
		// 			reloadDelay:   2400,
		// 			notify:        false,
		// 			open:          true,
		// 			port:          3000,
  //                   watchTask:     true,
		// 			watchOptions: {
		// 				ignored: ''
		// 			},
  //                   server: './<%= dirs.output %>'
  //               }
  //           }
  //       },

		watch: {
			options: {
				livereload: true,
				files: [
					'<%= dirs.input %>/**/*.{gif,png,jpeg,svt,woff,woff2,ttf,eot,mp3,mp4}'
				]
			},
			
			templates: {
				files: '<%= dirs.input %>/templates/**',
				tasks: 'assemble'
			},
			
			stylesheets: {
				files: ['<%= dirs.input %>/stylesheets/**/*.less','!<%= dirs.input %>/stylesheets/temp/**'],
				tasks: 'stylesheets'
			},

			sprites: {
				files: ['<%= dirs.input %>/images/sprites/**'],
				tasks: 'copy:sprites'
			},
			
			assets: {
				files: ['<%= dirs.input %>/images/**'],
				tasks: 'copy:assets'
			},
			
			javascripts: {
				files: '<%= dirs.input %>/javascripts/**',
				tasks: 'javascripts'
			},

			js: {
				files: '<%= dirs.output %>/javascripts/*.min.js>',
				tasks: ['uglify']
			},
			
			gruntfile: {
				files: 'Gruntfile.js',
				tasks: 'build'
			}
		}
		
	});
	
	grunt.registerTask('copy:sprites', ['sprite']);
	
	grunt.registerTask('stylesheets', ['clean:stylesheets','sprite','less','autoprefixer','concat:stylesheets','bless']);
	
	grunt.registerTask('javascripts', ['clean:javascripts','concat:javascripts','copy:javascripts','uglify']);
	
	grunt.registerTask('build', ['clean','copy','javascripts','stylesheets','assemble']);
	
	grunt.registerTask('default', ['build','connect',/*'browserSync',*/'watch']);
	
};
