import type { Viseme } from './config.js';
export interface SpeechOptions {
    /** 1 is a normal talking pace; 2 is twice as fast. */
    speed?: number;
}
/** The sounds of one word, by spelling. */
export declare function wordSounds(word: string): string[];
/**
 * Turns text into a list of mouth shapes with durations, for speakVisemes(). visemes is the table of shapes
 * (talk.visemes); a sound it has no shape for is left out.
 */
export declare function textToVisemes(text: string, visemes: Record<string, Viseme>, options?: SpeechOptions): Array<{
    viseme: Viseme | string;
    ms: number;
}>;
