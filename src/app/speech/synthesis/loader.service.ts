import { Injectable } from '@angular/core';
import { SynthAndVoices } from 'src/app/shared/models/synthesis.model';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private voices: SpeechSynthesisVoice[] = [];
  private synth: SpeechSynthesis = speechSynthesis || window.speechSynthesis;

  constructor() {
    this.getVoices();
  }

  getSynthAndVoices(): SynthAndVoices {
    return { synth: this.synth, voices: this.voices || [] };
  }

  private getVoices(): void {
    setTimeout(() => {
      this.voices = this.synth.getVoices();
      if (!this.voices.length) {
        this.synth.addEventListener('voiceschanged', (event) => {
          this.voices = this.synth.getVoices();
        });
      }
    }, 0);
  }
}
