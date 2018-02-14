import * as t from 'babel-types';
import * as u from './ast-utils';
import buildHelpers from './build-helpers';

const init = (obj, ...fields) => {
  fields.forEach(field => {
    obj[field] = obj[field] || {};
    obj = obj[field];
  });
};

const isTopLevel = path => {
  return path.parent.type === 'Program';
};

export default () => {
  const defaultOptions = {
    propTypesAlias: 'PropTypes',
    metadataPropertyName: 'metadata',
    helpersName: u.id('metadataHelpers')
  };

  const renameVisitor = {
    Identifier(path, state) {
      if (path.node.name === defaultOptions.propTypesAlias) {
        path.node.name = defaultOptions.helpersName.name;
      }
    },

    MemberExpression(path, state) {
      if (
        (t.isCallExpression(path.node.object) ||
          t.isMemberExpression(path.node.object)) &&
        t.isIdentifier(path.node.property, { name: 'isRequired' })
      ) {
        path.replaceWith(
          t.callExpression(
            u.member(defaultOptions.helpersName, u.id('isRequired')),
            [path.node.object]
          )
        );
      }
    }
  };

  const collectPropTypes = (propMetadata, objExp) => {
    objExp.properties.forEach(propNode => {
      if (!t.isIdentifier(propNode.key)) return;
      const propName = propNode.key.name;

      init(propMetadata, propName);
      propMetadata[propName] = propNode.value;
    });
  };

  const buildFakeProps = propsAst => {
    return u.obj(
      ...Object.keys(propsAst).map(propName => {
        const clone = t.cloneDeep(propsAst[propName]);
        clone.loc = null;
        return u.objProp(u.id(propName), u.obj(u.objProp(u.id('type'), clone)));
      })
    );
  };

  return {
    visitor: {
      ImportDeclaration(path, state) {
        if (!isTopLevel(path)) return;
        if (path.node.source.value !== 'prop-types') return;

        const defaultImportSpecifier = path.node.specifiers.filter(s =>
          t.isImportDefaultSpecifier(s)
        )[0];
        if (!defaultImportSpecifier) return;

        defaultOptions.propTypesAlias = defaultImportSpecifier.local.name;
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

        init(state.knownComponents, parentClassName, 'props');
        //state.knownComponents[parentClassName].path = path.node.value;
        collectPropTypes(
          state.knownComponents[parentClassName].props,
          staticPropVal
        );
      },

      ExpressionStatement(path, state) {
        if (!isTopLevel(path)) return;
        if (!t.isAssignmentExpression(path.node.expression)) return;

        const left = path.node.expression.left;
        if (!t.isMemberExpression(left)) return;
        if (left.property.name !== 'propTypes') return;

        const right = path.node.expression.right;
        if (!t.isObjectExpression(right)) return;

        const componentName = left.object.name;
        init(state.knownComponents, componentName, 'props');
        collectPropTypes(state.knownComponents[componentName].props, right);
      },

      Program: {
        enter(path, state) {
          state.knownComponents = {};
        },

        exit(path, state) {
          defaultOptions.helpersName = path.scope.generateUidIdentifierBasedOnNode(
            defaultOptions.helpersName
          );

          if (Object.keys(state.knownComponents).length) {
            path.unshiftContainer(
              'body',
              buildHelpers(defaultOptions.helpersName)
            );
          }

          Object.keys(state.knownComponents).forEach(c => {
            const componentPath = state.knownComponents[c].path;
            const componentProps = state.knownComponents[c].props;

            if (componentPath && componentProps) {
              const newPath = componentPath.insertAfter(
                u.assignment(
                  u.member(
                    u.id(c),
                    u.id(
                      state.opts.metadataPropertyName ||
                        defaultOptions.metadataPropertyName
                    )
                  ),
                  u.obj(
                    u.objProp(u.id('props'), buildFakeProps(componentProps))
                  )
                )
              )[0];

              newPath.traverse(renameVisitor);
            }
          });
        }
      }
    }
  };
};
