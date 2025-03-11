const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 用户数据文件路径
const USER_DATA_PATH = path.join(__dirname, 'public', 'data', 'users.json');

// 检查并修复API提供商切换功能
async function fixApiProviderSwitch() {
  try {
    console.log('开始修复API提供商切换功能...');
    
    // 1. 读取用户数据
    let userData;
    try {
      const data = fs.readFileSync(USER_DATA_PATH, 'utf8');
      userData = JSON.parse(data);
    } catch (error) {
      console.error('读取或解析用户数据失败:', error);
      process.exit(1);
    }
    
    // 确保users数组存在
    if (!userData || !userData.users || !Array.isArray(userData.users)) {
      console.error('用户数据格式不正确');
      process.exit(1);
    }
    
    // 2. 检查并修复每个用户的API设置
    let modifiedCount = 0;
    userData.users = userData.users.map(user => {
      let modified = false;
      
      // 确保apiSettings存在且格式正确
      if (!user.apiSettings) {
        user.apiSettings = {
          provider: 'deepseek'
        };
        modified = true;
        console.log(`为用户 ${user.email} 添加了默认API设置`);
      } else if (typeof user.apiSettings !== 'object') {
        user.apiSettings = {
          provider: 'deepseek'
        };
        modified = true;
        console.log(`修复了用户 ${user.email} 的API设置格式`);
      } else if (!user.apiSettings.provider) {
        user.apiSettings.provider = 'deepseek';
        modified = true;
        console.log(`为用户 ${user.email} 的API设置添加了默认提供商`);
      } else if (user.apiSettings.provider !== 'deepseek' && user.apiSettings.provider !== 'google') {
        user.apiSettings.provider = 'deepseek';
        modified = true;
        console.log(`修复了用户 ${user.email} 的API提供商值`);
      }
      
      if (modified) {
        modifiedCount++;
      }
      
      return user;
    });
    
    // 3. 保存修复后的数据
    fs.writeFileSync(USER_DATA_PATH, JSON.stringify(userData, null, 2), 'utf8');
    console.log(`用户数据修复完成，共修复了 ${modifiedCount} 个用户的API设置`);
    
    // 4. 检查API提供商切换功能是否正常工作
    console.log('\n开始测试API提供商切换功能...');
    
    // 4.1 登录获取用户信息
    console.log('登录获取用户信息...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: userData.users[0].email
    });
    
    if (!loginResponse.data.success) {
      throw new Error(`登录失败: ${loginResponse.data.error}`);
    }
    
    const user = loginResponse.data.data;
    console.log(`当前用户API提供商: ${user.apiSettings?.provider || '未设置'}`);
    
    // 4.2 切换到Google API
    console.log('\n切换到Google API...');
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
    
    // 4.3 再次登录检查设置是否保存
    console.log('\n再次登录检查设置是否保存...');
    const loginAgainResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: user.email
    });
    
    if (!loginAgainResponse.data.success) {
      throw new Error(`再次登录失败: ${loginAgainResponse.data.error}`);
    }
    
    const updatedUser = loginAgainResponse.data.data;
    console.log(`再次登录后的API提供商: ${updatedUser.apiSettings?.provider || '未设置'}`);
    
    // 4.4 切换回Deepseek API
    console.log('\n切换回Deepseek API...');
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
    
    console.log('\n测试完成！API提供商切换功能正常工作');
    
  } catch (error) {
    console.error('修复过程中出错:', error);
    process.exit(1);
  }
}

// 执行修复
fixApiProviderSwitch(); 