import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, ApiProvider } from '@/types';
import { generateStoryOptions, setApiProvider, getApiProvider } from '@/lib/ai';
import { formatStoryToText } from '@/utils';
import { getUser } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    console.log('收到生成故事选项POST请求');
    
    // 解析请求体
    const rawBody = await request.text();
    console.log('原始请求体:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('解析后的请求体:', body);
    } catch (e) {
      console.error('JSON解析错误:', e);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的JSON格式'
      }, { status: 400 });
    }
    
    const { storyContent, email, characterId, storyId } = body;

    // 验证请求参数
    if (!storyContent) {
      console.error('缺少故事内容');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供有效的故事内容'
      }, { status: 400 });
    }
    
    if (!Array.isArray(storyContent)) {
      console.error('故事内容不是数组');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '故事内容必须是数组格式'
      }, { status: 400 });
    }
    
    if (storyContent.length === 0) {
      console.error('故事内容数组为空');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '故事内容不能为空'
      }, { status: 400 });
    }
    
    if (!email) {
      console.error('缺少用户邮箱');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供用户邮箱'
      }, { status: 400 });
    }
    
    if (!characterId) {
      console.error('缺少角色ID');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供角色ID'
      }, { status: 400 });
    }
    
    if (!storyId) {
      console.error('缺少故事ID');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供故事ID'
      }, { status: 400 });
    }

    // 获取用户数据
    const user = getUser(email);
    if (!user) {
      console.error('用户不存在:', email);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户不存在'
      }, { status: 404 });
    }

    // 查找角色和故事
    const character = user.characters.find(c => c.id === characterId);
    if (!character) {
      console.error('角色不存在:', characterId);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '角色不存在'
      }, { status: 404 });
    }

    const story = character.stories.find(s => s.id === storyId);
    if (!story) {
      console.error('故事不存在:', storyId);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '故事不存在'
      }, { status: 404 });
    }

    // 设置用户选择的API提供商
    if (user.apiSettings?.provider) {
      console.log(`设置API提供商: ${user.apiSettings.provider}`);
      
      // 确保provider是有效的ApiProvider枚举值
      let provider = user.apiSettings.provider;
      if (provider !== ApiProvider.DEEPSEEK && provider !== ApiProvider.GOOGLE) {
        console.warn(`无效的API提供商: ${provider}，使用默认值: ${ApiProvider.DEEPSEEK}`);
        provider = ApiProvider.DEEPSEEK;
      }
      
      setApiProvider(provider as ApiProvider);
      console.log(`设置后的API提供商: ${getApiProvider()}`);
    }

    // 将故事内容转换为文本
    const storyText = formatStoryToText(storyContent);
    
    // 使用AI生成故事选项，传递角色属性
    console.log('开始生成故事选项，角色:', character.name);
    const options = await generateStoryOptions(
      storyText, 
      character.name,
      character.attributes
    );
    
    console.log('故事选项生成成功:', options);

    return NextResponse.json<ApiResponse<{options: string[]}>>({
      success: true,
      data: {options}
    });
  } catch (error) {
    console.error('生成故事选项失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '生成故事选项失败，请稍后再试'
    }, { status: 500 });
  }
} 