'use client';

import { useState } from 'react';
import { useUserStore } from '@/lib/store/userStore';
import { Character } from '@/types';
import axios from 'axios';

interface CharacterManagerProps {
  onCharacterSelected?: () => void;
}

export default function CharacterManager({ onCharacterSelected }: CharacterManagerProps) {
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterAttributes, setNewCharacterAttributes] = useState('');
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
    if (user.characters.length >= 1) {
      setError('最多只能创建1个角色');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/character', {
        name: newCharacterName,
        email: user.email,
        attributes: newCharacterAttributes
      });
      
      if (response.data.success && response.data.data) {
        const newCharacter = response.data.data;
        addCharacter(newCharacter);
        setNewCharacterName('');
        setNewCharacterAttributes('');
        
        // 自动选择新创建的角色
        setCurrentCharacter(newCharacter);
        
        // 触发角色选择回调
        if (onCharacterSelected) {
          onCharacterSelected();
        }
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
    // 设置当前角色
    setCurrentCharacter(character);
    
    // 始终触发回调，无论是否切换角色
    if (onCharacterSelected) {
      onCharacterSelected();
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!user?.email) {
      setError('用户信息不完整，请重新登录');
      return;
    }
    
    // 添加删除确认
    if (!window.confirm('确定要删除此角色吗？所有故事/小说数据会被永久清除，可以在 我的故事-导出故事 保存您已经创作的内容。')) {
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/character/delete/', {
        characterId,
        email: user.email
      });
      
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
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">角色管理</h2>
      
      {/* 角色列表 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">您的角色</h3>
        
        {user?.characters.length === 0 ? (
          <p className="text-center py-4">您还没有创建任何角色</p>
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
                  {character.attributes && character.attributes.length > 0 && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">属性: </span>
                      {character.attributes.join(', ')}
                    </p>
                  )}
                  <p className="text-sm mt-1">
                    创建于 {new Date(character.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
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
      {user && user.characters && user.characters.length < 1 && (
        <form onSubmit={handleCreateCharacter} className="space-y-4">
          <div>
            <label htmlFor="characterName" className="block text-sm font-medium mb-1">
              角色名称
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
          
          <div>
            <label htmlFor="characterAttributes" className="block text-sm font-medium mb-1">
              角色属性 (用空格分隔)
            </label>
            <input
              id="characterAttributes"
              type="text"
              value={newCharacterAttributes}
              onChange={(e) => setNewCharacterAttributes(e.target.value)}
              placeholder="例如: 勇敢 聪明 善良 坚强"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <p className="mt-1 text-sm">
              角色属性将影响AI生成故事的情节判断
            </p>
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