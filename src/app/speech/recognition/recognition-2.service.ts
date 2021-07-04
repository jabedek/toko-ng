import { takeUntil } from 'rxjs/operators';
import {
  selectRecognitionLangs,
  selectRecognitionSelected,
  selectRecognitionDefaults,
} from './state/recognition.selectors';
import { DEFAULT_RECOGNITION_LANGUAGES } from './assets/languages';
import {
  loadLangs,
  loadRecognition,
  setSelectedGrammar,
  setSelectedInterimResults,
  setSelectedLang,
  setSelectedTerms,
} from './state/recognition.actions';
import { AppState } from 'src/app/app-state/app-state.model';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import {
  RecogEventsSubscriptions,
  RecognitionDefaults,
  RecognitionLanguage,
  RecognitionSelected,
} from './models/recognition.model';
import {
  attachListenersRecog,
  detachListenersRecog,
  getGrammar,
  wordConcat,
} from './utils/recognition.utils';

declare var webkitSpeechRecognition: any;
declare var webkitSpeechGrammarList: any;

const SpeechRecognition = webkitSpeechRecognition,
  SpeechGrammarList = webkitSpeechGrammarList;

@Injectable({
  providedIn: 'root',
})
export class RecogService2 {
  recognition: SpeechRecognition | undefined;
  isStoppedSpeechRecog = false;
  text = '';
  tempWords: any = undefined;

  // Defaults
  defaults$: Observable<RecognitionDefaults> = this.store.select(
    selectRecognitionDefaults
  );
  defaults: RecognitionDefaults | undefined;

  langs$: Observable<RecognitionLanguage[]> = this.store.select(
    selectRecognitionLangs
  );
  langs: RecognitionLanguage[] | undefined;

  // Selected
  selected$: Observable<RecognitionSelected> = this.store.select(
    selectRecognitionSelected
  );
  selected: RecognitionSelected | undefined;

  // other
  private destroy$: Subject<void> = new Subject();
  private eventsSubs: RecogEventsSubscriptions[] = [];

  constructor(private store: Store<AppState>) {
    this.subscribeToStore();

    setTimeout(() => {
      this.init();
    }, 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private init() {
    this.loadRecognition();
    this.store.dispatch(loadLangs({ langs: DEFAULT_RECOGNITION_LANGUAGES }));
  }

  private loadRecognition() {
    setTimeout(() => {
      let recognition: SpeechRecognition = new SpeechRecognition();

      if (recognition) {
        recognition = this.prepareAndDispatchRecognition(
          recognition,
          this.selected!
        );
        this.recognition = recognition;
      } else {
        setTimeout(() => {
          if (recognition) {
            recognition = this.prepareAndDispatchRecognition(
              recognition,
              this.selected!
            );
            this.recognition = recognition;
          } else {
            console.log('No Recognition found.');
          }
        }, 5);
      }
    }, 0);
  }

  private prepareAndDispatchRecognition(
    recognition: SpeechRecognition,
    selected: RecognitionSelected
  ): SpeechRecognition {
    if (recognition && selected) {
      recognition.lang = selected.lang?.langCode || 'pl';
      recognition.interimResults = selected.interimResults;
      recognition.maxAlternatives = selected.maxAlternatives;
    }
    const terms = ['hej', 'cześć', 'test'];
    const grammar: string = getGrammar(terms);

    /* Plug the grammar into speech recognition and configure few other properties */
    let speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    console.log(speechRecognitionList);

    recognition.grammars = speechRecognitionList;
    recognition = attachListenersRecog(
      recognition,
      true,
      detachListenersRecog,
      {
        onend: this.handleEndEvent,
      }
    );

    this.store.dispatch(setSelectedTerms({ terms }));
    this.store.dispatch(setSelectedGrammar({ grammar }));
    this.store.dispatch(loadRecognition({ recognition }));

    console.log(recognition);
    return recognition;
  }

  handleEndEvent = (event: any) => {
    console.log(`[${event.type} - specific handler]`, event);

    if (this.isStoppedSpeechRecog) {
      this.recognition?.stop();
      console.log('End speech recognition');
    } else {
      wordConcat(this.text, this.tempWords);
      this.recognition?.start();
    }
  };

  listen() {
    this.isStoppedSpeechRecog = false;
    this.recognition?.stop();
    this.recognition?.start();
    console.log('Speech recognition started');
  }

  stop() {
    this.isStoppedSpeechRecog = true;
    wordConcat(this.text, this.tempWords);
    this.recognition?.stop();
    console.log('End speech recognition');
  }

  updateSelected(key: string, value: any) {
    switch (key) {
      case 'lang':
        this.store.dispatch(setSelectedLang({ lang: value }));
        break;
      case 'interimResults':
        this.store.dispatch(
          setSelectedInterimResults({ interimResults: value })
        );
        break;
    }
  }

  private subscribeToStore() {
    this.selected$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.selected = d;
    });

    this.selected$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.selected = d;
    });

    this.defaults$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.defaults = d;
    });
  }
}
