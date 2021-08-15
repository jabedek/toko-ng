import {
  DefaultPitch,
  DefaultRate,
} from 'src/app/shared/models/synthesis.model';

export const DEFAULT_SYNTHESIS_RATES: DefaultRate[] = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2,
];

export const DEFAULT_SYNTHESIS_PITCHES: DefaultPitch[] = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2,
];

export const UTTERANCE_ONLY_EVENTS = [
  'boundary',
  'end',
  'error',
  'mark',
  'pause',
  'resume',
  'start',
];
