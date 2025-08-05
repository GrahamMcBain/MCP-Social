# MCP Social Network - Deployment Guide

## 🚀 Deploy to Railway (Recommended)

### 1. One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/MCP-Social)

### 2. Manual Deploy

1. **Create Railway Account**: Go to [railway.app](https://railway.app)

2. **Connect GitHub**: Link your GitHub account

3. **Deploy Project**:
   ```bash
   railway login
   railway link
   railway up
   ```

4. **Set Environment Variables**:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon key
   - `PORT` - Auto-set by Railway

5. **Get Your URL**: Railway will provide a URL like `https://your-app.railway.app`

## 🌐 Alternative Platforms

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Heroku
```bash
git add .
git commit -m "Deploy to Heroku"
heroku create mcp-social-network
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key
git push heroku main
```

### Render
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables

## 🔧 Configuration for Hosted Server

Once deployed, update your demo materials with the actual URL:

### For Demo Attendees
```json
{
  "mcpServers": {
    "mcp-social": {
      "command": "curl",
      "args": ["-s", "https://YOUR-ACTUAL-URL.railway.app/tools"]
    }
  }
}
```

### Testing Your Deployment
```bash
# Test health endpoint
curl https://YOUR-URL.railway.app/

# Test tools endpoint
curl https://YOUR-URL.railway.app/tools

# Test a tool (create profile)
curl -X POST https://YOUR-URL.railway.app/tools/create_profile \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: demo-session" \
  -d '{"arguments": {"username": "demo_user", "bio": "Testing the API"}}'
```

## 📱 Demo URLs to Share

Once deployed, share these with demo attendees:

- **Main Demo**: `https://YOUR-URL.railway.app`
- **Configuration**: Show them the simple JSON config
- **Live API**: Demonstrate real-time social interactions

## 🎯 Benefits of Hosted Version

- ✅ **Zero Setup**: Demo attendees just add one JSON config
- ✅ **Reliable**: Professional hosting with uptime monitoring
- ✅ **Scalable**: Handles multiple concurrent demo users
- ✅ **Shareable**: Single URL works for everyone
- ✅ **Impressive**: Shows production-ready MCP capabilities

## 🔒 Security Notes

- Environment variables are secure on hosting platforms
- Sessions are isolated per user
- No authentication required for demo purposes
- Rate limiting can be added if needed

---

**Ready to go viral! 🚀**
