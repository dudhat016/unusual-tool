import React from 'react';
import { SceneState } from '../../../types/socialMockup';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const DiscordRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const author = sceneState.post?.author;
  const conv = sceneState.conversation || {
    conversationId: 'disc1',
    chatTitle: '#general-lounge',
    isGroup: true,
    participants: [
      { id: 'u1', name: author?.name || 'Alex Rivera', username: author?.username || 'alex_design', avatar: author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', color: '#5865F2' },
      { id: 'u2', name: 'Maya Lin', username: 'Maya#2048', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', color: '#eb459e' },
    ],
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Welcome to the Aether Studio Discord server! 🎉 Check out #announcements for updates.', timestamp: 'Today at 10:40 AM' },
      { id: 'm2', senderId: 'u2', text: 'Super excited to be here! The new UI design suite looks insane 🔥', timestamp: 'Today at 10:42 AM' },
    ],
  };

  return (
    <div className="w-full h-full min-h-[480px] bg-[#313338] text-[#dbdee1] font-sans p-4 space-y-4 rounded-xl border border-slate-800 shadow-lg select-none">
      {/* Discord Header */}
      <div className="pb-3 border-b border-[#3f4147] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#80848e] text-xl font-bold">#</span>
          <span className="font-bold text-white text-sm">{conv.chatTitle || 'general-lounge'}</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-4">
        {conv.messages.map((msg) => {
          const sender = conv.participants.find((p) => p.id === msg.senderId) || conv.participants[0];
          return (
            <div
              key={msg.id}
              onClick={() => onElementClick?.(`msg_${msg.id}`)}
              className="flex items-start gap-3 hover:bg-[#2e3035] p-2 rounded-lg cursor-pointer transition-colors"
            >
              <img
                src={sender.avatar}
                alt={sender.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs hover:underline cursor-pointer" style={{ color: sender.color || '#5865F2' }}>
                    {sender.name}
                  </span>
                  <span className="text-[10px] text-[#949ba4] font-medium">{msg.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed text-[#dbdee1]">{msg.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
