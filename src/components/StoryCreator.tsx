'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import axios from 'axios';
import { ApiProvider } from '@/types';
import { setApiProvider } from '@/lib/ai';

interface StoryCreatorProps {
  onStoryCreated?: () => void;
}

export default function StoryCreator({ onStoryCreated }: StoryCreatorProps) {
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    user,
    currentCharacter, 
    addStory, 
    setCurrentStory,
    updateApiSettings
  } = useUserStore();

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keywords.trim()) {
      setError('请输入故事关键词');
      return;
    }
    
    if (!currentCharacter) {
      setError('请先选择一个角色');
      return;
    }

    if (!user) {
      setError('用户信息不完整，请重新登录');
      return;
    }
    
    // 将关键词拆分为数组
    const keywordArray = keywords
      .split(/[,，、\s]+/)
      .filter(k => k.trim().length > 0)
      .map(k => k.trim());
    
    if (keywordArray.length < 2 || keywordArray.length > 10) {
      setError('请输入2-10个关键词');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/story/create', {
        characterId: currentCharacter.id,
        keywords: keywordArray,
        characterName: currentCharacter.name,
        email: user.email
      });
      
      if (response.data.success && response.data.data) {
        const newStory = response.data.data;
        addStory(currentCharacter.id, newStory);
        setCurrentStory(newStory);
        setKeywords('');
        
        if (onStoryCreated) {
          onStoryCreated();
        }
      } else {
        setError(response.data.error || '创建故事失败');
      }
    } catch (error) {
      console.error('创建故事失败:', error);
      setError('创建故事失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 切换API提供商
  const handleChangeApiProvider = async (provider: ApiProvider) => {
    if (!user) return;
    
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
      } else {
        console.error('API提供商更新失败:', response.data.error);
        setError('更新API提供商失败');
      }
    } catch (error) {
      console.error('更新API提供商时出错:', error);
      setError('更新API提供商失败，请稍后再试');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">创建新故事</h2>
      
      {/* API提供商选择 */}
      {user && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            选择AI提供商
          </label>
          <div className="flex space-x-2 mb-2">
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
      
      <form onSubmit={handleCreateStory} className="space-y-4">
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
            故事关键词 (2-10个，用逗号分隔)
          </label>
          <input
            id="keywords"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="例如: 魔法, 冒险, 森林, 宝藏"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            输入2-10个关键词，AI将根据这些关键词生成故事开端
          </p>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !currentCharacter}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '创建中...' : '创建故事'}
        </button>
        
        {!currentCharacter && (
          <p className="text-amber-600 text-sm text-center">
            请先选择或创建一个角色
          </p>
        )}
      </form>
    </div>
  );
} 