# SentimentX GraphQL API - Phase 2

GraphQL API layer for the AI-Driven Booth Management System. Provides access to the Neo4j knowledge graph with enterprise-grade features like authentication, rate limiting, and comprehensive query support.

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.js              # Main Express + Apollo server
│   ├── neo4j/
│   │   └── driver.js         # Neo4j connection & query execution
│   ├── graphql/
│   │   ├── schema.js         # GraphQL type definitions
│   │   └── resolvers.js      # Query resolvers (400+ lines)
│   ├── middleware/
│   │   └── index.js          # Auth, rate limiting, error handling
│   ├── utils/
│   │   ├── logger.js         # Winston logging
│   │   └── formatters.js     # Neo4j → GraphQL object conversion
│   └── logs/                 # Application logs
├── package.json              # Dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Neo4j credentials:

```env
NEO4J_HOST=localhost
NEO4J_PORT=7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
PORT=4000
```

### 3. Start Development Server

```bash
npm run dev
```

Expected output:

```
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

### 4. Open GraphQL Playground

Navigate to: **http://localhost:4000/graphql**

## 📊 Available Queries

### Voter Queries

```graphql
# Get single voter
query {
  voter(voter_id: "VOTER_001") {
    voter_id
    name
    age
    political_leaning
    engagement_level
    risk_score
    mobile_number
    language_preference
    booth_id
  }
}
```

```graphql
# Get voters in a booth with pagination
query {
  votersByBooth(booth_id: "BOOTH_001", pagination: { first: 10 }) {
    edges {
      node {
        voter_id
        name
        engagement_level
      }
      cursor
    }
    pageInfo {
      has_next_page
      end_cursor
    }
    total_count
  }
}
```

```graphql
# Get high-risk voters
query {
  highRiskVoters(booth_id: "BOOTH_001", min_risk_score: 0.6) {
    edges {
      node {
        voter_id
        name
        risk_score
        risk_profile
      }
    }
    total_count
  }
}
```

```graphql
# Search voters
query {
  searchVoters(query: "kumar", pagination: { first: 20 }) {
    edges {
      node {
        voter_id
        name
        mobile_number
      }
    }
  }
}
```

### Booth Queries

```graphql
# Get booth statistics
query {
  boothStats(booth_id: "BOOTH_001") {
    booth_id
    total_voters
    pro_incumbent_count
    anti_incumbent_count
    undecided_count
    first_time_count
    high_engagement_count
    avg_risk_score
    avg_engagement_score
    misinformation_susceptible_count
  }
}
```

```graphql
# Get all booths
query {
  allBooths {
    booth_id
    name
    constituency_id
    address
    total_registered_voters
  }
}
```

### Segmentation Queries

```graphql
# Get voter segmentation statistics
query {
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
    by_risk_profile {
      category
      count
      percentage
    }
    by_age_group {
      category
      count
      percentage
    }
    by_language {
      category
      count
      percentage
    }
  }
}
```

### Scheme Queries

```graphql
# Get scheme beneficiaries in a booth
query {
  schemeBeneficiaryStats(booth_id: "BOOTH_001") {
    scheme_id
    scheme_name
    beneficiary_count
  }
}
```

```graphql
# Get voters eligible for a specific scheme
query {
  votersEligibleForScheme(scheme_id: "SCHEME_PM-KISAN", booth_id: "BOOTH_001") {
    edges {
      node {
        voter_id
        name
        mobile_number
        language_preference
      }
    }
  }
}
```

### Geographic Queries

```graphql
# Get all constituencies
query {
  allConstituencies {
    constituency_id
    name
    state
    district
    total_booths
    total_voters
  }
}
```

### Health Checks

```graphql
# Check database health
query {
  health {
    status
    database
    timestamp
  }
}
```

## 🔐 Authentication (Optional)

Current implementation allows both authenticated and anonymous access. To enable JWT authentication:

1. Add JWT token to request header:

```bash
Authorization: Bearer <your-jwt-token>
```

2. Token format:

```json
{
  "user_id": "user123",
  "email": "analyst@example.com",
  "role": "analyst"
}
```

3. Available roles: `admin`, `analyst`, `field_agent`, `read_only`

## 📈 Rate Limiting

- **Global limit**: 100 requests per 15 minutes per IP
- **GraphQL limit**: 50 requests per 15 minutes per IP

Configure in `.env`:

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔍 API Endpoints

| Endpoint      | Method | Purpose                         |
| ------------- | ------ | ------------------------------- |
| `/graphql`    | POST   | GraphQL queries & mutations     |
| `/graphql`    | GET    | GraphQL Playground (if enabled) |
| `/health`     | GET    | API health check                |
| `/health/db`  | GET    | Neo4j database status           |
| `/api/status` | GET    | Service status & version        |

## 📝 Logging

Logs are stored in `backend/logs/`:

- `combined.log` - All logs
- `error.log` - Errors only

Configure log level in `.env`:

```env
LOG_LEVEL=info  # debug, info, warn, error
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Watch mode
npm test --watch

# Coverage report
npm test --coverage
```

## 🔧 Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Generate GraphQL schema documentation
npm run generate:schema
```

## 📊 Performance Metrics

Query performance with 100 voters (expected times):

| Query                | Time    | Notes                 |
| -------------------- | ------- | --------------------- |
| Get single voter     | < 1ms   | Indexed lookup        |
| Voters in booth (20) | < 10ms  | Booth index           |
| All voters (100)     | < 50ms  | Full scan             |
| Booth statistics     | < 20ms  | Aggregation query     |
| Segmentation stats   | < 100ms | Multiple aggregations |

## 🚨 Error Handling

All errors follow this format:

```json
{
  "error": "GraphQLError",
  "message": "Failed to fetch voter",
  "extensions": {
    "code": "INTERNAL_SERVER_ERROR",
    "debugInfo": "..." // only in development
  }
}
```

## 📦 Neo4j Connection Details

**Connection Pool Settings:**

- Max pool size: 50 connections
- Max connection lifetime: 1 hour
- Connection timeout: 60 seconds
- Transaction timeout: 30 seconds

**Database Indexes:**
All queries leverage 10+ Neo4j indexes for performance.

## 🔗 Integration with Frontend (Phase 6)

The API is CORS-configured for frontend integration:

```javascript
// Frontend example (React)
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),
  cache: new InMemoryCache(),
});
```

## 🐛 Troubleshooting

### "Neo4j driver not initialized"

- Ensure Neo4j is running: `http://localhost:7474`
- Check `.env` credentials

### "apoc is not available"

- Install APOC plugin in Neo4j
- Restart Neo4j service

### Rate limit exceeded

- Increase `RATE_LIMIT_MAX_REQUESTS` in `.env`
- Or implement request queuing on client

### Slow queries

- Check Neo4j indexes are online: `CALL db.indexes()`
- Monitor query plans: `EXPLAIN <query>`

## 📚 Documentation

- [GraphQL Schema Reference](/docs/SCHEMA.md)
- [API Examples](/docs/EXAMPLES.md)
- [Neo4j Knowledge Graph](/neo4j-schema-design.md)

## 🎯 Next Phase (Phase 3)

**Categorization Engine**

- Real-time voter classification
- Machine learning model integration
- Sentiment-to-categorization pipeline

## 📄 License

MIT

## 👥 Support

For issues or questions:

1. Check logs in `backend/logs/`
2. Run `/health/db` endpoint to verify Neo4j
3. Review GraphQL error messages in Playground
