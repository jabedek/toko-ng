import { recognitionReducer } from './state/recognition.reducer';
import { recognitionFeatureKey } from './state/recognition.selectors';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule, ActionReducer } from '@ngrx/store';
import { SpeechToTextComponent } from './components/speech-to-text/speech-to-text.component';
import { SpeechRecognitionService } from '@ng-web-apis/speech';
import { RecognitionState } from './../../shared/models/recognition.model';

@NgModule({
  declarations: [SpeechToTextComponent],
  imports: [
    CommonModule,
    FormsModule,
    StoreModule.forFeature(recognitionFeatureKey, recognitionReducer, {
      metaReducers: [logActions],
    }),
  ],
  exports: [SpeechToTextComponent],
  providers: [SpeechRecognitionService],
})
export class RecognitionModule {}

export function logActions(
  reducer: ActionReducer<RecognitionState>
): ActionReducer<RecognitionState> {
  return function (state, action) {
    if (action.type.includes('App/Speech Recog')) {
      console.log(`%c ${action.type}`, 'color: #FF8C42; font-weight: 700;');
    }

    return reducer(state, action);
  };
}
