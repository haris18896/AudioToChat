import {
  processTranscriptionData,
  phraseTimingsToMessages,
  getCurrentPhraseIndex,
  getVisibleMessages,
  updateMessageStates,
} from '../transcriptionUtils';
import { TranscriptionData, PhraseTiming, ChatMessage } from '../../types/chat';

describe('transcriptionUtils', () => {
  const mockTranscriptionData: TranscriptionData = {
    pause: 250,
    speakers: [
      {
        name: 'John',
        phrases: [
          { words: 'Hello there', time: 1000 },
          { words: 'How are you?', time: 1500 },
        ],
      },
      {
        name: 'Jack',
        phrases: [
          { words: 'Hi John', time: 800 },
          { words: 'I am fine, thanks', time: 2000 },
        ],
      },
    ],
  };

  describe('processTranscriptionData', () => {
    it('should process transcription data into phrase timings', () => {
      const result = processTranscriptionData(mockTranscriptionData);

      expect(result).toHaveLength(4);
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
        text: 'Hi John',
        startTime: 1250,
        duration: 800,
        endTime: 2050,
        speakerIndex: 1,
        phraseIndex: 0,
      });
    });

    it('should handle interleaved phrases correctly', () => {
      const result = processTranscriptionData(mockTranscriptionData);

      // Check the timing progression
      expect(result[0].startTime).toBe(0);
      expect(result[1].startTime).toBe(1250); // 1000 + 250 pause
      expect(result[2].startTime).toBe(2300); // 2050 + 250 pause
      expect(result[3].startTime).toBe(4050); // 3800 + 250 pause
    });

    it('should handle empty transcription data', () => {
      const emptyData: TranscriptionData = {
        pause: 100,
        speakers: [],
      };

      const result = processTranscriptionData(emptyData);
      expect(result).toHaveLength(0);
    });

    it('should handle speakers with different phrase counts', () => {
      const unevenData: TranscriptionData = {
        pause: 100,
        speakers: [
          {
            name: 'John',
            phrases: [{ words: 'Only one phrase', time: 1000 }],
          },
          {
            name: 'Jack',
            phrases: [
              { words: 'First phrase', time: 800 },
              { words: 'Second phrase', time: 900 },
            ],
          },
        ],
      };

      const result = processTranscriptionData(unevenData);
      expect(result).toHaveLength(3);
    });
  });

  describe('phraseTimingsToMessages', () => {
    it('should convert phrase timings to chat messages', () => {
      const phraseTimings: PhraseTiming[] = [
        {
          id: 'phrase_1',
          speaker: 'john',
          text: 'Hello',
          startTime: 0,
          duration: 1000,
          endTime: 1000,
          speakerIndex: 0,
          phraseIndex: 0,
        },
      ];

      const result = phraseTimingsToMessages(phraseTimings);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'phrase_1',
        sender: 'john',
        text: 'Hello',
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
    const phraseTimings: PhraseTiming[] = [
      {
        id: 'phrase_1',
        speaker: 'john',
        text: 'First',
        startTime: 0,
        duration: 1000,
        endTime: 1000,
        speakerIndex: 0,
        phraseIndex: 0,
      },
      {
        id: 'phrase_2',
        speaker: 'jack',
        text: 'Second',
        startTime: 1250,
        duration: 800,
        endTime: 2050,
        speakerIndex: 1,
        phraseIndex: 0,
      },
    ];

    it('should return correct phrase index for given time', () => {
      expect(getCurrentPhraseIndex(phraseTimings, 500)).toBe(0);
      expect(getCurrentPhraseIndex(phraseTimings, 1500)).toBe(1);
    });

    it('should return 0 for time before first phrase', () => {
      expect(getCurrentPhraseIndex(phraseTimings, -100)).toBe(0);
    });

    it('should return last index for time after all phrases', () => {
      expect(getCurrentPhraseIndex(phraseTimings, 3000)).toBe(1);
    });

    it('should handle empty phrase timings', () => {
      expect(getCurrentPhraseIndex([], 1000)).toBe(0);
    });

    it('should handle boundary conditions', () => {
      expect(getCurrentPhraseIndex(phraseTimings, 0)).toBe(0);
      expect(getCurrentPhraseIndex(phraseTimings, 1000)).toBe(0);
      expect(getCurrentPhraseIndex(phraseTimings, 1250)).toBe(1);
      expect(getCurrentPhraseIndex(phraseTimings, 2050)).toBe(1);
    });
  });

  describe('getVisibleMessages', () => {
    const messages: ChatMessage[] = [
      {
        id: 'msg1',
        sender: 'john',
        text: 'First message',
        timestamp: 0,
        duration: 1000,
        endTime: 1000,
        isCurrent: false,
      },
      {
        id: 'msg2',
        sender: 'jack',
        text: 'Second message',
        timestamp: 1250,
        duration: 800,
        endTime: 2050,
        isCurrent: false,
      },
      {
        id: 'msg3',
        sender: 'john',
        text: 'Third message',
        timestamp: 2300,
        duration: 1500,
        endTime: 3800,
        isCurrent: false,
      },
    ];

    it('should return messages up to current time', () => {
      expect(getVisibleMessages(messages, 500)).toHaveLength(1);
      expect(getVisibleMessages(messages, 1500)).toHaveLength(2);
      expect(getVisibleMessages(messages, 3000)).toHaveLength(3);
    });

    it('should return empty array for time before first message', () => {
      expect(getVisibleMessages(messages, -100)).toHaveLength(0);
    });

    it('should return all messages for time after last message', () => {
      expect(getVisibleMessages(messages, 5000)).toHaveLength(3);
    });

    it('should handle boundary conditions', () => {
      expect(getVisibleMessages(messages, 0)).toHaveLength(1);
      expect(getVisibleMessages(messages, 1250)).toHaveLength(2);
      expect(getVisibleMessages(messages, 2300)).toHaveLength(3);
    });
  });

  describe('updateMessageStates', () => {
    const messages: ChatMessage[] = [
      {
        id: 'msg1',
        sender: 'john',
        text: 'First message',
        timestamp: 0,
        duration: 1000,
        endTime: 1000,
        isCurrent: false,
      },
      {
        id: 'msg2',
        sender: 'jack',
        text: 'Second message',
        timestamp: 1250,
        duration: 800,
        endTime: 2050,
        isCurrent: false,
      },
    ];

    it('should mark current message based on time', () => {
      const result = updateMessageStates(messages, 500);

      expect(result[0].isCurrent).toBe(true);
      expect(result[1].isCurrent).toBe(false);
    });

    it('should handle time between messages', () => {
      const result = updateMessageStates(messages, 1100);

      expect(result[0].isCurrent).toBe(false);
      expect(result[1].isCurrent).toBe(false);
    });

    it('should handle time during second message', () => {
      const result = updateMessageStates(messages, 1500);

      expect(result[0].isCurrent).toBe(false);
      expect(result[1].isCurrent).toBe(true);
    });

    it('should handle boundary conditions', () => {
      const resultAtStart = updateMessageStates(messages, 0);
      expect(resultAtStart[0].isCurrent).toBe(true);

      const resultAtEnd = updateMessageStates(messages, 1000);
      expect(resultAtEnd[0].isCurrent).toBe(false);

      const resultAtSecondStart = updateMessageStates(messages, 1250);
      expect(resultAtSecondStart[1].isCurrent).toBe(true);
    });
  });
});
