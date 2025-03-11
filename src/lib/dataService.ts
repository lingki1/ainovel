import fs from 'fs';
import path from 'path';
import { User } from '@/types';

// 数据文件路径
const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/users.json');

// 数据结构
interface DataStore {
  users: User[];
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