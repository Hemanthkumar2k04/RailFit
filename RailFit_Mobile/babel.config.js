module.exports = {
  presets: [
    ['module:@react-native/babel-preset', {
      runtime: 'automatic',
    }],
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@assets': './src/assets',
        },
      },
    ],
  ],
};