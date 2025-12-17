"use client";

import { useGameClient } from "@/lib/game/hooks";

/**
 * 연결 상태 표시 컴포넌트
 * WebSocket 연결 상태를 사용자에게 명확하게 표시
 */
export default function ConnectionStatus() {
  const { state } = useGameClient();
  const { ui, socketId, playing } = state;

  // 연결 상태가 정상이면 표시하지 않음
  if (ui.connected && socketId && playing) {
    return null;
  }

  // 연결 중
  if (!ui.connected && !ui.reconnecting) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-yellow-500/90 px-4 py-2 text-sm font-medium text-black shadow-lg">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-black" />
          <span>서버에 연결 중...</span>
        </div>
      </div>
    );
  }

  // 재연결 중
  if (ui.reconnecting) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-yellow-500/90 px-4 py-2 text-sm font-medium text-black shadow-lg">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-black" />
          <span>재연결 중...</span>
        </div>
      </div>
    );
  }

  // 연결 실패
  if (!ui.connected && ui.statusMessage?.includes("실패")) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>{ui.statusMessage}</span>
        </div>
      </div>
    );
  }

  return null;
}

