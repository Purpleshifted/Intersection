/**
 * 렌더링 조건 체크 유틸리티
 * 
 * 게임 상태에 따른 렌더링 여부를 명확하게 판단
 */

import type { GameState } from "@/types/game";

export interface RenderConditionCheck {
  shouldRender: boolean;
  reason: string;
  details: {
    playing: boolean;
    selfId: string | null;
    hasPlayers: boolean;
    hasSocketId: boolean;
    playerCount: number;
    mode: GameState['mode'];
  };
}

/**
 * 게임 상태에 따라 렌더링이 필요한지 판단합니다.
 * 
 * @param state 게임 상태
 * @returns 렌더링 여부 및 이유
 */
export const checkRenderCondition = (state: GameState): RenderConditionCheck => {
  const hasPlayers = Object.keys(state.players).length > 0;
  const hasSocketId = state.socketId !== null;
  const playerCount = Object.keys(state.players).length;
  
  const details = {
    playing: state.playing,
    selfId: state.selfId,
    hasPlayers,
    hasSocketId,
    playerCount,
    mode: state.mode,
  };
  
  // 글로벌 뷰: 플레이어가 있으면 렌더링
  if (state.mode === "global") {
    if (hasPlayers) {
      return {
        shouldRender: true,
        reason: "global mode with players",
        details,
      };
    }
    return {
      shouldRender: false,
      reason: "global mode without players",
      details,
    };
  }
  
  // 개인 뷰: 여러 조건 중 하나라도 만족하면 렌더링
  if (state.mode === "personal") {
    // 1. 게임이 진행 중이면 렌더링
    if (state.playing) {
      return {
        shouldRender: true,
        reason: "personal mode playing",
        details,
      };
    }
    
    // 2. selfId가 있으면 렌더링 (자기 플레이어 식별됨)
    if (state.selfId) {
      return {
        shouldRender: true,
        reason: "personal mode with selfId",
        details,
      };
    }
    
    // 3. 플레이어가 있으면 렌더링 (초기 연결 시)
    if (hasPlayers) {
      return {
        shouldRender: true,
        reason: "personal mode with players",
        details,
      };
    }
    
    // 4. Socket이 연결되어 있으면 렌더링 (연결 중일 수 있음)
    if (hasSocketId) {
      return {
        shouldRender: true,
        reason: "personal mode with socketId",
        details,
      };
    }
    
    // 모든 조건 불만족
    return {
      shouldRender: false,
      reason: "personal mode: no playing, no selfId, no players, no socketId",
      details,
    };
  }
  
  // 알 수 없는 모드
  return {
    shouldRender: false,
    reason: `unknown mode: ${state.mode}`,
    details,
  };
};

