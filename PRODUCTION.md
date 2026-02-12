# CodeLens AI - Production Configuration

## Environment Variables for Production

```env
# ===== DATABASE =====
# Use a dedicated database URL from a managed PostgreSQL service
# Examples: Neon, Railway, AWS RDS, etc.
DATABASE_URL="postgresql://user:password@db.example.com:5432/codelens_ai?sslmode=require"

# ===== GROQ API =====
# Get your API key from console.groq.com
# Keep this secret - never commit it
GROQ_API_KEY="your-production-groq-api-key"

# ===== AUTHENTICATION =====
# Generate a strong random key for JWT signing
# Example: openssl rand -base64 32
JWT_SECRET="generate-a-strong-random-secret-key-here"

# ===== APP URL =====
# Your production domain
NEXT_PUBLIC_APP_URL="https://codelens.yourdomain.com"

# ===== OPTIONAL: Email Configuration =====
# For future email features (password reset, notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@codelens.yourdomain.com"

# ===== OPTIONAL: Analytics =====
# For monitoring and analytics
NEXT_PUBLIC_GA_ID="UA-XXXXXXXXX-X"
SENTRY_DSN="your-sentry-dsn"
```

## Production Deployment Checklist

### Security
- [ ] Change all default secrets and API keys
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Enable rate limiting on API endpoints
- [ ] Set up DDoS protection (Cloudflare, etc.)
- [ ] Regular security audits

### Database
- [ ] Use managed PostgreSQL (Neon, Railway, RDS)
- [ ] Enable automated backups (daily minimum)
- [ ] Set up monitoring and alerting
- [ ] Use connection pooling
- [ ] Regular VACUUM and ANALYZE
- [ ] Archive old data periodically
- [ ] Test disaster recovery procedures

### Performance
- [ ] Enable database indexes
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Monitor API response times
- [ ] Set up edge functions for heavy computations
- [ ] Implement request queuing
- [ ] Monitor database query performance

### Monitoring & Logging
- [ ] Set up error tracking (Sentry)
- [ ] Enable application logging
- [ ] Monitor API usage and quotas
- [ ] Set up performance monitoring
- [ ] Configure alerts for critical issues
- [ ] Track user analytics
- [ ] Monitor database health

### Scaling
- [ ] Plan for horizontal scaling
- [ ] Use load balancer
- [ ] Database read replicas for read-heavy operations
- [ ] Implement caching layer (Redis)
- [ ] Queue long-running tasks
- [ ] Monitor and adjust database indexes

## Groq API Rate Limits (Free Tier)

- **Requests per minute**: 30
- **Requests per day**: 500
- **Token limit per request**: 2000

For higher limits, upgrade your Groq account.

## Database Optimization Queries

### Create Essential Indexes
```sql
-- User queries
CREATE INDEX idx_user_email ON "User"(email);

-- Snippet queries
CREATE INDEX idx_snippet_user_id ON "Snippet"("userId");
CREATE INDEX idx_snippet_is_public ON "Snippet"("isPublic");
CREATE INDEX idx_snippet_share_token ON "Snippet"("shareToken");

-- Favorite queries
CREATE INDEX idx_favorite_user_id ON "Favorite"("userId");
CREATE INDEX idx_favorite_snippet_id ON "Favorite"("snippetId");

-- Tag queries
CREATE INDEX idx_snippet_tag_snippet_id ON "SnippetTag"("snippetId");
CREATE INDEX idx_snippet_tag_tag_id ON "SnippetTag"("tagId");
```

### Monitor Database
```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT query, mean_exec_time FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;
```

## Error Tracking Setup (Sentry)

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

## Response Time Targets

- API requests: < 200ms
- Database queries: < 100ms
- Page load: < 2s
- Code explanation: < 10s

## Backup Strategy

### Daily Backups
```bash
# Automated via managed database service
# OR manual backup
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Disaster Recovery
- Keep backups for 30 days minimum
- Test restore procedures monthly
- Document recovery procedures
- Keep backups in separate region

## Cost Optimization

### Database
- Use small instance for development
- Scale vertically before horizontally
- Monitor and remove unused data
- Archive old snippets to cold storage

### API
- Cache explanations for repeated code
- Batch process requests
- Implement request deduplication
- Monitor Groq API usage

### Hosting
- Use Vercel's auto-scaling
- Implement CDN for assets
- Monitor bandwidth usage
- Use serverless functions for APIs

## Monitoring Commands

```bash
# Check Vercel deployments
vercel list

# View logs
vercel logs [project-name]

# Check build status
vercel projects

# Monitor real-time metrics
vercel analytics [project-name]
```

## Incident Response

### If API is down:
1. Check Vercel status
2. Check database connectivity
3. Check Groq API status
4. Review recent deployments
5. Rollback if necessary

### If database is slow:
1. Check active connections
2. Run ANALYZE and VACUUM
3. Check query logs
4. Add missing indexes
5. Consider read replicas

### If getting rate limited by Groq:
1. Implement exponential backoff
2. Cache explanations
3. Upgrade Groq plan
4. Queue requests

## Success Metrics

- **Uptime**: > 99.9%
- **API Latency**: < 200ms (p95)
- **Error Rate**: < 0.1%
- **Database Query Time**: < 100ms (p95)
- **User Growth**: Track weekly
- **DAU/MAU**: Monitor trends
- **Explanation Accuracy**: User feedback

---

**Updated**: 2024
**Status**: Production Ready
