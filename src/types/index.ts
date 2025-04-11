// User 타입 정의
export interface User {
  id: string;
  name: string;
  emoji?: string;
  isActive: boolean;
  sessionsCompleted: number;
  color?: string;
}

// 포모도로 상태 타입 정의
export enum PomodoroStatus {
  IDLE = "idle",
  FOCUS = "focus",
  BREAK = "break",
}

// 팀 포모도로 상태 타입 정의
export interface TeamPomodoroState {
  status: PomodoroStatus;
  timeRemaining: number;
  focusDuration: number;
  breakDuration: number;
  users: User[];
}

// 메시지 타입 정의
export interface Message {
  id: string;
  text: string;
  timestamp: number;
}
