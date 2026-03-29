# Neo4j Schema Visual Reference

## AI-Driven Booth Management System - Quick Reference Card

---

## NODE TYPES & CARDINALITY

```
┌──────────────────────────────────────────────────────────────────┐
│                           STATE (1)                               │
│  state_id, name, total_districts                                  │
└──────────────────────────────────────────────────────────────────┘
                              ▼ (IN_STATE)
┌─────────────────────┬───────────────────────┐
│                     │                       │
DISTRICT (2)      DISTRICT (2)                │
┌─────────────────┐ ┌─────────────────┐       │
│ district_id     │ │ district_id     │       │
│ name: Pune      │ │ name: Mumbai     │       │
│ state           │ │ state           │       │
│ total_const     │ │ total_const     │       │
│ total_booths    │ │ total_booths    │       │
└─────────────────┘ └─────────────────┘       │
        ▼ (IN_DISTRICT)          ▼ (IN_DISTRICT)    │
    CONSTITUENCY (3)         (Future)              │
    ┌──────────────────┐     District             │
    │ constituency_id  │      State               │
    │ name: Const_001  │                          │
    │ state            │                          │
    │ district         │                          │
    │ total_booths     │                          │
    │ total_voters     │                          │
    └──────────────────┘                          │
         ▼ (IN_CONSTITUENCY)                      │
    BOOTH (5)                                     │
    ┌──────────────────┐                          │
    │ booth_id         │                          │
    │ name             │                          │
    │ constituency_id  │                          │
    │ address          │                          │
    │ latitude/lon     │                          │
    │ polling_officers │                          │
    │ accessibility[]  │                          │
    │ reg_voters       │                          │
    └──────────────────┘                          │
         ▼ (VOTES_AT)                             │
    VOTER (100)                                   │
    ├─ voter_id                                   │
    ├─ name, age, gender                          │
    ├─ caste_category, religion                   │
    ├─ education_level, occupation                │
    ├─ income_bracket                             │
    ├─ language_preference (preferred filter)     │
    ├─ booth_id, constituency_id, state           │
    ├─ mobile_number                              │
    ├─ has_aadhaar                                │
    ├─ government_scheme_eligibility[] ──────┐    │
    │                                        │    │
    ├─ CATEGORIZATION (real-time):           │    │
    │  ├─ political_leaning ◄────────┐       │    │
    │  ├─ scheme_beneficiary_status   │       │    │
    │  ├─ engagement_level            │       │    │
    │  ├─ risk_profile                │       │    │
    │  ├─ age_group                   │       │    │
    │  │                              │       │    │
    │  ├─ risk_score: 0.0-1.0         │       │    │
    │  └─ engagement_score: 0.0-1.0   │       │    │
    │                                 │       │    │
    └─ Timestamps                     │       │    │
       ├─ created_at                  │       │    │
       ├─ updated_at                  │       │    │
       └─ last_sentiment_update       │       │    │
                                      │       │    │
         BELONGS_TO_CONSTITUENCY ────►│       │    │
                          (many)      │       │    │
                                      │       │    │
    HOUSEHOLD (Optional)              │       │    │
    ├─ household_id                   │       │    │
    ├─ primary_voter_id               │       │    │
    ├─ address                        │       │    │
    ├─ booth_id                       │       │    │
    └─ total_members                  │       │    │
                                      │       │    │
    VOTING_HISTORY (Optional)         │       │    │
    ├─ history_id                     │       │    │
    ├─ voter_id (ref)                 │       │    │
    ├─ election_year                  │       │    │
    ├─ constituency_id                │       │    │
    ├─ booth_id                       │       │    │
    └─ voted: Boolean                 │       │    │
                                      │       │    │
         ELIGIBLE_FOR ────────────────┴───────┘    │
                 (many)                            │
                                                  ▼
                          SCHEME (4)
                          ┌──────────────────┐
                          │ scheme_id        │
                          │ name             │
                          │ description      │
                          │ scheme_type      │
                          │ eligibility      │
                          │ annual_benefit   │
                          │ created_at       │
                          └──────────────────┘
```

---

## RELATIONSHIP SUMMARY TABLE

| From         | To           | Rel Type                | Props                      | Count | Filter          |
| ------------ | ------------ | ----------------------- | -------------------------- | ----- | --------------- |
| Voter        | Booth        | VOTES_AT                | registered_year            | 100   | booth_id        |
| Voter        | Constituency | BELONGS_TO_CONSTITUENCY | -                          | 100   | constituency_id |
| Voter        | Scheme       | ELIGIBLE_FOR            | enrolled, benefit_received | ~250  | scheme_id       |
| Voter        | Household    | MEMBER_OF               | relationship               | -     | household_id    |
| Household    | Voter        | HAS_MEMBER              | relationship               | -     | -               |
| Booth        | Constituency | IN_CONSTITUENCY         | -                          | 5     | -               |
| Booth        | Scheme       | SERVES_SCHEME           | beneficiary_count          | 4     | -               |
| Constituency | District     | IN_DISTRICT             | -                          | 3     | -               |
| District     | State        | IN_STATE                | -                          | 2     | -               |

---

## INDEXED FIELDS FOR FAST QUERIES

```
VOTER Indexes:
├─ voter_id (PRIMARY KEY)
├─ booth_id (Booth lookup)
├─ constituency_id (Regional analysis)
├─ mobile_number (Delivery engine)
├─ language_preference (Message translation)
├─ political_leaning (Segmentation)
└─ engagement_level (Risk filtering)

BOOTH Indexes:
├─ booth_id (PRIMARY KEY)
└─ constituency_id (Regional grouping)

CONSTITUENCY Indexes:
├─ constituency_id (PRIMARY KEY)
└─ state (State-level analytics)

VOTING_HISTORY Indexes:
└─ voter_id (History lookup)

SCHEME Indexes:
└─ scheme_id (PRIMARY KEY)
```

---

## CRITICAL QUERIES (FOR ANALYTICS)

### Query Pattern 1: Booth Dashboard

```cypher
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth {booth_id: 'BOOTH_001'})
RETURN {
  booth: b.booth_id,
  total: COUNT(v),
  pro_incumbent: COUNT(CASE WHEN v.political_leaning = 'Pro-incumbent' THEN 1 END),
  anti_incumbent: COUNT(CASE WHEN v.political_leaning = 'Anti-incumbent' THEN 1 END),
  undecided: COUNT(CASE WHEN v.political_leaning = 'Undecided' THEN 1 END),
  high_engagement: COUNT(CASE WHEN v.engagement_level = 'High' THEN 1 END),
  at_risk: COUNT(CASE WHEN v.risk_profile = 'Misinformation-susceptible' THEN 1 END),
  avg_engagement_score: avg(v.engagement_score),
  avg_risk_score: avg(v.risk_score)
}
```

**Expected result**: 1 row with aggregates
**Execution time**: < 20ms

### Query Pattern 2: Segment-based Delivery

```cypher
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth)
WHERE b.constituency_id = 'CONST_001'
  AND v.engagement_level = 'High'
  AND v.political_leaning = 'Undecided'
  AND v.language_preference IN ['Hindi', 'Hinglish']
RETURN v.voter_id, v.name, v.mobile_number, v.language_preference
```

**Expected result**: ~15-20 rows
**Execution time**: < 50ms
**Use case**: Campaign targeting

### Query Pattern 3: Scheme Beneficiaries

```cypher
MATCH (v:Voter)-[:ELIGIBLE_FOR]->(s:Scheme {scheme_id: 'SCHEME_PM-KISAN'})
WHERE v.booth_id = 'BOOTH_001'
RETURN v.voter_id, v.name, v.scheme_beneficiary_status, v.language_preference
```

**Expected result**: ~5-7 rows
**Execution time**: < 30ms
**Use case**: Scheme-specific messaging

### Query Pattern 4: First-time Voter Outreach

```cypher
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth)-[:IN_CONSTITUENCY]->(c:Constituency)
WHERE v.political_leaning = 'First-time'
  AND v.engagement_level IN ['Low', 'Medium']
RETURN c.constituency_id, COUNT(v) as count
GROUP BY c.constituency_id
```

**Expected result**: 2 rows (one per constituency)
**Execution time**: < 40ms
**Use case**: Civic engagement planning

### Query Pattern 5: Risk Assessment

```cypher
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth)
WHERE v.risk_profile = 'Misinformation-susceptible'
  AND v.engagement_level IN ['Low', 'Unreachable']
RETURN b.booth_id, COUNT(v) as high_risk_voters
ORDER BY high_risk_voters DESC
```

**Expected result**: 5 rows (one per booth)
**Execution time**: < 30ms
**Use case**: Misinformation counter-strategy

---

## CATEGORIZATION LOGIC REFERENCE

### Political Leaning Distribution (100 voters)

```
Pro-incumbent:    25-27 voters (25-27%)
Anti-incumbent:   20-22 voters (20-22%)
Undecided:        40-42 voters (40-42%)
First-time:       12-15 voters (12-15%)
─────────────────────────────
TOTAL:           100 voters
```

### Engagement Level Scoring

```
High:       engagement_score > 0.7  (~45 voters)
           └─ Active social media, high voting history

Medium:     engagement_score 0.4-0.7 (~35 voters)
           └─ Occasional participation

Low:        engagement_score < 0.4   (~15 voters)
           └─ Minimal participation

Unreachable: engagement_score = 0.0   (~5 voters)
           └─ No contact attempts successful
```

### Risk Profile Assessment

```
Informed:                    30-35 voters
├─ education_level: Graduate+
├─ language_preference: English
└─ risk_score: 0.1-0.3

Neutral:                     50-55 voters
├─ Mixed demographics
└─ risk_score: 0.3-0.5

Misinformation-susceptible:  12-15 voters
├─ education_level: Primary/Secondary
├─ engagement_level: Low/Unreachable
└─ risk_score: 0.6-0.9
```

### Age Group Distribution

```
18-25 (Youth):        ~15 voters
26-40 (Working):      ~40 voters ◄── LARGEST
41-60 (Middle):       ~35 voters
60+ (Senior):         ~10 voters
```

---

## SCHEMA DESIGN PRINCIPLES

### 1. Denormalization for Performance

- Store `booth_id`, `constituency_id` on Voter node directly
- Avoids multiple hops for common queries
- Trade: Redundancy vs. Query speed (chose speed)

### 2. Scorification for AI/ML

- Every voter has numeric scores (0.0-1.0)
- Enables rapid sorting and filtering
- Ready for machine learning models

### 3. Multilingual Foundation

- Every voter has `language_preference`
- Supports 5+ Indian language groups
- Ready for Phase 4 (Delivery Engine)

### 4. Extensibility

- `government_scheme_eligibility[]` is an array
- Easily add new schemes without ALTER TABLE
- Documents can store additional nested data

### 5. Temporal Tracking

- `created_at`, `updated_at`, `last_sentiment_update`
- Enables audit trail and trend analysis
- Tracks categorization recency

---

## DATA MODEL CONSTRAINTS

### Uniqueness Constraints (8 total)

```javascript
VOTER.voter_id; // No duplicate voters
BOOTH.booth_id; // No duplicate booths
CONSTITUENCY.const_id; // No duplicate constituencies
DISTRICT.district_id; // No duplicate districts
STATE.state_id; // No duplicate states
SCHEME.scheme_id; // No duplicate schemes
HOUSEHOLD.household_id; // No duplicate households
VOTING_HISTORY.hist_id; // No duplicate history records
```

### Cardinality Rules

```
1 State       → 36+ Districts (Maharashtra pattern)
1 District    → 2+ Constituencies
1 Constituency → 3+ Booths
1 Booth       → 20-50+ Voters (seeded with 20 each)
1 Voter       → 1-5 Schemes
1 Voter       → 3-8 Family members (in Household)
1 Voter       → 1+ Voting histories (one per election)
```

---

## REAL-TIME UPDATE PATTERNS

### When Sentiment Signal Arrives (Phase 3)

```
1. Sentiment analysis → Pro/Anti/Neutral/Mixed
2. Update voter.political_leaning (if different)
3. Recalculate voter.risk_score based on:
   - Education level
   - Engagement history
   - Social media activity
   - Misinformation exposure
4. Update voter.engagement_score
5. Update voter.last_sentiment_update = NOW()
6. Categorization Engine re-runs logic
7. Result: Voter node updated in Neo4j
```

### When Message Delivered (Phase 4)

```
1. WhatsApp/SMS API → Confirmation
2. Create DELIVERY log node (optional)
3. Update on :ELIGIBLE_FOR edge:
   └─ {enrolled: true, benefit_received: 5000}
4. Update voter.scheme_beneficiary_status
5. Trigger re-engagement scoring
```

### When New Voter Added (Phase 5)

```
1. CSV upload → Fuzzy deduplication
2. Create new VOTER node
3. Create :VOTES_AT → BOOTH edge
4. Create :BELONGS_TO_CONSTITUENCY → CONST edge
5. Enrich with scheme databases
6. Run Categorization Engine on new voter
7. Create :ELIGIBLE_FOR edges
8. Update Booth.total_registered_voters ++
```

---

## PERFORMANCE TARGETS (WITH INDEXES)

| Query Type             | Data Size | Expected Time | Index Used          |
| ---------------------- | --------- | ------------- | ------------------- |
| Single voter lookup    | 1         | < 1ms         | voter_id            |
| Voters in booth        | 20        | < 10ms        | booth_id            |
| Voters by leaning      | ~25       | < 20ms        | political_leaning   |
| Voters by language     | ~40       | < 15ms        | language_preference |
| Voters by engagement   | ~45       | < 25ms        | engagement_level    |
| Scheme beneficiaries   | ~30       | < 30ms        | scheme_id           |
| Full constituency scan | 60        | < 100ms       | constituency_id     |
| Full graph traversal   | 100       | < 200ms       | -                   |

---

## SCALING ROADMAP

### Current (Seeded)

- **Voters**: 100
- **Graph size**: ~3 MB
- **Query latency**: 1-200ms
- **Throughput**: ~1000 queries/sec

### Phase 3-4 (Interactive)

- **Voters**: 1,000-10,000
- **Graph size**: 30-300 MB
- **Query latency**: 5-500ms
- **Throughput**: ~500 queries/sec

### Production (Full Scale)

- **Voters**: 1,000,000+
- **Graph size**: 3-30 GB
- **Clustering**: Multi-node Neo4j cluster
- **Query latency**: 50-1000ms (depends on complexity)
- **Throughput**: ~10,000+ queries/sec with clustering

---

## FILE CROSS-REFERENCES

| Question                           | Find In                                |
| ---------------------------------- | -------------------------------------- |
| How to execute Cypher?             | neo4j-setup-guide.md (Execution Steps) |
| What's the complete Cypher script? | neo4j-seed-data.cypher                 |
| What node properties are there?    | neo4j-schema-design.md (Section 1)     |
| What queries should I run?         | neo4j-schema-design.md (Section 4)     |
| How to verify success?             | neo4j-setup-guide.md (Step 4)          |
| What's next after this?            | neo4j-execution-summary.md (Roadmap)   |
| How do relationships work?         | This file (Relationship Summary Table) |
| How to scale to 1M voters?         | This file (Scaling Roadmap)            |

---

## QUICK COMMAND REFERENCE

```cypher
-- Count all voters
MATCH (v:Voter) RETURN COUNT(v);

-- Get voter by ID
MATCH (v:Voter {voter_id: 'VOTER_001'}) RETURN v;

-- Get booth statistics
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth {booth_id: 'BOOTH_001'})
RETURN COUNT(v) as total_voters;

-- Find high-engagement voters
MATCH (v:Voter)
WHERE v.engagement_level = 'High'
RETURN v.voter_id, v.name, v.mobile_number;

-- Get voters by political leaning
MATCH (v:Voter)
WHERE v.political_leaning = 'Undecided'
RETURN COUNT(v) as undecided_count;

-- Find first-time voters at risk
MATCH (v:Voter)
WHERE v.political_leaning = 'First-time'
  AND v.risk_score > 0.6
RETURN v.voter_id, v.name, v.risk_score;

-- Drop all data (WARNING: destructive)
MATCH (n) DETACH DELETE n;

-- Check all indexes
CALL db.indexes() YIELD name, state;

-- Check constraints
CALL db.constraints() YIELD name;
```

---

**This quick reference card complements the full documentation. Keep it handy during queries!**
