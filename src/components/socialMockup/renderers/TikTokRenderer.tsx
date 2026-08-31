import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { Heart, MessageCircle, Bookmark, Share2, Music2, Plus, CheckCircle2, MoreHorizontal, UserCheck } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const TikTokRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const author = sceneState.post?.author;
  const activeName = author?.name || 'Maya Studio';
  const activeHandle = author?.username || '@maya_design';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80';

  // TIKTOK DM CHAT VIEW
  if (sceneState.sceneType === 'dm' || sceneState.sceneType === 'chat') {
    const conv = sceneState.conversation || {
      conversationId: 'tt1',
      chatTitle: activeName,
      isGroup: false,
      participants: [{ id: 'u1', name: activeName, avatar: activeAvatar }],
      messages: [
        { id: 'm1', senderId: 'u1', text: 'Hey! Loved your recent TikTok video 🔥', timestamp: '10:42 AM', direction: 'received' },
        { id: 'm2', senderId: 'me', text: 'Thank you so much! More content coming soon 🚀', timestamp: '10:44 AM', direction: 'sent' },
      ],
    };

    return (
      <div className="w-full h-full min-h-[480px] bg-black text-white flex flex-col font-sans select-none border border-slate-800 rounded-xl shadow-xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={activeAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-1 font-bold text-xs">
                <span>{activeName}</span>
                {author?.verified && <CheckCircle2 className="w-3.5 h-3.5 fill-cyan-400 text-black" />}
              </div>
              <p className="text-[10px] text-slate-400">{activeHandle}</p>
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
                    isSent ? 'bg-[#fe2c55] text-white rounded-br-xs' : 'bg-slate-800 text-white rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 font-medium px-1">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // TIKTOK PROFILE VIEW
  if (sceneState.sceneType === 'profile') {
    return (
      <div className="w-full max-w-lg mx-auto bg-black text-white rounded-xl border border-slate-800 shadow-xl p-6 font-sans space-y-4 select-none text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-[#fe2c55]">
          <img src={activeAvatar} alt={activeName} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 font-bold text-base">
            <span>{activeHandle}</span>
            {author?.verified && <CheckCircle2 className="w-4 h-4 fill-cyan-400 text-black" />}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{activeName}</p>
        </div>

        <div className="flex items-center justify-center gap-8 py-2 text-center border-y border-slate-800">
          <div>
            <h4 className="font-extrabold text-sm">142</h4>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Following</p>
          </div>
          <div>
            <h4 className="font-extrabold text-sm">48.2K</h4>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Followers</p>
          </div>
          <div>
            <h4 className="font-extrabold text-sm">1.4M</h4>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Likes</p>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <button className="px-6 py-2 rounded-md bg-[#fe2c55] text-white font-bold text-xs">
            Follow
          </button>
        </div>
      </div>
    );
  }

  // TIKTOK COMMENT SHEET VIEW
  if (sceneState.sceneType === 'comment') {
    return (
      <div className="w-full max-w-lg mx-auto bg-slate-900 text-white rounded-xl border border-slate-800 p-4 font-sans space-y-3 select-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-bold text-xs text-slate-400">Comments ({sceneState.post?.commentsCount || 3840})</h4>
        </div>
        <div className="flex items-start gap-3">
          <img src={activeAvatar} alt={activeName} className="w-9 h-9 rounded-full object-cover" />
          <div className="space-y-1">
            <h5 className="font-bold text-xs">{activeHandle}</h5>
            <p className="text-xs text-slate-300">{sceneState.post?.caption || 'Check out this awesome mockup generator! ✨'}</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
              <span>1h ago</span>
              <span className="font-bold cursor-pointer">Reply</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TIKTOK VERTICAL VIDEO VIEW
  const post = sceneState.post || {
    author: {
      name: activeName,
      username: activeHandle,
      avatar: activeAvatar,
      verified: true,
    },
    caption: 'Creating full social media mockups in seconds! ✨ Which platform do you use most? #design #uiux #mockup',
    musicTitle: `original sound - ${activeName} 🎵`,
    likesCount: 142800,
    commentsCount: 3840,
    bookmarksCount: 18200,
    sharesCount: 9400,
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <div className="w-full h-full min-h-[520px] rounded-2xl bg-black text-white relative overflow-hidden font-sans select-none shadow-xl border border-slate-800">
      <img src={post.mediaUrl} alt="TikTok background" className="w-full h-full object-cover opacity-90 absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      {/* Right Action Column */}
      <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5 z-20">
        <div className="relative cursor-pointer" onClick={() => onElementClick?.('author')}>
          <img src={activeAvatar} alt={activeName} className="w-11 h-11 rounded-full object-cover border-2 border-white" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#fe2c55] text-white flex items-center justify-center font-bold text-xs">
            +
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onElementClick?.('likes')}>
          <Heart className="w-7 h-7 fill-[#fe2c55] text-[#fe2c55]" />
          <span className="text-[11px] font-bold">{(post.likesCount / 1000).toFixed(1)}k</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onElementClick?.('comments')}>
          <MessageCircle className="w-7 h-7 fill-white/10 text-white" />
          <span className="text-[11px] font-bold">{(post.commentsCount / 1000).toFixed(1)}k</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onElementClick?.('bookmarks')}>
          <Bookmark className="w-7 h-7 fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-bold">{(post.bookmarksCount / 1000).toFixed(1)}k</span>
        </div>

        <div className="flex flex-col items-center gap-1 cursor-pointer">
          <Share2 className="w-7 h-7 fill-white/10 text-white" />
          <span className="text-[11px] font-bold">{(post.sharesCount / 1000).toFixed(1)}k</span>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-4 left-4 right-16 space-y-2 z-20">
        <div className="flex items-center gap-1 font-bold text-sm cursor-pointer" onClick={() => onElementClick?.('author')}>
          <span>{activeHandle}</span>
          {author?.verified && <CheckCircle2 className="w-4 h-4 fill-cyan-400 text-black" />}
        </div>
        <p className="text-xs text-slate-100 leading-snug line-clamp-2 cursor-pointer" onClick={() => onElementClick?.('caption')}>
          {post.caption}
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Music2 className="w-4 h-4 animate-spin-slow" />
          <span className="truncate">{post.musicTitle || `original sound - ${activeName}`}</span>
        </div>
      </div>
    </div>
  );
};
