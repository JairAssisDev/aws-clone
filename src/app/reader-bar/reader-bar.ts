import { Component, inject } from '@angular/core';
import { ReaderService } from '../reader.service';

@Component({
  selector: 'app-reader-bar',
  imports: [],
  templateUrl: './reader-bar.html',
  styleUrl: './reader-bar.css',
})
export class ReaderBarComponent {
  protected readonly reader = inject(ReaderService);

  protected onVoiceChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      this.reader.setVoice(value);
    }
  }

  protected onTopicChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    if (!id) {
      return;
    }
    this.reader.select(id);
    const el = document.getElementById(id);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
