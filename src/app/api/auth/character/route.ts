import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Character } from '@/types';
import { generateId, formatDate } from '@/utils';
import { getUser, saveUser } from '@/lib/dataService';

// 创建角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, attributes } = body;

    if (!name || !email) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供角色名称和用户邮箱'
      }, { status: 400 });
    }

    // 获取用户数据
    const user = getUser(email);
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户不存在'
      }, { status: 404 });
    }

    // 检查角色数量限制
    if (user.characters.length >= 2) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '最多只能创建2个角色'
      }, { status: 400 });
    }

    // 处理角色属性
    const characterAttributes = attributes ? 
      attributes.split(/\s+/).filter((attr: string) => attr.trim().length > 0) : 
      [];

    // 创建新角色
    const newCharacter: Character = {
      id: generateId(),
      name,
      attributes: characterAttributes,
      createdAt: formatDate(),
      stories: []
    };

    // 添加角色到用户数据
    user.characters.push(newCharacter);
    saveUser(user);

    return NextResponse.json<ApiResponse<Character>>({
      success: true,
      data: newCharacter
    });
  } catch (error) {
    console.error('创建角色失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '创建角色失败，请稍后再试'
    }, { status: 500 });
  }
}

// 删除角色
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id || !email) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供角色ID和用户邮箱'
      }, { status: 400 });
    }

    // 获取用户数据
    const user = getUser(email);
    if (!user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户不存在'
      }, { status: 404 });
    }

    // 删除角色
    user.characters = user.characters.filter(character => character.id !== id);
    saveUser(user);

    return NextResponse.json<ApiResponse<{ id: string }>>({
      success: true,
      data: { id }
    });
  } catch (error) {
    console.error('删除角色失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '删除角色失败，请稍后再试'
    }, { status: 500 });
  }
} 