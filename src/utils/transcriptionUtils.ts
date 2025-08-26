import { TranscriptionData, PhraseTiming, ChatMessage } from '../types/chat';

// Processes transcription data to create proper phrase timings
export const processTranscriptionData = (
  data: TranscriptionData,
): PhraseTiming[] => {
  const phraseTimings: PhraseTiming[] = [];
  let currentTime = 0;
  let phraseId = 1;

  const maxPhrases = Math.max(
    ...data.speakers.map(speaker => speaker.phrases.length),
  );

  // Process phrases in interleaved order
  for (let phraseIndex = 0; phraseIndex < maxPhrases; phraseIndex++) {
    data.speakers.forEach((speaker, speakerIndex) => {
      if (phraseIndex < speaker.phrases.length) {
        const phrase = speaker.phrases[phraseIndex];
        const speakerName = speaker.name.toLowerCase() as 'john' | 'jack';

        phraseTimings.push({
          id: `phrase_${phraseId++}`,
          speaker: speakerName,
          text: phrase.words,
          startTime: currentTime,
          duration: phrase.time,
          endTime: currentTime + phrase.time,
          speakerIndex,
          phraseIndex,
        });

        currentTime += phrase.time + data.pause;
      }
    });
  }

  return phraseTimings;
};

// Converts phrase timings to chat messages
export const phraseTimingsToMessages = (
  phraseTimings: PhraseTiming[],
): ChatMessage[] => {
  return phraseTimings.map(phrase => ({
    id: phrase.id,
    sender: phrase.speaker,
    text: phrase.text,
    timestamp: phrase.startTime,
    duration: phrase.duration,
    endTime: phrase.endTime,
    isCurrent: false,
  }));
};

// Gets the current phrase index based on current time
export const getCurrentPhraseIndex = (
  phraseTimings: PhraseTiming[],
  currentTime: number,
): number => {
  for (let i = 0; i < phraseTimings.length; i++) {
    if (
      currentTime >= phraseTimings[i].startTime &&
      currentTime < phraseTimings[i].endTime
    ) {
      return i;
    }
  }

  // If past all phrases, return the last one
  if (
    phraseTimings.length > 0 &&
    currentTime >= phraseTimings[phraseTimings.length - 1].endTime
  ) {
    return phraseTimings.length - 1;
  }

  return 0;
};

// Gets visible messages up to the current time
export const getVisibleMessages = (
  messages: ChatMessage[],
  currentTime: number,
): ChatMessage[] => {
  return messages.filter(message => message.timestamp <= currentTime);
};

// Updates message states to highlight current phrase
export const updateMessageStates = (
  messages: ChatMessage[],
  currentTime: number,
): ChatMessage[] => {
  return messages.map(message => ({
    ...message,
    isCurrent:
      currentTime >= message.timestamp && currentTime < message.endTime,
  }));
};
