import { RecogService } from './recognition/recognition.service';
import { RecognitionModule } from './recognition/recognition.module';
import { SynthesisModule } from './synthesis/synthesis.module';
import { SynthService } from './synthesis/synthesis.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule, SynthesisModule, RecognitionModule],
  providers: [SynthService, RecogService],
  exports: [SynthesisModule, RecognitionModule],
})
export class SpeechModule {}
