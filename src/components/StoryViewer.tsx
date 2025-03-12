'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { saveAs } from 'file-saver';
import axios from 'axios';

export default function StoryViewer() {
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const storyContainerRef = useRef<HTMLDivElement>(null);
  
  const { currentStory } = useUserStore();
  
  // 当故事加载时，滚动到顶部
  useEffect(() => {
    if (currentStory && storyContainerRef.current) {
      storyContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStory]);
  
  if (!currentStory) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-gray-400">请先创建或选择一个故事</p>
      </div>
    );
  }
  
  const handleExportStory = async () => {
    try {
      setIsLoading(true);
      
      // 构建故事文本
      let storyText = `${currentStory.title || '无标题故事'}\n`;
      storyText += `关键词: ${currentStory.keywords.join(', ')}\n\n`;
      
      currentStory.content.forEach((segment) => {
        storyText += segment.text + '\n\n';
        
        if (segment.selectedChoice) {
          storyText += `选择: ${segment.selectedChoice}\n\n`;
        }
      });
      
      storyText += `\n创建于: ${new Date(currentStory.createdAt).toLocaleString()}`;
      storyText += `\n由AI小说世界生成 - https://ainovel.example.com`;
      
      // 创建Blob对象
      const blob = new Blob([storyText], { type: 'text/plain;charset=utf-8' });
      
      // 使用file-saver保存文件
      saveAs(blob, `${currentStory.title || '故事'}.txt`);
      
      alert('故事已成功导出为文本文件');
    } catch (error) {
      console.error('导出故事失败:', error);
      alert('导出故事失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenShareModal = () => {
    setShareUrl(''); // 清空之前的分享链接
    setShowShareModal(true);
  };
  
  const handleShareStory = async () => {
    try {
      setIsLoading(true);
      
      // 调用API创建分享链接
      const response = await axios.post('/api/story/share', {
        story: currentStory,
        authorName: authorName.trim() || '匿名用户'
      });
      
      if (response.data.success) {
        const shareId = response.data.shareId;
        const author = response.data.authorName;
        const shareLink = `${window.location.origin}/share/${shareId}?author=${encodeURIComponent(author)}`;
        setShareUrl(shareLink);
      } else {
        throw new Error(response.data.error || '创建分享链接失败');
      }
    } catch (error) {
      console.error('分享故事失败:', error);
      alert('创建分享链接时出错，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
        alert('链接已复制到剪贴板');
      })
      .catch(() => {
        alert('无法复制链接，请手动复制');
      });
  };
  
  return (
    <div className="space-y-4" ref={storyContainerRef}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {/* 标题栏和操作按钮 */}
        <div className="bg-indigo-800 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{currentStory.title || '无标题故事'}</h2>
            <div className="text-indigo-200 text-sm mt-1">关键词: {currentStory.keywords.join(', ')}</div>
          </div>
          
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button
              onClick={handleOpenShareModal}
              disabled={isLoading}
              className="flex items-center text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              分享故事
            </button>
            <button
              onClick={handleExportStory}
              disabled={isLoading}
              className="flex items-center text-sm px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              导出为文本
            </button>
          </div>
        </div>
        
        {/* 故事内容 */}
        <div className="p-4">
          <div className="prose prose-invert max-w-none">
            {currentStory.content.map((segment, index) => (
              <div key={index} className="mb-6">
                {segment.text.split('\n').map((paragraph, i) => (
                  paragraph ? <p key={i} className="mb-3 text-gray-300">{paragraph}</p> : <br key={i} />
                ))}
                
                {segment.selectedChoice && (
                  <div className="my-3 p-2 bg-indigo-900 border-l-4 border-indigo-500 text-indigo-200">
                    选择: {segment.selectedChoice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 分享链接弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-700 text-white">
            <h3 className="text-xl font-bold mb-4">分享您的故事</h3>
            
            {!shareUrl ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="authorName" className="block text-sm font-medium mb-1">
                      您的名字 (可选)
                    </label>
                    <input
                      id="authorName"
                      type="text"
                      placeholder="输入您的名字或昵称"
                      value={authorName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthorName(e.target.value)}
                      className="w-full p-2 border border-gray-600 bg-gray-700 rounded-md text-white"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      您的名字将显示在分享页面上，如不填写则显示为&ldquo;匿名用户&rdquo;
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={handleShareStory} 
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? '正在生成分享链接...' : '生成分享链接'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shareUrl" className="block text-sm font-medium mb-1">
                      分享链接
                    </label>
                    <div className="flex">
                      <input
                        id="shareUrl"
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 p-2 border border-gray-600 bg-gray-700 rounded-l-md text-white"
                      />
                      <button 
                        onClick={handleCopyShareUrl}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
                      >
                        复制
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      复制此链接并分享给您的朋友，他们可以查看您的故事
                    </p>
                  </div>
                </div>
                
                {copySuccess && (
                  <p className="text-green-400 mt-2">链接已复制到剪贴板!</p>
                )}
                
                <div className="mt-6 flex justify-between">
                  <button 
                    onClick={() => {
                      setShareUrl('');
                      setAuthorName('');
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    创建新的分享链接
                  </button>
                  
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    关闭
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 