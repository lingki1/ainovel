# AI小说世界

一个基于AI的交互式小说创作平台，让用户可以通过选择不同的故事发展方向来创建独特的小说。

## 功能特点

- **单页面应用**：所有功能在一个页面内完成，无需页面跳转
- **响应式设计**：适配PC和移动设备
- **多AI提供商支持**：
  - Deepseek API生成故事内容
  - Google Gemini API生成故事内容
  - 用户可自由切换AI提供商
- **用户系统**：简单的邮箱登录
- **角色管理**：创建和管理角色（最多2个）
- **故事创建**：基于关键词创建新故事
- **交互式故事发展**：
  - AI生成5个故事发展选项
  - 用户选择发展方向
  - 控制AI续写字数（500-1000字）
  - 自动滚动到新生成内容的开头
  - 无限循环推进故事
- **故事导出**：将完整故事导出为文本文件

## 技术栈

- **前端**：Next.js, React, TypeScript, Tailwind CSS
- **状态管理**：Zustand
- **API**：Next.js API Routes
- **AI**：Deepseek API, Google Gemini API
- **存储**：本地存储 (LocalStorage)

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/lingki1/ainovel
cd ainovel
```

2. 安装依赖
```bash
npm install
```

3. 创建环境变量文件
```bash
echo "NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key" > .env.local
echo "NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key" >> .env.local
```

4. 启动开发服务器
```bash
npm run dev
```

5. 在浏览器中访问 http://localhost:3000

## 部署

### 本地部署

```bash
npm run build
npm start
```

### VPS部署 (Ubuntu)

1. 在服务器上克隆仓库并安装依赖 和 更新
```bash
git clone https://github.com/lingki1/ainovel
cd ainovel
#install NVM
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
nvm install --lts
node -v
npm -v
```
1.1服务器更新
cd /ainovel
git pull origin main
npm install
npm run build
pm2 restart ainovel

2. 创建环境变量文件
```bashecho "NEXT_PUBLIC_DEEPSEEK_API_KEY=you key here" > .env.local
echo "NEXT_PUBLIC_GOOGLE_API_KEY=you key here" >> .env.local

```

3. 构建应用
```bash
npm run build
```

4. 使用PM2启动应用
```bash
npm install -g pm2
pm2 start npm --name "ainovel" -- start
```

5. 配置Nginx反向代理
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static/ {
        alias /var/www/ainovel/.next/static/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location /public/ {
        alias /var/www/ainovel/public/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```
6. 服务器更新
#本地
cd 文件夹
git add .
git commit -m ""
git push origin maian

#服务器
备份 users.json 
cp /var/www/ainovel/public/data/users.json /var/www/ainovel/public/data/users.json.backup
cp /var/www/ainovel/public/data/shared-stories.json /var/www/ainovel/public/data/shared-stories.json.backup
丢弃本地修改：
git reset --hard HEAD  # 重置所有未提交的更改
git pull origin main   # 拉取更新
恢复 users.json
mv /var/www/ainovel/public/data/users.json.backup /var/www/ainovel/public/data/users.json
mv /var/www/ainovel/public/data/shared-stories.json.backup /var/www/ainovel/public/data/shared-stories.json

## 使用指南

1. 使用邮箱登录
2. 创建角色（最多2个）
3. 选择角色并创建新故事（输入2-10个关键词）
4. 在"故事游戏"标签中：
   - 选择AI提供商（Deepseek或Google）
   - 点击"生成故事选项"获取5个可能的发展方向
   - 选择一个方向继续故事
   - 使用滑块控制AI续写的字数（500-1000字）
   - 系统会自动滚动到新生成内容的开头
   - 重复以上步骤推进故事
5. 在"完整故事"标签中查看和导出完整故事

## 许可证

MIT
