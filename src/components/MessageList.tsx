import React, { useEffect, useRef } from "react";
import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 왔을 때 자동 스크롤
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 시간 포맷팅
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="rounded-lg shadow-lg bg-white p-4 h-[300px] flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-600">메시지</h2>

      <div className="flex-1 overflow-auto mb-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-gray-600">
            아직 메시지가 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="p-2 rounded bg-gray-100">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-600">{message.text}</p>
                  <span className="text-xs text-gray-600 text-gray-500 ml-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
