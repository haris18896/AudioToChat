import React from 'react';

import { SafeAreaView, StyleSheet } from 'react-native';
import { ChatScreen } from './src/components';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

export default App;
