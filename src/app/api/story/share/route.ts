import { NextRequest, NextResponse } from 'next/server';
import { Story } from '@/types';
import { getAllUsers } from '@/lib/dataService';

// 获取分享的故事
export async function GET(request: NextRequest) {
  // 从查询参数中获取故事ID
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({
      success: false,
      error: '请提供故事ID'
    }, { status: 400 });
  }
  
  try {
    // 获取所有用户数据
    const users = getAllUsers();
    
    // 在所有用户中查找故事
    let foundStory: Story | null = null;
    
    for (const user of users) {
      for (const character of user.characters) {
        const story = character.stories.find(s => s.id === id);
        if (story) {
          foundStory = story;
          break;
        }
      }
      if (foundStory) break;
    }
    
    if (!foundStory) {
      return NextResponse.json({
        success: false,
        error: '故事不存在'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: foundStory
    });
  } catch (error) {
    console.error('获取分享故事失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取故事失败，请稍后再试'
    }, { status: 500 });
  }
} 