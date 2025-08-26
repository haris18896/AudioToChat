/* eslint-env jest */

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  const mockSound = {
    setCategory: jest.fn(),
    MAIN_BUNDLE: 'MAIN_BUNDLE',
    getDuration: jest.fn(() => 10),
    play: jest.fn(callback => callback && callback(true)),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
    setCurrentTime: jest.fn(),
    getCurrentTime: jest.fn(callback => callback && callback(0)),
    setSpeed: jest.fn(),
  };

  const Sound = jest.fn((path, basePath, callback) => {
    if (callback) {
      setTimeout(() => callback(null), 100);
    }
    return mockSound;
  });

  Sound.setCategory = jest.fn();
  Sound.MAIN_BUNDLE = 'MAIN_BUNDLE';

  return {
    default: Sound,
  };
});

// Mock moment for consistent time formatting in tests
jest.mock('moment', () => {
  const originalMoment = jest.requireActual('moment');
  return {
    ...originalMoment,
    utc: time => originalMoment.utc(time),
  };
});

// Mock global Audio object for web platform
global.Audio = jest.fn(() => ({
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn((event, callback) => {
    if (event === 'loadedmetadata') {
      setTimeout(() => {
        Object.defineProperty(global.Audio.mock.results[0].value, 'duration', {
          value: 10,
        });
        callback();
      }, 50);
    }
    if (event === 'ended') {
      setTimeout(() => callback(), 1000);
    }
  }),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 0,
}));

// Use fake timers for consistent testing of time-based logic
jest.useFakeTimers();

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.runAllTimers();
});
