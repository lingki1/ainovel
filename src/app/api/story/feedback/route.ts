import { NextResponse } from 'next/server';
import { analyzeUserFeedback } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    console.log('收到用户反馈POST请求');
    
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
    
    if (!body.storyId || !body.feedback) {
      console.error('缺少必要参数:', body);
      return NextResponse.json(
        { success: false, error: `缺少必要参数: ${!body.storyId ? 'storyId' : 'feedback'}` },
        { status: 400 }
      );
    }
    
    // 分析用户反馈并调整偏好
    const updatedPreferences = await analyzeUserFeedback(body.feedback);
    
    console.log('用户反馈已处理，更新的偏好:', updatedPreferences);
    
    // 返回更新后的偏好设置
    return NextResponse.json({
      success: true,
      data: {
        message: '反馈已处理',
        preferences: updatedPreferences
      }
    });
  } catch (error) {
    console.error('处理用户反馈失败:', error);
    return NextResponse.json(
      { success: false, error: '处理反馈失败，请稍后再试' },
      { status: 500 }
    );
  }
} 