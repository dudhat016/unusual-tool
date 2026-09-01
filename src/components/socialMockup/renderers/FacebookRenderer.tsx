import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { ThumbsUp, MessageSquare, Share2, Globe, MoreHorizontal, Send, Phone, Video } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const FacebookRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const author = sceneState.post?.author;

  const activeName = author?.name || 'Alex Rivera';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // FACEBOOK MESSENGER CHAT VIEW
  if ((sceneState.sceneType as string) === 'messenger' || sceneState.sceneType === 'dm' || sceneState.sceneType === 'chat') {
    const conv = sceneState.conversation || {
      conversationId: 'fb1',
      chatTitle: activeName,
      isGroup: false,
      participants: [{ id: 'u1', name: activeName, avatar: activeAvatar }],
      messages: [
        { id: 'm1', senderId: 'u1', text: 'Hey Alex! Did you try out the new Facebook Messenger mockup generator?', timestamp: '10:42 AM', direction: 'received' },
        { id: 'm2', senderId: 'me', text: 'Yes! The Messenger gradient chat bubbles look awesome 👍', timestamp: '10:44 AM', direction: 'sent' },
      ],
    };

    return (
      <div className={`w-full h-full min-h-[480px] flex flex-col font-sans select-none border rounded-xl shadow-sm ${bgClass}`}>
        {/* Messenger Header */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={activeAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h4 className="font-bold text-xs">{activeName}</h4>
              <p className="text-[10px] text-slate-400 font-medium">Active now on Messenger</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-blue-500">
            <Phone className="w-5 h-5 cursor-pointer" />
            <Video className="w-5 h-5 cursor-pointer" />
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {conv.messages.map((msg) => {
            const isSent = msg.direction === 'sent';
            return (
              <div key={msg.id} className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} space-y-1`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-normal leading-relaxed ${
                    isSent
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : isDark
                      ? 'bg-slate-800 text-white rounded-bl-xs'
                      : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 font-medium px-1">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // FACEBOOK FEED POST VIEW
  const post: any = sceneState.post || {
    author: {
      name: activeName,
      username: 'alex_rivera',
      avatar: activeAvatar,
      verified: true,
    },
    caption: 'Super excited to launch our new social media mockup suite today! 🎉 Perfect for marketers, designers, and creators.',
    timestamp: '3 hrs · 🌐',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    likesCount: 1420,
    commentsCount: 284,
    sharesCount: 94,
  };

  return (
    <div className={`w-full max-w-lg mx-auto rounded-xl border shadow-sm font-sans space-y-3 select-none ${bgClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onElementClick?.('author')}>
          <img src={activeAvatar} alt={activeName} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h4 className="font-bold text-xs leading-tight">{activeName}</h4>
            <span className="text-[10px] text-slate-400 font-medium">{post.postDate ? `${post.postDate} · 🌐` : post.timestamp}</span>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
      </div>

      {/* Caption */}
      <p className="text-xs px-3 leading-relaxed cursor-pointer" onClick={() => onElementClick?.('caption')}>
        {post.caption}
      </p>

      {/* Media Image */}
      {post.mediaUrl && (
        <div className="w-full aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onElementClick?.('media')}>
          <img src={post.mediaUrl} alt="Facebook media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Engagement Counter Bar */}
      <div className="px-3 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onElementClick?.('likes')}>
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center">👍</span>
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">❤️</span>
            <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] flex items-center justify-center">😆</span>
          </div>
          <span>{post.likesCount}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>{post.commentsCount} comments</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-2 py-1 flex items-center justify-around text-xs font-semibold text-slate-500">
        <button className="flex items-center gap-1.5 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <ThumbsUp className="w-4 h-4" />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
