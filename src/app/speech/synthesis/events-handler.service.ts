import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import {
  SpeechSynthesisUtteranceEventType,
  // SpeechSynthesisUtteranceEventType,
  SynthesisEvent,
  SynthesisProcessMessage,
} from 'src/app/shared/models/synthesis.model';
import {
  attachSynthUtteranceListeners,
  detachSynthUtteranceListeners,
  logBoundaryEvent,
} from './utils/speech-synthesis-events.utils';
import { roundToTwo } from './utils/utils';

@Injectable({
  providedIn: 'root',
})
export class EventsHandlerService {
  private eventSubject: Subject<SynthesisEvent> = new Subject();
  events$: Observable<SynthesisEvent> = this.eventSubject.asObservable();

  constructor() {}

  // was: createUtteranceWithEventListenersOnly
  getUtteranceWithHandlers(text: string = ''): SpeechSynthesisUtterance {
    const newUtterance: SpeechSynthesisUtterance | undefined | null =
      attachSynthUtteranceListeners(
        new SpeechSynthesisUtterance(text),
        detachSynthUtteranceListeners,
        (event: SynthesisEvent) => this.eventSubject.next(event)
      );

    return newUtterance;
  }

  resolveEvent(
    event: SynthesisEvent,
    utterance: SpeechSynthesisUtterance | undefined
  ) {
    if (!utterance) {
      utterance = this.getUtteranceWithHandlers();
    }

    const elapsedTimeMS = (event as any).elapsedTime as number;
    const processMessage: SynthesisProcessMessage = {
      date: moment().format('yyyy-mm-DD HH:mm:ss'),
      eventType: event.type,
      elapsedTime: roundToTwo(elapsedTimeMS / 1000),
    };

    switch (event.type) {
      case SpeechSynthesisUtteranceEventType.start:
        break;
      case SpeechSynthesisUtteranceEventType.boundary:
        processMessage.name = (event as SpeechSynthesisEvent).name;
        logBoundaryEvent(event as SpeechSynthesisEvent);
        break;
      case SpeechSynthesisUtteranceEventType.error:
        break;
      case SpeechSynthesisUtteranceEventType.mark:
        break;
      case SpeechSynthesisUtteranceEventType.pause:
        break;
      case SpeechSynthesisUtteranceEventType.resume:
        break;
      case SpeechSynthesisUtteranceEventType.end:
        detachSynthUtteranceListeners(utterance);
        fetch('https://jsonplaceholder.typicode.com/todos/1')
          .then((response) => response.json())
          .then((json) => console.log(json));
        break;
    }

    return { utterance, processMessage };
  }
}
