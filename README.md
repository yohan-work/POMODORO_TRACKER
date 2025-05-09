# Pomodoro Team Focus Tracker

팀원들과 함께 포모도로 기법을 활용하여 효율적으로 집중하고 휴식할 수 있는 웹 어플리케이션입니다.

## 주요 기능

- **동시 포모도로 타이머**: 모든 팀원이 함께 25분 집중 / 5분 휴식 주기로 작업
- **실시간 상태 공유**: 현재 누가 집중 중인지 확인 가능 (이모지와 상태 표시)
- **세션 추적**: 각 팀원이 완료한 집중 세션 수 표시
- **자동 성취 메시지**: "누구님 오늘 벌써 3세션째! 몰입왕!" 같은 동기부여 메시지
- **실시간 알림**: Socket.IO를 통한 실시간 업데이트

## 주요 STACK

- **Next.js (v15.3.0)**
- **React (v19.0.0)**
- **TypeScript**
- **Tailwind CSS (v4)**
- **Socket.IO (v4.8.1)**: 양방향 실시간 통신 구현
  - 클라이언트와 서버 간 이벤트 기반 양방향 통신
  - 팀원 상태, 타이머, 메시지의 실시간 동기화
- **커스텀 HTTP 서버**: 표준 Node.js HTTP 서버와 Next.js 통합

### NETWORK / DEPLOY

- **IP 기반 접속**: 로컬 네트워크에서 팀원들이 호스트 IP로 접속 가능
- **크로스 오리진 지원**: CORS 설정으로 다양한 출처의 접속 허용
- **유연한 호스트 감지**: 클라이언트가 자동으로 올바른 서버 주소 감지

## 서버 접근 기술(학습)

1. **네트워크 인터페이스 바인딩**
   - 서버가 `0.0.0.0`에 바인딩되어 모든 네트워크 인터페이스에서 수신 가능
   - `os.networkInterfaces()` API를 사용하여 자동으로 모든 유효한 로컬 IP 주소 감지
2. **자동 IP 주소 표시**
   - 서버 시작 시 모든 유효한 IP 주소를 콘솔에 표시
   - 로컬 및 네트워크 액세스 링크 제공 (`http://192.168.x.x:3000` 형식)
3. **클라이언트 자동 연결**
   - 클라이언트는 `window.location` API를 사용하여 현재 호스트 및 프로토콜 감지
   - 개발/프로덕션 환경에 따라 적절한 소켓 연결 URL 구성
4. **웹소켓 연결 최적화**
   - `ws://` 또는 `wss://` 프로토콜을 자동으로 사용 (HTTP/HTTPS에 따라)
   - 프록시나 추가 설정 없이 직접 소켓 연결 가능

## 실시간 통신 아키텍처

1. **서버 이벤트**

   - `updateState`: 전체 팀 상태 업데이트
   - `newMessage`: 새 메시지 브로드캐스트
   - `initialMessages`: 초기 메시지 기록 전송

2. **클라이언트 이벤트**
   - `join`: 새 사용자 참가
   - `startPomodoro`: 포모도로 타이머 시작
   - `resetPomodoro`: 타이머 재설정
   - `toggleActive`: 활성/비활성 상태 전환

### 필수 사항

- Node.js 18.0.0 이상
- npm 또는 yarn

## H T U ?

1. 첫 화면에서 이름과 이모지를 선택하여 참가
2. 포모도로 타이머 시작하기 버튼을 클릭하여 세션 시작
3. 팀원들의 상태를 실시간으로 확인하며 함께 집중
4. 필요시 '활성화/비활성화' 버튼으로 상태 변경 가능

## 개발자

- [Yohan Choi](https://github.com/yohan-work) - 초기 개발

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

npm run dev:socket
