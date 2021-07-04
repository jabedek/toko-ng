import {
  selectDefaultRates,
  selectDefaultRecommendedVoices,
  selectDefaultVoices,
  selectSynthesisDefaults,
  selectSynthesisSelected,
} from './../../state/synthesis.selectors';
import { SpeechService } from './../../../speech.service';
import { recommendedVoicesEN } from './../../configs/en/recommended-voices-en';
import {
  setIsRunning,
  setSelected,
  setSelectedPitch,
  setSelectedRate,
  setSelectedVoice,
} from './../../state/synthesis.actions';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { SpeechSynthesisUtteranceOptions } from '@ng-web-apis/speech';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app-state/app-state.model';
import { selectSynthesis } from '../../state/synthesis.selectors';
import {
  RecommendedVoices,
  SynthesisSelected,
} from '../../models/synthesis.model';
import { DefaultRate } from '../../models/synthesis.constants';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.scss'],
})
export class TextToSpeechComponent implements OnInit, OnDestroy {
  // Defaults
  recommendedVoices$: Observable<RecommendedVoices> | undefined;
  rates$: Observable<DefaultRate[]> | undefined;
  voices$: Observable<SpeechSynthesisVoice[]> | undefined;

  // Selected
  selected: SynthesisSelected = {
    rate: 1,
    pitch: 1,
    voice: null,
  };

  // Speaking
  text: string = 'Romeo Yeti Bravo Tango';

  // other
  private destroy$: Subject<void> = new Subject();

  constructor(
    public store: Store<AppState>,
    public speech: SpeechService,
    public cdr: ChangeDetectorRef
  ) {
    this.rates$ = this.speech.rates$;
    this.recommendedVoices$ = this.speech.recommendedVoices$;
    this.voices$ = this.speech.voices$;

    this.subscribeSynthSelected();
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  pause(): void {
    this.speech.pause();
  }

  previewVoice(): void {
    this.speech.previewVoice(this.text);
  }

  resume(): void {
    this.speech.resume();
  }

  speak(): void {
    this.speech.speak(this.text);
  }

  stop(): void {
    this.speech.stop();
  }

  updateSelected(key: 'pitch' | 'rate' | 'voice') {
    const value = this.selected[key];
    this.speech.updateSelected(key, value);
    this.previewVoice();
  }

  private subscribeSynthSelected() {
    this.speech.selected$.subscribe((data) => {
      this.selected.voice = data.voice;
      this.selected.rate = data.rate!;
      this.selected.pitch = data.pitch;
    });
  }
}
