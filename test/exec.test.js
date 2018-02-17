import { transformModule } from './test-helpers';

test('populates metadata correctly', () => {
  const example = `
    const React = require('react');
    const PropTypes = require('prop-types');

    class MyComponent {
      static propTypes = {
        prop1: PropTypes.string.isRequired,
        prop2: PropTypes.oneOf(['sm', 'md', 'lg']),
        prop3: PropTypes.shape({
          alpha: PropTypes.number,
          beta: PropTypes.bool
        })
      };

      render() {
        return (
          <div>
            <h1>{this.props.prop1}</h1>
            <h2>{this.props.prop2}</h2>
            <h3>{this.props.prop3.alpha} {this.props.prop3.beta}</h3>
          </div>
        );
      }
    }
  `;

  const transformed = transformModule(example);
  const f = new Function('require', `${transformed};return MyComponent;`);
  const component = f(require);

  expect(component.metadata).toEqual({
    props: {
      prop1: {
        type: {
          type: 'string',
          required: true
        }
      },
      prop2: {
        type: {
          type: 'oneOf',
          possibleValues: ['sm', 'md', 'lg'],
          required: false
        }
      },
      prop3: {
        type: {
          type: 'shape',
          required: false,
          innerTypes: {
            alpha: {
              required: false,
              type: 'number'
            },
            beta: {
              required: false,
              type: 'bool'
            }
          }
        }
      }
    }
  });
});
