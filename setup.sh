#!/bin/bash
# CodeLens AI - Setup Script
# Automated setup for development environment

set -e

echo "=========================================="
echo "CodeLens AI - Development Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client is not installed. Make sure PostgreSQL server is running."
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check for .env.local
echo "🔐 Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codelens_ai"

# Groq API
GROQ_API_KEY="your-groq-api-key"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
    echo "⚠️  .env.local created with template values"
    echo "⚠️  Please update DATABASE_URL and GROQ_API_KEY in .env.local"
    echo ""
    exit 1
else
    echo "✅ .env.local found"
fi

# Create database
echo "🗄️  Setting up database..."
read -p "Create database codelens_ai? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    createdb codelens_ai 2>/dev/null || echo "⚠️  Database may already exist"
fi

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate -- --skip-generate
echo "✅ Migrations complete"
echo ""

# Seed database
read -p "Seed database with demo data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:seed
    echo "✅ Demo data loaded"
    echo "   Email: demo@example.com"
    echo "   Password: demo123456"
else
    echo "⏭️  Skipping database seeding"
fi
echo ""

# Summary
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Groq API key"
echo "2. Make sure PostgreSQL is running"
echo "3. Run: npm run dev"
echo "4. Visit: http://localhost:3000"
echo ""
echo "Documentation:"
echo "- Quick Start: QUICKSTART.md"
echo "- Full Setup: README_SETUP.md"
echo "- Deployment: DEPLOYMENT.md"
echo ""
