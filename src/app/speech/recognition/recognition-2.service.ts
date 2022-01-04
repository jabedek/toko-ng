import {
  RecognitionEvent,
  RecognitionProcessMessage,
  RecognitionLanguage,
  RecognitionSelected,
  SpeechRecognitionEventType,
} from './../../shared/models/recognition.model';
import { takeUntil } from 'rxjs/operators';
import { Injectable, ApplicationRef } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { LoaderService } from './loader.service';
import { EventsHandlerService } from './events-handler.service';
import { DEFAULT_RECOGNITION_LANGUAGES } from './assets/languages';

declare var webkitSpeechRecognition: any;
declare var webkitSpeechGrammarList: any;
const SpeechRecognition = webkitSpeechRecognition;
const SpeechGrammarList = webkitSpeechGrammarList;

type SpeechRecognition = typeof SpeechRecognition;

/**
 * ON FIREFOX:
 * Go to about:config and switch the flags media.webspeech.recognition.enable and media.webspeech.recognition.force_enable to true.
 */

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
  // startedAt = 0;
  topResults: any[] = [];
  processMessages: RecognitionProcessMessage[] = [];
  langs: RecognitionLanguage[] = DEFAULT_RECOGNITION_LANGUAGES;
  recog: SpeechRecognition | undefined;
  grammar: SpeechGrammarList | undefined;
  recognitionLoadedSub$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  private destroy$: Subject<void> = new Subject();

  constructor(public ref: ApplicationRef, private loader: LoaderService, private eventsHandler: EventsHandlerService) {
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
      const { processMessage } = this.eventsHandler.resolveEvent(event, this.recog);

      this.processMessages.push(processMessage);

      if (processMessage.topResultsSoFar) {
        console.log(processMessage.topResultsSoFar);
      }

      this.speechStateSubect.next(event.type as SpeechRecognitionEventType);
      this.ref.tick(); // update component from here (instead of standard CDR)
    });
  }

  listen(params: RecognitionSelected) {
    this.stop();
    this.prepareRecognition(params);
    // this.startedAt = Date.now();
    this.processMessages = [];
    if (!this.isListening) {
      this.recog?.start();
      this.isListening = true;
      this.isStoppedSpeechRecog = false;
    }
  }

  stop() {
    this.isListening = false;
    this.isStoppedSpeechRecog = true;
    this.recog = this.eventsHandler.detachListeners(this.recog);
    this.recog?.stop();
    this.processMessages.push(this.eventsHandler.createProcessMessage('STOPPED'));
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
