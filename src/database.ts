import { createClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  username: string;
  bio: string | null;
  created_at: string;
  follower_count: number;
  following_count: number;
  post_count: number;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  code: string | null;
  language: string | null;
  tags: string[] | null;
  like_count: number;
  reply_count: number;
  created_at: string;
  username?: string; // joined from users table
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Like {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string; // joined from users table
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'follow' | 'mention' | 'reply' | 'like';
  from_user_id: string;
  post_id: string | null;
  content: string | null;
  read: boolean;
  created_at: string;
  from_username?: string; // joined from users table
}

export class Database {
  private supabase;

  constructor(url?: string, key?: string) {
    if (!url || !key) {
      throw new Error('Supabase URL and key are required. Set SUPABASE_URL and SUPABASE_KEY environment variables.');
    }
    this.supabase = createClient(url, key);
  }

  // User operations
  async createUser(username: string, bio?: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({ username, bio })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        throw new Error(`Username "${username}" is already taken`);
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async getUser(username: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // no rows returned
        return null;
      }
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data;
  }

  async updateUser(username: string, bio: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update({ bio })
      .eq('username', username)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }

    return data || [];
  }

  // Post operations
  async createPost(userId: string, content: string, code?: string, language?: string, tags?: string[]): Promise<Post> {
    const { data, error } = await this.supabase
      .from('posts')
      .insert({ 
        user_id: userId, 
        content, 
        code, 
        language, 
        tags 
      })
      .select(`
        *,
        users!posts_user_id_fkey(username)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return {
      ...data,
      username: data.users.username
    };
  }

  async getPost(postId: string): Promise<Post | null> {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey(username)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get post: ${error.message}`);
    }

    return {
      ...data,
      username: data.users.username
    };
  }

  async getUserPosts(userId: string, limit: number = 20): Promise<Post[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey(username)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get user posts: ${error.message}`);
    }

    return (data || []).map(post => ({
      ...post,
      username: post.users.username
    }));
  }

  async getGlobalFeed(limit: number = 20): Promise<Post[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey(username)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get global feed: ${error.message}`);
    }

    return (data || []).map(post => ({
      ...post,
      username: post.users.username
    }));
  }

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const { error } = await this.supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        throw new Error('Already following this user');
      }
      throw new Error(`Failed to follow user: ${error.message}`);
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await this.supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      throw new Error(`Failed to unfollow user: ${error.message}`);
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to check follow status: ${error.message}`);
    }

    return !!data;
  }

  async getFollowing(userId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('follows')
      .select(`
        users!follows_following_id_fkey(*)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get following: ${error.message}`);
    }

    return (data || []).map((item: any) => item.users);
  }

  async getFollowers(userId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('follows')
      .select(`
        users!follows_follower_id_fkey(*)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get followers: ${error.message}`);
    }

    return (data || []).map((item: any) => item.users);
  }

  async getUserFeed(userId: string, limit: number = 20): Promise<Post[]> {
    const { data, error } = await this.supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey(username)
      `)
      .in('user_id', [
        // Subquery to get followed users
        this.supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)
      ])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get user feed: ${error.message}`);
    }

    return (data || []).map(post => ({
      ...post,
      username: post.users.username
    }));
  }

  // Like operations
  async likePost(userId: string, postId: string): Promise<void> {
    const { error } = await this.supabase
      .from('likes')
      .insert({ user_id: userId, post_id: postId });

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        throw new Error('You have already liked this post');
      }
      throw new Error(`Failed to like post: ${error.message}`);
    }
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const { error } = await this.supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      throw new Error(`Failed to unlike post: ${error.message}`);
    }
  }

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to check like status: ${error.message}`);
    }

    return !!data;
  }

  // Utility method to get user ID by username
  async getUserId(username: string): Promise<string | null> {
    const user = await this.getUser(username);
    return user?.id || null;
  }
}
