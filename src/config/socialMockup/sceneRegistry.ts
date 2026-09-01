import { PlatformId, SceneTypeId, SceneConfig, SceneState } from '../../types/socialMockup';
import { ToolDefinition } from '../../types';

export interface SceneRouteMapping {
  route: string;
  platformId: PlatformId;
  sceneType: SceneTypeId;
  name: string;
  seoTitle: string;
  seoDescription: string;
}

export const ALL_SCENE_ROUTES: SceneRouteMapping[] = [
  // Instagram
  {
    route: '/instagram-post-generator',
    platformId: 'instagram',
    sceneType: 'post',
    name: 'Instagram Post Generator',
    seoTitle: 'Fake Instagram Post Generator - Create Realistic Photo & Feed Mockups',
    seoDescription: 'Generate realistic fictional Instagram posts with custom avatars, captions, likes, comments, verified badges, and device frames.',
  },
  {
    route: '/instagram-dm-generator',
    platformId: 'instagram',
    sceneType: 'dm',
    name: 'Instagram DM Generator',
    seoTitle: 'Fake Instagram Direct Message (DM) Generator',
    seoDescription: 'Create mock Instagram chat conversations, DMs, voice notes, reactions, and story replies online.',
  },
  {
    route: '/instagram-story-generator',
    platformId: 'instagram',
    sceneType: 'story',
    name: 'Instagram Story Generator',
    seoTitle: 'Fake Instagram Story Generator - 9:16 Vertical Mockups',
    seoDescription: 'Create fictional Instagram stories with stickers, polls, locations, music indicators, and progress bars.',
  },
  {
    route: '/instagram-comment-generator',
    platformId: 'instagram',
    sceneType: 'comment',
    name: 'Instagram Comment Generator',
    seoTitle: 'Fake Instagram Comment & Reply Thread Generator',
    seoDescription: 'Create mock Instagram comment sections with nested replies, creator likes, and verified badges.',
  },
  {
    route: '/instagram-profile-generator',
    platformId: 'instagram',
    sceneType: 'profile',
    name: 'Instagram Profile Generator',
    seoTitle: 'Fake Instagram Profile Screen Generator',
    seoDescription: 'Design fictional Instagram profile pages with custom bio, follower counts, grid thumbnails, and highlight circles.',
  },
  {
    route: '/instagram-reel-mockup',
    platformId: 'instagram',
    sceneType: 'reel',
    name: 'Instagram Reel Generator',
    seoTitle: 'Fake Instagram Reel Screen Generator',
    seoDescription: 'Create vertical 9:16 Instagram Reel mockups with audio credits, captions, and engagement icons.',
  },

  // WhatsApp
  {
    route: '/whatsapp-chat-generator',
    platformId: 'whatsapp',
    sceneType: 'chat',
    name: 'WhatsApp Chat Generator',
    seoTitle: 'Fake WhatsApp Chat Generator - Create Realistic WhatsApp Conversations',
    seoDescription: 'Design fictional WhatsApp messages, double blue ticks, voice notes, timestamps, and dark mode screens.',
  },
  {
    route: '/whatsapp-group-chat-generator',
    platformId: 'whatsapp',
    sceneType: 'group_chat',
    name: 'WhatsApp Group Chat Generator',
    seoTitle: 'Fake WhatsApp Group Chat Generator',
    seoDescription: 'Generate mock WhatsApp group conversations with multiple participants, admin tags, and system alerts.',
  },
  {
    route: '/whatsapp-status-generator',
    platformId: 'whatsapp',
    sceneType: 'status',
    name: 'WhatsApp Status Generator',
    seoTitle: 'Fake WhatsApp Status & Story Generator',
    seoDescription: 'Create custom WhatsApp status screens with captions and viewer counts.',
  },

  // LinkedIn
  {
    route: '/linkedin-post-generator',
    platformId: 'linkedin',
    sceneType: 'post',
    name: 'LinkedIn Post Generator',
    seoTitle: 'Fake LinkedIn Post Generator - Professional Feed Mockups',
    seoDescription: 'Generate realistic LinkedIn posts with headlines, connection tags, reactions, comments, and media previews.',
  },
  {
    route: '/linkedin-message-generator',
    platformId: 'linkedin',
    sceneType: 'dm',
    name: 'LinkedIn InMail / Message Generator',
    seoTitle: 'Fake LinkedIn Message & InMail Generator',
    seoDescription: 'Create mock LinkedIn professional messages with sender headlines and read states.',
  },
  {
    route: '/linkedin-profile-generator',
    platformId: 'linkedin',
    sceneType: 'profile',
    name: 'LinkedIn Profile Generator',
    seoTitle: 'Fake LinkedIn Profile Card Generator',
    seoDescription: 'Design custom LinkedIn profile headers, experience sections, and follower counts.',
  },

  // TikTok
  {
    route: '/tiktok-post-generator',
    platformId: 'tiktok',
    sceneType: 'post',
    name: 'TikTok Video Screen Generator',
    seoTitle: 'Fake TikTok Video & Feed Screen Generator',
    seoDescription: 'Create 9:16 TikTok UI mockups with music tracks, comment counts, share buttons, and avatars.',
  },
  {
    route: '/tiktok-dm-generator',
    platformId: 'tiktok',
    sceneType: 'dm',
    name: 'TikTok Direct Message Generator',
    seoTitle: 'Fake TikTok DM & Chat Generator',
    seoDescription: 'Create mock TikTok chat conversations with video share cards and emoji reactions.',
  },
  {
    route: '/tiktok-comment-generator',
    platformId: 'tiktok',
    sceneType: 'comment',
    name: 'TikTok Comment Drawer Generator',
    seoTitle: 'Fake TikTok Comment Section Generator',
    seoDescription: 'Generate mock TikTok comment overlays with creator hearts and reply chains.',
  },

  // X / Twitter
  {
    route: '/x-post-generator',
    platformId: 'x',
    sceneType: 'post',
    name: 'X (Twitter) Post Generator',
    seoTitle: 'Fake X (Twitter) Post & Tweet Generator',
    seoDescription: 'Create realistic X/Twitter posts with view counts, reposts, bookmarks, images, and verified checkmarks.',
  },
  {
    route: '/x-dm-generator',
    platformId: 'x',
    sceneType: 'dm',
    name: 'X (Twitter) DM Generator',
    seoTitle: 'Fake X / Twitter Direct Message Generator',
    seoDescription: 'Design fictional X/Twitter chat conversations with read receipts and timestamps.',
  },

  // Facebook
  {
    route: '/facebook-post-generator',
    platformId: 'facebook',
    sceneType: 'post',
    name: 'Facebook Post Generator',
    seoTitle: 'Fake Facebook Post & Feed Generator',
    seoDescription: 'Generate mock Facebook posts with custom reaction pills (Like, Love, Care, Haha, Wow), comments, and shares.',
  },
  {
    route: '/facebook-messenger-generator',
    platformId: 'facebook',
    sceneType: 'chat',
    name: 'Facebook Messenger Chat Generator',
    seoTitle: 'Fake Messenger Chat Generator',
    seoDescription: 'Design fictional Facebook Messenger conversations with active status dots and chat bubbles.',
  },

  // iMessage / iPhone
  {
    route: '/imessage-generator',
    platformId: 'imessage',
    sceneType: 'chat',
    name: 'iMessage Chat Generator',
    seoTitle: 'Fake iMessage Chat Generator - iOS Blue & Green Bubbles',
    seoDescription: 'Create mock iPhone iMessage conversations with blue/green bubbles, tapbacks, delivered receipts, and typing dots.',
  },
  {
    route: '/imessage-lock-screen-generator',
    platformId: 'imessage',
    sceneType: 'lock_screen',
    name: 'iPhone Lock Screen Notification Generator',
    seoTitle: 'Fake iPhone Lock Screen & Notification Generator',
    seoDescription: 'Design custom iOS lock screens with wallpaper, time, battery level, and notification popups.',
  },

  // YouTube
  {
    route: '/youtube-comment-generator',
    platformId: 'youtube',
    sceneType: 'comment',
    name: 'YouTube Comment Generator',
    seoTitle: 'Fake YouTube Comment Section Generator',
    seoDescription: 'Create mock YouTube video comments with channel badges, likes, and creator hearts.',
  },
  {
    route: '/youtube-post-generator',
    platformId: 'youtube',
    sceneType: 'post',
    name: 'YouTube Community Post Generator',
    seoTitle: 'Fake YouTube Community Post Generator',
    seoDescription: 'Design YouTube community feed posts with image attachments and vote polls.',
  },

  // Telegram
  {
    route: '/telegram-chat-generator',
    platformId: 'telegram',
    sceneType: 'chat',
    name: 'Telegram Chat Generator',
    seoTitle: 'Fake Telegram Chat & Channel Generator',
    seoDescription: 'Generate mock Telegram messages, voice note waveforms, and dark mode channels.',
  },

  // Discord
  {
    route: '/discord-chat-generator',
    platformId: 'discord',
    sceneType: 'chat',
    name: 'Discord Server Chat Generator',
    seoTitle: 'Fake Discord Server & DM Chat Generator',
    seoDescription: 'Create Dark Mode Discord channel messages with role colors, code blocks, and reactions.',
  },

  // Snapchat
  {
    route: '/snapchat-chat-generator',
    platformId: 'snapchat',
    sceneType: 'chat',
    name: 'Snapchat Chat Generator',
    seoTitle: 'Fake Snapchat Chat Screen Generator',
    seoDescription: 'Create mock Snapchat chat scenes with opened/delivered indicators and typing states.',
  },

  // Threads
  {
    route: '/threads-post-generator',
    platformId: 'threads',
    sceneType: 'post',
    name: 'Threads Post Generator',
    seoTitle: 'Fake Threads Post Generator',
    seoDescription: 'Design fictional Threads posts with reposts, likes, and replies.',
  },
];

export function getSceneConfigByRoute(path: string): SceneRouteMapping | undefined {
  const clean = path.replace(/^\/+|\/+$/g, '').toLowerCase();
  return ALL_SCENE_ROUTES.find((r) => r.route.replace(/^\/+/, '').toLowerCase() === clean);
}

export function createSocialMockupToolDefinition(scene: SceneRouteMapping): ToolDefinition {
  const cleanSlug = scene.route.replace(/^\/+/, '');
  return {
    id: cleanSlug,
    slug: cleanSlug,
    name: scene.name,
    shortDescription: scene.seoDescription,
    fullDescription: `${scene.seoTitle}. High-fidelity browser-side generator for ${scene.name}. Customize text, media, timestamps, metrics, badges, and device frames with instant high-resolution PNG export.`,
    category: 'social',
    processingType: 'browser',
    icon: 'Sparkles',
    route: scene.route,
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/png', 'image/jpeg'],
    maxFileSizeMB: 50,
    isPopular: true,
    platformId: scene.platformId,
    sceneType: scene.sceneType,
    features: [
      `Pixel-accurate ${scene.name} layout and typography`,
      'Custom dark / light mode interface toggle',
      'Realistic metric counters, badges, and timestamps',
      'Instant client-side 2x/3x high-resolution PNG export',
    ],
    howToSteps: [
      { step: 1, title: 'Customize Scene', description: 'Enter message text, upload avatar or media, and adjust engagement metrics.' },
      { step: 2, title: 'Select Device Frame', description: 'Choose iOS, Android, or frameless canvas display options.' },
      { step: 3, title: 'Export High-Res Mockup', description: 'Download crisp, high-resolution PNG image directly in your browser.' },
    ],
    faqs: [
      {
        question: `Is this ${scene.name} free to use?`,
        answer: 'Yes, 100% free with unlimited exports and zero watermarks.',
      },
      {
        question: 'Are my generated images stored online?',
        answer: 'No, all generation happens 100% locally in your browser memory for maximum privacy.',
      },
    ],
    seo: {
      title: scene.seoTitle,
      description: scene.seoDescription,
      keywords: [cleanSlug.replace(/-/g, ' '), scene.name.toLowerCase(), 'mockup generator', 'fake chat generator'],
      canonicalSlug: cleanSlug,
    },
  };
}

export function parseSocialMockupRoute(path: string): ToolDefinition | undefined {
  const config = getSceneConfigByRoute(path);
  if (config) {
    return createSocialMockupToolDefinition(config);
  }
  return undefined;
}

export function getRouteForPlatformScene(platformId: PlatformId, sceneType: SceneTypeId = 'post'): string {
  const match = ALL_SCENE_ROUTES.find((r) => r.platformId === platformId && r.sceneType === sceneType);
  if (match) return match.route;
  const firstMatch = ALL_SCENE_ROUTES.find((r) => r.platformId === platformId);
  return firstMatch ? firstMatch.route : `/${platformId}-${sceneType}-generator`;
}

export function getDefaultSceneState(platformId: PlatformId, sceneType: SceneTypeId): SceneState {
  return {
    id: `scene_${Date.now()}`,
    platformId,
    sceneType,
    theme: platformId === 'tiktok' || platformId === 'discord' || platformId === 'x' ? 'dark' : 'light',
    deviceFrame: 'iphone',
    background: {
      type: 'gradient',
      gradient: 'from-purple-900 via-slate-900 to-indigo-950',
    },
    showWatermark: false,
    watermarkText: 'FICTIONAL MOCKUP',

    // Sample Default Conversation
    conversation: {
      conversationId: 'conv_default',
      isGroup: false,
      participants: [
        {
          id: 'user_1',
          name: 'Alex Rivera',
          username: 'alex.design',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verified: true,
          status: 'online',
        },
        {
          id: 'user_2',
          name: 'Maya Lin',
          username: 'maya_studio',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          verified: false,
        },
      ],
      messages: [
        {
          id: 'msg_1',
          senderId: 'user_2',
          text: 'Hey Alex! Just saw the new UI mockups for the project. Absolutely stunning work! 🔥',
          timestamp: '10:42 AM',
          direction: 'received',
        },
        {
          id: 'msg_2',
          senderId: 'user_1',
          text: 'Thanks Maya! Glad you like it. I am working on the dark mode variation right now.',
          timestamp: '10:44 AM',
          direction: 'sent',
          status: 'double_blue_tick',
        },
        {
          id: 'msg_3',
          senderId: 'user_2',
          text: 'Can we schedule a quick call to review before presenting to the client?',
          timestamp: '10:45 AM',
          direction: 'received',
          reaction: '❤️',
        },
      ],
    },

    // Sample Default Post
    post: {
      author: {
        id: 'user_1',
        name: 'Alex Rivera',
        username: 'alex_design',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
      },
      location: 'San Francisco, CA',
      caption: 'Building the next generation of creative tools! 🚀 What feature should we launch next? Comment below! #Design #UIUX #CreatorEconomy',
      hashtags: ['Design', 'UIUX', 'CreatorEconomy'],
      timestamp: '2 hours ago',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      mediaAspect: '4:5',
      likesCount: 14820,
      commentsCount: 342,
      sharesCount: 1205,
      viewsCount: 89400,
      comments: [
        {
          id: 'c1',
          author: {
            id: 'u_comm1',
            name: 'Sarah Chen',
            username: 'sarah_ux',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            verified: false,
          },
          text: 'This interface is so smooth! Love the color palette choices.',
          timestamp: '1h ago',
          likes: 42,
          isCreatorLiked: true,
        },
      ],
    },

    // Sample Default Story
    story: {
      author: {
        id: 'user_1',
        name: 'Alex Rivera',
        username: 'alex.design',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
      },
      mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      timestamp: '4h ago',
      locationSticker: '📍 Studio Hub',
      musicSticker: { song: 'Midnight City', artist: 'M83' },
      viewersCount: 2840,
    },

    // Sample Default Profile
    profile: {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      name: 'Alex Rivera',
      username: 'alex.design',
      verified: true,
      bio: 'Product Designer & Creative Director 🎨 Building tools for creators worldwide. SF / NYC.',
      website: 'aetherpix.studio',
      followersCount: 142000,
      followingCount: 420,
      postsCount: 184,
      connectionsCount: 500,
      headline: 'Lead Product Designer at AetherPix Studio',
    },

    // Sample Lock Screen
    lockScreen: {
      wallpaperUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      time: '09:41',
      date: 'Tuesday, September 15',
      appName: 'Messages',
      senderName: 'Maya Lin',
      messageText: 'The client just approved the final designs! Launch tomorrow 🎉',
      timestamp: 'now',
      batteryLevel: 94,
    },
  };
}
