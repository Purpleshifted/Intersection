"use client";

import { io } from "socket.io-client";
import type { Mode } from "@/types/game";

export interface GameSocket {
  id: string | null | undefined;
  emit: (event: string, ...args: unknown[]) => GameSocket;
  on: (event: string, handler: (...args: unknown[]) => void) => GameSocket;
  off: (event: string, handler?: (...args: unknown[]) => void) => GameSocket;
  disconnect: () => void;
}

const createStubSocket = (): GameSocket => {
  const stub: GameSocket = {
    id: null,
    emit: () => stub,
    on: () => stub,
    off: () => stub,
    disconnect: () => undefined,
  };
  return stub;
};

const DEFAULT_SOCKET_PATH = "/socket";
const getDefaultServerUrl = () =>
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001/socket"
    : DEFAULT_SOCKET_PATH;

const resolveSocketEndpoint = (rawUrl: string, origin: string) => {
  try {
    let urlStr = rawUrl.trim();
    
    // 이미 wss:// 또는 ws://로 시작하면 그대로 사용
    if (/^wss?:\/\//i.test(urlStr)) {
      // 이미 WebSocket 프로토콜이 있으면 그대로 사용
    } else if (/^https?:\/\//i.test(urlStr)) {
      // https:// 또는 http://가 있으면 wss:// 또는 ws://로 변환
      urlStr = urlStr.replace(/^https:\/\//i, "wss://").replace(/^http:\/\//i, "ws://");
    } else if (!urlStr.startsWith("/")) {
      // 프로토콜이 없고 경로도 아니면 wss:// 추가
      urlStr = `wss://${urlStr}`;
    }
    
    // 절대 URL인 경우 origin을 무시하고 직접 파싱
    let url: URL;
    if (/^wss?:\/\//i.test(urlStr)) {
      // 이미 절대 URL이면 origin 무시
      url = new URL(urlStr);
    } else if (urlStr.startsWith("/")) {
      // 상대 경로인 경우 origin 사용
      url = new URL(urlStr, origin);
    } else {
      // 프로토콜도 경로도 아니면 에러
      throw new Error(`Invalid URL format: ${urlStr}`);
    }
    
    const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
    const path = normalizedPath === "/" ? DEFAULT_SOCKET_PATH : normalizedPath;
    
    // WebSocket 프로토콜 변환 (http -> ws, https -> wss)
    const protocol = url.protocol === "https:" ? "wss:" : url.protocol === "http:" ? "ws:" : url.protocol;
    const originUrl = `${protocol}//${url.host}`;
    
    return {
      origin: originUrl,
      path,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[Socket] resolveSocketEndpoint error:", error, { rawUrl, origin });
    return {
      origin,
      path: DEFAULT_SOCKET_PATH,
    };
  }
};

export const createSocketClient = async ({
  serverUrl,
  mode,
}: {
  serverUrl: string;
  mode: Mode;
}): Promise<GameSocket> => {
  if (typeof window === "undefined") {
    return createStubSocket();
  }

  const resolved = resolveSocketEndpoint(
    serverUrl || getDefaultServerUrl(),
    window.location.origin
  );

  // eslint-disable-next-line no-console
  console.log("[Socket] Connecting to:", {
    serverUrl,
    resolved,
    mode,
    defaultUrl: getDefaultServerUrl(),
  });

  const socket = io(resolved.origin, {
    path: resolved.path,
    query: {
      type: mode === "personal" ? "player" : "spectator",
    },
    transports: ["websocket"],
    withCredentials: true,
    // 재연결 옵션 추가 (Render 무료 플랜 슬립 모드 대응)
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    timeout: 20000,
  }) as GameSocket;

  socket.on("connect", () => {
    // eslint-disable-next-line no-console
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    // eslint-disable-next-line no-console
    console.error("[Socket] Connection error:", {
      message: error.message,
      description: error.description,
      context: error.context,
      type: error.type,
      resolvedOrigin: resolved.origin,
      resolvedPath: resolved.path,
    });
  });

  socket.on("reconnect", (attemptNumber) => {
    // eslint-disable-next-line no-console
    console.log("[Socket] Reconnected after", attemptNumber, "attempts");
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    // eslint-disable-next-line no-console
    console.log("[Socket] Reconnection attempt", attemptNumber);
  });

  socket.on("reconnect_error", (error) => {
    // eslint-disable-next-line no-console
    console.error("[Socket] Reconnection error:", error);
  });

  socket.on("reconnect_failed", () => {
    // eslint-disable-next-line no-console
    console.error("[Socket] Reconnection failed after all attempts");
  });

  return socket;
};
