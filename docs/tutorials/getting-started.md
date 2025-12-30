# Getting Started with FlashFusion

Welcome to FlashFusion! This tutorial will guide you from installation to creating your first AI-powered project.

**Time to Complete:** 20-30 minutes  
**Difficulty:** Beginner  
**Prerequisites:** Node.js 18+, npm, basic JavaScript knowledge

---

## What You'll Learn

By the end of this tutorial, you'll:
- Install and set up FlashFusion
- Understand the platform architecture
- Create your first AI-generated code
- Build and deploy a simple pipeline
- Explore the AI Studio features

---

## Step 1: Installation

### Clone the Repository

```bash
git clone https://github.com/Krosebrook/fusion-ai.git
cd fusion-ai
```

### Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 18.2 and React DOM
- Vite 6.1 (build tool)
- Base44 SDK (backend)
- Radix UI components
- Tailwind CSS

**Note:** Installation may take 2-5 minutes depending on your internet connection.

---

## Step 2: Configure Environment

### Create Environment File

```bash
cp .env.example .env
```

### Add Required Variables

Open `.env` and add at minimum:

```bash
# Base44 Configuration
VITE_BASE44_URL=https://your-project.base44.com

# Optional: AI Model Keys (for advanced features)
OPENAI_API_KEY=sk-your_openai_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
```

**Where to get Base44 credentials:**
1. Visit [base44.com](https://base44.com)
2. Create an account or sign in
3. Create a new project
4. Copy your project URL to `VITE_BASE44_URL`

---

## Step 3: Start Development Server

```bash
npm run dev
```

You should see:

```
  VITE v6.1.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to: http://localhost:5173

You should see the FlashFusion home page with:
- Hero section with platform overview
- Feature highlights
- Navigation menu

---

## Step 4: Create Your Account

### Sign Up

1. Click **"Sign In"** in the top navigation
2. If you don't have an account, click **"Create Account"**
3. Fill in:
   - Email address
   - Password (minimum 8 characters)
   - Name
4. Click **"Sign Up"**

### Verify Setup

After signing in, you should be redirected to the **Dashboard**.

The dashboard shows:
- Quick stats overview
- Recent activity
- Quick action buttons
- Feature recommendations

---

## Step 5: Explore AI Studio

AI Studio is your hub for AI-powered generation.

### Navigate to AI Studio

1. Click **"AI Studio"** in the left sidebar
2. You'll see three tabs:
   - **Content** - Text generation
   - **Visual** - Image generation
   - **Code** - Code generation

### Your First Code Generation

Let's generate a simple React component:

1. Click the **"Code"** tab
2. In the task description field, enter:
   ```
   Create a React button component with hover effects
   ```
3. Select options:
   - Language: **JavaScript**
   - Framework: **React**
   - Style: **Tailwind CSS**
4. Click **"Generate Code"**

### Review the Output

The AI will generate:
- ✅ Component code
- ✅ PropTypes validation
- ✅ Usage example
- ✅ Styling with Tailwind

**Example Output:**
```jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function Button({ children, onClick, variant = 'primary' }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all';
  const variantClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-800 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary']),
};
```

### Copy and Use

1. Click **"Copy Code"**
2. Create a new file: `src/components/Button.jsx`
3. Paste the code
4. Import and use in your app!

---

## Step 6: Create Your First Pipeline

Pipelines automate your build, test, and deploy workflow.

### Navigate to Pipeline Generator

1. Click **"AI Pipeline Generator"** in the sidebar
2. You'll see the pipeline creation interface

### Describe Your Pipeline

In the description field, enter:

```
Create a CI/CD pipeline for a React app:
- Build with npm
- Run tests with Jest
- Deploy to Vercel on main branch
- Send Slack notification on failure
```

### Generate Pipeline

1. Click **"Generate Pipeline"**
2. Wait 5-10 seconds for AI to analyze and generate
3. Review the generated configuration

**Generated Output:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
      
      - name: Slack Notification
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Save and Deploy

1. Click **"Download Config"** to save as `.github/workflows/ci.yml`
2. Commit to your repository
3. Push to GitHub
4. Watch it run automatically!

---

## Step 7: Explore Other Features

Now that you've mastered the basics, explore:

### 🤖 AI Code Agent
Autonomous code development agent
- Navigate to **"AI Code Agent"**
- Give it a task like "Add authentication to my app"
- Watch it work autonomously

### 📊 Analytics
Monitor your usage and performance
- Click **"Analytics"** in sidebar
- View AI usage stats
- See pipeline success rates

### 🔌 Integrations
Connect external services
- Navigate to **"Integrations"**
- Browse 27+ available integrations
- Connect GitHub, Slack, AWS, etc.

### 🎨 Visual Pipeline Builder
Drag-and-drop pipeline creation
- Go to **"Visual Pipeline Builder"**
- Drag nodes onto canvas
- Connect them to create workflows
- Export as YAML configuration

---

## Common Tasks

### Generating Content

**Use Case:** Need a blog post or documentation

1. Go to **AI Studio** → **Content** tab
2. Enter topic: "Benefits of CI/CD automation"
3. Select format: **Blog Post**
4. Set tone: **Professional**
5. Click **Generate**
6. Edit and publish!

### Reviewing Code

**Use Case:** Get AI feedback on your code

1. Navigate to **"AI Code Review"**
2. Paste your code
3. Select language
4. Click **"Review"**
5. Get instant feedback on:
   - Code quality
   - Security issues
   - Performance tips
   - Best practices

### Cloning a Website

**Use Case:** Replicate a website design

1. Go to **"Website Cloner"**
2. Enter URL to clone
3. Select what to extract:
   - HTML structure
   - CSS styles
   - JavaScript functionality
4. Click **"Clone"**
5. Get AI-generated replica code

---

## Troubleshooting

### Server Won't Start

**Problem:** `npm run dev` fails

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API Errors

**Problem:** Getting 401 Unauthorized errors

**Solution:**
1. Check `.env` file has correct `VITE_BASE44_URL`
2. Verify Base44 credentials
3. Try logging out and back in

### Slow Performance

**Problem:** UI is sluggish

**Solution:**
1. Check browser console for errors
2. Clear browser cache
3. Disable browser extensions
4. Try in incognito mode

---

## Next Steps

🎉 Congratulations! You've completed the Getting Started tutorial.

### Continue Learning

**Tutorials:**
- [Building Your First Pipeline](./building-first-pipeline.md)
- [Creating a Custom Plugin](./creating-custom-plugin.md)
- [AI-Assisted Development Workflow](./ai-assisted-workflow.md)

**How-To Guides:**
- [How to Integrate with GitHub](../how-to-guides/integrate-github.md)
- [How to Deploy to AWS](../how-to-guides/deploy-to-aws.md)
- [How to Create Custom Agents](../how-to-guides/create-custom-agents.md)

**Reference:**
- [API Documentation](../reference/api/)
- [Configuration Reference](../reference/configuration.md)
- [CLI Commands](../reference/cli.md)

---

## Get Help

- 📖 **Documentation:** Check other docs in this repository
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Krosebrook/fusion-ai/discussions)
- 🐛 **Issues:** [Report a Bug](https://github.com/Krosebrook/fusion-ai/issues)
- 💼 **Support:** conduct@flashfusion.dev

---

**Happy Building! 🚀**
