"use client";

import { useEffect } from "react";

/**
 * Render 무료 플랜의 슬립 모드를 방지하기 위해
 * 프론트엔드가 로드될 때 백엔드 서버들에 health check 요청을 보냅니다.
 */
export default function ServerWakeUp() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const wakeUpServers = async () => {
      const realtimeUrl = process.env.NEXT_PUBLIC_WS_URL;
      const noisecraftUrl = process.env.NEXT_PUBLIC_NOISECRAFT_WS_URL;

      // Realtime 서버 깨우기
      if (realtimeUrl) {
        try {
          // WebSocket URL에서 HTTP URL로 변환
          let httpUrl = realtimeUrl
            .replace(/^wss?:\/\//, "https://")
            .replace(/\/socket$/, "")
            .replace(/\/socket\/?$/, "");
          
          // 절대 URL이 아니면 현재 origin 사용
          if (!httpUrl.startsWith("http")) {
            httpUrl = `${window.location.origin}${httpUrl.startsWith("/") ? "" : "/"}${httpUrl}`;
          }
          
          // Health check endpoint 호출
          const healthUrl = `${httpUrl}/health`;
          await fetch(healthUrl, { method: "GET", mode: "no-cors" }).catch(() => {
            // 실패하면 루트 경로도 시도
            fetch(httpUrl, { method: "GET", mode: "no-cors" }).catch(() => {
              // CORS 에러는 무시 (서버가 깨어나는 것이 목적)
            });
          });
        } catch (error) {
          // 에러 무시
        }
      }

      // NoiseCraft 서버 깨우기
      if (noisecraftUrl) {
        try {
          let httpUrl = noisecraftUrl
            .replace(/^wss?:\/\//, "https://")
            .replace(/\/$/, "");
          
          if (!httpUrl.startsWith("http")) {
            httpUrl = `${window.location.origin}${httpUrl.startsWith("/") ? "" : "/"}${httpUrl}`;
          }

          // NoiseCraft 서버의 루트 경로에 요청 (이미 GET endpoint가 있음)
          await fetch(httpUrl, { method: "GET", mode: "no-cors" }).catch(() => {
            // 에러 무시 (서버가 깨어나는 것이 목적)
          });
        } catch (error) {
          // 에러 무시
        }
      }
    };

    // 즉시 실행 (페이지 로드 시)
    wakeUpServers();

    // 1분 후 다시 실행 (서버가 깨어나는 시간 고려)
    const firstRetry = setTimeout(wakeUpServers, 60 * 1000);

    // 3분마다 주기적으로 깨우기 (슬립 모드 방지, 5분보다 짧게)
    const interval = setInterval(wakeUpServers, 3 * 60 * 1000);

    return () => {
      clearTimeout(firstRetry);
      clearInterval(interval);
    };
  }, []);

  return null; // UI 렌더링 없음
}

