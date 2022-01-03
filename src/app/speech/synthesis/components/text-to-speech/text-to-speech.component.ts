import { SynthesisSelected } from './../../../../shared/models/synthesis.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SynthService } from '../../synthesis.service';
import {
  DEFAULT_SYNTHESIS_RATES,
  DEFAULT_TEXT,
} from '../../synthesis.constants';
import { takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.scss'],
})
export class TextToSpeechComponent implements OnInit, OnDestroy {
  params: SynthesisSelected | undefined = undefined;
  speechState: any | undefined;
  utteranceState: any;
  text = DEFAULT_TEXT;
  rates = DEFAULT_SYNTHESIS_RATES;
  speakOnChange = true;
  private destroy$: Subject<void> = new Subject();

  constructor(public service: SynthService) {}

  ngOnInit(): void {
    this.service.synthesisLoadedSub$
      .pipe(takeWhile((v) => v))
      .subscribe((loaded) => {
        if (loaded) {
          this.params = this.service.getDefaultsParams();
        }
      });

    this.service.speechStateSub$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.speechState = state.fromEvent;
        this.utteranceState = state;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleKey(event?: any) {
    const key = event.keyCode || event.which;
    const isReactiveKey = [8, 20, 32, 46, 188, 190].find((k) => k === key);

    if (isReactiveKey) {
      if (this.speakOnChange) {
        this.speak();
      }
    } else {
      if (key < 48 || key > 90) {
        return;
      } else {
        if (this.speakOnChange) {
          this.speak();
        }
      }
    }
  }

  pause(): void {
    this.service.pause();
  }

  resume(): void {
    this.service.resume();
  }

  speak(): void {
    this.service.speak(
      this.text,
      this.params || this.service.getDefaultsParams()
    );
  }

  stop(): void {
    this.service.stop();
  }

  updateSelected(key: 'pitch' | 'rate' | 'voice') {
    if (this.speakOnChange) {
      this.speak();
    }
  }
}
