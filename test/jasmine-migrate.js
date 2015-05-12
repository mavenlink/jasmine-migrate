'use strict';

var _               = require('lodash');
var JasmineMigrate  = require('../src/index.js');

var jasmineCore;
var jasmine;

var plugin;


function requireJasmine() {
  jasmineCore = require('jasmine-core');
  jasmine = jasmineCore.jasmine;
}

function installPlugin(options) {
  requireJasmine();

  plugin = new JasmineMigrate(jasmine, options);
}

function jasmineWrapper(spec) {
  jasmineCore.describe('describe', function () {
    jasmineCore.it('it', function () {
      spec.call(this);
    });
  }).execute();
}


describe('JasmineMigrate', function () {

  afterEach(function () {
    jasmineCore = null;
    jasmine = null;
  });

  describe('Jasmine 2 emulation', function () {

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

          requireJasmine();

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
          installPlugin();
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
          var returnValue;

          jasmineWrapper(function () {
            jasmineCore.spyOn(test, 'method').and.returnValue('value');

            returnValue = test.method();
          });

          returnValue.should.equal('value');
        });
      });

    });

    describe('new clock syntax', function () {
      var oldSyntax = ['tick', 'installMock', 'uninstallMock'];
      var newSyntax = ['tick', 'install', 'uninstall'];
      var syntaxMap = _.zipObject(oldSyntax, newSyntax);

      var itProxiesMethod = function (newMethod, oldMethod) {
        it('proxies `clock().' + newMethod + '` to `Clock.' + oldMethod + '`', function () {

          requireJasmine();

          sinon.spy(jasmine.Clock, oldMethod);

          new JasmineMigrate(jasmine);

          jasmineWrapper(function () {
            jasmine.clock()[newMethod]();
          });

          jasmine.Clock[oldMethod].should.have.been.called;
        });
      };

      _.forIn(syntaxMap, itProxiesMethod);

      describe('original functionality', function () {
        beforeEach(function () {
          installPlugin();
        });

        it('preserves correct functionality of `installMock`', function () {
          jasmine.Clock.isInstalled().should.equal(false);

          jasmine.clock().install();

          jasmine.Clock.isInstalled().should.equal(true);
        });

        it('preserves correct functionality of `uninstallMock`', function () {
          jasmine.clock().install();
          jasmine.clock().uninstall();

          jasmine.Clock.isInstalled().should.equal(false);
        });

        it('preserves correct functionality of `tick`', function () {
          var ticked = false;

          var interval = function () {
            setInterval(function () {
              ticked = true;
            }, 1);
          };

          jasmine.clock().install();
          interval();
          jasmine.clock().tick(2);

          ticked.should.equal(true);
        });
      });
    });

  });

  describe('logging', function () {
    describe('log levels', function () {

      _.forIn(JasmineMigrate.logLevels, function (level, constant) {
        context('when log level is set to `' + constant + '`', function () {
          before(function () {
            sinon.stub(console, level);

            installPlugin({ log: true, logLevel: level });
          });

          after(function () {
            console[level].restore();
          });

          it('logs with correct method', function () {
            plugin.log('the thing');

            console[level].should.have.been.calledWith('the thing');
          });
        });
      });

    });

    context('log level is not provided', function () {
      before(function () {
        sinon.stub(console, 'warn');

        installPlugin({ log: true });
      });

      after(function () {
        console.warn.restore();
      });

      it('defaults to `WARN`', function () {

        plugin.log('the warning');

        console.warn.should.have.been.calledWith('the warning');
      });
    });

    context('provided log level does not exist', function () {
      before(function () {
        expect(console.warnify).to.be.undefined;

        sinon.stub(console, 'log');

        installPlugin({ log: true, logLevel: 'warnify' });
      });

      after(function () {
        console.log.restore();
      });

      it('defaults to `console.log`', function () {

        plugin.log('the log');

        console.log.should.have.been.calledWith('the log');
      });
    });
  });

});
