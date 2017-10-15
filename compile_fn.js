let codegen = require('shift-codegen').default;

module.exports = expr => {
  if (
    typeof expr !== 'object'
    || expr.type !== 'FunctionExpression'
  ) {
    throw new TypeError(
      `compile_fn expects a FunctionExpression`
    );
  }

  let param_names = expr.params.items.map(x => x.name);

  if (expr.params.rest) {
    param_names.push(`...${expr.params.rest.name}`);
  }

  if (expr.name) {
    param_names.unshift(expr.name);
  }

  let fn = new Function(...param_names, codegen(expr.body));

  if (expr.name) {
    return function recurse(...args) {
      return fn(recurse, ...args);
    };
  }

  return fn;
};
