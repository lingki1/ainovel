'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import axios from 'axios';
import { ApiProvider } from '@/types';
import { setApiProvider, getApiProvider, UserPreference } from '@/lib/ai';
import UserPreferences from './UserPreferences';
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
  const [showPreferences, setShowPreferences] = useState(false);
  
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
          if (shouldScrollToNewContent) {
            // 使用setTimeout确保DOM已经完全渲染
            setTimeout(() => {
              if (newContentRef.current) {
                console.log('尝试滚动到新内容:', newContentRef.current);
                newContentRef.current.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
                console.log('滚动到新内容完成');
              } else {
                console.warn('无法找到新内容元素');
                // 如果找不到新内容元素，则滚动到故事内容的底部
                if (storyContentRef.current) {
                  storyContentRef.current.scrollTop = storyContentRef.current.scrollHeight;
                  console.log('滚动到故事底部');
                }
              }
              setShouldScrollToNewContent(false);
            }, 300); // 增加延迟时间，确保DOM完全渲染
          }
        }
      }
    }
  }, [currentStory, lastContentId, shouldScrollToNewContent]);

  // 处理用户偏好变更
  const handlePreferenceChange = (preferences: UserPreference[]) => {
    // 只记录日志，不保存状态
    console.log('用户偏好已更新:', preferences);
  };

  // 渲染故事内容
  const renderStoryContent = () => {
    if (!currentStory || !currentCharacter) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            请先创建一个角色和故事，然后开始你的冒险！
          </p>
        </div>
      );
    }

    if (currentStory.content.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            故事即将开始，点击下方按钮生成故事选项...
          </p>
        </div>
      );
    }

    return (
      <div 
        ref={storyContentRef}
        className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none overflow-y-auto max-h-[60vh] pb-4"
        id="story-content"
      >
        {currentStory.content.map((content, index) => {
          const isLastContent = index === currentStory.content.length - 1;
          const isNewContent = content.id === lastContentId || 
                              (lastContentId && index === currentStory.content.findIndex(item => item.id === lastContentId) + 1);
          
          return (
            <div 
              key={content.id} 
              ref={isNewContent && index === currentStory.content.findIndex(item => item.id === lastContentId) + 1 ? newContentRef : null}
              className={`mb-6 ${isNewContent ? 'animate-fadeIn bg-gray-700 bg-opacity-20 p-2 rounded' : ''}`}
              id={isNewContent && index === currentStory.content.findIndex(item => item.id === lastContentId) + 1 ? 'new-content' : undefined}
            >
              {content.type === 'ai' ? (
                <div className="whitespace-pre-wrap">{content.text}</div>
              ) : (
                <div className="my-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md border-l-4 border-blue-500 italic">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">你选择了:</p>
                  <p className="font-medium">{content.selectedChoice}</p>
                </div>
              )}
              
              {!isLastContent && (
                <div className="border-b border-gray-200 dark:border-gray-700 my-6"></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 生成故事选项
  const handleGenerateOptions = async () => {
    if (!currentStory || !currentCharacter || !user) {
      setError('请先创建角色和故事');
      return;
    }

    try {
      setIsLoadingOptions(true);
      setError('');
      
      console.log('发送生成选项请求，故事ID:', currentStory.id);

      const response = await axios.post('/api/story/options', {
        storyContent: currentStory.content,
        characterId: currentCharacter.id,
        storyId: currentStory.id,
        email: user.email
      });
      
      console.log('生成选项响应:', response.data);

      if (response.data.success) {
        setOptions(response.data.data.options);
      } else {
        setError(response.data.error || '生成选项失败');
      }
    } catch (error) {
      console.error('生成选项错误:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data: unknown; 
            status: number; 
            headers: unknown 
          }; 
          request?: unknown;
          message?: string;
        };
        
        if (axiosError.response) {
          console.error('错误响应数据:', axiosError.response.data);
          console.error('错误状态码:', axiosError.response.status);
        } else if (axiosError.request) {
          console.error('请求未收到响应:', axiosError.request);
        } else if (axiosError.message) {
          console.error('错误消息:', axiosError.message);
        }
      }
      setError('生成选项时发生错误，请稍后再试');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // 选择故事选项
  const handleChooseOption = async (choice: string) => {
    if (!currentStory || !currentCharacter || !user) {
      setError('请先创建角色和故事');
      return;
    }

    try {
      setIsLoadingContinue(true);
      setError('');

      // 保存当前最后一个内容的ID，用于后续滚动定位
      const lastContent = currentStory.content[currentStory.content.length - 1];
      if (lastContent) {
        console.log('设置最后内容ID:', lastContent.id);
        setLastContentId(lastContent.id);
      }
      
      console.log('发送继续故事请求，选择:', choice);

      const response = await axios.post('/api/story/continue', {
        storyContent: currentStory.content,
        characterId: currentCharacter.id,
        storyId: currentStory.id,
        choice,
        wordCount,
        email: user.email
      });
      
      console.log('继续故事响应:', response.data);

      if (response.data.success) {
        // 更新故事内容
        updateStory(currentCharacter.id, response.data.data.story);
        
        // 清空选项并重置自定义选项状态
        setOptions([]);
        setShowCustomOption(false);
        setCustomOption('');
        
        // 设置滚动标志，触发滚动到新内容
        console.log('设置滚动标志为true');
        
        // 使用setTimeout确保状态更新后再设置滚动标志
        setTimeout(() => {
          setShouldScrollToNewContent(true);
        }, 100);
      } else {
        setError(response.data.error || '继续故事失败');
      }
    } catch (error) {
      console.error('继续故事错误:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data: unknown; 
            status: number; 
            headers: unknown 
          }; 
          request?: unknown;
          message?: string;
        };
        
        if (axiosError.response) {
          console.error('错误响应数据:', axiosError.response.data);
          console.error('错误状态码:', axiosError.response.status);
        } else if (axiosError.request) {
          console.error('请求未收到响应:', axiosError.request);
        } else if (axiosError.message) {
          console.error('错误消息:', axiosError.message);
        }
      }
      setError('继续故事时发生错误，请稍后再试');
    } finally {
      setIsLoadingContinue(false);
    }
  };

  // 提交自定义选项
  const handleSubmitCustomOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (customOption.trim()) {
      handleChooseOption(customOption.trim());
    }
  };

  // 切换API提供商
  const handleChangeApiProvider = async (provider: ApiProvider) => {
    try {
      console.log('尝试切换API提供商:', provider);
      
      // 先设置本地API提供商
      setApiProvider(provider);
      
      // 更新用户的API设置
      if (user) {
        // 更新本地状态
        updateApiSettings({ provider });
        
        // 发送请求到服务器更新设置
        const response = await axios.post('/api/auth/updateSettings', {
          email: user.email,
          apiSettings: { provider }
        });
        
        if (response.data.success) {
          console.log('API提供商更新成功:', response.data.data.provider);
        } else {
          console.error('API提供商更新失败:', response.data.error);
          setError('更新API提供商失败: ' + response.data.error);
        }
      } else {
        console.warn('无法更新API提供商: 用户未登录');
        setError('请先登录再更改API提供商');
      }
      
      setShowApiProviderInfo(false);
    } catch (error) {
      console.error('切换API提供商错误:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data: unknown; 
            status: number; 
          }; 
          message?: string;
        };
        
        if (axiosError.response) {
          console.error('错误响应数据:', axiosError.response.data);
          console.error('错误状态码:', axiosError.response.status);
        } else if (axiosError.message) {
          console.error('错误消息:', axiosError.message);
        }
      }
      setError('切换API提供商时发生错误，请稍后再试');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 加载指示器 */}
      <LoadingIndicator 
        isLoading={isLoadingOptions} 
        message="正在生成故事选项..." 
      />
      <LoadingIndicator 
        isLoading={isLoadingContinue} 
        message="正在继续故事..." 
      />
      
      {/* 标题和API提供商信息 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">
          {currentStory?.title || '开始你的故事'}
        </h1>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          {/* 用户偏好设置按钮 */}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            {showPreferences ? '隐藏偏好设置' : '故事偏好设置'}
          </button>
          
          {/* API提供商切换按钮 */}
          <div className="relative">
            <button
              onClick={() => setShowApiProviderInfo(!showApiProviderInfo)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              AI提供商: {getApiProvider()}
            </button>
            
            {showApiProviderInfo && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <button
                    onClick={() => handleChangeApiProvider(ApiProvider.DEEPSEEK)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Deepseek
                  </button>
                  <button
                    onClick={() => handleChangeApiProvider(ApiProvider.GOOGLE)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Google
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 用户偏好设置面板 */}
      {showPreferences && (
        <div className="mb-6">
          <UserPreferences onPreferenceChange={handlePreferenceChange} />
        </div>
      )}
      
      {/* 故事内容 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        {renderStoryContent()}
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