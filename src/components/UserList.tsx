import React from "react";
import { User, PomodoroStatus } from "@/types";

interface UserListProps {
  users: User[];
  currentStatus: PomodoroStatus;
  currentUserId?: string;
  onToggleActive: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  currentStatus,
  currentUserId,
  onToggleActive,
}) => {
  // 사용자 상태에 따른 스타일
  const getUserStatusStyle = (user: User) => {
    if (!user.isActive) return "opacity-50";
    if (currentStatus === PomodoroStatus.FOCUS)
      return "border-red-500 border-2";
    if (currentStatus === PomodoroStatus.BREAK)
      return "border-green-500 border-2";
    return "";
  };

  return (
    <div className="rounded-lg shadow-lg bg-white p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-600">팀원 현황</h2>

      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-gray-500 text-center text-gray-600">
            참가한 팀원이 없습니다.
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`text-gray-600 flex items-center justify-between p-3 rounded-lg ${getUserStatusStyle(
                user
              )}`}
            >
              <div className="flex items-center">
                <div className="text-2xl mr-2">{user.emoji}</div>
                <div>
                  <div className="font-medium">
                    {user.name} {user.id === currentUserId && "(나)"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.sessionsCompleted > 0
                      ? `${user.sessionsCompleted}개 세션 완료`
                      : "아직 완료한 세션 없음"}
                  </div>
                </div>
              </div>

              {user.id === currentUserId && (
                <button
                  onClick={onToggleActive}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    user.isActive
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.isActive ? "비활성화" : "활성화"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
