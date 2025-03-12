import { NextRequest, NextResponse } from 'next/server';
import { Story } from '@/types';
import { getAllUsers, getSharedStory, saveSharedStory } from '@/lib/dataService';
import { generateId } from '@/utils';

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
    console.log('正在查找分享故事ID:', id);
    
    // 首先尝试从分享故事集合中获取
    const sharedStory = getSharedStory(id);
    if (sharedStory) {
      console.log('在分享故事集合中找到故事');
      return NextResponse.json({
        success: true,
        data: sharedStory.story
      });
    }
    
    // 如果在分享故事集合中没有找到，则在所有用户中查找
    console.log('在分享故事集合中未找到，尝试在用户数据中查找');
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
      console.log('故事不存在');
      return NextResponse.json({
        success: false,
        error: '故事不存在'
      }, { status: 404 });
    }
    
    console.log('在用户数据中找到故事');
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

// 创建分享链接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { story, authorName } = body;
    
    if (!story) {
      return NextResponse.json({
        success: false,
        error: '请提供故事内容'
      }, { status: 400 });
    }
    
    console.log('创建分享链接，作者:', authorName);
    
    // 生成唯一的分享ID
    const shareId = generateId();
    
    // 保存分享的故事和作者信息
    const sharedStory = await saveSharedStory(shareId, story, authorName || '');
    
    console.log('分享故事保存成功，ID:', shareId);
    
    return NextResponse.json({
      success: true,
      shareId,
      authorName: sharedStory.authorName
    });
  } catch (error) {
    console.error('创建分享链接失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建分享链接失败，请稍后再试'
    }, { status: 500 });
  }
} 