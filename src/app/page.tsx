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
  }, []);

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
    <div className="bg-white shadow-sm rounded-lg mb-8 p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">AI小说世界</h1>
        {currentCharacter && (
          <span className="ml-4">
            角色: {currentCharacter.name}
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        {currentStep !== 'login' && currentStep !== 'character' && (
          <button
            onClick={() => setCurrentStep('character')}
            className="mr-4 text-primary-color hover:underline"
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
            className="text-red-600 hover:text-red-800"
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
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm />
        <ThemeToggle />
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <NavBar />
        
        {/* 根据当前步骤显示不同内容 */}
        {currentStep === 'character' && (
          <div className="max-w-md mx-auto">
            <CharacterManager onCharacterSelected={handleCharacterSelected} />
          </div>
        )}
        
        {currentStep === 'story' && (
          <div className="max-w-md mx-auto">
            <StoryList onStorySelected={handleStorySelected} />
            <div className="mt-8">
              <StoryCreator onStoryCreated={handleStoryCreated} />
            </div>
          </div>
        )}
        
        {currentStep === 'game' && currentStory && (
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
        )}
      </div>
      <ThemeToggle />
    </main>
  );
}
