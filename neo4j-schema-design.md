# Neo4j Knowledge Graph Schema Design

## AI-Driven Booth Management System

---

## 1. NODE TYPES & PROPERTIES

### 1.1 **VOTER**

```
{
  voter_id: String (unique),
  name: String,
  age: Integer,
  gender: String (M/F/Other),
  caste_category: String (General/OBC/SC/ST),
  religion: String,
  education_level: String (Illiterate/Primary/Secondary/Graduate/Postgraduate),
  occupation: String,
  income_bracket: String (0-3L/3-6L/6-10L/10L+),
  language_preference: String (English/Hindi/Hinglish/Regional),
  booth_id: String,
  constituency_id: String,
  district: String,
  state: String,
  mobile_number: String,
  has_aadhaar: Boolean,
  government_scheme_eligibility: [String] (array of scheme_ids),

  # Categorization Engine Fields (updated in real-time)
  political_leaning: String (Pro-incumbent/Anti-incumbent/Undecided/First-time),
  scheme_beneficiary_status: String (Active/Eligible-not-enrolled/Not-eligible),
  engagement_level: String (High/Medium/Low/Unreachable),
  risk_profile: String (Misinformation-susceptible/Neutral/Informed),
  age_group: String (18-25/26-40/41-60/60+),

  # Metadata
  created_at: DateTime,
  updated_at: DateTime,
  last_sentiment_update: DateTime,
  risk_score: Float (0.0-1.0),
  engagement_score: Float (0.0-1.0)
}
```

### 1.2 **BOOTH**

```
{
  booth_id: String (unique),
  name: String,
  constituency_id: String,
  address: String,
  latitude: Float,
  longitude: Float,
  polling_officers: Integer,
  accessibility_features: [String],
  total_registered_voters: Integer,

  created_at: DateTime,
  updated_at: DateTime
}
```

### 1.3 **CONSTITUENCY**

```
{
  constituency_id: String (unique),
  name: String,
  state: String,
  district: String,
  total_booths: Integer,
  total_voters: Integer,

  created_at: DateTime
}
```

### 1.4 **DISTRICT**

```
{
  district_id: String (unique),
  name: String,
  state: String,
  total_constituencies: Integer,
  total_booths: Integer,

  created_at: DateTime
}
```

### 1.5 **STATE**

```
{
  state_id: String (unique),
  name: String,
  total_districts: Integer,

  created_at: DateTime
}
```

### 1.6 **SCHEME** (Government Schemes)

```
{
  scheme_id: String (unique),
  name: String,
  description: String,
  scheme_type: String (PM-KISAN/Ayushman-Bharat/PMAY/Other),
  eligibility_criteria: String,
  annual_benefit: Float,

  created_at: DateTime
}
```

### 1.7 **HOUSEHOLD**

```
{
  household_id: String (unique),
  primary_voter_id: String,
  address: String,
  booth_id: String,
  total_members: Integer,

  created_at: DateTime
}
```

### 1.8 **VOTING_HISTORY**

```
{
  history_id: String (unique),
  voter_id: String,
  election_year: Integer,
  constituency_id: String,
  booth_id: String,
  voted: Boolean,

  created_at: DateTime
}
```

---

## 2. RELATIONSHIP TYPES

| From         | To             | Relationship              | Properties                                   |
| ------------ | -------------- | ------------------------- | -------------------------------------------- |
| VOTER        | BOOTH          | `VOTES_AT`                | `registered_year`                            |
| VOTER        | CONSTITUENCY   | `BELONGS_TO_CONSTITUENCY` | none                                         |
| VOTER        | SCHEME         | `ELIGIBLE_FOR`            | `enrolled: Boolean, benefit_received: Float` |
| VOTER        | HOUSEHOLD      | `MEMBER_OF`               | `relationship: String`                       |
| VOTER        | VOTING_HISTORY | `HAS_HISTORY`             | none                                         |
| HOUSEHOLD    | VOTER          | `HAS_MEMBER`              | `relationship: String`                       |
| BOOTH        | CONSTITUENCY   | `IN_CONSTITUENCY`         | none                                         |
| CONSTITUENCY | DISTRICT       | `IN_DISTRICT`             | none                                         |
| DISTRICT     | STATE          | `IN_STATE`                | none                                         |
| BOOTH        | SCHEME         | `SERVES_SCHEME`           | `beneficiary_count: Integer`                 |

---

## 3. INDEXES (for query optimization)

```
Index on VOTER(voter_id) - PRIMARY KEY
Index on VOTER(booth_id) - for booth queries
Index on VOTER(constituency_id) - for constituency queries
Index on VOTER(mobile_number) - for delivery engine
Index on VOTER(language_preference) - for segmentation
Index on BOOTH(booth_id) - PRIMARY KEY
Index on BOOTH(constituency_id) - for spatial queries
Index on CONSTITUENCY(constituency_id) - PRIMARY KEY
Index on CONSTITUENCY(state) - for state-level queries
Index on DISTRICT(district_id) - PRIMARY KEY
Index on STATE(state_id) - PRIMARY KEY
Index on SCHEME(scheme_id) - PRIMARY KEY
Index on VOTING_HISTORY(voter_id) - for history lookups
```

---

## 4. SAMPLE QUERY PATTERNS

### Pattern 1: Get all voters in a booth with segmentation

```
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth {booth_id: 'BOOTH_001'})
RETURN v.voter_id, v.name, v.political_leaning, v.engagement_level
```

### Pattern 2: Find voters eligible for a specific scheme

```
MATCH (v:Voter)-[:ELIGIBLE_FOR]->(s:Scheme {scheme_id: 'PM-KISAN'})
RETURN v.voter_id, v.name, v.mobile_number, v.language_preference
```

### Pattern 3: Get household members of a voter

```
MATCH (v1:Voter {voter_id: 'VOTER_001'})-[:MEMBER_OF]->(h:Household)
MATCH (h)<-[:MEMBER_OF]-(v2:Voter)
RETURN v2.voter_id, v2.name, v2.age, v2.relationship_to_primary
```

### Pattern 4: Cluster voters by political leaning in a constituency

```
MATCH (v:Voter)-[:BELONGS_TO_CONSTITUENCY]->(c:Constituency {constituency_id: 'CONST_001'})
RETURN v.political_leaning, COUNT(v) as count
GROUP BY v.political_leaning
```

---

## 5. SCHEMA CONSTRAINTS

- **Uniqueness**: voter_id, booth_id, constituency_id, district_id, state_id, scheme_id, household_id, history_id
- **Required Fields**: voter_id, name, age, gender, booth_id, constituency_id, mobile_number
- **Data Validation**:
  - age: 18-120
  - language_preference: must be in (English, Hindi, Hinglish, Regional)
  - risk_score, engagement_score: 0.0-1.0
