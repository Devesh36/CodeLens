# CodeLens AI - Production Ready SaaS

A modern web application that provides AI-powered line-by-line code explanations. Built with Next.js 14+, PostgreSQL, Prisma, and Groq AI.

## 🚀 Features

- **AI Code Explanations**: Get instant line-by-line analysis of your code using Groq's LLaMA model
- **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, C#, Ruby, PHP, Go, Rust, SQL, HTML, CSS
- **Snippet Library**: Save, organize, tag, and manage your code snippets
- **Public Sharing**: Generate shareable links for your code explanations
- **User Authentication**: Secure email/password authentication with JWT tokens
- **Favorites System**: Mark snippets as favorites for quick access
- **Full-Text Search**: Search through your snippets by title and content
- **Monaco Editor**: Professional code editor with syntax highlighting and language support

## 📋 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UI Framework**: React 19
- **Styling**: TailwindCSS
- **Code Editor**: Monaco Editor
- **AI Model**: Groq (LLaMA 3.1-70B)
- **Authentication**: JWT with Jose
- **Password Hashing**: bcryptjs
- **Deployment**: Vercel-ready

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Groq API key (get it at [console.groq.com](https://console.groq.com))

### Step 1: Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/codelens_ai"

# Groq API
GROQ_API_KEY="your-groq-api-key-here"

# JWT Secret (change in production)
JWT_SECRET="super-secret-jwt-key-change-this-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Database Setup

```bash
# Create the database
createdb codelens_ai

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123456`

## 📁 Project Structure

```
codelens-ai/
├── app/                       # Next.js app directory
│   ├── (auth)/               # Auth routes (login, signup)
│   ├── api/
│   │   └── explain/          # AI explanation API endpoint
│   ├── dashboard/            # Protected dashboard routes
│   ├── editor/               # Main editor page
│   ├── shared/[shareToken]/  # Public shared snippet page
│   ├── layout.tsx
│   ├── page.tsx             # Landing page
│   ├── actions.ts           # Server actions (database operations)
│   └── globals.css
├── components/              # React components
│   ├── Editor.tsx           # Monaco editor component
│   ├── ExplanationPanel.tsx # AI explanation display
│   └── SnippetCard.tsx      # Snippet list card
├── lib/                     # Utility functions and services
│   ├── ai.ts               # Groq AI integration
│   ├── auth.ts             # Authentication utilities
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Helper functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding script
├── middleware.ts           # Authentication middleware
└── package.json
```

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token is created and stored in localStorage
3. Token is sent with requests via Authorization header
4. Middleware validates token on protected routes
5. JWT payload contains userId for database operations

## 🧠 AI Explanation System

### API Endpoint: `POST /api/explain`

**Request:**
```json
{
  "code": "function example() { return 42; }",
  "language": "javascript"
}
```

**Response:**
```json
{
  "summary": "A simple function that returns the number 42",
  "lineExplanations": [
    {
      "line": 1,
      "explanation": "Function declaration named 'example' with no parameters"
    }
  ],
  "complexity": "Simple",
  "improvements": [
    "Add JSDoc comments",
    "Consider what purpose this serves"
  ]
}
```

## 💾 Database Schema

### Users
- `id`: Unique identifier
- `email`: User's email (unique)
- `password`: Hashed password
- `name`: User's full name
- `createdAt`, `updatedAt`: Timestamps

### Snippets
- `id`: Unique identifier
- `title`: Snippet title
- `code`: Code content
- `language`: Programming language
- `explanation`: AI explanation summary
- `explanationJson`: Structured JSON explanation (JSONB)
- `isPublic`: Public visibility flag
- `shareToken`: Unique share link token
- `userId`: Owner reference
- `createdAt`, `updatedAt`: Timestamps

### Tags & SnippetTags
- Many-to-many relationship for categorizing snippets

### Favorites
- User-to-Snippet relationship for favorites system

## 🚀 Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `GROQ_API_KEY` (Your Groq API key)
   - `JWT_SECRET` (Strong random key)
5. Deploy

### Database Setup on Production

```bash
# After deployment, run migrations
vercel env pull # Pull env variables locally
npm run db:migrate -- --skip-generate

# Or manually via Vercel dashboard CLI
vercel env list
```

## 🔧 API Routes

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Code Explanation
- `POST /api/explain` - Get AI explanation (protected)

### Database Operations (Server Actions)
- `createSnippet()` - Create new snippet
- `updateSnippet()` - Update snippet
- `deleteSnippet()` - Delete snippet
- `getUserSnippets()` - Get user's snippets
- `toggleFavorite()` - Add/remove favorite
- `toggleSnippetVisibility()` - Make public/private
- `getPublicSnippet()` - Get public snippet by share token

## 🎨 UI Components

### Editor Component
- Monaco Editor integration
- Language selector
- Auto-layout support
- Dark theme

### ExplanationPanel Component
- Summary display
- Line-by-line explanations
- Complexity badge
- Improvement suggestions

### SnippetCard Component
- Code preview
- Metadata display
- Action buttons (favorite, share, edit, delete)
- Language badge

## 🌐 Shared Snippet Feature

1. Go to your snippet
2. Click "Share" button
3. Snippet becomes public with unique URL
4. Share link is copied to clipboard
5. Anyone can view without login

**Shared Link Format:**
```
https://yourdomain.com/shared/[shareToken]
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Middleware route protection
- ✅ Server-side validation
- ✅ CORS headers for API
- ✅ Secure HTTP-only cookies support

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimized
- Desktop full-featured
- Touch-friendly UI
- Dark theme for reduced eye strain

## 🚦 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `GROQ_API_KEY` | Groq API key from console.groq.com | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public app URL | ✅ |

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -U username -d codelens_ai -h localhost
```

### Groq API Errors
- Verify API key is correct
- Check rate limits (free tier has limits)
- Ensure code snippet is not too large

### Authentication Issues
- Clear localStorage and refresh
- Check JWT_SECRET is consistent
- Verify token expiration (30 days)

## 📊 Performance Considerations

- Monaco Editor is lazily loaded from CDN
- Prisma Client uses connection pooling
- Database queries are optimized with indexes
- API responses are cached where possible

## 🔄 Workflow Example

1. **User lands on home page** → Sign up/Login
2. **Navigate to Editor** → Paste code
3. **Click "Explain"** → API calls Groq AI
4. **View explanation** → Summary + line-by-line breakdown
5. **Save snippet** → Stored in PostgreSQL
6. **Share snippet** → Generate public link
7. **View dashboard** → Manage all snippets

## 📝 License

MIT License - Feel free to use this in your projects

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub issues
3. Check Groq API documentation

## 🎯 Future Enhancements

- [ ] Code generation from explanations
- [ ] Team collaboration features
- [ ] Custom AI model selection
- [ ] Export explanations as PDF
- [ ] API rate limiting per user
- [ ] Advanced analytics
- [ ] Code diff viewer
- [ ] Integration with GitHub

---

**Built with ❤️ using Groq AI and Next.js**

For more information about Groq: [groq.com](https://groq.com)
