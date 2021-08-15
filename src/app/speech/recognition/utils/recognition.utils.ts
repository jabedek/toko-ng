import { SpecificHandlers } from './../models/recognition.model';

// export function attachListenersRecog(
//   target: SpeechRecognition,
//   logAllEvents = false,
//   detachListenersFn: (target: SpeechRecognition) => void,
//   specificHandlers?: SpecificHandlers
// ): SpeechRecognition {
//   if (detachListenersFn) {
//     detachListenersFn(target);
//   }

//   const newRecognition = target as any;

//   newRecognition.onaudioend = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[audioend]:`, event);
//     }
//   };

//   newRecognition.onaudiostart = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[audiostart]:`, event);
//     }
//   };

//   newRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
//     if (logAllEvents) {
//       console.log(`[error]:`, event);
//     }
//   };

//   newRecognition.onend = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[end]:`, event);
//     }
//   };

//   newRecognition.onnomatch = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[nomatch]:`, event);
//     }
//   };

//   newRecognition.onresult = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[result]:`, event);
//       const transcript = Array.from(event.results)
//         .map((result: any) => result[0])
//         .map((result) => result.transcript)
//         .join('');
//       console.log(transcript);
//     }
//   };

//   newRecognition.onsoundend = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[soundend]:`, event);
//     }
//   };

//   newRecognition.onsoundstart = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[soundstart]:`, event);
//     }
//   };

//   newRecognition.onspeechend = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[speechend]:`, event);
//     }
//   };

//   newRecognition.onspeechstart = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[speechstart]:`, event);
//     }
//   };

//   newRecognition.onstart = (event: SpeechRecognitionEvent) => {
//     if (logAllEvents) {
//       console.log(`[start]:`, event);
//     }
//   };

//   for (let key in specificHandlers) {
//     if (specificHandlers[key]) {
//       newRecognition[key] = specificHandlers[key];
//     }
//   }

//   return newRecognition;
// }

// export function detachListenersRecog(
//   target: SpeechRecognition
// ): SpeechRecognition {
//   const newRecognition = target as any;
//   newRecognition.onaudioend = undefined;
//   newRecognition.onaudiostart = undefined;
//   newRecognition.onerror = undefined;
//   newRecognition.onend = undefined;
//   newRecognition.onnomatch = undefined;
//   newRecognition.onresult = undefined;
//   newRecognition.onsoundend = undefined;
//   newRecognition.onsoundstart = undefined;
//   newRecognition.onspeechend = undefined;
//   newRecognition.onspeechstart = undefined;
//   newRecognition.onstart = undefined;
//   return newRecognition;
// }
