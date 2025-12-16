/**
 * 주도권 계산 및 시각화 유틸리티
 */

import type { GameState, PlayerSnapshot, HarmonicState } from "@/types/game";

// 타입 확장 (실제 구현 시 PlayerSnapshot에 추가 필요)
interface ExtendedPlayerSnapshot extends PlayerSnapshot {
  assignedNote?: string; // 'C', 'F', 'G' 등
}

export interface DominanceMetrics {
  playerId: string;
  dominanceLevel: number; // 0-1
  influenceLevel: number; // 0-1, 글로벌 오디오에 미치는 영향
  isDominant: boolean; // 현재 글로벌 조성과 일치하는가
  clusterStrength: number; // 0-1, 속한 클러스터의 강도
}

/**
 * 플레이어의 주도권 레벨 계산
 */
export function computeDominanceLevel(
  player: ExtendedPlayerSnapshot,
  harmony: HarmonicState | null,
  clusterStrength: number = 0
): DominanceMetrics {
  if (!harmony) {
    return {
      playerId: player.id,
      dominanceLevel: 0,
      influenceLevel: 0,
      isDominant: false,
      clusterStrength: 0,
    };
  }

  // 자신의 음이 현재 글로벌 조성과 일치하는가?
  const isDominant =
    (player.assignedNote &&
      (harmony.key === player.assignedNote ||
        harmony.targetKey === player.assignedNote)) ||
    false;

  // 활동 점수 (속도 기반)
  const speed = Math.hypot(
    player.cell.velocity.x,
    player.cell.velocity.y
  );
  const MAX_SPEED = 320;
  const activityScore = Math.min(1, speed / MAX_SPEED);

  // 클러스터 강도
  const normalizedClusterStrength = Math.min(1, clusterStrength);

  // 주도권 레벨 = 활동성 * 0.4 + 클러스터 강도 * 0.4 + 일치 여부 * 0.2
  const dominanceLevel = isDominant
    ? activityScore * 0.4 + normalizedClusterStrength * 0.4 + 0.2
    : activityScore * 0.5 + normalizedClusterStrength * 0.5;

  // 영향도 = 주도권 레벨 * 일치 여부 보너스
  const influenceLevel = isDominant
    ? dominanceLevel * 1.2 // 일치 시 20% 보너스
    : dominanceLevel * 0.6; // 불일치 시 40% 감소

  return {
    playerId: player.id,
    dominanceLevel: Math.min(1, dominanceLevel),
    influenceLevel: Math.min(1, influenceLevel),
    isDominant,
    clusterStrength: normalizedClusterStrength,
  };
}

/**
 * 모든 플레이어의 주도권 메트릭 계산
 */
export function computeAllDominanceMetrics(
  state: GameState,
  harmony: HarmonicState | null
): Map<string, DominanceMetrics> {
  const metrics = new Map<string, DominanceMetrics>();

  // 클러스터 강도 계산 (간단한 버전)
  const clusterStrengths = computeClusterStrengths(state);

  Object.values(state.players).forEach(player => {
    const clusterStrength = clusterStrengths.get(player.id) || 0;
    const metric = computeDominanceLevel(player, harmony, clusterStrength);
    metrics.set(player.id, metric);
  });

  return metrics;
}

/**
 * 클러스터 강도 계산 (간단한 버전)
 * 실제로는 서버에서 계산된 클러스터 정보를 사용해야 함
 */
function computeClusterStrengths(
  state: GameState
): Map<string, number> {
  const strengths = new Map<string, number>();

  if (!state.selfId) return strengths;

  const selfPlayer = state.players[state.selfId];
  if (!selfPlayer) return strengths;

  // 같은 음을 가진 플레이어와의 거리 기반
    const sameNotePlayers = Object.values(state.players).filter(
      p =>
        p.id !== state.selfId &&
        (p as ExtendedPlayerSnapshot).assignedNote ===
          (selfPlayer as ExtendedPlayerSnapshot).assignedNote &&
        (selfPlayer as ExtendedPlayerSnapshot).assignedNote
    );

  if (sameNotePlayers.length === 0) {
    strengths.set(state.selfId, 0);
    return strengths;
  }

  // 가장 가까운 같은 음 플레이어와의 거리
  const nearest = sameNotePlayers.reduce((min, p) => {
    const dx = p.cell.position.x - selfPlayer.cell.position.x;
    const dy = p.cell.position.y - selfPlayer.cell.position.y;
    const dist = Math.hypot(dx, dy);
    return dist < min.dist ? { player: p, dist } : min;
  }, { player: null as PlayerSnapshot | null, dist: Infinity });

  if (nearest.dist < 200) {
    // 거리가 가까울수록 강도 증가
    const strength = 1 - nearest.dist / 200;
    strengths.set(state.selfId, strength);
    
    // 같은 클러스터의 다른 플레이어들도 같은 강도 부여
    sameNotePlayers.forEach(p => {
      if (Math.hypot(
        p.cell.position.x - selfPlayer.cell.position.x,
        p.cell.position.y - selfPlayer.cell.position.y
      ) < 200) {
        strengths.set(p.id, strength);
      }
    });
  } else {
    strengths.set(state.selfId, 0);
  }

  return strengths;
}

/**
 * 주도권 레벨을 색상으로 변환
 */
export function dominanceToColor(
  dominanceLevel: number,
  baseColor: string = "#FFFFFF"
): string {
  if (dominanceLevel < 0.1) return baseColor;

  // 주도권이 높을수록 더 밝고 포화된 색상
  const intensity = dominanceLevel;
  const hue = 200 + intensity * 60; // 파랑 → 보라
  const saturation = 70 + intensity * 30;
  const lightness = 50 + intensity * 30;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * 주도권 레벨을 크기 배율로 변환
 */
export function dominanceToScale(dominanceLevel: number): number {
  // 1.0 ~ 1.5배 크기 변화
  return 1.0 + dominanceLevel * 0.5;
}

/**
 * 주도권 레벨을 투명도로 변환 (오라 효과용)
 */
export function dominanceToAlpha(dominanceLevel: number): number {
  return dominanceLevel * 0.4;
}

