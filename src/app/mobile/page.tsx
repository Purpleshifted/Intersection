"use client";

import { useEffect, useState } from "react";
import { useGameContext } from "@/context/GameContext";
import MobileView from "@/components/mobile/MobileView";
import MobileStartScreen from "@/components/mobile/MobileStartScreen";

export default function MobilePage() {
  const { displayName, difficulty } = useGameContext();
  const [showStartScreen, setShowStartScreen] = useState(true);

  useEffect(() => {
    // 이름과 난이도가 설정되어 있으면 게임 시작
    if (displayName && difficulty) {
      setShowStartScreen(false);
    }
  }, [displayName, difficulty]);

  if (showStartScreen) {
    return <MobileStartScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MobileView />
    </div>
  );
}
