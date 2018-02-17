import * as t from 'babel-types';
import * as u from './ast-utils';
import { getOption } from './options';

const createCommentNode = node => {
  if (!node.hasComments) return;
  return u.objProp(
    u.id('description'),
    u.obj(
      u.objProp(
        u.id('lines'),
        t.arrayExpression(node.lines.map(c => t.stringLiteral(c)))
      )
    )
  );
};

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
              u.obj(
                u.objProp(u.id('type'), t.cloneDeep(propsNodes[propName])),
                createCommentNode(propsNodes[propName].comments)
              )
            )
          )
        )
      ),
      createCommentNode(comments)
    )
  );
};
