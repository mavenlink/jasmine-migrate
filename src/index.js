'use strict';

function JasmineMigrate(jasmine, options) {
  this.jasmine = jasmine;
  this.options = options;

  this.originals = { spy: {}, clock: {} };

  this.initEmulation();
}

JasmineMigrate.prototype.SPY_MAP = {
  andCallThrough: 'callThrough',
  andCallFake: 'callFake',
  andThrow: 'throwError',
  andReturn: 'returnValue'
};

JasmineMigrate.prototype.CLOCK_MAP = {
  tick: 'tick',
  installMock: 'install',
  uninstallMock: 'uninstall'
};

JasmineMigrate.prototype.initEmulation = function () {
  var jasmine = this.jasmine;
  var originals = this.originals;

  var SPY_MAP = this.SPY_MAP;
  var CLOCK_MAP = this.CLOCK_MAP;

  // Spies

  // Old usage                          New usage
  // ---------                          ---------
  // spy.andCallThrough()               spy.and.callThrough()
  // spy.andCallFake(function () {})    spy.and.callFake(function () {})
  // spy.andThrow('error')              spy.and.throwError('error')
  // spy.andReturn(1)                   spy.and.returnValue(1)
  // spy.mostRecentCall                 spy.calls.mostRecent()
  // spy.callCount                      spy.calls.count()
  // spy.calls                          spy.calls.all()
  // spy.calls[0]                       spy.calls.first()
  // spy.calls[x].args                  spy.calls.argsFor(x)

  for (var spyMethod in SPY_MAP) {
    originals.spy[spyMethod] = jasmine.Spy.prototype[spyMethod];
  }

  var oldCreateSpy = jasmine.createSpy;

  jasmine.createSpy = function (name) {
    var spy = oldCreateSpy.call(this, name);

    spy.and = {};

    for (var spyMethod in SPY_MAP) {
      spy.and[SPY_MAP[spyMethod]] = originals.spy[spyMethod].bind(spy);
    }

    spy.calls.mostRecent = function () { return spy.mostRecentCall; };
    spy.calls.count = function () { return spy.callCount; };
    spy.calls.all = function () { return spy.calls; };
    spy.calls.first = function () { return spy.calls[0]; };
    spy.calls.argsFor = function (index) { return spy.calls[index].args; };

    return spy;
  };

  // Clock

  // Old usage                        New usage
  // ---------                        ---------
  // jasmine.Clock.tick()             jasmine.clock().tick()
  // jasmine.Clock.useMock()          jasmine.clock().install() and jasmine.clock().uninstall()
  // jasmine.Clock.installMock()      jasmine.clock().install()
  // jasmine.Clock.uninstallMock()    jasmine.clock().uninstall()

  for (var clockMethod in CLOCK_MAP) {
    originals.clock[clockMethod] = jasmine.Clock[clockMethod];
  }

  jasmine.clock = function () {
    var clock = {};

    for (var clockMethod in CLOCK_MAP) {
      clock[CLOCK_MAP[clockMethod]] = originals.clock[clockMethod].bind(jasmine.Clock);
    }

    return clock;
  };
};

module.exports = JasmineMigrate;
