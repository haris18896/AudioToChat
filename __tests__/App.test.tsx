/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// Mock the ChatScreen component
jest.mock('../src/components/ChatScreen', () => {
  const mockReact = require('react');
  return function MockChatScreen() {
    return mockReact.createElement('Text', {}, 'ChatScreen');
  };
});

// Mock SafeAreaProvider
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
}));

describe('App', () => {
  it('renders correctly with test renderer', () => {
    expect(() => {
      const tree = ReactTestRenderer.create(<App />);
      tree.unmount();
    }).not.toThrow();
  });

  it('creates a valid component tree', () => {
    const tree = ReactTestRenderer.create(<App />);
    const instance = tree.getInstance();
    expect(instance).toBeDefined();
    tree.unmount();
  });

  it('matches snapshot structure', () => {
    const tree = ReactTestRenderer.create(<App />);
    expect(tree.toJSON()).toMatchSnapshot();
    tree.unmount();
  });

  it('handles component lifecycle correctly', () => {
    const tree = ReactTestRenderer.create(<App />);
    expect(() => tree.unmount()).not.toThrow();
  });
});
