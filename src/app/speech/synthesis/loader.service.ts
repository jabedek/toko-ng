import { SynthAndVoices } from 'src/app/shared/models/synthesis.model';

export class LoaderService {
  private voices: SpeechSynthesisVoice[] = [];
  private synth: SpeechSynthesis = speechSynthesis || window.speechSynthesis;

  constructor() {
    this.getVoices();
  }

  /**
   *
   * @returns Speech synthesis and array of voices.
   */
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
