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
      var Test;
      var test;

      beforeEach(function () {
        Test = function () {};

        Test.prototype.method = function () {
          return 'original';
        };

        test = new Test();
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

      describe('original functionality', function () {
        var spy;

        beforeEach(function () {
          new JasmineMigrate(jasmine);
        });

        it('preserves correct functionality of `andCallThrough`', function () {
          sinon.spy(test, 'method');

          jasmineWrapper(function () {
            jasmineCore.spyOn(test, 'method').and.callThrough();

            test.method();
          });

          test.method.should.have.been.called;
        });

        it('preserves correct functionality of `andCallFake`', function () {
          var fake = sinon.spy();

          jasmineWrapper(function () {
            jasmineCore.spyOn(test, 'method').and.callFake(fake);

            test.method();
          });

          fake.should.have.been.called;
        });

        it('preserves correct functionality of `andThrow`', function () {
          var thrower = sinon.spy(function () {
            test.method();
          });

          jasmineWrapper(function () {
            jasmineCore.spyOn(test, 'method').and.throwError('Error');
            thrower();
          });

          thrower.should.have.thrown('Error');
        });

        it('preserves correct functionality of `andReturn`', function () {
          jasmineWrapper(function () {
            jasmineCore.spyOn(test, 'method').and.returnValue('value');

            test.method().should.equal('value');
          });
        });
      });

    });

    describe('new clock syntax', function () {
      var oldSyntax = ['tick', 'installMock', 'uninstallMock'];
      var newSyntax = ['tick', 'install', 'uninstall'];
      var syntaxMap = _.zipObject(oldSyntax, newSyntax);

      var itProxiesMethod = function (newMethod, oldMethod) {
        it('proxies `clock().' + newMethod + '` to `Clock.' + oldMethod + '`', function () {

          sinon.spy(jasmine.Clock, oldMethod);

          new JasmineMigrate(jasmine);

          jasmineWrapper(function () {
            jasmine.clock()[newMethod]();
          });

          jasmine.Clock[oldMethod].should.have.been.called;
        });
      };

      _.forIn(syntaxMap, itProxiesMethod);
    });

  });

});
