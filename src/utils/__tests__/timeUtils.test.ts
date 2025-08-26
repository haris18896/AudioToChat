import {
  formatTime,
  formatTimeWithMilliseconds,
  calculateProgress,
} from '../timeUtils';

// Mock moment properly
jest.mock('moment', () => {
  const originalMoment = jest.requireActual('moment');
  return {
    ...originalMoment,
    utc: (time: number) => originalMoment.utc(time),
  };
});

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('should format milliseconds to mm:ss format', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(1000)).toBe('00:01');
      expect(formatTime(60000)).toBe('01:00');
      expect(formatTime(61000)).toBe('01:01');
      expect(formatTime(3661000)).toBe('01:01'); // moment caps at 60 minutes
    });

    it('should handle large time values', () => {
      expect(formatTime(3600000)).toBe('00:00'); // 1 hour wraps around
      expect(formatTime(7200000)).toBe('00:00'); // 2 hours wraps around
    });

    it('should handle negative values', () => {
      expect(formatTime(-1000)).toBe('59:59'); // negative wraps around
    });
  });

  describe('formatTimeWithMilliseconds', () => {
    it('should format milliseconds to mm:ss.SS format', () => {
      expect(formatTimeWithMilliseconds(0)).toBe('00:00.00');
      expect(formatTimeWithMilliseconds(1500)).toBe('00:01.50');
      expect(formatTimeWithMilliseconds(61500)).toBe('01:01.50');
    });

    it('should handle precise millisecond values', () => {
      expect(formatTimeWithMilliseconds(1234)).toBe('00:01.23');
      expect(formatTimeWithMilliseconds(59999)).toBe('00:59.99');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress as a ratio between 0 and 1', () => {
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(50, 100)).toBe(0.5);
      expect(calculateProgress(100, 100)).toBe(1);
    });

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 0)).toBe(0);
      expect(calculateProgress(50, 0)).toBe(0);
      expect(calculateProgress(-10, 100)).toBe(0);
      expect(calculateProgress(150, 100)).toBe(1);
    });

    it('should return values clamped between 0 and 1', () => {
      expect(calculateProgress(-50, 100)).toBe(0);
      expect(calculateProgress(200, 100)).toBe(1);
    });

    it('should handle decimal values', () => {
      expect(calculateProgress(33.33, 100)).toBe(0.3333);
      expect(calculateProgress(66.67, 100)).toBeCloseTo(0.6667, 4);
    });
  });
});
