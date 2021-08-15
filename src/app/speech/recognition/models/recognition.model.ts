import { Subscription } from 'rxjs';
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

export interface RecogEventsSubscriptions {
  type: string;
  subscription: Subscription | undefined;
}

export type ListenersAttacherFn = (
  target: SpeechRecognition,
  logAllEvents?: boolean
) => void;

export interface SpecificHandlers {
  [eventType: string]: (event: any) => any | void;
}

export type RecognitionEvent =
  | Event
  | SpeechRecognitionEvent
  | SpeechRecognitionErrorEvent;

export enum SpeechRecognitionEventTypes {
  audioend = 'audioend',
  audiostart = 'audiostart',
  end = 'end',
  soundend = 'soundend',
  soundstart = 'soundstart',
  speechend = 'speechend',
  speechstart = 'speechstart',
  start = 'start',
  error = 'error',
  nomatch = 'nomatch',
  result = 'result',
}

export type SpeechRecognitionEventType =
  | 'audioend'
  | 'audiostart'
  | 'end'
  | 'soundend'
  | 'soundstart'
  | 'speechend'
  | 'speechstart'
  | 'start'
  | 'error'
  | 'nomatch'
  | 'result';

interface SpeechRecognitionEventMap {
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

export interface ProcessMessage {
  date: string | Date;
  eventType: string;
  topResult?: {
    transcript?: string;
    confidence?: string;
  };
  error?: string;
}
