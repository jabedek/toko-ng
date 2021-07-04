import { Observable, Subscription, Subject } from 'rxjs';
import { repeat, retry, takeUntil } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  skipUntilSaid,
  SpeechRecognitionService,
  takeUntilSaid,
  final,
  continuous,
} from '@ng-web-apis/speech';

@Injectable({
  providedIn: 'root',
})
export class RecogService {
  listening$: Subject<void> | undefined;
  recognising$: Observable<any> | undefined;

  constructor(public speechRecognition$: SpeechRecognitionService) {
    this.recognising$ = this.speechRecognition$.pipe(
      retry(),
      repeat(),
      skipUntilSaid('Tupac'),
      takeUntilSaid('November'),
      repeat(),
      final(),
      continuous()
    );

    // this.init();
  }

  listen() {
    this.listening$ = new Subject<void>();

    this.recognising$
      ?.pipe(takeUntil(this.listening$))
      .subscribe((d: SpeechRecognitionResult) => {
        console.log(d);
      });
  }

  stop() {
    if (this.listening$) {
      this.listening$.next();
      this.listening$.complete();
    }
  }
}
