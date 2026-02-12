# CodeLens AI - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Create `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/codelens_ai"
GROQ_API_KEY="your-groq-api-key"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
# Create database
createdb codelens_ai

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Start Dev Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 5. Login with Demo Account
- Email: `demo@example.com`
- Password: `demo123456`

## 🎯 Key Features to Try

### Try the Code Explainer
1. Go to `/editor`
2. Paste some code
3. Click "Explain"
4. See AI-powered line-by-line breakdown

### Save & Share Snippets
1. Explain some code
2. Click "Save Snippet"
3. Enter a title
4. View in dashboard
5. Click "Share" to make public

### View Public Snippets
1. Click "Share" on any snippet
2. Copy the generated link
3. Share with anyone
4. View at `/shared/[token]`

## 📚 Project Structure

```
app/                    # Pages & layouts
├── (auth)/            # Login/Signup
├── editor/            # Main editor
├── dashboard/         # Snippet library
└── api/explain        # AI API

components/           # React components
lib/                  # Services & utilities
prisma/              # Database schema
```

## 🔌 API Endpoints

### POST /api/explain
Get AI explanation for code

**Request:**
```json
{
  "code": "function hello() { return 'world'; }",
  "language": "javascript"
}
```

**Response:**
```json
{
  "summary": "...",
  "lineExplanations": [...],
  "complexity": "Simple",
  "improvements": [...]
}
```

## 🗄️ Database Models

- **Users**: Authentication & profile
- **Snippets**: Code & explanations
- **Tags**: Categories for snippets
- **Favorites**: Liked snippets
- **SnippetTags**: Snippet-tag relationships

## 🔐 Authentication

- JWT tokens stored in localStorage
- 30-day expiration
- Protected routes with middleware
- Password hashing with bcryptjs

## 🎨 Components

| Component | Purpose |
|-----------|---------|
| Editor | Monaco code editor |
| ExplanationPanel | AI explanation display |
| SnippetCard | Snippet list item |

## 📝 Common Tasks

### Create a Snippet Programmatically
```typescript
import { createSnippet } from "@/app/actions";

await createSnippet(
  userId,
  "My Code",
  "const x = 42;",
  "javascript",
  "This is a constant",
  null
);
```

### Get User Snippets
```typescript
import { getUserSnippets } from "@/app/actions";

const { snippets } = await getUserSnippets(userId);
```

### Make Snippet Public
```typescript
import { toggleSnippetVisibility } from "@/app/actions";

await toggleSnippetVisibility(snippetId, true);
```

## 🐛 Debug Mode

Enable logging:
```typescript
// In lib/db.ts, change:
log: ["warn", "error", "query"] // Add "query"
```

## 🚢 Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Then:
# 1. Go to vercel.com
# 2. Import your repository
# 3. Add environment variables
# 4. Deploy!
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

## 📊 Supported Languages

- JavaScript
- TypeScript
- Python
- Java
- C++
- C#
- Ruby
- PHP
- Go
- Rust
- SQL
- HTML
- CSS

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check connection
psql -U postgres -d codelens_ai

# Reset migrations
npm run db:push -- --force-reset
```

### Groq API Error
- Check API key is valid
- Verify rate limits
- Check code snippet size

### Authentication Issues
```javascript
// Clear cache
localStorage.clear()
// Refresh page
window.location.reload()
```

## 🎓 Next Steps

1. **Customize UI**: Update colors in `globals.css`
2. **Add Features**: New API routes in `app/api/`
3. **Deploy**: Follow `DEPLOYMENT.md`
4. **Monitor**: Set up analytics & error tracking
5. **Scale**: Optimize database queries

## 📖 Full Documentation

- [README_SETUP.md](README_SETUP.md) - Detailed setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)

---

**Happy coding! 🎉**
