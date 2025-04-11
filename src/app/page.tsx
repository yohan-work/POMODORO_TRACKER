"use client";

import { useState, useEffect } from "react";
import UserProfile from "@/components/UserProfile";
import PomodoroTimer from "@/components/PomodoroTimer";
import UserList from "@/components/UserList";
import MessageList from "@/components/MessageList";
import { useSocket } from "@/hooks/useSocket";
import { User } from "@/types";

export default function Home() {
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const {
    isConnected,
    teamState,
    messages,
    joinSession,
    startPomodoro,
    resetPomodoro,
    toggleActive,
    getCurrentUser,
  } = useSocket();

  // 사용자 프로필 등록
  const handleProfileSubmit = (name: string, emoji: string) => {
    joinSession({ name, emoji });
    setIsJoined(true);
  };

  // 현재 사용자
  const currentUser = getCurrentUser() as User | null;

  if (!isJoined) {
    return (
      <main className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-gray-600 text-3xl text-gray-600 font-bold text-center mb-8">
            포모도로 팀 집중 트래커
          </h1>
          <UserProfile onSubmit={handleProfileSubmit} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-gray-600 text-3xl font-bold text-center mb-2">
          포모도로 팀 집중 트래커
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isConnected ? "연결됨" : "연결 중..."}
        </p>

        <div className="mb-8">
          <PomodoroTimer
            status={teamState.status}
            timeRemaining={teamState.timeRemaining}
            onStart={startPomodoro}
            onReset={resetPomodoro}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserList
            users={teamState.users}
            currentStatus={teamState.status}
            currentUserId={currentUser?.id}
            onToggleActive={toggleActive}
          />
          <MessageList messages={messages} />
        </div>
      </div>
    </main>
  );
}
