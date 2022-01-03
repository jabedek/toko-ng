import {
  DefaultPitch,
  SynthesisDefaults,
  // RecommendedVoices,
  SynthesisSelected,
  DefaultRate,
} from './../../../shared/models/synthesis.model';
import { SpeechSynthesisUtteranceOptions } from '@ng-web-apis/speech';

import { createAction, props } from '@ngrx/store';

// ### State.defaults
// export const loadDefaults = createAction(
//   '[App/Speech Synth] Load Synthesis Rates',
//   props<{ defaults: SynthesisDefaults }>()
// );
// export const loadSynthesisPitches = createAction(
//   '[App/Speech Synth] Load Synthesis Pitches',
//   props<{ pitches: DefaultPitch[] }>()
// );
// export const loadSynthesisRates = createAction(
//   '[App/Speech Synth] Load Synthesis Rates',
//   props<{ rates: DefaultRate[] }>()
// );
// export const loadRecommendedVoices = createAction(
//   '[App/Speech Synth] Load Recommended Voices',
//   props<{ recommendedVoices: RecommendedVoices }>()
// );
// export const loadVoices = createAction(
//   '[App/Speech Synth] Load Voices',
//   props<{ voices: SpeechSynthesisVoice[] }>()
// );

// ### State.selected
export const setSelected = createAction(
  '[App/Speech Synth] Set Selected',
  props<{ selected: SynthesisSelected }>()
);
export const setSelectedPitch = createAction(
  '[App/Speech Synth] Set Selected Pitch',
  props<{ pitch: number }>()
);
export const setSelectedRate = createAction(
  '[App/Speech Synth] Set Selected Rate',
  props<{ rate: number }>()
);
export const setSelectedVoice = createAction(
  '[App/Speech Synth] Set Selected Voice',
  props<{ voice: SpeechSynthesisVoice }>()
);

export const setIsRunning = createAction(
  '[App/Speech Synth] Set Is-Running',
  props<{ isRunning: boolean }>()
);
export const setIsPausedWhileSpeaking = createAction(
  '[App/Speech Synth] Set Is-Paused-While-Speaking',
  props<{ isPausedWhileSpeaking: boolean }>()
);
export const setIsMakingSoundNow = createAction(
  '[App/Speech Synth] Set Is-Making-Sound-Now',
  props<{ isMakingSoundNow: boolean }>()
);

export const setUtterance = createAction(
  '[App/Speech Synth] Set Utterance',
  props<{ utterance: SpeechSynthesisUtterance }>()
);
export const setUtteranceOptions = createAction(
  '[App/Speech Synth] Set Options',
  props<{ utteranceOptions: SpeechSynthesisUtteranceOptions }>()
);
