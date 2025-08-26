import { AppRegistry } from 'react-native';
import App from './App.web';

AppRegistry.registerComponent('AudioToChat', () => App);
AppRegistry.runApplication('AudioToChat', {
  rootTag: document.getElementById('root'),
});
