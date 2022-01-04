import {
  RecognitionEvent,
  RecognitionProcessMessage,
  RecognitionLanguage,
  RecognitionDefaults,
  RecognitionSelected,
  SpeechRecognitionEventType,
} from './../../shared/models/recognition.model';
import { takeUntil } from 'rxjs/operators';
// import { selectRecognitionLangs, selectRecognitionSelected, selectRecognitionDefaults } from './state/recognition.selectors';
// import { AppState } from 'src/app/app-state/app-state.model';
import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { LoaderService } from './loader.service';
import { EventsHandlerService } from './events-handler.service';
import { DEFAULT_RECOGNITION_LANGUAGES } from './assets/languages';

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

  isStoppedSpeechRecog = false;
  isListening = false;
  foundWords = '';
  textDisplayed = '';
  tempWords = '';
  startedAt = 0;

  topResults: any[] = [];

  processMessages: RecognitionProcessMessage[] = [];

  // langs$: Observable<RecognitionLanguage[]> = this.store.select(selectRecognitionLangs);
  langs: RecognitionLanguage[] = DEFAULT_RECOGNITION_LANGUAGES;

  // other
  private destroy$: Subject<void> = new Subject();
  // private eventsSubs: RecogEventsSubscriptions[] = [];

  recog: SpeechRecognition | undefined;
  grammar: SpeechGrammarList | undefined;
  recognitionLoadedSub$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(
    // private store: Store<AppState>,
    public ref: ApplicationRef,
    private loader: LoaderService,
    private eventsHandler: EventsHandlerService
  ) {
    this.init();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDefaultParams(): RecognitionSelected {
    const terms = ['test', 'lol', 'yeti'];

    return {
      continuous: true,
      interimResults: true,
      lang: DEFAULT_RECOGNITION_LANGUAGES.find((l) => l.langCode.includes('pl')),
      maxAlternatives: 5,
      terms: [...terms],
      grammar: '#JSGF V1.0; grammar terms; public <terms> = ' + terms.join(' | ') + ' ;',
    };
  }

  private init() {
    setTimeout(() => {
      const { recog, grammar } = this.loader.getSynthAndGrammar();
      this.recog = recog;
      this.grammar = grammar;
      this.subscribeEventsStream();

      this.recognitionLoadedSub$.next(true);
    }, 0);
  }

  private subscribeEventsStream(): void {
    this.eventsHandler.events$.pipe(takeUntil(this.destroy$)).subscribe((event: RecognitionEvent) => {
      // console.log('#', event);

      const { recog, processMessage } = this.eventsHandler.resolveEvent(event, this.recog);
      this.recog = recog;
      console.log(this.recog);

      this.processMessages.push(processMessage);

      if (processMessage.topResultsSoFar) {
        console.log(processMessage.topResultsSoFar);
      }

      this.speechStateSubect.next(event.type as SpeechRecognitionEventType);
      this.ref.tick(); // update component from here (instead of standard CDR)
    });
  }

  // Get configured SpeechRecognition object.
  // private configRecognition(
  //   recognition: SpeechRecognition,
  //   selected: RecognitionSelected
  // ): SpeechRecognition {
  //   if (recognition && selected) {
  //     recognition.lang = selected.lang?.langCode || 'pl';
  //     recognition.interimResults = selected.interimResults;
  //     recognition.maxAlternatives =
  //   terms: '',selected.maxAlternatives;

  //  terms: '', //   }
  //   const terms = this.selected?.terms || ['hej', 'cześć', 'test'];
  //   const grammar: string = this.selected?.grammar || getGrammar(terms);

  //   /* Plug the grammar into speech recognition and configure few other properties */
  //   let speechRecognitionList = new SpeechGrammarList();
  //   speechRecognitionList.addFromString(grammar, 1);

  //   recognition.grammars = speechRecognitionList;
  //   // recognition = this.

  //   // this.store.dispatch(setSelectedTerms({ terms }));
  //   // this.store.dispatch(setSelectedGrammar({ grammar }));
  //   // this.store.dispatch(loadRecognition({ recognition }));

  //   return recognition;
  // }

  // // Event handling
  // attachRecogListeners(
  //   target: SpeechRecognition,
  //   detachListenersFn: (target: SpeechRecognition) => SpeechRecognition
  // ): SpeechRecognition {
  //   const newRecognition = detachListenersFn(target) as any;
  //   RECOG_EVENTS.forEach(
  //     (eventType) =>
  //       (newRecognition[`on${eventType}`] = (event: Event) => {
  //         this.nextEvent(event);
  //       })
  //   );

  //   return newRecognition;
  // }

  // detachRecogListeners(target: SpeechRecognition): SpeechRecognition {
  //   const newRecognition = target as any;
  //   RECOG_EVENTS.forEach((event) => (newRecognition[`on${event}`] = undefined));

  //   return newRecognition;
  // }

  // nextEvent = (event: RecognitionEvent) => {
  //   this.eventSubject.next(event);
  // };

  // dispatchEventHandle(event: RecognitionEvent) {
  //   const elapsedTimeMS = Date.now() - this.startedAt;
  //   const processMessage: RecognitionProcessMessage = {
  //     date: moment().format('yyyy-MM-DD HH:mm:ss'),
  //     eventType: event.type,
  //     elapsedTime: roundToTwo(elapsedTimeMS / 1000),
  //   };

  //   switch (event.type) {
  //     case SpeechRecognitionEventTypes.start:
  //       break;
  //     case SpeechRecognitionEventTypes.audiostart:
  //       break;
  //     case SpeechRecognitionEventTypes.soundstart:
  //       break;
  //     case SpeechRecognitionEventTypes.speechstart:
  //       break;
  //     case SpeechRecognitionEventTypes.nomatch:
  //       break;
  //     case SpeechRecognitionEventTypes.result:
  //       const { transcript, confidence, isFinal } = getTopResultFromResults(
  //         (event as SpeechRecognitionEvent).results
  //       )[0];
  //       processMessage.topResult = {
  //         transcript,
  //         confidence,
  //         isFinal,
  //       };

  //       this.handleResult(transcript);
  //       break;
  //     case SpeechRecognitionEventTypes.error:
  //       processMessage.error = (event as SpeechRecognitionErrorEvent).error;
  //       break;
  //     case SpeechRecognitionEventTypes.speechend:
  //       break;
  //     case SpeechRecognitionEventTypes.soundend:
  //       break;
  //     case SpeechRecognitionEventTypes.audioend:
  //       break;
  //     case SpeechRecognitionEventTypes.end:
  //       this.handleEnd(event);
  //       break;
  //   }

  //   this.speechStateSubect.next(event.type as SpeechRecognitionEventType);
  //   this.processMessages.push(processMessage);
  //   this.ref.tick(); // update component from here (instead of standard CDR)

  // console.log(this.processMessages);
  // }

  // private handleEnd = (event: Event) => {
  //   if (this.isStoppedSpeechRecog) {
  //     this.recognition?.stop();
  //   } else {
  //     this.foundWordConcat();
  //     this.tempWords = '';
  //     this.recognition?.start();
  //   }
  // };

  // private handleResult = (result: string) => {
  //   this.tempWords = result;
  //   this.textDisplayed = result;
  //   this.foundWordConcat();
  // };

  // Store communication
  // updateSelected(key: string, value: any) {
  //   switch (key) {
  //     case 'lang':
  //       this.store.dispatch(setSelectedLang({ lang: value }));
  //       break;
  //     case 'interimResults':
  //       this.store.dispatch(
  //         setSelectedInterimResults({ interimResults: value })
  //       );
  //       break;
  //   }
  // }

  // private subscribeToStore() {
  //   this.langs$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
  //     this.langs = d;
  //   });

  //   this.selected$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
  //     this.selected = d;
  //   });

  //   this.defaults$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
  //     this.defaults = d;
  //   });
  // }

  // UI/Feature functionality
  listen(params: RecognitionSelected) {
    this.stop();
    this.prepareRecognition(params);
    this.startedAt = Date.now();
    this.processMessages = [];
    if (!this.isListening) {
      this.recog?.start();
      this.isListening = true;
      this.isStoppedSpeechRecog = false;
      // console.log('Speech recognition started');
    }
  }

  stop() {
    this.isListening = false;
    this.isStoppedSpeechRecog = true;
    // this.foundWordConcat();
    this.recog?.stop();
    // console.log('End speech recognition');
  }

  private prepareRecognition(params: RecognitionSelected) {
    /* Plug the grammar into speech recognition and configure few other properties */
    const speechRecognitionList: SpeechGrammarList = new SpeechGrammarList();
    speechRecognitionList.addFromString(this.getGrammar(params.terms), 1);

    this.recog = this.eventsHandler.getRecogWithHandlers(this.recog);
    this.recog.grammars = speechRecognitionList;
    this.recog.lang = params.lang?.langCode || 'pl';
    this.recog.interimResults = params.interimResults;
    this.recog.maxAlternatives = params.maxAlternatives;
    this.recog.continuous = params.continuous;
  }

  // helpers
  private foundWordConcat() {
    this.foundWords = this.foundWords + ' ' + this.tempWords + '.';
    console.log(this.foundWords);

    this.tempWords = '';
  }

  /**
   * Set up terms and grammar
   *
   * [line]: #JSGF V1.0; - states the format and version used. This always needs to be included first.
   *
   * [line]: grammar terms; - indicates a type of term that we want to recognise.
   *
   * [line]: public <term> - public declares that it is a public rule, the string in angle brackets defines the recognised name for this term (term).
   *
   * [line]: ' + terms.join(' | ') + ' - alternative values that will be recognised and accepted as appropriate values for the term.

   * @param terms Terms wanted to be recognised
   * @returns A DOMString representing the grammar to be added.
   */
  private getGrammar(terms: string[]): string {
    const grammar = '#JSGF V1.0; grammar terms; public <terms> = ' + terms.join(' | ') + ' ;';
    return grammar;
  }
}
