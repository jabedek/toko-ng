import { SpecificHandlers } from './../models/recognition.model';
import { RECOG_EVENTS } from '../models/recognition.constants';

/* Set up terms and grammar
[line]: #JSGF V1.0; - states the format and version used. This always needs to be included first.
[line]: grammar terms; - indicates a type of term that we want to recognise.
[line]: public <term> - public declares that it is a public rule, the string in angle brackets defines the recognised name for this term (term).
[line]: ' + terms.join(' | ') + ' - alternative values that will be recognised and accepted as appropriate values for the term.
*/
export function getGrammar(termsList: string[]): string {
  const terms = termsList || ['pies', 'kot', 'jeż'];
  const grammar =
    '#JSGF V1.0; grammar terms; public <terms> = ' + terms.join(' | ') + ' ;';

  return grammar;
}

export function attachListenersRecog(
  target: SpeechRecognition,
  logAllEvents = false,
  detachListenersFn: (target: SpeechRecognition) => void,
  specificHandlers?: SpecificHandlers
): SpeechRecognition {
  if (detachListenersFn) {
    detachListenersFn(target);
  }

  const newRecognition = target as any;

  newRecognition.onaudioend = (event: any) => {
    if (logAllEvents) {
      console.log(`[audioend]:`, event);
    }
  };

  newRecognition.onaudiostart = (event: any) => {
    if (logAllEvents) {
      console.log(`[audiostart]:`, event);
    }
  };

  newRecognition.onerror = (event: any) => {
    if (logAllEvents) {
      console.log(`[error]:`, event);
    }
  };

  newRecognition.onend = (event: any) => {
    if (logAllEvents) {
      console.log(`[end]:`, event);
    }
  };

  newRecognition.onnomatch = (event: any) => {
    if (logAllEvents) {
      console.log(`[nomatch]:`, event);
    }
  };

  newRecognition.onresult = (event: any) => {
    if (logAllEvents) {
      console.log(`[result]:`, event);
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      console.log(transcript);
    }
  };

  newRecognition.onsoundend = (event: any) => {
    if (logAllEvents) {
      console.log(`[soundend]:`, event);
    }
  };

  newRecognition.onsoundstart = (event: any) => {
    if (logAllEvents) {
      console.log(`[soundstart]:`, event);
    }
  };

  newRecognition.onspeechend = (event: any) => {
    if (logAllEvents) {
      console.log(`[speechend]:`, event);
    }
  };

  newRecognition.onspeechstart = (event: any) => {
    if (logAllEvents) {
      console.log(`[speechstart]:`, event);
    }
  };

  newRecognition.onstart = (event: any) => {
    if (logAllEvents) {
      console.log(`[start]:`, event);
    }
  };

  for (let key in specificHandlers) {
    if (specificHandlers[key]) {
      newRecognition[key] = specificHandlers[key];
    }
  }

  return newRecognition;
}

export function detachListenersRecog(
  target: SpeechRecognition
): SpeechRecognition {
  const newRecognition = target as any;
  newRecognition.onaudioend = undefined;
  newRecognition.onaudiostart = undefined;
  newRecognition.onerror = undefined;
  newRecognition.onend = undefined;
  newRecognition.onnomatch = undefined;
  newRecognition.onresult = undefined;
  newRecognition.onsoundend = undefined;
  newRecognition.onsoundstart = undefined;
  newRecognition.onspeechend = undefined;
  newRecognition.onspeechstart = undefined;
  newRecognition.onstart = undefined;
  return newRecognition;
}

// export function wordConcat(text: string, tempWords: string) {
//   const result = text + tempWords + '.';

//   console.log(result);
//   return result;
// }
