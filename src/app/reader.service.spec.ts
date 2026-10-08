import { TestBed } from '@angular/core/testing';
import { ReaderService } from './reader.service';

describe('ReaderService', () => {
  let service: ReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReaderService);
  });

  it('should expose all 24 course topics', () => {
    expect(service.topics.length).toBe(24);
    expect(service.groups.length).toBe(6);
  });

  it('should navigate to the next topic', () => {
    service.next();
    expect(service.activeId()).toBe('dominio-2');
    expect(service.state()).toBe('stopped');
  });

  it('should navigate to the previous topic and stop at the first one', () => {
    service.previous();
    expect(service.activeId()).toBe('dominio-1');

    service.select('caf');
    service.previous();
    expect(service.activeId()).toBe('vantagens');

    service.select('visao');
    service.previous();
    expect(service.activeId()).toBe('estrategia');
  });

  it('should not go beyond the last topic', () => {
    service.select('guia-gestao');
    service.next();
    expect(service.activeId()).toBe('guia-gestao');
  });

  it('should ignore unknown topic ids', () => {
    service.setActive('nao-existe');
    expect(service.activeId()).toBe('dominio-1');
  });

  it('should show the active topic title when stopped', () => {
    service.select('wa');
    expect(service.currentTitle()).toBe('Pilares do Well-Architected');
    expect(service.stateLabel()).toBe('Pronto para ler');
  });

  it('should select a known voice and ignore unknown ones', () => {
    const voice = {
      name: 'Microsoft Aria Online (Natural)',
      lang: 'pt-BR',
      localService: false,
      default: false,
    } as SpeechSynthesisVoice;

    service.voices.set([voice]);
    service.setVoice(voice.name);
    expect(service.voiceName()).toBe(voice.name);

    service.setVoice('voz-inexistente');
    expect(service.voiceName()).toBe(voice.name);
  });
});
