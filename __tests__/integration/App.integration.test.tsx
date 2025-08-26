import React from 'react';
import renderer from 'react-test-renderer';
import App from '../../App';

// Mock SafeAreaProvider to avoid native dependencies
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
}));

// Mock the ChatScreen component to avoid complex dependencies
jest.mock('../../src/components/ChatScreen', () => {
  const mockReact = require('react');
  return function MockChatScreen() {
    return mockReact.createElement('View', { testID: 'chat-screen' });
  };
});

describe('App Integration Tests', () => {
  it('should render the complete application without crashing', () => {
    expect(() => {
      const tree = renderer.create(<App />);
      tree.unmount();
    }).not.toThrow();
  });

  it('should create a valid component tree', () => {
    const tree = renderer.create(<App />);
    const instance = tree.getInstance();
    expect(instance).toBeDefined();
    tree.unmount();
  });

  it('should match snapshot structure', () => {
    const tree = renderer.create(<App />);
    expect(tree.toJSON()).toMatchSnapshot();
    tree.unmount();
  });
});
