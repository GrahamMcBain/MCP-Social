#!/usr/bin/env node

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Database } from './database.js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PORT = process.env.PORT || 3000;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables are required');
  process.exit(1);
}

// Initialize database
const db = new Database(SUPABASE_URL, SUPABASE_KEY);



// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use('/setup', express.static('public'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'MCP Social Network',
    version: '1.0.0',
    status: 'running',
    endpoints: {
    tools: '/tools',
    setup: '/setup',
    health: '/'
    }
  });
});



// Authentication endpoints
app.post('/auth/signup', async (req, res) => {
  try {
    const { username, password, bio } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await db.createUser(username, bio, passwordHash);
    
    res.status(201).json({
      message: 'Account created successfully',
      username: user.username
    });
    
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to create account' 
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Get user credentials
    const user = await db.getUserByCredentials(username);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    res.json({
      message: 'Login successful',
      username: user.username
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Login failed' 
    });
  }
});

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

// Helper function to parse basic auth
function parseBasicAuth(authHeader: string): { username: string; password: string } | null {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }
  
  try {
    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    if (!username || !password) {
      return null;
    }
    
    return { username, password };
  } catch {
    return null;
  }
}

// Helper function to authenticate user
async function authenticateUser(authHeader: string): Promise<string> {
  const credentials = parseBasicAuth(authHeader);
  
  if (!credentials) {
    throw new Error('Missing or invalid Authorization header. Use Basic authentication with username:password. Create an account first with create_account tool.');
  }
  
  const { username, password } = credentials;
  
  // Get user credentials
  const user = await db.getUserByCredentials(username);
  if (!user || !user.password_hash) {
    throw new Error('Invalid username or password');
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid username or password');
  }
  
  return username;
}

// Define tools
const tools: Tool[] = [
  {
    name: 'create_account',
    description: 'Create a new user account with username and password',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username (3-20 characters, must be unique)',
        },
        password: {
          type: 'string',
          description: 'Password (minimum 6 characters)',
        },
        bio: {
          type: 'string',
          description: 'Optional bio (max 500 characters)',
        },
      },
      required: ['username', 'password'],
    },
  },
  {
    name: 'login',
    description: 'Login to your existing account',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Your username',
        },
        password: {
          type: 'string',
          description: 'Your password',
        },
      },
      required: ['username', 'password'],
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
    description: 'Update your profile bio (requires Basic authentication)',
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
    description: 'Post a text update (requires Basic authentication)',
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
    description: 'Post a code snippet with description (requires Basic authentication)',
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
    description: 'Get your personalized feed (posts from users you follow, requires Basic authentication)',
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
    description: 'Follow a user (requires Basic authentication)',
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
    description: 'Unfollow a user (requires Basic authentication)',
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
    description: 'Get list of users you are following (requires Basic authentication)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_followers',
    description: 'Get list of your followers (requires Basic authentication)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'like_post',
    description: 'Like a post by post ID (requires Basic authentication)',
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
    description: 'Unlike a post by post ID (requires Basic authentication)',
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

// Create tool handler function
async function handleToolCall(name: string, args: any, authHeader: string) {
  try {
    switch (name) {
      case 'create_account': {
        const { username, password, bio } = args as { username: string; password: string; bio?: string };
        
        if (username.length < 3 || username.length > 20) {
          throw new Error('Username must be between 3 and 20 characters');
        }
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create user
        const user = await db.createUser(username, bio, passwordHash);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Account created successfully!\n\nUsername: @${user.username}\nBio: ${user.bio || 'No bio yet'}\nJoined: ${new Date(user.created_at).toLocaleDateString()}\n\n🔐 Your account is now secured with a password!\n\nYou can now start posting and following other users!`,
            },
          ],
        };
      }

      case 'login': {
        const { username, password } = args as { username: string; password: string };
        
        // Get user credentials
        const user = await db.getUserByCredentials(username);
        if (!user || !user.password_hash) {
          throw new Error('Invalid username or password');
        }
        
        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          throw new Error('Invalid username or password');
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Login successful!\n\nWelcome back, @${user.username}!\n\nYou can now access all your social features!`,
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
        const username = await authenticateUser(authHeader);
        
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
        const username = await authenticateUser(authHeader);
        
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
        const username = await authenticateUser(authHeader);
        
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
        const username = await authenticateUser(authHeader);
        
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
        const currentUsername = await authenticateUser(authHeader);
        
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
        const currentUsername = await authenticateUser(authHeader);
        
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
        const username = await authenticateUser(authHeader);
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
        const username = await authenticateUser(authHeader);
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
        const username = await authenticateUser(authHeader);
        
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
        const username = await authenticateUser(authHeader);
        
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
}

// MCP Server-Sent Events endpoint for Amp
import crypto from 'crypto';

interface Session {
  id: string;
  stream: express.Response | null;
}

const sessions = new Map<string, Session>();

// POST /mcp - JSON-RPC requests (always returns JSON)
app.post('/mcp', async (req, res) => {
  const msg = req.body;
  const sessionId = req.headers['mcp-session-id'] as string;

  try {
    // Handle initialize request - always return JSON
    if (msg.method === 'initialize') {
      const newSessionId = crypto.randomUUID();
      
      // Store session for later SSE connection
      sessions.set(newSessionId, { id: newSessionId, stream: null });
      
      return res.json({
        jsonrpc: '2.0',
        id: msg.id,
        result: {
          protocolVersion: '1.0.0',
          capabilities: { tools: {} },
          serverInfo: { name: 'mcp-social-network', version: '1.0.0' }
        }
      }).header('Mcp-Session-Id', newSessionId);
    }

    // Handle other requests
    const incoming = Array.isArray(msg) ? msg : [msg];
    const outgoing: any[] = [];

    for (const rpc of incoming) {
      if (!('method' in rpc)) continue;

      try {
        switch (rpc.method) {
          case 'tools/list': {
            outgoing.push({ jsonrpc: '2.0', id: rpc.id, result: { tools } });
            break;
          }

          case 'tools/call': {
            const { name, arguments: args } = rpc.params;
            const result = await handleToolCall(name, args, req.headers.authorization ?? '');
            outgoing.push({ jsonrpc: '2.0', id: rpc.id, result });
            break;
          }
          
          case 'ping': {
            outgoing.push({ jsonrpc: '2.0', id: rpc.id, result: 'pong' });
            break;
          }

          default:
            outgoing.push({
              jsonrpc: '2.0',
              id: rpc.id,
              error: { code: -32601, message: `Unknown method ${rpc.method}` }
            });
        }
      } catch (e: any) {
        outgoing.push({
          jsonrpc: '2.0',
          id: rpc.id,
          error: { code: -32000, message: e.message || 'Internal error' }
        });
      }
    }

    if (outgoing.length === 0) return res.status(204).end();
    res.json(outgoing.length === 1 ? outgoing[0] : outgoing);

  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// GET /mcp - SSE stream (requires existing session ID)
app.get('/mcp', (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid or missing Mcp-Session-Id header' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Mcp-Session-Id'
  });

  // Update session with the stream
  const session = sessions.get(sessionId)!;
  session.stream = res;
  sessions.set(sessionId, session);

  req.on('close', () => {
    sessions.delete(sessionId);
  });
});

// MCP-compatible HTTP endpoints  
app.get('/tools', (req, res) => {
  res.json({ tools });
});

app.post('/tools/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const { arguments: args } = req.body;
    const authHeader = req.headers.authorization || '';
    
    const result = await handleToolCall(toolName, args, authHeader);
    res.json(result);
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('authentication') ? 401 : 500;
    res.status(statusCode).json({
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        },
      ],
      isError: true,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Social Network server running on port ${PORT}`);
  console.log(`📡 Tools endpoint: http://localhost:${PORT}/tools`);
  console.log(`🔧 Tool execution: POST http://localhost:${PORT}/tools/{toolName}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/`);
});
