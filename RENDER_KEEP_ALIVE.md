# Render 서비스 자동 켜두기 가이드

Render 무료 플랜은 15분 비활성 시 슬립 모드로 전환됩니다. 이를 방지하는 방법들:

## 방법 1: Health Check 엔드포인트 추가 + 외부 Ping 서비스 (권장) ⭐

### 1-1. Health Check 엔드포인트 추가

각 서버에 간단한 health check 엔드포인트를 추가합니다.

### 1-2. 외부 서비스로 주기적으로 Ping

**UptimeRobot** (무료):
1. [UptimeRobot](https://uptimerobot.com) 가입
2. "Add New Monitor" 클릭
3. 설정:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `Intersection Realtime Keep-Alive`
   - **URL**: `https://intersection-realtime.onrender.com/health`
   - **Monitoring Interval**: 5분
4. NoiseCraft 서버도 동일하게 추가

**또는 cron-job.org** (무료):
1. [cron-job.org](https://cron-job.org) 가입
2. "Create cronjob" 클릭
3. 설정:
   - **Title**: `Keep Render Alive`
   - **Address**: `https://intersection-realtime.onrender.com/health`
   - **Schedule**: Every 5 minutes

---

## 방법 2: 서비스 간 주기적 통신

프론트엔드에서 주기적으로 백엔드 서버에 요청을 보내서 슬립 모드를 방지합니다.

---

## 방법 3: Render Starter 플랜 사용 (유료)

- **$7/월** × 2개 서비스 = **$14/월**
- Always On - 슬립 모드 없음
- 더 빠른 응답 시간

---

## 방법 4: Health Check + Render Auto-Deploy

Render의 health check 기능을 활용하여 서비스가 응답하지 않으면 자동으로 재시작합니다.

---

## 구현 방법

### Realtime 서버에 Health Check 추가

`realtime/src/index.ts`에 추가:

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});
```

### NoiseCraft 서버에 Health Check 추가

`noisecraft/server.js`에 추가:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});
```

### 외부 서비스 설정

**UptimeRobot** (추천):
- 무료 플랜: 50개 모니터, 5분 간격
- 설정 간단, 안정적

**cron-job.org**:
- 무료 플랜: 무제한 cron job
- 더 세밀한 스케줄링 가능

---

## 추천 조합

1. **Health Check 엔드포인트 추가** ✅
2. **UptimeRobot으로 5분마다 ping** ✅
3. 필요시 **Render Starter 플랜** 업그레이드

이렇게 하면 서비스가 항상 깨어있게 유지됩니다!

