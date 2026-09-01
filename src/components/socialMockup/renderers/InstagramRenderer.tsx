import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, CheckCircle2, Music2, Share2, Play, Grid, Film, UserSquare2 } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const InstagramRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-black text-white' : 'bg-white text-slate-900';
  const borderClass = isDark ? 'border-slate-800' : 'border-slate-100';

  const author = sceneState.post?.author;
  const activeName = author?.name || 'Alex Rivera';
  const activeHandle = author?.username || 'alex_design';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // 1. INSTAGRAM STORY VIEW (9:16)
  if (sceneState.sceneType === 'story') {
    const post: any = sceneState.post || {
      author: { name: activeName, username: activeHandle, avatar: activeAvatar, verified: true },
      caption: 'Story update ✨',
      timestamp: '3h',
    };

    return (
      <div className="w-full h-full min-h-[550px] relative font-sans flex flex-col justify-between overflow-hidden bg-slate-900 text-white rounded-xl shadow-2xl select-none">
        <img
          src={post.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
          alt="Story Content"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none" />

        <div className="relative z-20 p-4 space-y-3">
          <div className="w-full h-1 rounded-full bg-white/30 overflow-hidden flex gap-1">
            <div className="h-full bg-white flex-1 rounded-full animate-pulse" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onElementClick?.('author')}>
              <img src={activeAvatar} alt={activeHandle} className="w-8 h-8 rounded-full object-cover border border-white/40" />
              <div className="flex items-center gap-1 font-bold text-xs">
                <span>{activeHandle}</span>
                {author?.verified && <CheckCircle2 className="w-3.5 h-3.5 fill-sky-500 text-white" />}
                <span className="opacity-60 text-[10px] ml-1">{post.timestamp || '3h'}</span>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-white/80 cursor-pointer" />
          </div>
        </div>

        {post.caption && (
          <div className="relative z-20 px-6 py-2 mx-auto max-w-[80%] bg-black/60 backdrop-blur-md rounded-2xl text-center text-xs font-semibold">
            {post.caption}
          </div>
        )}

        <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
          <div className="flex-1 px-4 py-2.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-xs text-white/70">
            Send message...
          </div>
          <Heart className="w-6 h-6 text-white cursor-pointer" />
          <Send className="w-6 h-6 text-white cursor-pointer" />
        </div>
      </div>
    );
  }

  // 2. INSTAGRAM REEL VIEW (9:16)
  if (sceneState.sceneType === 'reel') {
    const post: any = sceneState.post || {
      author: { name: activeName, username: activeHandle, avatar: activeAvatar, verified: true },
      caption: 'Creating full social media mockups in seconds! ✨ #reels #design',
      likesCount: 14820,
      commentsCount: 342,
    };

    return (
      <div className="w-full h-full min-h-[550px] relative font-sans flex flex-col justify-between overflow-hidden bg-black text-white rounded-xl shadow-2xl select-none">
        <img
          src={post.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
          alt="Reel Content"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-10 pointer-events-none" />

        {/* Top Bar */}
        <div className="relative z-20 p-4 flex items-center justify-between font-bold text-sm">
          <span>Reels</span>
          <MoreHorizontal className="w-5 h-5" />
        </div>

        {/* Right Side Action Column */}
        <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5 z-20">
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
            <span className="text-[11px] font-bold">{(post.likesCount / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer">
            <MessageCircle className="w-7 h-7 fill-white/10 text-white" />
            <span className="text-[11px] font-bold">{post.commentsCount}</span>
          </div>
          <Send className="w-6 h-6 text-white cursor-pointer" />
        </div>

        {/* Bottom Info Bar */}
        <div className="relative z-20 p-4 space-y-2">
          <div className="flex items-center gap-3">
            <img src={activeAvatar} alt={activeHandle} className="w-9 h-9 rounded-full object-cover border border-white/40" />
            <span className="font-bold text-xs">{activeHandle}</span>
            <button className="px-3 py-1 rounded-lg border border-white/40 text-xs font-bold bg-white/10 backdrop-blur-md">
              Follow
            </button>
          </div>
          <p className="text-xs leading-snug line-clamp-2">{post.caption}</p>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <Music2 className="w-4 h-4 animate-spin-slow" />
            <span>original sound - {activeHandle}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. INSTAGRAM PROFILE VIEW (3:4 Ratio Grid)
  if (sceneState.sceneType === 'profile') {
    return (
      <div className={`w-full max-w-md mx-auto rounded-xl border shadow-lg overflow-hidden font-sans p-4 space-y-4 select-none ${bgClass} ${borderClass}`}>
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-base">
            <span>{activeHandle}</span>
            {author?.verified && <CheckCircle2 className="w-4 h-4 fill-sky-500 text-white" />}
          </div>
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
            <img src={activeAvatar} alt={activeName} className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-black" />
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <h4 className="font-extrabold text-sm">142</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Posts</p>
            </div>
            <div>
              <h4 className="font-extrabold text-sm">48.2K</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Followers</p>
            </div>
            <div>
              <h4 className="font-extrabold text-sm">542</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Following</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1 text-xs">
          <h4 className="font-bold">{activeName}</h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{sceneState.post?.caption || 'Building next-generation design tools & web apps 🚀'}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="flex-1 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-bold">
            Follow
          </button>
          <button className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            Message
          </button>
        </div>

        {/* 3:4 Vertical Grid Preview */}
        <div className="border-t pt-3 border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex justify-around text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Grid className="w-5 h-5 text-sky-500" />
            <Film className="w-5 h-5" />
            <UserSquare2 className="w-5 h-5" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="aspect-[3/4] bg-slate-800 rounded-md overflow-hidden">
                <img
                  src={`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80&sig=${idx}`}
                  alt="Grid thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. INSTAGRAM COMMENT VIEW
  if (sceneState.sceneType === 'comment') {
    return (
      <div className={`w-full max-w-md mx-auto rounded-xl border p-4 shadow-lg font-sans space-y-3 select-none ${bgClass} ${borderClass}`}>
        <h4 className="font-bold text-xs text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 text-center">Comments</h4>
        <div className="flex items-start gap-3">
          <img src={activeAvatar} alt={activeHandle} className="w-9 h-9 rounded-full object-cover" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-1 font-bold text-xs">
              <span>{activeHandle}</span>
              {author?.verified && <CheckCircle2 className="w-3.5 h-3.5 fill-sky-500 text-white" />}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">{sceneState.post?.caption || 'Awesome design update! Love the colors.'}</p>
            <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 font-semibold">
              <span>2h</span>
              <span>14 likes</span>
              <span className="cursor-pointer">Reply</span>
            </div>
          </div>
          <Heart className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
      </div>
    );
  }

  // 5. INSTAGRAM DM CHAT VIEW
  if (sceneState.sceneType === 'dm' && sceneState.conversation) {
    const conv = sceneState.conversation;
    return (
      <div className={`w-full h-full flex flex-col font-sans select-none ${bgClass}`}>
        <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
          <div className="flex items-center gap-3" onClick={() => onElementClick?.('profile')}>
            <img src={activeAvatar} alt={activeName} className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700" />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span>{activeName}</span>
                {author?.verified && <CheckCircle2 className="w-4 h-4 fill-sky-500 text-white" />}
              </div>
              <p className="text-xs text-slate-500 font-medium">Active now</p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {conv.messages.map((msg) => {
            const isSent = msg.direction === 'sent';
            return (
              <div key={msg.id} className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} space-y-1 cursor-pointer group`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-normal leading-relaxed ${
                    isSent
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs'
                      : isDark
                      ? 'bg-slate-800 text-white rounded-bl-xs'
                      : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  {msg.type === 'voice' ? (
                    <div className="flex items-center gap-3 py-1 min-w-[160px]">
                      <div className="p-2 rounded-full bg-white/20 text-white shrink-0">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1 h-3">
                          {[40, 70, 30, 90, 60, 80, 40, 100, 50, 70, 30, 60].map((h, i) => (
                            <div key={i} className="w-1 bg-white/80 rounded-full" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <span className="text-[10px] opacity-75">{msg.voiceDuration || '0:14'}</span>
                      </div>
                    </div>
                  ) : msg.type === 'image' ? (
                    <div className="rounded-xl overflow-hidden max-w-xs">
                      <img src={msg.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'} alt="Attachment" className="w-full h-auto object-cover rounded-xl" />
                    </div>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 px-1 font-medium">{msg.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 6. INSTAGRAM STANDARD FEED POST VIEW
  const post: any = sceneState.post || {
    author: { name: activeName, username: activeHandle, avatar: activeAvatar, verified: true },
    location: 'San Francisco',
    caption: 'Creating mockups with AetherPix Studio! 🚀',
    timestamp: '2h ago',
    likesCount: 14820,
    commentsCount: 342,
  };

  return (
    <div className={`w-full max-w-md mx-auto rounded-xl shadow-lg border overflow-hidden font-sans ${bgClass} ${borderClass}`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onElementClick?.('author')}>
          <div className={post.author.hasStoryRing !== false ? "p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" : "p-0.5"}>
            <img src={activeAvatar} alt={activeHandle} className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-black" />
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-xs">
              <span>{activeHandle}</span>
              {author?.verified && <CheckCircle2 className="w-3.5 h-3.5 fill-sky-500 text-white" />}
            </div>
            {post.location && <p className="text-[10px] text-slate-400">{post.location}</p>}
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
      </div>

      <div className="w-full bg-slate-900 aspect-square overflow-hidden relative cursor-pointer" onClick={() => onElementClick?.('media')}>
        <img src={post.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'} alt="Post Media" className="w-full h-full object-cover" />
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 cursor-pointer" />
            <MessageCircle className="w-6 h-6 text-slate-700 dark:text-slate-200 cursor-pointer" />
            <Send className="w-6 h-6 text-slate-700 dark:text-slate-200 cursor-pointer" />
          </div>
          <Bookmark className="w-6 h-6 text-slate-700 dark:text-slate-200 cursor-pointer" />
        </div>

        <p className="font-bold text-xs cursor-pointer">
          {(post.likesCount || 14820).toLocaleString()} likes
        </p>

        <div className="text-xs leading-relaxed cursor-pointer">
          <span className="font-bold mr-1.5">{activeHandle}</span>
          <span>{post.caption}</span>
        </div>
      </div>
    </div>
  );
};
