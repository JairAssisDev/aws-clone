import { computed, Injectable, signal } from '@angular/core';

export interface TocItem {
  id: string;
  title: string;
}

export interface TocGroup {
  label: string;
  items: TocItem[];
}

export type ReaderState = 'stopped' | 'playing' | 'paused';

const MAX_CHUNK_LENGTH = 220;
const VOICE_STORAGE_KEY = 'aws-course-voice';

@Injectable({ providedIn: 'root' })
export class ReaderService {
  readonly groups: TocGroup[] = [
    {
      label: 'Reforço dos simulados',
      items: [
        { id: 'estrategia', title: 'Estratégia de prova' },
        { id: 'visao', title: 'Onde mais se erra' },
        { id: 'wa', title: 'Pilares do Well-Architected' },
        { id: 'vantagens', title: 'Vantagens da nuvem' },
        { id: 'caf', title: 'CAF e suporte operacional' },
        { id: 'compute', title: 'Computação e compra de EC2' },
        { id: 'ml', title: 'IA/ML e atendimento' },
        { id: 'seg', title: 'Segurança e identidade' },
        { id: 'outros', title: 'ELB, CodeDeploy e SMB' },
      ],
    },
    {
      label: 'Bancos de dados e analytics',
      items: [
        { id: 'gerenciado', title: 'Banco gerenciado x banco no EC2' },
        { id: 'familia', title: 'Qual banco para cada caso' },
        { id: 'analytics', title: 'Analytics: Athena, Redshift, QuickSight' },
      ],
    },
    {
      label: 'Migração',
      items: [
        { id: 'estimar', title: 'Antes de migrar: estimar e descobrir' },
        { id: 'mover', title: 'Na migração: mover' },
      ],
    },
    {
      label: 'Redes',
      items: [
        { id: 'firewalls', title: 'Quem filtra o tráfego' },
        { id: 'conectar', title: 'Como conectar redes' },
      ],
    },
    {
      label: 'Guia de serviços',
      items: [
        { id: 'guia-seguranca', title: 'Segurança e proteção' },
        { id: 'guia-redes', title: 'Redes e distribuição global' },
        { id: 'guia-armazenamento', title: 'Armazenamento e nuvem híbrida' },
        { id: 'guia-gestao', title: 'Gestão, custos e otimização' },
      ],
    },
    {
      label: 'Guia CLF-C02 (estudo completo)',
      items: [
        { id: 'dominio-1', title: 'Domínio 1: Conceitos de Nuvem (24%)' },
        { id: 'dominio-2', title: 'Domínio 2: Segurança e Conformidade (30%)' },
        { id: 'dominio-3', title: 'Domínio 3: Tecnologia e Serviços AWS (34%)' },
        { id: 'dominio-4', title: 'Domínio 4: Cobrança, Preços e Suporte (12%)' },
      ],
    },
  ];

  readonly topics: TocItem[] = this.groups.flatMap((group) => group.items);

  readonly activeId = signal('estrategia');
  readonly state = signal<ReaderState>('stopped');
  readonly readingId = signal<string | null>(null);

  readonly supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  /** Vozes disponíveis (português primeiro), carregadas de forma assíncrona pelos navegadores. */
  readonly voices = signal<SpeechSynthesisVoice[]>([]);
  readonly voiceName = signal<string | null>(null);

  readonly stateLabel = computed(() => {
    switch (this.state()) {
      case 'playing':
        return 'Lendo o tópico…';
      case 'paused':
        return 'Leitura pausada';
      default:
        return 'Pronto para ler';
    }
  });

  readonly currentTitle = computed(() => {
    const id = this.state() === 'stopped' ? this.activeId() : (this.readingId() ?? this.activeId());
    return this.topics.find((topic) => topic.id === id)?.title ?? '';
  });

  private session = 0;
  private chunks: string[] = [];
  private topicIndex = 0;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (!this.supported) {
      return;
    }
    this.loadVoices();
    window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
  }

  /** Troca a voz usada na leitura e guarda a escolha no navegador. */
  setVoice(name: string): void {
    const voice = this.voices().find((v) => v.name === name);
    if (!voice) {
      return;
    }
    this.applyVoice(voice);
    try {
      localStorage.setItem(VOICE_STORAGE_KEY, voice.name);
    } catch {
      // modo privado / armazenamento indisponível
    }
  }

  private loadVoices(): void {
    const all = window.speechSynthesis.getVoices();
    if (all.length === 0) {
      return;
    }
    const portuguese = all.filter((v) => v.lang.toLowerCase().startsWith('pt'));
    const voices = this.sortVoices(portuguese.length > 0 ? portuguese : all);
    this.voices.set(voices);

    const current = this.voiceName();
    const selected = voices.find((v) => v.name === current) ?? this.pickDefault(voices);
    if (selected) {
      this.applyVoice(selected);
    }
  }

  /** Natural/neural > nuvem (Google) > local, e pt-BR antes de outros pt. */
  private sortVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
    return [...voices].sort(
      (a, b) => this.voiceScore(b) - this.voiceScore(a) || a.name.localeCompare(b.name),
    );
  }

  private voiceScore(voice: SpeechSynthesisVoice): number {
    const name = voice.name.toLowerCase();
    let score = 0;
    if (name.includes('natural') || name.includes('online')) score += 100;
    if (name.includes('neural')) score += 60;
    if (name.includes('google')) score += 10;
    if (voice.lang.toLowerCase() === 'pt-br') score += 5;
    if (voice.localService) score += 1;
    return score;
  }

  private pickDefault(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(VOICE_STORAGE_KEY);
    } catch {
      stored = null;
    }
    return (stored && voices.find((v) => v.name === stored)) || voices[0] || null;
  }

  private applyVoice(voice: SpeechSynthesisVoice): void {
    this.voice = voice;
    this.voiceName.set(voice.name);
  }

  /** Usado pelo scroll-spy: apenas destaca o tópico visível. */
  setActive(id: string): void {
    if (this.topics.some((topic) => topic.id === id)) {
      this.activeId.set(id);
    }
  }

  /** Usado ao clicar na sidebar: destaca e, se a leitura estiver ativa, passa a ler o tópico. */
  select(id: string): void {
    this.setActive(id);
    if (this.state() === 'playing') {
      const index = this.indexOf(id);
      if (index >= 0) {
        this.readTopic(index);
      }
    }
  }

  toggle(): void {
    switch (this.state()) {
      case 'playing':
        this.pause();
        break;
      case 'paused':
        this.resume();
        break;
      default:
        this.play();
    }
  }

  play(): void {
    if (!this.supported || this.state() !== 'stopped') {
      return;
    }
    const index = this.indexOf(this.activeId());
    if (index >= 0) {
      this.readTopic(index);
    }
  }

  pause(): void {
    if (!this.supported || this.state() !== 'playing') {
      return;
    }
    window.speechSynthesis.pause();
    this.state.set('paused');
  }

  resume(): void {
    if (!this.supported || this.state() !== 'paused') {
      return;
    }
    window.speechSynthesis.resume();
    this.state.set('playing');
  }

  stop(): void {
    this.session++;
    if (this.supported) {
      window.speechSynthesis.cancel();
    }
    this.chunks = [];
    this.state.set('stopped');
    this.readingId.set(null);
  }

  next(): void {
    this.move(1);
  }

  previous(): void {
    this.move(-1);
  }

  private move(delta: number): void {
    const baseId =
      this.state() === 'stopped' ? this.activeId() : (this.readingId() ?? this.activeId());
    const base = this.indexOf(baseId);
    const target = Math.min(Math.max(base + delta, 0), this.topics.length - 1);
    const topic = this.topics[target];
    if (!topic) {
      return;
    }
    this.scrollTo(topic.id);
    if (this.state() === 'stopped') {
      this.activeId.set(topic.id);
    } else {
      this.readTopic(target);
    }
  }

  private readTopic(index: number): void {
    const topic = this.topics[index];
    if (!topic) {
      return;
    }
    const session = ++this.session;
    if (this.supported) {
      window.speechSynthesis.cancel();
    }
    this.activeId.set(topic.id);
    this.readingId.set(topic.id);
    this.scrollTo(topic.id);

    if (!this.supported) {
      return;
    }
    this.topicIndex = index;
    this.chunks = this.splitIntoChunks(this.extractText(topic.id));
    if (this.chunks.length === 0) {
      this.state.set('stopped');
      this.readingId.set(null);
      return;
    }
    this.state.set('playing');
    this.speakChunk(session, 0);
  }

  private speakChunk(session: number, index: number): void {
    if (session !== this.session) {
      return;
    }
    if (index >= this.chunks.length) {
      const next = this.topicIndex + 1;
      if (next < this.topics.length) {
        this.readTopic(next);
      } else {
        this.stop();
      }
      return;
    }
    const utterance = new SpeechSynthesisUtterance(this.chunks[index]);
    utterance.rate = 1;
    if (this.voice) {
      utterance.voice = this.voice;
      utterance.lang = this.voice.lang;
    } else {
      utterance.lang = 'pt-BR';
    }
    utterance.onend = () => {
      if (session === this.session) {
        this.speakChunk(session, index + 1);
      }
    };
    utterance.onerror = (event) => {
      if (session !== this.session) {
        return;
      }
      if (event.error === 'interrupted' || event.error === 'canceled') {
        return;
      }
      this.stop();
    };
    window.speechSynthesis.speak(utterance);
  }

  private extractText(id: string): string {
    const el = document.getElementById(id);
    if (!el) {
      return '';
    }
    const text = el.innerText ?? el.textContent ?? '';
    return text
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /** Divide em blocos curtos: o Chrome encerra falas longas após ~15 s. */
  private splitIntoChunks(text: string): string[] {
    const pieces = text.split(/(?<=[.!?…;:])\s+/);
    const chunks: string[] = [];
    let buffer = '';
    const flush = () => {
      if (buffer.trim()) {
        chunks.push(buffer.trim());
      }
      buffer = '';
    };
    for (const piece of pieces) {
      const sentence = piece.trim();
      if (!sentence) {
        continue;
      }
      if (sentence.length > MAX_CHUNK_LENGTH) {
        flush();
        chunks.push(...this.splitLongPiece(sentence));
        continue;
      }
      if (buffer.length + sentence.length + 1 > MAX_CHUNK_LENGTH) {
        flush();
      }
      buffer = buffer ? `${buffer} ${sentence}` : sentence;
    }
    flush();
    return chunks;
  }

  private splitLongPiece(piece: string): string[] {
    const words = piece.split(/\s+/);
    const out: string[] = [];
    let buffer = '';
    for (const word of words) {
      if (buffer.length + word.length + 1 > MAX_CHUNK_LENGTH) {
        if (buffer) {
          out.push(buffer);
        }
        buffer = word;
      } else {
        buffer = buffer ? `${buffer} ${word}` : word;
      }
    }
    if (buffer) {
      out.push(buffer);
    }
    return out;
  }

  private indexOf(id: string): number {
    return this.topics.findIndex((topic) => topic.id === id);
  }

  private scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
