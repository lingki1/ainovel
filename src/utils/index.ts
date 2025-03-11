/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * 格式化日期为ISO字符串
 */
export const formatDate = (): string => {
  return new Date().toISOString();
};

/**
 * 格式化故事为可读文本
 */
export const formatStoryToText = (content: { type: string; text: string; selectedChoice?: string }[]): string => {
  return content.map(item => {
    if (item.type === 'ai') {
      return item.text;
    } else if (item.type === 'player-choice') {
      return `[选择: ${item.selectedChoice}]`;
    }
    return '';
  }).join('\n\n');
};

/**
 * 计算字数
 */
export const countWords = (text: string): number => {
  // 中文字符计数
  const chineseCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  // 英文单词计数
  const englishWords = text.replace(/[\u4e00-\u9fa5]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
  
  return chineseCount + englishWords;
};

/**
 * 验证电子邮件格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 限制字符串长度并添加省略号
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * 从本地存储中获取数据
 */
export const getFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting data from localStorage:', error);
    return null;
  }
};

/**
 * 保存数据到本地存储
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

/**
 * 从本地存储中删除数据
 */
export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data from localStorage:', error);
  }
}; 