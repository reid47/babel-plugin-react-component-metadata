import { transform } from './test-helpers';

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

describe('comments prop types', () => {
  test('mixed example', () => {
    const example = `
      class Test1 extends React.Component {
        static propTypes = {
          // A comment for Test1 name
          name: PropTypes.string
        }

        render() {
          return null;
        }
      }

      class Test2 extends React.Component {
        render() {
          return null;
        }
      }
      Test2.propTypes = {
        /*
         * A comment for Test2 name
         */
        name: PropTypes.string
      };

      function Test3() {
        return null;
      }
      Test3.propTypes = {
        // Test3 name, line 1
        // Test3 name, line 2
        name: PropTypes.string
      };

      const Test4 = () => null;
      Test4.propTypes = {
        /* Test4 name */
        name: PropTypes.string,
        // Test4 num
        num: PropTypes.number
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });
});
