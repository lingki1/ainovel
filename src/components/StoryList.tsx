'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { ApiProvider, Story } from '@/types';
import { setApiProvider } from '@/lib/ai';
import axios from 'axios';

interface StoryListProps {
  onStorySelected?: () => void;
}

export default function StoryList({ onStorySelected }: StoryListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    currentCharacter, 
    currentStory,
    setCurrentStory,
    user,
    setCurrentCharacter,
    updateApiSettings,
    deleteStory
  } = useUserStore();

  const handleSelectStory = (story: Story, characterId?: string) => {
    // 如果提供了角色ID且与当前角色不同，先切换角色
    if (characterId && (!currentCharacter || currentCharacter.id !== characterId)) {
      const character = user?.characters.find(c => c.id === characterId);
      if (character) {
        setCurrentCharacter(character);
      }
    }
    
    // 如果选择的是当前故事，也要触发回调
    const isChangingStory = !currentStory || currentStory.id !== story.id;
    
    // 设置当前故事
    setCurrentStory(story);
    
    // 如果是切换故事或者强制触发，则触发回调
    if ((isChangingStory || !currentCharacter) && onStorySelected) {
      onStorySelected();
    }
  };

  // 切换API提供商
  const handleChangeApiProvider = async (provider: ApiProvider) => {
    if (!user || !currentCharacter || currentCharacter.stories.length === 0) return;
    
    try {
      console.log('切换API提供商:', provider);
      
      // 更新用户的API设置
      updateApiSettings({ provider });
      
      // 设置AI服务的当前提供商
      setApiProvider(provider);
      
      // 向服务器发送更新请求
      const response = await axios.post('/api/auth/updateSettings', {
        email: user.email,
        apiSettings: { provider }
      });
      
      if (response.data.success) {
        console.log('API提供商更新成功:', response.data.data.provider);
        
        // 如果有故事，选择第一个故事并跳转到游戏页面
        if (currentCharacter.stories.length > 0) {
          handleSelectStory(currentCharacter.stories[0]);
        }
      } else {
        console.error('API提供商更新失败:', response.data.error);
      }
    } catch (error) {
      console.error('更新API提供商时出错:', error);
    }
  };

  // 删除故事
  const handleDeleteStory = async (storyId: string, characterId: string, event: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发故事选择
    event.stopPropagation();
    
    if (!user?.email) {
      setError('用户信息不完整，请重新登录');
      return;
    }
    
    // 添加删除确认
    if (!window.confirm('确定要删除此故事吗？故事数据会被永久清除，可以在 完整故事 标签中导出故事内容。')) {
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/story/delete', {
        storyId,
        characterId,
        email: user.email
      });
      
      if (response.data.success) {
        // 更新本地状态
        deleteStory(characterId, storyId);
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

  // 如果没有选择角色，显示所有角色的故事列表
  if (!currentCharacter && user) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">所有故事</h2>
        
        {user.characters.length === 0 ? (
          <p className="text-gray-500 text-center py-4">请先创建一个角色</p>
        ) : (
          <div className="space-y-6">
            {user.characters.map(character => (
              <div key={character.id} className="space-y-3">
                <h3 className="text-lg font-medium text-gray-700">{character.name}的故事</h3>
                
                {character.stories.length === 0 ? (
                  <p className="text-gray-500 py-2">暂无故事</p>
                ) : (
                  <div className="space-y-2">
                    {character.stories.map(story => (
                      <div 
                        key={story.id}
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-highlight-color transition-colors relative"
                        onClick={() => handleSelectStory(story, character.id)}
                      >
                        <h4 className="font-medium text-gray-800">{story.title || '无标题故事'}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          关键词: {story.keywords.join(', ')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          更新于: {new Date(story.updatedAt).toLocaleString()}
                        </p>
                        
                        {/* 删除按钮 */}
                        <button
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                          onClick={(e) => handleDeleteStory(story.id, character.id, e)}
                          disabled={isLoading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!currentCharacter) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">我的故事</h2>
        <p className="text-gray-500 text-center py-4">请先选择一个角色</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">我的故事</h2>
      
      {/* 如果有故事，显示API提供商选择 */}
      {currentCharacter.stories.length > 0 && user && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择AI提供商并开始创作
          </label>
          <div className="flex space-x-2 mb-4">
            <button
              type="button"
              onClick={() => handleChangeApiProvider(ApiProvider.DEEPSEEK)}
              className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                user.apiSettings?.provider === ApiProvider.DEEPSEEK 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Deepseek
            </button>
            <button
              type="button"
              onClick={() => handleChangeApiProvider(ApiProvider.GOOGLE)}
              className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                user.apiSettings?.provider === ApiProvider.GOOGLE 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Google
            </button>
          </div>
        </div>
      )}
      
      {currentCharacter.stories.length === 0 ? (
        <p className="text-gray-500 text-center py-4">您还没有创建任何故事</p>
      ) : (
        <div className="space-y-3">
          {currentCharacter.stories.map(story => (
            <div 
              key={story.id}
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-highlight-color transition-colors relative"
              onClick={() => handleSelectStory(story)}
            >
              <h4 className="font-medium text-gray-800">{story.title || '无标题故事'}</h4>
              <p className="text-sm text-gray-500 mt-1">
                关键词: {story.keywords.join(', ')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                更新于: {new Date(story.updatedAt).toLocaleString()}
              </p>
              
              {/* 删除按钮 */}
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                onClick={(e) => handleDeleteStory(story.id, currentCharacter.id, e)}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          处理中...
        </div>
      )}
    </div>
  );
} 