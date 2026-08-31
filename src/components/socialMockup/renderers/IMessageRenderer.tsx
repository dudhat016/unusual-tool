import React from 'react';
import { SceneState } from '../../../types/socialMockup';
import { ChevronLeft, Video, Info, Lock } from 'lucide-react';

interface RendererProps {
  sceneState: SceneState;
  onElementClick?: (elementKey: string) => void;
}

export const IMessageRenderer: React.FC<RendererProps> = ({ sceneState, onElementClick }) => {
  const isDark = sceneState.theme === 'dark';
  const bgClass = isDark ? 'bg-black text-white' : 'bg-white text-slate-900';

  if (sceneState.sceneType === 'lock_screen') {
    const lock = sceneState.lockScreen || {
      wallpaperUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      time: '09:41',
      date: 'Tuesday, September 15',
      appName: 'Messages',
      senderName: 'Maya Lin',
      messageText: 'The client just approved the final designs! Launch tomorrow 🎉',
      timestamp: 'now',
    };

    return (
      <div className="w-full h-full min-h-[500px] rounded-2xl relative overflow-hidden font-sans select-none flex flex-col justify-between p-6 shadow-2xl border border-slate-800">
        {/* Background Wallpaper */}
        <img src={lock.wallpaperUrl} alt="Wallpaper" className="w-full h-full object-cover absolute inset-0" />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

        {/* Lock Screen Time & Date */}
        <div className="relative z-10 text-center space-y-1 mt-6 text-white cursor-pointer" onClick={() => onElementClick?.('time')}>
          <div className="flex justify-center items-center gap-1.5 text-xs font-semibold opacity-90">
            <Lock className="w-3.5 h-3.5" />
            <span>{lock.date}</span>
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight">{lock.time}</h1>
        </div>

        {/* Notification Bubble */}
        <div
          onClick={() => onElementClick?.('notification')}
          className="relative z-10 p-4 rounded-2xl bg-white/25 dark:bg-black/40 backdrop-blur-xl border border-white/20 text-white space-y-1.5 shadow-xl cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs opacity-80 font-bold">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">💬</span>
              <span>{lock.appName.toUpperCase()}</span>
            </div>
            <span>{lock.timestamp}</span>
          </div>
          <h4 className="font-bold text-sm">{lock.senderName}</h4>
          <p className="text-xs text-slate-100 leading-snug line-clamp-2">{lock.messageText}</p>
        </div>
      </div>
    );
  }

  // Standard iMessage Chat
  const author = sceneState.post?.author;
  const conv = sceneState.conversation || {
    conversationId: 'im1',
    chatTitle: author?.name || 'Alex Rivera',
    isGroup: false,
    participants: [{ id: 'u1', name: author?.name || 'Alex Rivera', avatar: author?.avatar || '' }],
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Are we still good for the product launch sync?', timestamp: '09:40 AM', direction: 'received' },
      { id: 'm2', senderId: 'me', text: 'Yes! All features and design mockups are ready 🚀', timestamp: '09:41 AM', direction: 'sent', status: 'read' },
    ],
  };

  const activeName = author?.name || conv.participants[0]?.name || 'Alex Rivera';
  const activeAvatar = author?.avatar || conv.participants[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <div className={`w-full h-full flex flex-col font-sans select-none ${bgClass}`}>
      {/* iOS Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 text-sky-500 font-semibold text-xs cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
          <span>Messages</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer" onClick={() => onElementClick?.('header')}>
          <img
            src={activeAvatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-bold text-xs mt-0.5">{activeName}</span>
        </div>
        <Video className="w-5 h-5 text-sky-500 cursor-pointer" />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
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
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-xs font-normal leading-relaxed ${
                  isSent
                    ? 'bg-sky-500 text-white rounded-br-xs'
                    : isDark
                    ? 'bg-slate-800 text-white rounded-bl-xs'
                    : 'bg-slate-200 text-slate-900 rounded-bl-xs'
                }`}
              >
                {isVoice ? (
                  <div className="flex items-center gap-2 py-0.5 min-w-[140px]">
                    <span className="text-xs">🎙️ Voice Note</span>
                    <span className="text-[10px] opacity-75">({msg.voiceDuration || '0:14'})</span>
                  </div>
                ) : isImage ? (
                  <div className="rounded-xl overflow-hidden max-w-xs my-0.5">
                    <img
                      src={msg.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'}
                      alt="Attachment"
                      className="w-full h-auto object-cover rounded-xl"
                    />
                  </div>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
              {isSent && msg.status === 'read' && (
                <span className="text-[9px] text-slate-400 font-medium px-1 mt-0.5">Read {msg.timestamp}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
