import * as t from 'babel-types';

export const id = name => t.identifier(name);

export const bool = value => t.booleanLiteral(value);

export const str = value => t.stringLiteral(value);

export const member = (obj, prop, computed) =>
  t.memberExpression(obj, prop, computed);

export const objProp = (prop, val) => t.objectProperty(prop, val);

export const obj = (...objProps) => t.objectExpression(objProps.filter(i => i));

export const varDec = (id, value) =>
  t.variableDeclaration('var', [t.variableDeclarator(id, value)]);

export const assignment = (left, right) =>
  t.expressionStatement(t.assignmentExpression('=', left, right));

export const isTopLevel = path => path.parent.type === 'Program';

export const isExported = path =>
  path.parent.type === 'ExportNamedDeclaration' ||
  path.parent.type === 'ExportDefaultDeclaration';

export const isTopLevelOrExported = path =>
  isTopLevel(path) || isExported(path);

export const isRequirePropTypes = node =>
  t.isCallExpression(node) &&
  t.isIdentifier(node.callee, { name: 'require' }) &&
  t.isStringLiteral(node.arguments[0], { value: 'prop-types' });
