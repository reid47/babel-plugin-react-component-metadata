import * as t from 'babel-types';

export const id = name => t.identifier(name);

export const bool = value => t.booleanLiteral(value);

export const str = value => t.stringLiteral(value);

export const member = (obj, prop, computed) =>
  t.memberExpression(obj, prop, computed);

export const objProp = (prop, val) => t.objectProperty(prop, val);

export const obj = (...objProps) => t.objectExpression(objProps);

export const varDec = (id, value) =>
  t.variableDeclaration('var', [t.variableDeclarator(id, value)]);

export const assignment = (left, right) =>
  t.expressionStatement(t.assignmentExpression('=', left, right));
