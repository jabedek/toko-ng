import {
  DefaultPitch,
  SynthesisDefaults,
  // RecommendedVoices,
  SynthesisSelected,
  SynthesisSpeaking,
  SpeakingProcess,
  SpeakingContent,
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

// ### State.speaking
export const setSpeaking = createAction(
  '[App/Speech Synth] Set Speaking',
  props<{ speaking: SynthesisSpeaking }>()
);

// ### State.speaking.process
export const setSpeakingProcess = createAction(
  '[App/Speech Synth] Set Speaking Process',
  props<{ process: SpeakingProcess }>()
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

// ### State.speaking.content
export const setSpeakingContent = createAction(
  '[App/Speech Synth] Set Speaking Content',
  props<{ content: SpeakingContent }>()
);
export const setUtterance = createAction(
  '[App/Speech Synth] Set Utterance',
  props<{ utterance: SpeechSynthesisUtterance }>()
);
export const setUtteranceOptions = createAction(
  '[App/Speech Synth] Set Options',
  props<{ utteranceOptions: SpeechSynthesisUtteranceOptions }>()
);
