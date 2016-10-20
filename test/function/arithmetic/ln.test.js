// test ln
var assert = require('assert');
var approx = require('../../../tools/approx');
var error = require('../../../lib/error/index');
var math = require('../../../index');
var mathPredictable = math.create({predictable: true});
var complex = math.complex;
var matrix = math.matrix;
var unit = math.unit;
var range = math.range;
var ln = math.ln;

describe('ln', function() {
  it('should return the ln of a boolean value', function () {
    assert.equal(ln(true), 0);
    assert.equal(ln(false), -Infinity);
  });

  it('should return the ln of null', function () {
    assert.equal(ln(null), -Infinity);
  });

  it('should return the ln of positive numbers', function() {
    approx.deepEqual(ln(1), 0);
    approx.deepEqual(ln(2), 0.693147180559945);
    approx.deepEqual(ln(3), 1.098612288668110);
    approx.deepEqual(math.exp(ln(100)), 100);
  });

  it('should return the ln of negative numbers', function() {
    approx.deepEqual(ln(-1), complex('0.000000000000000 + 3.141592653589793i'));
    approx.deepEqual(ln(-2), complex('0.693147180559945 + 3.141592653589793i'));
    approx.deepEqual(ln(-3), complex('1.098612288668110 + 3.141592653589793i'));
  });

  it('should return the ln of negative numbers with predictable: true', function() {
    assert.equal(typeof mathPredictable.ln(-1), 'number');
    assert(isNaN(mathPredictable.ln(-1)));
  });

  it('should return the ln of zero', function() {
    approx.deepEqual(ln(0), -Infinity);
  });

  it('should throw an error if invalid number of arguments', function() {
    assert.throws(function () {ln()}, /TypeError: Too few arguments/);
    assert.throws(function () {ln(1, 2)}, /TypeError: Too many arguments/);
  });

  it('should return the ln of positive bignumbers', function() {
    var bigmath = math.create({precision: 100});

    assert.deepEqual(bigmath.ln(bigmath.bignumber(1)), bigmath.bignumber('0'));
    assert.deepEqual(bigmath.ln(bigmath.bignumber(2)), bigmath.bignumber('0.6931471805599453094172321214581765680755001343602552541206800094933936219696947156058633269964186875'));
    assert.deepEqual(bigmath.ln(bigmath.bignumber(3)), bigmath.bignumber('1.098612288668109691395245236922525704647490557822749451734694333637494293218608966873615754813732089'));
  });

  it('should return the ln of negative bignumbers', function() {
    var bigmath = math.create({precision: 100});

    approx.deepEqual(bigmath.ln(bigmath.bignumber(-1)), complex('0.000000000000000 + 3.141592653589793i'));
    approx.deepEqual(bigmath.ln(bigmath.bignumber(-2)), complex('0.693147180559945 + 3.141592653589793i'));
    approx.deepEqual(bigmath.ln(bigmath.bignumber(-3)), complex('1.098612288668110 + 3.141592653589793i'));
  });

  it('should return the ln of negative bignumbers with predictable:true', function() {
    assert.ok(mathPredictable.ln(math.bignumber(-1)).isNaN());
  });

  it('should return the ln of a bignumber with value zero', function() {
    var bigmath = math.create({precision: 100});

    assert.deepEqual(bigmath.ln(bigmath.bignumber(0)).toString(), '-Infinity');
  });

  it('should return the ln of a complex number', function() {
    approx.deepEqual(ln(math.i),          complex('1.570796326794897i'));
    approx.deepEqual(ln(complex(0, -1)),  complex('-1.570796326794897i'));
    approx.deepEqual(ln(complex(1, 1)),   complex('0.346573590279973 + 0.785398163397448i'));
    approx.deepEqual(ln(complex(1, -1)),  complex('0.346573590279973 - 0.785398163397448i'));
    approx.deepEqual(ln(complex(-1, -1)), complex('0.346573590279973 - 2.356194490192345i'));
    approx.deepEqual(ln(complex(-1, 1)),  complex('0.346573590279973 + 2.356194490192345i'));
    approx.deepEqual(ln(complex(1, 0)),   complex(0, 0));
  });

  it('should throw an error when used on a unit', function() {
    assert.throws(function () {ln(unit('5cm'))});
  });

  it('should throw an error when used on a string', function() {
    assert.throws(function () {ln('text')});
  });

  it('should return the ln of each element of a matrix', function() {
    var res = [0, 0.693147180559945, 1.098612288668110, 1.386294361119891];
    approx.deepEqual(ln([1,2,3,4]), res);
    approx.deepEqual(ln(matrix([1,2,3,4])), matrix(res));
    approx.deepEqual(ln(matrix([[1,2],[3,4]])),
        matrix([[0, 0.693147180559945], [1.098612288668110, 1.386294361119891]]));
  });

  it('should LaTeX ln', function () {
    var expr1 = math.parse('ln(e)');
    assert.equal(expr1.toTex(), '\\ln\\left( e\\right)');
  });

});
