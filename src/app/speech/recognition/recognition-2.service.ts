import {
  RecognitionEvent,
  RecognitionProcessMessage,
  RecognitionLanguage,
  RecognitionSelected,
  SpeechRecognitionEventType,
  RecognitionResultSnapshot,
} from './../../shared/models/recognition.model';
import { takeUntil } from 'rxjs/operators';
import { Injectable, ApplicationRef } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { LoaderService } from './loader.service';
import { EventsHandlerService } from './events-handler.service';
import { DEFAULT_RECOGNITION_LANGUAGES } from './constants/languages.constant';

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
  processMessages: RecognitionProcessMessage[] = [];
  processMessagesObj: { [key: string]: RecognitionProcessMessage } = {};
  results: RecognitionResultSnapshot[] = [];
  resultsObj: { [key: string]: RecognitionResultSnapshot } = {};
  langs: RecognitionLanguage[] = DEFAULT_RECOGNITION_LANGUAGES;

  private speechStateSub: Subject<SpeechRecognitionEventType> = new Subject();
  speechState$: Observable<SpeechRecognitionEventType> = this.speechStateSub.asObservable();
  private recognitionLoadedSub$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  recognitionLoaded$: Observable<boolean> = this.recognitionLoadedSub$.asObservable();

  private isListening = false;
  private recog: SpeechRecognition | undefined;
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
      const { recog } = this.loader.getSynthAndGrammar();
      this.recog = recog;
      this.subscribeEventsStream();

      this.recognitionLoadedSub$.next(true);
    }, 0);
  }

  private subscribeEventsStream(): void {
    this.eventsHandler.events$.pipe(takeUntil(this.destroy$)).subscribe((event: RecognitionEvent) => {
      const { processMessage, topResultsSoFar } = this.eventsHandler.resolveEvent(event, this.recog);

      this.processMessages.push(processMessage);
      this.processMessagesObj[processMessage.date] = { ...processMessage };
      this.results = topResultsSoFar;
      topResultsSoFar.forEach((r) => {
        this.resultsObj[r.date] = { ...r };
      });

      this.speechStateSub.next(event.type as SpeechRecognitionEventType);
      this.ref.tick(); // update component from here (instead of standard CDR)
    });
  }

  listen(params: RecognitionSelected) {
    this.stop();
    this.prepareRecognition(params);
    this.processMessages = [];
    if (!this.isListening) {
      this.recog?.start();
      this.isListening = true;
    }
  }

  stop() {
    this.isListening = false;
    this.recog = this.eventsHandler.detachListeners(this.recog);
    this.recog?.stop();
    this.processMessages.push(this.eventsHandler.createProcessMessage(SpeechRecognitionEventType.STOPPED).processMessage);
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
   * [ line ]: #JSGF V1.0; - states the format and version used. This always needs to be included first.
   *
   * [ line ]: grammar terms; - indicates a type of term that we want to recognise.
   *
   * [ line ]: public <term> - public declares that it is a public rule, the string in angle brackets defines the recognised name for this term (term).
   *
   * [ line ]: ' + terms.join(' | ') + ' - alternative values that will be recognised and accepted as appropriate values for the term.

   * @param terms Terms wanted to be recognised
   * @returns A DOMString representing the grammar to be added.
   */
  private getGrammar(terms: string[]): string {
    const grammar = '#JSGF V1.0; grammar terms; public <terms> = ' + terms.join(' | ') + ' ;';
    return grammar;
  }
}
