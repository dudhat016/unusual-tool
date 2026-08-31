import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { ThumbsUp, ThumbsDown, Share2, Download, CheckCircle2, MessageSquare } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const YouTubeRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200';
  const author = sceneState.post?.author;

  const activeName = author?.name || 'Aether Studio';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // YOUTUBE COMMENT TREE VIEW
  if (sceneState.sceneType === 'comment') {
    return (
      <div className={`w-full max-w-lg mx-auto rounded-xl border p-4 shadow-sm font-sans space-y-4 select-none ${bgClass}`}>
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <h4 className="font-bold text-sm">Comments · {sceneState.post?.commentsCount || 342}</h4>
          <span className="text-xs text-slate-400 font-semibold cursor-pointer">Sort by</span>
        </div>

        <div className="flex items-start gap-3">
          <img src={activeAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">@{author?.username || 'alex_design'}</span>
              <span className="text-[10px] text-slate-400">2 hours ago</span>
            </div>
            <p className="text-xs leading-relaxed">{sceneState.post?.caption || 'This tutorial is incredible! Learned so much about building web apps.'}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1 cursor-pointer"><ThumbsUp className="w-3.5 h-3.5" /> 48</span>
              <span className="cursor-pointer"><ThumbsDown className="w-3.5 h-3.5" /></span>
              <span className="font-bold cursor-pointer">Reply</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // YOUTUBE VIDEO DETAILS VIEW
  const post = sceneState.post || {
    author: {
      name: activeName,
      username: 'AetherStudio',
      avatar: activeAvatar,
      verified: true,
    },
    headline: 'Building the Future of Web Apps in 2026! 🚀 Complete Masterclass',
    timestamp: '142K views · 2 days ago',
    likesCount: 14200,
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <div className={`w-full max-w-lg mx-auto rounded-xl border overflow-hidden shadow-sm font-sans space-y-3 select-none ${bgClass}`}>
      {/* Video Thumbnail */}
      <div className="w-full aspect-video bg-slate-900 overflow-hidden relative cursor-pointer" onClick={() => onElementClick?.('media')}>
        <img src={post.mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
          14:28
        </span>
      </div>

      {/* Video Info */}
      <div className="p-3 space-y-3">
        <h3 className="font-bold text-sm leading-snug cursor-pointer" onClick={() => onElementClick?.('headline')}>
          {post.headline}
        </h3>
        <p className="text-xs text-slate-400 font-medium">{post.timestamp}</p>

        {/* Channel Info & Subscribe Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onElementClick?.('author')}>
            <img src={activeAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-1 font-bold text-xs">
                <span>{activeName}</span>
                {author?.verified && <CheckCircle2 className="w-3.5 h-3.5 fill-slate-400 text-black" />}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">1.4M subscribers</p>
            </div>
          </div>
          <button className="px-3.5 py-1.5 rounded-full bg-white text-black dark:bg-white dark:text-black font-bold text-xs shadow-xs">
            Subscribe
          </button>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2 pt-2 text-xs overflow-x-auto">
          <div className="flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 font-semibold gap-2">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{(post.likesCount / 1000).toFixed(1)}k</span>
            </div>
            <span>|</span>
            <ThumbsDown className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 font-semibold">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 font-semibold">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </div>
        </div>
      </div>
    </div>
  );
};
