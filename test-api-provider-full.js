const axios = require('axios');

// 测试API提供商切换功能
async function testApiProviderSwitch() {
  try {
    console.log('开始测试API提供商切换功能...');
    
    // 1. 登录获取用户信息
    console.log('\n1. 登录获取用户信息...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com'
    });
    
    if (!loginResponse.data.success) {
      throw new Error(`登录失败: ${loginResponse.data.error}`);
    }
    
    const user = loginResponse.data.data;
    console.log(`当前用户API提供商: ${user.apiSettings?.provider || '未设置'}`);
    
    // 2. 创建角色（如果没有）
    let character;
    if (user.characters.length === 0) {
      console.log('\n2. 创建角色...');
      const createCharacterResponse = await axios.post('http://localhost:3000/api/auth/character', {
        email: user.email,
        name: '测试角色'
      });
      
      if (!createCharacterResponse.data.success) {
        throw new Error(`创建角色失败: ${createCharacterResponse.data.error}`);
      }
      
      character = createCharacterResponse.data.data;
      console.log(`创建角色成功: ${character.name}`);
    } else {
      character = user.characters[0];
      console.log(`\n2. 使用现有角色: ${character.name}`);
    }
    
    // 3. 创建故事（如果没有）
    let story;
    if (character.stories.length === 0) {
      console.log('\n3. 创建故事...');
      const createStoryResponse = await axios.post('http://localhost:3000/api/story/create', {
        email: user.email,
        characterId: character.id,
        characterName: character.name,
        keywords: ['冒险', '魔法', '友情']
      });
      
      if (!createStoryResponse.data.success) {
        throw new Error(`创建故事失败: ${createStoryResponse.data.error}`);
      }
      
      story = createStoryResponse.data.data;
      console.log(`创建故事成功: ${story.title}`);
    } else {
      story = character.stories[0];
      console.log(`\n3. 使用现有故事: ${story.title}`);
    }
    
    // 4. 切换到Deepseek API
    console.log('\n4. 切换到Deepseek API...');
    const switchToDeepseekResponse = await axios.post('http://localhost:3000/api/auth/updateSettings', {
      email: user.email,
      apiSettings: {
        provider: 'deepseek'
      }
    });
    
    if (!switchToDeepseekResponse.data.success) {
      throw new Error(`切换到Deepseek API失败: ${switchToDeepseekResponse.data.error}`);
    }
    
    console.log(`API提供商已切换为: ${switchToDeepseekResponse.data.data.provider}`);
    
    // 5. 使用Deepseek API生成故事选项
    console.log('\n5. 使用Deepseek API生成故事选项...');
    const deepseekOptionsResponse = await axios.post('http://localhost:3000/api/story/options', {
      storyContent: story.content,
      characterName: character.name,
      email: user.email,
      characterId: character.id,
      storyId: story.id
    });
    
    if (!deepseekOptionsResponse.data.success) {
      throw new Error(`使用Deepseek API生成故事选项失败: ${deepseekOptionsResponse.data.error}`);
    }
    
    const deepseekOptions = deepseekOptionsResponse.data.data;
    console.log('Deepseek API生成的选项:');
    deepseekOptions.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option}`);
    });
    
    // 6. 切换到Google API
    console.log('\n6. 切换到Google API...');
    const switchToGoogleResponse = await axios.post('http://localhost:3000/api/auth/updateSettings', {
      email: user.email,
      apiSettings: {
        provider: 'google'
      }
    });
    
    if (!switchToGoogleResponse.data.success) {
      throw new Error(`切换到Google API失败: ${switchToGoogleResponse.data.error}`);
    }
    
    console.log(`API提供商已切换为: ${switchToGoogleResponse.data.data.provider}`);
    
    // 7. 使用Google API生成故事选项
    console.log('\n7. 使用Google API生成故事选项...');
    const googleOptionsResponse = await axios.post('http://localhost:3000/api/story/options', {
      storyContent: story.content,
      characterName: character.name,
      email: user.email,
      characterId: character.id,
      storyId: story.id
    });
    
    if (!googleOptionsResponse.data.success) {
      throw new Error(`使用Google API生成故事选项失败: ${googleOptionsResponse.data.error}`);
    }
    
    const googleOptions = googleOptionsResponse.data.data;
    console.log('Google API生成的选项:');
    googleOptions.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option}`);
    });
    
    // 8. 切换回Deepseek API
    console.log('\n8. 切换回Deepseek API...');
    const switchBackToDeepseekResponse = await axios.post('http://localhost:3000/api/auth/updateSettings', {
      email: user.email,
      apiSettings: {
        provider: 'deepseek'
      }
    });
    
    if (!switchBackToDeepseekResponse.data.success) {
      throw new Error(`切换回Deepseek API失败: ${switchBackToDeepseekResponse.data.error}`);
    }
    
    console.log(`API提供商已切换为: ${switchBackToDeepseekResponse.data.data.provider}`);
    
    console.log('\n测试完成！API提供商切换功能正常工作');
  } catch (error) {
    console.error('测试过程中出错:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
  }
}

// 执行测试
testApiProviderSwitch(); 