"use client";

import { io } from "socket.io-client";
import type { Mode } from "@/types/game";
import { resolveWebSocketUrl } from "@/lib/config/urlResolver";

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
    // 통합 URL 해석 유틸리티 사용
    const resolved = resolveWebSocketUrl(rawUrl, DEFAULT_SOCKET_PATH, origin);
    
    return {
      origin: resolved.origin,
      path: resolved.path === "/" ? DEFAULT_SOCKET_PATH : resolved.path,
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
    const errorInfo = error instanceof Error
      ? {
          message: error.message,
          name: error.name,
          stack: error.stack,
        }
      : typeof error === "object" && error !== null
      ? {
          message: String((error as { message?: unknown }).message ?? "Unknown error"),
          description: String((error as { description?: unknown }).description ?? ""),
          context: String((error as { context?: unknown }).context ?? ""),
          type: String((error as { type?: unknown }).type ?? ""),
        }
      : { message: String(error) };
    console.error("[Socket] Connection error:", {
      ...errorInfo,
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
    const errorInfo = error instanceof Error
      ? { message: error.message, name: error.name }
      : typeof error === "object" && error !== null
      ? { message: String((error as { message?: unknown }).message ?? "Unknown error") }
      : { message: String(error) };
    console.error("[Socket] Reconnection error:", errorInfo);
  });

  socket.on("reconnect_failed", () => {
    // eslint-disable-next-line no-console
    console.error("[Socket] Reconnection failed after all attempts");
  });

  return socket;
};
