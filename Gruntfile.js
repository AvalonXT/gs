module.exports = function(grunt) {

  grunt.initConfig({
    less: {
      compileCustomBootstrapCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'bootstrap.css.map',
          sourceMapFilename: 'public/vendor/bootstrap/css/bootstrap.css.map'
        },
        src: 'less/custom-bootstrap/custom-bootstrap.less',
        dest: 'public/vendor/bootstrap/css/bootstrap.css'
      },
      compileTheme: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'style.css.map',
          sourceMapFilename: 'public/css/style.css.map'
        },
        src: 'less/theme/style.less',
        dest: 'public/css/style.css'
      }
    },
    copy: {
        bootstrapJs: {
          files: [
            // includes files within path
            {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/js/*'], dest: 'public/vendor/bootstrap/js/', filter: 'isFile'}
          ]
        },
        bootstrapFonts: {
          files: [
            // includes files within path
            {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/fonts/*'], dest: 'public/vendor/bootstrap/fonts/', filter: 'isFile'}
          ]
        },
        jQueryAssets: {
          files: [
            {expand: true, flatten: true, src: ['node_modules/jquery/dist/*'], dest: 'public/vendor/jquery/', filter: 'isFile'},
            {expand: true, flatten: true, src: ['node_modules/throttle-debounce/dist/*'], dest: 'public/vendor/jquery/', filter: 'isFile'}
          ]
        },
        fontAwesomeAssets: {
            files: [
                {expand: true, flatten: true, src: ['node_modules/font-awesome/fonts/*'], dest: 'public/vendor/fa/fonts/', filter: 'isFile'},
                {expand: true, flatten: true, src: ['node_modules/font-awesome/css/*'], dest: 'public/vendor/fa/css/', filter: 'isFile'}
            ]
        }
    },
    watch: {
        css: {
          files: ['less/theme/*.less', 'less/custom-bootstrap/*.less'],
          tasks: ['theme-css', 'custom-bootstrap-css']
        }
    },
    sprite:{
      all: {
        src: 'icons/*.png',
        dest: 'public/img/sprites.png',
        destCss: 'public/css/sprites.css'
      }
    },
    shell: {
      nodemon: {
        command: 'nodemon app.js'
      }
    },
    concurrent: {
      develop: {
        tasks: ['nodemon', 'watch-css'],
        options: {
            logConcurrentOutput: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-spritesmith');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('init', [
      'copy:bootstrapJs', 'copy:bootstrapFonts', 'copy:jQueryAssets', 'copy:fontAwesomeAssets',
      'less:compileCustomBootstrapCore', 'less:compileTheme',
      'sprite:all'
  ]);
  grunt.registerTask('theme-css', ['less:compileTheme']);
  grunt.registerTask('custom-bootstrap-css', ['less:compileCustomBootstrapCore']);

  grunt.registerTask('nodemon', ['shell:nodemon']);
  grunt.registerTask('watch-css', ['watch:css']);
  grunt.registerTask('develop', ['concurrent:develop']);
};
