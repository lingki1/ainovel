# AI小说世界

一个基于AI的交互式小说创作平台，让用户可以通过选择不同的故事发展方向来创建独特的小说。

## 功能特点

- **单页面应用**：所有功能在一个页面内完成，无需页面跳转
- **响应式设计**：适配PC和移动设备
- **AI生成内容**：使用Deepseek API生成故事内容
- **用户系统**：简单的邮箱登录
- **角色管理**：创建和管理角色（最多2个）
- **故事创建**：基于关键词创建新故事
- **交互式故事发展**：
  - AI生成5个故事发展选项
  - 用户选择发展方向
  - 控制AI续写字数（100-500字）
  - 无限循环推进故事
- **故事导出**：将完整故事导出为文本文件

## 技术栈

- **前端**：Next.js, React, TypeScript, Tailwind CSS
- **状态管理**：Zustand
- **API**：Next.js API Routes
- **AI**：Deepseek API
- **存储**：本地存储 (LocalStorage)

## 开发环境设置

1. 克隆仓库
```bash
git clone <repository-url>
cd ainovel
```

2. 安装依赖
```bash
npm install
```

3. 创建环境变量文件 (.env.local)
```
DEEPSEEK_API_KEY=sk-e7fec72e5ad142c6a2fb1d2d3b2fa79f
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

1. 在服务器上克隆仓库并安装依赖
```bash
git clone <repository-url>
cd ainovel
npm install
```

2. 创建环境变量文件
```bash
echo "DEEPSEEK_API_KEY=sk-e7fec72e5ad142c6a2fb1d2d3b2fa79f" > .env.local
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
}
```

## 使用指南

1. 使用邮箱登录
2. 创建角色（最多2个）
3. 选择角色并创建新故事（输入2-10个关键词）
4. 在"故事游戏"标签中：
   - 点击"生成故事选项"获取5个可能的发展方向
   - 选择一个方向继续故事
   - 使用滑块控制AI续写的字数
   - 重复以上步骤推进故事
5. 在"完整故事"标签中查看和导出完整故事

## 许可证

MIT
