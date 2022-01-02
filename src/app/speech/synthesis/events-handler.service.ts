import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import {
  SpeechSynthesisUtteranceEventType,
  SpeechSynthesisUtteranceEventTypes,
  SynthesisEvent,
  SynthesisProcessMessage,
} from 'src/app/shared/models/synthesis.model';
import {
  attachSynthUtteranceListeners,
  detachSynthUtteranceListeners,
  readBoundaryEvent,
} from './utils/speech-synthesis-events.utils';

@Injectable({
  providedIn: 'root',
})
export class EventsHandlerService {
  private eventSubject: Subject<SynthesisEvent> = new Subject();
  events$: Observable<SynthesisEvent> = this.eventSubject.asObservable();
  processMessages: SynthesisProcessMessage[] = [];

  constructor() {}

  // was: createUtteranceWithEventListenersOnly
  getUtteranceWithHandlers(text: string = ''): SpeechSynthesisUtterance {
    const newUtterance: SpeechSynthesisUtterance | undefined | null =
      attachSynthUtteranceListeners(
        new SpeechSynthesisUtterance(text),
        detachSynthUtteranceListeners,
        (event: SynthesisEvent) => this.eventSubject.next(event)
      );
    console.log(newUtterance);

    return newUtterance;
  }

  // private nextEvent = (event: SynthesisEvent) => {
  //   this.eventSubject.next(event);
  // };

  // was: dispatchEventHandle
  resolveEvent(
    event: SynthesisEvent,
    utterance: SpeechSynthesisUtterance | undefined,
    pause: boolean
  ) {
    console.log('resolve', utterance, event);

    if (!utterance) {
      utterance = this.getUtteranceWithHandlers();
    }
    console.log('handling...', event.type, event);

    const processMessage: SynthesisProcessMessage = {
      date: moment().format('yyyy-mm-DD HH:mm:ss'),
      eventType: event.type,
    };

    let paused = pause;

    switch (event.type) {
      case SpeechSynthesisUtteranceEventTypes.start:
        paused = false;
        break;
      case SpeechSynthesisUtteranceEventTypes.boundary:
        processMessage.name = (event as SpeechSynthesisEvent).name;
        readBoundaryEvent(event as SpeechSynthesisEvent);
        break;
      case SpeechSynthesisUtteranceEventTypes.error:
        break;
      case SpeechSynthesisUtteranceEventTypes.mark:
        break;
      case SpeechSynthesisUtteranceEventTypes.pause:
        paused = true;
        break;
      case SpeechSynthesisUtteranceEventTypes.resume:
        paused = false;
        break;
      case SpeechSynthesisUtteranceEventTypes.end:
        detachSynthUtteranceListeners(utterance);
        break;
    }
    this.processMessages.push(processMessage);
    console.log(processMessage);

    return { paused, utterance };

    // paused
    //   ? this.speechStateSubect.next('pause')
    //   : this.speechStateSubect.next(
    //       event.type as SpeechSynthesisUtteranceEventType
    //     );

    // this.ref.tick(); // update component from here (instead of standard CDR)
  }
}
