import type { NoiseCraftParam } from "@/lib/audio/noiseCraftCore";
import { resolveHttpUrl, resolveWebSocketUrl } from "@/lib/config/urlResolver";
export type {
  NoiseCraftParam,
  PersonalAudioMetrics,
} from "@/lib/audio/noiseCraftCore";
export { buildNoiseCraftParams } from "@/lib/audio/noiseCraftCore";

export const postNoiseCraftParams = (
  iframe: HTMLIFrameElement | null,
  origin: string | null,
  params: NoiseCraftParam[]
) => {
  if (!iframe || !params.length) return;
  if (process.env.NODE_ENV === "development") {
    // 디버그용: iframe으로 전송되는 파라미터 확인
    // eslint-disable-next-line no-console
    // console.log("[NoiseCraft] postParams", { origin, params });
  }
  // 개발 중에는 로컬/다른 포트(IP)로 접속하는 경우가 많아서
  // origin 불일치로 인한 경고를 피하기 위해 targetOrigin을 완화
  const targetOrigin =
    process.env.NODE_ENV === "development" ? "*" : origin || "*";
  iframe.contentWindow?.postMessage(
    { type: "noiseCraft:setParams", params },
    targetOrigin
  );
};

export const resolveNoiseCraftEmbed = () => {
  if (typeof window === "undefined") {
    return { src: "about:blank", origin: null };
  }
  const isDev = process.env.NODE_ENV === "development";
  const pageOrigin = window.location.origin;
  const pageUrl = new URL(pageOrigin);
  
  // 디버깅: 환경 변수 확인
  // eslint-disable-next-line no-console
  console.log("[NoiseCraft] Environment check:", {
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_NOISECRAFT_WS_URL: process.env.NEXT_PUBLIC_NOISECRAFT_WS_URL,
    NODE_ENV: process.env.NODE_ENV,
    pageOrigin,
  });
  const rawNcEnv =
    process.env.NEXT_PUBLIC_NOISECRAFT_WS_URL ||
    (isDev ? "http://localhost:4000" : "/audiocraft");
  const rawRtEnv =
    process.env.NEXT_PUBLIC_WS_URL ||
    (isDev ? "http://localhost:3001/socket" : "/socket");

  // 통합 URL 해석 유틸리티 사용
  const ncResolved = resolveHttpUrl(
    rawNcEnv,
    isDev ? "http://localhost:4000" : "/audiocraft",
    pageOrigin
  );
  const rtResolved = resolveWebSocketUrl(
    rawRtEnv,
    isDev ? "http://localhost:3001/socket" : "/socket",
    pageOrigin
  );
  
  const ncEnv = ncResolved.fullUrl;
  const rtEnv = rtResolved.fullUrl;

  // 디버깅: URL 해석 결과 확인
  // eslint-disable-next-line no-console
  console.log("[NoiseCraft] URL resolution:", {
    rawNcEnv,
    rawRtEnv,
    ncEnv,
    rtEnv,
    pageOrigin,
  });

  const ncBase = ncEnv;
  const rtUrl = rtEnv;
  const normalizedNcBase = ncBase.replace(/\/$/, "");
  const normalizePatchSrc = (raw: string) => {
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) {
      return `${normalizedNcBase}${raw}`;
    }
    return `${normalizedNcBase}/${raw}`;
  };
  // NOTE: NoiseCraft 서버는 examples/ 폴더를 /public/examples 로 서빙한다.
  // docker-compose 등에서 /examples/... 로 설정되어 있으면 자동으로 보정한다.
  const normalizeExamplesPath = (raw: string) => {
    if (!raw) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/public/examples/")) return raw;
    if (raw.startsWith("/examples/")) return `/public${raw}`; // -> /public/examples/...
    if (raw.startsWith("examples/")) return `public/${raw}`; // -> public/examples/...
    return raw;
  };

  const path = window.location.pathname || "";

  // 페이지 별로 다른 기본 패치를 쓸 수 있게 분기
  // - /mobile: 개인 오디오 패치(v2)
  // - /global: 글로벌 오디오 패치
  const basePatchSrcEnv =
    process.env.NEXT_PUBLIC_NOISECRAFT_PATCH_SRC?.trim() || "";
  const personalPatchSrcEnv =
    process.env.NEXT_PUBLIC_NOISECRAFT_PERSONAL_PATCH_SRC?.trim() || "";
  const globalPatchSrcEnv =
    process.env.NEXT_PUBLIC_NOISECRAFT_GLOBAL_PATCH_SRC?.trim() || "";

  const patchProjectId =
    process.env.NEXT_PUBLIC_NOISECRAFT_PATCH_PROJECT_ID?.trim() || "";
  const embedSearch = new URLSearchParams();
  embedSearch.set("io", rtUrl);
  
  if (path.startsWith("/global")) {
    // 글로벌 뷰에서도 Mobile과 동일하게 indiv_audio_map_v2.ncft 사용
    const globalSrcFile = "/public/examples/indiv_audio_map_v2.ncft";
    const normalizedSrc = normalizePatchSrc(globalSrcFile);
    embedSearch.set("src", normalizedSrc);
  } else {
    // /mobile 또는 기타 경로: 기존 로직 사용
    const basePatchSrcEnv =
      process.env.NEXT_PUBLIC_NOISECRAFT_PATCH_SRC?.trim() || "";
    const personalPatchSrcEnv =
      process.env.NEXT_PUBLIC_NOISECRAFT_PERSONAL_PATCH_SRC?.trim() || "";
    
    let patchSrcEnvRaw: string;
    if (path.startsWith("/mobile")) {
      patchSrcEnvRaw =
        personalPatchSrcEnv || basePatchSrcEnv || "/public/examples/indiv_audio_map_v2.ncft";
    } else {
      patchSrcEnvRaw = basePatchSrcEnv || "";
    }
    
    const patchSrcEnv = patchSrcEnvRaw
      ? normalizeExamplesPath(patchSrcEnvRaw)
      : "";
    
    if (patchSrcEnv) {
      embedSearch.set("src", normalizePatchSrc(patchSrcEnv));
    } else if (patchProjectId) {
      embedSearch.set("project", patchProjectId);
    } else {
      embedSearch.set("src", `${normalizedNcBase}/current-project`);
    }
  }
  // /mobile 과 /mobile/debug 에서 iframe 모드를 구분하기 위한 view 쿼리
  if (path.startsWith("/mobile/debug")) {
    embedSearch.set("view", "mobile-debug");
    // /mobile/debug에서는 NoiseCraft 전체 패널을 보이도록 강제
    embedSearch.set("editor", "full");
  } else if (path.startsWith("/mobile")) {
    embedSearch.set("view", "mobile");
  }
  const src = `${normalizedNcBase}/public/embedded.html?${embedSearch.toString()}`;
  
  // embedOrigin 계산: src가 절대 URL이면 그 origin 사용, 아니면 pageOrigin 사용
  let embedOrigin: string | null = null;
  try {
    // src가 절대 URL인지 확인
    if (/^https?:\/\//i.test(src)) {
      const srcUrl = new URL(src);
      embedOrigin = srcUrl.origin;
    } else {
      // 상대 경로인 경우 pageOrigin 사용
      const srcUrl = new URL(src, pageOrigin);
      embedOrigin = srcUrl.origin;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[NoiseCraft] Failed to parse embed origin:", error, { src, pageOrigin });
    embedOrigin = null;
  }
  
  // eslint-disable-next-line no-console
  console.log("[NoiseCraft] resolveNoiseCraftEmbed result:", {
    path,
    src,
    embedOrigin,
    normalizedNcBase,
    searchParams: embedSearch.toString(),
  });
  return { src, origin: embedOrigin };
};
