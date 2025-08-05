# MCP Social Network

> **The world's first social network accessible only through AI coding agents.**

A fully-featured social network built for the Model Context Protocol (MCP), enabling developers to connect, share, and engage without leaving their coding environment.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/github.com/GrahamMcBain/MCP-Social)

## 🚀 **One-Click Demo Setup**

For demo attendees, just add this to your MCP client config:

```json
{
  "mcpServers": {
    "mcp-social": {
      "command": "curl",
      "args": ["-s", "https://your-deployed-url.railway.app/tools"]
    }
  }
}
```

## ✨ **Features**

### 🔥 **Core Social Features**
- **Profiles**: Create, view, and update user profiles
- **Posts**: Share text updates and code snippets with syntax highlighting
- **Social Graph**: Follow/unfollow users, see followers and following
- **Feeds**: Personalized feed from followed users + global discovery feed
- **Engagement**: Like/unlike posts with real-time counters
- **Discovery**: Search users and explore content

### 🤖 **Agent-Native Design**
- **15+ MCP Functions**: Complete social API accessible through natural language
- **Rich Formatting**: Posts display beautifully in AI agent interfaces  
- **Session Management**: Persistent user context across interactions
- **Error Handling**: Graceful failures with helpful error messages

### 🏗️ **Production Ready**
- **Supabase Backend**: PostgreSQL with real-time triggers and counters
- **HTTP + MCP Support**: Works with any MCP client or direct API calls
- **Hosted Option**: Zero-setup deployment for instant demos
- **Scalable Architecture**: Handles concurrent users efficiently

## 📱 **Demo Experience**

```
You: "Create my profile for the MCP social network"
Agent: ✅ Profile created successfully!
        Username: @demo_user
        Bio: Building cool stuff with AI
        You can now start posting and following other users!

You: "Post about what I'm working on"  
Agent: ✅ Posted successfully!
        @demo_user (now) [ID: 1a2b3c4d]
        "Just built an MCP social network! Mind = blown 🤯"
        Tags: #mcp #ai #social
        ❤️ 0 likes | 💬 0 replies

You: "Show me what's happening globally"
Agent: 🌍 Global Feed (3 posts)
        
        @alice_codes (2h ago) [ID: 5e6f7g8h]
        "TIL: You can build social networks that exist entirely in your IDE!"
        ❤️ 12 likes | 💬 3 replies
        
        ──────────────────────────────────────────────────────
        
        @bob_dev (4h ago) [ID: 9i0j1k2l]
        "Shipping my first MCP tool. This protocol is incredible 🔥"
        ❤️ 8 likes | 💬 1 reply
```

## 🎯 **Why This Matters**

### **Novel Interaction Paradigm**
- First social network designed for AI-mediated interactions
- Zero context switching - stay in your development environment
- Natural language social commands through your coding agent

### **MCP Showcase**
- Demonstrates MCP's power for building rich, interactive applications
- Shows how agents can become gateways to entirely new experiences
- Proves viability of agent-native software architectures

### **Developer-Focused Community**
- Content naturally revolves around coding, projects, and technical insights
- Follow interesting developers and see what they're building
- Share discoveries, code snippets, and development experiences

## 🛠️ **Quick Setup**

### **Hosted (Recommended for Demos)**
1. Deploy to Railway (one-click button above)
2. Add Supabase environment variables
3. Share the URL with demo attendees

### **Local Development**
```bash
git clone https://github.com/GrahamMcBain/MCP-Social.git
cd MCP-Social
npm install
npm run build

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
npm start
```

## 📡 **API Reference**

### **MCP Functions**
- `create_profile(username, bio?)` - Create user profile
- `get_profile(username)` - View user profile  
- `post_update(content, tags?)` - Share text update
- `post_code(code, language, description, tags?)` - Share code snippet
- `follow_user(username)` - Follow a user
- `get_feed(limit?)` - Get personalized feed
- `get_global_feed(limit?)` - Get global feed
- `like_post(post_id)` - Like a post
- `search_users(query)` - Find users
- ...and more!

### **HTTP Endpoints** 
- `GET /` - Health check and server info
- `GET /tools` - List available MCP functions
- `POST /tools/:toolName` - Execute MCP function

## 🏆 **Perfect for Demos**

- ✅ **"Wow Factor"**: Novel interaction model that amazes audiences
- ✅ **Easy Setup**: Hosted version requires zero installation
- ✅ **Rich Functionality**: Full social network in 15 MCP functions
- ✅ **Production Quality**: Real database, error handling, scalable architecture
- ✅ **Viral Potential**: Clear path to developer adoption

## 🔧 **Tech Stack**

- **Backend**: Node.js + TypeScript + Express
- **Database**: Supabase (PostgreSQL) with real-time triggers
- **Protocol**: Model Context Protocol (MCP)
- **Hosting**: Railway, Vercel, or Heroku
- **Client**: Any MCP-compatible AI agent

## 📚 **Documentation**

- [Demo Setup Guide](./DEMO_SETUP.md) - How to run the perfect demo
- [Deployment Guide](./DEPLOYMENT.md) - Hosting and production setup
- [API Documentation](./API.md) - Complete function reference
- [Architecture Overview](./ARCHITECTURE.md) - Technical deep dive

## 🎉 **Ready to Blow Minds?**

This MCP Social Network showcases the future of human-computer interaction - where AI agents become gateways to rich, interactive experiences that were previously impossible.

**Deploy it, demo it, and watch people's minds get blown! 🚀**

---

Built with ❤️ for the Microsoft Demo • [Deploy Now](https://railway.app/template/github.com/GrahamMcBain/MCP-Social) • [Join the Discussion](https://github.com/GrahamMcBain/MCP-Social/discussions)
