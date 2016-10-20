// test exp
var assert = require('assert');
var approx = require('../../../tools/approx');
var math = require('../../../index');
var mathPredictable = math.create({predictable: true});
var complex = math.complex;
var matrix = math.matrix;
var unit = math.unit;
var range = math.range;
var log = math.log;

describe('log', function() {
  it('should return the log base 10 of a boolean', function () {
    assert.equal(log(true), 0);
    assert.equal(log(false), -Infinity);
    assert.equal(log(1, false), 0);
  });

  it('should return the log base 10 of null', function () {
    assert.equal(log(null), -Infinity);
    assert.equal(log(1, null), 0);
  });

  it('should return the log base 10 of positive numbers', function() {
    approx.deepEqual(log(1), 0);
    approx.deepEqual(log(2), 0.301029995663981);
    approx.deepEqual(log(3), 0.477121254719662);

    approx.deepEqual(log(0.01), -2);
    approx.deepEqual(log(0.1), -1);
    approx.deepEqual(log(1), 0);
    approx.deepEqual(log(10), 1);
    approx.deepEqual(log(100), 2);
    approx.deepEqual(log(1000), 3);
  });

  it('should return the log base 10 of negative numbers', function() {
    approx.deepEqual(log(-1), complex('0.000000000000000 + 1.364376353841841i'));
    approx.deepEqual(log(-2), complex('0.301029995663981 + 1.364376353841841i'));
    approx.deepEqual(log(-3), complex('0.477121254719662 + 1.364376353841841i'));
  });

  it('should return the log base 10 of negative numbers with predicable:true', function() {
    assert.equal(typeof mathPredictable.log(-1), 'number');
    assert(isNaN(mathPredictable.log(-1)));
  });

  it('should return the log base 10 of zero', function() {
    approx.deepEqual(log(0), -Infinity);
  });

  it('should return the log base N of a number', function() {
    approx.deepEqual(log(100, 10), 2);
    approx.deepEqual(log(1000, 10), 3);
    approx.deepEqual(log(8, 2), 3);
    approx.deepEqual(log(16, 2), 4);
  });

  it('should return the log of positive bignumbers', function() {
    var bigmath = math.create({precision: 100});

    assert.deepEqual(bigmath.log(bigmath.bignumber(1)), bigmath.bignumber(0));
    assert.deepEqual(bigmath.log(bigmath.bignumber(10)), bigmath.bignumber(1));
    assert.deepEqual(bigmath.log(bigmath.bignumber(100)), bigmath.bignumber(2));
    assert.deepEqual(bigmath.log(bigmath.bignumber(1000)), bigmath.bignumber(3)); // note: this gives a round-off error with regular numbers
    assert.deepEqual(bigmath.log(bigmath.bignumber(10000)), bigmath.bignumber(4));
    assert.deepEqual(bigmath.log(bigmath.bignumber('1e500')), bigmath.bignumber(500));

    // note: the following gives a round-off error with regular numbers
    assert.deepEqual(bigmath.log(bigmath.bignumber(1000), bigmath.bignumber(10)), bigmath.bignumber(3));
  });

  it('should return the log of negative bignumbers', function() {
    var bigmath = math.create({precision: 100});

    approx.deepEqual(bigmath.log(bigmath.bignumber(-1)), bigmath.complex('0.000000000000000 + 1.364376353841841i'));
    approx.deepEqual(bigmath.log(bigmath.bignumber(-2)), bigmath.complex('0.301029995663981 + 1.364376353841841i'));
    approx.deepEqual(bigmath.log(bigmath.bignumber(-3)), bigmath.complex('0.477121254719662 + 1.364376353841841i'));
  });

  it('should return the log of a bignumber with value zero', function() {
    var bigmath = math.create({precision: 100});

    assert.deepEqual(bigmath.log(bigmath.bignumber(0)).toString(), '-Infinity');
  });

  it('should throw an error if used with a wrong number of arguments', function() {
    assert.throws(function () {log()}, /TypeError: Too few arguments/);
    assert.throws(function () {log(1, 2, 3)}, /TypeError: Too many arguments in function log \(expected: 2, actual: 3\)/);
  });

  it('should return the log base 10 of a complex number', function() {
    approx.deepEqual(log(complex(0, 1)),   complex('0.000000000000000 + 0.682188176920921i'));
    approx.deepEqual(log(complex(0, -1)),  complex('0.000000000000000 - 0.682188176920921i'));
    approx.deepEqual(log(complex(1, 1)),   complex('0.150514997831991 + 0.341094088460460i'));
    approx.deepEqual(log(complex(1, -1)),  complex('0.150514997831991 - 0.341094088460460i'));
    approx.deepEqual(log(complex(-1, -1)), complex('0.150514997831991 - 1.023282265381381i'));
    approx.deepEqual(log(complex(-1, 1)),  complex('0.150514997831991 + 1.023282265381381i'));
    approx.deepEqual(log(complex(1, 0)),   complex(0, 0));
  });

  it('should throw an error when used on a unit', function() {
    assert.throws(function () {log(unit('5cm'))});
  });

  it('should throw an error when used on a string', function() {
    assert.throws(function () {log('text')});
  });

  it('should return the log base 10 of each element of a matrix', function() {
    var res = [0, 0.301029995663981, 0.477121254719662, 0.602059991327962];
    approx.deepEqual(log([1,2,3,4]), res);
    approx.deepEqual(log(matrix([1,2,3,4])), matrix(res));
    approx.deepEqual(math.divide(log(matrix([1,2,3,4])), math.LOG10E),
        matrix([0, 0.693147180559945, 1.098612288668110, 1.386294361119891]));
    approx.deepEqual(log(matrix([[1,2],[3,4]])),
        matrix([[0, 0.301029995663981], [0.477121254719662, 0.602059991327962]]));
  });

  it('should LaTeX log', function () {
    var expression = math.parse('log(10)');
    assert.equal(expression.toTex(), '\\log_{10}\\left(10\\right)');

    var expr2 = math.parse('log(32,2)');
    assert.equal(expr2.toTex(), '\\log_{2}\\left(32\\right)');
  });

});
