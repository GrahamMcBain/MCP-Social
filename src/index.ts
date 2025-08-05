#!/usr/bin/env node

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Database } from './database.js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables are required');
  process.exit(1);
}

// Initialize database
const db = new Database(SUPABASE_URL, SUPABASE_KEY);

// Current user context (in a real implementation, this would be handled differently)
let currentUser: string | null = null;

// Create server
const server = new Server(
  {
    name: 'mcp-social-network',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to format posts for display
function formatPost(post: any): string {
  const timeAgo = getTimeAgo(new Date(post.created_at));
  let formatted = `@${post.username} (${timeAgo}) [ID: ${post.id.slice(0, 8)}]\n"${post.content}"`;
  
  if (post.code) {
    formatted += `\n\`\`\`${post.language || ''}\n${post.code}\n\`\`\``;
  }
  
  if (post.tags && post.tags.length > 0) {
    formatted += `\nTags: ${post.tags.map((tag: string) => `#${tag}`).join(' ')}`;
  }
  
  formatted += `\n❤️ ${post.like_count} likes | 💬 ${post.reply_count} replies`;
  
  return formatted;
}

// Helper function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${Math.max(1, diffMins)}m ago`;
  }
}

// Helper function to ensure user is logged in
function requireAuth(): string {
  if (!currentUser) {
    throw new Error('Please create a profile first using create_profile(username, bio)');
  }
  return currentUser;
}

// Define tools
const tools: Tool[] = [
  {
    name: 'create_profile',
    description: 'Create a new user profile',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username (3-20 characters, must be unique)',
        },
        bio: {
          type: 'string',
          description: 'Optional bio (max 500 characters)',
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'get_profile',
    description: 'Get a user profile by username',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to look up',
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'update_profile',
    description: 'Update your profile bio',
    inputSchema: {
      type: 'object',
      properties: {
        bio: {
          type: 'string',
          description: 'New bio (max 500 characters)',
        },
      },
      required: ['bio'],
    },
  },
  {
    name: 'search_users',
    description: 'Search for users by username',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'post_update',
    description: 'Post a text update',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'Post content (max 280 characters)',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional tags (without # symbol)',
        },
      },
      required: ['content'],
    },
  },
  {
    name: 'post_code',
    description: 'Post a code snippet with description',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Code snippet',
        },
        language: {
          type: 'string',
          description: 'Programming language',
        },
        description: {
          type: 'string',
          description: 'Description of the code (max 280 characters)',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional tags (without # symbol)',
        },
      },
      required: ['code', 'language', 'description'],
    },
  },
  {
    name: 'get_feed',
    description: 'Get your personalized feed (posts from users you follow)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of posts (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'get_global_feed',
    description: 'Get the global feed (all public posts)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of posts (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'get_user_posts',
    description: 'Get posts from a specific user',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to get posts from',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of posts (default: 20)',
          default: 20,
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'follow_user',
    description: 'Follow a user',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to follow',
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'unfollow_user',
    description: 'Unfollow a user',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to unfollow',
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'get_following',
    description: 'Get list of users you are following',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_followers',
    description: 'Get list of your followers',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'like_post',
    description: 'Like a post by post ID',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'ID of the post to like',
        },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'unlike_post',
    description: 'Unlike a post by post ID',
    inputSchema: {
      type: 'object',
      properties: {
        post_id: {
          type: 'string',
          description: 'ID of the post to unlike',
        },
      },
      required: ['post_id'],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_profile': {
        const { username, bio } = args as { username: string; bio?: string };
        
        if (username.length < 3 || username.length > 20) {
          throw new Error('Username must be between 3 and 20 characters');
        }
        
        const user = await db.createUser(username, bio);
        currentUser = username;
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Profile created successfully!\n\nUsername: @${user.username}\nBio: ${user.bio || 'No bio yet'}\nJoined: ${new Date(user.created_at).toLocaleDateString()}\n\nYou can now start posting and following other users!`,
            },
          ],
        };
      }

      case 'get_profile': {
        const { username } = args as { username: string };
        const user = await db.getUser(username);
        
        if (!user) {
          throw new Error(`User @${username} not found`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `👤 Profile: @${user.username}\n\nBio: ${user.bio || 'No bio'}\nPosts: ${user.post_count}\nFollowers: ${user.follower_count}\nFollowing: ${user.following_count}\nJoined: ${new Date(user.created_at).toLocaleDateString()}`,
            },
          ],
        };
      }

      case 'update_profile': {
        const { bio } = args as { bio: string };
        const username = requireAuth();
        
        if (bio.length > 500) {
          throw new Error('Bio must be 500 characters or less');
        }
        
        const user = await db.updateUser(username, bio);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Profile updated!\n\nNew bio: ${user.bio}`,
            },
          ],
        };
      }

      case 'search_users': {
        const { query, limit = 10 } = args as { query: string; limit?: number };
        const users = await db.searchUsers(query, limit);
        
        if (users.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No users found matching "${query}"`,
              },
            ],
          };
        }
        
        const userList = users
          .map(user => `@${user.username} - ${user.bio || 'No bio'} (${user.follower_count} followers)`)
          .join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `🔍 Found ${users.length} user(s) matching "${query}":\n\n${userList}`,
            },
          ],
        };
      }

      case 'post_update': {
        const { content, tags } = args as { content: string; tags?: string[] };
        const username = requireAuth();
        
        if (content.length > 280) {
          throw new Error('Post content must be 280 characters or less');
        }
        
        const userId = await db.getUserId(username);
        if (!userId) throw new Error('User not found');
        
        const post = await db.createPost(userId, content, undefined, undefined, tags);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Posted successfully!\n\n${formatPost(post)}`,
            },
          ],
        };
      }

      case 'post_code': {
        const { code, language, description, tags } = args as { 
          code: string; 
          language: string; 
          description: string; 
          tags?: string[] 
        };
        const username = requireAuth();
        
        if (description.length > 280) {
          throw new Error('Description must be 280 characters or less');
        }
        
        const userId = await db.getUserId(username);
        if (!userId) throw new Error('User not found');
        
        const post = await db.createPost(userId, description, code, language, tags);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Code snippet posted successfully!\n\n${formatPost(post)}`,
            },
          ],
        };
      }

      case 'get_feed': {
        const { limit = 20 } = args as { limit?: number };
        const username = requireAuth();
        
        const userId = await db.getUserId(username);
        if (!userId) throw new Error('User not found');
        
        const posts = await db.getUserFeed(userId, limit);
        
        if (posts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `📱 Your feed is empty!\n\nTry following some users to see their posts here. Use search_users() to find people to follow.`,
              },
            ],
          };
        }
        
        const feedText = posts.map(formatPost).join('\n\n' + '─'.repeat(50) + '\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `📱 Your Feed (${posts.length} posts)\n\n${feedText}`,
            },
          ],
        };
      }

      case 'get_global_feed': {
        const { limit = 20 } = args as { limit?: number };
        const posts = await db.getGlobalFeed(limit);
        
        if (posts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `🌍 Global feed is empty!\n\nBe the first to post something!`,
              },
            ],
          };
        }
        
        const feedText = posts.map(formatPost).join('\n\n' + '─'.repeat(50) + '\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `🌍 Global Feed (${posts.length} posts)\n\n${feedText}`,
            },
          ],
        };
      }

      case 'get_user_posts': {
        const { username, limit = 20 } = args as { username: string; limit?: number };
        
        const userId = await db.getUserId(username);
        if (!userId) {
          throw new Error(`User @${username} not found`);
        }
        
        const posts = await db.getUserPosts(userId, limit);
        
        if (posts.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `@${username} hasn't posted anything yet.`,
              },
            ],
          };
        }
        
        const feedText = posts.map(formatPost).join('\n\n' + '─'.repeat(50) + '\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `📝 Posts by @${username} (${posts.length} posts)\n\n${feedText}`,
            },
          ],
        };
      }

      case 'follow_user': {
        const { username } = args as { username: string };
        const currentUsername = requireAuth();
        
        const userId = await db.getUserId(username);
        const currentUserId = await db.getUserId(currentUsername);
        
        if (!userId) {
          throw new Error(`User @${username} not found`);
        }
        if (!currentUserId) {
          throw new Error('Current user not found');
        }
        
        await db.followUser(currentUserId, userId);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ You are now following @${username}!`,
            },
          ],
        };
      }

      case 'unfollow_user': {
        const { username } = args as { username: string };
        const currentUsername = requireAuth();
        
        const userId = await db.getUserId(username);
        const currentUserId = await db.getUserId(currentUsername);
        
        if (!userId) {
          throw new Error(`User @${username} not found`);
        }
        if (!currentUserId) {
          throw new Error('Current user not found');
        }
        
        await db.unfollowUser(currentUserId, userId);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ You have unfollowed @${username}`,
            },
          ],
        };
      }

      case 'get_following': {
        const username = requireAuth();
        const userId = await db.getUserId(username);
        if (!userId) throw new Error('User not found');
        
        const following = await db.getFollowing(userId);
        
        if (following.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `You're not following anyone yet. Use search_users() to find people to follow!`,
              },
            ],
          };
        }
        
        const followingList = following
          .map(user => `@${user.username} - ${user.bio || 'No bio'} (${user.follower_count} followers)`)
          .join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `👥 You are following ${following.length} user(s):\n\n${followingList}`,
            },
          ],
        };
      }

      case 'get_followers': {
        const username = requireAuth();
        const userId = await db.getUserId(username);
        if (!userId) throw new Error('User not found');
        
        const followers = await db.getFollowers(userId);
        
        if (followers.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `You don't have any followers yet. Keep posting great content!`,
            },
          ],
        };
      }
      
      const followersList = followers
        .map(user => `@${user.username} - ${user.bio || 'No bio'} (${user.post_count} posts)`)
        .join('\n');
      
        return {
          content: [
            {
              type: 'text',
              text: `👥 You have ${followers.length} follower(s):\n\n${followersList}`,
            },
          ],
        };
      }

      case 'like_post': {
        const { post_id } = args as { post_id: string };
        const username = requireAuth();
        
        const userId = await db.getUserId(username);
        if (!userId) throw new Error('User not found');
        
        const post = await db.getPost(post_id);
        if (!post) {
          throw new Error('Post not found');
        }
        
        await db.likePost(userId, post_id);
        
        return {
          content: [
            {
              type: 'text',
              text: `❤️ You liked @${post.username}'s post!`,
            },
          ],
        };
      }

      case 'unlike_post': {
        const { post_id } = args as { post_id: string };
        const username = requireAuth();
        
        const userId = await db.getUserId(username);
        if (!userId) throw new Error('User not found');
        
        const post = await db.getPost(post_id);
        if (!post) {
          throw new Error('Post not found');
        }
        
        await db.unlikePost(userId, post_id);
        
        return {
          content: [
            {
              type: 'text',
              text: `💔 You unliked @${post.username}'s post`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
} catch (error) {
  return {
    content: [
      {
        type: 'text',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      },
    ],
    isError: true,
  };
}
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Social Network server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
