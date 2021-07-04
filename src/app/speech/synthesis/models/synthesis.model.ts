import { Subscription } from 'rxjs';
import { DefaultRate, DefaultPitch } from './synthesis.constants';
import { SpeechSynthesisUtteranceOptions } from '@ng-web-apis/speech';

export interface SynthesisState {
  defaults: SynthesisDefaults;
  selected: SynthesisSelected;
  speaking: SynthesisSpeaking;
}

export interface SynthesisDefaults {
  pitches: DefaultPitch[];
  rates: DefaultRate[];
  recommendedVoices: RecommendedVoices;
  voices: SpeechSynthesisVoice[] | [];
}

export interface SynthesisSelected {
  pitch: number;
  rate: number | null | undefined;
  voice: SpeechSynthesisVoice | null | undefined;
}

export interface SynthesisSpeaking {
  content: SpeakingContent;
  process: SpeakingProcess;
}

export interface SpeakingProcess {
  /**
   * General information on whether or not synthesis has been requested to utter.
   */
  isRunning: boolean;

  /**
   * Information whether synthesis has been paused during utterance.
   */
  isPausedWhileUttering: boolean;

  /**
   * Detailed information whether an audible word is spoken in a given second.
   * If there is a long pause (silence) in the text, this will be set to false.
   */
  isMakingSoundNow: boolean;
}

export interface SpeakingContent {
  utterance: SpeechSynthesisUtterance | null | undefined;
  utteranceOptions: SpeechSynthesisUtteranceOptions | null | undefined;
}

export interface RecommendedVoices {
  [key: string]: boolean;
}

// Utterance Events

export interface UtteranceEventsSubscriptions {
  type: string;
  subscription: Subscription | undefined;
}

export type ListenersAttacherFn = (
  utterance: SpeechSynthesisUtterance,
  logAllEvents?: boolean
) => void;

// 3rd parties

/** This Web Speech API interface contains information about the current state of SpeechSynthesisUtterance objects that have been processed in the speech service. */
export interface SpeechSynthesisEvent extends Event {
  readonly charIndex: number;
  readonly charLength: number;
  readonly elapsedTime: number;
  readonly name: string;
  readonly utterance: SpeechSynthesisUtterance;
}

declare var SpeechSynthesisEvent: {
  prototype: SpeechSynthesisEvent;
  new (
    type: string,
    eventInitDict: SpeechSynthesisEventInit
  ): SpeechSynthesisEvent;
};

// 3rd parties //
