import { toPng } from 'html-to-image';
import React, { useState, useRef } from 'react';
import { SceneState, PlatformId, SceneTypeId, ChatMessage } from '../../types/socialMockup';
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

// Design System UI Components
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';

import {
  Download,
  Sparkles,
  User,
  MessageSquare,
  Image as ImageIcon,
  BarChart2,
  Settings,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Play,
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

  // Field update helpers
  const updateAuthorField = (field: string, val: any) => {
    setSceneState((prev) => ({
      ...prev,
      post: prev.post
        ? {
            ...prev.post,
            author: { ...prev.post.author, [field]: val },
          }
        : undefined,
    }));
  };

  const updatePostField = (field: string, val: any) => {
    setSceneState((prev) => ({
      ...prev,
      post: prev.post ? { ...prev.post, [field]: val } : undefined,
    }));
  };

  // Chat message management
  const addChatMessage = (type: 'text' | 'image' | 'voice' = 'text') => {
    if (!sceneState.conversation) return;
    const newId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: newId,
      senderId: 'user_1',
      text: type === 'text' ? 'New chat message...' : '',
      timestamp: '10:45 AM',
      direction: 'received',
      type,
      status: 'read',
      voiceDuration: type === 'voice' ? '0:12' : undefined,
    };

    setSceneState((prev) => ({
      ...prev,
      conversation: {
        ...prev.conversation!,
        messages: [...prev.conversation!.messages, newMsg],
      },
    }));
  };

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

  // High-Resolution 2x PNG Export
  const handleExportPng = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${platformId}-${sceneType}-mockup-${Date.now()}.png`;
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
      {/* 1. Leftmost Vertical Platform Bar */}
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

      {/* 2. Main Controls & Settings Panel */}
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
                <Input
                  label="Display Name"
                  size="sm"
                  value={sceneState.post?.author.name || 'Alex Rivera'}
                  onChange={(e) => updateAuthorField('name', e.target.value)}
                />

                <Input
                  label="Username / Handle"
                  size="sm"
                  value={sceneState.post?.author.username || 'alex_design'}
                  onChange={(e) => updateAuthorField('username', e.target.value)}
                />

                {/* LinkedIn Professional Headline */}
                {platformId === 'linkedin' && (
                  <Input
                    label="Professional Headline"
                    size="sm"
                    placeholder="Founder @ TechCorp | Ex-Google"
                    value={sceneState.post?.headline || ''}
                    onChange={(e) => updatePostField('headline', e.target.value)}
                  />
                )}

                <Input
                  label="Avatar Image URL"
                  size="sm"
                  value={sceneState.post?.author.avatar || ''}
                  onChange={(e) => updateAuthorField('avatar', e.target.value)}
                />

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Verified Checkmark Badge</span>
                  <Switch
                    checked={sceneState.post?.author.verified ?? true}
                    onChange={(checked) => updateAuthorField('verified', checked)}
                    size="sm"
                  />
                </div>

                {platformId === 'instagram' && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Instagram Story Gradient Ring</span>
                    <Switch
                      checked={sceneState.post?.author.hasStoryRing ?? true}
                      onChange={(checked) => updateAuthorField('hasStoryRing', checked)}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 2: CONTENT & MEDIA */}
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
                    <Textarea
                      label="Post Caption / Tweet Text"
                      rows={3}
                      value={sceneState.post.caption}
                      onChange={(e) => updatePostField('caption', e.target.value)}
                    />
                  )}

                  {sceneState.post && (
                    <Input
                      label="Media Image / Video URL"
                      size="sm"
                      placeholder="https://images.unsplash.com/..."
                      value={sceneState.post.mediaUrl || ''}
                      onChange={(e) => updatePostField('mediaUrl', e.target.value)}
                    />
                  )}

                  {/* X / Twitter Client App Tag */}
                  {platformId === 'x' && (
                    <Input
                      label="Client App Tag"
                      size="sm"
                      placeholder="Twitter for iPhone"
                      value={sceneState.clientAppTag || 'Twitter for iPhone'}
                      onChange={(e) => setSceneState((prev) => ({ ...prev, clientAppTag: e.target.value }))}
                    />
                  )}

                  {sceneState.post && (
                    <div className="space-y-1.5">
                      <Input
                        label="Location Tag"
                        size="sm"
                        placeholder="e.g. San Francisco, California"
                        value={sceneState.post.location || ''}
                        onChange={(e) => updatePostField('location', e.target.value)}
                      />
                      {/* Location Quick Presets */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {['San Francisco', 'New York', 'London', 'Tokyo', 'Paris', 'Los Angeles', 'Dubai'].map((loc) => (
                          <Button
                            key={loc}
                            variant="ghost"
                            size="xs"
                            onClick={() => updatePostField('location', loc)}
                            className="text-[10px] font-bold"
                          >
                            + {loc}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sceneState.post && (
                    <Input
                      label="Tagged People"
                      size="sm"
                      placeholder="@alex, @maya"
                      value={sceneState.post.taggedUsers ? sceneState.post.taggedUsers.join(', ') : ''}
                      onChange={(e) => updatePostField('taggedUsers', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    />
                  )}

                  {sceneState.post && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Post Date"
                        size="sm"
                        placeholder="Sep 15, 2026"
                        value={sceneState.post.postDate || ''}
                        onChange={(e) => updatePostField('postDate', e.target.value)}
                      />
                      <Input
                        label="Post Time"
                        size="sm"
                        placeholder="10:42 AM"
                        value={sceneState.post.postTime || ''}
                        onChange={(e) => updatePostField('postTime', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ACCORDION 3: CHAT CONVERSATION BUILDER */}
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
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => addChatMessage('text')}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Text
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => addChatMessage('voice')}
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                      >
                        Voice Note
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {sceneState.conversation.messages.map((m, idx) => (
                      <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Select
                              size="sm"
                              value={m.direction}
                              onChange={(e) => {
                                const updated = [...sceneState.conversation!.messages];
                                updated[idx].direction = e.target.value as any;
                                setSceneState((prev) => ({
                                  ...prev,
                                  conversation: { ...prev.conversation!, messages: updated },
                                }));
                              }}
                              options={[
                                { label: 'Received (Left)', value: 'received' },
                                { label: 'Sent (Right)', value: 'sent' },
                              ]}
                            />

                            <Select
                              size="sm"
                              value={m.type || 'text'}
                              onChange={(e) => {
                                const updated = [...sceneState.conversation!.messages];
                                updated[idx].type = e.target.value as any;
                                setSceneState((prev) => ({
                                  ...prev,
                                  conversation: { ...prev.conversation!, messages: updated },
                                }));
                              }}
                              options={[
                                { label: 'Text Message', value: 'text' },
                                { label: 'Audio Voice Note', value: 'voice' },
                                { label: 'Photo Attachment', value: 'image' },
                              ]}
                            />
                          </div>

                          <button onClick={() => removeChatMessage(m.id)} className="text-rose-500 hover:text-rose-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {m.type === 'voice' ? (
                          <Input
                            label="Voice Note Duration"
                            size="sm"
                            value={m.voiceDuration || '0:14'}
                            onChange={(e) => {
                              const updated = [...sceneState.conversation!.messages];
                              updated[idx].voiceDuration = e.target.value;
                              setSceneState((prev) => ({
                                ...prev,
                                conversation: { ...prev.conversation!, messages: updated },
                              }));
                            }}
                          />
                        ) : (
                          <Input
                            size="sm"
                            value={m.text}
                            onChange={(e) => {
                              const updated = [...sceneState.conversation!.messages];
                              updated[idx].text = e.target.value;
                              setSceneState((prev) => ({
                                ...prev,
                                conversation: { ...prev.conversation!, messages: updated },
                              }));
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACCORDION 4: METRICS & ENGAGEMENT COUNTS */}
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
                  <Input
                    label="Likes Count"
                    type="number"
                    size="sm"
                    value={sceneState.post.likesCount || 0}
                    onChange={(e) => updatePostField('likesCount', parseInt(e.target.value, 10) || 0)}
                  />

                  <Input
                    label="Comments Count"
                    type="number"
                    size="sm"
                    value={sceneState.post.commentsCount || 0}
                    onChange={(e) => updatePostField('commentsCount', parseInt(e.target.value, 10) || 0)}
                  />

                  <Input
                    label="Views Count"
                    type="number"
                    size="sm"
                    value={sceneState.post.viewsCount || 0}
                    onChange={(e) => updatePostField('viewsCount', parseInt(e.target.value, 10) || 0)}
                  />

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Liked State (Red Heart)</span>
                    <Switch
                      checked={sceneState.post.isLiked !== false}
                      onChange={(checked) => updatePostField('isLiked', checked)}
                      size="sm"
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Device Frame</label>
                    <Select
                      size="sm"
                      value={sceneState.deviceFrame || 'iphone'}
                      onChange={(e) => setSceneState((prev) => ({ ...prev, deviceFrame: e.target.value as any }))}
                      options={[
                        { label: 'iPhone (Dynamic Island)', value: 'iphone' },
                        { label: 'Android Phone (Punch Hole)', value: 'android' },
                        { label: 'No Frame (Clean Card)', value: 'none' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Theme Mode</label>
                    <Select
                      size="sm"
                      value={sceneState.theme === 'dark' ? 'dark' : 'light'}
                      onChange={(e) => setSceneState((prev) => ({ ...prev, theme: e.target.value as any }))}
                      options={[
                        { label: 'Light Mode', value: 'light' },
                        { label: 'Dark Mode', value: 'dark' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Status Bar Clock"
                    size="sm"
                    value={sceneState.deviceHeader?.time || '9:41'}
                    onChange={(e) =>
                      setSceneState((prev) => ({
                        ...prev,
                        deviceHeader: { ...prev.deviceHeader, time: e.target.value },
                      }))
                    }
                  />

                  <Input
                    label="Battery Level (%)"
                    type="number"
                    size="sm"
                    value={sceneState.deviceHeader?.batteryLevel ?? 95}
                    onChange={(e) =>
                      setSceneState((prev) => ({
                        ...prev,
                        deviceHeader: { ...prev.deviceHeader, batteryLevel: parseInt(e.target.value, 10) || 100 },
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2x HD Export Action Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isExporting}
          onClick={handleExportPng}
          leftIcon={<Download className="w-4 h-4" />}
          className="shadow-lg shadow-purple-600/20"
        >
          Download 2x HD PNG Mockup
        </Button>
      </div>

      {/* 3. Live Canvas Preview Column */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner min-h-[580px]">
        <div ref={canvasRef} className="p-4 sm:p-6 transition-all duration-300 flex items-center justify-center">
          <DeviceFrameWrapper sceneState={sceneState}>
            {renderPlatformComponent()}
          </DeviceFrameWrapper>
        </div>
      </div>
    </div>
  );
};
