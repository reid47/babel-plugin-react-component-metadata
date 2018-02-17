import * as t from 'babel-types';
import * as u from './ast-utils';
import buildHelpers from './build-helpers';
import helpersVisitor from './helpers-visitor';
import createMetadataNode from './create-metadata-node';
import collectComments from './comments';
import { getOption, setOption } from './options';

const init = (obj, ...fields) =>
  fields.forEach(field => {
    obj[field] = obj[field] || {};
    obj = obj[field];
  });

const collectPropMetadata = (propMetadata, objExp) =>
  objExp.properties.forEach(propNode => {
    if (!t.isIdentifier(propNode.key)) return;
    const propName = propNode.key.name;

    init(propMetadata, 'props', propName);
    propMetadata.props[propName] = propNode.value;
    propMetadata.props[propName].comments = collectComments(propNode);
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

      const componentName = path.node.id.name;
      init(state.knownComponents, componentName);
      state.knownComponents[componentName].comments = collectComments(
        path.node
      );
      state.knownComponents[componentName].path = u.isExported(path)
        ? path.parentPath
        : path;
    },

    FunctionDeclaration(path, state) {
      if (!u.isTopLevelOrExported(path)) return;

      const componentName = path.node.id.name;
      init(state.knownComponents, componentName);
      state.knownComponents[componentName].comments = collectComments(
        path.node
      );
      state.knownComponents[componentName].path = u.isExported(path)
        ? path.parentPath
        : path;
    },

    VariableDeclaration(path, state) {
      if (!u.isTopLevelOrExported(path)) return;

      const declarator = path.node.declarations[0];

      if (u.isRequirePropTypes(declarator.init)) {
        setOption('propTypesAlias', declarator.id.name);
        return;
      }

      if (!t.isFunction(declarator.init)) return;

      const componentName = declarator.id.name;
      init(state.knownComponents, componentName);
      state.knownComponents[componentName].comments = collectComments(
        path.node
      );
      state.knownComponents[componentName].path = u.isExported(path)
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
      collectPropMetadata(
        state.knownComponents[parentClassName],
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
      collectPropMetadata(state.knownComponents[componentName], right);
    },

    Program: {
      enter(path, state) {
        state.knownComponents = {};
      },

      exit(programPath, state) {
        let insertedHelpers = false;

        Object.keys(state.knownComponents).forEach(componentName => {
          const componentMetadata = state.knownComponents[componentName];
          const { path, props, comments } = componentMetadata;

          if (path && props) {
            if (!insertedHelpers) {
              const helpersName = programPath.scope.generateUidIdentifierBasedOnNode(
                getOption(state, 'helpersName')
              );

              setOption('helpersName', helpersName);

              programPath.unshiftContainer('body', buildHelpers(helpersName));
              insertedHelpers = true;
            }

            const newPath = path.insertAfter(
              createMetadataNode(componentName, props, comments, state)
            )[0];

            newPath.traverse(helpersVisitor, state);
          }
        });
      }
    }
  }
});
