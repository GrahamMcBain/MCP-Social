# MCP Social Network

> **Connect with developers worldwide through your AI coding agent.**

A social network where **humans connect with humans** using AI agents as the interface. Built for the Model Context Protocol (MCP), enabling real developers to socialize, share code, and collaborate without leaving their coding environment.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/github.com/GrahamMcBain/MCP-Social)

## 🚀 **30-Second Setup**

Add this to your MCP client and start connecting with developers worldwide:

```json
{
  "mcpServers": {
    "mcp-social": {
      "command": "curl",
      "args": ["-s", "https://mcp-social.up.railway.app/tools"]
    }
  }
}
```

**That's it!** No API keys, no complex setup. Just restart your AI agent and start socializing.

## ✨ **Features**

### 🔥 **Core Social Features**
- **Profiles**: Create, view, and update user profiles
- **Posts**: Share text updates and code snippets with syntax highlighting
- **Social Graph**: Follow/unfollow users, see followers and following
- **Feeds**: Personalized feed from followed users + global discovery feed
- **Engagement**: Like/unlike posts with real-time counters
- **Discovery**: Search users and explore content

### 🤖 **AI-Native Interface**
- **15+ MCP Functions**: Complete social API accessible through natural language
- **Human-to-Human**: Real people connecting via their AI agents
- **Rich Formatting**: Posts display beautifully in AI agent interfaces  
- **Session Management**: Persistent user context across interactions

### 🏗️ **Production Ready**
- **Supabase Backend**: PostgreSQL with real-time triggers and counters
- **HTTP + MCP Support**: Works with any MCP client or direct API calls
- **Hosted Option**: Zero-setup deployment for instant demos
- **Scalable Architecture**: Handles concurrent users efficiently

## 📱 **Demo Experience**

```
You: "Create my profile for the social network"
Agent: ✅ Profile created successfully!
        Username: @demo_user
        Bio: Building cool stuff with AI
        You can now start posting and following other users!

You: "Post about my React project"  
Agent: ✅ Posted successfully!
        @demo_user (now) [ID: 1a2b3c4d]
        "Just shipped a React app with real-time collaboration! 🚀"
        Tags: #react #javascript #webapp
        ❤️ 0 likes | 💬 0 replies

You: "Show me what other developers are working on"
Agent: 🌍 Global Feed (3 posts)
        
        @alice_codes (2h ago) [ID: 5e6f7g8h]
        "Built an MCP tool that auto-generates API docs from code!"
        ❤️ 12 likes | 💬 3 replies
        
        ──────────────────────────────────────────────────────
        
        @bob_python (4h ago) [ID: 9i0j1k2l]
        "Finally mastered async/await patterns. Game changer! 🔥"
        ❤️ 8 likes | 💬 1 reply
```

## 🎯 **Why This Matters**

### **Novel Human Connection Model**
- First social network where humans connect through AI agents
- Zero context switching - socialize while you code
- Natural language commands make social interaction effortless

### **Perfect MCP Showcase**
- Demonstrates MCP's power for building rich, multi-user applications
- Shows how AI agents can mediate real human connections
- Proves the potential for agent-native social experiences

### **Developer-Focused Community**
- Connect with real developers worldwide who share your interests
- Share code snippets, project updates, and technical discoveries
- Build professional relationships through your coding environment

## 🛠️ **Quick Setup**

### **For Demo Attendees (Zero Setup)**
Just add the MCP server URL to your agent config - no installation needed!

### **For Hosting Your Own Instance**
1. Deploy to Railway (one-click button above)
2. Add your Supabase environment variables
3. Share your URL with users

### **For Local Development**
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
