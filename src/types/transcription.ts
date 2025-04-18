export type TranscriptionResult = {
  text: string;
  audioDuration: number;
  language: string;
  wordTimestamps?: {
    word: string;
    start: number;
    end: number;
  }[];
};
