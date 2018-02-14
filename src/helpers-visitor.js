import * as t from 'babel-types';
import * as u from './ast-utils';
import { getOption } from './options';

export default {
  Identifier(path, state) {
    if (path.node.name === getOption(state, 'propTypesAlias')) {
      path.node.name = getOption(state, 'helpersName').name;
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
          u.member(getOption(state, 'helpersName'), u.id('isRequired')),
          [path.node.object]
        )
      );
    }
  }
};
