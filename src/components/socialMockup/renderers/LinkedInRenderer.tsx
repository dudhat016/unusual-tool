import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { ThumbsUp, MessageSquare, Repeat2, Send, Globe, MoreHorizontal, Plus, Briefcase, MapPin, Users, CheckCircle2 } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const LinkedInRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const author = sceneState.post?.author;

  const activeName = author?.name || 'Alex Rivera';
  const activeHandle = author?.username || 'alex_design';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const activeHeadline = sceneState.post?.headline || 'Lead Product Designer at AetherPix Studio | Building AI Design Tools';

  // LINKEDIN INMAIL / MESSAGE VIEW
  if ((sceneState.sceneType as string) === 'message' || sceneState.sceneType === 'dm' || sceneState.sceneType === 'chat') {
    const conv = sceneState.conversation || {
      conversationId: 'li1',
      chatTitle: activeName,
      isGroup: false,
      participants: [{ id: 'u1', name: activeName, avatar: activeAvatar }],
      messages: [
        { id: 'm1', senderId: 'u1', text: 'Hi Alex! I saw your recent work on AI tools and wanted to connect regarding a leadership role.', timestamp: '10:42 AM', direction: 'received' },
        { id: 'm2', senderId: 'me', text: 'Thanks for reaching out! I would be glad to discuss.', timestamp: '10:45 AM', direction: 'sent' },
      ],
    };

    return (
      <div className={`w-full h-full min-h-[480px] flex flex-col font-sans select-none border rounded-xl shadow-sm ${bgClass}`}>
        {/* InMail Header */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={activeAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>{activeName}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-extrabold">InMail</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{activeHeadline}</p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {conv.messages.map((msg) => {
            const isSent = msg.direction === 'sent';
            return (
              <div key={msg.id} className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} space-y-1`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-xl text-xs font-normal leading-relaxed ${
                    isSent
                      ? 'bg-sky-700 text-white rounded-br-xs'
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

  // LINKEDIN PROFILE VIEW
  if (sceneState.sceneType === 'profile') {
    return (
      <div className={`w-full max-w-lg mx-auto rounded-xl border shadow-sm font-sans overflow-hidden select-none ${bgClass}`}>
        {/* Banner Image */}
        <div className="w-full h-28 bg-gradient-to-r from-sky-700 via-indigo-800 to-purple-900 relative">
          <img src={activeAvatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-900 absolute -bottom-10 left-4 shadow-lg" />
        </div>

        <div className="pt-12 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg">
                <span>{activeName}</span>
                {author?.verified && <CheckCircle2 className="w-4 h-4 fill-sky-600 text-white" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activeHeadline}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> San Francisco, CA</span>
                <span>•</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">500+ connections</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button className="px-4 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs">
              Open to Work
            </button>
            <button className="px-4 py-1.5 rounded-full border border-sky-600 text-sky-600 dark:text-sky-400 text-xs font-bold">
              More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LINKEDIN COMMENT VIEW
  if (sceneState.sceneType === 'comment') {
    return (
      <div className={`w-full max-w-lg mx-auto rounded-xl border p-4 shadow-sm font-sans space-y-3 select-none ${bgClass}`}>
        <h4 className="font-bold text-xs text-slate-500 border-b pb-2 dark:border-slate-800">Comments Section</h4>
        <div className="flex items-start gap-3">
          <img src={activeAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs">{activeName}</h5>
              <span className="text-[10px] text-slate-400">1h</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {sceneState.post?.caption || 'Great insights! Thanks for sharing.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // LINKEDIN FEED POST VIEW
  const post: any = sceneState.post || {
    author: {
      name: activeName,
      username: activeHandle,
      avatar: activeAvatar,
      verified: true,
    },
    headline: activeHeadline,
    caption: 'Super excited to announce our new Social Media Mockup Studio! 🚀 Creating high-resolution mockup prototypes directly in browser has never been faster. Check out the live demo below!',
    timestamp: '2h • Edited • 🌐',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    likesCount: 842,
    commentsCount: 124,
    sharesCount: 56,
  };

  return (
    <div className={`w-full max-w-lg mx-auto rounded-xl border shadow-sm font-sans select-none ${bgClass}`}>
      {/* Header Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 cursor-pointer" onClick={() => onElementClick?.('author')}>
            <img
              src={activeAvatar}
              alt={activeName}
              className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm hover:underline">{activeName}</h4>
                <span className="text-[10px] text-slate-400 font-semibold">• 1st</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{activeHeadline}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                <span>{post.postDate ? `${post.postDate} · ${post.postTime || ''}` : post.timestamp}</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Follow</span>
          </div>
        </div>

        {/* Post Text */}
        <p className="text-xs leading-relaxed cursor-pointer" onClick={() => onElementClick?.('caption')}>
          {post.caption}
        </p>
      </div>

      {/* Media Image */}
      {post.mediaUrl && (
        <div className="w-full aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onElementClick?.('media')}>
          <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Engagement Stats Bar */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onElementClick?.('likes')}>
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] flex items-center justify-center font-bold">👍</span>
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">❤️</span>
          </div>
          <span>{post.likesCount}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>{post.commentsCount} comments</span>
          <span>•</span>
          <span>{post.sharesCount} reposts</span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="px-2 py-1.5 flex items-center justify-around text-xs font-semibold text-slate-600 dark:text-slate-300">
        <button className="flex items-center gap-1.5 py-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <ThumbsUp className="w-4 h-4" />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <Repeat2 className="w-4 h-4" />
          <span>Repost</span>
        </button>
        <button className="flex items-center gap-1.5 py-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
