# CodeLens AI - Deployment Guide

## Vercel Deployment

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Initial CodeLens AI setup"
git push origin main
```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your GitHub repositories

### Step 3: Import Project

1. Click "Add New..." → "Project"
2. Select your CodeLens AI repository
3. Click "Import"

### Step 4: Configure Environment Variables

In the Vercel dashboard, go to Settings → Environment Variables and add:

```env
DATABASE_URL=postgresql://user:password@host:port/codelens_ai
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

### Step 5: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `yourdomain.vercel.app`

## Database Setup Options

### Option 1: Neon (Recommended for Serverless)

Neon is a serverless PostgreSQL database perfect for Vercel:

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new database
3. Copy the connection string
4. Add to `DATABASE_URL` in Vercel

**Neon Connection String Format:**
```
postgresql://user:password@ep-xxx.region.neon.tech/codelens_ai?sslmode=require
```

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Copy connection string
4. Add to `DATABASE_URL`

### Option 3: AWS RDS

1. Create RDS PostgreSQL instance
2. Configure security groups to allow Vercel IPs
3. Use standard PostgreSQL connection string

## Running Migrations on Production

After deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull
npm run db:migrate -- --skip-generate

# Or manually in Vercel dashboard
vercel env list
```

Then seed demo data:
```bash
npm run db:seed
```

## Getting Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up/Log in
3. Create API key
4. Add to `GROQ_API_KEY` in Vercel

## Custom Domain

1. In Vercel dashboard → Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` in environment variables

## Monitoring & Debugging

### View Logs
```bash
vercel logs [project-name]
```

### Check Database Connection
```bash
vercel env pull
psql $DATABASE_URL
```

### Monitor Performance
- Vercel Analytics dashboard
- Web Vitals monitoring
- Error tracking

## CI/CD Best Practices

1. **Auto-deploy on push to main**
   - Already enabled in Vercel by default

2. **Preview deployments for PRs**
   - Vercel automatically creates preview URLs

3. **Environment-specific variables**
   - Set different values for Production vs Preview

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use environment-specific secrets
- [ ] Enable password protection for staging
- [ ] Set up CORS properly
- [ ] Configure rate limiting
- [ ] Regular security updates
- [ ] Monitor API usage
- [ ] Set up error alerts

## Database Backup

For production databases:

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Troubleshooting Deployment

### Build Fails
```bash
# Clear build cache
vercel rebuild

# Check logs
vercel logs --follow
```

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database credentials
- Ensure database is running
- Check firewall rules

### API Errors
```bash
# Test Groq API
curl -X POST https://api.groq.com/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY"
```

### Authentication Issues
- Verify `JWT_SECRET` is set
- Check token expiration (30 days default)
- Clear localStorage in browser

## Performance Optimization

1. **Database Optimization**
   - Add indexes on frequently queried fields
   - Use connection pooling (Neon has this)

2. **API Optimization**
   - Cache responses where possible
   - Implement rate limiting
   - Compress responses

3. **Frontend Optimization**
   - Monaco Editor loaded from CDN
   - Image optimization
   - Code splitting

## Scaling Tips

1. **Database**
   - Use read replicas for scale
   - Archive old snippets to cold storage

2. **API**
   - Use serverless edge functions
   - Cache AI responses
   - Implement request queuing

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor API latency
   - Track database performance

## Post-Deployment Checklist

- [ ] Test login/signup
- [ ] Test code explanation
- [ ] Test snippet saving
- [ ] Test sharing feature
- [ ] Verify email configuration (if added)
- [ ] Test on mobile
- [ ] Monitor logs for errors
- [ ] Set up auto-backup
- [ ] Configure monitoring alerts

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Docs](https://neon.tech/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/orm/prisma-client/deployment)
