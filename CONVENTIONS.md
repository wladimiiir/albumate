- when creating Props type for a component, always use `type Props`
- do not use React.FC for components as type, if needed use `{}: Props` as argument. Example:

```ts
// bad
const MyComponent: React.FC<Props> = () => {
  return <div>Hello</div>;
};

// good
const MyComponent = ({value}: Props) => {
  return <div>Hello</div>;
};
```

