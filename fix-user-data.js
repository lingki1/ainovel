const fs = require('fs');
const path = require('path');

// 用户数据文件路径
const USER_DATA_PATH = path.join(__dirname, 'public', 'data', 'users.json');

try {
  console.log('开始修复用户数据...');
  
  // 读取用户数据
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
  
  // 修复每个用户的数据
  let modifiedCount = 0;
  userData.users = userData.users.map(user => {
    let modified = false;
    
    // 添加API设置
    if (!user.apiSettings) {
      user.apiSettings = {
        provider: 'deepseek'
      };
      modified = true;
    }
    
    // 修复编码问题
    if (user.email && typeof user.email === 'string') {
      const originalEmail = user.email;
      user.email = user.email.replace(/\\u[\dA-Fa-f]{4}/g, match => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
      });
      if (originalEmail !== user.email) {
        modified = true;
      }
    }
    
    // 修复角色名称和属性的编码问题
    if (user.characters && Array.isArray(user.characters)) {
      user.characters = user.characters.map(character => {
        if (character.name && typeof character.name === 'string') {
          const originalName = character.name;
          character.name = character.name.replace(/\\u[\dA-Fa-f]{4}/g, match => {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
          });
          if (originalName !== character.name) {
            modified = true;
          }
        }
        
        if (character.attributes && Array.isArray(character.attributes)) {
          const originalAttributes = [...character.attributes];
          character.attributes = character.attributes.map(attr => {
            if (typeof attr === 'string') {
              return attr.replace(/\\u[\dA-Fa-f]{4}/g, match => {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
              });
            }
            return attr;
          });
          if (JSON.stringify(originalAttributes) !== JSON.stringify(character.attributes)) {
            modified = true;
          }
        }
        
        // 修复故事标题、关键词和内容的编码问题
        if (character.stories && Array.isArray(character.stories)) {
          character.stories = character.stories.map(story => {
            if (story.title && typeof story.title === 'string') {
              const originalTitle = story.title;
              story.title = story.title.replace(/\\u[\dA-Fa-f]{4}/g, match => {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
              });
              if (originalTitle !== story.title) {
                modified = true;
              }
            }
            
            if (story.keywords && Array.isArray(story.keywords)) {
              const originalKeywords = [...story.keywords];
              story.keywords = story.keywords.map(keyword => {
                if (typeof keyword === 'string') {
                  return keyword.replace(/\\u[\dA-Fa-f]{4}/g, match => {
                    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
                  });
                }
                return keyword;
              });
              if (JSON.stringify(originalKeywords) !== JSON.stringify(story.keywords)) {
                modified = true;
              }
            }
            
            if (story.content && Array.isArray(story.content)) {
              story.content = story.content.map(content => {
                if (content.text && typeof content.text === 'string') {
                  const originalText = content.text;
                  content.text = content.text.replace(/\\u[\dA-Fa-f]{4}/g, match => {
                    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
                  });
                  if (originalText !== content.text) {
                    modified = true;
                  }
                }
                
                if (content.selectedChoice && typeof content.selectedChoice === 'string') {
                  const originalChoice = content.selectedChoice;
                  content.selectedChoice = content.selectedChoice.replace(/\\u[\dA-Fa-f]{4}/g, match => {
                    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
                  });
                  if (originalChoice !== content.selectedChoice) {
                    modified = true;
                  }
                }
                
                return content;
              });
            }
            
            return story;
          });
        }
        
        return character;
      });
    }
    
    if (modified) {
      modifiedCount++;
    }
    
    return user;
  });
  
  // 保存修复后的数据
  fs.writeFileSync(USER_DATA_PATH, JSON.stringify(userData, null, 2), 'utf8');
  
  console.log(`用户数据修复完成，共修复了 ${modifiedCount} 个用户的数据`);
} catch (error) {
  console.error('修复用户数据时发生错误:', error);
  process.exit(1);
} 