import { NextEventFn, ProcessMessage } from './shared.models';
import { Subscription } from 'rxjs';
import { SpeechSynthesisUtteranceOptions } from '@ng-web-apis/speech';

export interface SynthesisState {
  // defaults: SynthesisDefaults;
  selected: SynthesisSelected;
  speaking: SynthesisSpeaking;
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

export interface SynthesisSpeaking {
  content: SpeakingContent;
  process: SpeakingProcess;
}

export type SynthAndVoices = {
  synth: SpeechSynthesis | undefined;
  voices: any[];
};

export interface SpeakingProcess {
  /**
   * General information on whether or not synthesis has been requested to utter.
   */
  isRunning: boolean;

  /**
   * Information whether synthesis has been paused during utterance.
   */
  isPausedWhileUttering: boolean;

  /**
   * Detailed information whether an audible word is spoken in a given second.
   * If there is a long pause (silence) in the text, this will be set to false.
   */
  isMakingSoundNow: boolean;
}

export interface SpeakingContent {
  utterance: SpeechSynthesisUtterance | undefined;
  utteranceOptions: SpeechSynthesisUtteranceOptions | undefined;
}

export interface RecommendedVoices {
  [key: string]: boolean;
}

// Event handling

export interface UtteranceEventsSubscriptions {
  type: string;
  subscription: Subscription | undefined;
}

// export type ListenersAttacherFn = (
//   target: SpeechSynthesisUtterance,
//   logAllEvents?: boolean
// ) => void;

export type SynthesisEvent =
  | Event
  | SpeechSynthesisEvent
  | SpeechSynthesisErrorEvent;

// export type SpeechSynthesisEventType = 'voiceschanged';

export enum SpeechSynthesisUtteranceEventTypes {
  start = 'start',
  end = 'end',
  pause = 'pause',
  resume = 'resume',
  boundary = 'boundary',
  mark = 'mark',
  error = 'error',
}

export type SpeechSynthesisUtteranceEventType =
  | 'start'
  | 'end'
  | 'pause'
  | 'resume'
  | 'boundary'
  | 'mark'
  | 'error';

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
  results?: {
    [key: string]: any;
  };
}
