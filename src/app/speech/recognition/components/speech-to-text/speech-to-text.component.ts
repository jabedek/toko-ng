import { DEFAULT_RECOGNITION_LANGUAGES } from './../../assets/languages';
import { Subject, Observable } from 'rxjs';
import {
  RecognitionLanguage,
  RecognitionSelected,
  SpeechRecognitionEventType,
} from './../../models/recognition.model';
import { RecogService } from './../../recognition.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SPEECH_RECOGNITION_MAX_ALTERNATIVES } from '@ng-web-apis/speech';
import { RecogService2 } from '../../recognition-2.service';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app-state/app-state.model';

declare var webkitSpeechRecognition: any;
@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.scss'],
  providers: [
    // RecogService,
    // { provide: SPEECH_RECOGNITION_MAX_ALTERNATIVES, useValue: 10 },
  ],
})
export class SpeechToTextComponent implements OnInit, OnDestroy {
  // Defaults
  langs$: Observable<RecognitionLanguage[]> | undefined;

  state: SpeechRecognitionEventType = 'end';

  // Selected
  selected: RecognitionSelected = {
    lang: undefined,
    interimResults: true,
    maxAlternatives: 5,
    terms: ['hej', 'cześć', 'test'],
    grammar: '',
    continuous: true,
  };

  termsDisplayed = 'hej, cześć, test';

  // other
  private destroy$: Subject<void> = new Subject();

  constructor(public recog: RecogService2) {
    this.subscribeRecogSelected();

    this.langs$ = this.recog.langs$;
    this.recog.updateSelected(
      'lang',
      DEFAULT_RECOGNITION_LANGUAGES.find((l) => l.langCode.includes('pl'))
    );
  }

  ngOnInit(): void {
    this.recog.speechStateSubect.subscribe((s) => (this.state = s));
    this.recog.eventSubject.subscribe((d) => {});
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  listen() {
    this.recog.listen();
  }

  stop() {
    this.recog.stop();
  }

  updateSelected(
    key: 'lang' | 'interimResults' | 'terms' | 'grammar' | 'continuous'
  ) {
    console.log('speech to text2');

    let value: any =
      key === 'terms'
        ? this.textToWords(this.termsDisplayed)
        : this.selected[key];

    this.recog.updateSelected(key, value);
  }

  subscribeRecogSelected() {
    this.recog.selected$.subscribe((data) => {
      this.selected.interimResults = data.interimResults;
      this.selected.lang = data.lang;
    });
  }

  textToWords(text: string) {
    console.log('speech to text');

    const whitespacesTest = /\s*/gm;
    const specialSymbolsTest = /[\.]*[\-]*[\+]*[\/]*/gm;
    let words = text
      .replace(',,', ',')
      .replace(specialSymbolsTest, '')
      .replace(whitespacesTest, '')
      .split(',');

    return words;
  }
}
