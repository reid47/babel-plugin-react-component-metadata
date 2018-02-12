import * as t from 'babel-types';
import buildHelpers from './build-helpers';

const id = name => t.identifier(name);

const init = (obj, ...fields) => {
  fields.forEach(field => {
    obj[field] = obj[field] || {};
    obj = obj[field];
  });
};

export default () => {
  const knownComponents = {};

  const options = {
    propTypesAlias: 'PropTypes',
    metadataFieldName: '__metadata',
    helpersName: id('metadataHelpers')
  };

  const renameVisitor = {
    Identifier: path => {
      if (path.node.name === options.propTypesAlias) {
        path.node.name = options.helpersName.name;
      }
    },
    MemberExpression: path => {
      if (
        (t.isCallExpression(path.node.object) ||
          t.isMemberExpression(path.node.object)) &&
        t.isIdentifier(path.node.property, { name: 'isRequired' })
      ) {
        path.replaceWith(
          t.callExpression(
            t.memberExpression(options.helpersName, id('isRequired')),
            [path.node.object]
          )
        );
      }
    }
  };

  const isTopLevel = path => {
    return path.parent.type === 'Program';
  };

  const collectPropTypes = (propMetadata, objExp) => {
    objExp.properties.forEach(propNode => {
      if (!t.isIdentifier(propNode.key)) return;
      const propName = propNode.key.name;
      let type = '<unknown>',
        required = false;

      init(propMetadata, propName);
      propMetadata[propName] = propNode.value;
    });
  };

  const buildFakeProps = propsAst => {
    return t.objectExpression(
      Object.keys(propsAst).map(propName => {
        const clone = t.cloneDeep(propsAst[propName]);
        clone.loc = null;
        return t.objectProperty(
          id(propName),
          t.objectExpression([t.objectProperty(id('type'), clone)])
        );
      })
    );
  };

  return {
    visitor: {
      ImportDeclaration: path => {
        if (!isTopLevel(path)) return;
        if (path.node.source.value !== 'prop-types') return;

        const defaultImportSpecifier = path.node.specifiers.filter(s =>
          t.isImportDefaultSpecifier(s)
        )[0];
        if (!defaultImportSpecifier) return;

        options.propTypesAlias = defaultImportSpecifier.local.name;
      },

      ClassDeclaration: path => {
        if (!isTopLevel(path)) return;

        init(knownComponents, path.node.id.name);
        knownComponents[path.node.id.name].path = path;
      },

      FunctionDeclaration: path => {
        if (!isTopLevel(path)) return;

        init(knownComponents, path.node.id.name);
        knownComponents[path.node.id.name].path = path;
      },

      VariableDeclaration: path => {
        if (!isTopLevel(path)) return;

        const declarator = path.node.declarations[0];
        if (!t.isFunction(declarator.init)) return;

        init(knownComponents, declarator.id.name);
        knownComponents[declarator.id.name].path = path;
      },

      ClassProperty: path => {
        if (!path.node.static) return;

        const staticPropName = path.node.key.name;
        if (staticPropName !== 'propTypes') return;
        const staticPropVal = path.node.value;
        if (!t.isObjectExpression(staticPropVal)) return;

        const parentClassDecl = path.findParent(p => t.isClassDeclaration(p));
        const parentClassName = parentClassDecl.node.id.name;
        if (!knownComponents[parentClassName]) return;

        init(knownComponents, parentClassName, 'props');
        //knownComponents[parentClassName].path = path.node.value;
        collectPropTypes(knownComponents[parentClassName].props, staticPropVal);
      },

      ExpressionStatement: path => {
        if (!isTopLevel(path)) return;
        if (!t.isAssignmentExpression(path.node.expression)) return;

        const left = path.node.expression.left;
        if (!t.isMemberExpression(left)) return;
        if (left.property.name !== 'propTypes') return;

        const right = path.node.expression.right;
        if (!t.isObjectExpression(right)) return;

        const componentName = left.object.name;
        init(knownComponents, componentName, 'props');
        collectPropTypes(knownComponents[componentName].props, right);
      },

      Program: {
        exit: path => {
          options.helpersName = path.scope.generateUidIdentifierBasedOnNode(
            options.helpersName
          );

          if (Object.keys(knownComponents).length) {
            path.unshiftContainer('body', buildHelpers(options.helpersName));
          }

          Object.keys(knownComponents).forEach(c => {
            const componentPath = knownComponents[c].path;
            const componentProps = knownComponents[c].props;

            if (componentPath && componentProps) {
              const newPath = componentPath.insertAfter(
                t.expressionStatement(
                  t.assignmentExpression(
                    '=',
                    t.memberExpression(id(c), id(options.metadataFieldName)),
                    t.objectExpression([
                      t.objectProperty(
                        id('props'),
                        buildFakeProps(componentProps)
                      )
                    ])
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
