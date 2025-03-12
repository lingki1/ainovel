import fs from 'fs';
import path from 'path';
import { User, Story } from '@/types';

// 数据文件路径
const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/users.json');
// 数据目录路径
const DATA_DIR = path.join(process.cwd(), 'public/data');

// 数据结构
interface DataStore {
  users: User[];
}

// 分享故事类型
interface SharedStory {
  id: string;
  story: Story;
  authorName: string;
  createdAt: string;
}

/**
 * 读取用户数据
 */
export const readUserData = (): DataStore => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(DATA_FILE_PATH)) {
      // 如果不存在，创建初始数据
      const initialData: DataStore = { users: [] };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }

    // 读取文件内容
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data) as DataStore;
  } catch (error) {
    console.error('读取用户数据失败:', error);
    return { users: [] };
  }
};

/**
 * 写入用户数据
 */
export const writeUserData = (data: DataStore): boolean => {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入用户数据失败:', error);
    return false;
  }
};

/**
 * 获取用户
 */
export const getUser = (email: string): User | null => {
  const data = readUserData();
  const user = data.users.find(u => u.email === email);
  return user || null;
};

/**
 * 保存用户
 */
export const saveUser = (user: User): boolean => {
  const data = readUserData();
  const index = data.users.findIndex(u => u.email === user.email);

  if (index !== -1) {
    // 更新现有用户
    data.users[index] = user;
  } else {
    // 添加新用户
    data.users.push(user);
  }

  return writeUserData(data);
};

/**
 * 删除用户
 */
export const deleteUser = (email: string): boolean => {
  const data = readUserData();
  data.users = data.users.filter(u => u.email !== email);
  return writeUserData(data);
};

/**
 * 获取所有用户
 */
export const getAllUsers = (): User[] => {
  const data = readUserData();
  return data.users;
};

// 保存分享的故事
export async function saveSharedStory(shareId: string, story: Story, authorName: string): Promise<SharedStory> {
  try {
    // 确保数据目录存在
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // 创建分享故事对象
    const sharedStory: SharedStory = {
      id: shareId,
      story,
      authorName,
      createdAt: new Date().toISOString()
    };
    
    // 获取现有的分享故事数据
    let sharedStories: SharedStory[] = [];
    try {
      const sharedStoriesData = fs.readFileSync(path.join(DATA_DIR, 'shared-stories.json'), 'utf8');
      sharedStories = JSON.parse(sharedStoriesData);
    } catch {
      // 如果文件不存在或解析失败，使用空数组
      sharedStories = [];
    }
    
    // 添加新的分享故事
    sharedStories.push(sharedStory);
    
    // 保存更新后的分享故事数据
    fs.writeFileSync(
      path.join(DATA_DIR, 'shared-stories.json'),
      JSON.stringify(sharedStories, null, 2),
      'utf8'
    );
    
    return sharedStory;
  } catch (error) {
    console.error('保存分享故事失败:', error);
    throw error;
  }
}

// 获取分享的故事
export function getSharedStory(shareId: string): SharedStory | null {
  try {
    // 获取所有分享故事
    let sharedStories: SharedStory[] = [];
    try {
      const sharedStoriesData = fs.readFileSync(path.join(DATA_DIR, 'shared-stories.json'), 'utf8');
      sharedStories = JSON.parse(sharedStoriesData);
    } catch {
      // 如果文件不存在或解析失败，使用空数组
      return null;
    }
    
    // 查找指定ID的分享故事
    const sharedStory = sharedStories.find((story) => story.id === shareId);
    return sharedStory || null;
  } catch (error) {
    console.error('获取分享故事失败:', error);
    return null;
  }
} 