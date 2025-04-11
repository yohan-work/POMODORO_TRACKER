import { Server } from "socket.io";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { User, TeamPomodoroState, PomodoroStatus, Message } from "@/types";

// 서버 인스턴스를 저장
let io: any;

// 초기 팀 상태
const initialTeamState: TeamPomodoroState = {
  status: PomodoroStatus.IDLE,
  timeRemaining: 0,
  focusDuration: 25 * 60, // 25분
  breakDuration: 5 * 60, // 5분
  users: [],
};

// 현재 팀 상태
let teamState: TeamPomodoroState = { ...initialTeamState };

// 메시지 저장
let messages: Message[] = [];

// 타이머 ID
let timerId: NodeJS.Timeout | null = null;

export async function GET() {
  if (!io) {
    // API Routes에 Socket.IO 서버 설정
    // @ts-ignore
    const res: any = { socket: { server: { io: undefined } } };
    io = new Server(res.socket.server);

    res.socket.server.io = io;

    io.on("connection", (socket: any) => {
      console.log("A user connected:", socket.id);

      // 사용자 참가
      socket.on("join", (userData: Partial<User>) => {
        const newUser: User = {
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
        const welcomeMessage: Message = {
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
              const activeUsers = teamState.users.filter(
                (user) => user.isActive
              );
              if (activeUsers.length > 0) {
                activeUsers.forEach((user) => {
                  if (
                    user.sessionsCompleted > 0 &&
                    user.sessionsCompleted % 1 === 0
                  ) {
                    const achievementMessage: Message = {
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
        teamState.users = teamState.users.filter(
          (user) => user.id !== socket.id
        );

        // 모든 사용자가 나가면 타이머 재설정
        if (teamState.users.length === 0) {
          if (timerId) clearInterval(timerId);
          timerId = null;
          teamState = { ...initialTeamState };
        }

        io.emit("updateState", teamState);

        // 사용자가 나갔다는 메시지 생성
        if (disconnectedUser) {
          const leaveMessage: Message = {
            id: uuidv4(),
            text: `${disconnectedUser.name}님이 퇴장했습니다.`,
            timestamp: Date.now(),
          };
          messages.push(leaveMessage);
          io.emit("newMessage", leaveMessage);
        }
      });
    });
  }

  return NextResponse.json({ success: true });
}
