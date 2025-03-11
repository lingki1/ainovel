'use client';

import { useUserStore } from '@/lib/store/userStore';
import { Story } from '@/types';
import { truncateString } from '@/utils';

export default function StoryList() {
  const { 
    currentCharacter, 
    currentStory,
    setCurrentStory 
  } = useUserStore();

  const handleSelectStory = (story: Story) => {
    setCurrentStory(story);
  };

  if (!currentCharacter) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">我的故事</h2>
        <p className="text-gray-500 text-center py-4">请先选择一个角色</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">我的故事</h2>
      
      {currentCharacter.stories.length === 0 ? (
        <p className="text-gray-500 text-center py-4">您还没有创建任何故事</p>
      ) : (
        <div className="space-y-3">
          {currentCharacter.stories.map((story) => (
            <div 
              key={story.id}
              className={`p-4 rounded-lg cursor-pointer story-card ${
                currentStory?.id === story.id ? 'border-2 border-primary-color' : 'border border-gray-200'
              }`}
              onClick={() => handleSelectStory(story)}
            >
              <h4 className="font-medium">{story.title}</h4>
              <p className="text-sm text-gray-500">
                创建于 {new Date(story.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                关键词: {story.keywords.join(', ')}
              </p>
              {story.content.length > 0 && (
                <p className="mt-2 text-gray-700">
                  {truncateString(story.content[0].text, 100)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 