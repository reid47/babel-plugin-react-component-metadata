import * as t from 'babel-types';
import * as u from './ast-utils';
import { getOption } from './options';

export default (componentName, propsNodes, comments, state) => {
  return u.assignment(
    u.member(
      u.id(componentName),
      u.id(getOption(state, 'metadataPropertyName'))
    ),
    u.obj(
      u.objProp(
        u.id('props'),
        u.obj(
          ...Object.keys(propsNodes).map(propName =>
            u.objProp(
              u.id(propName),
              u.obj(u.objProp(u.id('type'), t.cloneDeep(propsNodes[propName])))
            )
          )
        )
      ),
      u.objProp(
        u.id('comments'),
        u.obj(
          u.objProp(
            u.id('hasComments'),
            t.booleanLiteral(comments.hasComments)
          ),
          comments.hasComments &&
            u.objProp(
              u.id('lines'),
              t.arrayExpression(comments.lines.map(c => t.stringLiteral(c)))
            )
        )
      )
    )
  );
};
