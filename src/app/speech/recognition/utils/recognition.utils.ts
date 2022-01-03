// tu powinno sie odszukac probe cenzury posrod alternatyw - np dla 'chuj' jest 'c***' wiec mozna zamienic
export function getTopResultFromResults(
  results: SpeechRecognitionResultList
): { transcript: string; confidence: string; isFinal: boolean }[] {
  return Array.from(results)
    .map((result: SpeechRecognitionResult) => {
      return { alternative: result[0], isFinal: result.isFinal };
    })
    .map(
      (result: {
        alternative: SpeechRecognitionAlternative;
        isFinal: boolean;
      }) => {
        let transcript = result.alternative.transcript;
        if (transcript.includes('c***')) {
          transcript = 'chuj';
        }

        return {
          transcript,
          confidence: result.alternative.confidence.toString().substr(0, 5),
          isFinal: result.isFinal,
        };
      }
    );
}

export function getTopTranscript(results: SpeechRecognitionResultList): string {
  return Array.from(results)
    .map((result: SpeechRecognitionResult) => result[0])
    .map((alternative: SpeechRecognitionAlternative) => alternative.transcript)
    .join('');
}

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
