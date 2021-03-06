import { SynthesisState } from './../../shared/models/synthesis.model';
// import { synthesisFeatureKey } from './state/synthesis.selectors';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextToSpeechComponent } from './components/text-to-speech/text-to-speech.component';
import { SpeechSynthesisModule } from '@ng-web-apis/speech';
import { synthesisReducer } from './state/synthesis.reducer';
import { StoreModule, ActionReducer } from '@ngrx/store';
import { SynthService } from './synthesis.service';
import { LoaderService } from './loader.service';
import { EventsHandlerService } from './events-handler.service';

@NgModule({
  declarations: [TextToSpeechComponent],
  imports: [
    CommonModule,
    FormsModule,
    // StoreModule.forFeature(synthesisFeatureKey, synthesisReducer, {
    //   metaReducers: [logActions],
    // }),
    SpeechSynthesisModule,
  ],
  providers: [SynthService, LoaderService, EventsHandlerService],
  exports: [TextToSpeechComponent],
})
export class SynthesisModule {}

export function logActions(reducer: ActionReducer<SynthesisState>): ActionReducer<SynthesisState> {
  return function (state, action) {
    if (action.type.includes('App/Speech Synth')) {
      console.log(`%c ${action.type}`, 'color: #BADA55; font-weight: 700;');
    }

    return reducer(state, action);
  };
}
