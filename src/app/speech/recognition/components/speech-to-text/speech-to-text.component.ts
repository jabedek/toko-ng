import { DEFAULT_RECOGNITION_LANGUAGES } from './../../assets/languages';
import { Subject, Observable } from 'rxjs';
import {
  RecognitionLanguage,
  RecognitionSelected,
  SpeechRecognitionEventType,
} from './../../../../shared/models/recognition.model';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { RecogService2 } from '../../recognition-2.service';

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.scss'],
  providers: [],
})
export class SpeechToTextComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  @ViewChild('messagesEl') messagesEl: ElementRef | undefined;

  // Defaults
  langs$: Observable<RecognitionLanguage[]> | undefined;

  state: SpeechRecognitionEventType | undefined;

  // Selected (initial values)
  selected: RecognitionSelected = {
    lang: undefined,
    interimResults: true,
    maxAlternatives: 5,
    terms: ['hej', 'cześć', 'test'],
    grammar: '',
    continuous: true,
  };

  termsToFind = 'hej, cześć, test';

  // other
  private destroy$: Subject<void> = new Subject();

  constructor(public service: RecogService2) {
    this.subscribeRecogSelected();

    this.langs$ = this.service.langs$;
    this.service.updateSelected(
      'lang',
      DEFAULT_RECOGNITION_LANGUAGES.find((l) => l.langCode.includes('pl'))
    );
  }

  ngOnInit(): void {
    this.service.speechStateSubect.subscribe((s) => {
      this.state = s;
      this.scrollToBottom();
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollToBottom(): void {
    if (this.messagesEl) {
      this.messagesEl.nativeElement.scrollTop =
        this.messagesEl.nativeElement.scrollHeight;
    }
  }

  listen() {
    this.service.listen();
  }

  stop() {
    this.service.stop();
  }

  updateSelected(
    key: 'lang' | 'interimResults' | 'terms' | 'grammar' | 'continuous'
  ) {
    console.log('speech to text2');

    let value: any =
      key === 'terms' ? this.textToWords(this.termsToFind) : this.selected[key];

    this.service.updateSelected(key, value);
  }

  subscribeRecogSelected() {
    this.service.selected$.subscribe((data) => {
      this.selected.interimResults = data.interimResults;
      this.selected.lang = data.lang;
    });
  }

  textToWords(text: string) {
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
