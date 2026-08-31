import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal, CheckCircle2 } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const ThreadsRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-black text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const author = sceneState.post?.author;

  const activeName = author?.name || 'Alex Rivera';
  const activeHandle = author?.username || 'alex_design';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // THREADS DM CHAT VIEW
  if (sceneState.sceneType === 'dm' || sceneState.sceneType === 'chat') {
    const conv = sceneState.conversation || {
      conversationId: 'thr1',
      chatTitle: activeHandle,
      isGroup: false,
      participants: [{ id: 'u1', name: activeHandle, avatar: activeAvatar }],
      messages: [
        { id: 'm1', senderId: 'u1', text: 'Hey Alex! Loved your recent Thread post 🔥', timestamp: '10:42 AM', direction: 'received' },
        { id: 'm2', senderId: 'me', text: 'Thanks! The new Threads mockup studio is super fast 🚀', timestamp: '10:44 AM', direction: 'sent' },
      ],
    };

    return (
      <div className={`w-full h-full min-h-[480px] flex flex-col font-sans select-none border rounded-xl shadow-sm ${bgClass}`}>
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={activeAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-1 font-bold text-xs">
                <span>{activeHandle}</span>
                {author?.verified && <CheckCircle2 className="w-3.5 h-3.5 fill-sky-500 text-black" />}
              </div>
              <p className="text-[10px] text-slate-400">{activeName}</p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {conv.messages.map((msg) => {
            const isSent = msg.direction === 'sent';
            return (
              <div key={msg.id} className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} space-y-1`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-normal leading-relaxed ${
                    isSent
                      ? 'bg-sky-500 text-white rounded-br-xs'
                      : isDark
                      ? 'bg-slate-800 text-white rounded-bl-xs'
                      : 'bg-slate-200 text-slate-900 rounded-bl-xs'
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

  // THREADS PROFILE VIEW
  if (sceneState.sceneType === 'profile') {
    return (
      <div className={`w-full max-w-lg mx-auto rounded-xl border p-6 shadow-sm font-sans space-y-4 select-none ${bgClass}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-extrabold text-xl">{activeName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span>{activeHandle}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-semibold">threads.net</span>
            </div>
          </div>
          <img src={activeAvatar} alt={activeHandle} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" />
        </div>

        <p className="text-xs leading-relaxed">
          {sceneState.post?.caption || 'Building next-generation design systems & AI developer tools 🚀'}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-1 border-t border-slate-800">
          <span>48.2K followers</span>
          <button className="px-5 py-1.5 rounded-lg bg-white text-black font-bold text-xs">
            Follow
          </button>
        </div>
      </div>
    );
  }

  // THREADS POST VIEW
  const post = sceneState.post || {
    author: {
      name: activeName,
      username: activeHandle,
      avatar: activeAvatar,
      verified: true,
    },
    caption: 'Threads mockup generator is live in Aether Studio! Clean, minimalist, and ultra-fast. What are your thoughts on Threads design language?',
    timestamp: '2h',
    likesCount: 1840,
    commentsCount: 142,
    repostsCount: 84,
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <div className={`w-full max-w-lg mx-auto rounded-xl border p-4 shadow-sm font-sans space-y-3 select-none ${bgClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onElementClick?.('author')}>
          <img src={activeAvatar} alt={activeHandle} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <div className="flex items-center gap-1 font-bold text-xs">
              <span>{activeHandle}</span>
              {author?.verified && <CheckCircle2 className="w-3.5 h-3.5 fill-sky-500 text-black" />}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{post.postDate ? `${post.postDate}` : post.timestamp}</span>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
      </div>

      {/* Caption */}
      <p className="text-xs leading-relaxed cursor-pointer" onClick={() => onElementClick?.('caption')}>
        {post.caption}
      </p>

      {/* Media */}
      {post.mediaUrl && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden cursor-pointer" onClick={() => onElementClick?.('media')}>
          <img src={post.mediaUrl} alt="Threads media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Action Icons */}
      <div className="flex items-center gap-4 text-slate-500 pt-1 text-xs">
        <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer" />
        <MessageCircle className="w-5 h-5 hover:text-sky-500 cursor-pointer" />
        <Repeat2 className="w-5 h-5 hover:text-emerald-500 cursor-pointer" />
        <Send className="w-5 h-5 hover:text-sky-500 cursor-pointer" />
      </div>

      {/* Stats Counter */}
      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-3 pt-1 border-t border-slate-800/60">
        <span>{post.commentsCount} replies</span>
        <span>•</span>
        <span>{post.likesCount} likes</span>
      </div>
    </div>
  );
};
