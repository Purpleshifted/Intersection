/**
 * 글로벌 뷰용 화성 기반 오디오 생성
 * harmony 상태를 받아서 NoiseCraft 파라미터로 변환
 */

import type { HarmonicState } from "@/types/game";
import type { NoiseCraftParam } from "@/lib/audio/noiseCraftCore";
import { generateChordFromHarmony } from "./harmony";
import * as Tonal from 'tonal';

/**
 * 화성 상태를 NoiseCraft 파라미터로 변환
 * 글로벌 뷰에서는 우세한 화성 위주로 진행되는 것처럼 들려야 함
 * 
 * @param harmony - 화성 상태
 * @returns NoiseCraft 파라미터 배열
 */
export function generateGlobalHarmonyParams(
  harmony: HarmonicState | null
): NoiseCraftParam[] {
  if (!harmony) {
    // 기본: C Major
    return generateDefaultChordParams();
  }

  // 화성 상태에서 코드 생성
  const chord = generateChordFromHarmony(harmony);
  
  // NoiseCraft 파라미터로 변환
  // TODO: 글로벌 뷰용 NoiseCraft 노드 ID 확인 필요
  // 현재는 개인 뷰와 동일한 노드 구조를 가정 (220, 221, 233, 240 등)
  // 실제 글로벌 뷰용 .ncft 파일의 노드 구조에 맞춰 수정 필요
  
  const params: NoiseCraftParam[] = [];
  
  // 코드 구성음을 주파수로 변환하여 전송
  // 최대 3음 (트라이어드)
  chord.slice(0, 3).forEach((note: { freq: number; gain: number }, index: number) => {
    // 주파수를 0-1 범위로 정규화 (20Hz ~ 20000Hz)
    const minFreq = 20;
    const maxFreq = 20000;
    const normalizedFreq = Math.max(0, Math.min(1, (note.freq - minFreq) / (maxFreq - minFreq)));
    
    // TODO: 실제 글로벌 뷰용 노드 ID로 교체 필요
    // 예시: 첫 번째 음은 node 220, 두 번째는 221, 세 번째는 233
    const nodeIds = ['220', '221', '233'];
    if (nodeIds[index]) {
      params.push({
        nodeId: nodeIds[index],
        paramName: 'value',
        value: normalizedFreq,
      });
      
      // 게인도 함께 전송 (필요한 경우)
      // params.push({
      //   nodeId: `gain_${index}`,
      //   paramName: 'value',
      //   value: note.gain,
      // });
    }
  });
  
  // 텐션 정보도 전송 (필요한 경우)
  if (harmony.tension > 0) {
    // 텐션에 따라 추가 파라미터 조절 가능
    // params.push({
    //   nodeId: 'tension',
    //   paramName: 'value',
    //   value: harmony.tension,
    // });
  }
  
  return params.length > 0 ? params : generateDefaultChordParams();
}

/**
 * 기본 코드 파라미터 (C Major)
 */
function generateDefaultChordParams(): NoiseCraftParam[] {
  // C Major: C(261.63Hz), E(329.63Hz), G(392Hz)
  const cMajor = [
    { freq: 261.63, gain: 0.5 },
    { freq: 329.63, gain: 0.4 },
    { freq: 392.00, gain: 0.3 },
  ];
  
  const minFreq = 20;
  const maxFreq = 20000;
  
  return [
    {
      nodeId: '220',
      paramName: 'value',
      value: Math.max(0, Math.min(1, (cMajor[0].freq - minFreq) / (maxFreq - minFreq))),
    },
    {
      nodeId: '221',
      paramName: 'value',
      value: Math.max(0, Math.min(1, (cMajor[1].freq - minFreq) / (maxFreq - minFreq))),
    },
    {
      nodeId: '233',
      paramName: 'value',
      value: Math.max(0, Math.min(1, (cMajor[2].freq - minFreq) / (maxFreq - minFreq))),
    },
  ];
}


