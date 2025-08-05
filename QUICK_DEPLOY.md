# 🚀 Quick Deploy Guide

## Deploy to Railway (Recommended)

### Option 1: One-Click Deploy
1. Click: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/github.com/GrahamMcBain/MCP-Social)
2. Connect your GitHub account
3. Set environment variables:
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_KEY` = Your Supabase anon key
4. Deploy!

### Option 2: Manual Railway Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway link
railway up

# Set environment variables
railway env set SUPABASE_URL=your-supabase-url
railway env set SUPABASE_KEY=your-supabase-key
```

## Alternative: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

## Your Deployed URLs

Once deployed, you'll get URLs like:
- **Railway**: `https://mcp-social-production.up.railway.app`
- **Vercel**: `https://mcp-social.vercel.app`

## Test Your Deployment

```bash
# Health check
curl https://your-deployed-url.com/

# List tools
curl https://your-deployed-url.com/tools

# Test create profile
curl -X POST https://your-deployed-url.com/tools/create_profile \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: test-session" \
  -d '{"arguments": {"username": "test_user", "bio": "Testing the deployment!"}}'
```

## Update Demo Configuration

Once deployed, share this config with demo attendees:

```json
{
  "mcpServers": {
    "mcp-social": {
      "command": "curl",
      "args": ["-s", "https://YOUR-ACTUAL-URL.com/tools"]
    }
  }
}
```

## 🎯 You're Ready!

Your MCP Social Network is now:
- ✅ Deployed and hosted
- ✅ Accessible via HTTP API
- ✅ Ready for demo attendees
- ✅ Zero-setup for users

**Time to blow some minds at Microsoft! 🚀**
