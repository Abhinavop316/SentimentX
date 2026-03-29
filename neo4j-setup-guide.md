# Neo4j Knowledge Graph Setup Guide

## AI-Driven Booth Management System - Step 1

---

## OVERVIEW

This guide contains everything needed to set up the Neo4j knowledge graph for the SentimentX booth management system. The schema supports:

- **100 dummy voters** across **5 booths** in **2 constituencies**
- **Real-time categorization** with political leaning, engagement level, risk profile, etc.
- **Government scheme eligibility tracking** (PM-KISAN, Ayushman Bharat, PMAY, DBT)
- **Optimized indexes** for fast queries at scale

**Files in this step:**

1. `neo4j-schema-design.md` - Complete schema documentation
2. `neo4j-seed-data.cypher` - All Cypher queries to create schema and seed data
3. `neo4j-setup-guide.md` - This file

---

## PREREQUISITES

### 1. Neo4j Installation

- **Desktop**: Download from [neo4j.com/download](https://neo4j.com/download/community-edition/)
- **Docker**: `docker run --name sentimentx-neo4j -e NEO4J_AUTH=neo4j/password -p 7687:7687 -p 7474:7474 -d neo4j:5.x`
- **Cloud**: Deploy on [Neo4j Aura](https://neo4j.com/cloud/aura/) (recommended for production)

### 2. Neo4j Browser or Client

- Neo4j Browser (built-in): `http://localhost:7474` (when running locally)
- Neo4j Desktop
- Command line: `cypher-shell`
- VS Code extension: Neo4j extension by Neo4j

### 3. Dependencies

The Cypher queries use APOC (Awesome Procedures on Cypher). Enable it:

**If using Neo4j Desktop:**

- In DBMS settings, add: `apoc.import.file.enabled=true` and `apoc.import.file.use_neo4j_config=true`
- Plugin: Install APOC from the Plugin section

**If using Docker:**

```bash
docker run --name sentimentx-neo4j \
 -e NEO4J_AUTH=neo4j/password \
 -e NEO4JLABS_PLUGINS='["apoc"]' \
 -p 7687:7687 -p 7474:7474 -d neo4j:5.x
```

---

## EXECUTION STEPS

### Step 1: Connect to Neo4j

**Via Neo4j Browser:**

1. Open `http://localhost:7474`
2. Login: `neo4j` / `password` (default)
3. Click on the query editor

**Via cypher-shell (CLI):**

```bash
cypher-shell -u neo4j -p password
```

**Via VS Code:**

- Install Neo4j extension
- Create connection with endpoint: `bolt://localhost:7687`

### Step 2: Run Schema Creation & Constraints (3-5 minutes)

Copy all queries from `neo4j-seed-data.cypher` into the Neo4j browser and execute in order:

**Phase 1: Constraints (Lines 1-30)**

```cypher
CREATE CONSTRAINT voter_id_unique IF NOT EXISTS
FOR (v:Voter) REQUIRE v.voter_id IS UNIQUE;
–– ... (repeat for all constraint queries)
```

Run this first. This ensures no duplicate voter IDs.

**Phase 2: Indexes (Lines 30-65)**

```cypher
CREATE INDEX voter_booth_id IF NOT EXISTS
FOR (v:Voter) ON (v.booth_id);
–– ... (repeat for all index queries)
```

Creating indexes takes a few seconds but enables fast queries later.

**Phase 3: Reference Data (Lines 65-180)**
Creates:

- 1 State (Maharashtra)
- 2 Districts (Pune, Mumbai)
- 3 Constituencies
- 5 Booths
- 4 Government Schemes

**Phase 4: Voter Seeding (Lines 180-1000+)**
Creates 100 voter nodes with all categorization fields:

- 20 voters in BOOTH_001 (Const_001)
- 20 voters in BOOTH_002 (Const_001)
- 20 voters in BOOTH_003 (Const_001)
- 20 voters in BOOTH_004 (Const_002)
- 20 voters in BOOTH_005 (Const_002)

### Step 3: Create Relationships (1-2 minutes)

The last section creates:

- `[:VOTES_AT]` edges: Voter → Booth
- `[:ELIGIBLE_FOR]` edges: Voter → Scheme
- `[:BELONGS_TO_CONSTITUENCY]` edges: Voter → Constituency

### Step 4: Verify Data (30 seconds)

Run the verification queries to confirm successful seeding:

```cypher
// Count total voters
MATCH (v:Voter) RETURN COUNT(v) as total_voters;
// Expected: 100

// Voters per booth
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth)
RETURN b.booth_id, COUNT(v) as voter_count
ORDER BY b.booth_id;
// Expected: 20, 20, 20, 20, 20

// Political leaning distribution
MATCH (v:Voter)
RETURN v.political_leaning, COUNT(v) as count
GROUP BY v.political_leaning;
// Expected: ~25 Pro-incumbent, ~20 Anti-incumbent, ~40 Undecided, ~15 First-time
```

---

## SCHEMA STRUCTURE AT A GLANCE

### Node Types (8 types)

```
VOTER(100) ──→ BOOTH(5) ──→ CONSTITUENCY(3) ──→ DISTRICT(2) ──→ STATE(1)
   ↓                                                                   ↑
   └─→ SCHEME(4) ──────────────────────────────────────────────────────┘
   ↓
HOUSEHOLD (optional - not seeded yet)
   ↓
VOTING_HISTORY (optional - not seeded yet)
```

### Key Relationships

| From         | To           | Type                    | Count |
| ------------ | ------------ | ----------------------- | ----- |
| Voter        | Booth        | VOTES_AT                | 100   |
| Voter        | Scheme       | ELIGIBLE_FOR            | ~250  |
| Voter        | Constituency | BELONGS_TO_CONSTITUENCY | 100   |
| Booth        | Constituency | IN_CONSTITUENCY         | 5     |
| Constituency | District     | IN_DISTRICT             | 3     |
| District     | State        | IN_STATE                | 2     |

### Categorization Fields (On Every Voter)

```
political_leaning: Pro-incumbent | Anti-incumbent | Undecided | First-time
scheme_beneficiary_status: Active | Eligible-not-enrolled | Not-eligible
engagement_level: High | Medium | Low | Unreachable
risk_profile: Misinformation-susceptible | Neutral | Informed
age_group: 18-25 | 26-40 | 41-60 | 60+
language_preference: English | Hindi | Hinglish | Regional
```

---

## QUICK QUERY EXAMPLES

### 1. Find all voters in a specific booth

```cypher
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth {booth_id: 'BOOTH_001'})
RETURN v.voter_id, v.name, v.age, v.political_leaning, v.engagement_level;
```

### 2. Find first-time voters at high risk

```cypher
MATCH (v:Voter)
WHERE v.political_leaning = 'First-time'
  AND v.risk_profile = 'Misinformation-susceptible'
RETURN v.voter_id, v.name, v.mobile_number, v.language_preference;
```

### 3. Find voters eligible for PM-KISAN scheme

```cypher
MATCH (v:Voter)-[:ELIGIBLE_FOR]->(s:Scheme {scheme_id: 'SCHEME_PM-KISAN'})
RETURN v.voter_id, v.name, v.occupation, v.income_bracket;
```

### 4. Get booth-level aggregation

```cypher
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth)
RETURN b.booth_id,
       COUNT(v) as total_voters,
       COUNT(CASE WHEN v.political_leaning = 'Pro-incumbent' THEN 1 END) as pro_incumbent,
       COUNT(CASE WHEN v.engagement_level = 'High' THEN 1 END) as high_engagement,
       COUNT(CASE WHEN v.risk_profile = 'Misinformation-susceptible' THEN 1 END) as at_risk;
```

### 5. Find households (when seeded)

```cypher
MATCH (v1:Voter)-[:MEMBER_OF]->(h:Household)
MATCH (h)<-[:MEMBER_OF]-(v2:Voter)
WHERE h.booth_id = 'BOOTH_001'
RETURN v1.voter_id, v2.voter_id, v1.name, v2.name;
```

---

## DATA DISTRIBUTION

### By Political Leaning

- **Pro-incumbent**: ~25-27%
- **Anti-incumbent**: ~20-22%
- **Undecided**: ~40-42%
- **First-time**: ~12-15%

### By Engagement Level

- **High**: ~45%
- **Medium**: ~35%
- **Low**: ~15%
- **Unreachable**: ~5%

### By Risk Profile

- **Informed**: ~30-35%
- **Neutral**: ~50-55%
- **Misinformation-susceptible**: ~12-15%

### By Education

- **Graduate+**: ~35%
- **Secondary**: ~40%
- **Primary**: ~20%
- **Illiterate**: ~5%

### By Age Group

- **18-25**: ~15%
- **26-40**: ~40%
- **41-60**: ~35%
- **60+**: ~10%

---

## NEXT STEPS

After successfully seeding the Neo4j database:

### Step 2: Build GraphQL API

- Create Apollo GraphQL server with Neo4j driver
- Define GraphQL schema for Voter, Booth, Constituency queries
- Implement resolvers for knowledge graph traversal
- Add filters: `booth`, `constituency`, `political_leaning`, `language`

### Step 3: Design Categorization Engine

- Python FastAPI or Node.js service
- Runs on sentiment signal arrival
- Updates voter nodes with new categorization
- Uses rules engine or ML model for classification

### Step 4: Build Delivery Engine

- Multi-channel outbound: WhatsApp, SMS, Push
- Message templating and personalization
- Language translation (Google Translate API)
- Delivery tracking and logging

### Step 5: Data Sync Pipeline

- CSV/Excel voter roll upload handler
- Fuzzy deduplication (Levenshtein distance)
- Enrichment with scheme databases
- Kafka or Bull queue for real-time updates

### Step 6: React UI Components

- Knowledge Graph Explorer (D3.js visualization)
- Voter Segmentation Dashboard (Recharts)
- Campaign Builder
- Delivery Tracker
- Data Sync Manager

---

## TROUBLESHOOTING

### Issue: "apoc is not available" error

**Solution**: Ensure APOC plugin is installed and enabled in Neo4j settings.

```bash
// Check if APOC is loaded
RETURN apoc.version();
```

### Issue: "Constraint already exists" error

**Solution**: The `IF NOT EXISTS` clause prevents this. If you still get it, drop and recreate:

```cypher
DROP CONSTRAINT voter_id_unique;
CREATE CONSTRAINT voter_id_unique FOR (v:Voter) REQUIRE v.voter_id IS UNIQUE;
```

### Issue: Slow queries after seeding

**Solution**: Ensure indexes are created and warmed up. Run this:

```cypher
CALL db.indexes() YIELD name, state;
```

Wait for all indexes to show `ONLINE` status.

### Issue: "Out of Memory" during seeding

**Solution**: With 100 voters, memory should not be an issue. If it is:

1. Seed only 1-2 booths first (20-40 voters)
2. Increase Neo4j heap size: `NEO4J_HEAP_SIZE=2G`
3. Run queries in phases instead of all at once

---

## PERFORMANCE NOTES

### Query Performance Expectations (with indexes)

- Single voter lookup by ID: **< 1ms**
- All voters in booth: **< 10ms**
- Voters by political leaning: **< 50ms**
- Full graph traversal (100 voters): **< 200ms**

### When Scaling to 1M+ Voters

- Add more indexes on frequently filtered fields
- Partition data by constituency or district
- Use Neo4j clustering or replication
- Consider sharding strategy for analytics

---

## DATABASE CONNECTION STRING

For next phases (GraphQL API, FastAPI):

**Bolt Protocol (Recommended)**

```
bolt://localhost:7687
bolt://neo4j:password@localhost:7687
```

**HTTP Protocol**

```
http://localhost:7474
```

**Environment Variables (to set in .env)**

```
NEO4J_PROTOCOL=bolt
NEO4J_HOST=localhost
NEO4J_PORT=7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j
```

---

## FILE CHECKLIST

After successful execution:

- ✅ 100 Voter nodes created
- ✅ 5 Booth nodes created
- ✅ 3 Constituency nodes created
- ✅ 2 District nodes created
- ✅ 1 State node created
- ✅ 4 Scheme nodes created
- ✅ 8 Constraints created
- ✅ 10 Indexes created
- ✅ 100 `[:VOTES_AT]` relationships
- ✅ ~250 `[:ELIGIBLE_FOR]` relationships
- ✅ 100 `[:BELONGS_TO_CONSTITUENCY]` relationships
- ✅ 5 `[:IN_CONSTITUENCY]` relationships
- ✅ 3 `[:IN_DISTRICT]` relationships
- ✅ 2 `[:IN_STATE]` relationships

**Total in Neo4j:**

- **Nodes**: ~117
- **Relationships**: ~488
- **Properties**: ~2,500+

---

## SUPPORT

For issues or questions:

1. Check verification queries (Step 4)
2. Review Neo4j logs: `~/.neo4j/logs/`
3. Test with Neo4j Browser directly
4. Confirm APOC is available: `RETURN apoc.version();`

---

**READY TO EXECUTE?**
Copy all queries from `neo4j-seed-data.cypher` → paste into Neo4j Browser → run step by step.

Expected total execution time: **5-10 minutes** (depending on machine specs)

After execution, you'll have a fully functional knowledge graph ready for Phase 2: GraphQL API development.
