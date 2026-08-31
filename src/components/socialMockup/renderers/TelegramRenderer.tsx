import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { CheckCheck, Eye } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const TelegramRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-[#0f1721] text-white' : 'bg-[#7097be] text-slate-900';
  const bubbleClass = isDark ? 'bg-[#182533] text-white' : 'bg-white text-slate-900';
  const sentBubble = isDark ? 'bg-[#2b5278] text-white' : 'bg-[#eff7cf] text-slate-900';

  const author = sceneState.post?.author;
  const conv = sceneState.conversation || {
    conversationId: 'tg1',
    chatTitle: author?.name || 'Aether Official Channel 📢',
    isGroup: false,
    participants: [{ id: 'u1', name: author?.name || 'Aether Official', avatar: author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }],
    messages: [
      { id: 'm1', senderId: 'u1', text: '⚡ Major update released! New Social Media Mockup Suite is live for all users worldwide.', timestamp: '10:40 AM' },
      { id: 'm2', senderId: 'me', text: 'Awesome news! Testing out the Telegram mockups right now 🚀', timestamp: '10:42 AM', direction: 'sent' },
    ],
  };

  const activeName = author?.name || conv.chatTitle || conv.participants[0]?.name || 'Aether Official';
  const activeAvatar = author?.avatar || conv.participants[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <div className={`w-full h-full min-h-[480px] font-sans p-4 flex flex-col justify-between rounded-xl shadow-lg border border-slate-800 select-none ${bgClass}`}>
      {/* Header Bar */}
      <div className="p-3 rounded-lg bg-black/20 backdrop-blur-md flex items-center gap-3 text-white">
        <img src={activeAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h4 className="font-bold text-sm leading-tight">{activeName}</h4>
          <p className="text-[11px] opacity-80">14.2K subscribers</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 my-4 space-y-3 overflow-y-auto">
        {conv.messages.map((msg) => {
          const isSent = msg.direction === 'sent';
          return (
            <div
              key={msg.id}
              onClick={() => onElementClick?.(`msg_${msg.id}`)}
              className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} cursor-pointer`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs shadow-md space-y-1.5 ${
                  isSent ? sentBubble : bubbleClass
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 float-right ml-2 -mb-0.5">
                  <Eye className="w-3 h-3" />
                  <span>1.4k</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {isSent && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
