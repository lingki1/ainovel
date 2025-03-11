'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import axios from 'axios';
import { formatDate } from '@/utils';

export default function StoryGame() {
  const [options, setOptions] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(200);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    user,
    currentCharacter, 
    currentStory, 
    updateStory 
  } = useUserStore();

  const handleGenerateOptions = async () => {
    if (!currentStory || !currentCharacter || !user) return;
    
    setError('');
    setIsLoadingOptions(true);
    
    try {
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

  if (!currentStory || !currentCharacter) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">故事游戏</h2>
        <p className="text-gray-500 text-center py-4">请先选择一个故事</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">故事游戏</h2>
      
      {/* 最新的故事内容 */}
      <div className="mb-6 prose max-w-none">
        {currentStory.content.slice(-1).map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="whitespace-pre-line">{item.text}</p>
          </div>
        ))}
      </div>
      
      {/* 字数控制 */}
      <div className="mb-6">
        <label htmlFor="wordCount" className="block text-sm font-medium mb-1">
          续写字数 (100-500)
        </label>
        <input
          id="wordCount"
          type="range"
          min="100"
          max="500"
          step="50"
          value={wordCount}
          onChange={(e) => setWordCount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm">
          <span>100字</span>
          <span>{wordCount}字</span>
          <span>500字</span>
        </div>
      </div>
      
      {/* 错误信息 */}
      {error && (
        <div className="mb-4 text-red-500 text-sm">{error}</div>
      )}
      
      {/* 选项列表 */}
      {options.length > 0 ? (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-medium">选择故事发展方向:</h3>
          
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleChooseOption(option)}
              disabled={isLoadingContinue}
              className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-highlight-color focus:outline-none focus:ring-2 focus:ring-primary-color disabled:opacity-50 transition-colors story-option"
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={handleGenerateOptions}
          disabled={isLoadingOptions}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors mb-4"
        >
          {isLoadingOptions ? '生成选项中...' : '生成故事选项'}
        </button>
      )}
      
      {isLoadingContinue && (
        <div className="text-center">
          正在继续故事...
        </div>
      )}
    </div>
  );
} 