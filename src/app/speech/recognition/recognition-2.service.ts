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
import { specialSymbolsTest, whitespacesTest } from 'src/app/shared/regexp/regexp';

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
  // processMessagesObj: { [key: string]: RecognitionProcessMessage } = {};
  // results: RecognitionResultSnapshot[] = [];
  resultsObj: { [key: string]: RecognitionResultSnapshot } = {};
  langs: RecognitionLanguage[] = DEFAULT_RECOGNITION_LANGUAGES;

  private speechStateSub: Subject<SpeechRecognitionEventType> = new Subject();
  speechState$: Observable<SpeechRecognitionEventType> = this.speechStateSub.asObservable();
  private recognitionLoadedSub$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  recognitionLoaded$: Observable<boolean> = this.recognitionLoadedSub$.asObservable();

  private isListening = false;
  private recog: SpeechRecognition | undefined;
  private destroy$: Subject<void> = new Subject();

  skipUntilSaid = {
    phrase: 'okej toko',
    hasBeenSaid: false,
  };

  constructor(public ref: ApplicationRef, private loader: LoaderService, private eventsHandler: EventsHandlerService) {
    this.init();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDefaultParams(): RecognitionSelected {
    const terms = ['okej', 'toko', 'okej toko', 'test', 'lol', 'yeti'];

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
      topResultsSoFar.forEach((r) => {
        const startPhrase = this.checkIfStartPhrase(r.transcript);

        if (this.skipUntilSaid.hasBeenSaid === true) {
          this.resultsObj[r.date] = { ...r };
        }

        if (startPhrase) {
          this.skipUntilSaid.hasBeenSaid = true;
          return;
        }
      });

      this.speechStateSub.next(event.type as SpeechRecognitionEventType);
      this.ref.tick(); // update component from here (instead of standard CDR)
    });
  }

  checkIfStartPhrase(phraseA: string) {
    const phraseB = this.skipUntilSaid.phrase;
    const equal = this.checkPhrasesEquality(phraseA, phraseB);
    const similar = this.checkPhrasesSimilarity(phraseA, phraseB);

    console.log(equal, similar);

    return equal || similar >= 0.8;
  }

  /**
   * Checks whether phrases are equal (after normalization and deleting ALL whitespaces)
   */
  private checkPhrasesEquality(phraseA: string, phraseB: string) {
    phraseA = this.normalizePhrase(phraseA).replace(whitespacesTest, '');
    phraseB = this.normalizePhrase(phraseB).replace(whitespacesTest, '');
    console.log(phraseA, phraseB);

    const exactlyEqual = phraseA === phraseB;

    return exactlyEqual;
  }

  private checkPhrasesSimilarity(phraseA: string, phraseB: string) {
    let longer = phraseA;
    let shorter = phraseB;
    if (phraseA.length < phraseB.length) {
      longer = phraseB;
      shorter = phraseA;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat('' + longerLength);
  }

  private editDistance(phraseA: string, phraseB: string) {
    phraseA = phraseA.toLowerCase();
    phraseB = phraseB.toLowerCase();

    const costs = new Array();
    for (let i = 0; i <= phraseA.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= phraseB.length; j++) {
        if (i === 0) costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (phraseA.charAt(i - 1) != phraseB.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[phraseB.length] = lastValue;
    }
    return costs[phraseB.length];
  }

  /**
   * Replaces all special symbols and multiple whitespaces with single whitespace
   * @param phrase Phrase to normalize
   * @returns
   */
  private normalizePhrase(phrase: string) {
    return phrase.toLocaleLowerCase().replace(specialSymbolsTest, ' ').replace(whitespacesTest, ' ');
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

  findPattern() {}

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
    terms.push('okej', 'toko', 'okej toko');
    const grammar = '#JSGF V1.0; grammar terms; public <terms> = ' + terms.join(' | ') + ' ;';
    return grammar;
  }
}
