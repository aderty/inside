var gulp = require('gulp');

var changed = require('gulp-changed');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');

var paths = {
scripts: ['public/js/directives.js',
                'public/js/filters.js',
                'public/js/services.js',
                'public/js/app.js',
                'public/js/controllers.js',
                '!public/js/min/**/*.js'],
scriptsPages: ['public/js/**/*.js',
                '!public/js/directives.js',
                '!public/js/filters.js',
                '!public/js/services.js',
                '!public/js/app.js',
                '!public/js/controllers.js', 
                '!public/js/min/**/*.js'],
scriptsLibs: ['public/libs/jquery-1.9.1.min.js',
                'public/libs/jqueryui/jquery-ui-1.10.3.custom.min.js',
                'public/libs/jqueryui/i18n/jquery.ui.datepicker-fr.js',
                'public/libs/angularjs/angular.min.js',
                'public/libs/angularjs/angular-resource.min.js',
                'public/libs/angularjs/ng-table.js',
                'public/libs/angularjs/ui-bootstrap-tpls-0.5.0.min.js',
                'public/libs/bootstrap/js/bootstrap.min.js',
                'public/libs/angularjs/angular-ui.min.js',
                'public/libs/moment.min.js',
                'public/libs/moment-fr.js',
                'public/libs/select2/select2.min.js',
                'public/libs/select2/select2_locale_fr.js',
                'public/libs/angularjs/fullcalendar.min.js',
                'public/libs/angularjs/fullcalendar.locale.fr.js',
                'public/libs/angularjs/calendar.min.js',
                'public/libs/raphael.2.1.0.min.js',
                'public/libs/justgage.1.0.1.min.js', 
                'public/libs/angularjs/loading-bar.min.js'],
  css: ['public/css/**/*.css', '!public/css/print.css'],
  cssPrint: 'public/css/print.css',
  cssLibs: ['public/libs/bootstrap/css/bootstrap.min.css',
            'public/libs/angularjs/ng-table.css',
            'public/libs/angularjs/angular-ui.min.css',
            'public/libs/jqueryui/jquery-ui-1.10.2.custom.min.css',
            'public/libs/select2/select2.css',
            'public/libs/angularjs/fullcalendar.css',
            'public/libs/angularjs/loading-bar.min.css'],
  //cssLibs: ['public/libs/**/*.css']
  cssLibsPrint: ['public/libs/angularjs/fullcalendar.print.css'],
  imgLibs: ['public/libs/bootstrap/img/*'],
  imgjQueryUI: ['public/libs/jqueryui/images/*'],
  imgSelect: ['public/libs/select2/*.png', 'public/libs/select2/*.gif'],
  font: ['public/font/*']
};

var DEST = 'public/dist',
DEST_CSS = DEST + '/css',
DEST_JS = DEST + '/js',
DEST_IMG = DEST + '/img',
DEST_IMAGES = DEST + '/images',
DEST_FONT = DEST + '/font';

gulp.task('clean', function() {
  return gulp.src([DEST], { read: false })
  .pipe(clean());
});

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(paths.scripts)
    .pipe(changed(DEST_JS))
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest(DEST_JS));
});

gulp.task('scriptsPages', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(paths.scriptsPages)
    .pipe(changed(DEST_JS))
    .pipe(uglify())
    .pipe(gulp.dest(DEST_JS));
});

gulp.task('scriptsLibs', function() {
    // Minify and copy all JavaScript (except vendor scripts)
    return gulp.src(paths.scriptsLibs)
    .pipe(changed(DEST_JS))
    .pipe(concat('libs.min.js'))
    .pipe(gulp.dest(DEST_JS));
});

gulp.task('css', function() {
    return gulp.src(paths.css)
    .pipe(changed(DEST_CSS))
    .pipe(minifyCSS())
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest(DEST_CSS))
});

gulp.task('cssLibs', function() {
    return gulp.src(paths.cssLibs)
    .pipe(changed(DEST_CSS))
    //.pipe(minifyCSS())
    .pipe(concat('libs.min.css'))
    .pipe(gulp.dest(DEST_CSS))
});

gulp.task('cssPrint', function() {
    return gulp.src(paths.cssPrint)
    .pipe(changed(DEST_CSS))
    .pipe(minifyCSS())
    .pipe(gulp.dest(DEST_CSS))
});

gulp.task('cssLibsPrint', function() {
    return gulp.src(paths.cssLibsPrint)
    .pipe(changed(DEST_CSS))
    .pipe(minifyCSS())
    .pipe(concat('libs.print.css'))
    .pipe(gulp.dest(DEST_CSS))
});

gulp.task('imgLibs', function() {
    return gulp.src(paths.imgLibs)
    .pipe(changed(DEST_IMG))
    .pipe(gulp.dest(DEST_IMG))
});
gulp.task('imgjQueryUI', function() {
    return gulp.src(paths.imgjQueryUI)
    .pipe(changed(DEST_IMAGES))
    .pipe(gulp.dest(DEST_IMAGES))
});
gulp.task('imgSelect', function() {
    return gulp.src(paths.imgSelect)
    .pipe(changed(DEST_CSS))
    .pipe(gulp.dest(DEST_CSS))
});

gulp.task('font', function() {
    return gulp.src(paths.font)
    .pipe(changed(DEST_FONT))
    .pipe(gulp.dest(DEST_FONT))
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.cssPrint, ['cssPrint']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['clean'], function(){
    gulp.start('scripts',
                      'scriptsPages',
                      'scriptsLibs',
                      'css',
                      'cssPrint',
                      'cssLibs',
                      'cssLibsPrint',
                      'imgLibs',
                      'imgjQueryUI',
                      'imgSelect',
                      'font', 
                      'watch');
});

module.exports = gulp;
                      