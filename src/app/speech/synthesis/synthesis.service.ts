/**
 * I. Speech Synthesis !== Speech Utterance (consider different roles and events)
 * II. Synthesis events are differently attached - not like Recognition events.
 * * Here, every time synthesis starts a new set of event listeners are reattached
 */

/**
 * Interfaces were copied from lib.dom.d.ts
 */
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ApplicationRef, Injectable, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../app-state/app-state.model';
import {
  RecommendedVoices,
  SynthesisSelected,
  SynthesisEvent,
  SynthesisProcessMessage,
} from './../../shared/models/synthesis.model';
import { LoaderService } from './loader.service';
import { EventsHandlerService } from './events-handler.service';
import { DEFAULT_TEXT } from './synthesis.constants';

@Injectable({
  providedIn: 'root',
})
export class SynthService implements OnInit {
  voices: SpeechSynthesisVoice[] = [];
  synth: SpeechSynthesis | undefined = undefined;
  recommendedVoices: RecommendedVoices = {};
  processMessages: SynthesisProcessMessage[] = [];

  speechStateSub: Subject<any> = new Subject();
  synthesisLoadedSub: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  // // Selected
  // selected$: Observable<SynthesisSelected> = this.store.select(
  //   selectSynthesisSelected
  // );

  // selected: SynthesisSelected = {
  //   voice: undefined,
  //   rate: 1,
  //   pitch: 1,
  //   volume: 1,
  // };

  // Speaking

  paused = false;
  utterance: SpeechSynthesisUtterance | undefined = undefined;

  constructor(
    public store: Store<AppState>,
    public ref: ApplicationRef,
    private loader: LoaderService,
    private eventsHandler: EventsHandlerService
  ) {
    this.init();
  }

  ngOnInit(): void {}

  private init() {
    setTimeout(() => {
      const { synth, voices } = this.loader.getSynthAndVoices();
      this.synth = synth;
      this.voices = voices;
      this.utterance = this.eventsHandler.getUtteranceWithHandlers();
      this.subscribeEventsStream();

      this.synthesisLoadedSub.next(true);
    }, 0);
  }

  getDefaultsParams(): SynthesisSelected {
    return {
      rate: 1.5,
      pitch: 1.25,
      volume: 1,
      voice:
        this.voices.find(
          (v) => v.name === 'Microsoft Adam - Polish (Poland)'
        ) ||
        this.voices[0] ||
        undefined,
    };
  }

  private subscribeEventsStream(): void {
    this.eventsHandler.events$.subscribe((event: SynthesisEvent) => {
      const { utterance, processMessage } = this.eventsHandler.resolveEvent(
        event,
        this.utterance
      );
      this.utterance = utterance;
      this.processMessages.push(processMessage);

      const state = {
        paused: !!this.synth?.paused,
        pending: !!this.synth?.pending,
        speaking: !!this.synth?.speaking,
        fromEvent: event.type,
      };

      this.speechStateSub.next(state);
      this.ref.tick(); // update component from here (instead of standard CDR)
    });
  }

  // UI/Feature functionality
  /**
   * Pauses current speech synthesis but doesn't clear speaking info.
   */
  pause(): void {
    this.paused = true;
    this.synth?.pause();
  }

  previewVoice(text: string, params: SynthesisSelected): void {
    this.stop();

    if (!text.length) {
      console.warn('No text input has been provided. Using default text.');
      text = DEFAULT_TEXT;
    }

    if (!params.voice) {
      console.warn(
        'Expected a voice, but none was selected. Selecting first voice from the list.'
      );
    }

    this.synthesizeSpeechFromText(
      params.voice || this.voices[0],
      params.rate || 1,
      params.pitch || 1,
      text
    );
  }

  resume() {
    this.paused = false;
    this.synth?.resume();
    // this.store.dispatch(
    //   setSpeakingProcess({
    //     process: {
    //       isRunning: true,
    //       isPausedWhileUttering: false,
    //       isMakingSoundNow: true,
    //     },
    //   })
    // );
  }

  /**
   * Synthesizes speech from the text for the currently-selected voice
   */
  speak(text: string, params: SynthesisSelected): void {
    setTimeout(() => {
      this.processMessages = [];
      this.paused = false;

      if (!text.length) {
        console.warn('No text input has been provided. Using default text.');
        text = DEFAULT_TEXT;
      }

      if (!params.voice) {
        console.warn(
          'Expected a voice, but none was selected. Selecting first voice from the list.'
        );
      }

      this.stop();

      this.synthesizeSpeechFromText(
        params.voice || this.voices[0],
        params.rate || 1,
        params.pitch || 1,
        text
      );
    }, 0);
  }

  /**
   * Stops any current speech synthesis and clears current speaking info.
   */
  stop(): void {
    this.synth?.cancel();
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
    setTimeout(() => {
      this.utterance = this.eventsHandler.getUtteranceWithHandlers();
      if (this.utterance) {
        this.utterance.text = text;
        this.utterance.voice = voice;
        this.utterance.rate = rate;
        this.utterance.pitch = pitch;
        this.utterance.volume = 1;
        this.synth?.speak(this.utterance);
      }
    }, 0);
  }
}
