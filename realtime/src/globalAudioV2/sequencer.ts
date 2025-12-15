import type {
  GlobalSequencerGrids,
  GlobalSequencerNodeIds,
  MonoSeqGrid,
  PlayerLike,
} from "./types";
import { noteIndexFromId } from "./hash.js";
import {
  computeHarmonicProgression,
  computeNoteClusters,
  createInitialHarmony,
  type HarmonicState,
  type NoteCluster,
} from "../harmony.js";
import * as Tonal from "tonal";

export type Voice = "bass" | "baritone" | "tenor";
export type GlobalAssignment = { voice: Voice; column: number };

const VOICES: Voice[] = ["bass", "baritone", "tenor"];

const makeEmptyGrid = (): MonoSeqGrid =>
  Array.from({ length: 12 }, () => new Array(12).fill(0));

const randomPick = <T>(arr: T[]): T | null => {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)] ?? null;
};

// 12톤 인덱스를 음표 이름으로 변환
const toneIndexToNote = (index: number): string => {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return notes[index % 12] ?? "C";
};

// 로마 숫자를 코드 구성음으로 변환 (Tonal.js Progression API 활용)
const romanNumeralToChordNotes = (
  romanNumeral: string,
  key: string,
  mode: "major" | "minor"
): string[] => {
  try {
    // Tonal.js Progression API 사용 (더 정확한 코드 계산)
    const keyName = `${key} ${mode}`;
    const progression = Tonal.Progression.fromRomanNumerals(keyName, [romanNumeral]);
    
    if (progression && progression.length > 0) {
      const chordSymbol = progression[0];
      if (chordSymbol) {
        const chord = Tonal.Chord.get(chordSymbol);
        if (chord && chord.notes && chord.notes.length > 0) {
          // 트라이어드만 반환 (필요시 7th, 9th 등 확장 가능)
          return chord.notes.slice(0, 3);
        }
      }
    }
    
    // 폴백: 기존 로직 사용
    const scale =
      mode === "major"
        ? Tonal.Scale.get(`${key} major`).notes
        : Tonal.Scale.get(`${key} minor`).notes;

    if (!scale || scale.length === 0) return [];

    const romanToIndex: Record<string, number> = {
      I: 0,
      i: 0,
      II: 1,
      ii: 1,
      III: 2,
      iii: 2,
      IV: 3,
      iv: 3,
      V: 4,
      v: 4,
      VI: 5,
      vi: 5,
      VII: 6,
      vii: 6,
    };

    const rootIndex = romanToIndex[romanNumeral];
    if (rootIndex === undefined) return [];

    const rootNote = scale[rootIndex % scale.length];
    const isMinor =
      romanNumeral === romanNumeral.toLowerCase() || mode === "minor";
    const chordType = isMinor ? "m" : "";
    const chord = Tonal.Chord.get(`${rootNote}${chordType}`);

    if (!chord || !chord.notes || chord.notes.length === 0) return [];

    return chord.notes.slice(0, 3); // 트라이어드만
  } catch {
    return [];
  }
};

// 음표를 12톤 인덱스로 변환
const noteTo12ToneIndex = (note: string): number => {
  try {
    let normalizedNote = note;
    if (normalizedNote === "BB" || normalizedNote === "bb") {
      normalizedNote = "Bb";
    }
    const chroma = Tonal.Note.chroma(normalizedNote);
    return chroma !== null && chroma !== undefined ? chroma : 0;
  } catch {
    return 0;
  }
};

export class GlobalSequencer {
  readonly nodeIds: GlobalSequencerNodeIds = {
    bass: "211",
    baritone: "212",
    tenor: "213",
  };

  private currentHarmony: HarmonicState = createInitialHarmony();

  constructor(options?: { key?: string; mode?: string }) {
    // 초기화는 createInitialHarmony에서 처리됨
  }

  /**
   * Update using harmony.ts logic and build current grids.
   */
  update(players: PlayerLike[]): { grids: GlobalSequencerGrids } {
    // 플레이어를 NoteCluster 형식으로 변환
    const noteIndexById = new Map<string, number>();
    for (const p of players) {
      noteIndexById.set(p.id, noteIndexFromId(p.id));
    }

    // assignedNote와 activity 정보를 가진 플레이어 배열 생성
    const playersWithNotes = players.map((p) => {
      const noteIndex = noteIndexById.get(p.id) ?? 0;
      const assignedNote = toneIndexToNote(noteIndex);
      // 간단한 activity 계산 (속도 기반)
      const activityScore = Math.min(1, Math.hypot(p.vx, p.vy) / 320);
      return {
        id: p.id,
        assignedNote,
        activityScore,
        clusterDuration: 1000, // 기본값
      };
    });

    // NoteCluster 계산
    const noteClusters = computeNoteClusters(playersWithNotes);

    // 화성 진행 계산
    this.currentHarmony = computeHarmonicProgression(
      noteClusters,
      this.currentHarmony
    );

    // 화성 진행을 MonoSeq 그리드로 변환
    const grids = this.buildGridsFromHarmony();
    return { grids };
  }

  private buildGridsFromHarmony(): GlobalSequencerGrids {
    const bass = makeEmptyGrid();
    const baritone = makeEmptyGrid();
    const tenor = makeEmptyGrid();

    const key = this.currentHarmony.currentKey;
    const mode = this.currentHarmony.currentMode;
    const progression = this.currentHarmony.progression;

    if (!progression || progression.length === 0) {
      // 기본: C Major I
      const notes = ["C", "E", "G"];
      const bassNote = noteTo12ToneIndex(notes[0] ?? "C");
      const baritoneNote = noteTo12ToneIndex(notes[1] ?? "E");
      const tenorNote = noteTo12ToneIndex(notes[2] ?? "G");
      // 여러 스텝에 걸쳐 패턴 배치
      const steps = [0, 3, 6, 9];
      for (const step of steps) {
        if (step < 12) {
          bass[step]![bassNote] = 1;
          baritone[step]![baritoneNote] = 1;
          tenor[step]![tenorNote] = 1;
        }
      }
      return { bass, baritone, tenor };
    }

    // progression의 여러 코드를 시퀀서의 여러 스텝에 배치
    const NUM_STEPS = 12;
    
    if (progression.length === 1) {
      // progression이 1개 코드만 있으면 여러 스텝에 반복 배치 (4/4 박자 느낌)
      const romanNumeral = progression[0];
      const chordNotes = romanNumeralToChordNotes(romanNumeral, key, mode);
      if (chordNotes.length > 0) {
        const bassNote = noteTo12ToneIndex(chordNotes[0] ?? "C");
        const baritoneNote = noteTo12ToneIndex(chordNotes[1] ?? "E");
        const tenorNote = noteTo12ToneIndex(chordNotes[2] ?? "G");
        // 4/4 박자 느낌으로 배치
        const steps = [0, 3, 6, 9];
        for (const step of steps) {
          if (step < NUM_STEPS) {
            bass[step]![bassNote] = 1;
            baritone[step]![baritoneNote] = 1;
            tenor[step]![tenorNote] = 1;
          }
        }
      }
    } else {
      // progression이 여러 코드면 각 코드를 시퀀서의 다른 스텝에 배치
      const stepsPerChord = Math.floor(NUM_STEPS / progression.length);
      
      for (let progIdx = 0; progIdx < progression.length; progIdx += 1) {
        const romanNumeral = progression[progIdx];
        if (!romanNumeral) continue;
        
        const chordNotes = romanNumeralToChordNotes(romanNumeral, key, mode);
        if (chordNotes.length === 0) continue;
        
        // Tonal.js를 활용하여 코드의 다양한 voicing 사용
        const rootNote = chordNotes[0];
        const thirdNote = chordNotes[1] ?? rootNote;
        const fifthNote = chordNotes[2] ?? rootNote;
        
        const bassNote = noteTo12ToneIndex(rootNote ?? "C");
        const baritoneNote = noteTo12ToneIndex(thirdNote ?? "E");
        const tenorNote = noteTo12ToneIndex(fifthNote ?? "G");
        
        // 각 코드를 해당 스텝에 배치
        const step = progIdx * stepsPerChord;
        if (step < NUM_STEPS) {
          bass[step]![bassNote] = 1;
          baritone[step]![baritoneNote] = 1;
          tenor[step]![tenorNote] = 1;
        }
      }
    }

    return { bass, baritone, tenor };
  }

  /**
   * 현재 조성 정보 반환 (화성 호환성 계산용)
   */
  getCurrentHarmony(): HarmonicState {
    return this.currentHarmony;
  }
}
