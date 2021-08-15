import {
  SpeechSynthesisUtteranceEventType,
  SynthesisDefaults,
  SynthesisSelected,
} from './../../../../shared/models/synthesis.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SynthService } from '../../synthesis.service';

@Component({
  selector: 'app-text-to-speech',
  templateUrl: './text-to-speech.component.html',
  styleUrls: ['./text-to-speech.component.scss'],
})
export class TextToSpeechComponent implements OnInit, OnDestroy {
  // Defaults

  defaults$: Observable<SynthesisDefaults> | undefined;
  // Selected
  selected: SynthesisSelected = {
    rate: 1,
    pitch: 1,
    voice: undefined,
  };

  state: SpeechSynthesisUtteranceEventType | undefined;

  // other
  speakOnChange = true;
  text: string = 'Romeo. Bravo. Tango. Uniform.';
  private destroy$: Subject<void> = new Subject();

  constructor(public service: SynthService) {
    this.defaults$ = this.service.defaults$;

    this.subscribeSynthSelected();
  }

  ngOnInit(): void {
    this.service.speechStateSubect.subscribe((s) => {
      console.log(s);

      this.state = s;

      if (s === 'boundary' && this.service.paused) {
        s = 'pause';
      }
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

  previewVoice(): void {
    this.service.previewVoice(this.text);
  }

  resume(): void {
    this.service.resume();
  }

  speak(): void {
    this.service.speak(this.text);
  }

  stop(): void {
    this.service.stop();
  }

  updateSelected(key: 'pitch' | 'rate' | 'voice') {
    const value = this.selected[key];
    this.service.updateSelected(key, value);

    if (this.speakOnChange) {
      this.previewVoice();
    }
  }

  private subscribeSynthSelected() {
    this.service.selected$.subscribe((data) => {
      this.selected.voice = data.voice;
      this.selected.rate = data.rate!;
      this.selected.pitch = data.pitch;
    });
  }
}
