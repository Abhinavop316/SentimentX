/**
 * GraphQL Schema for SentimentX Knowledge Graph
 *
 * Types:
 * - Voter: Individual voter with categorization
 * - Booth: Polling booth
 * - Constituency: Electoral constituency
 * - District: Administrative district
 * - State: State/Province
 * - Scheme: Government benefits scheme
 * - BoothStats: Aggregated booth-level statistics
 *
 * @module schema
 */

export const typeDefs = `
  # ==================== SCALAR TYPES ====================
  scalar DateTime
  scalar Int64

  # ==================== VOTER DOMAIN ====================

  """
  Individual voter node with full demographic and categorization data
  """
  type Voter {
    # Basic Identity
    voter_id: String!
    name: String!
    age: Int!
    gender: String! # M/F/Other
    # Demographics
    caste_category: String! # General/OBC/SC/ST
    religion: String
    education_level: String! # Illiterate/Primary/Secondary/Graduate/Postgraduate
    occupation: String
    income_bracket: String! # 0-3L/3-6L/6-10L/10L+
    # Contact & Location
    mobile_number: String!
    language_preference: String! # English/Hindi/Hinglish/Regional
    booth_id: String!
    constituency_id: String!
    district: String!
    state: String!

    # Government & Identity
    has_aadhaar: Boolean!
    government_scheme_eligibility: [String!]!

    # AI Categorization Fields (Real-time Updated)
    political_leaning: String! # Pro-incumbent/Anti-incumbent/Undecided/First-time
    scheme_beneficiary_status: String! # Active/Eligible-not-enrolled/Not-eligible
    engagement_level: String! # High/Medium/Low/Unreachable
    risk_profile: String! # Misinformation-susceptible/Neutral/Informed
    age_group: String! # 18-25/26-40/41-60/60+
    # Scoring (0.0 - 1.0)
    risk_score: Float!
    engagement_score: Float!

    # Metadata
    created_at: DateTime!
    updated_at: DateTime!
    last_sentiment_update: DateTime

    # Related Data (Lazy-loaded)
    booth: Booth
    constituency: Constituency
    eligible_schemes: [Scheme!]!
  }

  """
  Polling booth with location and accessibility info
  """
  type Booth {
    booth_id: String!
    name: String!
    constituency_id: String!
    address: String!
    latitude: Float!
    longitude: Float!
    polling_officers: Int!
    accessibility_features: [String!]!
    total_registered_voters: Int!
    created_at: DateTime!
    updated_at: DateTime!

    # Related Data
    constituency: Constituency
    voters: [Voter!]!
    statistics: BoothStats!
  }

  """
  Booth-level aggregated statistics
  """
  type BoothStats {
    booth_id: String!
    total_voters: Int!
    pro_incumbent_count: Int!
    anti_incumbent_count: Int!
    undecided_count: Int!
    first_time_count: Int!
    high_engagement_count: Int!
    medium_engagement_count: Int!
    low_engagement_count: Int!
    avg_risk_score: Float!
    avg_engagement_score: Float!
    misinformation_susceptible_count: Int!
    informed_count: Int!
    neutral_count: Int!
  }

  """
  Electoral constituency
  """
  type Constituency {
    constituency_id: String!
    name: String!
    state: String!
    district: String!
    total_booths: Int!
    total_voters: Int!
    created_at: DateTime!

    # Related Data
    booths: [Booth!]!
    voters: [Voter!]!
  }

  """
  Administrative district
  """
  type District {
    district_id: String!
    name: String!
    state: String!
    total_constituencies: Int!
    total_booths: Int!
    created_at: DateTime!

    # Related Data
    constituencies: [Constituency!]!
  }

  """
  State/Province
  """
  type State {
    state_id: String!
    name: String!
    total_districts: Int!
    created_at: DateTime!

    # Related Data
    districts: [District!]!
  }

  """
  Government benefits scheme
  """
  type Scheme {
    scheme_id: String!
    name: String!
    description: String!
    scheme_type: String! # PM-KISAN/Ayushman-Bharat/PMAY/DBT/Other
    eligibility_criteria: String!
    annual_benefit: Float!
    created_at: DateTime!
  }

  # ==================== FILTER & PAGINATION ====================

  """
  Pagination cursor-based input
  """
  input PaginationInput {
    first: Int # Fetch first N records
    after: String # Cursor for pagination
    last: Int # Fetch last N records
    before: String # Cursor for pagination
  }

  """
  Voter filter criteria
  """
  input VoterFilterInput {
    booth_id: String
    constituency_id: String
    district: String
    state: String
    political_leaning: String
    engagement_level: String
    risk_profile: String
    age_group: String
    language_preference: String
    scheme_id: String
    min_risk_score: Float
    max_risk_score: Float
    has_aadhaar: Boolean
  }

  """
  Query sorting options
  """
  enum SortOrder {
    ASC
    DESC
  }

  enum VoterSortField {
    name
    age
    risk_score
    engagement_score
    created_at
  }

  input VoterSortInput {
    field: VoterSortField!
    order: SortOrder!
  }

  # ==================== RESPONSE TYPES ====================

  """
  Paginated voter results
  """
  type VoterConnection {
    edges: [VoterEdge!]!
    pageInfo: PageInfo!
    total_count: Int!
  }

  type VoterEdge {
    node: Voter!
    cursor: String!
  }

  type PageInfo {
    has_next_page: Boolean!
    has_previous_page: Boolean!
    start_cursor: String
    end_cursor: String
  }

  """
  Segmentation statistics
  """
  type SegmentationStats {
    by_political_leaning: [CategoryCount!]!
    by_engagement_level: [CategoryCount!]!
    by_risk_profile: [CategoryCount!]!
    by_age_group: [CategoryCount!]!
    by_language: [CategoryCount!]!
  }

  type CategoryCount {
    category: String!
    count: Int!
    percentage: Float!
  }

  # ==================== QUERY ====================

  type Query {
    # ---- Voter Queries ----
    """
    Get single voter by ID with all relationships
    """
    voter(voter_id: String!): Voter

    """
    Get all voters with optional filters, sorting, and pagination
    """
    voters(
      filter: VoterFilterInput
      sort: VoterSortInput
      pagination: PaginationInput
    ): VoterConnection!

    """
    Get voters by booth with statistics
    """
    votersByBooth(
      booth_id: String!
      pagination: PaginationInput
    ): VoterConnection!

    """
    Get voters by constituency with statistics
    """
    votersByConstituency(
      constituency_id: String!
      pagination: PaginationInput
    ): VoterConnection!

    """
    Get voters eligible for a specific scheme
    """
    votersEligibleForScheme(
      scheme_id: String!
      booth_id: String
      constituency_id: String
      pagination: PaginationInput
    ): VoterConnection!

    """
    Search voters by name (full-text style)
    """
    searchVoters(query: String!, pagination: PaginationInput): VoterConnection!

    """
    Get high-risk voters for misinformation counter-strategies
    """
    highRiskVoters(
      booth_id: String
      constituency_id: String
      min_risk_score: Float
      pagination: PaginationInput
    ): VoterConnection!

    # ---- Booth Queries ----
    """
    Get single booth with all details
    """
    booth(booth_id: String!): Booth

    """
    Get all booths in a constituency
    """
    boothsByConstituency(constituency_id: String!): [Booth!]!

    """
    Get booth-level statistics and aggregates
    """
    boothStats(booth_id: String!): BoothStats!

    """
    Get all booths (for dashboard overview)
    """
    allBooths: [Booth!]!

    # ---- Constituency Queries ----
    """
    Get single constituency
    """
    constituency(constituency_id: String!): Constituency

    """
    Get all constituencies
    """
    allConstituencies: [Constituency!]!

    # ---- Scheme Queries ----
    """
    Get all government schemes
    """
    schemes: [Scheme!]!

    """
    Get single scheme details
    """
    scheme(scheme_id: String!): Scheme

    """
    Get beneficiary count for each scheme per booth
    """
    schemeBeneficiaryStats(booth_id: String!): [SchemeBeneficiaryStat!]!

    # ---- Analytics & Segmentation ----
    """
    Get voter segmentation statistics across filters
    """
    segmentationStats(
      booth_id: String
      constituency_id: String
      district: String
    ): SegmentationStats!

    """
    Get count of voters by political leaning
    """
    votersByPoliticalLeaning(
      booth_id: String
      constituency_id: String
    ): [CategoryCount!]!

    """
    Get count of voters by engagement level
    """
    votersByEngagement(
      booth_id: String
      constituency_id: String
    ): [CategoryCount!]!

    # ---- Geographic ----
    """
    Get state information
    """
    state(state_id: String!): State

    """
    Get all states
    """
    allStates: [State!]!

    """
    Get district information
    """
    district(district_id: String!): District

    # ---- Health Checks ----
    """
    Neo4j connection status
    """
    health: HealthStatus!
  }

  type SchemeBeneficiaryStat {
    scheme_id: String!
    scheme_name: String!
    beneficiary_count: Int!
  }

  type HealthStatus {
    status: String!
    database: String!
    timestamp: DateTime!
  }

  # ==================== MUTATION (FOR FUTURE PHASES) ====================

  type Mutation {
    """
    Placeholder for future mutation support
    (Authentication, categorization updates, etc.)
    """
    placeholder: String
  }

  # ==================== SUBSCRIPTION (FOR REAL-TIME) ====================

  type Subscription {
    """
    Placeholder for real-time updates
    (Voter categorization changes, delivery status, etc.)
    """
    placeholder: String
  }
`;
