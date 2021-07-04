import { roundToTwo } from './utils';

export function logBoundaryEvent(event: SpeechSynthesisEvent) {
  console.log(
    (event.name as string).toUpperCase() +
      ' boundary reached after ' +
      roundToTwo(event.elapsedTime as number) +
      ' ms.'
  );
}

export function handleEndEvent(event: SpeechSynthesisEvent) {
  // console.log(event);
}
