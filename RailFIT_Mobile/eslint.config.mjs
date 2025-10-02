import reactNative from '@react-native/eslint-config';

export default [
  ...reactNative.configs.all,
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', 'babel.config.js'],
  },
];
