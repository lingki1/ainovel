'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import axios from 'axios';

interface StoryListProps {
  onStorySelected?: () => void;
}

export default function StoryList({ onStorySelected }: StoryListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { 
    user,
    currentCharacter, 
    setCurrentStory,
    deleteStory
  } = useUserStore();

  const handleSelectStory = (storyId: string) => {
    if (!currentCharacter) return;
    
    const story = currentCharacter.stories.find(s => s.id === storyId);
    if (story) {
      setCurrentStory(story);
      
      if (onStorySelected) {
        onStorySelected();
      }
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!currentCharacter || !user) return;
    
    if (!window.confirm('确定要删除这个故事吗？此操作不可恢复。')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/story/delete', {
        characterId: currentCharacter.id,
        storyId,
        email: user.email
      });
      
      if (response.data.success) {
        deleteStory(currentCharacter.id, storyId);
        setSuccessMessage('故事已成功删除');
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.data.error || '删除故事失败');
      }
    } catch (error) {
      console.error('删除故事失败:', error);
      setError('删除故事失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentCharacter) {
    return (
      <div className="w-full max-w-full sm:max-w-md mx-auto p-4 sm:p-6 bg-gray-800 dark:bg-gray-800 text-white rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-4 sm:mb-6">我的故事</h2>
        <p className="text-center py-4 text-gray-300">请先选择一个角色</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full sm:max-w-md mx-auto p-4 sm:p-6 bg-gray-800 dark:bg-gray-800 text-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-4 sm:mb-6">我的故事</h2>
      
      {/* 成功消息 */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-800 text-green-200 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* 错误消息 */}
      {error && (
        <div className="mb-4 p-3 bg-red-800 text-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {currentCharacter.stories.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-300 mb-4">您还没有创建任何故事</p>
          <p className="text-sm text-gray-400">请使用下方的&quot;创建新故事&quot;功能开始您的创作之旅</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentCharacter.stories.map(story => (
            <div key={story.id} className="story-card p-4 rounded-lg border border-gray-600 bg-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-lg mb-1 text-white">{story.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">
                    创建于: {story.createdAt}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {story.keywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  disabled={isLoading}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="删除故事"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => handleSelectStory(story.id)}
                disabled={isLoading}
                className="w-full mt-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
              >
                继续这个故事
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 