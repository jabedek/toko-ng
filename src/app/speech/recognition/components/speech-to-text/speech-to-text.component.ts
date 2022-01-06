import { Subject } from 'rxjs';
import { RecognitionSelected, SpeechRecognitionEventType } from './../../../../shared/models/recognition.model';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { RecogService2 } from '../../recognition-2.service';
import { takeWhile } from 'rxjs/operators';
import { specialSymbolsTest, whitespacesTest } from 'src/app/shared/regexp/regexp';

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.scss'],
  providers: [],
})
export class SpeechToTextComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEl') messagesEl: ElementRef | undefined;

  speechState: SpeechRecognitionEventType | undefined = undefined;
  params: RecognitionSelected | undefined = undefined;
  userPaused = false;

  get termsToFind() {
    return this.params?.terms.join(', ') || '';
  }

  set termsToFind(val: string) {
    if (this.params) {
      this.params.terms = this.textToTerms(val);
    }
  }
  // other
  private destroy$: Subject<void> = new Subject();

  constructor(public service: RecogService2) {
    this.service.recognitionLoaded$.pipe(takeWhile((v) => v)).subscribe((loaded) => {
      if (loaded) {
        this.params = {
          ...this.service.getDefaultParams(),
        };
      }
    });
  }

  ngOnInit(): void {
    this.service.speechState$.subscribe((s) => {
      this.speechState = s;
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

  listen() {
    this.userPaused = false;
    if (this.params) {
      this.service.listen(this.params);
    }
  }

  stop() {
    if (!this.userPaused) {
      this.userPaused = true;
      this.speechState = undefined;
      this.service.stop();
    }
  }

  updateSelected(key: 'lang' | 'interimResults' | 'terms' | 'grammar' | 'continuous') {}

  private scrollToBottom(): void {
    if (this.messagesEl) {
      this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight;
    }
  }

  private textToTerms(text: string) {
    const terms = text.replace(',,', ',').replace(specialSymbolsTest, '').replace(whitespacesTest, '').split(',');

    return terms;
  }
}
