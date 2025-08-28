import {
  processTranscriptionData,
  phraseTimingsToMessages,
  getCurrentPhraseIndex,
  getVisibleMessages,
  updateMessageStates,
} from '../transcriptionUtils';
import { PhraseTiming, ChatMessage } from '../../types/chat';

// Mock transcription data
const mockTranscriptionData = {
  pause: 250,
  speakers: [
    {
      name: 'john',
      phrases: [
        { words: 'Hello there', time: 1000 },
        { words: 'How are you?', time: 1500 },
        { words: 'Nice to meet you', time: 1200 },
      ],
    },
    {
      name: 'jack',
      phrases: [
        { words: 'I am fine', time: 1200 },
        { words: 'Thank you', time: 800 },
        { words: 'You too', time: 600 },
      ],
    },
  ],
};

// Large dataset for testing binary search
const largeTranscriptionData = {
  pause: 100,
  speakers: [
    {
      name: 'speaker1',
      phrases: Array.from({ length: 150 }, (_, i) => ({
        words: `Phrase ${i + 1} from speaker 1`,
        time: 500 + i * 100,
      })),
    },
    {
      name: 'speaker2',
      phrases: Array.from({ length: 150 }, (_, i) => ({
        words: `Phrase ${i + 1} from speaker 2`,
        time: 600 + i * 100,
      })),
    },
  ],
};

describe('transcriptionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processTranscriptionData', () => {
    it('should process transcription data correctly', () => {
      const result = processTranscriptionData(mockTranscriptionData);

      expect(result).toHaveLength(6); // 3 phrases from each speaker
      expect(result[0]).toEqual({
        id: 'phrase_1',
        speaker: 'john',
        text: 'Hello there',
        startTime: 0,
        duration: 1000,
        endTime: 1000,
        speakerIndex: 0,
        phraseIndex: 0,
      });

      expect(result[1]).toEqual({
        id: 'phrase_2',
        speaker: 'jack',
        text: 'I am fine',
        startTime: 1250, // 1000 + 250 (pause)
        duration: 1200,
        endTime: 2450,
        speakerIndex: 1,
        phraseIndex: 0,
      });
    });

    it('should handle empty transcription data', () => {
      const emptyData = { pause: 0, speakers: [] };
      const result = processTranscriptionData(emptyData);

      expect(result).toHaveLength(0);
    });

    it('should handle single speaker', () => {
      const singleSpeakerData = {
        pause: 100,
        speakers: [
          {
            name: 'john',
            phrases: [
              { words: 'Hello', time: 1000 },
              { words: 'World', time: 800 },
            ],
          },
        ],
      };

      const result = processTranscriptionData(singleSpeakerData);

      expect(result).toHaveLength(2);
      expect(result[0].speaker).toBe('john');
      expect(result[1].speaker).toBe('john');
    });

    it('should cache results for identical data', () => {
      const result1 = processTranscriptionData(mockTranscriptionData);
      const result2 = processTranscriptionData(mockTranscriptionData);

      expect(result1).toBe(result2); // Should return cached result
      expect(result1).toEqual(result2);
    });

    it('should handle different pause values', () => {
      const dataWithDifferentPause = {
        ...mockTranscriptionData,
        pause: 500,
      };

      const result = processTranscriptionData(dataWithDifferentPause);

      expect(result[1].startTime).toBe(1500); // 1000 + 500 (new pause)
    });
  });

  describe('phraseTimingsToMessages', () => {
    it('should convert phrase timings to messages', () => {
      const phraseTimings: PhraseTiming[] = [
        {
          id: 'phrase_1',
          speaker: 'john',
          text: 'Hello there',
          startTime: 0,
          duration: 1000,
          endTime: 1000,
          speakerIndex: 0,
          phraseIndex: 0,
        },
        {
          id: 'phrase_2',
          speaker: 'jack',
          text: 'I am fine',
          startTime: 1250,
          duration: 1200,
          endTime: 2450,
          speakerIndex: 1,
          phraseIndex: 0,
        },
      ];

      const result = phraseTimingsToMessages(phraseTimings);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'phrase_1',
        sender: 'john',
        text: 'Hello there',
        timestamp: 0,
        duration: 1000,
        endTime: 1000,
        isCurrent: false,
      });
    });

    it('should handle empty phrase timings', () => {
      const result = phraseTimingsToMessages([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('getCurrentPhraseIndex', () => {
    it('should find current phrase index for small datasets (linear search)', () => {
      const phraseTimings: PhraseTiming[] = [
        {
          id: '1',
          speaker: 'john',
          text: 'test',
          startTime: 0,
          duration: 1000,
          endTime: 1000,
          speakerIndex: 0,
          phraseIndex: 0,
        },
        {
          id: '2',
          speaker: 'jack',
          text: 'test',
          startTime: 1250,
          duration: 1200,
          endTime: 2450,
          speakerIndex: 1,
          phraseIndex: 0,
        },
        {
          id: '3',
          speaker: 'john',
          text: 'test',
          startTime: 2700,
          duration: 1200,
          endTime: 3900,
          speakerIndex: 0,
          phraseIndex: 1,
        },
      ];

      // Test various time points
      expect(getCurrentPhraseIndex(phraseTimings, 500)).toBe(0);
      expect(getCurrentPhraseIndex(phraseTimings, 1500)).toBe(1);
      expect(getCurrentPhraseIndex(phraseTimings, 3000)).toBe(2);
      expect(getCurrentPhraseIndex(phraseTimings, 4000)).toBe(2); // Past all phrases
    });

    it('should use binary search for large datasets', () => {
      const largePhraseTimings: PhraseTiming[] = Array.from(
        { length: 200 },
        (_, i) => ({
          id: `phrase_${i}`,
          speaker: 'john' as const,
          text: `Phrase ${i}`,
          startTime: i * 1000,
          duration: 1000,
          endTime: (i + 1) * 1000,
          speakerIndex: 0,
          phraseIndex: i,
        }),
      );

      // Test binary search performance
      const startTime = Date.now();
      const result = getCurrentPhraseIndex(largePhraseTimings, 150000);
      const endTime = Date.now();

      expect(result).toBe(150);
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });

    it('should handle edge cases', () => {
      const phraseTimings: PhraseTiming[] = [
        {
          id: '1',
          speaker: 'john',
          text: 'test',
          startTime: 0,
          duration: 1000,
          endTime: 1000,
          speakerIndex: 0,
          phraseIndex: 0,
        },
        {
          id: '2',
          speaker: 'jack',
          text: 'test',
          startTime: 1250,
          duration: 1200,
          endTime: 2450,
          speakerIndex: 1,
          phraseIndex: 0,
        },
      ];

      // Before first phrase
      expect(getCurrentPhraseIndex(phraseTimings, -100)).toBe(0);

      // At phrase boundaries
      expect(getCurrentPhraseIndex(phraseTimings, 0)).toBe(0);
      expect(getCurrentPhraseIndex(phraseTimings, 1000)).toBe(0);
      expect(getCurrentPhraseIndex(phraseTimings, 1250)).toBe(1);

      // After last phrase
      expect(getCurrentPhraseIndex(phraseTimings, 3000)).toBe(1);
    });

    it('should handle empty phrase timings', () => {
      expect(getCurrentPhraseIndex([], 1000)).toBe(0);
    });
  });

  describe('getVisibleMessages', () => {
    it('should return messages up to current time', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          sender: 'john',
          text: 'test',
          timestamp: 0,
          duration: 1000,
          endTime: 1000,
          isCurrent: false,
        },
        {
          id: '2',
          sender: 'jack',
          text: 'test',
          timestamp: 1250,
          duration: 1200,
          endTime: 2450,
          isCurrent: false,
        },
        {
          id: '3',
          sender: 'john',
          text: 'test',
          timestamp: 2700,
          duration: 1200,
          endTime: 3900,
          isCurrent: false,
        },
      ];

      const result = getVisibleMessages(messages, 2000);

      expect(result).toHaveLength(2); // First two messages
    });

    it('should handle exact timestamp matches', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          sender: 'john',
          text: 'test',
          timestamp: 0,
          duration: 1000,
          endTime: 1000,
          isCurrent: false,
        },
        {
          id: '2',
          sender: 'jack',
          text: 'test',
          timestamp: 1000,
          duration: 1000,
          endTime: 2000,
          isCurrent: false,
        },
      ];

      const result = getVisibleMessages(messages, 1000);

      expect(result).toHaveLength(2); // Both messages should be visible
    });

    it('should handle empty messages', () => {
      const result = getVisibleMessages([], 1000);

      expect(result).toHaveLength(0);
    });
  });

  describe('updateMessageStates', () => {
    it('should update message current state correctly', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          sender: 'john',
          text: 'test',
          timestamp: 0,
          duration: 1000,
          endTime: 1000,
          isCurrent: false,
        },
        {
          id: '2',
          sender: 'jack',
          text: 'test',
          timestamp: 1250,
          duration: 1200,
          endTime: 2450,
          isCurrent: false,
        },
        {
          id: '3',
          sender: 'john',
          text: 'test',
          timestamp: 2700,
          duration: 1200,
          endTime: 3900,
          isCurrent: false,
        },
      ];

      const result = updateMessageStates(messages, 1500);

      expect(result[0].isCurrent).toBe(false); // Before first message
      expect(result[1].isCurrent).toBe(true); // Within second message
      expect(result[2].isCurrent).toBe(false); // After second message
    });

    it('should handle boundary conditions', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          sender: 'john',
          text: 'test',
          timestamp: 0,
          duration: 1000,
          endTime: 1000,
          isCurrent: false,
        },
        {
          id: '2',
          sender: 'jack',
          text: 'test',
          timestamp: 1000,
          duration: 1000,
          endTime: 2000,
          isCurrent: false,
        },
      ];

      // At start of message
      const result1 = updateMessageStates(messages, 1000);
      expect(result1[1].isCurrent).toBe(true);

      // At end of message
      const result2 = updateMessageStates(messages, 1999);
      expect(result2[1].isCurrent).toBe(true);

      // At exact end
      const result3 = updateMessageStates(messages, 2000);
      expect(result3[1].isCurrent).toBe(false);
    });

    it('should preserve other message properties', () => {
      const messages: ChatMessage[] = [
        {
          id: 'test',
          timestamp: 0,
          endTime: 1000,
          text: 'Hello',
          sender: 'john',
          duration: 1000,
          isCurrent: false,
        },
      ];

      const result = updateMessageStates(messages, 500);

      expect(result[0]).toEqual({
        id: 'test',
        timestamp: 0,
        endTime: 1000,
        text: 'Hello',
        sender: 'john',
        duration: 1000,
        isCurrent: true,
      });
    });
  });

  describe('Performance and caching', () => {
    it('should cache processed data efficiently', () => {
      const startTime = Date.now();

      // First call
      const result1 = processTranscriptionData(largeTranscriptionData);

      // Second call with same data (should use cache)
      const result2 = processTranscriptionData(largeTranscriptionData);

      const endTime = Date.now();

      expect(result1).toBe(result2); // Same reference
      expect(endTime - startTime).toBeLessThan(100); // Should be fast due to caching
    });

    it('should handle large datasets efficiently', () => {
      const veryLargeData = {
        pause: 50,
        speakers: [
          {
            name: 'speaker1',
            phrases: Array.from({ length: 1000 }, (_, i) => ({
              words: `Phrase ${i + 1}`,
              time: 100 + i * 50,
            })),
          },
        ],
      };

      const startTime = Date.now();
      const result = processTranscriptionData(veryLargeData);
      const endTime = Date.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(500); // Should process quickly
    });
  });
});
