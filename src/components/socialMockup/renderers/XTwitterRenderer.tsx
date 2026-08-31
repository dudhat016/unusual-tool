import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { MessageCircle, Repeat2, Heart, Bookmark, Share, CheckCircle2, MoreHorizontal, Calendar, MapPin, Link2 } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const XTwitterRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-black text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const author = sceneState.post?.author;

  const activeName = author?.name || 'Alex Rivera';
  const activeHandle = author?.username || '@alex_design';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // X / TWITTER DM CHAT VIEW
  if (sceneState.sceneType === 'dm' || sceneState.sceneType === 'chat') {
    const conv = sceneState.conversation || {
      conversationId: 'x1',
      chatTitle: activeName,
      isGroup: false,
      participants: [{ id: 'u1', name: activeName, avatar: activeAvatar }],
      messages: [
        { id: 'm1', senderId: 'u1', text: 'Hey Alex! Did you see the new feature updates on X?', timestamp: '10:42 AM', direction: 'received' },
        { id: 'm2', senderId: 'me', text: 'Yes! The custom mockups look amazing 🔥', timestamp: '10:44 AM', direction: 'sent' },
      ],
    };

    return (
      <div className={`w-full h-full min-h-[480px] flex flex-col font-sans select-none border rounded-xl shadow-sm ${bgClass}`}>
        {/* DM Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={activeAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-1 font-bold text-xs">
                <span>{activeName}</span>
                {author?.verified && <CheckCircle2 className="w-3.5 h-3.5 fill-sky-400 text-black" />}
              </div>
              <p className="text-[10px] text-slate-500">{activeHandle}</p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-slate-500" />
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
                      ? 'bg-sky-500 text-white rounded-br-xs'
                      : isDark
                      ? 'bg-slate-800 text-white rounded-bl-xs'
                      : 'bg-slate-200 text-slate-900 rounded-bl-xs'
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

  // X / TWITTER PROFILE VIEW
  if (sceneState.sceneType === 'profile') {
    return (
      <div className={`w-full max-w-lg mx-auto rounded-xl border shadow-sm font-sans overflow-hidden select-none ${bgClass}`}>
        <div className="w-full h-28 bg-slate-800 relative">
          <img src={activeAvatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-black absolute -bottom-10 left-4 shadow-lg" />
        </div>

        <div className="pt-12 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1 font-bold text-lg">
                <span>{activeName}</span>
                {author?.verified && <CheckCircle2 className="w-4 h-4 fill-sky-400 text-black" />}
              </div>
              <p className="text-xs text-slate-500">{activeHandle}</p>
            </div>
            <button className="px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs">
              Follow
            </button>
          </div>

          <p className="text-xs leading-relaxed">
            {sceneState.post?.caption || 'Building next-gen digital tools in 2026 🚀 Shipping products daily.'}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> San Francisco, CA</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined March 2020</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold pt-1">
            <span><strong className="text-white">1,420</strong> <span className="text-slate-500 font-normal">Following</span></span>
            <span><strong className="text-white">48.2K</strong> <span className="text-slate-500 font-normal">Followers</span></span>
          </div>
        </div>
      </div>
    );
  }

  // X / TWITTER TWEET POST VIEW
  const post = sceneState.post || {
    author: {
      name: activeName,
      username: activeHandle,
      avatar: activeAvatar,
      verified: true,
    },
    caption: 'Building digital tools in 2026. Speed, privacy, and user experience will always win. 🚀 What are you shipping today?',
    timestamp: '10:42 AM · Sep 15, 2026',
    viewsCount: 142800,
    likesCount: 14200,
    repostsCount: 1840,
    commentsCount: 382,
    bookmarksCount: 940,
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <div className={`w-full max-w-lg mx-auto rounded-xl border p-4 shadow-sm font-sans space-y-3 select-none ${bgClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onElementClick?.('author')}>
          <img
            src={activeAvatar}
            alt={activeName}
            className="w-11 h-11 rounded-full object-cover border border-slate-700"
          />
          <div>
            <div className="flex items-center gap-1 font-bold text-sm">
              <span>{activeName}</span>
              {author?.verified && <CheckCircle2 className="w-4 h-4 fill-sky-400 text-black" />}
            </div>
            <p className="text-xs text-slate-500">{activeHandle}</p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-500 cursor-pointer" />
      </div>

      {/* Post Content */}
      <p className="text-sm leading-relaxed cursor-pointer" onClick={() => onElementClick?.('caption')}>
        {post.caption}
      </p>

      {/* Post Image */}
      {post.mediaUrl && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 cursor-pointer" onClick={() => onElementClick?.('media')}>
          <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Timestamp & Views & Client Tag */}
      <div className="text-xs text-slate-500 border-b border-slate-800/80 pb-3 flex items-center flex-wrap gap-2">
        <span>{post.postDate ? `${post.postTime || '10:42 AM'} · ${post.postDate}` : post.timestamp}</span>
        <span>·</span>
        <span className="font-semibold text-slate-300">{(post.viewsCount || 142800).toLocaleString()}</span>
        <span>Views</span>
        {sceneState.clientAppTag && (
          <>
            <span>·</span>
            <span className="text-sky-400 font-medium">{sceneState.clientAppTag}</span>
          </>
        )}
      </div>

      {/* Engagement Icons Row */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer" onClick={() => onElementClick?.('comments')}>
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentsCount}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer" onClick={() => onElementClick?.('reposts')}>
          <Repeat2 className="w-4 h-4" />
          <span>{post.repostsCount}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer text-rose-500 font-semibold" onClick={() => onElementClick?.('likes')}>
          <Heart className="w-4 h-4 fill-rose-500" />
          <span>{post.likesCount}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer" onClick={() => onElementClick?.('bookmarks')}>
          <Bookmark className="w-4 h-4" />
          <span>{post.bookmarksCount}</span>
        </div>
        <Share className="w-4 h-4 hover:text-sky-400 cursor-pointer" />
      </div>
    </div>
  );
};
