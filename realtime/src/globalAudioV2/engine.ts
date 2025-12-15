import type { AudioGlobalV2Payload, PlayerLike } from "./types";
import { GlobalSignalsComputer } from "./signals.js";
import { GlobalMappingEvaluator } from "./mapping.js";
import { GlobalSequencer } from "./sequencer.js";

export class GlobalAudioV2Engine {
  private readonly world: { width: number; height: number };
  private readonly signalsComputer: GlobalSignalsComputer;
  private readonly mapping: GlobalMappingEvaluator | null;
  private readonly sequencer: GlobalSequencer;
  private lastTimeMs: number | null = null;

  constructor(options: {
    world: { width: number; height: number };
    innerRadius?: number;
    pulsarDurationSec?: number;
    entropyMaxSpeed?: number;
  }) {
    this.world = options.world;
    this.signalsComputer = new GlobalSignalsComputer({
      innerRadius: options.innerRadius,
      pulsarDurationSec: options.pulsarDurationSec,
      entropyMaxSpeed: options.entropyMaxSpeed,
    });
    this.sequencer = new GlobalSequencer({ key: "C", mode: "major" });
    try {
      this.mapping = GlobalMappingEvaluator.loadDefaultFromAssets();
    } catch (e) {
      console.warn("[GlobalAudioV2] Failed to load mappings, continuing:", e);
      this.mapping = null;
    }
  }

  step(players: PlayerLike[], nowMs: number): AudioGlobalV2Payload {
    // 파라미터는 클라이언트에서 클러스터 기반으로 계산하므로 제거
    // 시퀀서만 전송 (화성학 로직 기반)
    const { grids } = this.sequencer.update(players);

    return {
      version: 1,
      t: nowMs,
      signals: {
        entropy: 0,
        rmsVelocity: 0,
        particleCount: players.length,
        clusterCount: 0,
        inInnerPulsar: 0,
        outInnerPulsar: 0,
      },
      params: [], // 클라이언트에서 계산
      sequencer: {
        nodeIds: this.sequencer.nodeIds,
        grids,
      },
    };
  }

  /**
   * 현재 조성 정보 반환 (화성 호환성 계산용)
   */
  getCurrentHarmony() {
    return this.sequencer.getCurrentHarmony();
  }
}
