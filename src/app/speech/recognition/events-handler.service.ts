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
import { roundToTwo } from '../../shared/utils/utils';
import { RECOG_EVENTS } from './recognition.constants';
import { v4 as uuidv4 } from 'uuid';
@Injectable({
  providedIn: 'root',
})
export class EventsHandlerService {
  isStoppedSpeechRecog = false;
  isListening = false;
  foundWords = '';
  textDisplayed = '';
  tempWords = '';
  private startedAt = 0;
  private eventSubject: Subject<RecognitionEvent> = new Subject();
  events$: Observable<RecognitionEvent> = this.eventSubject.asObservable();
  private currentID = '';

  constructor() {}

  getRecogWithHandlers(target: SpeechRecognition): SpeechRecognition {
    this.currentID = uuidv4();
    const newRecog = this.attachRecogListeners(target, this.detachListeners, (event: RecognitionEvent) => this.eventSubject.next(event));
    this.startedAt = Date.now();
    return newRecog;
  }

  createProcessMessage(event: RecognitionEvent | 'STOPPED'): { processMessage: RecognitionProcessMessage } {
    const elapsedTimeMS = Math.abs(Date.now() - this.startedAt);
    const elapsedTime = roundToTwo(elapsedTimeMS / 1000);
    const date = moment().format('yyyy-MM-DD HH:mm:ss');

    const processMessage: RecognitionProcessMessage = {
      id: this.currentID,
      date,
      eventType: event === 'STOPPED' ? event : event.type,
      elapsedTime,
    };

    return { processMessage };
  }

  resolveEvent(event: RecognitionEvent, recog: SpeechRecognition) {
    const { processMessage } = this.createProcessMessage(event);
    let topResultsSoFar: RecognitionResultSnapshot[] = [];

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
        topResultsSoFar = this.getTopResultFromResults((event as SpeechRecognitionEvent).results, processMessage.date);
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
        recog?.start();
        break;
    }

    return { processMessage, topResultsSoFar };
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

  detachListeners(target: SpeechRecognition): SpeechRecognition {
    const newRecognition = target;
    RECOG_EVENTS.forEach((event) => ((newRecognition as any)[`on${event}`] = undefined));

    return newRecognition;
  }

  private getTopResultFromResults(results: SpeechRecognitionResultList, date: string): RecognitionResultSnapshot[] {
    return Array.from(results)
      .map((result: SpeechRecognitionResult) => {
        return { alternative: result[0], isFinal: result.isFinal };
      })
      .map((topResult: { alternative: SpeechRecognitionAlternative; isFinal: boolean }) => {
        // TODO: tu powinno sie odszukac probe cenzury posrod alternatyw - np dla 'chuj' jest 'c***' wiec mozna zamienic
        let { transcript, confidence } = topResult.alternative;
        if (transcript?.includes('c***')) {
          transcript = 'chuj';
        }

        return {
          transcript,
          confidence: confidence?.toString().substr(0, 5),
          isFinal: topResult.isFinal,
          date,
        };
      });
  }
}
