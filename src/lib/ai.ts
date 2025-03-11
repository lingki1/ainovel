import axios from 'axios';
import { ApiProvider } from '@/types';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 从环境变量中获取API密钥
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 默认API提供商
let currentProvider: ApiProvider = ApiProvider.DEEPSEEK;

// 设置API提供商
export function setApiProvider(provider: ApiProvider) {
  console.log(`API提供商已切换为: ${provider}`);
  // 确保provider是有效的ApiProvider枚举值
  if (provider === ApiProvider.DEEPSEEK || provider === ApiProvider.GOOGLE) {
    currentProvider = provider;
  } else {
    console.warn(`无效的API提供商: ${provider}，使用默认值: ${ApiProvider.DEEPSEEK}`);
    currentProvider = ApiProvider.DEEPSEEK;
  }
}

// 获取当前API提供商
export function getApiProvider(): ApiProvider {
  return currentProvider;
}

// 消息接口
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Deepseek API响应接口
interface DeepseekCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 生成故事开头
 */
export async function generateStoryBeginning(
  keywords: string[], 
  characterName: string, 
  attributes: string[] = []
): Promise<string> {
  const attributesText = attributes.length > 0 
    ? `角色属性：${attributes.join('，')}\n` 
    : '';

  const prompt = `
请根据以下关键词生成一个引人入胜的故事开端（约1000字），主角是"${characterName}"：
${keywords.join('，')}

${attributesText}
要求：
1. 故事开端应该引人入胜，情节紧凑，让读者想继续阅读
2. 字数控制在约1000字左右
3. 主角必须是"${characterName}"，围绕这个角色展开故事
4. 包含生动的场景描写和人物刻画
5. 为后续故事发展留下悬念和可能性
6. 故事内容要详细生动，有丰富的描写和对话
7. 确保故事风格与关键词和角色属性相符
8. 创造一个有趣且独特的世界背景
`;

  const messages: Message[] = [
    {
      role: 'system',
      content: `你是一位专业的小说创作AI，擅长根据关键词创作引人入胜的故事开头。请确保故事以"${characterName}"为主角。${attributesText ? `主角具有以下属性：${attributes.join('，')}。请确保故事中的主角性格和行为与这些属性相符，并将这些特质自然地融入故事情节中。` : ''}`
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    return await callAI(messages);
  } catch (error) {
    console.error('生成故事开头失败:', error);
    throw new Error('生成故事开头失败，请稍后再试');
  }
}

/**
 * 生成故事选项
 */
export async function generateStoryOptions(
  storyContext: string, 
  characterName: string,
  attributes: string[] = []
): Promise<string[]> {
  const attributesText = attributes.length > 0 
    ? `角色属性：${attributes.join('，')}\n` 
    : '';

  const prompt = `
基于以下故事内容，生成5个可能的故事发展方向选项，主角是"${characterName}"：

${storyContext}

${attributesText}
要求：
1. 每个选项应该简短明了（15-30字）
2. 选项之间应该有明显的差异，涵盖不同类型的发展方向
3. 选项应该合理地延续当前故事，保持情节连贯性
4. 选项应该为主角"${characterName}"提供有趣且多样化的发展可能性
5. 选项应该符合主角的属性特征和故事世界观
6. 包含一些意外或冒险的选项，增加故事的戏剧性
7. 请直接列出5个选项，每行一个，不要有编号或其他格式
`;

  const messages: Message[] = [
    {
      role: 'system',
      content: `你是一位专业的小说创作AI，擅长为故事提供多样化且引人入胜的发展方向。请确保故事以"${characterName}"为主角。${attributesText ? `主角具有以下属性：${attributes.join('，')}。请确保故事发展方向与这些属性相符，并能突显角色的特点。` : ''}`
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    const response = await callAI(messages);
    // 将响应拆分为选项数组
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('[') && !line.endsWith(']'))
      .slice(0, 5); // 确保最多返回5个选项
  } catch (error) {
    console.error('生成故事选项失败:', error);
    throw new Error('生成故事选项失败，请稍后再试');
  }
}

/**
 * 继续故事
 */
export async function continueStory(
  storyContext: string, 
  choice: string, 
  wordCount: number, 
  characterName: string,
  attributes: string[] = []
): Promise<string> {
  const attributesText = attributes.length > 0 
    ? `角色属性：${attributes.join('，')}\n` 
    : '';

  const prompt = `
基于以下故事内容和玩家的选择，继续发展故事，主角是"${characterName}"：

故事内容：
${storyContext}

玩家选择：
${choice}

${attributesText}
要求：
1. 根据玩家的选择自然地继续故事，保持情节连贯性
2. 字数控制在${wordCount}字左右
3. 主角必须是"${characterName}"，围绕这个角色展开故事
4. 故事应该有明确的情节发展，不要简单重复已有内容
5. 为后续发展留下悬念和多种可能性
6. 故事内容要详细生动，有丰富的描写、对话和情感表达
7. 主角的性格和行为应该符合其属性特征，展现角色的成长或变化
8. 创造有趣的冲突或挑战，增加故事的戏剧性
9. 直接输出故事内容，不要加入其他说明
`;

  const messages: Message[] = [
    {
      role: 'system',
      content: `你是一位专业的小说创作AI，擅长根据读者选择继续发展引人入胜的故事情节。请确保故事以"${characterName}"为主角。${attributesText ? `主角具有以下属性：${attributes.join('，')}。请确保故事中的主角性格和行为与这些属性相符，并通过情节展现角色的特点和成长。` : ''}`
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    return await callAI(messages);
  } catch (error) {
    console.error('继续故事失败:', error);
    throw new Error('继续故事失败，请稍后再试');
  }
}

/**
 * 调用Deepseek API
 */
async function callDeepseekAPI(messages: Message[]): Promise<string> {
  try {
    console.log('正在调用Deepseek API...');
    console.log('当前API提供商:', currentProvider);
    
    // 检查API密钥是否存在
    if (!DEEPSEEK_API_KEY) {
      throw new Error('Deepseek API密钥未配置，请在.env.local文件中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }
    
    const response = await axios.post<DeepseekCompletionResponse>(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    // 添加API提供商标记
    const content = response.data.choices[0].message.content;
    
    // 模拟流式生成，实际上是一次性返回全部内容
    // 在真实的流式API中，这里应该使用流式API调用
    return content + '\n\n[由Deepseek API生成]';
  } catch (error) {
    console.error('Deepseek API调用失败:', error);
    throw new Error('AI服务暂时不可用，请稍后再试');
  }
}

/**
 * 调用Google API
 */
async function callGoogleAPI(messages: Message[]): Promise<string> {
  try {
    console.log('正在调用Google API...');
    console.log('当前API提供商:', currentProvider);
    
    // 检查API密钥是否存在
    if (!GOOGLE_API_KEY) {
      throw new Error('Google API密钥未配置，请在.env.local文件中设置NEXT_PUBLIC_GOOGLE_API_KEY');
    }
    
    // 使用Google官方客户端库
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY as string);
    // 使用gemini-1.5-pro模型，这是一个更强大的模型，适合生成创意内容
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Google API不支持system角色，需要将system消息合并到user消息中
    // 找到第一个非system消息
    let firstNonSystemIndex = messages.findIndex(msg => msg.role !== 'system');
    if (firstNonSystemIndex === -1) {
      // 如果全是system消息，则将最后一条转为user消息
      firstNonSystemIndex = messages.length - 1;
    }
    
    // 收集所有system消息
    const systemMessages = messages.filter((msg, index) => msg.role === 'system' && index < firstNonSystemIndex);
    const systemContent = systemMessages.map(msg => msg.content).join('\n\n');
    
    // 创建新的消息数组，将system消息合并到第一个非system消息中
    const googleMessages = [];
    
    for (let i = 0; i < messages.length; i++) {
      if (i === firstNonSystemIndex && systemContent) {
        // 将system内容添加到第一个非system消息前面
        googleMessages.push({
          role: messages[i].role === 'assistant' ? 'model' : 'user',
          parts: [{ text: `${systemContent}\n\n${messages[i].content}` }]
        });
      } else if (messages[i].role !== 'system' || i >= firstNonSystemIndex) {
        // 添加非system消息或firstNonSystemIndex之后的所有消息
        googleMessages.push({
          role: messages[i].role === 'assistant' ? 'model' : 'user',
          parts: [{ text: messages[i].content }]
        });
      }
    }
    
    console.log('处理后的消息格式:', JSON.stringify(googleMessages, null, 2));
    
    // 如果没有消息或第一条消息不是user角色，添加一个默认的user消息
    if (googleMessages.length === 0 || googleMessages[0].role !== 'user') {
      googleMessages.unshift({
        role: 'user',
        parts: [{ text: '请根据以下要求生成内容' }]
      });
    }
    
    // 使用直接生成内容的方式，而不是聊天会话
    const result = await model.generateContent({
      contents: googleMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    });
    
    const content = result.response.text();
    
    // 添加API提供商标记
    return content + '\n\n[由Google API生成]';
  } catch (error) {
    console.error('Google API调用失败:', error);
    throw new Error('无法生成内容，请稍后再试');
  }
}

/**
 * 根据当前提供商调用相应的API
 */
async function callAI(messages: Message[]): Promise<string> {
  console.log('调用AI服务，当前提供商:', currentProvider);
  
  // 确保currentProvider是有效的ApiProvider枚举值
  if (currentProvider !== ApiProvider.DEEPSEEK && currentProvider !== ApiProvider.GOOGLE) {
    console.warn(`无效的API提供商: ${currentProvider}，使用默认值: ${ApiProvider.DEEPSEEK}`);
    currentProvider = ApiProvider.DEEPSEEK;
  }
  
  let content = '';
  if (currentProvider === ApiProvider.GOOGLE) {
    content = await callGoogleAPI(messages);
  } else {
    content = await callDeepseekAPI(messages);
  }
  
  return content;
} 