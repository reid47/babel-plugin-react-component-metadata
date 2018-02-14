import * as babel from 'babel-core';
import plugin from '../src';

const transform = (example, options) => {
  const { code } = babel.transform(example, {
    plugins: ['syntax-jsx', options ? [plugin, options] : plugin]
  });

  return code;
};

test('when no React components found', () => {
  const example = `
    import SomethingElse from 'something-else';
    const Hmm = require('hmmm');

    var foo = 1;
    if (foo) console.log(foo);
  `;

  expect(transform(example)).toMatchSnapshot();
});

describe('ES6 classes without static properties', () => {
  test('simple example', () => {
    const example = `
      import PropTypes from 'prop-types';

      class Test extends React.Component {
        render() {
          return <h1>{this.props.name}</h1>;
        }
      }

      Test.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('multiple components at top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      class Test1 extends React.Component {
        render() {
          return <h1>{this.props.name}</h1>;
        }
      }

      Test1.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };

      class Test2 extends React.Component {
        render() {
          return <h2>{this.props.hello}</h2>;
        }
      }

      Test2.propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('when exported at the top level', () => {});
});

describe('functional components (arrow expression)', () => {
  test('simple example', () => {
    const example = `
      import PropTypes from 'prop-types';

      const Test = props => <h1>{props.name}</h1>;

      Test.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('multiple components at top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      const Test1 = props => <h1>{props.name}</h1>;

      Test1.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };

      const Test2 = props => <h2>{props.hello}</h2>;

      Test2.propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('when exported at the top level', () => {});
});

describe('functional components (function expression)', () => {
  test('simple example', () => {
    const example = `
      import PropTypes from 'prop-types';

      const Test = function (props) {
        return <h1>{props.name}</h1>;
      };

      Test.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('multiple components at top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      const Test1 = function (props) {
        return <h1>{props.name}</h1>;
      };

      Test1.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };

      const Test2 = function (props) {
        return <h2>{props.hello}</h2>;
      };

      Test2.propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('when exported at the top level', () => {});
});

describe('functional components (function declaration)', () => {
  test('simple example', () => {
    const example = `
      import PropTypes from 'prop-types';

      function Test(props) {
        return <h1>{props.name}</h1>;
      };

      Test.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('multiple components at top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      function Test1(props) {
        return <h1>{props.name}</h1>;
      };

      Test1.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };

      function Test2(props) {
        return <h2>{props.hello}</h2>;
      };

      Test2.propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
      };
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('when exported at the top level', () => {});
});

test('PropTypes can be imported under a different name', () => {
  const example = `
      import t from 'prop-types';

      function Test(props) {
        return <h1>{props.name}</h1>;
      };

      Test.propTypes = {
        name: t.string.isRequired,
        age: t.number
      };
    `;

  expect(transform(example)).toMatchSnapshot();
});

test('metadata property name can be configured', () => {
  const example = `
      import t from 'prop-types';

      function Test(props) {
        return <h1>{props.name}</h1>;
      };

      Test.propTypes = {
        name: t.string.isRequired,
        age: t.number
      };
    `;

  expect(
    transform(example, {
      metadataPropertyName: '__customMetadata'
    })
  ).toMatchSnapshot();
});

// when components declared not at top-level
