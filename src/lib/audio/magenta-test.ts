/**
 * Magenta.js 프로토타입 테스트
 * 기능화성 이론과 AI 생성의 결합 가능성 확인
 */

// Magenta.js는 동적 import로 로드 (초기 번들 크기 최적화)
let MusicRNN: any = null;
let modelLoaded = false;

async function loadMagentaModel() {
  if (modelLoaded) return;
  
  try {
    // MusicRNN만 직접 import하여 ddsp/tone 의존성 문제 회피
    // @magenta/music/esm/music_rnn에서 직접 import
    const musicRnnModule = await import('@magenta/music/esm/music_rnn');
    MusicRNN = musicRnnModule.MusicRNN;
    modelLoaded = true;
    console.log('[Magenta] MusicRNN loaded successfully (direct import)');
  } catch (error) {
    console.error('[Magenta] Failed to load MusicRNN directly:', error);
    // 최종 폴백: MusicRNN 없이 진행 (Tonal.js만 사용)
    console.warn('[Magenta] Continuing without AI, using Tonal.js only');
    modelLoaded = false;
    MusicRNN = null;
  }
}

/**
 * Tonal.js 화성 진행을 Magenta.js NoteSequence로 변환
 */
async function createQuantizedNoteSequence(
  chords: Array<{ freq: number; gain: number }>,
  stepsPerQuarter: number = 4
): Promise<any> {
  // NoteSequence와 quantize 함수 import
  const { NoteSequence } = await import('@magenta/music/esm/protobuf/index');
  const { quantizeNoteSequence } = await import('@magenta/music/esm/core/sequences');
  
  // NoteSequence 생성
  const ns = NoteSequence.create({
    notes: [],
    tempos: [{ time: 0, qpm: 120 }],
    timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
    totalTime: chords.length * 1.0, // 각 코드가 1초
  });
  
  // 각 코드를 NoteSequence의 notes로 변환
  chords.forEach((chord, index) => {
    // 주파수를 MIDI 노트 번호로 변환
    const midi = Math.round(12 * Math.log2(chord.freq / 440) + 69);
    const midiNote = Math.max(0, Math.min(127, midi));
    
    // NoteSequence에 note 추가
    ns.notes.push({
      pitch: midiNote,
      startTime: index * 1.0,
      endTime: (index + 1) * 1.0,
      velocity: 80,
      instrument: 0,
      program: 0,
      isDrum: false,
    });
  });
  
  // Quantize
  const quantized = quantizeNoteSequence(ns, stepsPerQuarter);
  return quantized;
}

/**
 * Magenta.js로 화성 진행 생성 (프로토타입)
 */
export async function generateHarmonicProgressionWithAI(
  key: string,
  mode: 'major' | 'minor',
  baseProgression: string[], // Tonal.js에서 계산한 로마 숫자 진행
  length: number = 4
): Promise<Array<{ freq: number; gain: number }>> {
  try {
    // 모델 로드
    await loadMagentaModel();
    
    // MusicRNN이 로드되지 않았으면 Tonal.js만 사용
    if (!MusicRNN) {
      console.log('[Magenta] Using Tonal.js only (AI not available)');
      // Tonal.js로 기본 화성 반환
      return baseProgression.map(() => ({
        freq: 261.63,
        gain: 0.5,
      }));
    }
    
    // 모델 초기화
    const rnn = new MusicRNN(
      'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv'
    );
    await rnn.initialize();
    
    // 최소한의 초기 시퀀스 생성 (첫 번째 코드만 포함)
    // 빈 시퀀스는 모델이 처리하지 못할 수 있음
    const { NoteSequence } = await import('@magenta/music/esm/protobuf/index');
    const { quantizeNoteSequence } = await import('@magenta/music/esm/core/sequences');
    
    // 첫 번째 코드만 포함한 초기 시퀀스
    const firstChord = chordProgression[0] || 'C';
    // 간단한 코드: C = C4 (60), E4 (64), G4 (67)
    const chordNotes: Record<string, number[]> = {
      'C': [60, 64, 67],
      'F': [53, 57, 60],
      'G': [55, 59, 62],
      'Am': [57, 60, 64],
      'Dm': [50, 53, 57],
      'Em': [52, 55, 59],
    };
    const pitches = chordNotes[firstChord] || [60, 64, 67]; // 기본: C
    
    const initialNs = NoteSequence.create({
      notes: pitches.map((pitch, idx) => ({
        pitch,
        startTime: 0,
        endTime: 1.0, // 1 beat
        velocity: 80,
        instrument: 0,
        program: 0,
        isDrum: false,
      })),
      tempos: [{ time: 0, qpm: 120 }],
      timeSignatures: [{ time: 0, numerator: 4, denominator: 4 }],
      totalTime: 1.0, // 1 beat
    });
    
    const initialSequence = quantizeNoteSequence(initialNs, 4);
    
    console.log('[Magenta] Initial sequence:', {
      totalTime: initialSequence.totalTime,
      notesCount: initialSequence.notes?.length || 0,
      firstChord,
      pitches,
    });
    
    // 로마 숫자를 실제 코드 이름으로 변환 (chord progression)
    // 예: ['I', 'IV', 'V', 'I'] -> ['C', 'F', 'G', 'C']
    const chordProgression = baseProgression.map(roman => {
      // 간단한 변환 (C Major 기준)
      const chordMap: Record<string, string> = {
        'I': 'C',
        'ii': 'Dm',
        'II': 'D',
        'iii': 'Em',
        'III': 'E',
        'IV': 'F',
        'iv': 'Fm',
        'V': 'G',
        'v': 'Gm',
        'vi': 'Am',
        'VI': 'A',
        'vii': 'Bdim',
        'VII': 'B',
      };
      return chordMap[roman] || 'C';
    });
    
    // steps 계산: length는 코드 개수, steps는 quantized steps
    // stepsPerQuarter = 4이므로, 1 beat = 4 steps
    // 초기 시퀀스가 1 beat이므로, (length - 1) * 4 steps 추가 생성
    const steps = (length - 1) * 4; // 나머지 코드들을 생성
    
    console.log('[Magenta] Generating continuation:', {
      steps,
      length,
      chordProgression,
    });
    
    // AI로 화성 진행 생성 (chord progression 포함)
    const continuation = await rnn.continueSequence(
      initialSequence,
      steps, // quantized steps
      0.5, // temperature (0.0 = 보수적, 1.0 = 창의적)
      chordProgression // chord progression 추가
    );
    
    const initialTotalTime = initialSequence.totalTime || 0;
    const initialNotesCount = initialSequence.notes?.length || 0;
    
    console.log('[Magenta] Continuation received:', {
      totalNotes: continuation.notes?.length || 0,
      totalTime: continuation.totalTime,
      initialTotalTime,
      initialNotesCount,
      notes: continuation.notes?.slice(0, 10), // 처음 10개만 로그
    });
    
    // Magenta.js 결과를 주파수로 변환
    // continuation은 NoteSequence 객체 (initialSequence + 새로 생성된 notes)
    // initialSequence의 totalTime 이후의 notes만 사용
    const newNotes = (continuation.notes || []).filter((note: any) => {
      const noteTime = note.startTime || 0;
      return noteTime >= initialTotalTime;
    });
    
    console.log('[Magenta] New notes after filtering:', {
      newNotesCount: newNotes.length,
      newNotes: newNotes.slice(0, 10),
    });
    
    // 각 시간대별로 그룹화하여 코드 추출
    const timeGroups = new Map<number, number[]>();
    newNotes.forEach((note: any) => {
      // quantizedStartStep 또는 startTime 사용
      const time = note.quantizedStartStep !== undefined 
        ? note.quantizedStartStep 
        : Math.floor((note.startTime || 0) * 4); // stepsPerQuarter = 4 기준
      
      if (!timeGroups.has(time)) {
        timeGroups.set(time, []);
      }
      timeGroups.get(time)!.push(note.pitch);
    });
    
    // 시간 순서대로 정렬
    const sortedTimes = Array.from(timeGroups.keys()).sort((a, b) => a - b);
    
    // 각 시간대의 첫 번째 음을 주파수로 변환
    const result = sortedTimes
      .slice(0, length) // 요청한 길이만큼
      .map((time) => {
        const pitches = timeGroups.get(time)!;
        const midi = pitches[0]; // 첫 번째 음 사용
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        return {
          freq: Number(freq.toFixed(2)),
          gain: 0.5,
        };
      });
    
    // 결과가 비어있으면 폴백
    if (result.length === 0) {
      console.warn('[Magenta] No notes generated, using fallback');
      return baseChords.slice(0, length);
    }
    
    console.log('[Magenta] Final result:', result);
    
    return result;
  } catch (error) {
    console.error('[Magenta] Error generating progression:', error);
    // 폴백: 기본 화성 반환
    return [
      { freq: 261.63, gain: 0.5 }, // C
      { freq: 329.63, gain: 0.4 }, // E
      { freq: 392.00, gain: 0.3 }, // G
    ];
  }
}

/**
 * 간단한 테스트 함수
 * AI가 실패해도 Tonal.js로 기본 화성 반환
 */
export async function testMagentaIntegration() {
  console.log('[Magenta] Starting test...');
  
  try {
    const result = await generateHarmonicProgressionWithAI(
      'C',
      'major',
      ['I', 'IV', 'V', 'I'],
      4
    );
    
    console.log('[Magenta] Generated progression:', result);
    return {
      success: true,
      data: result,
      aiEnabled: MusicRNN !== null,
    };
  } catch (error) {
    console.error('[Magenta] Test failed:', error);
    // 폴백: Tonal.js 기본 화성
    return {
      success: true,
      data: [
        { freq: 261.63, gain: 0.5 }, // C
        { freq: 329.63, gain: 0.4 }, // E
        { freq: 392.00, gain: 0.3 }, // G
      ],
      aiEnabled: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

