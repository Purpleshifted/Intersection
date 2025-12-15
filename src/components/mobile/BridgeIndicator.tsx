"use client";

import { useMemo } from "react";
import type { GameState, HarmonicState } from "@/types/game";
import { computeModulationPath } from "@/lib/audio/modulation";
import {
  checkBridgeAvailability,
  type NoteCluster,
} from "@/lib/audio/harmony";

interface BridgeIndicatorProps {
  state: GameState;
  harmony: HarmonicState | null;
  activeClusters: Array<{ note: string; strength: number }>;
}

export default function BridgeIndicator({
  state,
  harmony,
  activeClusters,
}: BridgeIndicatorProps) {
  const bridgeInfo = useMemo(() => {
    if (!state.selfId || !harmony) return null;

    const selfPlayer = state.players[state.selfId];
    if (!selfPlayer) return null;

    // 타입 확장 필요: assignedNote 필드
    const assignedNote = (selfPlayer as any).assignedNote;
    if (!assignedNote) return null;

    const currentKey = harmony.key;
    const targetNote = assignedNote;

    // 현재 키가 이미 목표 음이면 표시 불필요
    if (currentKey === targetNote) return null;

    const path = computeModulationPath(targetNote, currentKey);
    const bridgeCheck = checkBridgeAvailability(
      targetNote,
      currentKey,
      activeClusters.map(
        c =>
          ({
            note: c.note,
            players: [],
            totalActivity: 0,
            averageDuration: 0,
            size: 0,
            strength: c.strength,
          }) as NoteCluster
      )
    );

    return {
      path,
      bridgeCheck,
      targetNote,
    };
  }, [state, harmony, activeClusters]);

  if (!bridgeInfo) return null;

  const { path, bridgeCheck, targetNote } = bridgeInfo;

  // 쉬운 경우 표시 불필요
  if (path.difficulty === "easy") return null;

  return (
    <div className="absolute bottom-20 left-4 right-4 z-10">
      <div className="bg-black/60 border border-white/20 rounded-lg p-3 vintage-serif">
        <div className="text-xs text-white/80 mb-2">
          목표: <span className="font-semibold">{targetNote}</span>로 전조
        </div>

        {/* 필요한 브릿지 표시 */}
        {bridgeCheck.requiredBridges.length > 0 && (
          <div className="mb-2">
            <div className="text-xs text-white/60 mb-1">필요한 중간 단계:</div>
            <div className="flex gap-2 flex-wrap">
              {bridgeCheck.requiredBridges.map((bridge: string) => {
                const isAvailable = bridgeCheck.availableBridges.some(
                  (b: { note: string }) => b.note === bridge
                );
                return (
                  <div
                    key={bridge}
                    className={`px-2 py-1 rounded text-xs ${
                      isAvailable
                        ? "bg-green-500/30 text-green-400 border border-green-500/50"
                        : "bg-white/10 text-white/40 border border-white/20"
                    }`}
                  >
                    {bridge} {isAvailable ? "✓" : "○"}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 도달 가능 여부 */}
        {!bridgeCheck.canReach && (
          <div className="text-xs text-yellow-400">
            ⚠ 브릿지 클러스터가 필요합니다
          </div>
        )}

        {bridgeCheck.canReach &&
          bridgeCheck.availableBridges.length > 0 && (
            <div className="text-xs text-green-400">
              ✓ 브릿지 활성화 - 전조 가능
            </div>
          )}
      </div>
    </div>
  );
}


