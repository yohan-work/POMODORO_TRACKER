import React from "react";
import { PomodoroStatus } from "@/types";

interface PomodoroTimerProps {
  status: PomodoroStatus;
  timeRemaining: number;
  onStart: () => void;
  onReset: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  status,
  timeRemaining,
  onStart,
  onReset,
}) => {
  // 시간을 분:초 형식으로 변환
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 상태에 따른 배경색
  const getBgColor = () => {
    switch (status) {
      case PomodoroStatus.FOCUS:
        return "bg-red-500";
      case PomodoroStatus.BREAK:
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  // 상태에 따른 텍스트
  const getStatusText = () => {
    switch (status) {
      case PomodoroStatus.FOCUS:
        return "집중 시간";
      case PomodoroStatus.BREAK:
        return "휴식 시간";
      default:
        return "준비";
    }
  };

  return (
    <div
      className={`rounded-lg shadow-lg ${getBgColor()} p-8 text-white max-w-md mx-auto text-center transition-colors`}
    >
      <h2 className="text-2xl font-bold mb-2">{getStatusText()}</h2>
      <div className="text-6xl font-bold mb-6">{formatTime(timeRemaining)}</div>

      <div className="flex justify-center space-x-4">
        {status === PomodoroStatus.IDLE && (
          <button
            onClick={onStart}
            className="px-6 py-2 bg-white text-gray-800 rounded-full font-bold hover:bg-gray-100 transition"
          >
            시작하기
          </button>
        )}

        {status !== PomodoroStatus.IDLE && (
          <button
            onClick={onReset}
            className="px-6 py-2 bg-white text-gray-800 rounded-full font-bold hover:bg-gray-100 transition"
          >
            재설정
          </button>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
