/**
 * Magenta.js 통합 모듈
 * 기능화성 이론과 AI 생성의 하이브리드 시스템
 */

import type { HarmonicState } from './harmony';
import { generateChordFromHarmony } from './harmony';
import * as Tonal from 'tonal';

// Magenta.js는 동적 import로 로드
let MusicRNN: any = null;
let MusicVAE: any = null;
let modelLoaded = false;

interface MagentaConfig {
  useAI: boolean;
  temperature: number; // 0.0 (보수적) ~ 1.0 (창의적)
  modelUrl?: string;
}

const DEFAULT_CONFIG: MagentaConfig = {
  useAI: false, // 기본값: AI 비활성화 (기능화성 이론만 사용)
  temperature: 0.5,
  modelUrl: 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv',
};

/**
 * Magenta.js 모델 로드
 */
async function loadMagentaModel(config: MagentaConfig = DEFAULT_CONFIG) {
  if (modelLoaded || !config.useAI) return;
  
  try {
    // MusicRNN만 직접 import하여 ddsp/tone 의존성 문제 회피
    const musicRnnModule = await import('@magenta/music/esm/music_rnn');
    MusicRNN = musicRnnModule.MusicRNN;
    // MusicVAE는 일단 제외 (필요시 나중에 추가)
    // MusicVAE = magenta.MusicVAE;
    
    // 모델 초기화
    const rnn = new MusicRNN(config.modelUrl || DEFAULT_CONFIG.modelUrl!);
    await rnn.initialize();
    
    modelLoaded = true;
    console.log('[Magenta] Model loaded and initialized (MusicRNN only)');
  } catch (error) {
    console.error('[Magenta] Failed to load model:', error);
    // AI 실패해도 기본 시스템은 작동하도록
    modelLoaded = false;
    MusicRNN = null;
  }
}

/**
 * Tonal.js 코드를 Magenta.js 시퀀스로 변환
 */
function chordToMagentaSequence(
  chord: Array<{ freq: number; gain: number }>,
  startTime: number = 0,
  duration: number = 1.0
): any {
  // 주파수를 MIDI 노트 번호로 변환
  const midiNotes = chord
    .map(({ freq }) => {
      // A4 = 440Hz = MIDI 69
      const midi = Math.round(12 * Math.log2(freq / 440) + 69);
      return Math.max(0, Math.min(127, midi));
    })
    .filter((note, idx, arr) => arr.indexOf(note) === idx); // 중복 제거
  
  return {
    pitches: midiNotes,
    startTime,
    endTime: startTime + duration,
  };
}

/**
 * Magenta.js 시퀀스를 주파수 배열로 변환
 */
function magentaSequenceToFrequencies(sequence: any[]): Array<{ freq: number; gain: number }> {
  return sequence.map((note: any) => {
    if (!note.pitches || note.pitches.length === 0) {
      return { freq: 261.63, gain: 0.5 }; // 폴백: C
    }
    
    // MIDI를 주파수로 변환 (첫 번째 피치 사용)
    const midi = note.pitches[0];
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    
    return {
      freq: Number(freq.toFixed(2)),
      gain: 0.5,
    };
  });
}

/**
 * 하이브리드 화성 생성: 기능화성 이론 + AI
 */
export async function generateHybridHarmony(
  harmony: HarmonicState,
  config: MagentaConfig = DEFAULT_CONFIG
): Promise<Array<{ freq: number; gain: number }>> {
  // 1. 기본: Tonal.js로 화성 생성
  const baseChord = generateChordFromHarmony(harmony);
  
  // 2. AI 비활성화 또는 모델 미로드 시 기본 화성 반환
  if (!config.useAI || !modelLoaded) {
    return baseChord;
  }
  
  try {
    // 3. AI로 자연스러운 변형 생성
    await loadMagentaModel(config);
    
    if (!MusicRNN) {
      return baseChord; // 폴백
    }
    
    // 기본 화성을 Magenta.js 시퀀스로 변환
    const initialSequence = chordToMagentaSequence(baseChord, 0, 1.0);
    
    // AI로 화성 진행 확장
    const continuation = await MusicRNN.continueSequence(
      [initialSequence],
      2, // 추가 생성 길이
      config.temperature
    );
    
    // 결과를 주파수로 변환
    const aiChords = magentaSequenceToFrequencies(continuation);
    
    // 기본 화성 + AI 생성 화성 결합
    return [...baseChord, ...aiChords].slice(0, 4); // 최대 4개 코드
  } catch (error) {
    console.error('[Magenta] Error in hybrid generation:', error);
    return baseChord; // 폴백: 기본 화성
  }
}

/**
 * 브릿지 도달 시 특별한 화성 생성
 */
export async function generateBridgeHarmony(
  bridgeNote: string,
  targetNote: string,
  config: MagentaConfig = DEFAULT_CONFIG
): Promise<Array<{ freq: number; gain: number }>> {
  if (!config.useAI || !modelLoaded) {
    // 기본: Tonal.js로 브릿지 화성 생성
    const bridgeKey = Tonal.Key.majorKey(bridgeNote);
    const targetKey = Tonal.Key.majorKey(targetNote);
    
    // 간단한 브릿지 화성
    const bridgeChord = Tonal.Chord.get(`${bridgeNote}maj`);
    const targetChord = Tonal.Chord.get(`${targetNote}maj`);
    
    return [
      ...(bridgeChord.notes || []).slice(0, 3).map(note => ({
        freq: Tonal.Note.freq(`${note}4`) || 261.63,
        gain: 0.5,
      })),
      ...(targetChord.notes || []).slice(0, 3).map(note => ({
        freq: Tonal.Note.freq(`${note}4`) || 261.63,
        gain: 0.4,
      })),
    ];
  }
  
  // AI로 더 자연스러운 브릿지 생성
  try {
    await loadMagentaModel(config);
    
    // 브릿지 → 목표 전조 시퀀스 생성
    const bridgeSequence = chordToMagentaSequence(
      [{ freq: Tonal.Note.freq(`${bridgeNote}4`) || 261.63, gain: 0.5 }],
      0,
      1.0
    );
    
    const continuation = await MusicRNN.continueSequence(
      [bridgeSequence],
      3,
      config.temperature
    );
    
    return magentaSequenceToFrequencies(continuation);
  } catch (error) {
    console.error('[Magenta] Error in bridge generation:', error);
    // 폴백
    return [
      { freq: Tonal.Note.freq(`${bridgeNote}4`) || 261.63, gain: 0.5 },
      { freq: Tonal.Note.freq(`${targetNote}4`) || 261.63, gain: 0.4 },
    ];
  }
}

/**
 * 전조 성공 시 확장 화성 생성 (7화음, 9화음 등)
 */
export async function generateExtendedHarmony(
  harmony: HarmonicState,
  config: MagentaConfig = DEFAULT_CONFIG
): Promise<Array<{ freq: number; gain: number }>> {
  // 기본 화성
  const baseChord = generateChordFromHarmony(harmony);
  
  if (!config.useAI || !modelLoaded) {
    // Tonal.js로 확장 코드 생성 (7화음)
    try {
      const keyInfo = Tonal.Key.majorKey(harmony.key);
      const romanNumeral = harmony.progression[0] || 'I';
      const roman = Tonal.RomanNumeral.get(romanNumeral);
      
      if (roman && roman.chord) {
        const extendedChord = Tonal.Chord.get(`${harmony.key}${roman.chord}7`);
        if (extendedChord && extendedChord.notes) {
          return extendedChord.notes.slice(0, 4).map(note => ({
            freq: Tonal.Note.freq(`${note}4`) || 261.63,
            gain: 0.5 - (extendedChord.notes.indexOf(note) * 0.1),
          }));
        }
      }
    } catch {
      // 폴백
    }
    
    return baseChord;
  }
  
  // AI로 더 풍부한 화성 생성
  try {
    await loadMagentaModel(config);
    
    const initialSequence = chordToMagentaSequence(baseChord, 0, 1.0);
    const continuation = await MusicRNN.continueSequence(
      [initialSequence],
      4,
      config.temperature * 0.8 // 약간 더 보수적으로
    );
    
    const extended = magentaSequenceToFrequencies(continuation);
    return [...baseChord, ...extended].slice(0, 5); // 최대 5음
  } catch (error) {
    console.error('[Magenta] Error in extended generation:', error);
    return baseChord;
  }
}

/**
 * 환경 변수 기반 설정
 */
export function getMagentaConfig(): MagentaConfig {
  const useAI = process.env.NEXT_PUBLIC_USE_MAGENTA_AI === 'true';
  const temperature = Number(process.env.NEXT_PUBLIC_MAGENTA_TEMPERATURE || '0.5');
  
  return {
    useAI,
    temperature: Math.max(0, Math.min(1, temperature)),
  };
}

