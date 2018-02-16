# babel-plugin-react-component-metadata

A Babel plugin that examines your React components and collects metadata about
them (like prop types and documentation comments). It makes this information
available as properties on the React components themselves, so you can use them
to generate documentation.

For example, you might have a component like this:

```jsx
const MyComponent = ({ firstName = 'Mx.', lastName }) => {
  return (
    <h1>
      Hello, {firstName} {lastName}!
    </h1>
  );
};

MyComponent.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string.isRequired
};
```

And somewhere else, you might want to import that component and inspect its
metadata to generate documentation for it:

```jsx
import MyComponent from 'path/to/component';
import formatType from 'some/helper';

const MyComponentDocs = () => {
  const { props } = MyComponent.metadata;

  return (
    <table>
      <thead>
        <tr>
          <th>Prop name</th>
          <th>Prop type</th>
          <th>Required?</th>
        </tr>
      </thead>
      <tbody>
      {Object.keys(props).map(propName => (
        <tr>
          <td>{propName}</td>
          <td>{formatType(props[propName].type)}</td>
          <td>{props[propName].required ? 'true' : 'false'}</td>
        <tr>
      ))}
      </tbody>
    </table>
  );
};
```

This plugin inserts the static field `metadata` on your components and populates
it with the information it collects (the name of this property is configurable -
see below).

## why does this exist?

The primary goal of this plugin is to help with **automatic documentation
generation**. If you're building a component library, for example, you'll
probably want some kind of documentation. But manually keeping your
documentation up-to-date with the code is hard. Every time you add/remove/change
a prop in the code, you need to update your documentation accordingly. It's
better to have one source of truth - the code - and let your documentation pull
directly from there.

That's why I built this plugin. It's currently tailored to fit my use cases,
which means I didn't implement features I didn't need (e.g. support for
inspecting Flow types, support for ES5 classes using `createReactClass`). But if
you'd like to help add features or otherwise improve this plugin, PRs are
welcome!

## how do I use it?

### requirements

### plugin options

## how does it work?

Behind the scenes, this plugin is leveraging the information Babel knows about your source code to help you document your components. Babel handles the parsing of your code into an abstract syntax tree and (eventually) prints your AST back out as transformed code. This plugin examines the syntax tree in the middle and inserts some addtional nodes containing extra information, so that when the code is generated again, it contains this new info.

For example, if you wrote code defining a component like this:

```jsx
class Heading extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired
  };

  render() {
    return <h1>{this.props.text}</h1>;
  }
}
```

...it would be transformed into code that looks something like this:

```jsx
// A tiny library inserted into your code to dynamically
// expose prop-types info
var metadataHelper = ...

class Heading extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired
  };

  render() {
    return <h1>{this.props.text}</h1>;
  }
}

Heading.metadata = {
  props: {
    text: metadataHelper.isRequired(metadataHelper.string)
  }
};
```

...and then, as shown above, you could import `Heading` elsewhere and access `Heading.metadata.props` to see the prop information.
