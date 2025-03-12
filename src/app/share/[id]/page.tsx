'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Story } from '@/types';

export default function SharePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storyId = params.id as string;
  const authorName = searchParams.get('author');
  
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/story/share?id=${storyId}`);
        if (response.data.success) {
          setStory(response.data.data);
        } else {
          setError(response.data.error || '获取故事失败');
        }
      } catch (error) {
        console.error('获取故事失败:', error);
        setError('获取故事失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (storyId) {
      fetchStory();
    }
  }, [storyId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-indigo-800">AI小说世界</h1>
          <p className="text-gray-600">正在加载故事...</p>
        </div>
      </div>
    );
  }
  
  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-indigo-800">AI小说世界</h1>
          <p className="text-red-500 mb-4">{error || '故事不存在或已被删除'}</p>
          <p className="text-gray-600 mb-6">您可以创建自己的AI生成故事</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            开始创作
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 故事标题 */}
          <div className="bg-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold">{story.title || '无标题故事'}</h1>
            <div className="flex flex-wrap items-center justify-between mt-2">
              <p className="text-indigo-100">关键词: {story.keywords.join(', ')}</p>
              {authorName && (
                <p className="text-indigo-100 mt-2 sm:mt-0">
                  <span className="bg-indigo-500 px-3 py-1 rounded-full text-sm">
                    作者: {authorName}
                  </span>
                </p>
              )}
            </div>
          </div>
          
          {/* 故事内容 */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              {story.content.map((segment, index) => (
                <div key={index} className="mb-8">
                  {segment.text.split('\n').map((paragraph, i) => (
                    paragraph ? <p key={i} className="mb-4">{paragraph}</p> : <br key={i} />
                  ))}
                  
                  {segment.selectedChoice && (
                    <div className="my-4 p-3 bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700">
                      选择: {segment.selectedChoice}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* 底部信息 */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <div>
                <p className="text-gray-600 mb-1">这个故事由AI生成，通过AI小说世界应用创建</p>
                <p className="text-sm text-gray-500">
                  创建于: {new Date(story.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link 
                  href="/"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  创建我的故事
                </Link>
              </div>
            </div>
            
            {/* 应用推广 */}
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-medium text-indigo-800 mb-2">AI小说世界 - 释放您的创意</h3>
              <p className="text-indigo-700 mb-3">
                使用AI小说世界，您可以创建自己的交互式小说，选择故事发展方向，并与朋友分享您的创作。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">AI驱动</span>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">交互式故事</span>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">多种AI模型</span>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">免费使用</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 