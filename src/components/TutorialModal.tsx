'use client';

import React, { useState } from 'react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'keywords' | 'api'>('basics');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 text-white">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">AI小说世界 - 游戏教程</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 标签页导航 */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 ${activeTab === 'basics' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('basics')}
          >
            基础玩法
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'keywords' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('keywords')}
          >
            关键词设定
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'api' ? 'bg-indigo-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setActiveTab('api')}
          >
            AI模型对比
          </button>
        </div>
        
        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-indigo-300">游戏基本流程</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-200 mb-2">1. 创建角色</h4>
                  <p className="text-gray-300">首先创建一个角色，为其命名并设置属性。角色属性会影响故事的发展方向和AI的判断。</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-200 mb-2">2. 创建故事</h4>
                  <p className="text-gray-300">输入关键词来创建新故事。关键词是故事的核心元素，AI会围绕这些关键词生成故事内容。</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-200 mb-2">3. 互动游戏</h4>
                  <p className="text-gray-300">阅读AI生成的故事，然后选择故事的发展方向。每个选择都会影响故事的走向，创造独特的体验。</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-200 mb-2">4. 分享故事</h4>
                  <p className="text-gray-300">完成故事后，可以查看完整故事，并选择分享给朋友或导出为文本文件保存。</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-indigo-300 mb-2">游戏特色</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>完全由AI生成的故事内容，每次体验都不同</li>
                  <li>多种选择影响故事发展，创造个性化体验</li>
                  <li>支持多种AI模型，可以根据需要切换</li>
                  <li>可以随时保存和继续您的故事</li>
                  <li>分享功能让您可以与朋友分享精彩故事</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'keywords' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-indigo-300">关键词设定规则</h3>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-200 mb-2">关键词的作用</h4>
                <p className="text-gray-300">关键词是故事的核心元素，AI会围绕这些关键词生成故事内容。关键词分为核心关键词和辅助关键词：</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                  <li>核心关键词：前两个关键词，驱动主要情节</li>
                  <li>辅助关键词：其余关键词，丰富细节和氛围</li>
                </ul>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-200 mb-2">关键词设定技巧</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>使用具体的名词和形容词，如&ldquo;魔法森林&rdquo;、&ldquo;古老城堡&rdquo;、&ldquo;神秘宝藏&rdquo;</li>
                  <li>添加情感或氛围词，如&ldquo;恐怖&rdquo;、&ldquo;浪漫&rdquo;、&ldquo;冒险&rdquo;</li>
                  <li>包含角色关系或身份，如&ldquo;失落的王子&rdquo;、&ldquo;双重间谍&rdquo;</li>
                  <li>加入时代背景，如&ldquo;未来世界&rdquo;、&ldquo;维多利亚时代&rdquo;</li>
                  <li>结合对立元素创造冲突，如&ldquo;科技与魔法&rdquo;、&ldquo;光明与黑暗&rdquo;</li>
                </ul>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-200 mb-2">关键词示例</h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-white">奇幻冒险：</p>
                    <p className="text-gray-300">魔法森林, 失落宝藏, 古老预言, 神秘生物, 时间旅行</p>
                  </div>
                  <div>
                    <p className="font-medium text-white">科幻故事：</p>
                    <p className="text-gray-300">太空殖民, 人工智能, 基因改造, 虚拟现实, 时间悖论</p>
                  </div>
                  <div>
                    <p className="font-medium text-white">悬疑推理：</p>
                    <p className="text-gray-300">密室谋杀, 连环杀手, 失踪案件, 侦探调查, 隐藏线索</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-indigo-300">AI模型对比</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="p-3 text-left text-white border border-gray-600">特性</th>
                      <th className="p-3 text-left text-white border border-gray-600">Deepseek</th>
                      <th className="p-3 text-left text-white border border-gray-600">Google Gemini</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-gray-600 bg-gray-700">生成速度</td>
                      <td className="p-3 border border-gray-600">1000字约25-30秒</td>
                      <td className="p-3 border border-gray-600">1000字约8-15秒</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-gray-600 bg-gray-700">创意水平</td>
                      <td className="p-3 border border-gray-600">较高，故事情节丰富</td>
                      <td className="p-3 border border-gray-600">中等，内容较为平衡</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-gray-600 bg-gray-700">文字质量</td>
                      <td className="p-3 border border-gray-600">优秀，描写细腻</td>
                      <td className="p-3 border border-gray-600">良好，表达清晰</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-gray-600 bg-gray-700">情节连贯性</td>
                      <td className="p-3 border border-gray-600">较好，故事发展自然</td>
                      <td className="p-3 border border-gray-600">优秀，逻辑性强</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-gray-600 bg-gray-700">适用场景</td>
                      <td className="p-3 border border-gray-600">奇幻、文学性强的故事</td>
                      <td className="p-3 border border-gray-600">科幻、逻辑性强的故事</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-indigo-200 mb-2">模型特点详解</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-white">Deepseek:</p>
                    <ul className="list-disc list-inside text-gray-300">
                      <li>擅长生成富有文学性和想象力的内容</li>
                      <li>描写细腻，情感表达丰富</li>
                      <li>生成速度较慢，但质量稳定</li>
                      <li>适合需要深度和细节的长篇故事</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-white">Google Gemini:</p>
                    <ul className="list-disc list-inside text-gray-300">
                      <li>生成速度快，响应迅速</li>
                      <li>逻辑性强，情节发展合理</li>
                      <li>内容相对简洁，重点突出</li>
                      <li>适合需要快速反馈的互动体验</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-200 mb-2">如何选择合适的模型</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>如果您注重故事的文学性和细节，选择Deepseek</li>
                  <li>如果您希望快速生成内容并进行互动，选择Google Gemini</li>
                  <li>科幻、推理类故事可能更适合使用Google Gemini</li>
                  <li>奇幻、情感类故事可能更适合使用Deepseek</li>
                  <li>您可以在故事创建和游戏过程中随时切换模型</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
} 