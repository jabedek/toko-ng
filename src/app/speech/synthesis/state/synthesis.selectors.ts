import { SynthesisState } from './../../../shared/models/synthesis.model';
import { AppState } from '../../../app-state/app-state.model';
import { createSelector, createFeatureSelector } from '@ngrx/store';

export const synthesisFeatureKey = 'synthesis';

export const selectSynthesis = createFeatureSelector<AppState, SynthesisState>(
  synthesisFeatureKey
);

export const selectSynthesisDefaults = createSelector(
  selectSynthesis,
  (state) => state.defaults
);

export const selectDefaultVoices = createSelector(
  selectSynthesis,
  (state) => state.defaults.voices
);

export const selectDefaultRecommendedVoices = createSelector(
  selectSynthesis,
  (state) => state.defaults.recommendedVoices
);

export const selectDefaultRates = createSelector(
  selectSynthesis,
  (state) => state.defaults.rates
);

export const selectSynthesisSelected = createSelector(
  selectSynthesis,
  (state) => state.selected
);

export const selectSynthesisSpeaking = createSelector(
  selectSynthesis,
  (state) => state.speaking
);
