import { initialRecognitionState } from './../models/recognition.constants';

import { createReducer, on } from '@ngrx/store';
import * as SynthesisActions from './recognition.actions';

export const recognitionReducer = createReducer(
  initialRecognitionState,
  on(SynthesisActions.loadRecognition, (state, { recognition }) => ({
    ...state,
    recognition,
  })),
  on(SynthesisActions.loadLangs, (state, { langs }) => ({
    ...state,
    defaults: {
      ...state.defaults,
      langs,
    },
  })),
  on(SynthesisActions.setSelected, (state, { selected }) => ({
    ...state,
    selected,
  })),
  on(SynthesisActions.setSelectedLang, (state, { lang }) => ({
    ...state,
    selected: {
      ...state.selected,
      lang,
    },
  })),
  on(
    SynthesisActions.setSelectedInterimResults,
    (state, { interimResults }) => ({
      ...state,
      selected: {
        ...state.selected,
        interimResults,
      },
    })
  ),
  on(
    SynthesisActions.setSelectedMaxAlternatives,
    (state, { maxAlternatives }) => ({
      ...state,
      selected: {
        ...state.selected,
        maxAlternatives,
      },
    })
  ),
  on(SynthesisActions.setSelectedTerms, (state, { terms }) => ({
    ...state,
    selected: {
      ...state.selected,
      terms,
    },
  })),
  on(SynthesisActions.setSelectedGrammar, (state, { grammar }) => ({
    ...state,
    selected: {
      ...state.selected,
      grammar,
    },
  })),
  on(SynthesisActions.setSelectedContinuous, (state, { continuous }) => ({
    ...state,
    selected: {
      ...state.selected,
      continuous,
    },
  }))
);
