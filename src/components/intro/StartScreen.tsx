"use client";

import { useRouter } from "next/navigation";
import { useGameContext } from "@/context/GameContext";

const StartScreen = () => {
  const router = useRouter();
  const { setMode, setDifficulty } = useGameContext();

  const handleStargaze = () => {
    setMode("global");
    setDifficulty("easy"); // 기본값
    router.push("/global");
  };

  const handlePlay = () => {
    setMode("personal");
    // 이름과 난이도는 mobile 시작 화면에서 입력받음
    router.push("/mobile");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex flex-col gap-8">
        <button
          onClick={handleStargaze}
          className="rounded-lg border border-white/30 bg-white/5 px-16 py-6 text-lg font-normal text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10 active:scale-[0.98] vintage-serif"
        >
          stargaze
        </button>
        <button
          onClick={handlePlay}
          className="rounded-lg border border-white/30 bg-white/5 px-16 py-6 text-lg font-normal text-white transition-all duration-300 hover:border-white/50 hover:bg-white/10 active:scale-[0.98] vintage-serif"
        >
          play
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
