import { toPng } from 'html-to-image';
import React, { useState, useRef } from 'react';
import { SceneState, PlatformId, SceneTypeId } from '../../types/socialMockup';
import { PLATFORM_REGISTRY, PLATFORMS_LIST } from '../../config/socialMockup/platformRegistry';
import { getDefaultSceneState, getRouteForPlatformScene } from '../../config/socialMockup/sceneRegistry';
import { Link } from '../common/Link';
import { DeviceFrameWrapper } from './DeviceFrameWrapper';
import { InstagramRenderer } from './renderers/InstagramRenderer';
import { WhatsAppRenderer } from './renderers/WhatsAppRenderer';
import { LinkedInRenderer } from './renderers/LinkedInRenderer';
import { TikTokRenderer } from './renderers/TikTokRenderer';
import { XTwitterRenderer } from './renderers/XTwitterRenderer';
import { IMessageRenderer } from './renderers/IMessageRenderer';
import { FacebookRenderer } from './renderers/FacebookRenderer';
import { YouTubeRenderer } from './renderers/YouTubeRenderer';
import { DiscordRenderer } from './renderers/DiscordRenderer';
import { TelegramRenderer } from './renderers/TelegramRenderer';
import { ThreadsRenderer } from './renderers/ThreadsRenderer';
import { SnapchatRenderer } from './renderers/SnapchatRenderer';
import { MessengerRenderer } from './renderers/MessengerRenderer';
import { useApp } from '../../context/AppContext';
import {
  Download,
  RefreshCw,
  Sparkles,
  Smartphone,
  User,
  MessageSquare,
  Image as ImageIcon,
  BarChart2,
  Settings,
  Plus,
  Trash2,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Clock,
  Play,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

interface EditorProps {
  initialPlatformId?: PlatformId;
  initialSceneType?: SceneTypeId;
}

export const UniversalSocialMockupEditor: React.FC<EditorProps> = ({
  initialPlatformId = 'instagram',
  initialSceneType = 'post',
}) => {
  const { showToast } = useApp();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [platformId, setPlatformId] = useState<PlatformId>(initialPlatformId as PlatformId);
  const [sceneType, setSceneType] = useState<SceneTypeId>(initialSceneType as SceneTypeId);
  const [sceneState, setSceneState] = useState<SceneState>(
    getDefaultSceneState(initialPlatformId as PlatformId, initialSceneType as SceneTypeId)
  );

  const [openAccordion, setOpenAccordion] = useState<string>('profile');
  const [isExporting, setIsExporting] = useState(false);

  const currentPlatform = PLATFORM_REGISTRY[platformId] || PLATFORM_REGISTRY.instagram;

  // Handle platform change
  const handlePlatformChange = (newPlatform: PlatformId) => {
    setPlatformId(newPlatform);
    const pConfig = PLATFORM_REGISTRY[newPlatform];
    const newScene = pConfig.supportedSceneTypes[0] || 'post';
    setSceneType(newScene);
    setSceneState(getDefaultSceneState(newPlatform, newScene));
  };

  // Handle scene type change
  const handleSceneChange = (newScene: SceneTypeId) => {
    setSceneType(newScene);
    setSceneState(getDefaultSceneState(platformId, newScene));
  };

  // Update post field
  const updatePostField = (field: string, value: any) => {
    setSceneState((prev) => ({
      ...prev,
      post: {
        ...(prev.post || getDefaultSceneState(platformId, sceneType).post!),
        [field]: value,
      },
    }));
  };

  // Update author field across both post and conversation participants
  const updateAuthorField = (field: string, value: any) => {
    setSceneState((prev) => {
      const updatedAuthor = {
        ...(prev.post?.author || getDefaultSceneState(platformId, sceneType).post!.author),
        [field]: value,
      };

      const updatedParticipants = prev.conversation?.participants.map((p, idx) =>
        idx === 0
          ? {
              ...p,
              name: field === 'name' ? value : p.name,
              username: field === 'username' ? value : p.username,
              avatar: field === 'avatar' ? value : p.avatar,
              verified: field === 'verified' ? value : p.verified,
            }
          : p
      );

      return {
        ...prev,
        post: {
          ...(prev.post || getDefaultSceneState(platformId, sceneType).post!),
          author: updatedAuthor,
        },
        conversation: prev.conversation
          ? {
              ...prev.conversation,
              participants: updatedParticipants || prev.conversation.participants,
            }
          : undefined,
      };
    });
  };

  // Add chat message
  const addChatMessage = (msgType: 'text' | 'voice' | 'image' = 'text') => {
    if (!sceneState.conversation) return;
    const newMsg: any = {
      id: `msg_${Date.now()}`,
      senderId: sceneState.conversation.participants[0]?.id || 'user_1',
      text: msgType === 'voice' ? 'Voice Message' : 'New message line...',
      type: msgType,
      voiceDuration: msgType === 'voice' ? '0:14' : undefined,
      timestamp: 'Just now',
      direction: 'sent' as const,
    };
    setSceneState((prev) => ({
      ...prev,
      conversation: {
        ...prev.conversation!,
        messages: [...(prev.conversation?.messages || []), newMsg],
      },
    }));
  };

  // Remove message
  const removeChatMessage = (msgId: string) => {
    if (!sceneState.conversation) return;
    setSceneState((prev) => ({
      ...prev,
      conversation: {
        ...prev.conversation!,
        messages: prev.conversation!.messages.filter((m) => m.id !== msgId),
      },
    }));
  };

  // Export Canvas as HD PNG Image using html-to-image (supports Tailwind v4 oklch colors)
  const handleExportPNG = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    showToast('Generating high-definition mockup image...', 'info');

    try {
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `${platformId}_${sceneType}_mockup_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      showToast('Mockup exported successfully!', 'success');
    } catch (err: any) {
      console.error('Export error:', err);
      showToast('Export failed. Try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Render Platform Specific Component
  const renderPlatformComponent = () => {
    switch (platformId) {
      case 'instagram':
        return <InstagramRenderer sceneState={sceneState} />;
      case 'whatsapp':
        return <WhatsAppRenderer sceneState={sceneState} />;
      case 'linkedin':
        return <LinkedInRenderer sceneState={sceneState} />;
      case 'tiktok':
        return <TikTokRenderer sceneState={sceneState} />;
      case 'x':
        return <XTwitterRenderer sceneState={sceneState} />;
      case 'imessage':
        return <IMessageRenderer sceneState={sceneState} />;
      case 'facebook':
        return <FacebookRenderer sceneState={sceneState} />;
      case 'youtube':
        return <YouTubeRenderer sceneState={sceneState} />;
      case 'discord':
        return <DiscordRenderer sceneState={sceneState} />;
      case 'telegram':
        return <TelegramRenderer sceneState={sceneState} />;
      case 'threads':
        return <ThreadsRenderer sceneState={sceneState} />;
      case 'snapchat':
        return <SnapchatRenderer sceneState={sceneState} />;
      case 'messenger':
        return <MessengerRenderer sceneState={sceneState} />;
      default:
        return <InstagramRenderer sceneState={sceneState} />;
    }
  };

  const toggleAccordion = (name: string) => {
    setOpenAccordion(openAccordion === name ? '' : name);
  };

  const isChatMode = ['chat', 'dm', 'group_chat'].includes(sceneType);
  const isPostMode = !isChatMode && ['post', 'story', 'reel', 'video', 'lock_screen', 'profile'].includes(sceneType);

  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto py-2 font-sans select-none items-start">
      {/* 1. Leftmost Vertical Platform Bar (TheFake.design Icon Bar) */}
      <div className="flex lg:flex-col items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto w-full lg:w-auto shrink-0">
        {PLATFORMS_LIST.map((p) => {
          const isSelected = platformId === p.id;
          const route = getRouteForPlatformScene(p.id);
          return (
            <Link
              key={p.id}
              href={route}
              onClick={(e) => {
                if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handlePlatformChange(p.id);
                }
              }}
              className={`p-3 rounded-xl transition-all flex items-center justify-center relative group shrink-0 ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={p.name}
            >
              <span className="font-extrabold text-xs uppercase">{p.name.substring(0, 2)}</span>

              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg hidden lg:block">
                {p.name}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. Main Controls & Settings Panel (Left Split Column) */}
      <div className="w-full lg:w-[420px] space-y-4 shrink-0">
        {/* Header Title & Mode Selector Pills */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {currentPlatform.name} Studio
              </h2>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {currentPlatform.category}
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-x-auto">
            {currentPlatform.supportedSceneTypes.map((st) => (
              <Link
                key={st}
                href={getRouteForPlatformScene(platformId, st)}
                onClick={(e) => {
                  if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleSceneChange(st);
                  }
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap text-center ${
                  sceneType === st ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                {st.replace('_', ' ')}
              </Link>
            ))}
          </div>
        </div>

        {/* Conditional Accordion Panels */}
        <div className="space-y-3">
          {/* ACCORDION 1: USER / AUTHOR PROFILE */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('profile')}
              className="w-full p-4 font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span>User & Contact Profile</span>
              </div>
              {openAccordion === 'profile' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openAccordion === 'profile' && (
              <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Display Name</label>
                  <input
                    type="text"
                    value={sceneState.post?.author.name || 'Alex Rivera'}
                    onChange={(e) => updateAuthorField('name', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Username / Handle</label>
                  <input
                    type="text"
                    value={sceneState.post?.author.username || 'alex_design'}
                    onChange={(e) => updateAuthorField('username', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>

                {/* LinkedIn Professional Headline */}
                {platformId === 'linkedin' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Professional Headline</label>
                    <input
                      type="text"
                      placeholder="Founder @ TechCorp | Ex-Google"
                      value={sceneState.post?.headline || ''}
                      onChange={(e) => updatePostField('headline', e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Avatar Image URL</label>
                  <input
                    type="text"
                    value={sceneState.post?.author.avatar || ''}
                    onChange={(e) => updateAuthorField('avatar', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Verified Checkmark Badge</span>
                  <input
                    type="checkbox"
                    checked={sceneState.post?.author.verified ?? true}
                    onChange={(e) => updateAuthorField('verified', e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </div>

                {platformId === 'instagram' && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Instagram Story Gradient Ring</span>
                    <input
                      type="checkbox"
                      checked={sceneState.post?.author.hasStoryRing ?? true}
                      onChange={(e) => updateAuthorField('hasStoryRing', e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 2: CONTENT & MEDIA (FOR POST / STORY / VIDEO MODES) */}
          {isPostMode && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleAccordion('content')}
                className="w-full p-4 font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Content & Media Parameters</span>
                </div>
                {openAccordion === 'content' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openAccordion === 'content' && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  {sceneState.post && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Post Caption / Tweet Text</label>
                      <textarea
                        rows={3}
                        value={sceneState.post.caption}
                        onChange={(e) => updatePostField('caption', e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  )}

                  {sceneState.post && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Media Image / Video URL</label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={sceneState.post.mediaUrl || ''}
                        onChange={(e) => updatePostField('mediaUrl', e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  )}

                  {/* X / Twitter Client App Tag */}
                  {platformId === 'x' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Client App Tag</label>
                      <input
                        type="text"
                        placeholder="Twitter for iPhone"
                        value={sceneState.clientAppTag || 'Twitter for iPhone'}
                        onChange={(e) => setSceneState((prev) => ({ ...prev, clientAppTag: e.target.value }))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  )}

                  {sceneState.post && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Location Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. San Francisco, California"
                        value={sceneState.post.location || ''}
                        onChange={(e) => updatePostField('location', e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                      {/* Location Quick Presets */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {['San Francisco', 'New York', 'London', 'Tokyo', 'Paris', 'Los Angeles', 'Dubai'].map((loc) => (
                          <button
                            key={loc}
                            onClick={() => updatePostField('location', loc)}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-600"
                          >
                            + {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sceneState.post && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tagged People</label>
                      <input
                        type="text"
                        placeholder="@alex, @maya"
                        value={sceneState.post.taggedUsers ? sceneState.post.taggedUsers.join(', ') : ''}
                        onChange={(e) => updatePostField('taggedUsers', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                      />
                    </div>
                  )}

                  {sceneState.post && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Post Date</label>
                        <input
                          type="text"
                          placeholder="Sep 15, 2026"
                          value={sceneState.post.postDate || ''}
                          onChange={(e) => updatePostField('postDate', e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Post Time</label>
                        <input
                          type="text"
                          placeholder="10:42 AM"
                          value={sceneState.post.postTime || ''}
                          onChange={(e) => updatePostField('postTime', e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACCORDION 3: CHAT CONVERSATION BUILDER (SHOWN FOR CHAT MODES) */}
          {isChatMode && sceneState.conversation && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleAccordion('messages')}
                className="w-full p-4 font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>Chat Conversation Builder</span>
                </div>
                {openAccordion === 'messages' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openAccordion === 'messages' && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Message List</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => addChatMessage('text')}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Text</span>
                      </button>
                      <button
                        onClick={() => addChatMessage('voice')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Voice Note</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {sceneState.conversation.messages.map((m, idx) => (
                      <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <select
                              value={m.direction}
                              onChange={(e) => {
                                const updated = [...sceneState.conversation!.messages];
                                updated[idx].direction = e.target.value as any;
                                setSceneState((prev) => ({
                                  ...prev,
                                  conversation: { ...prev.conversation!, messages: updated },
                                }));
                              }}
                              className="p-1 rounded bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                            >
                              <option value="received">Received (Left)</option>
                              <option value="sent">Sent (Right)</option>
                            </select>

                            <select
                              value={m.type || 'text'}
                              onChange={(e) => {
                                const updated = [...sceneState.conversation!.messages];
                                updated[idx].type = e.target.value as any;
                                setSceneState((prev) => ({
                                  ...prev,
                                  conversation: { ...prev.conversation!, messages: updated },
                                }));
                              }}
                              className="p-1 rounded bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                            >
                              <option value="text">Text Message</option>
                              <option value="voice">Audio Voice Note</option>
                              <option value="image">Photo Attachment</option>
                            </select>
                          </div>

                          <button onClick={() => removeChatMessage(m.id)} className="text-rose-500 hover:text-rose-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {m.type === 'voice' ? (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Voice Note Duration (e.g. 0:14)</label>
                            <input
                              type="text"
                              value={m.voiceDuration || '0:14'}
                              onChange={(e) => {
                                const updated = [...sceneState.conversation!.messages];
                                updated[idx].voiceDuration = e.target.value;
                                setSceneState((prev) => ({
                                  ...prev,
                                  conversation: { ...prev.conversation!, messages: updated },
                                }));
                              }}
                              className="w-full p-2 rounded bg-white dark:bg-slate-900 border text-xs"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={m.text}
                            onChange={(e) => {
                              const updated = [...sceneState.conversation!.messages];
                              updated[idx].text = e.target.value;
                              setSceneState((prev) => ({
                                ...prev,
                                conversation: { ...prev.conversation!, messages: updated },
                              }));
                            }}
                            className="w-full p-2 rounded bg-white dark:bg-slate-900 border text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACCORDION 4: METRICS & ENGAGEMENT (FOR POST / TWEET / VIDEO MODES) */}
          {isPostMode && sceneState.post && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleAccordion('metrics')}
                className="w-full p-4 font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                  <span>Metrics & Engagement Counts</span>
                </div>
                {openAccordion === 'metrics' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {openAccordion === 'metrics' && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Likes Count</label>
                    <input
                      type="number"
                      value={sceneState.post.likesCount || 0}
                      onChange={(e) => updatePostField('likesCount', parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Comments Count</label>
                    <input
                      type="number"
                      value={sceneState.post.commentsCount || 0}
                      onChange={(e) => updatePostField('commentsCount', parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Views Count</label>
                    <input
                      type="number"
                      value={sceneState.post.viewsCount || 0}
                      onChange={(e) => updatePostField('viewsCount', parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Liked State (Red Heart)</span>
                    <input
                      type="checkbox"
                      checked={sceneState.post.isLiked !== false}
                      onChange={(e) => updatePostField('isLiked', e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACCORDION 5: DEVICE FRAME & STATUS BAR */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleAccordion('frame')}
              className="w-full p-4 font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span>Device Frame & Header Parameters</span>
              </div>
              {openAccordion === 'frame' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {openAccordion === 'frame' && (
              <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Device Frame Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['iphone', 'browser', 'none'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setSceneState((prev) => ({ ...prev, deviceFrame: f }))}
                        className={`py-2 px-2 rounded-xl text-xs font-bold uppercase ${
                          sceneState.deviceFrame === f ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Header Time</label>
                    <input
                      type="text"
                      value={sceneState.deviceHeader?.time || '09:41'}
                      onChange={(e) =>
                        setSceneState((prev) => ({
                          ...prev,
                          deviceHeader: { ...(prev.deviceHeader || {}), time: e.target.value },
                        }))
                      }
                      className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Battery Level (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={sceneState.deviceHeader?.batteryLevel ?? 94}
                      onChange={(e) =>
                        setSceneState((prev) => ({
                          ...prev,
                          deviceHeader: { ...(prev.deviceHeader || {}), batteryLevel: parseInt(e.target.value, 10) || 100 },
                        }))
                      }
                      className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Live Device Frame Preview Workspace (Right Split Column) */}
      <div className="flex-1 space-y-4 min-w-0 w-full">
        {/* Floating Quick Action Bar */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSceneState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5"
            >
              {sceneState.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>{sceneState.theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            </button>

            <button
              onClick={() => setSceneState(getDefaultSceneState(platformId, sceneType))}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <button
            disabled={isExporting}
            onClick={handleExportPNG}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/25 cursor-pointer"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Download HD Mockup</span>
          </button>
        </div>

        {/* Center Live Canvas Rendering Area */}
        <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center min-h-[620px]">
          <div className="w-full flex items-center justify-center">
            <DeviceFrameWrapper
              exportRef={canvasRef}
              sceneState={sceneState}
            >
              {renderPlatformComponent()}
            </DeviceFrameWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};
