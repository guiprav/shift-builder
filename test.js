let n = require('./node_builders');
let compile_fn = require('./compile_fn');

let n_factorial = n.fn_expr('factorial', ['n'], [
  n.if_stmt(n.binary_expr('===', [
    n.id('n'), n.num(0),
  ]), [
    n.return_stmt(n.num(1)),
  ]),

  n.return_stmt(n.binary_expr('*', [
    n.id('n'), n.call_expr('factorial', [
      n.binary_expr('-', [
        n.id('n'), n.num(1),
      ]),
    ]),
  ])),
]);

let factorial = compile_fn(n_factorial);

console.log('3! is', factorial(3));
console.log('4! is', factorial(4));
console.log('5! is', factorial(5));
