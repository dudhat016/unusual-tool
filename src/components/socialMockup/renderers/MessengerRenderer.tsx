import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { Phone, Video, MoreHorizontal, ThumbsUp } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const MessengerRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900';
  const author = sceneState.post?.author;

  const activeName = author?.name || 'Alex Rivera';
  const activeAvatar = author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const conv = sceneState.conversation || {
    conversationId: 'msg1',
    chatTitle: activeName,
    isGroup: sceneState.sceneType === 'group_chat',
    participants: [{ id: 'u1', name: activeName, avatar: activeAvatar }],
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey Alex! Testing out the Facebook Messenger mockup tool.', timestamp: '10:42 AM', direction: 'received' },
      { id: 'm2', senderId: 'me', text: 'Looks super clean! Love the blue gradient chat bubbles 💙', timestamp: '10:44 AM', direction: 'sent' },
    ],
  };

  return (
    <div className={`w-full h-full min-h-[480px] flex flex-col font-sans select-none border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm ${bgClass}`}>
      {/* Messenger Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={activeAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h4 className="font-bold text-xs">{conv.chatTitle}</h4>
            <p className="text-[10px] text-slate-400 font-medium">Active now on Messenger</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-blue-500">
          <Phone className="w-5 h-5 cursor-pointer" />
          <Video className="w-5 h-5 cursor-pointer" />
          <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer" />
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {conv.messages.map((msg) => {
          const isSent = msg.direction === 'sent';
          return (
            <div key={msg.id} className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} space-y-1`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-normal leading-relaxed ${
                  isSent
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
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

      {/* Messenger Input */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-400">
          Aa
        </div>
        <div className="text-blue-500 cursor-pointer">
          <ThumbsUp className="w-6 h-6 fill-blue-500" />
        </div>
      </div>
    </div>
  );
};
