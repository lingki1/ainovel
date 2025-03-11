import axios from 'axios';

// 环境变量中的API密钥，或者使用提供的密钥
const API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-e7fec72e5ad142c6a2fb1d2d3b2fa79f';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionResponse {
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
 * 生成故事开端
 */
export async function generateStoryBeginning(keywords: string[], characterName: string): Promise<string> {
  const prompt = `
请根据以下关键词生成一个引人入胜的故事开端（100-200字），主角是"${characterName}"：
${keywords.join('，')}

要求：
1. 故事开端应该引人入胜，让读者想继续阅读
2. 字数控制在100-200字之间
3. 主角必须是"${characterName}"，围绕这个角色展开故事
4. 可以包含场景和情节的简单介绍
5. 为后续故事发展留下悬念和可能性
`;

  const messages: Message[] = [
    { role: 'system', content: `你是一位专业的小说创作AI，擅长根据关键词创作引人入胜的故事。请以"${characterName}"为主角创作故事。` },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await callDeepseekAPI(messages);
    return response;
  } catch (error) {
    console.error('生成故事开端失败:', error);
    throw new Error('生成故事开端失败，请稍后再试');
  }
}

/**
 * 生成故事选项
 */
export async function generateStoryOptions(storyContext: string, characterName: string): Promise<string[]> {
  const prompt = `
基于以下故事内容，生成5个可能的故事发展方向选项，主角是"${characterName}"：

${storyContext}

要求：
1. 每个选项应该简短明了（15-30字）
2. 选项之间应该有明显的差异
3. 选项应该合理地延续当前故事
4. 选项应该为主角"${characterName}"提供有趣的发展可能性
5. 请直接列出5个选项，每行一个，不要有编号或其他格式
`;

  const messages: Message[] = [
    { role: 'system', content: `你是一位专业的小说创作AI，擅长为故事提供多样化的发展方向。请确保故事以"${characterName}"为主角。` },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await callDeepseekAPI(messages);
    // 分割响应为单独的选项
    return response.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
  } catch (error) {
    console.error('生成故事选项失败:', error);
    throw new Error('生成故事选项失败，请稍后再试');
  }
}

/**
 * 根据选择继续故事
 */
export async function continueStory(storyContext: string, choice: string, wordCount: number, characterName: string): Promise<string> {
  const prompt = `
基于以下故事内容和玩家的选择，继续发展故事，主角是"${characterName}"：

故事内容：
${storyContext}

玩家选择：
${choice}

要求：
1. 根据玩家的选择自然地继续故事
2. 字数控制在${wordCount}字左右
3. 主角必须是"${characterName}"，围绕这个角色展开故事
4. 故事应该有情节发展，不要简单重复已有内容
5. 为后续发展留下可能性
6. 直接输出故事内容，不要加入其他说明
`;

  const messages: Message[] = [
    { role: 'system', content: `你是一位专业的小说创作AI，擅长根据读者选择继续发展故事情节。请确保故事以"${characterName}"为主角。` },
    { role: 'user', content: prompt }
  ];

  try {
    const response = await callDeepseekAPI(messages);
    return response;
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
    const response = await axios.post<CompletionResponse>(
      API_URL,
      {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Deepseek API调用失败:', error);
    throw new Error('AI服务暂时不可用，请稍后再试');
  }
} 