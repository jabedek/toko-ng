import {
  RecognitionEvent,
  RecognitionProcessMessage,
  RecognitionLanguage,
  SpeechRecognitionEventTypes,
  RecognitionDefaults,
  RecognitionSelected,
  SpeechRecognitionEventType,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
} from './../../shared/models/recognition.model';
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
import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { RECOG_EVENTS } from './recognition.constants';
import * as moment from 'moment';
import { getGrammar, getTopResultFromResults } from './utils/recognition.utils';

//

declare var webkitSpeechRecognition: any;
declare var webkitSpeechGrammarList: any;
const SpeechRecognition = webkitSpeechRecognition;
const SpeechGrammarList = webkitSpeechGrammarList;

type SpeechRecognition = typeof SpeechRecognition;

@Injectable({
  providedIn: 'root',
})
export class RecogService2 {
  eventSubject: Subject<RecognitionEvent> = new Subject();
  speechStateSubect: Subject<SpeechRecognitionEventType> = new Subject();

  recognition: SpeechRecognition | undefined;
  isStoppedSpeechRecog = false;
  isListening = false;
  foundWords = '';
  textDisplayed = '';
  tempWords = '';

  processMessages: RecognitionProcessMessage[] = [];

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
  // private eventsSubs: RecogEventsSubscriptions[] = [];

  constructor(private store: Store<AppState>, public ref: ApplicationRef) {
    this.subscribeToStore();
    this.eventSubject.subscribe((event: RecognitionEvent) => {
      this.dispatchEventHandle(event);
    });

    setTimeout(() => {
      this.initRecognition();
    }, 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Setup & config
  private initRecognition() {
    setTimeout(() => {
      let recognition: SpeechRecognition = new SpeechRecognition();

      if (recognition) {
        recognition = this.configRecognition(recognition, this.selected!);
        this.recognition = recognition;
      } else {
        setTimeout(() => {
          if (recognition) {
            recognition = this.configRecognition(recognition, this.selected!);
            this.recognition = recognition;
          } else {
            // console.log('No Recognition found.');
          }
        }, 5);
      }
    }, 0);
    this.store.dispatch(loadLangs({ langs: DEFAULT_RECOGNITION_LANGUAGES }));
  }

  // Get configured SpeechRecognition object.
  private configRecognition(
    recognition: SpeechRecognition,
    selected: RecognitionSelected
  ): SpeechRecognition {
    if (recognition && selected) {
      recognition.lang = selected.lang?.langCode || 'pl';
      recognition.interimResults = selected.interimResults;
      recognition.maxAlternatives = selected.maxAlternatives;
    }
    const terms = this.selected?.terms || ['hej', 'cześć', 'test'];
    const grammar: string = this.selected?.grammar || getGrammar(terms);

    /* Plug the grammar into speech recognition and configure few other properties */
    let speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);

    recognition.grammars = speechRecognitionList;
    recognition = this.attachRecogListeners(
      recognition,
      this.detachRecogListeners
    );

    this.store.dispatch(setSelectedTerms({ terms }));
    this.store.dispatch(setSelectedGrammar({ grammar }));
    this.store.dispatch(loadRecognition({ recognition }));

    return recognition;
  }

  // Event handling
  attachRecogListeners(
    target: SpeechRecognition,
    detachListenersFn: (target: SpeechRecognition) => SpeechRecognition
  ): SpeechRecognition {
    const newRecognition = detachListenersFn(target) as any;
    RECOG_EVENTS.forEach(
      (eventType) =>
        (newRecognition[`on${eventType}`] = (event: Event) => {
          this.nextEvent(event);
        })
    );

    return newRecognition;
  }

  detachRecogListeners(target: SpeechRecognition): SpeechRecognition {
    const newRecognition = target as any;
    RECOG_EVENTS.forEach((event) => (newRecognition[`on${event}`] = undefined));

    return newRecognition;
  }

  nextEvent = (event: RecognitionEvent) => {
    this.eventSubject.next(event);
  };

  dispatchEventHandle(event: RecognitionEvent) {
    // start > audiostart > (soundstart > speechstart) > results/error/nomatch > (speechend > soundend) > audioend > end
    // console.log('handling...', event);

    const processMessage: RecognitionProcessMessage = {
      date: moment().format('yyyy-mm-DD HH:mm:ss'),
      eventType: event.type,
    };

    console.log(event);

    switch (event.type) {
      case SpeechRecognitionEventTypes.start:
        break;
      case SpeechRecognitionEventTypes.audiostart:
        break;
      case SpeechRecognitionEventTypes.soundstart:
        break;
      case SpeechRecognitionEventTypes.speechstart:
        break;
      case SpeechRecognitionEventTypes.nomatch:
        break;
      case SpeechRecognitionEventTypes.result:
        const { transcript, confidence, isFinal } = getTopResultFromResults(
          (event as SpeechRecognitionEvent).results
        )[0];
        processMessage.topResult = {
          transcript,
          confidence,
          isFinal,
        };

        this.handleResult(transcript);
        // console.log(processMessage);
        break;
      case SpeechRecognitionEventTypes.error:
        processMessage.error = (event as SpeechRecognitionErrorEvent).error;
        break;
      case SpeechRecognitionEventTypes.speechend:
        break;
      case SpeechRecognitionEventTypes.soundend:
        break;
      case SpeechRecognitionEventTypes.audioend:
        break;
      case SpeechRecognitionEventTypes.end:
        this.handleEnd(event);
        break;
    }

    this.speechStateSubect.next(event.type as SpeechRecognitionEventType);
    this.processMessages.push(processMessage);
    this.ref.tick(); // update component from here (instead of standard CDR)

    // console.log(this.processMessages);
  }

  private handleEnd = (event: Event) => {
    if (this.isStoppedSpeechRecog) {
      this.recognition?.stop();
    } else {
      this.foundWordConcat();
      this.tempWords = '';
      this.recognition?.start();
    }
  };

  private handleResult = (result: string) => {
    this.tempWords = result;
    this.textDisplayed = result;
    this.foundWordConcat();
  };

  // Store communication
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
    this.langs$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.langs = d;
    });

    this.selected$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.selected = d;
    });

    this.defaults$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.defaults = d;
    });
  }

  // UI/Feature functionality
  listen() {
    if (!this.isListening) {
      // console.log('elo');

      this.isListening = true;
      this.isStoppedSpeechRecog = false;
      this.recognition?.start();
      // console.log('Speech recognition started');
    }
  }

  stop() {
    this.isListening = false;
    this.isStoppedSpeechRecog = true;
    this.foundWordConcat();
    this.recognition?.stop();
    // console.log('End speech recognition');
  }

  // helpers
  private foundWordConcat() {
    this.foundWords = this.foundWords + ' ' + this.tempWords + '.';
    // console.log(this.foundWords);

    this.tempWords = '';
  }
}
