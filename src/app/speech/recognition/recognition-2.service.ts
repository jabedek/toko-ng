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
import {
  ProcessMessage,
  RecogEventsSubscriptions,
  RecognitionDefaults,
  RecognitionEvent,
  RecognitionLanguage,
  RecognitionSelected,
  SpecificHandlers,
  SpeechRecognitionEventTypes,
  SpeechRecognitionEventType,
} from './models/recognition.model';
import { RECOG_EVENTS } from './models/recognition.constants';
import * as moment from 'moment';
//

declare var webkitSpeechRecognition: any;
declare var webkitSpeechGrammarList: any;

const SpeechRecognition = webkitSpeechRecognition,
  SpeechGrammarList = webkitSpeechGrammarList;

@Injectable({
  providedIn: 'root',
})
export class RecogService2 {
  eventSubject: Subject<RecognitionEvent> = new Subject();

  speechStateSubect: Subject<SpeechRecognitionEventType> = new Subject();
  recognition: SpeechRecognition | undefined;
  isStoppedSpeechRecog = false;
  isListening = false;
  text = '';
  textDisplayed = '';
  tempWords = '';

  processMessages: ProcessMessage[] = [];

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

  constructor(private store: Store<AppState>, public ref: ApplicationRef) {
    this.subscribeToStore();

    this.eventSubject.subscribe((event: RecognitionEvent) => {
      this.eventHandleDispatcher(event);
    });

    setTimeout(() => {
      this.init();
    }, 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* Set up terms and grammar
[line]: #JSGF V1.0; - states the format and version used. This always needs to be included first.
[line]: grammar terms; - indicates a type of term that we want to recognise.
[line]: public <term> - public declares that it is a public rule, the string in angle brackets defines the recognised name for this term (term).
[line]: ' + terms.join(' | ') + ' - alternative values that will be recognised and accepted as appropriate values for the term.
*/
  getGrammar(termsList: string[]): string {
    const terms = termsList || ['pies', 'kot', 'jeż'];
    const grammar =
      '#JSGF V1.0; grammar terms; public <terms> = ' + terms.join(' | ') + ' ;';

    return grammar;
  }

  attachRecogListeners(
    target: SpeechRecognition,
    detachListenersFn: (target: SpeechRecognition) => void
  ): SpeechRecognition {
    detachListenersFn(target);

    const newRecognition = target as any;
    RECOG_EVENTS.forEach(
      (event) =>
        (newRecognition[`on${event}`] = (fnEvent: Event) => {
          this.nextEvent(fnEvent);
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

  eventHandleDispatcher(event: RecognitionEvent) {
    // start > audiostart > (soundstart > speechstart) > results/error/nomatch > (speechend > soundend) > audioend > end
    console.log('handling...', event);

    const processMessage: ProcessMessage = {
      date: moment().format('yyyy-mm-DD hh:mm:ss'),
      eventType: event.type,
    };

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
        const { transcript, confidence } = this.getTopResultFromResults(
          (event as SpeechRecognitionEvent).results
        )[0];

        processMessage.topResult = {
          transcript,
          confidence,
        };
        // tu powinno sie odszukac probe cenzury posrod alternatyw - np dla 'chuj' jest 'c***' wiec mozna zamienic

        this.handleResult(transcript);
        console.log(processMessage);

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
    // this.state = event.type as SpeechRecognitionEventType;
    // console.log(this.state);

    this.processMessages.push(processMessage);

    this.ref.tick();
    console.log(this.processMessages);
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

  private getTopResultFromResults(
    results: SpeechRecognitionResultList
  ): { transcript: string; confidence: string }[] {
    return Array.from(results)
      .map((result: SpeechRecognitionResult) => result[0])
      .map((alternative: SpeechRecognitionAlternative) => ({
        transcript: alternative.transcript,
        confidence: alternative.confidence.toString().substr(0, 5),
      }));
  }

  private getTopTranscript(results: SpeechRecognitionResultList): string {
    return Array.from(results)
      .map((result: SpeechRecognitionResult) => result[0])
      .map(
        (alternative: SpeechRecognitionAlternative) => alternative.transcript
      )
      .join('');
  }

  private handleResult = (result: string) => {
    this.tempWords = result;
    this.textDisplayed = result;
    this.foundWordConcat();
  };

  ///
  private init() {
    this.loadRecognition();
    this.store.dispatch(loadLangs({ langs: DEFAULT_RECOGNITION_LANGUAGES }));
  }

  private loadRecognition() {
    setTimeout(() => {
      let recognition: SpeechRecognition = new SpeechRecognition();

      if (recognition) {
        recognition = this.setupRecognition(recognition, this.selected!);
        this.recognition = recognition;
      } else {
        setTimeout(() => {
          if (recognition) {
            recognition = this.setupRecognition(recognition, this.selected!);
            this.recognition = recognition;
          } else {
            console.log('No Recognition found.');
          }
        }, 5);
      }
    }, 0);
  }

  private setupRecognition(
    recognition: SpeechRecognition,
    selected: RecognitionSelected
  ): SpeechRecognition {
    if (recognition && selected) {
      recognition.lang = selected.lang?.langCode || 'pl';
      recognition.interimResults = selected.interimResults;
      recognition.maxAlternatives = selected.maxAlternatives;
    }
    const terms = this.selected?.terms || ['hej', 'cześć', 'test'];
    const grammar: string = this.selected?.grammar || this.getGrammar(terms);

    /* Plug the grammar into speech recognition and configure few other properties */
    let speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);

    recognition.grammars = speechRecognitionList;
    recognition = this.attachRecogListeners(
      recognition,
      this.detachRecogListeners
      // {
      //   onend: this.handleEnd,
      //   onresult: this.handleResult,
      // }
    );

    this.store.dispatch(setSelectedTerms({ terms }));
    this.store.dispatch(setSelectedGrammar({ grammar }));
    this.store.dispatch(loadRecognition({ recognition }));

    return recognition;
  }

  listen() {
    if (!this.isListening) {
      console.log('elo');

      this.isListening = true;
      this.isStoppedSpeechRecog = false;
      this.recognition?.start();
      console.log('Speech recognition started');
    }
  }

  stop() {
    this.isListening = false;
    this.isStoppedSpeechRecog = true;
    this.foundWordConcat();
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

  foundWordConcat() {
    this.text = this.text + ' ' + this.tempWords + '.';
    this.tempWords = '';
  }
}
