'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { formatStoryToText } from '@/utils';

export default function StoryViewer() {
  const { currentStory } = useUserStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [showAuthorInput, setShowAuthorInput] = useState(false);

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
  
  const handleShareStory = () => {
    if (!currentStory) return;
    
    // 显示作者名输入框
    setShowAuthorInput(true);
  };
  
  const generateShareLink = () => {
    setIsSharing(true);
    setShareSuccess(false);
    
    if (!currentStory) {
      setIsSharing(false);
      return;
    }
    
    try {
      // 生成分享链接，如果有作者名则添加到URL中
      const baseUrl = `${window.location.origin}/share/${currentStory.id}`;
      const finalUrl = authorName ? `${baseUrl}?author=${encodeURIComponent(authorName)}` : baseUrl;
      setShareUrl(finalUrl);
      setShareSuccess(true);
      
      // 尝试复制到剪贴板
      navigator.clipboard.writeText(finalUrl).catch(err => {
        console.warn('无法复制到剪贴板:', err);
      });
    } catch (error) {
      console.error('生成分享链接失败:', error);
      alert('生成分享链接失败，请稍后再试');
    } finally {
      setIsSharing(false);
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
        <h2 className="text-2xl font-bold">{currentStory.title || '无标题故事'}</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExportStory}
            disabled={isExporting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            {isExporting ? '导出中...' : '导出为文本'}
          </button>
          <button
            onClick={handleShareStory}
            disabled={isSharing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {isSharing ? '生成中...' : '分享故事'}
          </button>
        </div>
      </div>
      
      {/* 分享链接 */}
      {showAuthorInput && !shareSuccess && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-medium text-blue-800 mb-2">分享您的故事</h3>
          <p className="text-blue-700 mb-3">添加您的创作者名字，让读者知道这个精彩故事的作者是谁</p>
          <div className="mb-3">
            <label htmlFor="authorName" className="block text-sm font-medium text-blue-700 mb-1">
              创作者名字 (选填)
            </label>
            <input
              type="text"
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="例如：文学爱好者"
              className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setShowAuthorInput(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              onClick={generateShareLink}
              disabled={isSharing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isSharing ? '生成中...' : '生成分享链接'}
            </button>
          </div>
        </div>
      )}
      
      {shareSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">分享链接已生成！</h3>
          <p className="text-green-700 mb-3">链接已复制到剪贴板，您可以直接粘贴分享给朋友</p>
          <div className="flex items-center mb-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert('链接已复制到剪贴板！');
              }}
              className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              复制
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-green-600">
              {authorName ? `读者将看到您的名字: ${authorName}` : '您没有添加创作者名字'}
            </p>
            <button
              onClick={() => setShowAuthorInput(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {authorName ? '修改名字' : '添加名字'}
            </button>
          </div>
        </div>
      )}
      
      <div className="prose max-w-none">
        {currentStory.content.map((segment, index) => (
          <div key={index} className="mb-6">
            {segment.text.split('\n').map((paragraph, i) => (
              paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
            ))}
            
            {segment.selectedChoice && (
              <div className="my-4 p-3 bg-gray-100 border-l-4 border-gray-500">
                选择: {segment.selectedChoice}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 