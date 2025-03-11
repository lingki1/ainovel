'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { Character } from '@/types';
import axios from 'axios';

export default function CharacterManager() {
  const [newCharacterName, setNewCharacterName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    user, 
    currentCharacter,
    setCurrentCharacter, 
    addCharacter, 
    deleteCharacter 
  } = useUserStore();

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCharacterName.trim()) {
      setError('请输入角色名称');
      return;
    }
    
    if (!user?.email) {
      setError('用户信息不完整，请重新登录');
      return;
    }
    
    // 检查角色数量限制
    if (user.characters.length >= 2) {
      setError('最多只能创建2个角色');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/character', {
        name: newCharacterName,
        email: user.email
      });
      
      if (response.data.success && response.data.data) {
        addCharacter(response.data.data);
        setNewCharacterName('');
      } else {
        setError(response.data.error || '创建角色失败');
      }
    } catch (error) {
      console.error('创建角色失败:', error);
      setError('创建角色失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCharacter = (character: Character) => {
    setCurrentCharacter(character);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!user?.email) {
      setError('用户信息不完整，请重新登录');
      return;
    }
    
    if (window.confirm('确定要删除这个角色吗？所有相关的故事都将被删除。')) {
      setIsLoading(true);
      
      try {
        const response = await axios.delete(`/api/auth/character?id=${characterId}&email=${user.email}`);
        
        if (response.data.success) {
          deleteCharacter(characterId);
        } else {
          setError(response.data.error || '删除角色失败');
        }
      } catch (error) {
        console.error('删除角色失败:', error);
        setError('删除角色失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">角色管理</h2>
      
      {/* 角色列表 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">您的角色</h3>
        
        {user?.characters.length === 0 ? (
          <p className="text-gray-500 text-center py-4">您还没有创建任何角色</p>
        ) : (
          <div className="space-y-3">
            {user?.characters.map((character) => (
              <div 
                key={character.id}
                className={`p-4 rounded-lg flex justify-between items-center cursor-pointer character-card ${
                  currentCharacter?.id === character.id ? 'border-2 border-primary-color' : 'border border-gray-200'
                }`}
                onClick={() => handleSelectCharacter(character)}
              >
                <div>
                  <h4 className="font-medium">{character.name}</h4>
                  <p className="text-sm text-gray-500">
                    创建于 {new Date(character.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {character.stories.length} 个故事
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCharacter(character.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-2"
                  disabled={isLoading}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 创建新角色表单 */}
      {user && user.characters && user.characters.length < 2 && (
        <form onSubmit={handleCreateCharacter} className="space-y-4">
          <div>
            <label htmlFor="characterName" className="block text-sm font-medium text-gray-700 mb-1">
              新角色名称
            </label>
            <input
              id="characterName"
              type="text"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              placeholder="请输入角色名称"
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
            {isLoading ? '创建中...' : '创建角色'}
          </button>
        </form>
      )}
    </div>
  );
} 