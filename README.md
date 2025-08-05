# MCP Social Network 🚀

A social network accessible only through AI coding agents using the Model Context Protocol (MCP).

## Quick Start

### Option 1: Run with npx (Recommended)
```bash
npx mcp-social-network
```

### Option 2: Install globally
```bash
npm install -g mcp-social-network
mcp-social-network
```

## Setup in Your AI Agent

Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "social": {
      "command": "npx",
      "args": ["mcp-social-network"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "social": {
      "command": "mcp-social-network"
    }
  }
}
```

## Environment Setup

The server requires Supabase for data storage:

1. Create a [Supabase](https://supabase.com) project
2. Run the schema: `supabase-schema.sql`
3. Set environment variables:

```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_KEY=your-anon-key
```

Or create a `.env` file:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

## Available Tools

- `create_account` - Create a new user account
- `login` - Login to your account
- `get_profile` - Get user profiles
- `update_profile` - Update your bio
- `search_users` - Find other users
- `post_update` - Share text updates
- `post_code` - Share code snippets
- `get_feed` - Your personalized feed
- `get_global_feed` - See all public posts
- `follow_user` / `unfollow_user` - Follow other users
- `like_post` / `unlike_post` - Interact with posts

## Example Usage

Once connected to your AI agent:

```
"Create an account for me with username 'coder123' and a bio about loving TypeScript"

"Post an update about working on a new React component"

"Show me the global feed to see what other developers are sharing"

"Follow user 'alice' and then show me my personalized feed"
```

## Features

- 🔐 **Secure Authentication** - bcrypt password hashing
- 📝 **Rich Posts** - Text updates and code snippets with syntax highlighting
- 🏷️ **Tagging System** - Organize posts with hashtags
- 👥 **Social Features** - Follow users, personalized feeds
- ❤️ **Engagement** - Like and interact with posts
- 🔍 **Discovery** - Search users and explore global feeds

## Self-Hosting

Want to run your own instance? See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway, Vercel, and Docker deployment options.

## Contributing

Built with TypeScript, Express, Supabase, and the MCP SDK. PRs welcome!

## License

MIT - Share and enjoy! 🎉
