import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { NextEventFn } from 'src/app/shared/models/shared.models';
import {
  SpeechSynthesisUtteranceEventType,
  SynthesisEvent,
  SynthesisProcessMessage,
  UtteranceListenerDetacher,
} from 'src/app/shared/models/synthesis.model';
import { UTTERANCE_ONLY_EVENTS } from './synthesis.constants';
import { roundToTwo } from '../../shared/utils/utils';

export class EventsHandlerService {
  private eventSubject: Subject<SynthesisEvent> = new Subject();
  events$: Observable<SynthesisEvent> = this.eventSubject.asObservable();

  getUtteranceWithHandlers(text: string = ''): SpeechSynthesisUtterance {
    const newUtterance: SpeechSynthesisUtterance | undefined | null = this.attachListeners(
      new SpeechSynthesisUtterance(text),
      this.detachListeners,
      (event: SynthesisEvent) => this.eventSubject.next(event)
    );

    return newUtterance;
  }

  createProcessMessage(event: SynthesisEvent): SynthesisProcessMessage {
    const elapsedTimeMS = (event as any).elapsedTime as number;
    const processMessage: SynthesisProcessMessage = {
      date: moment().format('yyyy-MM-DD HH:mm:ss'),
      eventType: event.type,
      elapsedTime: roundToTwo(elapsedTimeMS / 1000),
    };

    return processMessage;
  }

  resolveEvent(event: SynthesisEvent, utterance: SpeechSynthesisUtterance | undefined) {
    if (!utterance) {
      utterance = this.getUtteranceWithHandlers();
    }

    const processMessage: SynthesisProcessMessage = this.createProcessMessage(event);
    switch (event.type) {
      case SpeechSynthesisUtteranceEventType.start:
        break;
      case SpeechSynthesisUtteranceEventType.boundary:
        processMessage.name = (event as SpeechSynthesisEvent).name;
        this.logBoundaryEvent(event as SpeechSynthesisEvent);
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
        //  this.detachListeners(utterance);
        utterance = this.detachListeners(utterance);

        break;
    }

    return { utterance, processMessage };
  }

  private attachListeners(
    target: SpeechSynthesisUtterance,
    detachListenersFn: UtteranceListenerDetacher,
    nextEventFn: NextEventFn
  ): SpeechSynthesisUtterance {
    const newUtterance = detachListenersFn(target) as any;
    UTTERANCE_ONLY_EVENTS.forEach(
      (eventType) =>
        (newUtterance[`on${eventType as SpeechSynthesisUtteranceEventType}`] = (event: Event) => {
          nextEventFn(event);
        })
    );

    return newUtterance;
  }

  private detachListeners(target: SpeechSynthesisUtterance): SpeechSynthesisUtterance {
    const newUtterance = target as any;

    UTTERANCE_ONLY_EVENTS.forEach((eventType) => (newUtterance[`on${eventType}`] = undefined));

    return newUtterance;
  }

  private logBoundaryEvent(event: SpeechSynthesisEvent) {
    console.log((event.name as string).toUpperCase() + ' boundary reached after ' + roundToTwo(event.elapsedTime as number) + ' ms.');
  }
}
