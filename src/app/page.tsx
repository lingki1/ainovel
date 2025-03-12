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

// 定义应用程序步骤
type AppStep = 'login' | 'character' | 'story' | 'game';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'game' | 'viewer'>('game');
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState<AppStep>('login');
  
  const { 
    user, 
    currentCharacter, 
    currentStory,
    reset 
  } = useUserStore();

  // 确保在客户端渲染
  useEffect(() => {
    setIsClient(true);
    
    // 强制用户每次打开网页时都需要重新登录
    reset();
  }, [reset]);

  // 当用户状态变化时更新步骤
  useEffect(() => {
    if (!user) {
      setCurrentStep('login');
    } else if (!currentCharacter) {
      setCurrentStep('character');
    } else if (!currentStory) {
      setCurrentStep('story');
    } else {
      // 只有在明确选择了故事后才跳转到游戏页面
      // 这里不自动跳转，而是依赖handleStorySelected和handleStoryCreated函数
    }
  }, [user, currentCharacter, currentStory]);

  // 添加处理角色选择的函数
  const handleCharacterSelected = () => {
    // 强制跳转到故事选择页面，无论是否有当前故事
    setCurrentStep('story');
  };

  // 添加处理故事选择的函数
  const handleStorySelected = () => {
    setCurrentStep('game');
  };

  // 添加处理故事创建的函数
  const handleStoryCreated = () => {
    setCurrentStep('game');
  };

  // 添加自动滚动到新内容的功能
  useEffect(() => {
    // 当故事内容更新时，滚动到最新内容
    if (currentStory && currentStep === 'game') {
      const storyContentElement = document.getElementById('story-content');
      if (storyContentElement) {
        storyContentElement.scrollTop = storyContentElement.scrollHeight;
      }
    }
  }, [currentStory, currentStep]);

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

  // 顶部导航栏
  const NavBar = () => (
    <div className="bg-gray-800 dark:bg-gray-800 text-white shadow-md rounded-lg mb-4 sm:mb-8 p-3 sm:p-4 flex justify-between items-center border border-gray-700">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white">AI小说世界</h1>
        {currentCharacter && (
          <span className="ml-2 sm:ml-4 text-sm sm:text-base text-gray-300">
            角色: {currentCharacter.name}
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        {currentStep !== 'login' && currentStep !== 'character' && (
          <button
            onClick={() => setCurrentStep('character')}
            className="mr-2 sm:mr-4 text-sm sm:text-base text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            返回角色选择
          </button>
        )}
        {user && (
          <button
            onClick={() => {
              if (window.confirm('确定要退出登录吗？您的数据将保留在服务器上。')) {
                reset();
              }
            }}
            className="text-sm sm:text-base text-red-400 hover:text-red-300"
          >
            退出登录
          </button>
        )}
      </div>
    </div>
  );

  // 如果用户未登录，显示登录表单
  if (!user) {
    return (
      <main className="min-h-screen py-4 sm:py-12 px-2 sm:px-6 animate-fade-in">
        <LoginForm />
        <ThemeToggle />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-2 sm:py-8 px-1 sm:px-6 animate-fade-in">
      <div className="w-full max-w-full sm:max-w-7xl mx-auto">
        <NavBar />
        
        {/* 根据当前步骤显示不同内容 */}
        {currentStep === 'character' && (
          <div className="w-full max-w-full sm:max-w-md mx-auto animate-slide-in">
            <CharacterManager onCharacterSelected={handleCharacterSelected} />
          </div>
        )}
        
        {currentStep === 'story' && (
          <div className="w-full max-w-full sm:max-w-md mx-auto animate-slide-in">
            <StoryList onStorySelected={handleStorySelected} />
            <div className="mt-4 sm:mt-8">
              <StoryCreator onStoryCreated={handleStoryCreated} />
            </div>
          </div>
        )}
        
        {currentStep === 'game' && currentStory && (
          <div className="animate-slide-in">
            {/* 标签切换 */}
            <div className="bg-gray-800 dark:bg-gray-800 text-white shadow-md rounded-lg mb-3 sm:mb-6 border border-gray-700">
              <div className="flex border-b border-gray-700">
                <button
                  className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center font-medium ${
                    activeTab === 'game'
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'hover:text-indigo-400 text-gray-300'
                  }`}
                  onClick={() => setActiveTab('game')}
                >
                  故事游戏
                </button>
                <button
                  className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center font-medium ${
                    activeTab === 'viewer'
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'hover:text-indigo-400 text-gray-300'
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
        )}
      </div>
      <ThemeToggle />
    </main>
  );
}
