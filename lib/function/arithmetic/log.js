'use strict';

var deepMap = require('../../utils/collection/deepMap');

function factory (type, config, load, typed) {
  var divideScalar = load(require('./divideScalar'));
  var ln = load(require('./ln'));
  /**
   * Calculate the 10-base logarithm of a value. This is the same as calculating `log(x, 10)`.
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.log(x)
   *
   * Examples:
   *
   *    math.log(0.00001);            // returns -5
   *    math.log(10000);              // returns 4
   *    math.log(10000) / math.log(10); // returns 4
   *    math.pow(10, 4);                // returns 10000
   *
   * See also:
   *
   *    exp, ln
   *
   * @param {number | BigNumber | Complex | Array | Matrix} x
   *            Value for which to calculate the logarithm.
   * @return {number | BigNumber | Complex | Array | Matrix}
   *            Returns the 10-base logarithm of `x`
   */
  var log = typed('log', {
    'number': function (x) {
      if (x >= 0 || config.predictable) {
        return _log10(x);
      }
      else {
        // negative value -> complex value computation
        return new type.Complex(x, 0).log().div(Math.LN10);
      }
    },

    'Complex': function (x) {
      return new type.Complex(x).log().div(Math.LN10);
    },

    'BigNumber': function (x) {
      if (!x.isNegative() || config.predictable) {
        return x.log();
      }
      else {
        // downgrade to number, return Complex valued result
        return new type.Complex(x.toNumber(), 0).log().div(Math.LN10);
      }
    },

    'Array | Matrix': function (x) {
      return deepMap(x, log);
    },

    'any, any': function (x, base) {
      // calculate logarithm for a specified base, log(x, base)
      return divideScalar(ln(x), ln(base));
    }
  });

  log.toTex = {
    1: '\\log_{10}\\left(${args[0]}\\right)',
    2: '\\log_{${args[1]}}\\left(${args[0]}\\right)'
  };

  return log;
}

/**
 * Calculate the 10-base logarithm of a number
 * @param {number} x
 * @return {number}
 * @private
 */
var _log10 = Math.log10 || function (x) {
  return Math.log(x) / Math.LN10;
};

exports.name = 'log';
exports.factory = factory;

