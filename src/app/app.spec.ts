import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the course header and topics', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Reforço: os temas em que mais se erra',
    );
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
    expect(compiled.querySelector('app-reader-bar')).toBeTruthy();

    const topicSelect = compiled.querySelector('.topic-select');
    expect(topicSelect).toBeTruthy();
    expect(topicSelect!.querySelectorAll('optgroup').length).toBe(6);
    expect(topicSelect!.querySelectorAll('option').length).toBe(24);

    expect(compiled.querySelectorAll('section').length).toBe(24);
    expect(compiled.querySelectorAll('.doc-sumario').length).toBe(1);
    const headings = Array.from(compiled.querySelectorAll('h1')).map((h) => h.textContent);
    expect(headings.some((t) => t?.includes('AWS Certified Cloud Practitioner (CLF-C02)'))).toBe(
      true,
    );
  });
});
