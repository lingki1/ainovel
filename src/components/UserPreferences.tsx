import React, { useState, useEffect } from 'react';
import { UserPreference, StoryStyle, NarrativeStyle, ComplexityLevel } from '@/lib/ai';
import axios from 'axios';

interface UserPreferencesProps {
  onPreferenceChange?: (preferences: UserPreference[]) => void;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ onPreferenceChange }) => {
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);

  // 获取用户偏好
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/story/preferences');
      if (response.data.success) {
        setPreferences(response.data.data.preferences);
        if (onPreferenceChange) {
          onPreferenceChange(response.data.data.preferences);
        }
      } else {
        setError('获取偏好设置失败');
      }
    } catch (error) {
      console.error('获取偏好设置错误:', error);
      setError('获取偏好设置时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 设置用户偏好
  const updatePreference = async (name: string, value: string) => {
    try {
      setLoading(true);
      console.log('发送偏好设置请求:', { preferenceName: name, preferenceValue: value });
      
      // 确保请求体格式正确
      const requestData = {
        preferenceName: name,
        preferenceValue: value
      };
      
      const response = await axios.post('/api/story/preferences', requestData);
      
      console.log('偏好设置响应:', response.data);
      
      if (response.data.success) {
        setPreferences(response.data.data.preferences);
        if (onPreferenceChange) {
          onPreferenceChange(response.data.data.preferences);
        }
      } else {
        setError('更新偏好设置失败');
      }
    } catch (error: unknown) {
      console.error('更新偏好设置错误:', error);
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
          console.error('错误头信息:', axiosError.response.headers);
        } else if (axiosError.request) {
          console.error('请求未收到响应:', axiosError.request);
        } else if (axiosError.message) {
          console.error('错误消息:', axiosError.message);
        }
      }
      setError('更新偏好设置时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 提交用户反馈
  const submitFeedback = async () => {
    if (!feedback.trim()) {
      setError('请输入反馈内容');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/story/feedback', {
        storyId: 'current', // 当前故事ID，可以根据实际情况修改
        feedback
      });
      
      if (response.data.success) {
        setPreferences(response.data.data.preferences);
        if (onPreferenceChange) {
          onPreferenceChange(response.data.data.preferences);
        }
        setFeedback('');
        setShowFeedbackForm(false);
      } else {
        setError('提交反馈失败');
      }
    } catch (error) {
      console.error('提交反馈错误:', error);
      setError('提交反馈时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 渲染偏好选择器
  const renderPreferenceSelector = (preference: UserPreference) => {
    // 根据偏好名称选择不同的选择器
    switch (preference.name) {
      case 'storyStyle':
        return (
          <select
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
            value={preference.value}
            onChange={(e) => updatePreference(preference.name, e.target.value)}
          >
            {Object.values(StoryStyle).map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        );
      
      case 'narrativeStyle':
        return (
          <select
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
            value={preference.value}
            onChange={(e) => updatePreference(preference.name, e.target.value)}
          >
            {Object.values(NarrativeStyle).map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        );
      
      case 'complexityLevel':
        return (
          <select
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
            value={preference.value}
            onChange={(e) => updatePreference(preference.name, e.target.value)}
          >
            {Object.values(ComplexityLevel).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        );
      
      case 'emotionalTone':
        return (
          <select
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
            value={preference.value}
            onChange={(e) => updatePreference(preference.name, e.target.value)}
          >
            {['积极', '中性', '消极', '紧张', '轻松', '神秘'].map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        );
      
      case 'themePreference':
        return (
          <select
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
            value={preference.value}
            onChange={(e) => updatePreference(preference.name, e.target.value)}
          >
            {['成长', '冒险', '爱情', '友情', '家庭', '生存', '复仇', '救赎'].map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
            value={preference.value}
            onChange={(e) => updatePreference(preference.name, e.target.value)}
          />
        );
    }
  };

  // 翻译偏好名称
  const translatePreferenceName = (name: string): string => {
    const nameMap: Record<string, string> = {
      storyStyle: '故事风格',
      narrativeStyle: '叙事风格',
      complexityLevel: '复杂度',
      emotionalTone: '情感基调',
      themePreference: '主题偏好'
    };
    
    return nameMap[name] || name;
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">故事偏好设置</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {preferences.map((preference) => (
              <div key={preference.id} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {translatePreferenceName(preference.name)}
                  {preference.description && (
                    <span className="text-xs text-gray-500 ml-1">({preference.description})</span>
                  )}
                </label>
                {renderPreferenceSelector(preference)}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {showFeedbackForm ? '取消反馈' : '提供反馈'}
            </button>
            
            {showFeedbackForm && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  您对故事的反馈或偏好描述
                </label>
                <textarea
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="例如：我希望故事更加紧张刺激，或者更多的对话和少一些描述..."
                ></textarea>
                <button
                  onClick={submitFeedback}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  disabled={loading}
                >
                  提交反馈
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserPreferences; 