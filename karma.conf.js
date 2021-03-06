module.exports = function (config) {
  config.set({

    port: 9876,

    logLevel: config.LOG_INFO,

    autoWatch: true,
    singleRun: false,
    colors: true,

    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-sinon-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha-reporter',
      'karma-browserify'
    ],

    browsers: ['Chrome'],

    reporters: ['mocha'],

    frameworks: ['mocha', 'sinon-chai', 'browserify'],

    files: [
      'test/**/*.js'
    ],

    preprocessors: {
      'test/**/*.js': ['browserify']
    }

  });
};
