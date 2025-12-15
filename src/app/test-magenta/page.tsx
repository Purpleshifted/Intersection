"use client";

import { useEffect, useState } from "react";

export default function TestMagentaPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 클라이언트에서만 동적 import
      const { testMagentaIntegration } = await import("@/lib/audio/magenta-test");
      const res = await testMagentaIntegration();
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Test error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Magenta.js 프로토타입 테스트</h1>

        <button
          onClick={handleTest}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors mb-6"
        >
          {loading ? "테스트 중..." : "Magenta.js 테스트 실행"}
        </button>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
            <h2 className="text-red-400 font-semibold mb-2">오류</h2>
            <pre className="text-sm text-red-300">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
            <h2 className="text-green-400 font-semibold mb-2">✅ 테스트 성공</h2>
            <pre className="text-sm text-green-300 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          <h3 className="text-white mb-2">참고:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>모델 로딩에는 몇 초가 걸릴 수 있습니다</li>
            <li>브라우저 콘솔에서 상세 로그를 확인할 수 있습니다</li>
            <li>네트워크 오류 시 CORS 설정을 확인하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

