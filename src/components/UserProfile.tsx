import React, { useState } from 'react';

const EMOJIS = ['👩‍💻', '👨‍💻', '🧑‍💻', '👩‍🔬', '👨‍🔬', '👩‍🏫', '👨‍🏫', '🧑‍🏫', '🧠', '💪', '🔥', '✨', '🚀', '🌟'];

interface UserProfileProps {
  onSubmit: (name: string, emoji: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onSubmit }) => {
  const [name, setName] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('👩‍💻');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name, selectedEmoji);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">프로필 설정</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            이름
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이름을 입력하세요"
            required
          />
        </div>
        
        <div className="mb-6">
          <p className="block text-sm font-medium text-gray-700 mb-2">
            이모지 선택
          </p>
          <div className="grid grid-cols-7 gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`text-2xl p-2 rounded-md hover:bg-gray-100 ${
                  selectedEmoji === emoji ? 'bg-blue-100 border-2 border-blue-500' : ''
                }`}
                onClick={() => setSelectedEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          참가하기
        </button>
      </form>
    </div>
  );
};

export default UserProfile; 