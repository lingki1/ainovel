'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { isValidEmail } from '@/utils';
import axios from 'axios';
import { ApiResponse, User } from '@/types';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证邮箱
    if (!email || !isValidEmail(email)) {
      setError('请输入有效的电子邮件地址');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post<ApiResponse<User>>('/api/auth/login', { email });
      
      if (response.data.success && response.data.data) {
        // 直接使用服务器返回的用户数据
        setUser(response.data.data);
      } else {
        setError(response.data.error || '登录失败，请稍后再试');
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      setError('登录失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">欢迎来到AI小说世界</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            电子邮箱
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="请输入您的电子邮箱"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            required
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>
      
      <p className="mt-4 text-sm text-gray-600 text-center">
        只需输入您的电子邮箱即可开始创作您的AI小说之旅
      </p>
    </div>
  );
} 