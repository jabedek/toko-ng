import { DefaultPitch } from './../models/synthesis.constants';
import { SpeechSynthesisUtteranceOptions } from '@ng-web-apis/speech';
import {
  RecommendedVoices,
  SpeakingProcess,
  SpeakingContent,
  SynthesisDefaults,
  SynthesisSpeaking,
  SynthesisSelected,
} from '../models/synthesis.model';
import { createAction, props } from '@ngrx/store';
import { DefaultRate } from '../models/synthesis.constants';

// ### State.defaults
export const loadDefaults = createAction(
  '[App/Speech Synthesis] Load Synthesis Rates',
  props<{ defaults: SynthesisDefaults }>()
);
export const loadSynthesisPitches = createAction(
  '[App/Speech Synthesis] Load Synthesis Pitches',
  props<{ pitches: DefaultPitch[] }>()
);
export const loadSynthesisRates = createAction(
  '[App/Speech Synthesis] Load Synthesis Rates',
  props<{ rates: DefaultRate[] }>()
);
export const loadRecommendedVoices = createAction(
  '[App/Speech Synthesis] Load Recommended Voices',
  props<{ recommendedVoices: RecommendedVoices }>()
);
export const loadVoices = createAction(
  '[App/Speech Synthesis] Load Voices',
  props<{ voices: SpeechSynthesisVoice[] }>()
);

// ### State.selected
export const setSelected = createAction(
  '[App/Speech Synthesis] Set Selected',
  props<{ selected: SynthesisSelected }>()
);
export const setSelectedPitch = createAction(
  '[App/Speech Synthesis] Set Selected Pitch',
  props<{ pitch: number }>()
);
export const setSelectedRate = createAction(
  '[App/Speech Synthesis] Set Selected Rate',
  props<{ rate: number }>()
);
export const setSelectedVoice = createAction(
  '[App/Speech Synthesis] Set Selected Voice',
  props<{ voice: SpeechSynthesisVoice }>()
);

// ### State.speaking
export const setSpeaking = createAction(
  '[App/Speech Synthesis] Set Speaking',
  props<{ speaking: SynthesisSpeaking }>()
);

// ### State.speaking.process
export const setSpeakingProcess = createAction(
  '[App/Speech Synthesis] Set Speaking Process',
  props<{ process: SpeakingProcess }>()
);
export const setIsRunning = createAction(
  '[App/Speech Synthesis] Set Is-Running',
  props<{ isRunning: boolean }>()
);
export const setIsPausedWhileSpeaking = createAction(
  '[App/Speech Synthesis] Set Is-Paused-While-Speaking',
  props<{ isPausedWhileSpeaking: boolean }>()
);
export const setIsMakingSoundNow = createAction(
  '[App/Speech Synthesis] Set Is-Making-Sound-Now',
  props<{ isMakingSoundNow: boolean }>()
);

// ### State.speaking.content
export const setSpeakingContent = createAction(
  '[App/Speech Synthesis] Set Speaking Content',
  props<{ content: SpeakingContent }>()
);
export const setUtterance = createAction(
  '[App/Speech Synthesis] Set Utterance',
  props<{ utterance: SpeechSynthesisUtterance }>()
);
export const setUtteranceOptions = createAction(
  '[App/Speech Synthesis] Set Options',
  props<{ utteranceOptions: SpeechSynthesisUtteranceOptions }>()
);
