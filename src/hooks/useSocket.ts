import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { TeamPomodoroState, User, Message, PomodoroStatus } from "@/types";

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [teamState, setTeamState] = useState<TeamPomodoroState>({
    status: PomodoroStatus.IDLE,
    timeRemaining: 0,
    focusDuration: 25 * 60,
    breakDuration: 5 * 60,
    users: [],
  });
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // 소켓 초기화
    const initSocket = async () => {
      // 서버 URL 설정 - 개발 환경에서는 자동 감지, 프로덕션에서는 환경변수나 window.location 사용
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      const port = window.location.port || "3000";
      const socketUrl =
        process.env.NODE_ENV === "production"
          ? `${protocol}//${host}` // 프로덕션에서는 같은 도메인 사용
          : `${protocol}//${host}:${port}`; // 개발 환경

      console.log(`Connecting to socket at: ${socketUrl}`);

      if (!socket) {
        socket = io(socketUrl);
      }

      // 소켓 이벤트 리스너
      socket.on("connect", () => {
        console.log("Socket connected!");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected!");
        setIsConnected(false);
      });

      socket.on("updateState", (newState: TeamPomodoroState) => {
        console.log("Got updated state:", newState);
        setTeamState(newState);
      });

      socket.on("newMessage", (message: Message) => {
        console.log("New message:", message);
        setMessages((prev) => [...prev, message]);
      });

      socket.on("initialMessages", (initialMessages: Message[]) => {
        console.log("Initial messages:", initialMessages);
        setMessages(initialMessages);
      });
    };

    initSocket();

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("updateState");
        socket.off("newMessage");
        socket.off("initialMessages");
      }
    };
  }, []);

  // 사용자 참가
  const joinSession = useCallback((userData: Partial<User>) => {
    if (socket) {
      socket.emit("join", userData);
    }
  }, []);

  // 포모도로 시작
  const startPomodoro = useCallback(() => {
    if (socket) {
      socket.emit("startPomodoro");
    }
  }, []);

  // 포모도로 재설정
  const resetPomodoro = useCallback(() => {
    if (socket) {
      socket.emit("resetPomodoro");
    }
  }, []);

  // 활성 상태 토글
  const toggleActive = useCallback(() => {
    if (socket) {
      socket.emit("toggleActive");
    }
  }, []);

  // 현재 사용자 정보 가져오기
  const getCurrentUser = useCallback(() => {
    if (!socket) return null;
    return teamState.users.find((user) => user.id === socket.id);
  }, [teamState.users]);

  return {
    isConnected,
    teamState,
    messages,
    joinSession,
    startPomodoro,
    resetPomodoro,
    toggleActive,
    getCurrentUser,
  };
};
