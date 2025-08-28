import { TranscriptionData, PhraseTiming, ChatMessage } from '../types/chat';

// Cache for processed transcription data
const transcriptionCache = new Map<string, PhraseTiming[]>();

// Processes transcription data to create proper phrase timings
export const processTranscriptionData = (
  data: TranscriptionData,
): PhraseTiming[] => {
  // Create a cache key based on data content
  const cacheKey = JSON.stringify(data);

  if (transcriptionCache.has(cacheKey)) {
    return transcriptionCache.get(cacheKey)!;
  }

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

  // Cache the result
  transcriptionCache.set(cacheKey, phraseTimings);
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

// Binary search for better performance on large datasets
const binarySearchPhraseIndex = (
  phraseTimings: PhraseTiming[],
  currentTime: number,
): number => {
  let left = 0;
  let right = phraseTimings.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const phrase = phraseTimings[mid];

    if (currentTime >= phrase.startTime && currentTime < phrase.endTime) {
      return mid;
    }

    if (currentTime < phrase.startTime) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return 0;
};

// Gets the current phrase index based on current time
export const getCurrentPhraseIndex = (
  phraseTimings: PhraseTiming[],
  currentTime: number,
): number => {
  if (phraseTimings.length === 0) return 0;

  // Use binary search for better performance on large datasets
  if (phraseTimings.length > 100) {
    return binarySearchPhraseIndex(phraseTimings, currentTime);
  }

  // Linear search for smaller datasets
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
