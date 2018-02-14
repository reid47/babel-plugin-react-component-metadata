import * as t from 'babel-types';
import * as u from './ast-utils';

/**
 * Builds a node representing an assignment of
 * a simple type.
 *
 * ex:
 * t.someType = {type: 'someType', required: true};
 */
const buildSimpleTypeNode = type =>
  u.assignment(
    u.member(u.id('t'), u.id(type)),
    u.obj(
      u.objProp(u.id('type'), u.str(type)),
      u.objProp(u.id('required'), u.bool(false))
    )
  );

/**
 * Builds a node representing an assignment of
 * a complex type (one that takes arguments).
 *
 * ex:
 * t.someType = makeFuncType('someType', 'someAdditionalProperty');
 */
const buildComplexTypeNode = ([type, additionalField]) =>
  u.assignment(
    u.member(u.id('t'), u.id(type)),
    t.callExpression(u.id('makeFuncType'), [
      u.str(type),
      u.str(additionalField)
    ])
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
const isRequiredNode = u.assignment(
  u.member(u.id('t'), u.id('isRequired')),
  t.functionExpression(
    null,
    [u.id('type')],
    t.blockStatement([
      t.returnStatement(
        t.callExpression(u.member(u.id('Object'), u.id('assign')), [
          u.obj(),
          u.id('type'),
          u.obj(u.objProp(u.id('required'), u.bool(true)))
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
 *   return function(options) {
 *     var opts = {};
 *     opts[optionsName] = options;
 *     return Object.assign({type: type, required: false}, opts);
 *   };
 * }
 */
const makeFuncTypeNode = t.functionDeclaration(
  u.id('makeFuncType'),
  [u.id('type'), u.id('optionsName')],
  t.blockStatement([
    t.returnStatement(
      t.functionExpression(
        null,
        [u.id('options')],
        t.blockStatement([
          u.varDec(u.id('opts'), u.obj()),
          u.assignment(
            u.member(u.id('opts'), u.id('optionsName'), true),
            u.id('options')
          ),
          t.returnStatement(
            t.callExpression(u.member(u.id('Object'), u.id('assign')), [
              u.obj(
                u.objProp(u.id('type'), u.id('type')),
                u.objProp(u.id('required'), u.bool(false))
              ),
              u.id('opts')
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
  return u.varDec(
    helperName,
    t.callExpression(
      t.functionExpression(
        null,
        [],
        t.blockStatement([
          // function makeFuncType(...) { ... }
          makeFuncTypeNode,

          // var t = {};
          u.varDec(u.id('t'), u.obj()),

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
          t.returnStatement(u.id('t'))
        ])
      ),
      []
    )
  );
};
