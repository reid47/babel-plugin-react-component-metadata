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
