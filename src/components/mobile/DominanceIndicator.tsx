"use client";

import { useMemo } from "react";
import { computeDominanceLevel } from "@/lib/game/dominance";
import type { GameState, HarmonicState } from "@/types/game";

interface DominanceIndicatorProps {
  state: GameState;
  harmony: HarmonicState | null;
}

export default function DominanceIndicator({
  state,
  harmony,
}: DominanceIndicatorProps) {
  const metrics = useMemo(() => {
    if (!state.selfId) return null;
    const selfPlayer = state.players[state.selfId];
    if (!selfPlayer) return null;

    // 간단한 클러스터 강도 계산
    const sameNotePlayers = Object.values(state.players).filter(
      p => p.id !== state.selfId && p.assignedNote === selfPlayer.assignedNote
    );

    let clusterStrength = 0;
    if (sameNotePlayers.length > 0) {
      const nearest = sameNotePlayers.reduce((min, p) => {
        const dx = p.cell.position.x - selfPlayer.cell.position.x;
        const dy = p.cell.position.y - selfPlayer.cell.position.y;
        const dist = Math.hypot(dx, dy);
        return dist < min.dist ? { dist } : min;
      }, { dist: Infinity });

      if (nearest.dist < 200) {
        clusterStrength = 1 - nearest.dist / 200;
      }
    }

    return computeDominanceLevel(selfPlayer, harmony, clusterStrength);
  }, [state, harmony]);

  if (!metrics) return null;

  return (
    <div className="absolute top-4 right-4 z-10">
      {/* 영향도 게이지 */}
      <div className="mb-2">
        <div className="text-xs text-white/60 mb-1">Global Influence</div>
        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${metrics.influenceLevel * 100}%` }}
          />
        </div>
        <div className="text-xs text-white/40 mt-1">
          {Math.round(metrics.influenceLevel * 100)}%
        </div>
      </div>

      {/* 주도권 상태 */}
      {metrics.isDominant && (
        <div className="mt-2 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-400">
          ✓ Your key is dominant
        </div>
      )}

      {/* 클러스터 강도 */}
      {metrics.clusterStrength > 0.3 && (
        <div className="mt-2 text-xs text-white/60">
          Cluster: {Math.round(metrics.clusterStrength * 100)}%
        </div>
      )}
    </div>
  );
}

