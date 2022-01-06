import { Injectable } from '@angular/core';
// import { SpeechRecognition } from 'src/app/shared/models/recognition.model';

declare var webkitSpeechRecognition: any;
declare var webkitSpeechGrammarList: any;
const SpeechGrammarList = webkitSpeechGrammarList;
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechRecognition = window.SpeechRecognition;

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private recog: SpeechRecognition = new SpeechRecognition();

  constructor() {
    this.getRecog();
  }

  /**
   *
   * @returns Speech recognition and empty grammar  list.
   */
  getSynthAndGrammar(): {
    recog: SpeechRecognition;
  } {
    return { recog: this.recog };
  }

  private getRecog(): void {
    let recog: SpeechRecognition = new SpeechRecognition();

    if (recog) {
      this.recog = recog;
    } else {
      setTimeout(() => {
        if (recog) {
          this.recog = recog;
        } else {
          console.error('No Recognition found.');
        }
      }, 5);
    }
  }
}
