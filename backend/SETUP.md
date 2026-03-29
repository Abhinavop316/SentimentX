# SentimentX GraphQL API - Setup & Execution Guide

Complete step-by-step guide to configure, install, and run the Phase 2 GraphQL API layer.

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Neo4j**: v5.0 or higher ([Download](https://neo4j.com/download/))
- **Git**: For version control (optional)

Verify installations:

```bash
node --version
npm --version
neo4j --version  # or check Neo4j Desktop
```

## Step 1: Neo4j Database Setup

### Option A: Neo4j Desktop (Recommended for Development)

1. Open **Neo4j Desktop**
2. Create a new database instance:
   - Click "Create" → New Database Project
   - Name: `sentimentx`
   - Default username: `neo4j`
   - Set a strong password
3. Start the database (click the play button)
4. Verify connection: Open Neo4j Browser → http://localhost:7474
   - Username: `neo4j`
   - Password: (your password)
   - Run: `RETURN 1` to verify connectivity

### Option B: Docker (For Production)

```bash
docker run -d \
  --name neo4j \
  -p 7687:7687 \
  -p 7474:7474 \
  -e NEO4J_AUTH=neo4j/password \
  -e NEO4J_PLUGINS=\[\"apoc\",\"graph-data-science\"\] \
  neo4j:latest
```

### Option C: Command Line Installation

```bash
# Linux/macOS
tar -xf neo4j-community-5.x.x-unix.tar.gz
cd neo4j-community-5.x.x
./bin/neo4j console

# Windows
# Download and run installer, then:
bin\neo4j.bat console
```

## Step 2: Execute Phase 1 Data (Neo4j Schema)

Before starting the API, seed the database with Phase 1 data:

```bash
# Open Neo4j Browser: http://localhost:7474
# Run the entire script from Phase 1:
# File: /neo4j-seed-data.cypher

# Or run via command line:
cat neo4j-seed-data.cypher | cypher-shell -u neo4j -p password --address bolt://localhost:7687
```

**Verify data loaded:**

```cypher
# In Neo4j Browser, run:
MATCH (v:Voter) RETURN COUNT(v) AS voter_count;
MATCH (b:Booth) RETURN COUNT(b) AS booth_count;
MATCH (c:Constituency) RETURN COUNT(c) AS constituency_count;
MATCH (s:Scheme) RETURN COUNT(s) AS scheme_count;
```

Expected output: 100 voters, 5 booths, 3 constituencies, 4 schemes

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```bash
cd backend
```

### 3.2 Install Dependencies

```bash
npm install
```

This installs 16 dependencies:

- `apollo-server-express` - GraphQL server framework
- `neo4j-driver` - Neo4j database connector
- `express` - HTTP server framework
- `jsonwebtoken` - JWT authentication
- `winston` - Logging library
- And 11 others (see `package.json`)

### 3.3 Create Environment File

```bash
# Copy template
cp .env.example .env

# Edit with your credentials
nano .env  # or open in your editor
```

**Edit `.env` file:**

```env
# Neo4j Connection
NEO4J_PROTOCOL=bolt
NEO4J_HOST=localhost
NEO4J_PORT=7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password  # Change this!

# Server Configuration
NODE_ENV=development
PORT=4000
LOG_LEVEL=info

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production  # Change this!

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
```

**Important:** Change `NEO4J_PASSWORD` and `JWT_SECRET` in production!

### 3.4 Create Logs Directory

```bash
mkdir -p src/logs
```

## Step 4: Start Development Server

```bash
npm run dev
```

Expected output:

```
[INFO] Logger initialized with level: info
[INFO] [2024-01-15 10:30:00] Connecting to Neo4j...
[INFO] Neo4j driver initialized successfully
┌─────────────────────────────────────────────────┐
│ 🚀 SentimentX GraphQL API Server Ready          │
├─────────────────────────────────────────────────┤
│ Environment: DEVELOPMENT                        │
│ Port: 4000                                      │
│ GraphQL Endpoint: http://localhost:4000/graphql│
│ Playground: Enabled                            │
│ Health Check: http://localhost:4000/health    │
└─────────────────────────────────────────────────┘
```

If you see this, **congratulations!** Your API is running ✅

## Step 5: Test the GraphQL API

### 5.1 Open GraphQL Playground

Navigate to: **http://localhost:4000/graphql**

### 5.2 Run a Test Query

Copy and paste into the left panel:

```graphql
query TestConnection {
  health {
    status
    database
    timestamp
  }
}
```

Click the **Play** button. Expected response:

```json
{
  "data": {
    "health": {
      "status": "OK",
      "database": "Neo4j 5.x.x",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 5.3 Query Voter Data

```graphql
query GetVoter {
  voter(voter_id: "VOTER_001") {
    voter_id
    name
    age
    political_leaning
    engagement_level
    risk_score
    mobile_number
  }
}
```

Expected response:

```json
{
  "data": {
    "voter": {
      "voter_id": "VOTER_001",
      "name": "Amit Kumar",
      "age": 35,
      "political_leaning": "pro-incumbent",
      "engagement_level": "high",
      "risk_score": 0.3,
      "mobile_number": "9876543210"
    }
  }
}
```

### 5.4 Query Booth Data

```graphql
query GetBoothStats {
  boothStats(booth_id: "BOOTH_001") {
    booth_id
    total_voters
    pro_incumbent_count
    anti_incumbent_count
    undecided_count
    avg_risk_score
    avg_engagement_score
  }
}
```

### 5.5 Query Segmentation

```graphql
query GetSegmentation {
  segmentationStats(booth_id: "BOOTH_001") {
    by_political_leaning {
      category
      count
      percentage
    }
    by_engagement_level {
      category
      count
      percentage
    }
  }
}
```

## Step 6: Verify API Health

### 6.1 Health Check Endpoint

```bash
curl http://localhost:4000/health
```

Response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 6.2 Database Health Check

```bash
curl http://localhost:4000/health/db
```

Response:

```json
{
  "status": "OK",
  "database": "Neo4j 5.x.x",
  "connection": "SUCCESSFUL",
  "driver_version": "5.17.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 6.3 Service Status

```bash
curl http://localhost:4000/api/status
```

## Step 7: Production Deployment

### 7.1 Start Production Server

```bash
npm start
```

This runs without hot-reload and optimized for performance.

### 7.2 Environment Configuration for Production

Update `.env`:

```env
NODE_ENV=production
LOG_LEVEL=warn
GRAPHQL_PLAYGROUND=false  # Disable introspection
JWT_SECRET=<generate-a-secure-random-string>
# Use: openssl rand -base64 32
```

### 7.3 Production Deployment Options

**Option A: PM2 Process Manager**

```bash
npm install -g pm2
pm2 start npm --name "sentimentx-api" -- start
pm2 save
```

**Option B: Docker**

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

**Option C: Systemd Service (Linux)**
Create `/etc/systemd/system/sentimentx-api.service`:

```ini
[Unit]
Description=SentimentX GraphQL API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/sentimentx-api
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

## Common Issues & Solutions

### Issue: "Neo4j driver not initialized"

```
Error: Driver not initialized. Call initDriver() first.
```

**Solution:**

1. Verify Neo4j is running: `http://localhost:7474`
2. Check `.env` credentials are correct
3. Ensure `NEO4J_HOST` and `NEO4J_PORT` are correct

### Issue: "ECONNREFUSED - No connection could be made"

```
Error: connect ECONNREFUSED 127.0.0.1:7687
```

**Solution:**

1. Start Neo4j: `neo4j start` or open Neo4j Desktop
2. Wait 30 seconds for Neo4j to fully start
3. Verify: `http://localhost:7474` opens in browser

### Issue: "apoc is not available"

```
GraphQLError: Could not invoke procedure `apoc.math.round()`
```

**Solution:**

1. Open Neo4j Desktop
2. Go to Plugins tab
3. Install APOC plugin
4. Restart database

### Issue: Port 4000 already in use

```
Error: listen EADDRINUSE :::4000
```

**Solution:**
Option A: Use different port

```bash
PORT=4001 npm run dev
```

Option B: Kill process using port 4000

```bash
# Linux/macOS
lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Issue: Low disk space

```
Error: ENOSPC: no space left on device
```

**Solution:**

1. Delete logs: `rm -rf src/logs/*`
2. Reduce log retention in `src/utils/logger.js`
3. Ensure at least 1GB free disk space

## Monitoring & Logs

### View Real-time Logs

```bash
# Combined log
tail -f src/logs/combined.log

# Error log
tail -f src/logs/error.log
```

### Log Rotation

Logs automatically rotate when they exceed 5MB. Retention:

- `combined.log`: 10 files max
- `error.log`: 5 files max

## Performance Tuning

### Connection Pool Optimization

Edit `src/neo4j/driver.js`:

```javascript
const driver = neo4j.driver(uri, auth, {
  maxConnectionPoolSize: 50, // Increase for high concurrency
  connectionAcquisitionTimeout: 60000, // ms
  maxConnectionLifetime: 3600000, // 1 hour
});
```

### Rate Limiting Adjustment

For higher throughput, update `.env`:

```env
RATE_LIMIT_MAX_REQUESTS=200  # Increase from 100
RATE_LIMIT_WINDOW_MS=900000  # Keep at 15 minutes
```

### Query Optimization

Run in Neo4j Browser to analyze slow queries:

```cypher
PROFILE MATCH (v:Voter) WHERE v.political_leaning = 'pro-incumbent' RETURN v;
```

## Next Steps

1. ✅ **Phase 2 Complete**: GraphQL API running
2. 🔄 **Phase 3**: Build Categorization Engine
3. 🔄 **Phase 4**: Build Delivery Engine
4. 🔄 **Phase 5**: Build Data Sync Pipeline
5. 🔄 **Phase 6**: Build React UI Components

## Getting Help

1. Check logs: `tail -f src/logs/error.log`
2. Run health checks: `curl http://localhost:4000/health/db`
3. Verify Neo4j: Open http://localhost:7474
4. Review GraphQL errors in Playground

## Resources

- [GraphQL Documentation](https://graphql.org/)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [Neo4j Developer](https://neo4j.com/developer/)
- [Express.js Guide](https://expressjs.com/)

---

**Last Updated**: 2024-01-15  
**API Version**: 2.0  
**Compatible with**: Node.js 18+, Neo4j 5+
