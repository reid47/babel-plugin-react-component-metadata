import * as babel from 'babel-core';
import plugin from '../src';

const transform = example => {
  const { code } = babel.transform(example, {
    plugins: ['syntax-jsx', plugin]
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

// when renaming proptypes import

// when components declared not at top-level
