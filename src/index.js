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

const isTopLevel = path => path.parent.type === 'Program';

export default () => {
  const collectPropTypes = (propMetadata, objExp) =>
    objExp.properties.forEach(propNode => {
      if (!t.isIdentifier(propNode.key)) return;
      const propName = propNode.key.name;

      init(propMetadata, propName);
      propMetadata[propName] = propNode.value;
    });

  return {
    visitor: {
      ImportDeclaration(path, state) {
        if (path.node.source.value !== 'prop-types') return;

        const defaultImport = path.node.specifiers.filter(s =>
          t.isImportDefaultSpecifier(s)
        )[0];
        if (!defaultImport) return;

        setOption('propTypesAlias', defaultImport.local.name);
      },

      ClassDeclaration(path, state) {
        if (!isTopLevel(path)) return;

        init(state.knownComponents, path.node.id.name);
        state.knownComponents[path.node.id.name].path = path;
      },

      FunctionDeclaration(path, state) {
        if (!isTopLevel(path)) return;

        init(state.knownComponents, path.node.id.name);
        state.knownComponents[path.node.id.name].path = path;
      },

      VariableDeclaration(path, state) {
        if (!isTopLevel(path)) return;

        const declarator = path.node.declarations[0];
        if (!t.isFunction(declarator.init)) return;

        init(state.knownComponents, declarator.id.name);
        state.knownComponents[declarator.id.name].path = path;
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
        if (!isTopLevel(path)) return;
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

        exit(path, state) {
          let insertedHelpers = false;

          Object.keys(state.knownComponents).forEach(c => {
            const componentPath = state.knownComponents[c].path;
            const componentProps = state.knownComponents[c].props;

            if (componentPath && componentProps) {
              if (!insertedHelpers) {
                const helpersName = path.scope.generateUidIdentifierBasedOnNode(
                  getOption(state, 'helpersName')
                );

                path.unshiftContainer('body', buildHelpers(helpersName));
                insertedHelpers = true;
              }

              const newPath = componentPath.insertAfter(
                createMetadataNode(c, componentProps, state)
              )[0];

              newPath.traverse(helpersVisitor, state);
            }
          });
        }
      }
    }
  };
};
