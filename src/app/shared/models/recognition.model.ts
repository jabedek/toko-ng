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

export interface RecognitionResultSnapshot {
  transcript: string;
  confidence: string;
  isFinal: boolean;
  date: string | number;
}

export interface RecognitionProcessMessage extends ProcessMessage {
  id: string;
  elapsedTime: string | number;
  result?: RecognitionResultSnapshot;
}

export interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI: string;

  start(): void;
  stop(): void;
  abort(): void;

  onaudiostart: (ev: Event) => any;
  onsoundstart: (ev: Event) => any;
  onspeechstart: (ev: Event) => any;
  onspeechend: (ev: Event) => any;
  onsoundend: (ev: Event) => any;
  onaudioend: (ev: Event) => any;
  onresult: (ev: SpeechRecognitionEvent) => any;
  onnomatch: (ev: SpeechRecognitionEvent) => any;
  onerror: (ev: SpeechRecognitionErrorEvent) => any;
  onstart: (ev: Event) => any;
  onend: (ev: Event) => any;
}
declare var SpeechRecognition: SpeechRecognitionStatic;
declare var webkitSpeechRecognition: SpeechRecognitionStatic;

export interface SpeechGrammarList {
  length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight: number): void;

  /**
   *
   * @param string A DOMString representing the grammar to be added.
   * @param weight A float representing the weight of the grammar relative to other grammars present in the SpeechGrammarList. The weight means the importance of this grammar, or the likelihood that it will be recognized by the speech recognition service. The value can be between 0.0 and 1.0; If not specified, the default used is 1.0.
   */
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

export interface SpeechGrammarListStatic {
  prototype: SpeechGrammarList;
  new (): SpeechGrammarList;
}
export interface SpeechRecognitionStatic {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: Readonly<string>;
  message: Readonly<string>;
}

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
  interpretation: any;
  emma: Document;
}
// Event handling
export type RecognitionEvent = Event | SpeechRecognitionEvent | SpeechRecognitionErrorEvent;

export enum SpeechRecognitionEventType {
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
  STOPPED = 'STOPPED',
}

// export type SpeechRecognitionEventType =
//   | 'start'
//   | 'end'
//   | 'audioend'
//   | 'audiostart'
//   | 'soundend'
//   | 'soundstart'
//   | 'speechend'
//   | 'speechstart'
//   | 'error'
//   | 'nomatch'
//   | 'result';

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
