/**
 * 상대방의 assignedNote 기반 필터 공간음향 생성
 * 비주얼 피드백 범위의 3배 안 상대방에게 필터 기반 공간음향 적용
 */

import type { GameState, PlayerSnapshot } from "@/types/game";
import type { NoiseCraftParam } from "@/lib/audio/noiseCraftCore";
import { noteToFrequency } from "./noteToNoiseCraft";

const VISUAL_FEEDBACK_DISTANCE = 200; // 비주얼 피드백 범위
const SPATIAL_AUDIO_DISTANCE = VISUAL_FEEDBACK_DISTANCE * 3; // 600px

/**
 * 주파수를 필터 중심 주파수로 변환 (노이즈 필터용)
 * assignedNote의 주파수 대역을 필터로 적용
 */
function frequencyToFilterCutoff(frequency: number): number {
  // 필터 중심 주파수를 0-1 범위로 정규화
  // 일반적으로 20Hz ~ 20000Hz 범위
  const minFreq = 20;
  const maxFreq = 20000;
  const normalized = Math.max(0, Math.min(1, (frequency - minFreq) / (maxFreq - minFreq)));
  return normalized;
}

/**
 * 거리 기반 게인 계산 (가까울수록 크게)
 */
function distanceToGain(distance: number, maxDistance: number): number {
  if (distance >= maxDistance) return 0;
  // 거리에 반비례, 최소 0.1 유지
  const normalized = 1 - (distance / maxDistance);
  return Math.max(0.1, normalized);
}

/**
 * 상대방의 assignedNote 기반 필터 공간음향 파라미터 생성
 * 
 * @param state - 게임 상태
 * @returns NoiseCraft 파라미터 배열 (필터, 팬, 게인 등)
 */
export function generateSpatialFilterParams(
  state: GameState
): NoiseCraftParam[] {
  const selfId = state.selfId;
  if (!selfId) return [];
  const selfPlayer = state.players[selfId];
  if (!selfPlayer) return [];

  const { position: selfPos } = selfPlayer.cell;
  const params: NoiseCraftParam[] = [];

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
    .sort((a, b) => a.dist - b.dist); // 가까운 순으로 정렬

  if (others.length === 0) return [];

  // 최대 4명까지 처리 (너무 많으면 오디오가 복잡해짐)
  const maxNeighbors = 4;
  const neighbors = others.slice(0, maxNeighbors);

  neighbors.forEach(({ player, dx, dy, dist }, index) => {
    if (!player.assignedNote) return;

    // assignedNote를 주파수로 변환
    const frequency = noteToFrequency(player.assignedNote, 4);
    const filterCutoff = frequencyToFilterCutoff(frequency);

    // 거리 기반 게인
    const gain = distanceToGain(dist, SPATIAL_AUDIO_DISTANCE);

    // 방향 계산 (팬용)
    const angle = Math.atan2(dy, dx); // -π ~ π
    const pan = (angle / Math.PI + 1) / 2; // 0 ~ 1 (왼쪽 0, 오른쪽 1)

    // 각 상대방마다 필터 파라미터 생성
    // 노드 ID는 individual_audio_simple.ncft 구조에 맞춰야 함
    // TODO: 실제 필터 노드 ID 확인 필요
    
    // 예시: 필터 중심 주파수 (cutoff)
    // 노드 ID는 실제 .ncft 파일 구조에 맞춰 수정 필요
    params.push({
      nodeId: `filter_cutoff_${index}`, // 임시, 실제 노드 ID로 교체 필요
      paramName: "value",
      value: filterCutoff,
    });

    // 필터 게인 (거리 기반)
    params.push({
      nodeId: `filter_gain_${index}`, // 임시, 실제 노드 ID로 교체 필요
      paramName: "value",
      value: gain,
    });

    // 팬 (공간음향)
    params.push({
      nodeId: `filter_pan_${index}`, // 임시, 실제 노드 ID로 교체 필요
      paramName: "value",
      value: pan,
    });
  });

  return params;
}


