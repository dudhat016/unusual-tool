import { MockupTemplate } from '../../types/socialMockup';
import { getDefaultSceneState } from './sceneRegistry';

export const MOCKUP_TEMPLATES: MockupTemplate[] = [
  {
    id: 'tmpl_brand_collab',
    name: 'Brand Collaboration DM',
    description: 'Instagram DM conversation between a brand representative and an influencer.',
    platformId: 'instagram',
    sceneType: 'dm',
    sceneState: {
      ...getDefaultSceneState('instagram', 'dm'),
      conversation: {
        conversationId: 'collab_1',
        isGroup: false,
        participants: [
          {
            id: 'brand',
            name: 'Aether Studio',
            username: 'aether.official',
            avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
            verified: true,
          },
          {
            id: 'creator',
            name: 'Elena Rostova',
            username: 'elena_style',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            verified: true,
          },
        ],
        messages: [
          {
            id: 'm1',
            senderId: 'brand',
            text: 'Hi Elena! We love your recent design posts. We would love to collaborate on our upcoming product launch!',
            timestamp: '02:15 PM',
            direction: 'received',
          },
          {
            id: 'm2',
            senderId: 'creator',
            text: 'Hey! Thanks so much. I would love to learn more about the collaboration details!',
            timestamp: '02:18 PM',
            direction: 'sent',
            status: 'double_blue_tick',
          },
          {
            id: 'm3',
            senderId: 'brand',
            text: 'Awesome! I just sent over the campaign brief and details to your email. Let us know what you think!',
            timestamp: '02:20 PM',
            direction: 'received',
            reaction: '❤️',
          },
        ],
      },
    },
  },
  {
    id: 'tmpl_whatsapp_group',
    name: 'Team Project Group Chat',
    description: 'WhatsApp group chat planning a product launch with multiple team members.',
    platformId: 'whatsapp',
    sceneType: 'group_chat',
    sceneState: {
      ...getDefaultSceneState('whatsapp', 'group_chat'),
      conversation: {
        conversationId: 'team_group',
        chatTitle: '🚀 Launch Team 2026',
        isGroup: true,
        participants: [
          {
            id: 'p1',
            name: 'David Kim',
            username: 'david',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            color: '#2563eb',
            role: 'Admin',
          },
          {
            id: 'p2',
            name: 'Sophia Martinez',
            username: 'sophia',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            color: '#dc2626',
          },
          {
            id: 'p3',
            name: 'Marcus Vance',
            username: 'marcus',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            color: '#16a34a',
          },
        ],
        messages: [
          {
            id: 'gm1',
            senderId: 'p1',
            text: 'Team, final deployment passed all tests! We are live in 30 minutes! 🎉',
            timestamp: '09:30 AM',
            direction: 'received',
          },
          {
            id: 'gm2',
            senderId: 'p2',
            text: 'Social media posts and blog announcements are scheduled!',
            timestamp: '09:32 AM',
            direction: 'received',
            reaction: '🚀',
          },
          {
            id: 'gm3',
            senderId: 'p3',
            text: 'Awesome work everyone! Monitoring server telemetry now.',
            timestamp: '09:35 AM',
            direction: 'sent',
            status: 'double_blue_tick',
          },
        ],
      },
    },
  },
  {
    id: 'tmpl_product_launch_post',
    name: 'Viral Product Launch Post',
    description: 'Instagram Feed post mockup for a new product announcement.',
    platformId: 'instagram',
    sceneType: 'post',
    sceneState: getDefaultSceneState('instagram', 'post'),
  },
  {
    id: 'tmpl_linkedin_post',
    name: 'LinkedIn Thought Leadership',
    description: 'LinkedIn post with professional headline and career milestone metrics.',
    platformId: 'linkedin',
    sceneType: 'post',
    sceneState: getDefaultSceneState('linkedin', 'post'),
  },
  {
    id: 'tmpl_imessage_lockscreen',
    name: 'iPhone Lock Screen Alert',
    description: 'iOS Lock Screen with custom wallpaper, date, battery level, and urgent message.',
    platformId: 'imessage',
    sceneType: 'lock_screen',
    sceneState: getDefaultSceneState('imessage', 'lock_screen'),
  },
];
