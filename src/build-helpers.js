import * as t from 'babel-types';

const id = name => t.identifier(name);
const bool = value => t.booleanLiteral(value);
const str = value => t.stringLiteral(value);
const member = (obj, prop, computed) => t.memberExpression(obj, prop, computed);
const objProp = (prop, val) => t.objectProperty(prop, val);
const obj = (...objProps) => t.objectExpression(objProps);
const varDec = (id, value) =>
  t.variableDeclaration('var', [t.variableDeclarator(id, value)]);
const assignment = (left, right) =>
  t.expressionStatement(t.assignmentExpression('=', left, right));

/**
 * Builds a node representing an assignment of
 * a simple type.
 *
 * ex:
 * t.someType = {type: 'someType', required: true};
 */
const buildSimpleTypeNode = type =>
  assignment(
    member(id('t'), id(type)),
    obj(objProp(id('type'), str(type)), objProp(id('required'), bool(false)))
  );

/**
 * Builds a node representing an assignment of
 * a complex type (one that takes arguments).
 *
 * ex:
 * t.someType = makeFuncType('someType', 'someAdditionalProperty');
 */
const buildComplexTypeNode = ([type, additionalField]) =>
  assignment(
    member(id('t'), id(type)),
    t.callExpression(id('makeFuncType'), [str(type), str(additionalField)])
  );

/**
 * Node representing assignment of the special isRequired
 * type function.
 *
 * ex:
 * t.isRequired = function(type) {
 *   return Object.assign({}, type, {required: true});
 * }
 */
const isRequiredNode = assignment(
  member(id('t'), id('isRequired')),
  t.functionExpression(
    null,
    [id('type')],
    t.blockStatement([
      t.returnStatement(
        t.callExpression(member(id('Object'), id('assign')), [
          obj(),
          id('type'),
          obj(objProp(id('required'), bool(true)))
        ])
      )
    ])
  )
);

/**
 * Node representing function definition for the makeFuncType
 * helper function.
 *
 * ex:
 * function makeFuncType(type, optionsName) {
 *   return function (options) {
 *     var opts = {};
 *     opts[optionsName] = options;
 *     return Object.assign({type: type, required: false}, opts);
 *   };
 * }
 */
const makeFuncTypeNode = t.functionDeclaration(
  id('makeFuncType'),
  [id('type'), id('optionsName')],
  t.blockStatement([
    t.returnStatement(
      t.functionExpression(
        null,
        [id('options')],
        t.blockStatement([
          varDec(id('opts'), obj()),
          assignment(
            member(id('opts'), id('optionsName'), true),
            id('options')
          ),
          t.returnStatement(
            t.callExpression(member(id('Object'), id('assign')), [
              obj(
                objProp(id('type'), id('type')),
                objProp(id('required'), bool(false))
              ),
              id('opts')
            ])
          )
        ])
      )
    )
  ])
);

/**
 * Given an identifier, builds a node for a tiny prop-types
 * replacement library that will be dropped into the existing
 * code.
 *
 * Ex:
 * var helperName = (function() {
 *   // see other comments
 * })();
 */
export default helperName => {
  return varDec(
    helperName,
    t.callExpression(
      t.functionExpression(
        null,
        [],
        t.blockStatement([
          // function makeFuncType(...) { ... }
          makeFuncTypeNode,

          // var t = {};
          varDec(id('t'), obj()),

          // t.string = ...
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
          ].map(buildSimpleTypeNode),

          // t.oneOf = ...
          ...[
            ['oneOf', 'possibleValues'],
            ['instanceOf', 'constructor'],
            ['arrayOf', 'elementType'],
            ['objectOf', 'valueType'],
            ['oneOfType', 'possibleTypes'],
            ['shape', 'innerTypes']
          ].map(buildComplexTypeNode),

          // t.isRequired = ...
          isRequiredNode,

          // return t;
          t.returnStatement(id('t'))
        ])
      ),
      []
    )
  );
};
