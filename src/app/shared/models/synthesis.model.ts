import { NextEventFn, ProcessMessage } from './shared.models';
import { Subscription } from 'rxjs';
import { SpeechSynthesisUtteranceOptions } from '@ng-web-apis/speech';

export interface SynthesisState {
  // defaults: SynthesisDefaults;
  selected: SynthesisSelected;
}

export interface SynthesisDefaults {
  pitches: DefaultPitch[];
  rates: DefaultRate[];
  voices: SpeechSynthesisVoice[] | [];
}

export interface SynthesisSelected {
  pitch: number | undefined;
  rate: number | undefined;
  voice: SpeechSynthesisVoice | undefined;
  volume: number | undefined;
}

export type DefaultRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
export type DefaultPitch = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export type SynthAndVoices = {
  synth: SpeechSynthesis | undefined;
  voices: any[];
};

export interface RecommendedVoices {
  [key: string]: boolean;
}

export interface UtteranceEventsSubscriptions {
  type: string;
  subscription: Subscription | undefined;
}

export type SynthesisEvent =
  | Event
  | SpeechSynthesisEvent
  | SpeechSynthesisErrorEvent;

export enum SpeechSynthesisUtteranceEventType {
  start = 'start',
  end = 'end',
  pause = 'pause',
  resume = 'resume',
  boundary = 'boundary',
  mark = 'mark',
  error = 'error',
}

export type UtteranceListenerDetacher = (
  target: SpeechSynthesisUtterance
) => SpeechSynthesisUtterance;

export type UtteranceListenerAttacher = (
  target: SpeechSynthesisUtterance,
  detachListenersFn: UtteranceListenerDetacher,
  nextEventFn: NextEventFn
) => SpeechSynthesisUtterance;

export interface SynthesisProcessMessage extends ProcessMessage {
  name?: string;
  elapsedTime: number | string;
  results?: {
    [key: string]: any;
  };
}
