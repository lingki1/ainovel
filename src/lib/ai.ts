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

  // 将关键词分为核心和辅助，假设前两个是核心关键词（如果有），其余为辅助
  const coreKeywords = keywords.slice(0, 2).join('，');
  const auxKeywords = keywords.slice(2).join('，') || '无额外辅助关键词';

  const prompt = `
请根据以下关键词生成一个引人入胜的故事开端（约1000字），主角是"${characterName}"：

核心关键词（驱动主要情节）：${coreKeywords}
辅助关键词（丰富细节和氛围）：${auxKeywords}

${attributesText}
要求：
1. 故事开端必须引人入胜，情节紧凑，激发读者好奇心
2. 字数控制在约1000字左右
3. 主角必须是"${characterName}"，围绕其展开故事，核心关键词应自然融入主角的行动或目标
4. 包含生动的场景描写和人物刻画，辅助关键词用于增强世界观或情感氛围
5. 为后续发展埋下伏笔，留下悬念和多种可能性
6. 故事内容详细生动，包含丰富的对话、内心独白和环境描写
7. 主角的性格和行为需与属性一致，关键词风格应与之匹配
8. 创造一个独特的世界背景，融合核心和辅助关键词，增加创意转折或意外元素
`;

  const messages: Message[] = [
    {
      role: 'system',
      content: `你是一位专业的小说创作AI，擅长根据关键词创作引人入胜的故事开头。请确保故事以"${characterName}"为主角。${attributesText ? `主角具有以下属性：${attributes.join('，')}。请将这些属性融入主角的性格、决策和行动中，并与关键词自然结合。` : ''}关键词分为核心和辅助部分，请优先围绕核心关键词构建情节，并在细节中体现辅助关键词。`
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
1. 每个选项简短明了（15-30字）
2. 选项之间差异明显，涵盖冒险、情感、冲突等多种发展方向
3. 选项必须延续当前故事的主题和氛围，保持情节连贯性
4. 主角"${characterName}"的行动或选择需符合其属性，并推动故事发展
5. 参考故事中的核心元素（例如人物关系、未解之谜），加入意外或挑战性选项
6. 直接列出5个选项，每行一个，不要编号或其他格式
`;

  const messages: Message[] = [
    {
      role: 'system',
      content: `你是一位专业的小说创作AI，擅长为故事提供多样化且引人入胜的发展方向。请确保故事以"${characterName}"为主角。${attributesText ? `主角具有以下属性：${attributes.join('，')}。请确保选项反映主角的属性，并与故事上下文紧密相关。` : ''}请根据已有情节中的关键元素和角色特点生成选项，增加戏剧性和惊喜。`
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    const response = await callAI(messages);
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('[') && !line.endsWith(']'))
      .slice(0, 5);
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
1. 根据玩家的选择自然延续故事，保持情节连贯性和主题一致性
2. 字数控制在${wordCount}字左右
3. 主角必须是"${characterName}"，围绕其展开故事，展现其属性在行动中的体现
4. 推进情节发展，引入新的冲突、转折或发现，避免重复已有内容
5. 为后续发展留下悬念，提供多种可能性
6. 故事内容详细生动，包含丰富的场景描写、对话和角色内心变化
7. 主角的决策和行为需与属性一致，展现成长、挣扎或独特视角
8. 在延续选择的基础上，加入创意元素或意外事件，增强戏剧性
9. 直接输出故事内容，不要加入其他说明
`;

  const messages: Message[] = [
    {
      role: 'system',
      content: `你是一位专业的小说创作AI，擅长根据读者选择继续发展引人入胜的故事情节。请确保故事以"${characterName}"为主角。${attributesText ? `主角具有以下属性：${attributes.join('，')}。请通过情节展现这些属性，融入主角的决策和成长。` : ''}请参考故事上下文中的核心主题和未解元素，确保续写连贯并富有惊喜。`
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
        temperature: 0.8,
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
    return content + '\n\n[由Deepseek生成]';
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
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
        temperature: 0.8,
        maxOutputTokens: 4000,
      }
    });
    
    const content = result.response.text();
    
    // 添加API提供商标记
    return content + '\n\n[由Google生成]';
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