import { NextResponse } from 'next/server';
import { setUserPreference, getUserPreferences } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    console.log('收到偏好设置POST请求');
    
    // 解析请求体
    const rawBody = await request.text();
    console.log('原始请求体:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('解析后的请求体:', body);
    } catch (e) {
      console.error('JSON解析错误:', e);
      return NextResponse.json(
        { success: false, error: '无效的JSON格式' },
        { status: 400 }
      );
    }
    
    // 验证请求数据
    if (!body || typeof body !== 'object') {
      console.error('请求体不是有效的对象:', body);
      return NextResponse.json(
        { success: false, error: '请求体必须是有效的JSON对象' },
        { status: 400 }
      );
    }
    
    if (!body.preferenceName || !body.preferenceValue) {
      console.error('缺少必要参数:', body);
      return NextResponse.json(
        { success: false, error: `缺少必要参数: ${!body.preferenceName ? 'preferenceName' : 'preferenceValue'}` },
        { status: 400 }
      );
    }
    
    // 设置用户偏好
    const updatedPreferences = setUserPreference(
      body.preferenceName, 
      body.preferenceValue
    );
    
    console.log('偏好设置已更新:', updatedPreferences);
    
    // 返回更新后的偏好设置
    return NextResponse.json({
      success: true,
      data: {
        message: '偏好设置已更新',
        preferences: updatedPreferences
      }
    });
  } catch (error) {
    console.error('更新用户偏好失败:', error);
    return NextResponse.json(
      { success: false, error: '更新偏好设置失败，请稍后再试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('收到偏好设置GET请求');
    
    // 获取所有用户偏好
    const preferences = getUserPreferences();
    
    console.log('返回偏好设置:', preferences);
    
    // 返回用户偏好设置
    return NextResponse.json({
      success: true,
      data: {
        preferences
      }
    });
  } catch (error) {
    console.error('获取用户偏好失败:', error);
    return NextResponse.json(
      { success: false, error: '获取偏好设置失败，请稍后再试' },
      { status: 500 }
    );
  }
} 