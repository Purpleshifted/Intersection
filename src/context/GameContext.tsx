"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Mode } from "@/types/game";
import { resolveWebSocketUrl } from "@/lib/config/urlResolver";

export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameContextValue {
  mode: Mode;
  displayName: string;
  difficulty: Difficulty | null;
  serverUrl: string;
  setMode: (mode: Mode) => void;
  setDisplayName: (name: string) => void;
  setDifficulty: (difficulty: Difficulty | null) => void;
  setServerUrl: (url: string) => void;
}

// 서버 환경(SSR)용 기본 WS URL
const envWsUrl = process.env.NEXT_PUBLIC_WS_URL;
const fallbackUrl =
  envWsUrl ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001/socket"
    : "/socket");

const defaultValue: GameContextValue = {
  mode: "personal",
  displayName: "",
  difficulty: null,
  serverUrl: fallbackUrl,
  setMode: () => undefined,
  setDisplayName: () => undefined,
  setDifficulty: () => undefined,
  setServerUrl: () => undefined,
};

const GameContext = createContext<GameContextValue>(defaultValue);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>("personal");
  const [displayName, setDisplayName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [serverUrl, setServerUrl] = useState(fallbackUrl);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 디버깅: 환경 변수 확인
    // eslint-disable-next-line no-console
    console.log("[GameContext] Environment check:", {
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      envWsUrl,
      fallbackUrl,
      NODE_ENV: process.env.NODE_ENV,
      origin: typeof window !== "undefined" ? window.location.origin : "N/A",
    });
    
    if (!envWsUrl) {
      // eslint-disable-next-line no-console
      console.warn("[GameContext] NEXT_PUBLIC_WS_URL not set, using fallback:", fallbackUrl);
      return;
    }

    const page = window.location;

    // 1) 경로만 주어진 경우(/socket): 항상 현재 origin 기준으로만 해석
    //    - https://localhost/visual → https://localhost/socket
    //    - 프로덕션에서도 동일 도메인 + /socket 형태로 동작
    if (envWsUrl.startsWith("/")) {
      try {
        const absoluteUrl = new URL(envWsUrl, page.origin);
        setServerUrl(absoluteUrl.toString());
      } catch {
        setServerUrl(envWsUrl);
      }
      return;
    }

    // 2) 절대 URL이 주어진 경우: 통합 URL 해석 유틸리티 사용
    try {
      const resolved = resolveWebSocketUrl(
        envWsUrl,
        fallbackUrl,
        page.origin
      );
      setServerUrl(resolved.fullUrl);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[GameContext] URL resolution error:", error, {
        envWsUrl,
        pageOrigin: page.origin,
      });
      setServerUrl(envWsUrl);
    }
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      displayName,
      setDisplayName,
      difficulty,
      setDifficulty,
      serverUrl,
      setServerUrl,
    }),
    [mode, displayName, difficulty, serverUrl]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = () => useContext(GameContext);
