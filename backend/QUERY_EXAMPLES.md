# SentimentX GraphQL API - Query Examples

Complete collection of GraphQL query examples with expected responses and use cases.

## Quick Reference

| Query                      | Use Case                             | Pagination         |
| -------------------------- | ------------------------------------ | ------------------ |
| `voter`                    | Fetch single voter details           | N/A                |
| `voters`                   | List all voters with filters/sorting | Cursor-based       |
| `votersByBooth`            | Get voters in a specific booth       | Cursor-based       |
| `votersByConstituency`     | Get voters in a constituency         | Cursor-based       |
| `votersEligibleForScheme`  | Target scheme beneficiaries          | Cursor-based       |
| `searchVoters`             | Search by name (regex)               | Cursor-based       |
| `highRiskVoters`           | Find high-risk voters                | Cursor-based       |
| `booth`                    | Get single booth                     | N/A                |
| `allBooths`                | List all booths                      | Regular pagination |
| `boothStats`               | Aggregate booth statistics           | N/A                |
| `boothsByConstituency`     | Get booths in constituency           | Regular pagination |
| `constituency`             | Single constituency                  | N/A                |
| `allConstituencies`        | List all constituencies              | Regular pagination |
| `schemes`                  | List all schemes                     | Regular pagination |
| `scheme`                   | Single scheme                        | N/A                |
| `schemeBeneficiaryStats`   | Scheme beneficiary count             | N/A                |
| `votersEligibleForScheme`  | Scheme targeting                     | Cursor-based       |
| `segmentationStats`        | Voter segmentation analysis          | N/A                |
| `votersByPoliticalLeaning` | Political leaning breakdown          | N/A                |
| `votersByEngagement`       | Engagement level breakdown           | N/A                |
| `health`                   | API health check                     | N/A                |

---

## 1. Single Voter Queries

### 1.1 Get Single Voter All Details

```graphql
query GetVoterDetails {
  voter(voter_id: "VOTER_001") {
    voter_id
    name
    age
    gender
    address
    constituency_id
    booth_id
    mobile_number
    email
    language_preference
    political_leaning
    engagement_level
    risk_score
    risk_profile
    engagement_score
    misinformation_susceptibility
    campaign_contact_attempts
    last_contact_date
    created_at
    updated_at
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "voter": {
      "voter_id": "VOTER_001",
      "name": "Amit Kumar",
      "age": 35,
      "gender": "Male",
      "address": "123 Main Street, New Delhi",
      "constituency_id": "CONST_001",
      "booth_id": "BOOTH_001",
      "mobile_number": "9876543210",
      "email": "amit@example.com",
      "language_preference": "Hindi",
      "political_leaning": "pro-incumbent",
      "engagement_level": "high",
      "risk_score": 0.3,
      "risk_profile": "loyalist",
      "engagement_score": 0.85,
      "misinformation_susceptibility": 0.2,
      "campaign_contact_attempts": 3,
      "last_contact_date": "2024-01-10T14:30:00Z",
      "created_at": "2024-01-01T08:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## 2. Voter List Queries

### 2.1 Get Paginated Voters (First 10)

```graphql
query GetFirstVoters {
  voters(pagination: { first: 10 }) {
    edges {
      node {
        voter_id
        name
        age
        political_leaning
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

**Expected Response:**

```json
{
  "data": {
    "voters": {
      "edges": [
        {
          "node": {
            "voter_id": "VOTER_001",
            "name": "Amit Kumar",
            "age": 35,
            "political_leaning": "pro-incumbent",
            "engagement_level": "high"
          },
          "cursor": "Vk9URVJfMDAx"
        },
        {
          "node": {
            "voter_id": "VOTER_002",
            "name": "Priya Singh",
            "age": 28,
            "political_leaning": "undecided",
            "engagement_level": "medium"
          },
          "cursor": "Vk9URVJfMDAy"
        }
        // ... 8 more voters
      ],
      "pageInfo": {
        "has_next_page": true,
        "end_cursor": "Vk9URVJfMDEw"
      },
      "total_count": 100
    }
  }
}
```

### 2.2 Get Next Page Using Cursor

```graphql
query GetNextPage {
  voters(pagination: { first: 10, after: "Vk9URVJfMDEw" }) {
    edges {
      node {
        voter_id
        name
      }
      cursor
    }
    pageInfo {
      has_next_page
      end_cursor
    }
  }
}
```

### 2.3 Filter Voters by Political Leaning

```graphql
query GetProIncumbentVoters {
  voters(
    filter: { political_leaning: "pro-incumbent" }
    pagination: { first: 20 }
  ) {
    edges {
      node {
        voter_id
        name
        age
        engagement_level
        risk_score
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

**Use Case**: Identify supporters for positive messaging campaigns

### 2.4 Filter by Engagement Level

```graphql
query GetHighEngagementVoters {
  voters(filter: { engagement_level: "high" }, pagination: { first: 15 }) {
    edges {
      node {
        voter_id
        name
        mobile_number
        language_preference
      }
    }
    total_count
  }
}
```

**Use Case**: Find voters for active participatory programs

### 2.5 Complex Multi-Filter Query

```graphql
query GetTargetAudience {
  voters(
    filter: {
      booth_id: "BOOTH_001"
      political_leaning: "undecided"
      engagement_level: "medium"
      risk_score_min: 0.4
      risk_score_max: 0.7
    }
    sort: { field: "risk_score", order: "DESC" }
    pagination: { first: 50 }
  ) {
    edges {
      node {
        voter_id
        name
        mobile_number
        political_leaning
        risk_score
        campaign_contact_attempts
      }
    }
    total_count
  }
}
```

**Use Case**: Target persuadable voters with moderate risk profiles

### 2.6 Sort Voters by Risk Score

```graphql
query GetVotersSortedByRisk {
  voters(
    sort: { field: "risk_score", order: "DESC" }
    pagination: { first: 20 }
  ) {
    edges {
      node {
        voter_id
        name
        risk_score
        risk_profile
      }
    }
  }
}
```

---

## 3. Booth-Level Queries

### 3.1 Get Booth Statistics

```graphql
query GetBoothAnalytics {
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

**Expected Response:**

```json
{
  "data": {
    "boothStats": {
      "booth_id": "BOOTH_001",
      "total_voters": 20,
      "pro_incumbent_count": 8,
      "anti_incumbent_count": 5,
      "undecided_count": 7,
      "first_time_count": 2,
      "high_engagement_count": 10,
      "avg_risk_score": 0.42,
      "avg_engagement_score": 0.68,
      "misinformation_susceptible_count": 6
    }
  }
}
```

**Use Case**: Quick booth-level intelligence for campaign planning

### 3.2 Get All Booths with Constituencies

```graphql
query GetAllBooth {
  allBooths {
    booth_id
    name
    address
    constituency_id
    total_registered_voters
  }
}
```

### 3.3 Get Voters in a Booth

```graphql
query GetBoothVoters {
  votersByBooth(booth_id: "BOOTH_001", pagination: { first: 50 }) {
    edges {
      node {
        voter_id
        name
        age
        political_leaning
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

**Use Case**: Get all voters in a polling location for targeted outreach

---

## 4. Geographic Queries

### 4.1 Get All Constituencies

```graphql
query GetConstituencies {
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

### 4.2 Get Specific Constituency

```graphql
query GetConstituencyDetails {
  constituency(constituency_id: "CONST_001") {
    constituency_id
    name
    state
    district
    total_booths
    total_voters
  }
}
```

### 4.3 Get Voters in Constituency

```graphql
query GetConstituencyVoters {
  votersByConstituency(
    constituency_id: "CONST_001"
    pagination: { first: 30 }
  ) {
    edges {
      node {
        voter_id
        name
        age
        booth_id
      }
    }
    total_count
  }
}
```

**Use Case**: Geo-based targeting at constituency level

---

## 5. High-Risk Voter Queries

### 5.1 Find High-Risk Voters

```graphql
query GetHighRiskVoters {
  highRiskVoters(booth_id: "BOOTH_001", min_risk_score: 0.6) {
    edges {
      node {
        voter_id
        name
        risk_score
        risk_profile
        misinformation_susceptibility
        political_leaning
      }
    }
    total_count
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "highRiskVoters": {
      "edges": [
        {
          "node": {
            "voter_id": "VOTER_045",
            "name": "Rajesh Verma",
            "risk_score": 0.72,
            "risk_profile": "misinformation-prone",
            "misinformation_susceptibility": 0.85,
            "political_leaning": "anti-incumbent"
          }
        }
      ],
      "total_count": 3
    }
  }
}
```

**Use Case**: Identify voters for counter-misinformation campaigns

---

## 6. Search Queries

### 6.1 Search Voters by Name

```graphql
query SearchByName {
  searchVoters(query: "kumar", pagination: { first: 20 }) {
    edges {
      node {
        voter_id
        name
        mobile_number
        booth_id
      }
    }
    total_count
  }
}
```

**Use Case**: Quickly find specific voter records

### 6.2 Case-Insensitive Search

```graphql
query SearchCaseInsensitive {
  searchVoters(
    query: "AMIT" # Search for 'Amit'
    pagination: { first: 10 }
  ) {
    edges {
      node {
        voter_id
        name
      }
    }
  }
}
```

---

## 7. Scheme & Eligibility Queries

### 7.1 Get All Schemes

```graphql
query GetSchemes {
  schemes {
    scheme_id
    scheme_name
    scheme_type
    annual_benefit
    eligibility_criteria
  }
}
```

### 7.2 Get Voters Eligible for Scheme

```graphql
query GetSchemeEligibleVoters {
  votersEligibleForScheme(
    scheme_id: "SCHEME_PM-KISAN"
    booth_id: "BOOTH_001"
    pagination: { first: 30 }
  ) {
    edges {
      node {
        voter_id
        name
        age
        mobile_number
        language_preference
        address
      }
    }
    total_count
  }
}
```

**Use Case**: Target scheme beneficiaries for governance update delivery

### 7.3 Get Scheme Beneficiary Statistics

```graphql
query GetSchemeBeneficiaryStats {
  schemeBeneficiaryStats(booth_id: "BOOTH_001") {
    scheme_id
    scheme_name
    beneficiary_count
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "schemeBeneficiaryStats": [
      {
        "scheme_id": "SCHEME_PM-KISAN",
        "scheme_name": "PM-KISAN (Farmer Support)",
        "beneficiary_count": 12
      },
      {
        "scheme_id": "SCHEME_UJJWALA",
        "scheme_name": "Ujjwala (LPG Initiative)",
        "beneficiary_count": 18
      }
    ]
  }
}
```

---

## 8. Segmentation & Analytics Queries

### 8.1 Get Voter Segmentation by Multiple Dimensions

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

**Expected Response:**

```json
{
  "data": {
    "segmentationStats": {
      "by_political_leaning": [
        {
          "category": "pro-incumbent",
          "count": 8,
          "percentage": 40
        },
        {
          "category": "anti-incumbent",
          "count": 5,
          "percentage": 25
        },
        {
          "category": "undecided",
          "count": 7,
          "percentage": 35
        }
      ],
      "by_engagement_level": [
        {
          "category": "high",
          "count": 10,
          "percentage": 50
        },
        {
          "category": "medium",
          "count": 7,
          "percentage": 35
        },
        {
          "category": "low",
          "count": 3,
          "percentage": 15
        }
      ],
      "by_age_group": [
        {
          "category": "18-30",
          "count": 6,
          "percentage": 30
        },
        {
          "category": "31-50",
          "count": 10,
          "percentage": 50
        },
        {
          "category": "51+",
          "count": 4,
          "percentage": 20
        }
      ]
    }
  }
}
```

**Use Case**: Multi-dimensional voter segmentation for targeted messaging

### 8.2 Get Political Leaning Distribution

```graphql
query GetPoliticalLeaning {
  votersByPoliticalLeaning(booth_id: "BOOTH_001") {
    pro_incumbent {
      count
      percentage
    }
    anti_incumbent {
      count
      percentage
    }
    undecided {
      count
      percentage
    }
  }
}
```

### 8.3 Get Engagement Distribution

```graphql
query GetEngagementBreakdown {
  votersByEngagement(booth_id: "BOOTH_001") {
    high {
      count
      percentage
    }
    medium {
      count
      percentage
    }
    low {
      count
      percentage
    }
  }
}
```

---

## 9. Health & Monitoring Queries

### 9.1 Check API Health

```graphql
query CheckHealth {
  health {
    status
    database
    timestamp
  }
}
```

**Expected Response:**

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

---

## 10. Advanced Combined Queries

### 10.1 Comprehensive Booth Report

```graphql
query ComprehensiveBoothReport {
  boothStats(booth_id: "BOOTH_001") {
    booth_id
    total_voters
    pro_incumbent_count
    anti_incumbent_count
    avg_risk_score
  }
  segmentationStats(booth_id: "BOOTH_001") {
    by_political_leaning {
      category
      count
    }
    by_engagement_level {
      category
      count
    }
  }
  highRiskVoters(booth_id: "BOOTH_001", min_risk_score: 0.6) {
    total_count
    edges {
      node {
        voter_id
        name
        risk_score
      }
    }
  }
}
```

### 10.2 Campaign Targeting Query

```graphql
query CampaignTargeting {
  # Get undecided persuadable voters
  voters(
    filter: {
      booth_id: "BOOTH_001"
      political_leaning: "undecided"
      engagement_level: "medium"
    }
    pagination: { first: 20 }
  ) {
    edges {
      node {
        voter_id
        name
        mobile_number
        language_preference
        age
        engagement_level
      }
    }
  }
  # Get scheme beneficiaries in same booth
  votersEligibleForScheme(booth_id: "BOOTH_001", scheme_id: "SCHEME_PM-KISAN") {
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

---

## Error Handling Examples

### Query with Invalid Voter ID

```graphql
query InvalidVoter {
  voter(voter_id: "INVALID_ID") {
    voter_id
    name
  }
}
```

**Response:**

```json
{
  "data": {
    "voter": null
  }
}
```

### Query with Invalid Filter

```graphql
query InvalidFilter {
  voters(filter: { political_leaning: "invalid_value" }) {
    edges {
      node {
        voter_id
      }
    }
  }
}
```

**Error Response:**

```json
{
  "errors": [
    {
      "message": "Invalid political_leaning value",
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED"
      }
    }
  ]
}
```

---

## Performance Tips

1. **Use pagination**: Always use `pagination` for large result sets
2. **Request only needed fields**: Reduces network payload
3. **Use filters**: Minimize data returned from database
4. **Cursor pagination**: More efficient than offset/limit
5. **Booth-level aggregation**: Much faster than constituency-level

## Next Steps

- Integrate queries into React frontend (Phase 6)
- Set up mutation resolvers for data updates (Phase 3)
- Implement caching for frequently accessed queries
- Monitor query performance with Neo4j logs
