/**
 * 통합 URL 해석 유틸리티
 * 
 * 모든 서버 URL 해석을 한 곳에서 처리하여 일관성 유지
 */

export type Protocol = 'ws' | 'wss' | 'http' | 'https';

export interface ResolvedUrl {
  origin: string;
  path: string;
  protocol: Protocol;
  fullUrl: string;
}

/**
 * 환경 변수에서 서버 URL을 해석합니다.
 * 
 * @param envVar 환경 변수 값 (undefined 가능)
 * @param type URL 타입 ('ws' | 'http')
 * @param fallback 기본값 (환경 변수가 없을 때 사용)
 * @param currentOrigin 현재 페이지의 origin (상대 경로 해석용)
 * @returns 해석된 URL 정보
 */
export const resolveServerUrl = (
  envVar: string | undefined,
  type: 'ws' | 'http',
  fallback: string,
  currentOrigin: string
): ResolvedUrl => {
  const rawUrl = (envVar || fallback).trim();
  
  // 1. 경로만 주어진 경우 (/socket, /audiocraft)
  if (rawUrl.startsWith("/")) {
    try {
      const absoluteUrl = new URL(rawUrl, currentOrigin);
      const protocol = absoluteUrl.protocol === "https:" 
        ? (type === 'ws' ? 'wss' : 'https')
        : (type === 'ws' ? 'ws' : 'http');
      
      return {
        origin: `${protocol}//${absoluteUrl.host}`,
        path: absoluteUrl.pathname,
        protocol,
        fullUrl: `${protocol}//${absoluteUrl.host}${absoluteUrl.pathname}`,
      };
    } catch {
      return {
        origin: currentOrigin,
        path: rawUrl,
        protocol: type === 'ws' ? 'wss' : 'https',
        fullUrl: `${currentOrigin}${rawUrl}`,
      };
    }
  }

  // 2. 절대 URL인 경우
  try {
    let urlStr = rawUrl;
    
    // 프로토콜이 없으면 추가
    if (!/^wss?:\/\//i.test(urlStr) && !/^https?:\/\//i.test(urlStr)) {
      // 호스트명만 있는 경우
      urlStr = type === 'ws' ? `wss://${urlStr}` : `https://${urlStr}`;
    } else if (/^https?:\/\//i.test(urlStr) && type === 'ws') {
      // HTTP/HTTPS를 WebSocket으로 변환
      urlStr = urlStr.replace(/^https:\/\//i, "wss://").replace(/^http:\/\//i, "ws://");
    }
    
    // URL 파싱
    const url = new URL(urlStr);
    
    // 프로토콜 결정
    let protocol: Protocol;
    if (url.protocol === "https:") {
      protocol = type === 'ws' ? 'wss' : 'https';
    } else if (url.protocol === "http:") {
      protocol = type === 'ws' ? 'ws' : 'http';
    } else if (url.protocol === "wss:") {
      protocol = 'wss';
    } else if (url.protocol === "ws:") {
      protocol = 'ws';
    } else {
      protocol = type === 'ws' ? 'wss' : 'https';
    }
    
    // localhost/127.0.0.1 재작성 (개발 환경)
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      const currentUrl = new URL(currentOrigin);
      const port = url.port || (type === 'ws' ? "3001" : "4000");
      const path = url.pathname || (type === 'ws' ? "/socket" : "/");
      const hostPart = port ? `${currentUrl.hostname}:${port}` : currentUrl.hostname;
      const finalProtocol = currentUrl.protocol === "https:" 
        ? (type === 'ws' ? 'wss' : 'https')
        : (type === 'ws' ? 'ws' : 'http');
      
      return {
        origin: `${finalProtocol}//${hostPart}`,
        path,
        protocol: finalProtocol,
        fullUrl: `${finalProtocol}//${hostPart}${path}`,
      };
    }
    
    // 절대 URL 그대로 사용
    const normalizedPath = url.pathname.replace(/\/+$/, "") || (type === 'ws' ? "/socket" : "/");
    
    return {
      origin: `${protocol}//${url.host}`,
      path: normalizedPath,
      protocol,
      fullUrl: `${protocol}//${url.host}${normalizedPath}`,
    };
  } catch (error) {
    // 파싱 실패 시 fallback 사용
    console.error("[urlResolver] Failed to parse URL:", error, { rawUrl, type, fallback, currentOrigin });
    
    return {
      origin: currentOrigin,
      path: type === 'ws' ? "/socket" : "/",
      protocol: type === 'ws' ? 'wss' : 'https',
      fullUrl: `${currentOrigin}${type === 'ws' ? "/socket" : "/"}`,
    };
  }
};

/**
 * WebSocket URL 해석 (편의 함수)
 */
export const resolveWebSocketUrl = (
  envVar: string | undefined,
  fallback: string,
  currentOrigin: string
): ResolvedUrl => {
  return resolveServerUrl(envVar, 'ws', fallback, currentOrigin);
};

/**
 * HTTP URL 해석 (편의 함수)
 */
export const resolveHttpUrl = (
  envVar: string | undefined,
  fallback: string,
  currentOrigin: string
): ResolvedUrl => {
  return resolveServerUrl(envVar, 'http', fallback, currentOrigin);
};

