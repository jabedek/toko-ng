import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import {
  RecognitionEvent,
  RecognitionProcessMessage,
  RecognitionResultSnapshot,
  SpeechRecognition,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEventType,
} from 'src/app/shared/models/recognition.model';
import { NextEventFn } from 'src/app/shared/models/shared.models';
import { roundToTwo } from '../synthesis/utils/utils';
import { RECOG_EVENTS } from './recognition.constants';

@Injectable({
  providedIn: 'root',
})
export class EventsHandlerService {
  // processMessages: RecognitionProcessMessage[] = [];
  isStoppedSpeechRecog = false;
  isListening = false;
  foundWords = '';
  textDisplayed = '';
  tempWords = '';

  private startedAt = 0;
  private eventSubject: Subject<RecognitionEvent> = new Subject();
  events$: Observable<RecognitionEvent> = this.eventSubject.asObservable();

  constructor() {}

  getRecogWithHandlers(target: SpeechRecognition): SpeechRecognition {
    const newRecog = this.attachRecogListeners(target, this.detachListeners, (event: RecognitionEvent) => this.eventSubject.next(event));
    // console.log('getRecogWithHandlers');

    return newRecog;
  }

  resolveEvent(event: RecognitionEvent, recog: SpeechRecognition) {
    // console.log('resolveEvent');

    const elapsedTimeMS = Date.now() - this.startedAt;
    const processMessage: RecognitionProcessMessage = {
      date: moment().format('yyyy-MM-DD HH:mm:ss'),
      eventType: event.type,
      elapsedTime: roundToTwo(elapsedTimeMS / 1000),
      topResultsSoFar: [],
    };

    switch (event.type) {
      case SpeechRecognitionEventType.start:
        break;
      case SpeechRecognitionEventType.audiostart:
        break;
      case SpeechRecognitionEventType.soundstart:
        break;
      case SpeechRecognitionEventType.speechstart:
        break;
      case SpeechRecognitionEventType.nomatch:
        break;
      case SpeechRecognitionEventType.result:
        processMessage.topResultsSoFar = this.getTopResultFromResults((event as SpeechRecognitionEvent).results).filter((r) => r.isFinal);

        break;
      case SpeechRecognitionEventType.error:
        processMessage.error = (event as SpeechRecognitionErrorEvent).error;
        break;
      case SpeechRecognitionEventType.speechend:
        break;
      case SpeechRecognitionEventType.soundend:
        break;
      case SpeechRecognitionEventType.audioend:
        break;
      case SpeechRecognitionEventType.end:
        // recog = this.detachListeners(recog);
        // recog?.start();

        break;
    }

    return { recog, processMessage };
  }

  private attachRecogListeners(
    target: SpeechRecognition,
    detachListenersFn: (target: SpeechRecognition) => SpeechRecognition,
    nextEventFn: NextEventFn
  ): SpeechRecognition {
    const newRecognition = detachListenersFn(target);
    RECOG_EVENTS.forEach(
      (eventType) =>
        ((newRecognition as any)[`on${eventType}`] = (event: Event) => {
          nextEventFn(event);
        })
    );

    return newRecognition;
  }

  private detachListeners(target: SpeechRecognition): SpeechRecognition {
    const newRecognition = target;
    RECOG_EVENTS.forEach((event) => ((newRecognition as any)[`on${event}`] = undefined));

    return newRecognition;
  }

  private getTopResultFromResults(results: SpeechRecognitionResultList): RecognitionResultSnapshot[] {
    // console.log(results);

    return Array.from(results)
      .map((result: SpeechRecognitionResult) => {
        return { alternative: result[0], isFinal: result.isFinal };
      })
      .map((topResult: { alternative: SpeechRecognitionAlternative; isFinal: boolean }) => {
        // console.log(topResult);

        // tu powinno sie odszukac probe cenzury posrod alternatyw - np dla 'chuj' jest 'c***' wiec mozna zamienic
        let transcript = topResult.alternative.transcript;
        if (transcript.includes('c***')) {
          transcript = 'chuj';
        }

        return {
          transcript,
          confidence: topResult.alternative.confidence.toString().substr(0, 5),
          isFinal: topResult.isFinal,
        };
      });
  }
}
