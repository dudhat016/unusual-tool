/**
 * Complete Data Schemas & Types for Social Media Mockup Studio SaaS
 */

export type PlatformCategory = 'social' | 'messaging' | 'video' | 'professional' | 'community';

export type PlatformId =
  | 'instagram'
  | 'whatsapp'
  | 'linkedin'
  | 'tiktok'
  | 'x'
  | 'facebook'
  | 'youtube'
  | 'imessage'
  | 'telegram'
  | 'discord'
  | 'snapchat'
  | 'threads'
  | 'messenger';

export type SceneTypeId =
  | 'post'
  | 'chat'
  | 'dm'
  | 'group_chat'
  | 'story'
  | 'profile'
  | 'reel'
  | 'comment'
  | 'comment_thread'
  | 'lock_screen'
  | 'call'
  | 'status'
  | 'channel'
  | 'ad_preview';

export type ThemeMode = 'light' | 'dark' | 'platform_default';

export type DeviceFrameType = 'none' | 'iphone' | 'android' | 'browser' | 'glass';

export type ExportFormat = 'png' | 'jpg' | 'svg';

// User / Participant Model
export interface Participant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  hasStoryRing?: boolean; // Toggle active Instagram story ring
  role?: string; // e.g. 'Admin', 'Creator'
  status?: 'online' | 'offline' | 'typing' | 'last_seen';
  statusText?: string;
  color?: string; // Participant color for group chats
}

// Chat Message Model
export type MessageType =
  | 'text'
  | 'image'
  | 'voice'
  | 'system'
  | 'reaction'
  | 'story_reply'
  | 'shared_post'
  | 'link_preview';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  direction?: 'sent' | 'received';
  type?: MessageType;
  mediaUrl?: string;
  voiceDuration?: string;
  voicePlayed?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'double_blue_tick';
  reaction?: string; // e.g. '❤️', '👍', '🔥'
  replyToMessageId?: string;
  replyToText?: string;
  replyToSenderName?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
}

// Conversation Data Model
export interface ConversationData {
  conversationId: string;
  chatTitle?: string;
  chatSubTitle?: string;
  chatAvatar?: string;
  isGroup: boolean;
  participants: Participant[];
  messages: ChatMessage[];
  unreadCount?: number;
}

// Post Comment Model
export interface PostComment {
  id: string;
  author: Participant;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  isPinned?: boolean;
  isCreatorLiked?: boolean;
  replies?: PostComment[];
}

// Post Data Model
export interface PostData {
  author: Participant;
  location?: string;
  musicTitle?: string;
  caption: string;
  hashtags?: string[];
  mentions?: string[];
  taggedUsers?: string[]; // E.g. ['@alex', '@maya']
  timestamp: string;
  postDate?: string; // E.g. 'Sep 15, 2026'
  postTime?: string; // E.g. '10:42 AM'
  mediaUrl?: string;
  mediaAspect?: '1:1' | '4:5' | '16:9' | '9:16';
  carouselImages?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  repostsCount?: number;
  bookmarksCount?: number;
  viewsCount?: number;
  comments?: PostComment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  audienceVisibility?: string;
  headline?: string; // LinkedIn professional headline
}

// Story Data Model
export interface StoryData {
  author: Participant;
  mediaUrl: string;
  timestamp: string;
  locationSticker?: string;
  questionSticker?: string;
  pollSticker?: { question: string; option1: string; option2: string; percentage1: number };
  musicSticker?: { song: string; artist: string };
  linkSticker?: { text: string; url: string };
  viewersCount?: number;
  isCloseFriends?: boolean;
}

// Profile Data Model
export interface ProfileData {
  avatar: string;
  coverImage?: string;
  name: string;
  username: string;
  verified?: boolean;
  bio: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  connectionsCount?: number;
  subscribersCount?: number;
  headline?: string;
  badges?: string[];
}

// Lock Screen Notification Model
export interface LockScreenData {
  wallpaperUrl?: string;
  time: string;
  date: string;
  appName: string;
  appIcon?: string;
  senderName: string;
  messageText: string;
  timestamp: string;
  batteryLevel?: number;
}

// Lock Screen Notification & Device Header Model
export interface DeviceHeaderData {
  time?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  wifiBars?: 1 | 2 | 3;
  cellularBars?: 1 | 2 | 3 | 4;
  showStatusBar?: boolean;
}

// Complete Universal Scene Data Union
export interface SceneState {
  id: string;
  platformId: PlatformId;
  sceneType: SceneTypeId;
  theme: ThemeMode;
  deviceFrame: DeviceFrameType;
  deviceHeader?: DeviceHeaderData;
  background: {
    type: 'transparent' | 'solid' | 'gradient' | 'blur';
    color?: string;
    gradient?: string;
    imageUrl?: string;
  };
  showWatermark: boolean;
  watermarkText?: string;
  clientAppTag?: string; // e.g. 'Twitter for iPhone'
  carouselIndex?: number;
  carouselTotal?: number;
  
  // Specific Scene Data payloads
  conversation?: ConversationData;
  post?: PostData;
  story?: StoryData;
  profile?: ProfileData;
  lockScreen?: LockScreenData;
}

// Platform Config Definition
export interface PlatformConfig {
  id: PlatformId;
  name: string;
  slug: string;
  category: PlatformCategory;
  iconName: string;
  brandColor: string;
  supportedSceneTypes: SceneTypeId[];
  themeModes: ThemeMode[];
  defaultTheme: ThemeMode;
}

// Scene Config Definition
export interface SceneConfig {
  id: SceneTypeId;
  name: string;
  platformId: PlatformId;
  route: string;
  seoTitle: string;
  seoDescription: string;
}

// Template Definition
export interface MockupTemplate {
  id: string;
  name: string;
  description: string;
  platformId: PlatformId;
  sceneType: SceneTypeId;
  thumbnailUrl?: string;
  sceneState: SceneState;
}
