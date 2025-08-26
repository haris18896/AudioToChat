/**
 * VoiceTranscriber Web App
 * Cross-platform chat interface with media player
 */

import React from 'react';
import { GlobalStyles } from './src/styles/globalStyles';
import ChatScreen from './src/components/ChatScreen';

function App() {
  return (
    <>
      <GlobalStyles />
      <ChatScreen />
    </>
  );
}

export default App;
