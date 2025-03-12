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
        console.log('正在获取故事ID:', storyId);
        const response = await axios.get(`/api/story/share?id=${storyId}`);
        if (response.data.success) {
          console.log('获取故事成功:', response.data.data);
          setStory(response.data.data);
        } else {
          console.error('获取故事失败:', response.data.error);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-indigo-300">AI小说世界</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-300"></div>
          </div>
          <p className="mt-4 text-gray-300">正在加载精彩故事...</p>
        </div>
      </div>
    );
  }
  
  if (error || !story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700 text-white">
          <h1 className="text-3xl font-bold mb-4 text-indigo-300">AI小说世界</h1>
          <p className="text-red-400 mb-4">{error || '故事不存在或已被删除'}</p>
          <p className="text-gray-300 mb-6">您可以创建自己的AI生成故事</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            开始创作
          </Link>
          
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-indigo-300 mb-2">AI小说世界 - 释放您的创意</h3>
            <p className="text-gray-300 mb-3">
              使用AI小说世界，您可以创建自己的交互式小说，选择故事发展方向，并与朋友分享您的创作。
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="bg-indigo-900 text-indigo-200 px-3 py-1 rounded-full text-sm">AI驱动</span>
              <span className="bg-indigo-900 text-indigo-200 px-3 py-1 rounded-full text-sm">交互式故事</span>
              <span className="bg-indigo-900 text-indigo-200 px-3 py-1 rounded-full text-sm">免费使用</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 text-white">
          {/* 故事标题 */}
          <div className="bg-indigo-800 p-6 text-white">
            <h1 className="text-3xl font-bold">{story.title || '无标题故事'}</h1>
            <div className="flex flex-wrap items-center justify-between mt-2">
              <p className="text-indigo-200">关键词: {story.keywords.join(', ')}</p>
              {authorName && (
                <p className="text-indigo-200 mt-2 sm:mt-0">
                  <span className="bg-indigo-700 px-3 py-1 rounded-full text-sm">
                    作者: {authorName}
                  </span>
                </p>
              )}
            </div>
          </div>
          
          {/* 故事内容 */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none prose-invert">
              {story.content.map((segment, index) => (
                <div key={index} className="mb-8">
                  {segment.text.split('\n').map((paragraph, i) => (
                    paragraph ? <p key={i} className="mb-4 text-gray-300">{paragraph}</p> : <br key={i} />
                  ))}
                  
                  {segment.selectedChoice && (
                    <div className="my-4 p-3 bg-indigo-900 border-l-4 border-indigo-500 text-indigo-200">
                      选择: {segment.selectedChoice}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* 底部信息 */}
          <div className="bg-gray-700 p-6 border-t border-gray-600">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <div>
                <p className="text-gray-300 mb-1">这个故事由AI生成，通过AI小说世界应用创建</p>
                <p className="text-sm text-gray-400">
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
            <div className="mt-6 p-4 bg-indigo-900 rounded-lg">
              <h3 className="text-xl font-medium text-indigo-200 mb-2">AI小说世界 - 释放您的创意</h3>
              <p className="text-indigo-100 mb-3">
                使用AI小说世界，您可以创建自己的交互式小说，选择故事发展方向，并与朋友分享您的创作。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-indigo-800 p-3 rounded-lg">
                  <h4 className="font-medium text-indigo-200 mb-1">多种AI模型支持</h4>
                  <p className="text-sm text-gray-300">支持Deepseek和Google Gemini等多种AI模型，生成高质量故事内容</p>
                </div>
                <div className="bg-indigo-800 p-3 rounded-lg">
                  <h4 className="font-medium text-indigo-200 mb-1">交互式故事体验</h4>
                  <p className="text-sm text-gray-300">您可以选择故事的发展方向，创造属于自己的独特故事</p>
                </div>
                <div className="bg-indigo-800 p-3 rounded-lg">
                  <h4 className="font-medium text-indigo-200 mb-1">免费使用</h4>
                  <p className="text-sm text-gray-300">完全免费使用，无需付费即可体验AI创作的乐趣</p>
                </div>
                <div className="bg-indigo-800 p-3 rounded-lg">
                  <h4 className="font-medium text-indigo-200 mb-1">分享与导出</h4>
                  <p className="text-sm text-gray-300">轻松分享您的故事，或导出为文本文件保存</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-indigo-700 text-indigo-200 px-3 py-1 rounded-full text-sm">AI驱动</span>
                <span className="bg-indigo-700 text-indigo-200 px-3 py-1 rounded-full text-sm">交互式故事</span>
                <span className="bg-indigo-700 text-indigo-200 px-3 py-1 rounded-full text-sm">多种AI模型</span>
                <span className="bg-indigo-700 text-indigo-200 px-3 py-1 rounded-full text-sm">免费使用</span>
                <span className="bg-indigo-700 text-indigo-200 px-3 py-1 rounded-full text-sm">无需注册</span>
                <span className="bg-indigo-700 text-indigo-200 px-3 py-1 rounded-full text-sm">简单易用</span>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/"
                  className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
                >
                  立即开始创作
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 