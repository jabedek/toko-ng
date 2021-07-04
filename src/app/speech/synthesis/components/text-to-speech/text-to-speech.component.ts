import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app-state/app-state.model';
import { Subject, Observable } from 'rxjs';
import {
  RecommendedVoices,
  SynthesisSelected,
} from '../../models/synthesis.model';
import { DefaultRate } from '../../models/synthesis.constants';
import { SynthService } from '../../synthesis.service';

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
    voice: undefined,
  };

  // other
  text: string = 'Romeo Yeti Bravo Tango';
  private destroy$: Subject<void> = new Subject();

  constructor(public synth: SynthService) {
    this.rates$ = this.synth.rates$;
    this.recommendedVoices$ = this.synth.recommendedVoices$;
    this.voices$ = this.synth.voices$;

    this.subscribeSynthSelected();
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  pause(): void {
    this.synth.pause();
  }

  previewVoice(): void {
    this.synth.previewVoice(this.text);
  }

  resume(): void {
    this.synth.resume();
  }

  speak(): void {
    this.synth.speak(this.text);
  }

  stop(): void {
    this.synth.stop();
  }

  updateSelected(key: 'pitch' | 'rate' | 'voice') {
    const value = this.selected[key];
    this.synth.updateSelected(key, value);
    this.previewVoice();
  }

  private subscribeSynthSelected() {
    this.synth.selected$.subscribe((data) => {
      this.selected.voice = data.voice;
      this.selected.rate = data.rate!;
      this.selected.pitch = data.pitch;
    });
  }
}
