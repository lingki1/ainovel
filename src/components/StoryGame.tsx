'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import axios from 'axios';
import { formatDate } from '@/utils';
import { ApiProvider } from '@/types';
import { setApiProvider, getApiProvider } from '@/lib/ai';
import LoadingIndicator from './LoadingIndicator';

export default function StoryGame() {
  const [options, setOptions] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(750); // 默认750字
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [error, setError] = useState('');
  const [customOption, setCustomOption] = useState('');
  const [showCustomOption, setShowCustomOption] = useState(false);
  const [lastContentId, setLastContentId] = useState<string | null>(null);
  const [showApiProviderInfo, setShowApiProviderInfo] = useState(false);
  
  // 故事内容滚动区域的引用
  const storyContentRef = useRef<HTMLDivElement>(null);
  const newContentRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToNewContent, setShouldScrollToNewContent] = useState(false);
  
  const { 
    user,
    currentCharacter, 
    currentStory, 
    updateStory,
    updateApiSettings
  } = useUserStore();

  // 当组件加载时，设置当前API提供商
  useEffect(() => {
    if (user?.apiSettings?.provider) {
      console.log('组件加载时设置API提供商:', user.apiSettings.provider);
      setApiProvider(user.apiSettings.provider);
    }
  }, [user]);

  // 当故事内容更新时，滚动到最新内容
  useEffect(() => {
    if (storyContentRef.current && currentStory?.content) {
      // 如果有新内容添加，滚动到新内容的开始位置
      if (lastContentId && currentStory.content.length > 0) {
        const lastContentIndex = currentStory.content.findIndex(item => item.id === lastContentId);
        if (lastContentIndex >= 0 && lastContentIndex < currentStory.content.length - 1) {
          // 找到新内容的DOM元素
          const newContentElement = document.getElementById(currentStory.content[lastContentIndex + 1].id);
          if (newContentElement) {
            setTimeout(() => {
              newContentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }
      }
    }
  }, [currentStory?.content, lastContentId]);

  // 处理滚动到新内容
  useEffect(() => {
    if (shouldScrollToNewContent && newContentRef.current) {
      setTimeout(() => {
        if (newContentRef.current) {
          newContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      setShouldScrollToNewContent(false);
    }
  }, [shouldScrollToNewContent]);

  const handleGenerateOptions = async () => {
    if (!currentStory || !currentCharacter || !user) return;
    
    setError('');
    setIsLoadingOptions(true);
    setShowCustomOption(false);
    
    try {
      // 确保使用当前选择的API提供商
      console.log('生成选项前的API提供商:', getApiProvider());
      
      const response = await axios.post('/api/story/options', {
        storyContent: currentStory.content,
        characterName: currentCharacter.name,
        email: user.email,
        characterId: currentCharacter.id,
        storyId: currentStory.id
      });
      
      if (response.data.success && response.data.data) {
        setOptions(response.data.data);
      } else {
        setError(response.data.error || '生成选项失败');
      }
    } catch (error) {
      console.error('生成选项失败:', error);
      setError('生成选项失败，请稍后再试');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleChooseOption = async (choice: string) => {
    if (!currentStory || !currentCharacter || !user) return;
    
    setError('');
    setIsLoadingContinue(true);
    
    try {
      // 确保使用当前选择的API提供商
      console.log('继续故事前的API提供商:', getApiProvider());
      
      // 记录当前最后一个内容的ID，用于滚动定位
      if (currentStory.content.length > 0) {
        setLastContentId(currentStory.content[currentStory.content.length - 1].id);
      }
      
      const response = await axios.post('/api/story/continue', {
        storyContent: currentStory.content,
        choice,
        wordCount,
        characterName: currentCharacter.name,
        email: user.email,
        characterId: currentCharacter.id,
        storyId: currentStory.id
      });
      
      if (response.data.success && response.data.data) {
        const newContent = [...currentStory.content, ...response.data.data];
        
        const updatedStory = {
          ...currentStory,
          content: newContent,
          updatedAt: formatDate()
        };
        
        updateStory(currentCharacter.id, updatedStory);
        setOptions([]);
        setCustomOption('');
        setShowCustomOption(false);
        
        // 设置标志，指示需要滚动到新内容
        setShouldScrollToNewContent(true);
        
        // 记录新添加的玩家选择内容ID，用于滚动定位
        if (response.data.data.length > 0) {
          setLastContentId(response.data.data[0].id);
        }
      } else {
        setError(response.data.error || '继续故事失败');
      }
    } catch (error) {
      console.error('继续故事失败:', error);
      setError('继续故事失败，请稍后再试');
    } finally {
      setIsLoadingContinue(false);
    }
  };

  const handleSubmitCustomOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (customOption.trim().length > 0) {
      handleChooseOption(customOption);
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

  if (!currentStory || !currentCharacter) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-gray-800 dark:bg-gray-800 text-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">故事游戏</h2>
        <p className="text-center py-4 text-gray-300">请先选择一个故事</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 dark:bg-gray-800 text-white rounded-lg shadow-md overflow-hidden border border-gray-700">
      {/* 加载提示 */}
      <LoadingIndicator 
        isLoading={isLoadingOptions || isLoadingContinue} 
        message={isLoadingOptions ? "生成故事选项中" : "续写故事中"}
      />
      
      {/* 标题栏 */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">{currentStory.title || '无标题故事'}</h2>
        
        {/* API提供商选择 - 移到右侧并使用下拉菜单样式 */}
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
      
      {/* 故事内容 */}
      <div 
        id="story-content"
        ref={storyContentRef}
        className="p-4 h-[400px] sm:h-[500px] overflow-y-auto bg-gray-800 text-white"
      >
        {currentStory?.content.map((segment, index) => (
          <div 
            key={segment.id} 
            id={segment.id}
            className={`mb-6 ${
              index === currentStory.content.length - 1 && shouldScrollToNewContent
                ? 'animate-highlight'
                : ''
            }`}
            ref={index === currentStory.content.length - 1 ? newContentRef : null}
          >
            {segment.text.split('\n').map((paragraph, i) => (
              paragraph ? <p key={i} className="mb-4 text-gray-200">{paragraph}</p> : <br key={i} />
            ))}
            
            {segment.selectedChoice && (
              <div className="my-4 p-3 bg-gray-700 border-l-4 border-indigo-500 text-gray-200">
                选择: {segment.selectedChoice}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 故事选项 */}
      <div className="p-4 border-t border-gray-700 bg-gray-700">
        {error && (
          <div className="mb-4 p-3 bg-red-800 text-red-200 rounded-md">
            {error}
          </div>
        )}
        
        {isLoadingOptions || isLoadingContinue ? (
          <div className="text-center py-4">
            <p className="text-gray-300">
              {isLoadingOptions ? '正在生成故事选项...' : '正在继续故事...'}
            </p>
          </div>
        ) : options.length > 0 ? (
          <div>
            <h3 className="text-lg font-medium mb-3 text-white">选择故事发展方向:</h3>
            <div className="space-y-2">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleChooseOption(option)}
                  className="w-full text-left p-3 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-200"
                >
                  {option}
                </button>
              ))}
              
              {!showCustomOption ? (
                <button
                  onClick={() => setShowCustomOption(true)}
                  className="w-full text-left p-3 bg-indigo-900 border border-indigo-700 text-indigo-200 rounded-md hover:bg-indigo-800 transition-colors"
                >
                  自定义选项...
                </button>
              ) : (
                <form onSubmit={handleSubmitCustomOption} className="space-y-2 mt-2">
                  <textarea
                    value={customOption}
                    onChange={(e) => setCustomOption(e.target.value)}
                    placeholder="请输入您想要的故事发展方向..."
                    className="w-full p-3 border border-gray-600 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={!customOption.trim()}
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
                    >
                      确认
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomOption(false);
                        setCustomOption('');
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={handleGenerateOptions}
              disabled={isLoadingOptions || !currentStory || currentStory.content.length === 0}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              生成故事选项
            </button>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                字数设置
              </label>
              <select
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={250}>短 (约250字)</option>
                <option value={500}>中 (约500字)</option>
                <option value={750}>长 (约750字)</option>
                <option value={1000}>超长 (约1000字)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 