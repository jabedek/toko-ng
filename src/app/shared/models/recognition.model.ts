import { Subscription } from 'rxjs';
import { ProcessMessage } from './shared.models';
export interface RecognitionState {
  recognitionObj: SpeechRecognition | undefined;
  defaults: RecognitionDefaults;
  selected: RecognitionSelected;
}

export interface RecognitionDefaults {
  langs: RecognitionLanguage[] | [];
}

export interface RecognitionSelected {
  lang: RecognitionLanguage | undefined;
  interimResults: boolean;
  maxAlternatives: number;
  terms: string[];
  grammar: string;
  continuous: boolean;
}

export interface RecognitionLanguage {
  langCode: string;
  name?: string;
}

export interface RecognitionProcessMessage extends ProcessMessage {
  topResult?: {
    transcript?: string;
    confidence?: string;
    isFinal?: boolean;
  };
}

// Event handling
export type RecognitionEvent =
  | Event
  | SpeechRecognitionEvent
  | SpeechRecognitionErrorEvent;

export enum SpeechRecognitionEventTypes {
  start = 'start',
  end = 'end',
  audioend = 'audioend',
  audiostart = 'audiostart',
  soundend = 'soundend',
  soundstart = 'soundstart',
  speechend = 'speechend',
  speechstart = 'speechstart',
  error = 'error',
  nomatch = 'nomatch',
  result = 'result',
}

export type SpeechRecognitionEventType =
  | 'start'
  | 'end'
  | 'audioend'
  | 'audiostart'
  | 'soundend'
  | 'soundstart'
  | 'speechend'
  | 'speechstart'
  | 'error'
  | 'nomatch'
  | 'result';

// from lib
export interface SpeechRecognitionEventMap {
  audioend: Event;
  audiostart: Event;
  end: Event;
  error: SpeechRecognitionErrorEvent;
  nomatch: SpeechRecognitionEvent;
  result: SpeechRecognitionEvent;
  soundend: Event;
  soundstart: Event;
  speechend: Event;
  speechstart: Event;
  start: Event;
}
