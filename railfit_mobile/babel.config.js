// Babel Configuration for RailFit Mobile App
// Recovered from $RH20MGA.js
// Provides module resolution with path aliases and React Native preset

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/hooks': './src/hooks',
            '@/contexts': './src/contexts',
            '@/types': './src/types',
            '@/constants': './src/constants',
            '@/utils': './src/utils',
            '@/config': './src/config',
            '@/assets': './src/assets'
          },
          extensions: [
            '.ios.js',
            '.android.js',
            '.native.js',
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.json'
          ]
        }
      ]
    ]
  };
};