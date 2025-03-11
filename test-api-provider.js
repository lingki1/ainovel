const axios = require('axios');

// 测试API提供商切换功能
async function testApiProviderSwitch() {
  try {
    console.log('开始测试API提供商切换功能...');
    
    // 1. 登录获取用户信息
    console.log('1. 登录获取用户信息...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com'
    });
    
    if (!loginResponse.data.success) {
      throw new Error(`登录失败: ${loginResponse.data.error}`);
    }
    
    const user = loginResponse.data.data;
    console.log(`当前用户API提供商: ${user.apiSettings?.provider || '未设置'}`);
    
    // 2. 切换到Google API
    console.log('\n2. 切换到Google API...');
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
    
    // 3. 再次登录检查设置是否保存
    console.log('\n3. 再次登录检查设置是否保存...');
    const loginAgainResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: user.email
    });
    
    if (!loginAgainResponse.data.success) {
      throw new Error(`再次登录失败: ${loginAgainResponse.data.error}`);
    }
    
    const updatedUser = loginAgainResponse.data.data;
    console.log(`再次登录后的API提供商: ${updatedUser.apiSettings?.provider || '未设置'}`);
    
    // 4. 测试生成故事选项API是否使用正确的提供商
    if (updatedUser.characters.length > 0 && updatedUser.characters[0].stories.length > 0) {
      console.log('\n4. 测试生成故事选项API是否使用正确的提供商...');
      const character = updatedUser.characters[0];
      const story = character.stories[0];
      
      try {
        const optionsResponse = await axios.post('http://localhost:3000/api/story/options', {
          storyContent: story.content,
          characterName: character.name,
          email: user.email,
          characterId: character.id,
          storyId: story.id
        });
        
        if (optionsResponse.data.success) {
          console.log('成功生成故事选项，请检查服务器日志以确认使用的是Google API');
        } else {
          console.log(`生成故事选项失败: ${optionsResponse.data.error}`);
        }
      } catch (error) {
        console.log('生成故事选项时出错:', error.message);
      }
    } else {
      console.log('用户没有角色或故事，跳过测试生成故事选项');
    }
    
    // 5. 切换回Deepseek API
    console.log('\n5. 切换回Deepseek API...');
    const switchToDeepseekResponse = await axios.post('http://localhost:3000/api/auth/updateSettings', {
      email: user.email,
      apiSettings: {
        provider: 'deepseek'
      }
    });
    
    if (!switchToDeepseekResponse.data.success) {
      throw new Error(`切换回Deepseek API失败: ${switchToDeepseekResponse.data.error}`);
    }
    
    console.log(`API提供商已切换为: ${switchToDeepseekResponse.data.data.provider}`);
    
    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 执行测试
testApiProviderSwitch(); 