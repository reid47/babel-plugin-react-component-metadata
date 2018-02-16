import * as t from 'babel-types';
import * as u from './ast-utils';
import buildHelpers from './build-helpers';
import helpersVisitor from './helpers-visitor';
import createMetadataNode from './create-metadata-node';
import { getOption, setOption } from './options';

const init = (obj, ...fields) =>
  fields.forEach(field => {
    obj[field] = obj[field] || {};
    obj = obj[field];
  });

const collectPropTypes = (propMetadata, objExp) =>
  objExp.properties.forEach(propNode => {
    if (!t.isIdentifier(propNode.key)) return;
    const propName = propNode.key.name;

    init(propMetadata, propName);
    propMetadata[propName] = propNode.value;
  });

export default () => ({
  visitor: {
    ImportDeclaration(path, state) {
      if (path.node.source.value !== 'prop-types') return;

      const defaultImport = path.node.specifiers.filter(s =>
        t.isImportDefaultSpecifier(s)
      )[0];

      if (defaultImport) setOption('propTypesAlias', defaultImport.local.name);
    },

    ClassDeclaration(path, state) {
      if (!u.isTopLevelOrExported(path)) return;

      init(state.knownComponents, path.node.id.name);
      state.knownComponents[path.node.id.name].path = u.isExported(path)
        ? path.parentPath
        : path;
    },

    FunctionDeclaration(path, state) {
      if (!u.isTopLevelOrExported(path)) return;

      init(state.knownComponents, path.node.id.name);
      state.knownComponents[path.node.id.name].path = u.isExported(path)
        ? path.parentPath
        : path;
    },

    VariableDeclaration(path, state) {
      if (!u.isTopLevelOrExported(path)) return;

      const declarator = path.node.declarations[0];

      // Special case for, e.g. const t = require('prop-types');
      if (u.isRequirePropTypes(declarator.init)) {
        setOption('propTypesAlias', declarator.id.name);
        return;
      }

      if (!t.isFunction(declarator.init)) return;

      init(state.knownComponents, declarator.id.name);
      state.knownComponents[declarator.id.name].path = u.isExported(path)
        ? path.parentPath
        : path;
    },

    ClassProperty(path, state) {
      if (!path.node.static) return;

      const staticPropName = path.node.key.name;
      if (staticPropName !== 'propTypes') return;
      const staticPropVal = path.node.value;
      if (!t.isObjectExpression(staticPropVal)) return;

      const parentClassDecl = path.findParent(p => t.isClassDeclaration(p));
      const parentClassName = parentClassDecl.node.id.name;
      if (!state.knownComponents[parentClassName]) return;

      init(state.knownComponents[parentClassName], 'props');
      collectPropTypes(
        state.knownComponents[parentClassName].props,
        staticPropVal
      );
    },

    ExpressionStatement(path, state) {
      if (!u.isTopLevel(path)) return;
      if (!t.isAssignmentExpression(path.node.expression)) return;

      const { left, right } = path.node.expression;
      if (!t.isMemberExpression(left)) return;
      if (!t.isObjectExpression(right)) return;
      if (left.property.name !== 'propTypes') return;

      const componentName = left.object.name;
      init(state.knownComponents, componentName, 'props');
      collectPropTypes(state.knownComponents[componentName].props, right);
    },

    Program: {
      enter(path, state) {
        state.knownComponents = {};
      },

      exit(programPath, state) {
        let insertedHelpers = false;

        Object.keys(state.knownComponents).forEach(componentName => {
          const { path, props } = state.knownComponents[componentName];

          if (path && props) {
            if (!insertedHelpers) {
              const helpersName = programPath.scope.generateUidIdentifierBasedOnNode(
                getOption(state, 'helpersName')
              );

              programPath.unshiftContainer('body', buildHelpers(helpersName));
              insertedHelpers = true;
            }

            const newPath = path.insertAfter(
              createMetadataNode(componentName, props, state)
            )[0];

            newPath.traverse(helpersVisitor, state);
          }
        });
      }
    }
  }
});
