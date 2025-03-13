import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, StoryContent, ApiProvider } from '@/types';
import { continueStory, setApiProvider, getApiProvider } from '@/lib/ai';
import { formatStoryToText, generateId, formatDate } from '@/utils';
import { getUser, saveUser } from '@/lib/dataService';

export async function POST(request: NextRequest) {
  try {
    console.log('收到继续故事POST请求');
    
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
    
    const { storyContent, choice, wordCount, email, characterId, storyId } = body;

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
    
    if (!choice) {
      console.error('缺少选择');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供有效的选择'
      }, { status: 400 });
    }
    
    if (!wordCount) {
      console.error('缺少字数');
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '请提供有效的字数'
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
    
    // 使用AI继续故事，传递角色属性
    console.log('开始继续故事，角色:', character.name, '选择:', choice);
    const continuedStory = await continueStory(
      storyText, 
      choice, 
      wordCount, 
      character.name,
      character.attributes
    );

    // 创建玩家选择内容
    const playerChoice: StoryContent = {
      id: generateId(),
      text: choice,
      type: 'player-choice',
      timestamp: formatDate(),
      selectedChoice: choice
    };

    // 创建AI生成的故事内容
    const aiContent: StoryContent = {
      id: generateId(),
      text: continuedStory,
      type: 'ai',
      timestamp: formatDate(),
      wordCount
    };

    // 更新故事内容
    story.content.push(playerChoice, aiContent);
    story.updatedAt = formatDate();
    saveUser(user);
    
    console.log('故事继续成功，添加了新内容');

    return NextResponse.json<ApiResponse<{story: typeof story}>>({
      success: true,
      data: {story}
    });
  } catch (error) {
    console.error('继续故事失败:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '继续故事失败，请稍后再试'
    }, { status: 500 });
  }
} 