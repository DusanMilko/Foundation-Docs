var gulp = require('gulp');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var assemble = require('assemble');
var hologram = require('gulp-hologram');

var paths = {
  src: 'src/',
  build: 'build/',
  images: 'src/assets/img/**/*'
};

gulp.task('default', ['watch']);

gulp.task('watch', function() {
  gulp.watch(paths.src+'views/**/*.hbs', ['assemble']);
  gulp.watch(paths.src+'assets/scss/**/*.scss', ['css']);
  gulp.watch(paths.src+'assets/js/**/*.js', ['js']);
  gulp.watch(paths.src+'assets/imgs/**/*.{jpg,png,gif}', ['images']);
  gulp.watch(paths.src+'assets/sprites/**/*.{jpg,png,gif}', ['sprites','css']);
});

// ----------------------------------------------------------------

gulp.task('clean', function(cb) {
  var del = require('del');

  del([paths.build+'**/*'], cb);
});

gulp.task('build', ['clean'], function() {
  gulp.run('images');
  gulp.run('sprites');
  gulp.run('css');
  gulp.run('js');
  gulp.run('fonts');
  gulp.run('assemble');
});

// ----------------------------------------------------------------

gulp.task('sync', function() {
  var browserSync = require('browser-sync');
  var reload      = browserSync.reload;

  browserSync({
    server: {
      baseDir: "./build"
    }
  });

  gulp.watch(paths.build+"**/*").on('change', reload);
});

// ----------------------------------------------------------------

// Generate pages and docs
assemble.data([paths.src+'data/**/*.{json,yml}']);
assemble.helpers(paths.src+'helpers/**/*.js');
assemble.partials(paths.src+'views/partials/**/*.hbs');
assemble.layouts(paths.src+'views/layouts/**/*.hbs');

assemble.task('docs', function() {
  assemble.src(paths.src+'views/docs/**/*.hbs')
    .pipe(rename(function (path) {
      path.extname = ".html"
    }))
    .pipe(assemble.dest(paths.build+'docs/'));
});   
assemble.task('pages', function() {
  assemble.src(paths.src+'views/pages/**/*.hbs')
    .pipe(rename(function (path) {
      path.extname = ".html"
    }))
    .pipe(assemble.dest(paths.build));

  gulp.run('hologram');
});
gulp.task('assemble', function() {
  assemble.data([paths.src+'data/**/*.{json,yml}']);
  assemble.helpers(paths.src+'helpers/**/*.js');
  assemble.partials(paths.src+'views/partials/**/*.hbs');
  assemble.layouts(paths.src+'views/layouts/**/*.hbs');

  assemble.run('docs');
  assemble.run('pages');
});

// ----------------------------------------------------------------

// Generate Icon font form svgs 
gulp.task('iconfont', function(){
  var iconfont = require('gulp-iconfont');
  var consolidate = require('gulp-consolidate');
  var lodash = require('lodash');

  gulp.src([paths.src+'assets/icons/svgs/*.svg'])
    .pipe(iconfont({ fontName: 'custom-icon-font' }))
    .on('codepoints', function(codepoints, options) {
      gulp.src(paths.src+'assets/icons/_icon-font.css')
        .pipe(consolidate('lodash', {
          glyphs: codepoints,
          fontName: 'custom-icon-font',
          fontPath: '../fonts/icons/',
          className: 'i'
        }))
        .pipe(rename(function (path) {
          path.extname = ".scss"
        }))
        .pipe(gulp.dest(paths.src+'assets/scss'));
    })
    .pipe(gulp.dest(paths.src+'assets/fonts/icons'));
});

// ----------------------------------------------------------------

// Generate Sprites
gulp.task('sprites', function () {
  var gulpif = require('gulp-if');
  var sprity = require('sprity');

  return sprity.src({
    src: './'+paths.src+'assets/sprites/*.png',
    name: 'sprite',
    style: '_sprite.scss', //'./source/assets/scss/base/_sprites.scss',
    cssPath: paths.src+'assets/scss/',
    processor: 'css',
    prefix: 'sprite'
  })
  .pipe(gulpif(
    '*.png', 
    gulp.dest(paths.build+'assets/sprites/'), 
    gulp.dest(paths.src+'assets/scss/')
  ));
});

// ----------------------------------------------------------------

// Generate css from scss
gulp.task('css', function() {
  //var minifycss = require('gulp-minify-css');
  var sass = require('gulp-sass');
  var autoprefixer = require('gulp-autoprefixer');
  var cssGlobbing = require('gulp-css-globbing');

  gulp.src(paths.src+'assets/scss/main.scss')
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
    .pipe(gulp.dest(paths.build+'assets/css'))
    .pipe(notify({ message : 'Gulp CSS Complete'}));
});

// ----------------------------------------------------------------

// Generate JS with browserify with sourcemaps
gulp.task('js', function() {
  var browserify = require('gulp-browserify');

  gulp.src(paths.src+'assets/js/libs/**/*')
    .pipe(gulp.dest(paths.build+'assets/js/libs'));
  gulp.src(paths.src+'assets/js/data/**/*')
    .pipe(gulp.dest(paths.build+'assets/js/data'));
  gulp.src(paths.src+'assets/js/main.js')
    .pipe(browserify({ debug : true }))
    .on('error', function (err) {
      gutil.log(gutil.colors.red('ERROR: ')+gutil.colors.yellow(err.message));
      this.emit('end');
    })
    .pipe(gulp.dest(paths.build+'assets/js'))
    .pipe(notify({ message : 'Gulp JS Complete'}));
});

// Compress js
gulp.task('compressjs', function() {
  var uglify = require('gulp-uglify');

  gulp.src(paths.build+'assets/js/main.js')
    .pipe(uglify())
    .pipe(rename('min.js'))
    .pipe(gulp.dest(paths.build+'assets/js'))
    .pipe(notify({ message : 'Gulp Compress JS Complete'}));
});

// ----------------------------------------------------------------

// Copy all static images
gulp.task('images', function() {
  var imagemin = require('gulp-imagemin');
  var cache = require('gulp-cache');

  return gulp.src(paths.images)
    .pipe(cache(imagemin({optimizationLevel: 7})))
    .pipe(gulp.dest(paths.build+'assets/imgs'));
});

// Copy all fonts
gulp.task('fonts', function() {
  return gulp.src(paths.src+'assets/fonts/**/*')
    .pipe(gulp.dest(paths.build+'assets/fonts'));
});

// ----------------------------------------------------------------

gulp.task('hologram', function() {
  gulp.src('./config.yml')
    .pipe(hologram());
});

// ----------------------------------------------------------------

// generate a todo.md from your javascript files 
gulp.task('todo', function() {
  var todo = require('gulp-todo');

  gulp.src(paths.src+'assets/js/**/*.js')
    .pipe(todo({ fileName: 'todo-js.md'}))
    .pipe(gulp.dest('./todo'));
  gulp.src(paths.src+'assets/scss/**/*.scss')
    .pipe(todo({ fileName: 'todo-scss.md'}))
    .pipe(gulp.dest('./todo'));
  gulp.src(paths.src+'views/**/*.hbs')
    .pipe(todo({ fileName: 'todo-pages.md'}))
    .pipe(gulp.dest('./todo'));
});


