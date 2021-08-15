import { NextEventFn } from './../../shared/models/shared.models';
/**
 * I. Speech Synthesis !== Speech Utterance (consider different roles and events)
 * II. Synthesis events are differently attached - not like Recognition events.
 * * Here, every time synthesis starts a new set of event listeners are reattached
 */

import { takeUntil } from 'rxjs/operators';
import {
  selectSynthesisSelected,
  selectSynthesisDefaults,
  selectSynthesisSpeaking,
  selectDefaultRates,
  selectDefaultRecommendedVoices,
  selectDefaultVoices,
} from './state/synthesis.selectors';
import { Observable, Subject } from 'rxjs';
import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app-state/app-state.model';
import { recommendedVoicesEN } from './configs/en/recommended-voices-en';
import {
  DEFAULT_SYNTHESIS_RATES,
  UTTERANCE_ONLY_EVENTS,
} from './synthesis.constants';
import {
  UtteranceEventsSubscriptions,
  RecommendedVoices,
  SynthesisDefaults,
  SynthesisSelected,
  SynthesisSpeaking,
  DefaultRate,
  SynthesisEvent,
  SpeechSynthesisUtteranceEventTypes,
  SpeechSynthesisUtteranceEventType,
  UtteranceListenerAttacher,
  UtteranceListenerDetacher,
} from './../../shared/models/synthesis.model';
import {
  loadRecommendedVoices,
  loadSynthesisRates,
  loadVoices,
  setSelectedPitch,
  setSelectedRate,
  setSelectedVoice,
  setSpeaking,
  setSpeakingProcess,
} from './state/synthesis.actions';
import {
  readBoundaryEvent,
  attachSynthUtteranceListeners,
  detachSynthUtteranceListeners,
} from './utils/speech-synthesis-events.utils';

@Injectable({
  providedIn: 'root',
})
export class SynthService implements OnDestroy {
  eventSubject: Subject<SynthesisEvent> = new Subject();
  speechStateSubect: Subject<SpeechSynthesisUtteranceEventType> = new Subject();

  // Defaults
  defaults$: Observable<SynthesisDefaults> = this.store.select(
    selectSynthesisDefaults
  );
  defaults: SynthesisDefaults | undefined;
  rates$: Observable<DefaultRate[]> = this.store.select(selectDefaultRates);
  recommendedVoices$: Observable<RecommendedVoices> = this.store.select(
    selectDefaultRecommendedVoices
  );
  voices$: Observable<SpeechSynthesisVoice[]> =
    this.store.select(selectDefaultVoices);

  utterance: SpeechSynthesisUtterance | undefined = undefined;

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

  paused = false;

  // other
  private eventsSubs: UtteranceEventsSubscriptions[] = [];
  private destroy$: Subject<void> = new Subject();

  constructor(public store: Store<AppState>, public ref: ApplicationRef) {
    this.subscribeToStore();

    this.eventSubject.subscribe((event: SynthesisEvent) => {
      this.dispatchEventHandle(event);
    });

    setTimeout(() => {
      this.initSynthesis();
      this.utterance = this.createUtteranceWithEventListenersOnly();
    }, 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Setup & config
  private initSynthesis(): void {
    const POLISH = true;
    const voiceName0 = 'Microsoft Adam - Polish (Poland)';

    let voice: SpeechSynthesisVoice;
    let voices: SpeechSynthesisVoice[] = [];

    this.store.dispatch(loadSynthesisRates({ rates: DEFAULT_SYNTHESIS_RATES }));
    this.store.dispatch(
      loadRecommendedVoices({ recommendedVoices: recommendedVoicesEN })
    );

    setTimeout(() => {
      voices = speechSynthesis.getVoices();
      this.store.dispatch(loadVoices({ voices }));
      this.store.dispatch(setSelectedVoice({ voice: voices[0] || undefined }));
      voice = voices.find((v) => v.name === voiceName0)!;

      if (!voices.length) {
        speechSynthesis.addEventListener('voiceschanged', (event) => {
          console.log('voiceschanged', event);

          voices = speechSynthesis.getVoices();
          voice = voices.find((v) => v.name === voiceName0)!;
          this.store.dispatch(loadVoices({ voices }));
          this.store.dispatch(
            setSelectedVoice({ voice: POLISH ? voice : voices[0] || undefined })
          );
        });
      }
    }, 0);
  }

  // Event handling
  nextEvent = (event: SynthesisEvent) => {
    this.eventSubject.next(event);
  };

  dispatchEventHandle(event: SynthesisEvent) {
    console.log('handling...', event.type, event);

    switch (event.type) {
      case SpeechSynthesisUtteranceEventTypes.start:
        this.paused = false;
        break;
      case SpeechSynthesisUtteranceEventTypes.boundary:
        readBoundaryEvent(event as SpeechSynthesisEvent);
        break;
      case SpeechSynthesisUtteranceEventTypes.error:
        console.log(event);
        break;
      case SpeechSynthesisUtteranceEventTypes.mark:
        break;
      case SpeechSynthesisUtteranceEventTypes.pause:
        this.paused = true;
        break;
      case SpeechSynthesisUtteranceEventTypes.resume:
        this.paused = false;
        break;
      case SpeechSynthesisUtteranceEventTypes.end:
        detachSynthUtteranceListeners(this.utterance!);
        break;
    }

    this.paused
      ? this.speechStateSubect.next('pause')
      : this.speechStateSubect.next(
          event.type as SpeechSynthesisUtteranceEventType
        );

    this.ref.tick(); // update component from here (instead of standard CDR)
  }

  // Store communication
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

  private subscribeToStore(): void {
    this.defaults$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.defaults = d;
    });

    this.selected$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.selected = d;
    });

    this.speaking$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.speaking = d;
    });
  }

  // UI/Feature functionality
  /**
   * Pauses current speech synthesis but doesn't clear speaking info.
   */
  pause(): void {
    this.paused = true;
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
      text || demoText
    );
  }

  resume() {
    this.paused = false;
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
    setTimeout(() => {
      this.paused = false;
      if (!text.length || !this.selected?.voice) {
        console.log('here1');

        return;
      } else {
        console.log('here2');
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
          text
        );
      }
    }, 0);
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
              utterance: undefined,
              utteranceOptions: undefined,
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

  /**
   * Performs the low-level speech synthesis for the given voice, rate, and text.
   */
  private synthesizeSpeechFromText(
    voice: SpeechSynthesisVoice,
    rate: number,
    pitch: number,
    text: string
  ): void {
    const utterance = this.createUtteranceWithEventListenersOnly(text);
    if (this.selected) {
      utterance.voice = voice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      this.utterance = utterance;

      this.utterance
        ? speechSynthesis.speak(this.utterance)
        : console.log('error');
    }
  }

  private createUtteranceWithEventListenersOnly(text: string = '') {
    const utterance = attachSynthUtteranceListeners(
      new SpeechSynthesisUtterance(text),
      detachSynthUtteranceListeners,
      this.nextEvent
    );
    console.log(utterance);
    return utterance;
  }
}
