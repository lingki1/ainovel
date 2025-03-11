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