import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { CheckCheck, Mic, Phone, Video, MoreVertical, Play, Smile, Paperclip } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const WhatsAppRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-slate-950 text-white' : 'bg-[#efeae2] text-slate-900';
  const headerBg = isDark ? 'bg-slate-900 text-white' : 'bg-[#075e54] text-white';
  const sentBubble = isDark ? 'bg-[#005c4b] text-white' : 'bg-[#d9fdd3] text-slate-900';
  const recvBubble = isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900';

  const author = sceneState.post?.author;
  const conv = sceneState.conversation || {
    conversationId: 'wa1',
    chatTitle: 'WhatsApp Chat',
    isGroup: sceneState.sceneType === 'group_chat',
    participants: [{ id: 'u1', name: author?.name || 'Alex Rivera', avatar: author?.avatar || '', status: 'online' }],
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey! Did you check out the new design suite?', timestamp: '10:42 AM', direction: 'received' },
      { id: 'm2', senderId: 'user_me', text: 'Yes! The WhatsApp mockups look incredible 🚀', timestamp: '10:44 AM', direction: 'sent', status: 'double_blue_tick' },
    ],
  };

  const isGroup = sceneState.sceneType === 'group_chat' || conv.isGroup;
  const activeName = author?.name || conv.chatTitle || conv.participants[0]?.name || 'Alex Rivera';
  const activeAvatar = author?.avatar || conv.participants[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // WHATSAPP STATUS STORY VIEW
  if (sceneState.sceneType === 'status') {
    return (
      <div className="w-full h-full min-h-[550px] relative font-sans flex flex-col justify-between overflow-hidden bg-slate-950 text-white rounded-xl shadow-2xl select-none">
        <img
          src={sceneState.post?.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
          alt="Status"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 to-transparent z-10" />

        {/* Status Header */}
        <div className="relative z-20 p-4 space-y-3">
          <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden flex">
            <div className="h-full bg-white flex-1 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <img src={activeAvatar} alt="Status Avatar" className="w-9 h-9 rounded-full object-cover border border-white/40" />
            <div>
              <h4 className="font-bold text-xs">{activeName}</h4>
              <p className="text-[10px] text-white/70">Today, 10:42 AM</p>
            </div>
          </div>
        </div>

        {/* Caption */}
        {sceneState.post?.caption && (
          <div className="relative z-20 px-6 py-2.5 mx-auto max-w-[85%] bg-black/70 backdrop-blur-md rounded-xl text-center text-xs font-semibold">
            {sceneState.post.caption}
          </div>
        )}

        {/* Bottom Reply Bar */}
        <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-white/80 font-semibold">
            <span>👁️</span>
            <span>142 viewers</span>
          </div>
          <div className="w-full px-4 py-2.5 rounded-full bg-white/10 border border-white/30 backdrop-blur-md text-xs text-white/70 text-center">
            Reply to status...
          </div>
        </div>
      </div>
    );
  }

  // WHATSAPP CALL SCREEN VIEW
  if (sceneState.sceneType === 'call') {
    return (
      <div className="w-full h-full min-h-[550px] relative font-sans flex flex-col justify-between items-center p-8 bg-slate-900 text-white rounded-xl shadow-2xl select-none">
        <div className="text-center space-y-2 pt-6 z-10">
          <h3 className="text-xl font-bold">{activeName}</h3>
          <p className="text-xs text-emerald-400 font-semibold">WhatsApp Video Call · 04:12</p>
        </div>

        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/40 shadow-2xl my-auto">
          <img src={activeAvatar} alt="Call Avatar" className="w-full h-full object-cover" />
        </div>

        <div className="flex items-center justify-center gap-6 pb-6 z-10">
          <div className="p-4 rounded-full bg-slate-800 text-white shadow-lg cursor-pointer">
            <Mic className="w-6 h-6" />
          </div>
          <div className="p-4 rounded-full bg-slate-800 text-white shadow-lg cursor-pointer">
            <Video className="w-6 h-6" />
          </div>
          <div className="p-4 rounded-full bg-rose-600 text-white shadow-lg cursor-pointer">
            <Phone className="w-6 h-6 rotate-135 fill-white" />
          </div>
        </div>
      </div>
    );
  }

  // STANDARD / GROUP CHAT VIEW
  return (
    <div className={`w-full h-full flex flex-col font-sans select-none ${bgClass}`}>
      {/* WhatsApp Header Bar */}
      <div className={`flex items-center justify-between p-3 shadow-sm ${headerBg}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onElementClick?.('header')}>
          <img
            src={activeAvatar}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
          <div>
            <h4 className="font-bold text-sm leading-tight">{isGroup ? (conv.chatTitle || 'Product Launch Team 🚀') : activeName}</h4>
            <p className="text-[11px] opacity-80 font-medium">
              {isGroup ? 'Alex, Maya, Jordan, You' : 'online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/90">
          <Video className="w-5 h-5 cursor-pointer" />
          <Phone className="w-5 h-5 cursor-pointer" />
          <MoreVertical className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="flex justify-center my-2">
          <span className="text-[10px] font-semibold px-3 py-1 rounded-md bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 shadow-xs">
            TODAY
          </span>
        </div>

        {conv.messages.map((msg) => {
          const isSent = msg.direction === 'sent';
          const isVoice = msg.type === 'voice';
          const isImage = msg.type === 'image';

          return (
            <div
              key={msg.id}
              onClick={() => onElementClick?.(`msg_${msg.id}`)}
              className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} cursor-pointer group`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2 rounded-xl text-xs font-normal shadow-xs space-y-1.5 ${
                  isSent ? `${sentBubble} rounded-tr-xs` : `${recvBubble} rounded-tl-xs`
                }`}
              >
                {isGroup && !isSent && (
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {msg.senderId || activeName}
                  </p>
                )}

                {isVoice ? (
                  <div className="flex items-center gap-3 py-1 min-w-[180px]">
                    <div className="p-2.5 rounded-full bg-emerald-600 text-white shrink-0">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1 h-4">
                        {[40, 70, 30, 90, 60, 80, 40, 100, 50, 70, 30, 60].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${i < 6 ? 'bg-emerald-500' : 'bg-slate-400/50'}`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[9px] opacity-70">
                        <span>{msg.voiceDuration || '0:14'}</span>
                      </div>
                    </div>
                  </div>
                ) : isImage ? (
                  <div className="rounded-lg overflow-hidden max-w-xs my-1">
                    <img
                      src={msg.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'}
                      alt="WhatsApp Attachment"
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.text}</p>
                )}

                <div className="flex items-center justify-end gap-1 text-[9px] opacity-70 float-right ml-3 -mb-1">
                  <span>{msg.timestamp}</span>
                  {isSent && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <div className="p-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <Smile className="w-5 h-5 text-slate-400" />
        <Paperclip className="w-5 h-5 text-slate-400" />
        <div className="flex-1 px-4 py-2 rounded-full text-xs bg-white dark:bg-slate-800 text-slate-400">
          Type a message
        </div>
        <div className="p-2.5 rounded-full bg-[#128c7e] text-white">
          <Mic className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
