import { SynthesisModule } from './synthesis/synthesis.module';
import { SpeechService } from './speech.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule, SynthesisModule],
  providers: [SpeechService],
  exports: [SynthesisModule],
})
export class SpeechModule {}
