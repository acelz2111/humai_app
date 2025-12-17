module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 1. Manually specify the missing Babel plugins here:
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator",
      
      // 2. The reanimated plugin MUST be the last item!
      'react-native-reanimated/plugin',
    ],
  };
};