'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { formatStoryToText } from '@/utils';

export default function StoryViewer() {
  const { currentStory } = useUserStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportStory = () => {
    if (!currentStory) return;
    
    setIsExporting(true);
    
    try {
      // 格式化故事内容
      const storyText = formatStoryToText(currentStory.content);
      
      // 创建Blob对象
      const blob = new Blob([storyText], { type: 'text/plain;charset=utf-8' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentStory.title}.txt`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出故事失败:', error);
      alert('导出故事失败，请稍后再试');
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentStory) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">我的故事</h2>
        <p className="text-center py-4">请先选择一个故事</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{currentStory.title}</h2>
        
        <button
          onClick={handleExportStory}
          disabled={isExporting}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isExporting ? '导出中...' : '导出故事'}
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm">
          创建于 {new Date(currentStory.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm">
          关键词: {currentStory.keywords.join(', ')}
        </p>
      </div>
      
      <div className="prose max-w-none">
        {currentStory.content.map((item) => (
          <div key={item.id} className="mb-6">
            {item.type === 'ai' ? (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="whitespace-pre-line">{item.text}</p>
              </div>
            ) : (
              <div className="bg-highlight-color p-3 rounded border-l-4 border-highlight-border">
                <p className="font-medium">选择: {item.selectedChoice}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 