'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import axios from 'axios';
import LoadingIndicator from './LoadingIndicator';
import { ApiProvider } from '@/types';
import { setApiProvider, getApiProvider } from '@/lib/ai';

interface StoryCreatorProps {
  onStoryCreated?: () => void;
}

export default function StoryCreator({ onStoryCreated }: StoryCreatorProps) {
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiProviderInfo, setShowApiProviderInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    user,
    currentCharacter, 
    addStory, 
    setCurrentStory,
    updateApiSettings
  } = useUserStore();

  // 当组件加载时，设置当前API提供商
  useEffect(() => {
    if (user?.apiSettings?.provider) {
      console.log('StoryCreator组件加载时设置API提供商:', user.apiSettings.provider);
      setApiProvider(user.apiSettings.provider);
    }
  }, [user]);

  // 当组件挂载时滚动到顶部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

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
        // 隐藏API提供商选择区域
        setShowApiProviderInfo(false);
      } else {
        console.error('API提供商更新失败:', response.data.error);
        setError('更新API提供商失败');
      }
    } catch (error) {
      console.error('更新API提供商时出错:', error);
      setError('更新API提供商失败，请稍后再试');
    }
  };

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
    
    // 检查故事数量限制
    if (currentCharacter.stories.length >= 4) {
      setError('每个角色最多只能创建4个故事');
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
      // 确保使用当前选择的API提供商
      console.log('创建故事前的API提供商:', getApiProvider());
      
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

  return (
    <div ref={containerRef} className="w-full max-w-md mx-auto p-6 bg-gray-800 dark:bg-gray-800 text-white rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">创建新故事</h2>
      
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="relative">
          <button
            onClick={() => setShowApiProviderInfo(!showApiProviderInfo)}
            className="flex items-center text-sm px-3 py-1 rounded-md border border-gray-600 hover:bg-gray-700 text-white"
          >
            <span>API: {user?.apiSettings?.provider || 'deepseek'}</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showApiProviderInfo && (
            <div className="absolute right-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg z-10 border border-gray-600">
              <div className="p-3">
                <p className="text-sm mb-2 text-gray-300">选择AI提供商:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleChangeApiProvider(ApiProvider.DEEPSEEK)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                      user?.apiSettings?.provider === ApiProvider.DEEPSEEK 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    Deepseek
                  </button>
                  <button
                    onClick={() => handleChangeApiProvider(ApiProvider.GOOGLE)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                      user?.apiSettings?.provider === ApiProvider.GOOGLE 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    Google
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <LoadingIndicator 
        isLoading={isLoading} 
        message="创建故事中"
      />
      
      <form onSubmit={handleCreateStory} className="space-y-4">
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-300 mb-1">
            故事关键词 (2-10个，用逗号分隔)
          </label>
          <input
            id="keywords"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="例如: 魔法, 冒险, 森林, 宝藏"
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            required
          />
          <p className="mt-1 text-sm text-gray-400">
            输入2-10个关键词，AI将根据这些关键词生成故事开端
          </p>
        </div>
        
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !currentCharacter}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '创建中...' : '创建故事'}
        </button>
        
        {!currentCharacter && (
          <p className="text-amber-400 text-sm text-center">
            请先选择或创建一个角色
          </p>
        )}
      </form>
    </div>
  );
} 