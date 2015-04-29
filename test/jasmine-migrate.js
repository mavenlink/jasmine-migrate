'use strict';

var jasmine = require('jasmine-core');
var JasmineMigrate = require('../src/index.js');


describe('JasmineMigrate', function () {
  var plugin;

  beforeEach(function () {
    plugin = new JasmineMigrate(jasmine);
  });

});
