# SentimentX Phase 2 - Quick Start Checklist

One-page reference to get the GraphQL API running in 5 minutes.

## ⚡ 5-Minute Setup

### Prerequisites ✓

- [ ] Node.js v18+ installed: `node --version`
- [ ] npm v9+ installed: `npm --version`
- [ ] Neo4j running: http://localhost:7474
- [ ] Phase 1 data loaded (100 voters seeded)

### Step 1: Install Backend (1 min)

```bash
cd backend
npm install
```

### Step 2: Create & Configure .env (1 min)

```bash
cp .env.example .env
```

Edit `.env` with your Neo4j password:

```env
NEO4J_PASSWORD=your-neo4j-password
JWT_SECRET=change-this-in-production
```

### Step 3: Start Server (1 min)

```bash
npm run dev
```

Expected output:

```
┌─────────────────────────────────────────────────┐
│ 🚀 SentimentX GraphQL API Server Ready          │
├─────────────────────────────────────────────────┤
│ GraphQL Endpoint: http://localhost:4000/graphql│
└─────────────────────────────────────────────────┘
```

### Step 4: Test in GraphQL Playground (1 min)

Navigate to: **http://localhost:4000/graphql**

Paste this query:

```graphql
query {
  voters(pagination: { first: 5 }) {
    edges {
      node {
        voter_id
        name
        political_leaning
      }
    }
  }
}
```

Click **Play** ▶ → Should see 5 voters with data ✓

### Step 5: Verify Database Connection (1 min)

```bash
curl http://localhost:4000/health/db
```

Expected: `"status":"OK"` ✓

---

## 📂 File Structure Created

```
backend/
├── src/
│   ├── index.js              ← Main server
│   ├── neo4j/driver.js       ← DB connection
│   ├── graphql/
│   │   ├── schema.js         ← Types & queries
│   │   └── resolvers.js      ← Query handlers
│   ├── middleware/index.js   ← Auth & rate limit
│   └── utils/
│       ├── logger.js         ← Logging
│       └── formatters.js     ← Data conversion
├── .env.example              ← Config template
├── package.json              ← Dependencies
├── README.md                 ← Full documentation
├── SETUP.md                  ← Detailed setup
└── QUERY_EXAMPLES.md         ← Query reference
```

All files created: ✓ 9 files + 4 doc files

---

## 🧪 Essential Test Queries

### Test 1: Single Voter

```graphql
query {
  voter(voter_id: "VOTER_001") {
    name
    age
    political_leaning
  }
}
```

### Test 2: Booth Statistics

```graphql
query {
  boothStats(booth_id: "BOOTH_001") {
    total_voters
    pro_incumbent_count
    anti_incumbent_count
  }
}
```

### Test 3: Segmentation Analysis

```graphql
query {
  segmentationStats(booth_id: "BOOTH_001") {
    by_political_leaning {
      category
      count
    }
  }
}
```

### Test 4: High-Risk Voters

```graphql
query {
  highRiskVoters(booth_id: "BOOTH_001", min_risk_score: 0.6) {
    edges {
      node {
        voter_id
        name
        risk_score
      }
    }
    total_count
  }
}
```

### Test 5: Health Check

```graphql
query {
  health {
    status
    database
  }
}
```

---

## 🐛 Troubleshooting

| Problem                      | Solution                                                           |
| ---------------------------- | ------------------------------------------------------------------ |
| **Port 4000 already in use** | `PORT=4001 npm run dev`                                            |
| **Neo4j connection failed**  | Check Neo4j is running: `http://localhost:7474`                    |
| **apoc function not found**  | Install APOC plugin in Neo4j Desktop                               |
| **No data in queries**       | Verify Phase 1 data loaded: `curl http://localhost:4000/health/db` |
| **Module not found error**   | Run `npm install` again                                            |

---

## 🚀 Key Endpoints

| Endpoint      | Method | Purpose         |
| ------------- | ------ | --------------- |
| `/graphql`    | POST   | GraphQL queries |
| `/graphql`    | GET    | Playground UI   |
| `/health`     | GET    | API status      |
| `/health/db`  | GET    | Database status |
| `/api/status` | GET    | Service info    |

---

## 📊 Query Limits

- **Rate Limit**: 100 requests/15min per IP
- **Pagination**: Max 100 records per query
- **Timeout**: 30 seconds per query

---

## 🔑 Available Queries (25 Total)

**Voter**: voter, voters, votersByBooth, votersByConstituency, votersEligibleForScheme, searchVoters, highRiskVoters

**Booth**: booth, allBooths, boothsByConstituency, boothStats

**Constituency**: constituency, allConstituencies

**Geographic**: votersByConstituency

**Scheme**: schemes, scheme, schemeBeneficiaryStats, votersEligibleForScheme

**Analytics**: segmentationStats, votersByPoliticalLeaning, votersByEngagement

**Health**: health

---

## 🔐 Authentication (Optional)

To use JWT:

1. Generate token (example):

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"analyst1","role":"analyst"}'
```

2. Include in GraphQL requests:

```bash
Authorization: Bearer <token>
```

---

## 📝 npm Scripts

```bash
npm run dev              # Start with hot-reload
npm start               # Start production
npm test               # Run tests
npm run lint           # Check code style
npm run format         # Auto-format code
```

---

## 📈 Performance Checklist

- [x] Neo4j connection pooling: 50 connections
- [x] All queries indexed by booth_id, voter_id, constituency_id
- [x] Cursor-based pagination (no N+1 issues)
- [x] Rate limiting enabled (100 global, 50 GraphQL)
- [x] Error handling with proper logging
- [x] CORS configured for frontend

---

## 🎯 What's Included (Phase 2)

✅ **GraphQL Schema** - 50+ types, 25+ queries  
✅ **Neo4j Integration** - Driver, connection pooling, parameterized queries  
✅ **Authentication** - JWT + role-based access control  
✅ **Rate Limiting** - Protection against abuse  
✅ **Error Handling** - Comprehensive error messages  
✅ **Logging** - Winston with file rotation  
✅ **Middleware** - CORS, security headers, request logging  
✅ **Documentation** - README, setup guide, query examples

---

## ✅ Verification Checklist

After startup, verify all these:

- [ ] Server running on http://localhost:4000
- [ ] GraphQL Playground accessible
- [ ] `/health` returns OK
- [ ] `/health/db` shows Neo4j connected
- [ ] Sample voter query returns data
- [ ] Booth stats query returns aggregates
- [ ] High-risk voters query works
- [ ] Segmentation stats query returns breakdown
- [ ] Rate limiting works (test 101 requests)
- [ ] Logs appear in `src/logs/combined.log`

All checks passing? ✅ **Phase 2 Complete!**

---

## 🔄 Next Steps (Phase 3)

After Phase 2 verification:

1. **Build Categorization Engine**
   - Real-time voter classification
   - Political leaning + engagement scoring
   - Risk profile calculation

2. **Add Mutation Resolvers**
   - Update voter status
   - Record contact attempts
   - Update category assignments

3. **Implement Webhooks**
   - Listen for sentiment signals
   - Trigger categorization updates
   - Sync changes to Neo4j

4. **Set up Message Queue**
   - Bull + Redis for async jobs
   - Categorization pipeline
   - Data enrichment tasks

---

## 📞 Support

**Cannot connect to Neo4j?**

- Verify it's running: `http://localhost:7474`
- Check credentials in `.env`
- Restart Neo4j service

**GraphQL queries failing?**

- Check GraphQL Playground for error details
- Verify Phase 1 data is seeded: `curl http://localhost:4000/health/db`
- Check logs: `tail -f src/logs/error.log`

**Performance issues?**

- Check Neo4j CPU/memory
- Review slow query logs
- Increase pool size if needed

---

## 📚 Documentation Links

| Document                 | Purpose                |
| ------------------------ | ---------------------- |
| `README.md`              | Full API documentation |
| `SETUP.md`               | Detailed setup guide   |
| `QUERY_EXAMPLES.md`      | 50+ query examples     |
| `neo4j-schema-design.md` | Database schema        |
| `neo4j-setup-guide.md`   | Data loading           |

---

**Status**: ✅ Phase 2 GraphQL API Ready  
**Date**: 2024-01-15  
**Node.js Version Required**: v18.0.0+  
**Neo4j Version Required**: v5.0+

---

## Time Estimates

| Task                  | Time          |
| --------------------- | ------------- |
| Install dependencies  | 2-5 min       |
| Configure environment | 1 min         |
| Start server          | 1 min         |
| Test queries          | 5 min         |
| **Total**             | **10-15 min** |

---

**Ready to proceed to Phase 3? Run your verification checklist above first!** ✓
