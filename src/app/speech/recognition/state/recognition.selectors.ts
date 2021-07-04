import { RecognitionState } from './../models/recognition.model';
import { AppState } from '../../../app-state/app-state.model';
import { createSelector, createFeatureSelector } from '@ngrx/store';

export const recognitionFeatureKey = 'recognition';

export const selectRecognition = createFeatureSelector<
  AppState,
  RecognitionState
>(recognitionFeatureKey);

// State.recognitionObj
export const selectRecognitionObj = createSelector(
  selectRecognition,
  (state) => state.recognitionObj
);

// State.defaults
export const selectRecognitionDefaults = createSelector(
  selectRecognition,
  (state) => state.defaults
);
export const selectRecognitionLangs = createSelector(
  selectRecognitionDefaults,
  (state) => state.langs
);

// State.selected
export const selectRecognitionSelected = createSelector(
  selectRecognition,
  (state) => state.selected
);

export const selectSelectedLang = createSelector(
  selectRecognitionSelected,
  (state) => state.lang
);

export const selectSelectedInterimResults = createSelector(
  selectRecognitionSelected,
  (state) => state.interimResults
);

export const selectSelectedTerms = createSelector(
  selectRecognitionSelected,
  (state) => state.terms
);

export const selectSelectedGrammar = createSelector(
  selectRecognitionSelected,
  (state) => state.grammar
);

export const selectSelectedContinuous = createSelector(
  selectRecognitionSelected,
  (state) => state.continuous
);
