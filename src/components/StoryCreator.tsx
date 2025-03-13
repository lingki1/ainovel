'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import axios from 'axios';
import LoadingIndicator from './LoadingIndicator';
import { ApiProvider } from '@/types';
import { setApiProvider, getApiProvider, UserPreference } from '@/lib/ai';
import UserPreferences from './UserPreferences';

interface StoryCreatorProps {
  onStoryCreated?: () => void;
}

export default function StoryCreator({ onStoryCreated }: StoryCreatorProps) {
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiProviderInfo, setShowApiProviderInfo] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
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

  // 处理用户偏好变更
  const handlePreferenceChange = (preferences: UserPreference[]) => {
    // 只记录日志，不保存状态
    console.log('用户偏好已更新:', preferences);
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

  // 创建故事
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCharacter || !user) {
      setError('请先选择或创建一个角色');
      return;
    }
    
    // 验证关键词 - 支持中英文逗号和空格作为分隔符
    const keywordList = keywords
      .replace(/，/g, ',') // 将中文逗号替换为英文逗号
      .split(/[,\s]+/) // 按英文逗号或空格分割
      .map(k => k.trim())
      .filter(k => k); // 过滤空字符串
      
    if (keywordList.length < 2 || keywordList.length > 10) {
      setError('请输入2-10个关键词');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 确保使用当前选择的API提供商
      console.log('创建故事前的API提供商:', getApiProvider());
      console.log('处理后的关键词列表:', keywordList);
      
      const response = await axios.post('/api/story/create', {
        characterId: currentCharacter.id,
        keywords: keywordList,
        email: user.email
      });
      
      if (response.data.success) {
        const newStory = response.data.data;
        
        // 添加故事到角色
        addStory(currentCharacter.id, newStory);
        
        // 设置当前故事
        setCurrentStory(newStory);
        
        // 调用回调函数
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

  if (!currentCharacter) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">请先选择或创建一个角色</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white">创建新故事</h2>
      <p className="mb-6 text-gray-300">
        为角色 <span className="font-medium text-indigo-400">{currentCharacter.name}</span> 创建一个新故事
      </p>
      
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex space-x-2">
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
              <div className="absolute left-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg z-10 border border-gray-600">
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
          
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center text-sm px-3 py-1 rounded-md border border-purple-600 hover:bg-purple-700 text-white"
          >
            <span>{showPreferences ? '隐藏偏好设置' : '故事偏好设置'}</span>
          </button>
        </div>
      </div>
      
      {/* 用户偏好设置面板 */}
      {showPreferences && (
        <div className="mb-6">
          <UserPreferences onPreferenceChange={handlePreferenceChange} />
        </div>
      )}
      
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