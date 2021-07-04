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
