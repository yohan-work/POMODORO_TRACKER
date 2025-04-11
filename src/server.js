const { createServer } = require("http");
const { Server: SocketIOServer } = require("socket.io");
const { parse } = require("url");
const next = require("next");
const { v4: uuidv4 } = require("uuid");
const os = require("os");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

// 포모도로 상태 정의
const PomodoroStatus = {
  IDLE: "idle",
  FOCUS: "focus",
  BREAK: "break",
};

// 초기 팀 상태
const initialTeamState = {
  status: PomodoroStatus.IDLE,
  timeRemaining: 0,
  focusDuration: 25 * 60, // 25분
  breakDuration: 5 * 60, // 5분
  users: [],
};

// 현재 팀 상태
let teamState = { ...initialTeamState };

// 메시지 저장
let messages = [];

// 타이머 ID
let timerId = null;

// 서버의 로컬 IP 주소 가져오기
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];
    for (const info of interfaceInfo) {
      // IPv4 주소만 필터링하고 내부 루프백 주소는 제외
      if (info.family === "IPv4" && !info.internal) {
        addresses.push(info.address);
      }
    }
  }

  return addresses;
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Socket.IO 서버 설정 - 모든 출처 허용
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // 소켓 연결 처리
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // 초기 상태 전송
    socket.emit("updateState", teamState);

    if (messages.length > 0) {
      socket.emit("initialMessages", messages);
    }

    // 사용자 참가
    socket.on("join", (userData) => {
      const newUser = {
        id: socket.id,
        name: userData.name || "익명",
        emoji: userData.emoji || "👤",
        isActive: true,
        sessionsCompleted: 0,
        color: userData.color || "#FFFFFF",
      };

      teamState.users.push(newUser);
      io.emit("updateState", teamState);

      // 환영 메시지 생성
      const welcomeMessage = {
        id: uuidv4(),
        text: `${newUser.name}님이 입장했습니다! 환영합니다.`,
        timestamp: Date.now(),
      };
      messages.push(welcomeMessage);
      io.emit("newMessage", welcomeMessage);
    });

    // 포모도로 시작
    socket.on("startPomodoro", () => {
      teamState.status = PomodoroStatus.FOCUS;
      teamState.timeRemaining = teamState.focusDuration;
      io.emit("updateState", teamState);

      // 타이머 시작
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        teamState.timeRemaining -= 1;
        io.emit("updateState", teamState);

        // 타이머 종료 체크
        if (teamState.timeRemaining <= 0) {
          if (teamState.status === PomodoroStatus.FOCUS) {
            // 휴식 시간으로 전환
            teamState.status = PomodoroStatus.BREAK;
            teamState.timeRemaining = teamState.breakDuration;

            // 세션 완료 수 증가
            teamState.users = teamState.users.map((user) => ({
              ...user,
              sessionsCompleted: user.isActive
                ? user.sessionsCompleted + 1
                : user.sessionsCompleted,
            }));

            // 성취 메시지 생성
            const activeUsers = teamState.users.filter((user) => user.isActive);
            if (activeUsers.length > 0) {
              activeUsers.forEach((user) => {
                if (user.sessionsCompleted > 0) {
                  const achievementMessage = {
                    id: uuidv4(),
                    text: `🎉 ${user.name}님 오늘 벌써 ${user.sessionsCompleted}세션째! 몰입왕!`,
                    timestamp: Date.now(),
                  };
                  messages.push(achievementMessage);
                  io.emit("newMessage", achievementMessage);
                }
              });
            }
          } else if (teamState.status === PomodoroStatus.BREAK) {
            // 준비 상태로 전환
            teamState.status = PomodoroStatus.IDLE;
            if (timerId) clearInterval(timerId);
            timerId = null;
          }
          io.emit("updateState", teamState);
        }
      }, 1000);
    });

    // 포모도로 재설정
    socket.on("resetPomodoro", () => {
      if (timerId) clearInterval(timerId);
      timerId = null;
      teamState.status = PomodoroStatus.IDLE;
      teamState.timeRemaining = 0;
      io.emit("updateState", teamState);
    });

    // 활성 상태 토글
    socket.on("toggleActive", () => {
      teamState.users = teamState.users.map((user) => {
        if (user.id === socket.id) {
          return { ...user, isActive: !user.isActive };
        }
        return user;
      });
      io.emit("updateState", teamState);
    });

    // 연결 해제
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // 사용자 찾기
      const disconnectedUser = teamState.users.find(
        (user) => user.id === socket.id
      );

      // 사용자 제거
      teamState.users = teamState.users.filter((user) => user.id !== socket.id);

      // 모든 사용자가 나가면 타이머 재설정
      if (teamState.users.length === 0) {
        if (timerId) clearInterval(timerId);
        timerId = null;
        teamState = { ...initialTeamState };
      }

      io.emit("updateState", teamState);

      // 사용자가 나갔다는 메시지 생성
      if (disconnectedUser) {
        const leaveMessage = {
          id: uuidv4(),
          text: `${disconnectedUser.name}님이 퇴장했습니다.`,
          timestamp: Date.now(),
        };
        messages.push(leaveMessage);
        io.emit("newMessage", leaveMessage);
      }
    });
  });

  // 0.0.0.0으로 바인딩하여 모든 네트워크 인터페이스에서 접근 가능하게 함
  server.listen(port, "0.0.0.0", () => {
    console.log(`> Ready on http://localhost:${port}`);

    // 로컬 IP 주소들을 표시
    const ipAddresses = getLocalIpAddresses();
    if (ipAddresses.length > 0) {
      console.log("> Also accessible via:");
      ipAddresses.forEach((ip) => {
        console.log(`> http://${ip}:${port}`);
      });
    } else {
      console.log("> No external IP addresses found");
    }
  });
});
