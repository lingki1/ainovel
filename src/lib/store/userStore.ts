import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Character, Story, ApiSettings } from '@/types';

interface UserState {
  user: User | null;
  currentCharacter: Character | null;
  currentStory: Story | null;
  isLoading: boolean;
  error: string | null;
  
  // 用户操作
  setUser: (user: User | null) => void;
  setCurrentCharacter: (character: Character | null) => void;
  setCurrentStory: (story: Story | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API设置操作
  updateApiSettings: (apiSettings: ApiSettings) => void;
  
  // 角色操作
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (characterId: string) => void;
  
  // 故事操作
  addStory: (characterId: string, story: Story) => void;
  updateStory: (characterId: string, story: Story) => void;
  deleteStory: (characterId: string, storyId: string) => void;
  
  // 清除状态
  reset: () => void;
}

const initialState = {
  user: null,
  currentCharacter: null,
  currentStory: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      setCurrentCharacter: (currentCharacter) => set({ currentCharacter }),
      setCurrentStory: (currentStory) => set({ currentStory }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      updateApiSettings: (apiSettings) => 
        set((state) => ({
          user: state.user 
            ? { 
                ...state.user, 
                apiSettings: {
                  ...state.user.apiSettings,
                  ...apiSettings
                }
              } 
            : null
        })),
      
      addCharacter: (character) => 
        set((state) => ({
          user: state.user 
            ? { 
                ...state.user, 
                characters: [...state.user.characters, character] 
              } 
            : null
        })),
      
      updateCharacter: (character) => 
        set((state) => ({
          user: state.user 
            ? { 
                ...state.user, 
                characters: state.user.characters.map(c => 
                  c.id === character.id ? character : c
                ) 
              } 
            : null,
          currentCharacter: state.currentCharacter?.id === character.id 
            ? character 
            : state.currentCharacter
        })),
      
      deleteCharacter: (characterId) => 
        set((state) => ({
          user: state.user 
            ? { 
                ...state.user, 
                characters: state.user.characters.filter(c => c.id !== characterId) 
              } 
            : null,
          currentCharacter: state.currentCharacter?.id === characterId 
            ? null 
            : state.currentCharacter,
          currentStory: state.currentCharacter?.id === characterId 
            ? null 
            : state.currentStory
        })),
      
      addStory: (characterId, story) => 
        set((state) => {
          if (!state.user) return state;
          
          const updatedCharacters = state.user.characters.map(c => {
            if (c.id === characterId) {
              return {
                ...c,
                stories: [...c.stories, story]
              };
            }
            return c;
          });
          
          return {
            user: {
              ...state.user,
              characters: updatedCharacters
            },
            currentCharacter: state.currentCharacter?.id === characterId
              ? {
                  ...state.currentCharacter,
                  stories: [...state.currentCharacter.stories, story]
                }
              : state.currentCharacter
          };
        }),
      
      updateStory: (characterId, story) => 
        set((state) => {
          if (!state.user) return state;
          
          const updatedCharacters = state.user.characters.map(c => {
            if (c.id === characterId) {
              return {
                ...c,
                stories: c.stories.map(s => s.id === story.id ? story : s)
              };
            }
            return c;
          });
          
          return {
            user: {
              ...state.user,
              characters: updatedCharacters
            },
            currentCharacter: state.currentCharacter?.id === characterId
              ? {
                  ...state.currentCharacter,
                  stories: state.currentCharacter.stories.map(s => 
                    s.id === story.id ? story : s
                  )
                }
              : state.currentCharacter,
            currentStory: state.currentStory?.id === story.id
              ? story
              : state.currentStory
          };
        }),
      
      deleteStory: (characterId, storyId) => 
        set((state) => {
          if (!state.user) return state;
          
          const updatedCharacters = state.user.characters.map(c => {
            if (c.id === characterId) {
              return {
                ...c,
                stories: c.stories.filter(s => s.id !== storyId)
              };
            }
            return c;
          });
          
          return {
            user: {
              ...state.user,
              characters: updatedCharacters
            },
            currentCharacter: state.currentCharacter?.id === characterId
              ? {
                  ...state.currentCharacter,
                  stories: state.currentCharacter.stories.filter(s => s.id !== storyId)
                }
              : state.currentCharacter,
            currentStory: state.currentStory?.id === storyId
              ? null
              : state.currentStory
          };
        }),
      
      reset: () => set(initialState)
    }),
    {
      name: 'ai-novel-user-storage',
    }
  )
); 