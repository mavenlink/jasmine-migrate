'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var rename = require('gulp-rename');
var transform = require('vinyl-transform');

var projectName = require('./package.json').name;
var standaloneName = require('./package.json').standaloneName;
var sourceFile = ['./src/index.js'];


// Browserify helper

var browserified = function(standalone) {
  return transform(function(filename) {
    var bundler;

    if (standalone) {
      bundler = browserify({ standalone: standaloneName });
      bundler.add(filename);
    } else {
      bundler = browserify();
      bundler.require(filename, { expose: projectName });
    }

    return bundler.bundle();
  });
};


// Tasks

gulp.task('build-browserify', function() {
  gulp.src(sourceFile)
    .pipe(browserified())
    .pipe(rename(projectName + '.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename(projectName + '.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-standalone', function() {
  gulp.src(sourceFile)
    .pipe(browserified(true))
    .pipe(rename(projectName + '-standalone.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename(projectName + '-standalone.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('test-debug', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    autoWatch: true
  }, done);
});

gulp.task('build', ['build-browserify', 'build-standalone']);
gulp.task('default', ['test', 'build']);
