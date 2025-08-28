/* eslint-env jest */

// Mock react-native-video for native platform
jest.mock('react-native-video', () => {
  const React = require('react');

  const MockVideo = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      seek: jest.fn(time => {
        // Simulate seeking
        if (props.onProgress) {
          setTimeout(() => {
            props.onProgress({
              currentTime: time,
              playableDuration: 10,
              seekableDuration: 10,
            });
          }, 50);
        }
      }),
    }));

    // Simulate component lifecycle
    React.useEffect(() => {
      // Simulate video loaded
      if (props.onLoad) {
        setTimeout(() => props.onLoad({ duration: 10, currentTime: 0 }), 100);
      }

      // Simulate progress updates when playing
      if (props.onProgress && !props.paused) {
        const progressInterval = setInterval(() => {
          const currentTime = (props.currentTime || 0) + 0.1;
          props.onProgress({
            currentTime,
            playableDuration: 10,
            seekableDuration: 10,
          });
        }, 100);

        return () => clearInterval(progressInterval);
      }
    }, [props]);

    return React.createElement('View', {
      testID: 'mock-video',
      style: props.style,
    });
  });

  return {
    default: MockVideo,
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
    if (event === 'timeupdate') {
      // Simulate time updates
      const timeUpdateInterval = setInterval(() => {
        const audio = global.Audio.mock.results[0].value;
        if (audio.currentTime < audio.duration) {
          audio.currentTime += 0.1;
          callback();
        } else {
          clearInterval(timeUpdateInterval);
        }
      }, 100);
    }
  }),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
}));

// Mock Platform.OS for consistent testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'web', // Default to web for testing
    },
  };
});

// Use fake timers for consistent testing of time-based logic
jest.useFakeTimers();

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.runAllTimers();
});
