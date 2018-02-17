import { transform } from './test-helpers';

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

  test('when exported at the top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      export class Test1 extends React.Component {
        render() {
          return <h1>{this.props.name}</h1>;
        }
      }

      Test1.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };

      export default class Test2 extends React.Component {
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
});

describe('ES6 classes with static properties', () => {
  test('simple example', () => {
    const example = `
      import PropTypes from 'prop-types';

      class Test extends React.Component {
        static propTypes = {
          name: PropTypes.string.isRequired,
          age: PropTypes.number
        };

        onClick = () => {
          console.log('This should be ignored.');
        }

        render() {
          return <h1>{this.props.name}</h1>;
        }
      }
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('multiple components at top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      class Test1 extends React.Component {
        static propTypes = {
          name: PropTypes.string.isRequired,
          age: PropTypes.number
        };

        render() {
          return <h1>{this.props.name}</h1>;
        }
      }

      class Test2 extends React.Component {
        static propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
        };

        render() {
          return <h2>{this.props.hello}</h2>;
        }
      }
    `;

    expect(transform(example)).toMatchSnapshot();
  });

  test('when exported at the top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      export class Test1 extends React.Component {
        static propTypes = {
          name: PropTypes.string.isRequired,
          age: PropTypes.number
        };

        render() {
          return <h1>{this.props.name}</h1>;
        }
      }

      export default class Test2 extends React.Component {
        static propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
        };

        render() {
          return <h2>{this.props.hello}</h2>;
        }
      }
    `;

    expect(transform(example)).toMatchSnapshot();
  });
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

  test('when exported at the top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      export const Test1 = props => <h1>{props.name}</h1>;

      Test1.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };

      export default Test2 = props => <h2>{props.hello}</h2>;

      Test2.propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
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

  test('when exported at the top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      export const Test1 = function (props) {
        return <h1>{props.name}</h1>;
      };

      Test1.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };

      export default Test2 = function (props) {
        return <h2>{props.hello}</h2>;
      };

      Test2.propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
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

  test('when exported at the top level', () => {
    const example = `
      import PropTypes from 'prop-types';

      export function Test1(props) {
        return <h1>{props.name}</h1>;
      };

      Test1.propTypes = {
        name: PropTypes.string.isRequired,
        age: PropTypes.number
      };

      export default function Test2(props) {
        return <h2>{props.hello}</h2>;
      };

      Test2.propTypes = {
        hello: PropTypes.node,
        world: PropTypes.bool
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

test('PropTypes can be required under a different name', () => {
  const example = `
    const typ = require('prop-types');

    function Test(props) {
      return <h1>{props.name}</h1>;
    };

    Test.propTypes = {
      name: typ.string.isRequired,
      age: typ.number
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

test('helpers name is always unique', () => {
  const example = `
    import t from 'prop-types';

    const metadataHelpers = 'some other variable...';

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

test('when no components found at all', () => {
  const example = `
    import SomethingElse from 'something-else';
    import { someNonDefaultExport } from 'prop-types';
    const Hmm = require('hmmm');

    module = "This should be ignored."
    SomethingElse.aProperty = "This should also be ignored.";

    var foo = 1;
    if (foo) console.log(foo);
    console.log('This will be ignored.');

    class NotAComponent extends SomethingElse {
      static notPropTypes = 47;
      static propTypes = "A string property called propTypes?";

      method1() {
        console.log('hello!')
      }
    }
  `;

  expect(transform(example)).toMatchSnapshot();
});

test('when no components found at top level', () => {
  const example = `
    import PropTypes from 'prop-types';

    function wrapperFunction() {
      const InnerComponent1 = () => <h1>hello, world</h1>;
      InnerComponent1.propTypes = {
        test: PropTypes.string
      };

      const InnerComponent2 = function() {
        return <h1>hello, world</h1>;
      }
      InnerComponent2.propTypes = {
        test: PropTypes.string
      };

      function InnerComponent3() {
        return <h1>hello, world</h1>;
      }
      InnerComponent3.propTypes = {
        test: PropTypes.string
      };

      class InnerComponent4 extends React.Component {
        static propTypes = {
          test: PropTypes.string
        };

        render() {
          return <h1>hello, world</h1>;
        }
      }
    }
  `;

  expect(transform(example)).toMatchSnapshot();
});
