import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { ReaderService } from '../reader.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements AfterViewInit, OnDestroy {
  protected readonly reader = inject(ReaderService);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    setTimeout(() => this.observeSections(), 0);
  }

  private observeSections(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.reader.setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    this.reader.topics.forEach((topic) => {
      const el = document.getElementById(topic.id);
      if (el) {
        this.observer?.observe(el);
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
