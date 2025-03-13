export interface User {
  email: string;
  characters: Character[];
  apiSettings?: ApiSettings;
}

export interface ApiSettings {
  provider: ApiProvider;
}

export enum ApiProvider {
  DEEPSEEK = 'deepseek',
  GOOGLE = 'google'
}

// 用户偏好接口
export interface UserPreference {
  id: string;
  name: string;
  value: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  attributes: string[];
  createdAt: string;
  stories: Story[];
}

export interface Story {
  id: string;
  title: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  content: StoryContent[];
}

export interface StoryContent {
  id: string;
  text: string;
  type: 'ai' | 'player-choice';
  timestamp: string;
  choices?: string[];
  selectedChoice?: string;
  wordCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
}

export interface CreateCharacterRequest {
  name: string;
  email: string;
}

export interface CreateStoryRequest {
  characterId: string;
  keywords: string[];
}

export interface GenerateStoryRequest {
  characterId: string;
  storyId: string;
  prompt?: string;
  wordCount?: number;
  choices?: boolean;
}

export interface StoryChoiceRequest {
  characterId: string;
  storyId: string;
  choice: string;
  wordCount: number;
}

// 用户反馈请求接口
export interface UserFeedbackRequest {
  storyId: string;
  feedback: string;
  rating?: number; // 1-5星评分
}

// 用户偏好设置请求接口
export interface UserPreferenceRequest {
  preferenceName: string;
  preferenceValue: string;
} 