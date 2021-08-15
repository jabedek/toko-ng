import { RecognitionState } from '../shared/models/recognition.model';
import { SynthesisState } from '../shared/models/synthesis.model';

export interface AppState {
  synthesis: SynthesisState;
  recognition: RecognitionState;
}
