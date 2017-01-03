'use strict';

var digits = require('./../../../utils/number').digits;
function factory(type, config, load, typed, math) {
  var util = load(require('./util'));
  var isCommutative = util.isCommutative;
  var isAssociative = util.isAssociative;
  var flatten = util.flatten;
  var allChildren = util.allChildren;
  var unflattenr = util.unflattenr;
  var unflattenl = util.unflattenl;
  var createMakeNodeFunction = util.createMakeNodeFunction;
  var ConstantNode = math.expression.node.ConstantNode;
  var OperatorNode = math.expression.node.OperatorNode;

  var _useFractions = false;

  function simplifyConstant(expr, useFrac) {
    if (typeof useFrac === 'undefined') {
      useFrac = false;
    }
    _useFractions = useFrac;

    var res = foldFraction(expr);
    return res.isNode ? res : _toNode(res);
  }

  function _eval(fnname, args) {
    try {
      return _toNumber(math[fnname].apply(null, args));
    }
    catch (ignore) {
      // sometimes the implicit type conversion causes the evaluation to fail, so we'll try again using just numbers
      args = args.map(function(x){ return x.valueOf(); });
      return _toNumber(math[fnname].apply(null, args));
    }
  }

  var _toNode = typed({
    'Fraction': _fractionToNode,
    'number': _numberToNode,
    'BigNumber': function(s) {
      return _numberToNode(s._toNumber());
    },
    'Complex': function(s) {
      throw 'Cannot convert Complex number to Node';
    },
  });

  // Depending on if _useFractions is on or off, this method will coerce
  // all constants to either decimals or fractions.
  var _toNumber = typed({
    'Fraction': function(s) {
      if (_useFractions) {
        return s;
      }
      return s.valueOf();
    },
    'BigNumber': function(s) {
      var num = s.toNumber();
      if (_useFractions && s.decimalPlaces() <= 15 && isFinite(num)) {
        var f = math.fraction(num);
        if (f.valueOf() === num) {
          return f;
        }
      }
      return num;
    },
    'number': function(s) {
      if (_useFractions && isFinite(s)) {
        var f = math.fraction(s);
        if (f.valueOf() === s) {
          return f;
        }
      }
      return s;
    },
    'Complex': function(s) {
      if (s.im !== 0) {
        return s;
      }
      if (_useFractions && isFinite(s.re)) {
        var f = math.fraction(s.re);
        if (f.valueOf() === s.re) {
          return f;
        }
      }
      return s.re;
    },
  });

  function _numberToNode(n) {
    if (n < 0) {
      return new OperatorNode('-', 'unaryMinus', [new ConstantNode(-n)])
    }
    return new ConstantNode(n);
  }
  function _fractionToNode(f) {
    var n;
    var vn = f.s*f.n;
    if (vn < 0) {
      n = new OperatorNode('-', 'unaryMinus', [new ConstantNode(-vn)])
    }
    else {
      n = new ConstantNode(vn);
    }

    if (f.d === 1) {
      return n;
    }
    return new OperatorNode('/', 'divide', [n, new ConstantNode(f.d)]);
  }

  /*
   * Create a binary tree from a list of Fractions and Nodes.
   * Tries to fold Fractions by evaluating them until the first Node in the list is hit, so
   * `args` should be sorted to have the Fractions at the start (if the operator is commutative).
   * @param args - list of Fractions and Nodes
   * @param fn - evaluator for the binary operation evaluator that accepts two Fractions
   * @param makeNode - creates a binary OperatorNode/FunctionNode from a list of child Nodes
   * if args.length is 1, returns args[0]
   * @return - Either a Node representing a binary expression or Fraction
   */
  function foldOp(fn, args, makeNode) {
    return args.reduce(function(a, b) {
      if (!a.isNode && !b.isNode) {
        try {
          return _eval(fn, [a, b]);
        }
        catch (ignoreandcontinue) {}
        a = _toNode(a);
        b = _toNode(b);
      }
      else if (!a.isNode) {
        a = _toNode(a);
      }
      else if (!b.isNode) {
        b = _toNode(b);
      }

      return makeNode([a, b]);
    });
  }

  // destroys the original node and returns a folded one
  function foldFraction(node) {
    switch(node.type) {
      case 'SymbolNode':
        return node;
      case 'ConstantNode':
        return _toNumber(node.value);
      case 'FunctionNode':
        if (math[node.name] && math[node.name].rawArgs) {
          return node;
        }
        /* falls through */
      case 'OperatorNode':
        var fn = node.fn.toString();
        var args;
        var res;
        var makeNode = createMakeNodeFunction(node);
        if (node.args.length === 1) {
          args = [foldFraction(node.args[0])];
          if (!args[0].isNode) {
            res = _eval(fn, args);
          }
          else {
            res = makeNode(args);
          }
        }
        else if (isAssociative(node)) {
          args = allChildren(node);
          args = args.map(foldFraction);

          if (isCommutative(fn)) {
            // commutative binary operator
            var consts = [], vars = [];

            for (var i=0; i < args.length; i++) {
              if (!args[i].isNode) {
                consts.push(args[i]);
              }
              else {
                vars.push(args[i]);
              }
            }

            if (consts.length > 1) {
              res = foldOp(fn, consts, makeNode);
              vars.unshift(res);
              res = foldOp(fn, vars, makeNode);
            }
            else {
              // we won't change the children order since it's not neccessary
              res = foldOp(fn, args, makeNode);
            }
          }
          else {
            // non-commutative binary operator
            res = foldOp(fn, args, makeNode);
          }
        }
        else {
          // non-associative binary operator
          args = node.args.map(foldFraction);
          res = foldOp(fn, args, makeNode);
        }
        return res;
      case 'ParenthesisNode':
        // remove the uneccessary parenthesis
        return foldFraction(node.content);
      case 'AccessorNode':
      case 'ArrayNode':
      case 'AssignmentNode':
      case 'BlockNode':
      case 'FunctionAssignmentNode':
      case 'IndexNode':
      case 'ObjectNode':
      case 'RangeNode':
      case 'UpdateNode':
      case 'ConditionalNode':
      default:
        throw 'Unimplemented node type in simplifyConstant: '+node.type;
    }
  }

  return simplifyConstant;
}

exports.math = true;
exports.name = 'simplifyConstant';
exports.path = 'algebra.simplify';
exports.factory = factory;
