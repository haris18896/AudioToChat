const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.platforms = ['web', 'ios', 'android'];
config.resolver.alias = {
  'react-native$': 'react-native-web',
};

module.exports = config;
