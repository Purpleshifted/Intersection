/**
 * Web Audio API 기반 화이트 노이즈 필터 공간음향
 * NoiseCraft와 별개로 브라우저에서 직접 생성
 */

import type { GameState, PlayerSnapshot } from "@/types/game";
import { noteToFrequency } from "./noteToNoiseCraft";

const VISUAL_FEEDBACK_DISTANCE = 200; // 비주얼 피드백 범위
const SPATIAL_AUDIO_DISTANCE = VISUAL_FEEDBACK_DISTANCE * 3; // 600px
const MAX_NEIGHBORS = 4; // 최대 4명까지 처리

interface SpatialAudioNode {
  noiseNode: AudioBufferSourceNode | null;
  filterNode: BiquadFilterNode | null;
  gainNode: GainNode | null;
  pannerNode: StereoPannerNode | null;
}

class WebAudioSpatialManager {
  private audioContext: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private spatialNodes: Map<string, SpatialAudioNode> = new Map();
  private isInitialized = false;

  /**
   * AudioContext 초기화 및 화이트 노이즈 버퍼 생성
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 화이트 노이즈 버퍼 생성 (1초 길이)
      const sampleRate = this.audioContext.sampleRate;
      const bufferLength = sampleRate; // 1초
      this.noiseBuffer = this.audioContext.createBuffer(1, bufferLength, sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      
      // 화이트 노이즈 생성 (랜덤 값)
      for (let i = 0; i < bufferLength; i++) {
        data[i] = Math.random() * 2 - 1; // -1 ~ 1
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[WebAudioSpatial] Initialization error:', error);
    }
  }

  /**
   * 상대방의 assignedNote 기반 필터 공간음향 업데이트
   */
  updateSpatialAudio(state: GameState): void {
    if (!this.audioContext || !this.noiseBuffer || this.audioContext.state === 'closed') {
      return;
    }

    const selfId = state.selfId;
    if (!selfId) {
      this.clearAll();
      return;
    }

    const selfPlayer = state.players[selfId];
    if (!selfPlayer) {
      this.clearAll();
      return;
    }

    const { position: selfPos } = selfPlayer.cell;

    // SPATIAL_AUDIO_DISTANCE (600px) 안의 모든 상대방 찾기
    const others = Object.values(state.players)
      .filter((p) => p.id !== selfId && p.assignedNote)
      .map((p) => {
        const dx = p.cell.position.x - selfPos.x;
        const dy = p.cell.position.y - selfPos.y;
        const dist = Math.hypot(dx, dy);
        return { player: p, dx, dy, dist };
      })
      .filter(({ dist }) => dist < SPATIAL_AUDIO_DISTANCE)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, MAX_NEIGHBORS);

    // 기존 노드 중 제거할 것들 찾기
    const activePlayerIds = new Set(others.map(({ player }) => player.id));
    for (const [playerId, node] of this.spatialNodes.entries()) {
      if (!activePlayerIds.has(playerId)) {
        this.removeSpatialNode(playerId);
      }
    }

    // 각 상대방에 대해 필터 노드 생성/업데이트
    others.forEach(({ player, dx, dy, dist }, index) => {
      if (!player.assignedNote) return;

      const playerId = player.id;
      let spatialNode = this.spatialNodes.get(playerId);

      if (!spatialNode) {
        // 새 노드 생성
        spatialNode = this.createSpatialNode(playerId);
        this.spatialNodes.set(playerId, spatialNode);
      }

      // assignedNote를 주파수로 변환
      const frequency = noteToFrequency(player.assignedNote, 4);

      // 거리 기반 게인 (가까울수록 크게)
      const maxDistance = SPATIAL_AUDIO_DISTANCE;
      const gain = dist >= maxDistance ? 0 : Math.max(0.1, 1 - (dist / maxDistance));

      // 방향 계산 (팬용)
      const angle = Math.atan2(dy, dx); // -π ~ π
      const pan = Math.max(-1, Math.min(1, angle / Math.PI)); // -1 (왼쪽) ~ 1 (오른쪽)

      // 필터 중심 주파수 설정
      if (spatialNode.filterNode) {
        spatialNode.filterNode.frequency.value = frequency;
        spatialNode.filterNode.Q.value = 5; // 공명
      }

      // 게인 설정
      if (spatialNode.gainNode) {
        spatialNode.gainNode.gain.value = gain * 0.6; // 전체 볼륨 조절 (0.3 -> 0.6으로 증가)
      }

      // 팬 설정
      if (spatialNode.pannerNode) {
        spatialNode.pannerNode.pan.value = pan;
      }
    });
  }

  /**
   * 공간음향 노드 생성
   */
  private createSpatialNode(playerId: string): SpatialAudioNode {
    if (!this.audioContext || !this.noiseBuffer) {
      return { noiseNode: null, filterNode: null, gainNode: null, pannerNode: null };
    }

    // 화이트 노이즈 소스
    const noiseNode = this.audioContext.createBufferSource();
    noiseNode.buffer = this.noiseBuffer;
    noiseNode.loop = true;

    // 필터 (assignedNote 주파수 대역 통과)
    const filterNode = this.audioContext.createBiquadFilter();
    filterNode.type = 'bandpass'; // 밴드패스 필터
    filterNode.frequency.value = 440; // 기본값
    filterNode.Q.value = 5;

    // 게인
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;

    // 스테레오 팬
    const pannerNode = this.audioContext.createStereoPanner();
    pannerNode.pan.value = 0;

    // 연결: noise -> filter -> gain -> panner -> destination
    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(this.audioContext.destination);

    // 재생 시작
    noiseNode.start(0);

    return { noiseNode, filterNode, gainNode, pannerNode };
  }

  /**
   * 공간음향 노드 제거
   */
  private removeSpatialNode(playerId: string): void {
    const node = this.spatialNodes.get(playerId);
    if (!node) return;

    try {
      if (node.noiseNode) {
        node.noiseNode.stop();
        node.noiseNode.disconnect();
      }
      if (node.filterNode) {
        node.filterNode.disconnect();
      }
      if (node.gainNode) {
        node.gainNode.disconnect();
      }
      if (node.pannerNode) {
        node.pannerNode.disconnect();
      }
    } catch (error) {
      // 이미 disconnected된 경우 무시
    }

    this.spatialNodes.delete(playerId);
  }

  /**
   * 모든 공간음향 노드 제거
   */
  clearAll(): void {
    for (const playerId of this.spatialNodes.keys()) {
      this.removeSpatialNode(playerId);
    }
  }

  /**
   * 정리 (컴포넌트 언마운트 시)
   */
  dispose(): void {
    this.clearAll();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.noiseBuffer = null;
    this.isInitialized = false;
  }
}

// 싱글톤 인스턴스
let spatialManager: WebAudioSpatialManager | null = null;

/**
 * Web Audio 기반 공간음향 초기화 및 업데이트
 */
export async function initializeWebAudioSpatial(): Promise<void> {
  if (!spatialManager) {
    spatialManager = new WebAudioSpatialManager();
  }
  await spatialManager.initialize();
}

/**
 * 공간음향 업데이트
 */
export function updateWebAudioSpatial(state: GameState): void {
  if (!spatialManager) return;
  spatialManager.updateSpatialAudio(state);
}

/**
 * 공간음향 정리
 */
export function disposeWebAudioSpatial(): void {
  if (spatialManager) {
    spatialManager.dispose();
    spatialManager = null;
  }
}

