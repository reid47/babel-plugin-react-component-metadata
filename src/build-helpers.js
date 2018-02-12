import * as t from '@babel/types';

// probably want to use babel/templat here:
// https://github.com/babel/babel/tree/master/packages/babel-template

const id = s => t.identifier(s);

export default function buildFakeTypesLibrary(helperName) {
  return t.variableDeclaration('var', [
    t.variableDeclarator(
      helperName,
      t.callExpression(
        t.functionExpression(
          null,
          [],
          t.blockStatement([
            t.functionDeclaration(
              t.identifier('makeFuncType'),
              [t.identifier('type'), t.identifier('optionsName')],
              t.blockStatement([
                t.returnStatement(
                  t.functionExpression(
                    null,
                    [t.identifier('options')],
                    t.blockStatement([
                      t.variableDeclaration('var', [
                        t.variableDeclarator(
                          t.identifier('opts'),
                          t.objectExpression([])
                        )
                      ]),
                      t.expressionStatement(
                        t.assignmentExpression(
                          '=',
                          t.memberExpression(
                            t.identifier('opts'),
                            t.identifier('optionsName'),
                            true
                          ),
                          t.identifier('options')
                        )
                      ),
                      t.returnStatement(
                        t.callExpression(
                          t.memberExpression(
                            t.identifier('Object'),
                            t.identifier('assign')
                          ),
                          [
                            t.objectExpression([
                              t.objectProperty(
                                t.identifier('type'),
                                t.identifier('type')
                              ),
                              t.objectProperty(
                                t.identifier('required'),
                                t.booleanLiteral(false)
                              )
                            ]),
                            t.identifier('opts')
                          ]
                        )
                      )
                    ])
                  )
                )
              ])
            ),
            t.variableDeclaration('var', [
              t.variableDeclarator(t.identifier('t'), t.objectExpression([]))
            ]),
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
            ].map(type => {
              return t.expressionStatement(
                t.assignmentExpression(
                  '=',
                  t.memberExpression(t.identifier('t'), t.identifier(type)),
                  t.objectExpression([
                    t.objectProperty(
                      t.identifier('type'),
                      t.stringLiteral(type)
                    ),
                    t.objectProperty(
                      t.identifier('required'),
                      t.booleanLiteral(false)
                    )
                  ])
                )
              );
            }),
            ...[
              ['oneOf', 'possibleValues'],
              ['instanceOf', 'constructor'],
              ['arrayOf', 'elementType'],
              ['objectOf', 'valueType'],
              ['oneOfType', 'possibleTypes'],
              ['shape', 'innerTypes']
            ].map(([type, additionalField]) => {
              return t.expressionStatement(
                t.assignmentExpression(
                  '=',
                  t.memberExpression(t.identifier('t'), t.identifier(type)),
                  t.callExpression(t.identifier('makeFuncType'), [
                    t.stringLiteral(type),
                    t.stringLiteral(additionalField)
                  ])
                )
              );
            }),
            t.expressionStatement(
              t.assignmentExpression(
                '=',
                t.memberExpression(
                  t.identifier('t'),
                  t.identifier('isRequired')
                ),
                t.functionExpression(
                  null,
                  [t.identifier('type')],
                  t.blockStatement([
                    t.returnStatement(
                      t.callExpression(
                        t.memberExpression(
                          t.identifier('Object'),
                          t.identifier('assign')
                        ),
                        [
                          t.objectExpression([]),
                          t.identifier('type'),
                          t.objectExpression([
                            t.objectProperty(
                              t.identifier('required'),
                              t.booleanLiteral(true)
                            )
                          ])
                        ]
                      )
                    )
                  ])
                )
              )
            )
          ])
        ),
        []
      )
    )
  ]);
}
