import { UTTERANCE_ONLY_EVENTS } from './../synthesis.constants';
import { NextEventFn } from './../../../shared/models/shared.models';
import {
  SpeechSynthesisUtteranceEventType,
  UtteranceListenerAttacher,
  UtteranceListenerDetacher,
} from 'src/app/shared/models/synthesis.model';
import { roundToTwo } from './utils';

export function readBoundaryEvent(event: SpeechSynthesisEvent) {
  console.log(
    (event.name as string).toUpperCase() +
      ' boundary reached after ' +
      roundToTwo(event.elapsedTime as number) +
      ' ms.'
  );
}

export const attachSynthUtteranceListeners: UtteranceListenerAttacher = (
  target: SpeechSynthesisUtterance,
  detachListenersFn: UtteranceListenerDetacher,
  nextEventFn: NextEventFn
): SpeechSynthesisUtterance => {
  console.log(target);
  const newUtterance = detachListenersFn(target) as any;
  console.log(newUtterance);
  UTTERANCE_ONLY_EVENTS.forEach(
    (eventType) =>
      (newUtterance[`on${eventType as SpeechSynthesisUtteranceEventType}`] = (
        event: Event
      ) => {
        nextEventFn(event);
      })
  );

  return newUtterance;
};

export const detachSynthUtteranceListeners: UtteranceListenerDetacher = (
  target: SpeechSynthesisUtterance
): SpeechSynthesisUtterance => {
  const newUtterance = target as any;
  UTTERANCE_ONLY_EVENTS.forEach(
    (eventType) => (newUtterance[`on${eventType}`] = undefined)
  );

  return newUtterance;
};
