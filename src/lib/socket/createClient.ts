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
    // 절대 URL인 경우 page.origin을 무시하고 직접 파싱
    let url: URL;
    if (/^wss?:\/\//i.test(rawUrl)) {
      // 이미 절대 URL이면 origin 무시
      url = new URL(rawUrl);
    } else if (rawUrl.startsWith("/")) {
      // 상대 경로인 경우 origin 사용
      url = new URL(rawUrl, origin);
    } else {
      // 프로토콜이 없는 호스트명만 있는 경우 wss:// 추가 후 파싱
      const urlWithProtocol = `wss://${rawUrl}`;
      url = new URL(urlWithProtocol);
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
  }) as GameSocket;

  socket.on("connect", () => {
    // eslint-disable-next-line no-console
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    // eslint-disable-next-line no-console
    console.error("[Socket] Connection error:", error);
  });

  return socket;
};
