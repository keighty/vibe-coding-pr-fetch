# 🍯 Honeycomb Frontend Observability Setup Guide

This guide will walk you through setting up Honeycomb Frontend Observability for your GitHub Performance Review Tool.

## 📋 Prerequisites

- A Honeycomb account (free tier available)
- Your application already running locally

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Honeycomb Account
1. Go to [honeycomb.io](https://www.honeycomb.io/)
2. Sign up for a free account
3. Complete the onboarding process

### Step 2: Get Your API Key
1. Navigate to [Account Settings](https://ui.honeycomb.io/account)
2. Click "Create API Key"
3. Give it a name like "GitHub Performance Review"
4. Copy the generated API key

### Step 3: Configure Environment Variables
1. Copy your `.env.local.example` to `.env.local` if you haven't already:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Honeycomb configuration to `.env.local`:
   ```bash
   # Honeycomb Configuration
   NEXT_PUBLIC_HONEYCOMB_API_KEY=your_api_key_here
   NEXT_PUBLIC_HONEYCOMB_SERVICE_NAME=github-contributions-frontend
   NEXT_PUBLIC_ENVIRONMENT=development
   ```

### Step 4: Restart Your Application
```bash
npm run dev
```

### Step 5: Test the Integration
1. Open your application at http://localhost:3000
2. Submit a GitHub username and date range
3. Check your browser's developer console for the message: "Honeycomb Frontend Observability initialized"

### Step 6: View Your Data
1. Go back to [Honeycomb UI](https://ui.honeycomb.io/)
2. Select your dataset (should be named "github-contributions-frontend")
3. You should see traces appearing within a few minutes

## 🔍 What You'll See in Honeycomb

### Automatic Instrumentation
- **Page loads** - How long your app takes to load
- **User interactions** - Button clicks, form submissions
- **Network requests** - API calls to your GitHub endpoint
- **Web Vitals** - Core performance metrics

### Custom Spans
- **github-contributions-fetch** - Custom span for GitHub API calls with attributes:
  - Username being queried
  - Date range
  - Success/failure status
  - Response metadata
  - Error details (if any)

## 🎯 Useful Queries to Try

Once you have data flowing, try these queries in Honeycomb:

### 1. API Response Times
```
WHERE span.name = "github-contributions-fetch"
GROUP BY github.username
CALCULATE AVG(duration_ms)
```

### 2. Error Rate
```
WHERE span.name = "github-contributions-fetch"
GROUP BY error.status
CALCULATE COUNT
```

### 3. User Activity
```
WHERE span.name CONTAINS "user-interaction"
GROUP BY target_element
CALCULATE COUNT
```

## 🚨 Troubleshooting

### No Data Appearing?
1. Check browser console for initialization message
2. Verify API key is correct and not expired
3. Ensure environment variables are prefixed with `NEXT_PUBLIC_`
4. Restart your development server after adding env vars

### TypeScript Errors?
- The setup includes proper TypeScript definitions
- If you see import errors, try restarting your TypeScript server in VS Code

### Want to Disable Tracking?
Simply remove or comment out the `NEXT_PUBLIC_HONEYCOMB_API_KEY` environment variable.

## 🎉 Next Steps

1. **Set up Alerts**: Create alerts for high error rates or slow response times
2. **Create Dashboards**: Build custom dashboards for your team
3. **Production Setup**: Use different API keys for staging/production environments
4. **Team Access**: Invite team members to your Honeycomb account

## 📚 Additional Resources

- [Honeycomb Documentation](https://docs.honeycomb.io/)
- [OpenTelemetry Web SDK](https://github.com/honeycombio/honeycomb-opentelemetry-web)
- [Frontend Observability Best Practices](https://docs.honeycomb.io/getting-data-in/frontend/)

---

**Questions?** Check the [Honeycomb Community](https://pollinators.honeycomb.io/) or [documentation](https://docs.honeycomb.io/).
