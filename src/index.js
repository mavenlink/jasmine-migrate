'use strict';

function JasmineMigrate(jasmine) {

  //
  // Jasmine 2 "Emulation"

  // Spies

  // Old usage                          New usage
  // ---------                          ---------
  // spy.andCallThrough();              spy.and.callThrough();
  // spy.andCallFake(function () {});   spy.and.callFake(function () {});
  // spy.andThrow('error');             spy.and.throwError('error');
  // spy.andReturn(1);                  spy.and.returnValue(1);
  // spy.mostRecentCall;                spy.calls.mostRecent();
  // spy.callCount;                     spy.calls.count();
  // spy.calls;                         spy.calls.all();
  // spy.calls[0];                      spy.calls.first();
  // spy.calls[x].args;                 spy.calls.argsFor(x);

  var oldCreateSpy = jasmine.createSpy;

  var oldAndCallThrough = jasmine.Spy.prototype.andCallThrough;
  var oldAndCallFake = jasmine.Spy.prototype.andCallFake;
  var oldAndThrow = jasmine.Spy.prototype.andThrow;
  var oldAndReturn = jasmine.Spy.prototype.andReturn;

  jasmine.createSpy = function (name) {
    var spy = oldCreateSpy.call(this, name);

    spy.and = {
      callThrough: oldAndCallThrough.bind(spy),
      callFake: oldAndCallFake.bind(spy),
      throwError: oldAndThrow.bind(spy),
      returnValue: oldAndReturn.bind(spy)
    };

    spy.calls.mostRecent = function () { return spy.mostRecentCall; };
    spy.calls.count = function () { return spy.callCount; };
    spy.calls.all = function () { return spy.calls; };
    spy.calls.first = function () { return spy.calls[0]; };
    spy.calls.argsFor = function (index) { return spy.calls[index].args; };

    return spy;
  };
}

module.exports = JasmineMigrate;
