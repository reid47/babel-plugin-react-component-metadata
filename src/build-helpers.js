import * as t from 'babel-types';

const id = name => t.identifier(name);
const bool = value => t.booleanLiteral(value);
const str = value => t.stringLiteral(value);
const member = (obj, prop, computed) => t.memberExpression(obj, prop, computed);
const objProp = (prop, val) => t.objectProperty(prop, val);
const varDec = (id, value) =>
  t.variableDeclaration('var', [t.variableDeclarator(id, value)]);
const assignment = (left, right) =>
  t.expressionStatement(t.assignmentExpression('=', left, right));
const emptyObjExpr = t.objectExpression([]);

export default helperName => {
  return varDec(
    helperName,
    t.callExpression(
      t.functionExpression(
        null,
        [],
        t.blockStatement([
          t.functionDeclaration(
            id('makeFuncType'),
            [id('type'), id('optionsName')],
            t.blockStatement([
              t.returnStatement(
                t.functionExpression(
                  null,
                  [id('options')],
                  t.blockStatement([
                    varDec(id('opts'), emptyObjExpr),
                    assignment(
                      member(id('opts'), id('optionsName'), true),
                      id('options')
                    ),
                    t.returnStatement(
                      t.callExpression(member(id('Object'), id('assign')), [
                        t.objectExpression([
                          objProp(id('type'), id('type')),
                          objProp(id('required'), bool(false))
                        ]),
                        id('opts')
                      ])
                    )
                  ])
                )
              )
            ])
          ),
          varDec(id('t'), emptyObjExpr),
          ...[
            'string',
            'number',
            'bool',
            'func',
            'object',
            'symbol',
            'array',
            'node',
            'element',
            'any'
          ].map(type =>
            assignment(
              member(id('t'), id(type)),
              t.objectExpression([
                objProp(id('type'), str(type)),
                objProp(id('required'), bool(false))
              ])
            )
          ),
          ...[
            ['oneOf', 'possibleValues'],
            ['instanceOf', 'constructor'],
            ['arrayOf', 'elementType'],
            ['objectOf', 'valueType'],
            ['oneOfType', 'possibleTypes'],
            ['shape', 'innerTypes']
          ].map(([type, additionalField]) =>
            assignment(
              member(id('t'), id(type)),
              t.callExpression(id('makeFuncType'), [
                str(type),
                str(additionalField)
              ])
            )
          ),
          assignment(
            member(id('t'), id('isRequired')),
            t.functionExpression(
              null,
              [id('type')],
              t.blockStatement([
                t.returnStatement(
                  t.callExpression(member(id('Object'), id('assign')), [
                    emptyObjExpr,
                    id('type'),
                    t.objectExpression([objProp(id('required'), bool(true))])
                  ])
                )
              ])
            )
          ),
          t.returnStatement(id('t'))
        ])
      ),
      []
    )
  );
};
