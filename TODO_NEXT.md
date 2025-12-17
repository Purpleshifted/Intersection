# 내일 할 작업 정리

## 완료된 작업 ✅

1. ✅ 오디오 시작 버튼 중복 제거 (글로벌/모바일 둘 다)
2. ✅ 모바일 뷰에 할당받은 음 표시 추가 (상단 좌측)
3. ✅ 중력 상호작용 반경 확대: 1500 → 2500
4. ✅ 궁합 좋은 공들끼리 더 쉽게 붙게: 중력 강도 최대 3배 → 5배

---

## 남은 작업 목록

### 1. 비주얼 개선

#### 1.1. 모바일 뷰 입자 turbulence 일렁임 효과
- **위치**: `src/lib/game/renderer.ts`의 `renderParticleBall` 함수
- **요구사항**: 
  - 단순 확대가 아니라 상대 입자에 이끌려서 turbulence 일렁이는 효과
  - 더 organic한 느낌
- **구현 방향**:
  - 중력 방향(`gravityDir`)에 따라 파티클이 일렁이도록
  - Perlin noise 또는 sine wave 기반 turbulence 추가
  - 파티클 위치에 시간 기반 오프셋 적용

#### 1.2. 글로벌 뷰 orbit 모드 개선
- **위치**: `src/components/global/GlobalPerspectiveView.tsx`
- **현재 상태**: 사용자가 cloud plane을 제거하고 회전 속도를 0.25로 낮춤
- **요구사항**:
  - 각 파티클이 속한 plane을 반투명 재질로 된 cloud처럼 렌더
  - 입자가 여럿 들어오면 안개 속에 박힌 입자들처럼 보이게
  - 회전 속도 더 빠르게 (현재 0.25 → 더 빠르게)
  - 한 축이 아니라 두 축 다 활용해서 다양한 앵글 보이도록
  - 드래그로 조절 가능한 현재 상태는 그대로 유지
- **구현 방향**:
  - `PlayerParticleSphere` 주변에 반투명 cloud plane 추가
  - `MeshStandardMaterial`로 반투명 재질 생성 (opacity: 0.15)
  - `OrbitControls`의 `autoRotateSpeed` 증가
  - `minPolarAngle`, `maxPolarAngle` 범위 확대하여 다양한 앵글 허용

---

### 2. 오디오 개선

#### 2.1. 화성 progression 더 다채롭게
- **위치**: `realtime/src/globalAudioV2/` 또는 NoiseCraft 패치 파일
- **요구사항**: 화성 progression이 더 다채롭게
- **구현 방향**:
  - `GlobalSequencer`의 progression 로직 개선
  - 더 많은 화성 전환 패턴 추가
  - 코드 진행(progression) 다양화

#### 2.2. 두 공 만날 때 효과음 크게 + reverb
- **위치**: `realtime/src/index.ts`의 `detectCollisions` 또는 NoiseCraft 패치
- **요구사항**: 
  - 두 공이 만났을 때 울리는 효과음이 더 크게
  - reverb가 퍼져나가도록
- **구현 방향**:
  - 충돌 이벤트 발생 시 NoiseCraft에 메시지 전송
  - 효과음 gain 증가
  - Reverb 노드 파라미터 조정

---

### 3. 버그 수정

#### 3.1. 서버 꺼졌을 때 글로벌 뷰 공 사라짐 문제
- **위치**: `src/lib/socket/createClient.ts`, `src/lib/socket/events.ts`
- **문제**: 서버가 도중에 꺼지면 인디비주얼은 잘 조작 중인데 글로벌 뷰에서 공이 사라져버림
- **원인 추정**: 
  - 재연결 시 글로벌 뷰의 플레이어 목록이 업데이트되지 않음
  - `onPlayerMove` 핸들러가 재연결 후 제대로 동작하지 않음
- **구현 방향**:
  - 재연결 시 글로벌 뷰 플레이어 목록 초기화 및 재동기화
  - `reconnect` 이벤트 핸들러에서 플레이어 상태 복원
  - `serverTellPlayerMove` 이벤트가 재연결 후에도 정상 수신되는지 확인

#### 3.2. 소리/비주얼 버퍼링 문제
- **위치**: 전반적인 성능 최적화
- **문제**: 소리에 아직 버퍼링이 살짝 있음 (비주얼도...)
- **구현 방향**:
  - WebSocket 메시지 처리 최적화
  - 렌더링 프레임레이트 최적화
  - NoiseCraft iframe과의 메시지 전송 빈도 조절
  - `requestAnimationFrame` 최적화

---

## 우선순위 제안

### 높은 우선순위 (핵심 기능)
1. **서버 재연결 문제** - 사용자 경험에 직접적 영향
2. **모바일 뷰 turbulence 효과** - 비주얼 피드백 개선

### 중간 우선순위 (비주얼 개선)
3. **글로벌 뷰 orbit 모드 개선** - 사용자가 이미 일부 수정함
4. **오디오 효과음 개선** - 게임 경험 향상

### 낮은 우선순위 (성능 최적화)
5. **버퍼링 문제** - 점진적 개선 가능

---

## 참고사항

- 사용자가 `GlobalPerspectiveView.tsx`에서 cloud plane을 제거하고 회전 속도를 0.25로 낮춤
- 이는 의도적인 변경으로 보이므로, orbit 모드 개선 시 이 변경사항을 고려해야 함
- 글로벌 뷰의 cloud 효과는 다시 추가하되, 사용자가 조정한 회전 속도는 유지하거나 약간만 증가

---

## 관련 파일 목록

### 비주얼
- `src/lib/game/renderer.ts` - 모바일 뷰 파티클 렌더링
- `src/components/global/GlobalPerspectiveView.tsx` - 글로벌 뷰 3D 렌더링
- `src/components/global/PlayerParticleSphere.tsx` - 파티클 구 컴포넌트

### 오디오
- `realtime/src/globalAudioV2/sequencer.ts` - 화성 progression
- `realtime/src/index.ts` - 충돌 감지 및 효과음
- `noisecraft/examples/indiv_audio_map_v2.ncft` - NoiseCraft 패치 파일

### 네트워크/재연결
- `src/lib/socket/createClient.ts` - 소켓 클라이언트 생성
- `src/lib/socket/events.ts` - 소켓 이벤트 핸들러
- `src/components/shared/ConnectionStatus.tsx` - 연결 상태 표시

