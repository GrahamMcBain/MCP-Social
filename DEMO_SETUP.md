# MCP Social Network - Demo Setup Guide

## 🌟 **Connect with Developers Worldwide Through Your AI Agent**

This is a social network where **real humans connect with each other** using their AI coding agents as the interface. Add one line of config, and you can socialize with developers worldwide without leaving your coding environment!

## 🚀 **30-Second Setup**

### 1. Add to Your MCP Client

**For Claude Desktop, Amp, or any MCP-compatible agent:**

```json
{
  "mcpServers": {
    "mcp-social": {
      "command": "curl",
      "args": ["-s", "-X", "GET", "https://mcp-social.up.railway.app/tools"]
    }
  }
}
```

### 2. Restart Your AI Agent

### 3. Start Socializing!

**That's it!** No API keys, no downloads, no complex setup.

⚠️ **Demo Note**: Uses simplified authentication. Perfect for demos and trying out MCP!

## 🎯 **Try These Demo Commands**

### **Getting Started**
```
👤 "Create my profile for the social network" 
🔍 "Search for other developers to follow"
➕ "Follow alice_codes"
```

### **Share Your Work**
```
📝 "Post an update about my latest project"
💻 "Share a code snippet I just wrote" 
🏷️ "Post about React with tags ai, frontend, react"
```

### **Connect & Discover**  
```
📱 "Show me my personalized feed"
🌍 "What's happening on the global feed?"
❤️ "Like that post about TypeScript"
👥 "Show me my followers and who I'm following"
```

### **What Makes This Amazing**
- **Zero Context Switching**: Social networking happens in your coding environment
- **Natural Language**: Just talk to your AI agent normally
- **Real Connections**: Connect with actual developers worldwide
- **Code-Focused**: Share snippets, projects, and technical insights

## 🎯 Demo Features

### ✅ **Working Features**
- **User Profiles**: Create, view, update, search users
- **Social Graph**: Follow/unfollow, see followers/following
- **Content Creation**: Text posts and code snippets with tags
- **Feed System**: Personalized feed + global feed
- **Engagement**: Like/unlike posts
- **Discovery**: User search and profile viewing

### 📱 **Sample Demo Script**

1. **"Let me create a profile for this social network"**
   - Agent calls `create_profile("demo_user", "Building cool stuff with AI")`

2. **"Now let me post about what I'm working on"**
   - Agent calls `post_update("Just built an MCP social network! Mind = blown 🤯", ["mcp", "ai", "social"])`

3. **"Let me search for other developers"**
   - Agent calls `search_users("dev")`

4. **"I'll follow someone interesting"**
   - Agent calls `follow_user("alice_codes")`

5. **"Show me what my network is up to"**
   - Agent calls `get_feed()` - shows personalized content

6. **"That's a cool post, let me like it"**
   - Agent calls `like_post("post-id-here")`

7. **"What's happening globally?"**
   - Agent calls `get_global_feed()` - shows all posts

## 🎭 **Demo Talking Points**

### **The Novel Interaction Model**
- "This is the first social network that exists entirely within your coding environment"
- "No context switching - social interactions happen while you code"
- "AI agent mediates all interactions - natural language to social actions"

### **MCP Showcase**
- "Demonstrates MCP's power for building agent-native applications"
- "Rich, structured interactions through simple tool calls"
- "Extensible - could add GitHub integration, project sharing, etc."

### **Developer-Focused Use Cases**
- "Share coding insights and discoveries with your network"
- "Follow interesting developers and see what they're building"
- "Get inspiration and learn from your coding community"
- "No more switching between coding and social apps"

## 🔧 **Technical Details**

- **Backend**: Supabase (PostgreSQL) with real-time triggers
- **MCP Server**: Node.js + TypeScript
- **Features**: 15+ MCP functions covering all social features
- **Architecture**: Scalable, secure, production-ready

## 📊 **Success Metrics**

Demo is successful if:
- ✅ All core functions work smoothly
- ✅ Audience understands the novel interaction model  
- ✅ Clear viral potential and developer adoption path
- ✅ Showcases MCP's capabilities effectively

---

**Ready for Demo!** 🎉
