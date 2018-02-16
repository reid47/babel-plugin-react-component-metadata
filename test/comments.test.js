import * as babel from 'babel-core';
import plugin from '../src';

const transform = (example, options) => {
  const { code } = babel.transform(example, {
    plugins: [
      'syntax-class-properties',
      'syntax-jsx',
      options ? [plugin, options] : plugin
    ]
  });

  return code;
};

describe('comments on classes/functions', () => {
  test('mixed example', () => {
    const example = `
      // This is a comment for class Test1
      // with multiple lines.
      class Test1 extends React.Component {
        static propTypes = {
          name: PropTypes.string
        }

        render() {
          return null;
        }
      }

      /*
      * This is a comment
      * for class Test2.
      */
      class Test2 extends React.Component {
        render() {
          return null;
        }
      }
      Test2.propTypes = {
        name: PropTypes.string
      };

      // Comment for Test3
      function Test3() {
        return null;
      }
      Test3.propTypes = {name: PropTypes.string};

      /* Comment for Test4 */
      const Test4 = () => null;
      Test4.propTypes = {name: PropTypes.string};
    `;

    expect(transform(example)).toMatchSnapshot();
  });
});

xdescribe('comments prop types', () => {});
