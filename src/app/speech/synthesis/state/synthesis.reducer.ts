import { SynthesisState } from './../../../shared/models/synthesis.model';
import { createReducer, on } from '@ngrx/store';
import * as SynthesisActions from './synthesis.actions';

export const initialSynthesisState: SynthesisState = {
  defaults: {
    pitches: [],
    rates: [],
    recommendedVoices: {},
    voices: [],
  },
  selected: {
    pitch: 1.25,
    rate: 1.5,
    voice: undefined,
  },
  speaking: {
    process: {
      isMakingSoundNow: false,
      isPausedWhileUttering: false,
      isRunning: false,
    },
    content: {
      utterance: undefined,
      utteranceOptions: undefined,
    },
  },
};

export const synthesisReducer = createReducer(
  initialSynthesisState,
  on(SynthesisActions.loadDefaults, (state, { defaults }) => ({
    ...state,
    defaults,
  })),
  on(SynthesisActions.loadSynthesisPitches, (state, { pitches }) => ({
    ...state,
    defaults: {
      ...state.defaults,
      pitches,
    },
  })),
  on(SynthesisActions.loadSynthesisRates, (state, { rates }) => ({
    ...state,
    defaults: {
      ...state.defaults,
      rates,
    },
  })),
  on(
    SynthesisActions.loadRecommendedVoices,
    (state, { recommendedVoices }) => ({
      ...state,
      defaults: {
        ...state.defaults,
        recommendedVoices,
      },
    })
  ),
  on(SynthesisActions.loadVoices, (state, { voices }) => ({
    ...state,
    defaults: {
      ...state.defaults,
      voices,
    },
  })),
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
  })),
  on(SynthesisActions.setSpeaking, (state, { speaking }) => ({
    ...state,
    speaking,
  })),
  on(SynthesisActions.setSpeakingProcess, (state, { process }) => ({
    ...state,
    speaking: {
      ...state.speaking,
      process,
    },
  })),
  on(SynthesisActions.setIsRunning, (state, { isRunning }) => ({
    ...state,
    speaking: {
      ...state.speaking,
      process: {
        ...state.speaking.process,
        isRunning,
      },
    },
  })),
  on(
    SynthesisActions.setIsPausedWhileSpeaking,
    (state, { isPausedWhileSpeaking }) => ({
      ...state,
      speaking: {
        ...state.speaking,
        process: {
          ...state.speaking.process,
          isPausedWhileSpeaking,
        },
      },
    })
  ),
  on(SynthesisActions.setIsMakingSoundNow, (state, { isMakingSoundNow }) => ({
    ...state,
    speaking: {
      ...state.speaking,
      process: {
        ...state.speaking.process,
        isMakingSoundNow,
      },
    },
  })),
  on(SynthesisActions.setSpeakingContent, (state, { content }) => ({
    ...state,
    speaking: {
      ...state.speaking,
      content,
    },
  })),
  on(SynthesisActions.setUtterance, (state, { utterance }) => ({
    ...state,
    speaking: {
      ...state.speaking,
      content: {
        ...state.speaking.content,
        utterance,
      },
    },
  })),
  on(SynthesisActions.setUtteranceOptions, (state, { utteranceOptions }) => ({
    ...state,
    speaking: {
      ...state.speaking,
      content: {
        ...state.speaking.content,
        utteranceOptions,
      },
    },
  }))
);
