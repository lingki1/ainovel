'use client';

import { useState, useEffect } from 'react';

// 定义主题类型
type Theme = 'system' | 'light' | 'dark' | 'node';

// 定义主题颜色
const themeColors = {
  light: '#3b82f6', // 蓝色
  dark: '#818cf8',  // 紫色
  node: '#6cc24a',  // Node.js 绿色
  system: '#64748b'  // 灰色
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // 从本地存储中获取保存的主题
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // 如果没有保存的主题，则使用系统默认
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme('system');
      applyTheme(prefersDark ? 'dark' : 'light');
    }

    // 添加媒体查询监听器
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    // 添加点击外部关闭下拉菜单的处理
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.theme-toggle-container')) {
        setIsDropdownOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [theme]);

  // 应用主题
  const applyTheme = (themeToApply: Theme | 'light' | 'dark') => {
    // 移除所有主题类
    document.documentElement.classList.remove('dark', 'light', 'node-theme');
    
    // 应用选择的主题
    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (themeToApply === 'light') {
      document.documentElement.classList.add('light');
    } else if (themeToApply === 'node') {
      document.documentElement.classList.add('node-theme');
    } else if (themeToApply === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
    }
  };

  // 切换主题
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    } else {
      applyTheme(newTheme);
    }
    
    // 选择主题后不关闭下拉菜单
    // setIsDropdownOpen(false);
  };

  // 获取当前主题图标
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'dark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'node':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  // 获取主题名称
  const getThemeName = (themeType: Theme) => {
    switch (themeType) {
      case 'light': return '亮色模式';
      case 'dark': return '暗色模式';
      case 'node': return 'Node.js主题';
      case 'system': return '系统默认';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-2 theme-toggle-container z-50">
      {isDropdownOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 mb-2">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">选择主题</h3>
          <div className="flex flex-col space-y-2">
            {(['light', 'dark', 'node', 'system'] as Theme[]).map((themeType) => (
              <button
                key={themeType}
                onClick={() => changeTheme(themeType)}
                className={`p-2 rounded-md flex items-center ${
                  theme === themeType ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                aria-label={getThemeName(themeType)}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: themeColors[themeType] }}
                ></div>
                <span className="text-sm">{getThemeName(themeType)}</span>
                {theme === themeType && (
                  <svg className="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="p-3 rounded-full shadow-lg transition-colors"
        style={{
          backgroundColor: themeColors[theme],
          color: '#ffffff'
        }}
        aria-label="切换主题"
      >
        {getThemeIcon()}
      </button>
    </div>
  );
} 