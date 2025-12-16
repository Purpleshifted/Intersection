import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로덕션 단일 컨테이너 배포를 위한 standalone 출력
  output: "standalone",
  // nginx가 basePath 처리하므로 제거
  basePath: "",
  // trailing slash 비활성화
  trailingSlash: false,

  env: {
    NEXT_PUBLIC_ENABLE_PROFILER_IN_DEV: "false",
  },

  // Vercel 배포 시 하위 디렉토리의 .next 폴더를 무시
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/noisecraft/**',
        'node_modules/realtime/**',
        'noisecraft/**',
        'realtime/**',
      ],
    },
  },
};

export default nextConfig;
