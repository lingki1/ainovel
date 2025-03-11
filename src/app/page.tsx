'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import LoginForm from '@/components/LoginForm';
import CharacterManager from '@/components/CharacterManager';
import StoryCreator from '@/components/StoryCreator';
import StoryList from '@/components/StoryList';
import StoryViewer from '@/components/StoryViewer';
import StoryGame from '@/components/StoryGame';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'game' | 'viewer'>('game');
  const [isClient, setIsClient] = useState(false);
  
  const { 
    user, 
    currentCharacter, 
    currentStory,
    reset 
  } = useUserStore();

  // 确保在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 如果不是客户端渲染，显示加载中
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">AI小说世界</h1>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示登录表单
  if (!user) {
    return (
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm />
        <ThemeToggle />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 顶部导航栏 */}
        <div className="bg-white shadow-sm rounded-lg mb-8 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">AI小说世界</h1>
            {currentCharacter && (
              <span className="ml-4">
                角色: {currentCharacter.name}
              </span>
            )}
          </div>
          
          <button
            onClick={() => {
              if (window.confirm('确定要退出登录吗？您的数据将保留在服务器上。')) {
                reset();
              }
            }}
            className="text-red-600 hover:text-red-800"
          >
            退出登录
          </button>
        </div>
        
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 左侧边栏 */}
          <div className="space-y-8">
            <CharacterManager />
            <StoryCreator />
            <StoryList />
          </div>
          
          {/* 右侧内容区域 */}
          <div className="md:col-span-2">
            {currentStory ? (
              <div>
                {/* 标签切换 */}
                <div className="bg-white shadow-sm rounded-lg mb-6">
                  <div className="flex border-b">
                    <button
                      className={`flex-1 py-3 px-4 text-center font-medium ${
                        activeTab === 'game'
                          ? 'text-primary-color border-b-2 border-primary-color'
                          : 'hover:text-primary-color'
                      }`}
                      onClick={() => setActiveTab('game')}
                    >
                      故事游戏
                    </button>
                    <button
                      className={`flex-1 py-3 px-4 text-center font-medium ${
                        activeTab === 'viewer'
                          ? 'text-primary-color border-b-2 border-primary-color'
                          : 'hover:text-primary-color'
                      }`}
                      onClick={() => setActiveTab('viewer')}
                    >
                      完整故事
                    </button>
                  </div>
                </div>
                
                {/* 内容区域 */}
                {activeTab === 'game' ? <StoryGame /> : <StoryViewer />}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">欢迎来到AI小说世界</h2>
                <p className="mb-6">
                  请从左侧选择一个故事，或者创建一个新故事开始您的冒险
                </p>
                <div className="flex justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ThemeToggle />
    </main>
  );
}
