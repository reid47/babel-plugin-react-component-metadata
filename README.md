# babel-plugin-react-component-metadata

A Babel plugin to examine your React components and collect metadata about them
(like prop types and documentation comments). It then makes this information
available as properties on the React components themselves.

For example, you might have a component like this:

```jsx
const MyComponent = ({ firstName }) => {
  return (
    <h1>
      Hello, {firstName} {lastName}!
    </h1>
  );
};

MyComponent.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired
};
```

And somewhere else, you might want to import that component and inspect its
metadata to generate documentation for it:

```jsx
import MyComponent from 'path/to/component';
import formatType from 'some/helper';

const MyComponentDocs = () => {
  const { props } = MyComponent.__propMetadata;
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
      {Object.keys(props).map(propName => {
        <tr>
          <td>{propName}</td>
          <td>{formatType(props[propName].type)}</td>
          <td>{props[propName].required ? 'true' : 'false'}</td>
        <tr>
      })}
      </tbody>
    </table>
  );
};
```

This plugin inserts the static field `__propMetadata` on your components and
populates it with the information it collects.

## but why??

The primary goal is to help with **automatic documentation generation**. For
example, if you're building a component library, you'll probably want some kind
of documentation. But manually keeping your documentation up-to-date with the
code is hard. Every time you add/remove/change a prop in the code, you would
need to go update your documentation accordingly. It's better to have one source
of truth - the code - and let your documentation pull directly from there.

That's why I built this. It's currently tailored to fit my needs, so there are
some things missing that I didn't need (support for Flow types, support for ES5
classes using `createReactClass`, etc.). If you'd like to help add this
functionality, PRs are welcome!

## how do I use it?

## how does it work?
