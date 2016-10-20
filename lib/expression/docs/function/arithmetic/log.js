module.exports = {
  'name': 'log',
  'category': 'Arithmetic',
  'syntax': [
    'log(x)'
  ],
  'description': 'Compute the logarithm of a value. If no base is provided, the 10-base logarithm of x is calculated. If base if provided, the logarithm is calculated for the specified base. log(x, base) is defined as ln(x) / ln(base).',
  'examples': [
    'log(0.00001)',
    'log(10000)',
    '10 ^ 4',
    'log(10000) / log(10)',
    'log(10000, 10)'
  ],
  'seealso': [
    'exp',
    'ln'
  ]
};
