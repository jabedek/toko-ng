import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.scss'],
})
export class SpeechComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private doc: Document) {}

  ngOnInit(): void {
    this.doc.querySelector('#browserInfo')?.remove();
  }
}
