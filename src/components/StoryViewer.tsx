'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { saveAs } from 'file-saver';

export default function StoryViewer() {
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const { currentCharacter, currentStory } = useUserStore();

  const handleExportStory = () => {
    if (!currentStory) return;
    
    setIsLoading(true);
    
    try {
      // 构建故事文本
      let storyText = `${currentStory.title || '无标题故事'}\n\n`;
      
      currentStory.content.forEach(segment => {
        storyText += segment.text + '\n\n';
        
        if (segment.selectedChoice) {
          storyText += `选择: ${segment.selectedChoice}\n\n`;
        }
      });
      
      // 创建Blob对象
      const blob = new Blob([storyText], { type: 'text/plain;charset=utf-8' });
      
      // 使用file-saver保存文件
      saveAs(blob, `${currentStory.title || '我的故事'}.txt`);
    } catch (error) {
      console.error('导出故事失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareStory = () => {
    // 这里简化为显示一个模拟的分享链接
    setShareUrl(`${window.location.origin}/share/demo-story-id`);
    setShowShareModal(true);
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  if (!currentStory || !currentCharacter) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-gray-800 dark:bg-gray-800 text-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">完整故事</h2>
        <p className="text-center py-4 text-gray-300">请先选择一个故事</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 dark:bg-gray-800 text-white rounded-lg shadow-md overflow-hidden border border-gray-700">
      {/* 标题栏 */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">{currentStory.title || '无标题故事'}</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={handleExportStory}
            className="flex items-center text-sm px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出
          </button>
          
          <button
            onClick={handleShareStory}
            className="flex items-center text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享
          </button>
        </div>
      </div>
      
      {/* 故事内容 */}
      <div className="p-4 h-[500px] overflow-y-auto bg-gray-800 text-white">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="prose prose-lg max-w-none">
            {currentStory.content.map((segment) => (
              <div key={segment.id} className="mb-6">
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
        )}
      </div>
      
      {/* 分享链接弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">分享故事</h3>
            <p className="mb-4 text-gray-300">复制以下链接分享给朋友:</p>
            
            <div className="flex mb-4">
              <input
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
            
            {copySuccess && (
              <p className="text-green-400 mb-4">链接已复制到剪贴板!</p>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 