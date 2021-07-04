import {
  selectSynthesisSelected,
  selectSynthesisDefaults,
  selectSynthesisSpeaking,
  selectDefaultRates,
  selectDefaultRecommendedVoices,
  selectDefaultVoices,
} from './synthesis/state/synthesis.selectors';
import { Observable, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app-state/app-state.model';
import { recommendedVoicesEN } from './synthesis/configs/en/recommended-voices-en';
import {
  DefaultRate,
  DEFAULT_SYNTHESIS_RATES,
  utteranceEvents,
} from './synthesis/models/synthesis.constants';
import {
  UtteranceEventsSubscriptions,
  ListenersAttacherFn,
  RecommendedVoices,
  SynthesisDefaults,
  SynthesisSelected,
  SynthesisSpeaking,
} from './synthesis/models/synthesis.model';
import {
  loadRecommendedVoices,
  loadSynthesisRates,
  loadVoices,
  setSelectedPitch,
  setSelectedRate,
  setSelectedVoice,
  setSpeaking,
  setSpeakingProcess,
} from './synthesis/state/synthesis.actions';
import { fromEvent } from 'rxjs';
import {
  handleEndEvent,
  logBoundaryEvent,
} from './synthesis/utils/speech-synthesis-events.utils';

@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  // Defaults
  recommendedVoices$: Observable<RecommendedVoices> | undefined;
  rates$: Observable<DefaultRate[]> | undefined;
  voices$: Observable<SpeechSynthesisVoice[]> | undefined;
  defaults$: Observable<SynthesisDefaults> = this.store.select(
    selectSynthesisDefaults
  );
  defaults: SynthesisDefaults | undefined;

  // Selected
  selected$: Observable<SynthesisSelected> = this.store.select(
    selectSynthesisSelected
  );
  selected: SynthesisSelected | undefined;

  // Speaking
  speaking$: Observable<SynthesisSpeaking> = this.store.select(
    selectSynthesisSpeaking
  );
  speaking: SynthesisSpeaking | undefined;

  // other
  private eventsSubs: UtteranceEventsSubscriptions[] = [];

  constructor(public store: Store<AppState>) {
    this.rates$ = this.store.select(selectDefaultRates);
    this.recommendedVoices$ = this.store.select(selectDefaultRecommendedVoices);
    this.voices$ = this.store.select(selectDefaultVoices);

    setTimeout(() => {
      this.init();
      this.subscribeToStore();
    }, 0);
  }

  /**
   * Pauses current speech synthesis but doesn't clear speaking info.
   */
  pause(): void {
    speechSynthesis.pause();
    this.store.dispatch(
      setSpeakingProcess({
        process: {
          isRunning: true,
          isPausedWhileUttering: true,
          isMakingSoundNow: false,
        },
      })
    );
  }

  previewVoice(text?: string): void {
    if (!this.selected!.voice) {
      console.warn('Expected a voice, but none was selected.');
      return;
    }

    const demoText = 'Best wishes and warmest regards.';

    this.stop();
    this.synthesizeSpeechFromText(
      this.selected!.voice,
      this.selected!.rate || 1,
      this.selected!.pitch || 1,
      text || demoText,
      this.attachListeners
    );
  }

  resume() {
    speechSynthesis.resume();
    this.store.dispatch(
      setSpeakingProcess({
        process: {
          isRunning: true,
          isPausedWhileUttering: false,
          isMakingSoundNow: true,
        },
      })
    );
  }

  /**
   * Synthesizes speech from the text for the currently-selected voice
   */
  speak(text: string): void {
    if (!text.length || !this.selected?.voice) {
      return;
    } else {
      this.stop();

      this.store.dispatch(
        setSpeakingProcess({
          process: {
            isRunning: true,
            isPausedWhileUttering: false,
            isMakingSoundNow: true,
          },
        })
      );

      this.synthesizeSpeechFromText(
        this.selected.voice,
        this.selected.rate || 1,
        this.selected.pitch || 1,
        text,
        this.attachListeners
      );
    }
  }

  /**
   * Stops any current speech synthesis and clears current speaking info.
   */
  stop(): void {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();

      this.store.dispatch(
        setSpeaking({
          speaking: {
            content: {
              utterance: null,
              utteranceOptions: null,
            },
            process: {
              isRunning: false,
              isPausedWhileUttering: false,
              isMakingSoundNow: false,
            },
          },
        })
      );
    }
  }

  updateSelected(key: string, value: any) {
    switch (key) {
      case 'pitch':
        this.store.dispatch(setSelectedPitch({ pitch: value }));
        break;
      case 'rate':
        this.store.dispatch(setSelectedRate({ rate: value }));
        break;
      case 'voice':
        this.store.dispatch(setSelectedVoice({ voice: value }));
        break;
    }
  }

  private attachListeners: ListenersAttacherFn = (
    utterance: SpeechSynthesisUtterance,
    logAllEvents = false
  ) => {
    this.detachListeners();
    utteranceEvents.forEach((eventType, index) => {
      if (this.eventsSubs[index]) {
        this.eventsSubs[index].subscription = fromEvent(
          utterance,
          eventType
        ).subscribe((event: any) => {
          switch (event.type) {
            case 'boundary':
              logBoundaryEvent(event as SpeechSynthesisEvent);
              break;
            case 'end':
              handleEndEvent(event as SpeechSynthesisEvent);
              this.detachListeners();
              break;
          }
          if (logAllEvents) {
            console.log(`[${eventType}]:`, event);
          }
        });
      }
    });
  };

  private detachListeners = () => {
    this.eventsSubs.forEach((s) => {
      s.subscription?.unsubscribe();
      s.subscription = undefined;
    });
  };

  private init(): void {
    const POLISH = true;
    const voiceName0 = 'Microsoft Adam - Polish (Poland)';

    let voice: SpeechSynthesisVoice;
    let voices: SpeechSynthesisVoice[] = [];

    this.store.dispatch(loadSynthesisRates({ rates: DEFAULT_SYNTHESIS_RATES }));
    this.store.dispatch(
      loadRecommendedVoices({ recommendedVoices: recommendedVoicesEN })
    );

    utteranceEvents.forEach((e, index) => {
      this.eventsSubs[index] = { type: e, subscription: undefined };
    });

    setTimeout(() => {
      voices = speechSynthesis.getVoices();
      this.store.dispatch(loadVoices({ voices }));
      this.store.dispatch(setSelectedVoice({ voice: voices[0] || null }));
      voice = voices.find((v) => v.name === voiceName0)!;

      if (!voices.length) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          voices = speechSynthesis.getVoices();
          voice = voices.find((v) => v.name === voiceName0)!;
          this.store.dispatch(loadVoices({ voices }));
          this.store.dispatch(
            setSelectedVoice({ voice: POLISH ? voice : voices[0] || null })
          );
        });
      }
    }, 0);
  }

  private subscribeToStore(): void {
    this.defaults$.subscribe((d) => {
      this.defaults = d;
    });

    this.selected$.subscribe((d) => {
      this.selected = d;
    });

    this.speaking$.subscribe((d) => {
      this.speaking = d;
    });
  }

  /**
   * Performs the low-level speech synthesis for the given voice, rate, and text.
   */
  private synthesizeSpeechFromText(
    voice: SpeechSynthesisVoice,
    rate: number,
    pitch: number,
    text: string,
    attachListenersFn?: ListenersAttacherFn
  ): void {
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selected) {
      utterance.voice = voice;
      utterance.rate = rate;
      utterance.pitch = pitch;

      if (attachListenersFn) {
        attachListenersFn(utterance);
      }
      speechSynthesis.speak(utterance);
    }
  }
}
