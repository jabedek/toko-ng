import { DEFAULT_RECOGNITION_LANGUAGES } from './../assets/languages';
import { RecognitionState } from './recognition.model';
2;

export const initialRecognitionState: RecognitionState = {
  recognitionObj: undefined,
  defaults: {
    langs: [],
  },
  selected: {
    lang: undefined,
    interimResults: true,
    maxAlternatives: 5,
    terms: [],
    grammar: '',
    continuous: false,
  },
};

export const RECOG_EVENTS = [
  'audioend',
  'audiostart',
  'error',
  'end',
  'nomatch',
  'result',
  'soundend',
  'soundstart',
  'speechend',
  'speechstart',
  'start',
];
