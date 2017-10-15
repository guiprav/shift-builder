exports.script_root = (...args) => {
  let ret = {
    type: 'Script',
    directives: [],
    statements: [],
    items: [],
  };

  switch (args.length) {
    case 0:
      break;

    case 1:
      ret.items = args[0];
      break;

    default:
      ret.statements = args[0];
      ret.items = args[1];
      break;
  }

  return ret;
};

exports.module_root = (...args) => {
  let ret = {
    type: 'Module',
    directives: [],
    items: [],
    statements: [],
  };

  switch (args.length) {
    case 0:
      break;

    case 1:
      ret.items = args[0];
      break;

    default:
      ret.directives = args[0];
      ret.items = args[1];
      break;
  }

  return ret;
};

exports.id = name => ({
  type: 'IdentifierExpression', name,
});

exports.num = value => ({
  type: 'LiteralNumericExpression', value,
});

exports.str = value => ({
  type: 'LiteralStringExpression', value,
});

exports.binary_expr = (op, ops) => {
  let root = {
    type: 'BinaryExpression',
    left: undefined,
    operator: op,
    right: undefined,
  };

  let cur = root;

  while (ops.length) {
    cur.right = ops.pop();

    if (ops.length === 1) {
      cur.left = ops.pop();
    }
    else {
      cur = cur.left = {
        type: 'BinaryExpression',
        left: undefined,
        operator: op,
        right: undefined,
      };
    }
  }

  return root;
};

exports.array_expr = elements => ({
  type: 'ArrayExpression',
  elements,
});

exports.block = statements => ({
  type: 'BlockStatement',
  block: { type: 'Block', statements },
});

exports.if_stmt = (test, consequent, alternate) => {
  if (Array.isArray(consequent)) {
    consequent = exports.block(consequent);
  }

  if (Array.isArray(alternate)) {
    consequent = exports.block(alternate);
  }

  return {
    type: 'IfStatement',
    test, consequent, alternate,
  };
};

exports.fn_expr = (...argsList) => {
  let argNames = {
    0: [],
    1: ['body'],
    2: ['params', 'body'],
  }[argsList.length] || ['name', 'params', 'body'];

  let args = { params: [] };

  argNames.forEach((name, i) => {
    args[name] = argsList[i];
  });

  let lastParam = args.params[args.params.length - 1];

  if (lastParam.startsWith('...')) {
    args.pop();
    args.rest = lastParam;
  }

  if (Array.isArray(args.body)) {
    args.body = {
      type: 'FunctionBody',
      directives: [],
      statements: args.body,
    };
  }
  else {
    args.body = { ...args.body };
  }

  args.body.statements = args.body.statements.map(x => {
    if (x.type.endsWith('Expression')) {
      return {
        type: 'ExpressionStatement',
        expression: x,
      };
    }

    return x;
  });

  return {
    type: 'FunctionExpression',
    isGenerator: false,

    name: args.name,

    params: {
      type: 'FormalParameters',

      items: args.params.map(name => ({
        type: 'BindingIdentifier', name,
      })),

      rest: args.rest,
    },

    body: args.body,
  };
};

exports.call_expr = (callee, args) => {
  if (typeof callee === 'string') {
    callee = {
      type: 'IdentifierExpression',
      name: callee,
    };
  }

  return {
    type: 'CallExpression',
    callee,
    arguments: args || [],
  };
};

exports.return_stmt = expression => ({
  type: 'ReturnStatement', expression,
});
