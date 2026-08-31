import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { Camera, Send, MoreHorizontal, Smile, Lock } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const SnapchatRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900';
  const author = sceneState.post?.author;

  const activeName = author?.name || 'Alex Rivera';
  const activeHandle = author?.username || 'alex_rivera';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // SNAPCHAT STORY VIEW (9:16)
  if (sceneState.sceneType === 'story') {
    return (
      <div className="w-full h-full min-h-[550px] relative font-sans flex flex-col justify-between overflow-hidden bg-slate-900 text-white rounded-xl shadow-2xl select-none">
        <img
          src={sceneState.post?.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
          alt="Snapchat Story"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/70 to-transparent z-10" />

        {/* Story Header */}
        <div className="relative z-20 p-4 space-y-2">
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden flex">
            <div className="h-full bg-white flex-1 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <img src={activeAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-[#FFFC00]" />
            <div>
              <h4 className="font-bold text-xs">{activeName}</h4>
              <p className="text-[10px] text-white/70">Snapchat • 2h ago</p>
            </div>
          </div>
        </div>

        {/* Caption Banner */}
        {sceneState.post?.caption && (
          <div className="relative z-20 w-full py-2.5 bg-black/60 backdrop-blur-md text-center text-xs font-semibold text-white">
            {sceneState.post.caption}
          </div>
        )}

        {/* Bottom Bar */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
          <div className="flex-1 px-4 py-2.5 rounded-full bg-white/20 border border-white/40 text-xs text-white/70">
            Send a Snap...
          </div>
          <div className="p-3 rounded-full bg-[#FFFC00] text-black font-bold">
            <Camera className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  // SNAPCHAT CHAT VIEW
  const conv = sceneState.conversation || {
    conversationId: 'snap1',
    chatTitle: activeName,
    isGroup: false,
    participants: [{ id: 'u1', name: activeName, avatar: activeAvatar }],
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey Alex! Did you see my new Snap?', timestamp: '10:42 AM', direction: 'received' },
      { id: 'm2', senderId: 'me', text: 'Yes! The Snapchat mockup generator looks super authentic 👻', timestamp: '10:44 AM', direction: 'sent' },
    ],
  };

  return (
    <div className={`w-full h-full min-h-[480px] flex flex-col font-sans select-none border border-slate-800 rounded-xl shadow-xl ${bgClass}`}>
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onElementClick?.('header')}>
          <img src={activeAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#FFFC00]" />
          <div>
            <h4 className="font-bold text-xs">{activeName}</h4>
            <p className="text-[10px] text-slate-400 font-medium">{activeHandle}</p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {conv.messages.map((msg) => {
          const isSent = msg.direction === 'sent';
          return (
            <div key={msg.id} className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} space-y-1`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-normal leading-relaxed ${
                  isSent ? 'bg-sky-500 text-white rounded-br-xs' : 'bg-slate-800 text-white rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-500 font-medium px-1">{msg.timestamp}</span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800 flex items-center gap-3">
        <div className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-400">
          Send a Chat
        </div>
        <div className="p-2.5 rounded-full bg-[#FFFC00] text-black">
          <Camera className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
