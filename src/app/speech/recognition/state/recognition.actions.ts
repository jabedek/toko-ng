import {
  RecognitionLanguage,
  RecognitionSelected,
} from './../../../shared/models/recognition.model';
import { createAction, props } from '@ngrx/store';

// ### State.recognition
export const loadRecognition = createAction(
  '[App/Speech Recog] Load Recognition Object',
  props<{ recognition: SpeechRecognition }>()
);

// ### State.defaults
export const loadLangs = createAction(
  '[App/Speech Recog] Load Langs',
  props<{ langs: RecognitionLanguage[] }>()
);

// ### State.selected
export const setSelected = createAction(
  '[App/Speech Recog] Set Selected',
  props<{ selected: RecognitionSelected }>()
);

export const setSelectedLang = createAction(
  '[App/Speech Recog] Set Selected Lang',
  props<{ lang: RecognitionLanguage }>()
);

export const setSelectedInterimResults = createAction(
  '[App/Speech Recog] Set Selected Interim Results',
  props<{ interimResults: boolean }>()
);

export const setSelectedMaxAlternatives = createAction(
  '[App/Speech Recog] Set Selected Max Alternatives',
  props<{ maxAlternatives: number }>()
);

export const setSelectedTerms = createAction(
  '[App/Speech Recog] Set Selected Terms',
  props<{ terms: string[] }>()
);

export const setSelectedGrammar = createAction(
  '[App/Speech Recog] Set Selected Grammer',
  props<{ grammar: string }>()
);

export const setSelectedContinuous = createAction(
  '[App/Speech Recog] Set Selected Grammer',
  props<{ continuous: boolean }>()
);
