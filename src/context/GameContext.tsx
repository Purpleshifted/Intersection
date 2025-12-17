"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Mode } from "@/types/game";

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

    // 2) 절대 URL이 주어진 경우: 기존 localhost 재작성 로직 유지
    try {
      // 프로토콜이 없는 경우 (호스트명만 있는 경우) wss:// 또는 https:// 추가
      let urlStr = envWsUrl;
      if (!/^wss?:\/\//i.test(envWsUrl) && !envWsUrl.startsWith("/")) {
        // WebSocket URL인 경우 wss://, 일반 URL인 경우 https://
        if (envWsUrl.includes("/socket") || envWsUrl.includes(":3001")) {
          urlStr = `wss://${envWsUrl}`;
        } else {
          urlStr = `https://${envWsUrl}`;
        }
      }
      const absoluteUrl = new URL(urlStr, page.origin);

      // 개발용 localhost/127.0.0.1이 설정된 경우,
      // 현재 접속한 호스트(IP/도메인)에 맞게 호스트만 교체
      if (
        absoluteUrl.hostname === "localhost" ||
        absoluteUrl.hostname === "127.0.0.1"
      ) {
        const port = absoluteUrl.port || "3001";
        const path = absoluteUrl.pathname || "/socket";
        const protocol = page.protocol === "https:" ? "wss:" : "ws:";
        const hostPart = port ? `${page.hostname}:${port}` : page.hostname;
        const rewritten = `${protocol}//${hostPart}${path}`;
        setServerUrl(rewritten);
      } else {
        setServerUrl(absoluteUrl.toString());
      }
    } catch {
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
