'use strict';

var _               = require('lodash');
var jasmineCore     = require('jasmine-core');
var JasmineMigrate  = require('../src/index.js');

var jasmine = jasmineCore.jasmine;


function jasmineWrapper(spec) {
  jasmineCore.describe('describe', function () {
    jasmineCore.it('it', function () {
      spec.call(this);
    });
  }).execute();
}


describe('JasmineMigrate', function () {

  describe('Jasmine 2 "Emulation"', function () {

    describe('new spy syntax', function () {
      var oldSyntax = ['andCallThrough', 'andCallFake', 'andThrow', 'andReturn'];
      var newSyntax = ['callThrough', 'callFake', 'throwError', 'returnValue'];
      var syntaxMap = _.zipObject(oldSyntax, newSyntax);
      var test;

      beforeEach(function () {
        test = {
          method: function () {
            return 'original';
          }
        };
      });

      var itProxiesMethod = function (newMethod, oldMethod) {
        it('proxies `and.' + newMethod + '` to `' + oldMethod + '`', function () {

          sinon.spy(jasmine.Spy.prototype, oldMethod);

          new JasmineMigrate(jasmine);

          jasmineWrapper(function () {
            jasmineCore.spyOn(test, 'method').and[newMethod]();
          });

          jasmine.Spy.prototype[oldMethod].should.have.been.called;
        });
      };

      _.forIn(syntaxMap, itProxiesMethod);
    });

  });

});
