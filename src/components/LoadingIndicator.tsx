'use client';

import { useState, useEffect } from 'react';

interface LoadingIndicatorProps {
  message?: string;
  isLoading: boolean;
}

export default function LoadingIndicator({ message = '正在加载...', isLoading }: LoadingIndicatorProps) {
  const [dots, setDots] = useState('');
  
  // 动态加载点效果
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading]);
  
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
        <h3 className="text-lg font-medium text-center text-gray-800 mb-2">
          {message}
        </h3>
        <p className="text-center text-gray-600">
          您的故事/小说正在创作中{dots}<br />
          <span className="text-sm">生成速度取决于当前网络和AI算力</span>
        </p>
      </div>
    </div>
  );
} 