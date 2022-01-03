import { SynthesisState } from './../../../shared/models/synthesis.model';
import { createReducer, on } from '@ngrx/store';
import * as SynthesisActions from './synthesis.actions';

export const initialSynthesisState: SynthesisState = {
  // defaults: {
  //   pitches: [],
  //   rates: [],
  //   // recommendedVoices: {},
  //   voices: [],
  // },
  selected: {
    pitch: 1.25,
    rate: 1.5,
    voice: undefined,
    volume: 1,
  },
};

export const synthesisReducer = createReducer(
  initialSynthesisState,

  on(SynthesisActions.setSelected, (state, { selected }) => ({
    ...state,
    selected,
  })),
  on(SynthesisActions.setSelectedPitch, (state, { pitch }) => ({
    ...state,
    selected: { ...state.selected, pitch },
  })),
  on(SynthesisActions.setSelectedRate, (state, { rate }) => ({
    ...state,
    selected: { ...state.selected, rate },
  })),
  on(SynthesisActions.setSelectedVoice, (state, { voice }) => ({
    ...state,
    selected: { ...state.selected, voice },
  }))
);
