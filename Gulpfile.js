var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var imagemin = require('gulp-imagemin');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');
var cssGlobbing = require('gulp-css-globbing');
var todo = require('gulp-todo');
var assemble = require('assemble');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var lodash = require('lodash');

var paths = {
  images: 'src/assets/imgs/**/*'
};

gulp.task('default', ['watch']);

gulp.task('clean', function(cb) {
  del(['build/**/*'], cb);
});

// ----------------------------------------------------------------

// Generate pages and docs
assemble.data(['src/data/**/*.{json,yml}']);
assemble.helpers('src/helpers/**/*.js');
assemble.partials('src/views/partials/**/*.hbs');
assemble.layouts('src/views/layouts/**/*.hbs');

assemble.task('docs', function() {
  assemble.src('src/views/docs/**/*.hbs')
    .pipe(rename(function (path) {
      path.extname = ".html"
    }))
    .pipe(assemble.dest('build/docs/'));
});   
assemble.task('pages', function() {
  assemble.src('src/views/pages/**/*.hbs')
    .pipe(rename(function (path) {
      path.extname = ".html"
    }))
    .pipe(assemble.dest('build/'));
});
gulp.task('assemble', function() {
  assemble.run('docs');
  assemble.run('pages');
});

// ----------------------------------------------------------------

// Generate Icon font form svgs 
gulp.task('iconfont', function(){
  gulp.src(['src/assets/icons/svgs/*.svg'])
    .pipe(iconfont({ fontName: 'custom-icon-font' }))
    .on('codepoints', function(codepoints, options) {
      gulp.src('src/assets/icons/_icon-font.css')
        .pipe(consolidate('lodash', {
          glyphs: codepoints,
          fontName: 'custom-icon-font',
          fontPath: '../fonts/icons/',
          className: 'i'
        }))
        .pipe(rename(function (path) {
          path.extname = ".scss"
        }))
        .pipe(gulp.dest('src/assets/scss'));
    })
    .pipe(gulp.dest('src/assets/fonts/icons'));
});

// ----------------------------------------------------------------

// Generate css from scss
gulp.task('css', function() {
  gulp.src('src/assets/scss/main.scss')
    .pipe(cssGlobbing({
      extensions: ['.css', '.scss'],
      ignoreFolders: ['../styles'],
      autoReplaceBlock: {
        onOff: false,
        globBlockBegin: 'cssGlobbingBegin',
        globBlockEnd: 'cssGlobbingEnd',
        globBlockContents: '../**/*.scss'
      },
      scssImportPath: {
        leading_underscore: false,
        filename_extension: false
      }
    }))
    .pipe(sass())
    .on('error', function (err) {
      gutil.log(gutil.colors.red('ERROR: ')+gutil.colors.yellow(err.message));
      this.emit('end');
    })
    .pipe(autoprefixer('last 5 versions'))
    //.pipe(minifycss())
    .pipe(gulp.dest('build/assets/css'))
    .pipe(notify({ message : 'Gulp CSS Complete'}));
});

// ----------------------------------------------------------------

// Generate JS with browserify with sourcemaps
gulp.task('js', function() {
  gulp.src('src/assets/js/libs/**/*')
    .pipe(gulp.dest('build/assets/js/libs'))
  gulp.src('src/assets/js/main.js')
    .pipe(browserify({ debug : true }))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('ERROR: ')+gutil.colors.yellow(err.message));
      this.emit('end');
    })
    .pipe(gulp.dest('build/assets/js'))
    .pipe(notify({ message : 'Gulp JS Complete'}));
});

// Compress js
gulp.task('compressjs', function() {
  gulp.src('build/assets/js/main.js')
    .pipe(uglify())
    .pipe(rename('min.js'))
    .pipe(gulp.dest('build/assets/js'))
    .pipe(notify({ message : 'Gulp Compress JS Complete'}));
});

// ----------------------------------------------------------------

// Copy all static images
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(imagemin({optimizationLevel: 7}))
    .pipe(gulp.dest('build/assets/imgs'));
});

// Copy all fonts
gulp.task('fonts', function() {
  return gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest('build/assets/fonts'));
});

// ----------------------------------------------------------------

// generate a todo.md from your javascript files 
gulp.task('todo', function() {
  gulp.src('src/assets/js/**/*.js')
    .pipe(todo({ fileName: 'todo-js.md'}))
    .pipe(gulp.dest('./todo'));
  gulp.src('src/assets/scss/**/*.scss')
    .pipe(todo({ fileName: 'todo-scss.md'}))
    .pipe(gulp.dest('./todo'));
  gulp.src('src/views/**/*.hbs')
    .pipe(todo({ fileName: 'todo-pages.md'}))
    .pipe(gulp.dest('./todo'));
});

// ----------------------------------------------------------------

gulp.task('build', ['clean'], function() {
  gulp.run('images');
  gulp.run('css');
  gulp.run('js');
  gulp.run('fonts');
  gulp.run('assemble');
});

// ----------------------------------------------------------------

gulp.task('watch', function() {
  gulp.watch('src/views/**/*.hbs', ['assemble']);
  gulp.watch('src/assets/scss/**/*.scss', ['css']);
  gulp.watch('src/assets/js/**/*.js', ['js']);
});