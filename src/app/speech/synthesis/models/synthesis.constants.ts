import { SynthesisState } from './synthesis.model';
export const DEFAULT_SYNTHESIS_RATES: DefaultRate[] = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2,
];

export const DEFAULT_SYNTHESIS_PITCHES: DefaultPitch[] = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2,
];

export type DefaultRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
export type DefaultPitch = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export const initialSynthesisState: SynthesisState = {
  defaults: {
    pitches: [],
    rates: [],
    recommendedVoices: {},
    voices: [],
  },
  selected: {
    pitch: 1.25,
    rate: 1.5,
    voice: undefined,
  },
  speaking: {
    process: {
      isMakingSoundNow: false,
      isPausedWhileUttering: false,
      isRunning: false,
    },
    content: {
      utterance: undefined,
      utteranceOptions: undefined,
    },
  },
};

export const UTTERANCE_EVENTS = [
  'boundary',
  'end',
  'error',
  'mark',
  'pause',
  'resume',
  'start',
];
