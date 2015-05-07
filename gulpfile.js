'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var rename = require('gulp-rename');
var transform = require('vinyl-transform');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var stylish = require('gulp-jscs-stylish');

var projectName = require('./package.json').name;
var standaloneName = require('./package.json').standaloneName;
var source = ['./src/index.js'];
var testSource = ['./test/jasmine-migrate.js'];

var options = require('minimist')(process.argv.slice(2));


// Browserify helper

var browserified = function (standalone) {
  return transform(function (filename) {
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

gulp.task('build-browserify', function () {
  gulp.src(source)
    .pipe(browserified())
    .pipe(rename(projectName + '.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename(projectName + '.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build-standalone', function () {
  gulp.src(source)
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

gulp.task('test-ci', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    browsers: ['Firefox']
  }, done);
});

gulp.task('test-watch', function (done) {
  var config = {
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    autoWatch: true
  };

  if (typeof options.browsers === 'string' && options.browsers.length) {
    config.browsers = options.browsers.split();
  }

  karma.start(config, done);
});

gulp.task('lint', function (done) {
  var fix = options.fix;

  var stream = gulp.src(source.concat(testSource), { base: '.' })
    .pipe(jshint())
    .pipe(jscs(function () {
      if (fix) return { fix: true, configPath: '.jscsrc' };
    }()))
    .on('error', function () {})
    .pipe(stylish.combineWithHintResults())
    .pipe(jshint.reporter('jshint-stylish'));

  if (fix) {
    stream.pipe(gulp.dest('.'));
  }
});

gulp.task('build', ['build-browserify', 'build-standalone']);
gulp.task('ci', ['lint', 'test-ci']);
gulp.task('default', ['test', 'build']);
