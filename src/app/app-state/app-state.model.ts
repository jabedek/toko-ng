import { RecognitionState } from './../speech/recognition/models/recognition.model';
import { SynthesisState } from '../speech/synthesis/models/synthesis.model';

export interface AppState {
  synthesis: SynthesisState;
  recognition: RecognitionState;
}
