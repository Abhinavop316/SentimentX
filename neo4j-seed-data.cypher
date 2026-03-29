// =====================================================
// NEO4J CYPHER QUERIES - SCHEMA SETUP & SEED DATA
// AI-Driven Booth Management System
// =====================================================

// STEP 1: DROP EXISTING CONSTRAINTS & DATA (Optional - comment out if first run)
// =====================================================
// MATCH (n) DETACH DELETE n;

// STEP 2: CREATE CONSTRAINTS
// =====================================================
CREATE CONSTRAINT voter_id_unique IF NOT EXISTS
FOR (v:Voter) REQUIRE v.voter_id IS UNIQUE;

CREATE CONSTRAINT booth_id_unique IF NOT EXISTS
FOR (b:Booth) REQUIRE b.booth_id IS UNIQUE;

CREATE CONSTRAINT constituency_id_unique IF NOT EXISTS
FOR (c:Constituency) REQUIRE c.constituency_id IS UNIQUE;

CREATE CONSTRAINT district_id_unique IF NOT EXISTS
FOR (d:District) REQUIRE d.district_id IS UNIQUE;

CREATE CONSTRAINT state_id_unique IF NOT EXISTS
FOR (s:State) REQUIRE s.state_id IS UNIQUE;

CREATE CONSTRAINT scheme_id_unique IF NOT EXISTS
FOR (sc:Scheme) REQUIRE sc.scheme_id IS UNIQUE;

CREATE CONSTRAINT household_id_unique IF NOT EXISTS
FOR (h:Household) REQUIRE h.household_id IS UNIQUE;

CREATE CONSTRAINT voting_history_id_unique IF NOT EXISTS
FOR (vh:VotingHistory) REQUIRE vh.history_id IS UNIQUE;

// STEP 3: CREATE INDEXES
// =====================================================
CREATE INDEX voter_booth_id IF NOT EXISTS
FOR (v:Voter) ON (v.booth_id);

CREATE INDEX voter_constituency_id IF NOT EXISTS
FOR (v:Voter) ON (v.constituency_id);

CREATE INDEX voter_mobile IF NOT EXISTS
FOR (v:Voter) ON (v.mobile_number);

CREATE INDEX voter_language IF NOT EXISTS
FOR (v:Voter) ON (v.language_preference);

CREATE INDEX voter_political_leaning IF NOT EXISTS
FOR (v:Voter) ON (v.political_leaning);

CREATE INDEX voter_engagement_level IF NOT EXISTS
FOR (v:Voter) ON (v.engagement_level);

CREATE INDEX booth_constituency_id IF NOT EXISTS
FOR (b:Booth) ON (b.constituency_id);

CREATE INDEX constituency_state IF NOT EXISTS
FOR (c:Constituency) ON (c.state);

CREATE INDEX voting_history_voter_id IF NOT EXISTS
FOR (vh:VotingHistory) ON (vh.voter_id);

// STEP 4: CREATE STATIC REFERENCE DATA
// =====================================================

// Create States (Maharashtra for demo)
CREATE (s:State {
  state_id: 'STATE_MH',
  name: 'Maharashtra',
  total_districts: 36,
  created_at: timestamp()
})
RETURN s;

// Create Districts
CREATE (d1:District {
  district_id: 'DIST_001',
  name: 'Pune',
  state: 'Maharashtra',
  total_constituencies: 2,
  total_booths: 5,
  created_at: timestamp()
})
WITH d1
CREATE (s:State {state_id: 'STATE_MH'})-[:IN_STATE]->(d1)
RETURN d1;

CREATE (d2:District {
  district_id: 'DIST_002',
  name: 'Mumbai',
  state: 'Maharashtra',
  total_constituencies: 2,
  total_booths: 5,
  created_at: timestamp()
})
WITH d2
MATCH (s:State {state_id: 'STATE_MH'})
CREATE (s)-[:IN_STATE]->(d2)
RETURN d2;

// Create Constituencies
CREATE (c1:Constituency {
  constituency_id: 'CONST_001',
  name: 'Pune Central',
  state: 'Maharashtra',
  district: 'Pune',
  total_booths: 3,
  total_voters: 60,
  created_at: timestamp()
})
WITH c1
MATCH (d:District {district_id: 'DIST_001'})
CREATE (d)-[:IN_DISTRICT]->(c1)
RETURN c1;

CREATE (c2:Constituency {
  constituency_id: 'CONST_002',
  name: 'Pune West',
  state: 'Maharashtra',
  district: 'Pune',
  total_booths: 2,
  total_voters: 40,
  created_at: timestamp()
})
WITH c2
MATCH (d:District {district_id: 'DIST_001'})
CREATE (d)-[:IN_DISTRICT]->(c2)
RETURN c2;

CREATE (c3:Constituency {
  constituency_id: 'CONST_003',
  name: 'Mumbai North',
  state: 'Maharashtra',
  district: 'Mumbai',
  total_booths: 3,
  total_voters: 0,
  created_at: timestamp()
})
WITH c3
MATCH (d:District {district_id: 'DIST_002'})
CREATE (d)-[:IN_DISTRICT]->(c3)
RETURN c3;

// Create Booths (5 booths across constituencies)
CREATE (b1:Booth {
  booth_id: 'BOOTH_001',
  name: 'Pune High School',
  constituency_id: 'CONST_001',
  address: '123 Main Road, Pune',
  latitude: 18.5204,
  longitude: 73.8567,
  polling_officers: 3,
  accessibility_features: ['Ramp', 'Wheelchair', 'Braille'],
  total_registered_voters: 20,
  created_at: timestamp(),
  updated_at: timestamp()
});

CREATE (b2:Booth {
  booth_id: 'BOOTH_002',
  name: 'Pune Library Center',
  constituency_id: 'CONST_001',
  address: '456 Library Lane, Pune',
  latitude: 18.5304,
  longitude: 73.8667,
  polling_officers: 3,
  accessibility_features: ['Ramp', 'Wheelchair'],
  total_registered_voters: 20,
  created_at: timestamp(),
  updated_at: timestamp()
});

CREATE (b3:Booth {
  booth_id: 'BOOTH_003',
  name: 'Pune Community Hall',
  constituency_id: 'CONST_001',
  address: '789 Community Street, Pune',
  latitude: 18.5404,
  longitude: 73.8767,
  polling_officers: 2,
  accessibility_features: ['Ramp'],
  total_registered_voters: 20,
  created_at: timestamp(),
  updated_at: timestamp()
});

CREATE (b4:Booth {
  booth_id: 'BOOTH_004',
  name: 'West Pune School',
  constituency_id: 'CONST_002',
  address: '321 West Avenue, Pune',
  latitude: 18.4804,
  longitude: 73.7867,
  polling_officers: 2,
  accessibility_features: ['Ramp'],
  total_registered_voters: 20,
  created_at: timestamp(),
  updated_at: timestamp()
});

CREATE (b5:Booth {
  booth_id: 'BOOTH_005',
  name: 'West Pune Community Center',
  constituency_id: 'CONST_002',
  address: '654 West Drive, Pune',
  latitude: 18.4704,
  longitude: 73.7767,
  polling_officers: 2,
  accessibility_features: ['Wheelchair'],
  total_registered_voters: 20,
  created_at: timestamp(),
  updated_at: timestamp()
});

// Link Booths to Constituencies
MATCH (b:Booth), (c:Constituency)
WHERE b.constituency_id = c.constituency_id
CREATE (b)-[:IN_CONSTITUENCY]->(c)
RETURN COUNT(*) as booths_linked;

// Create Government Schemes
CREATE (sch1:Scheme {
  scheme_id: 'SCHEME_PM-KISAN',
  name: 'PM-KISAN Samman Nidhi',
  description: 'Direct income support to farmers',
  scheme_type: 'PM-KISAN',
  eligibility_criteria: 'Farmers with land holdings up to 2 hectares',
  annual_benefit: 6000,
  created_at: timestamp()
});

CREATE (sch2:Scheme {
  scheme_id: 'SCHEME_AYUSHMAN',
  name: 'Ayushman Bharat',
  description: 'Health insurance coverage',
  scheme_type: 'Ayushman-Bharat',
  eligibility_criteria: 'BPL families and workers',
  annual_benefit: 500000,
  created_at: timestamp()
});

CREATE (sch3:Scheme {
  scheme_id: 'SCHEME_PMAY',
  name: 'Pradhan Mantri Awas Yojana',
  description: 'Housing scheme for low-income families',
  scheme_type: 'PMAY',
  eligibility_criteria: 'Families without pucca houses',
  annual_benefit: 270000,
  created_at: timestamp()
});

CREATE (sch4:Scheme {
  scheme_id: 'SCHEME_DBT',
  name: 'Direct Benefit Transfer',
  description: 'Direct cash transfer to beneficiaries',
  scheme_type: 'DBT',
  eligibility_criteria: 'Income below poverty line',
  annual_benefit: 12000,
  created_at: timestamp()
});

// STEP 5: CREATE 100 DUMMY VOTERS ACROSS 5 BOOTHS
// =====================================================
// Booth 1: 20 voters
CALL apoc.create.nodes("Voter", [
  {voter_id: "VOTER_001", name: "Rajesh Kumar", age: 35, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Software Engineer", income_bracket: "10L+", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543201", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.8},
  {voter_id: "VOTER_002", name: "Priya Sharma", age: 28, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Doctor", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543202", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.9},
  {voter_id: "VOTER_003", name: "Suresh Patel", age: 52, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Secondary", occupation: "Shopkeeper", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543203", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_AYUSHMAN"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.4, engagement_score: 0.5},
  {voter_id: "VOTER_004", name: "Anjali Verma", age: 23, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Primary", occupation: "Student", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543204", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "First-time", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Misinformation-susceptible", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.7, engagement_score: 0.3},
  {voter_id: "VOTER_005", name: "Vikram Singh", age: 42, gender: "M", caste_category: "ST", religion: "Hindu", education_level: "Secondary", occupation: "Farmer", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543205", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_PM-KISAN", "SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "High", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.25, engagement_score: 0.7},
  {voter_id: "VOTER_006", name: "Isha Desai", age: 31, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Teacher", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543206", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.8},
  {voter_id: "VOTER_007", name: "Harish Chandra", age: 65, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Primary", occupation: "Retired", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543207", has_aadhaar: false, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "60+", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.5},
  {voter_id: "VOTER_008", name: "Sneha Pillai", age: 26, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Postgraduate", occupation: "Consultant", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543208", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.15, engagement_score: 0.9},
  {voter_id: "VOTER_009", name: "Ramesh Yadav", age: 48, gender: "M", caste_category: "OBC", religion: "Hindu", education_level: "Secondary", occupation: "Business Owner", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543209", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.5},
  {voter_id: "VOTER_010", name: "Geeta Singh", age: 38, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Nurse", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543210", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_AYUSHMAN"], political_leaning: "Undecided", scheme_beneficiary_status: "Active", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.7},
  {voter_id: "VOTER_011", name: "Karan Mehra", age: 33, gender: "M", caste_category: "General", religion: "Sikh", education_level: "Graduate", occupation: "Engineer", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543211", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.85},
  {voter_id: "VOTER_012", name: "Lakshmi Das", age: 45, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Primary", occupation: "Housewife", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543212", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_PMAY"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Misinformation-susceptible", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.6, engagement_score: 0.3},
  {voter_id: "VOTER_013", name: "Ranveer Kapoor", age: 29, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Architect", income_bracket: "10L+", language_preference: "Hinglish", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543213", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.25, engagement_score: 0.8},
  {voter_id: "VOTER_014", name: "Seema Rao", age: 54, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Secondary", occupation: "Accountant", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543214", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Active", engagement_level: "High", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.75},
  {voter_id: "VOTER_015", name: "Nilesh Patil", age: 40, gender: "M", caste_category: "ST", religion: "Hindu", education_level: "Secondary", occupation: "Laborer", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543215", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_PMAY"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Misinformation-susceptible", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.5, engagement_score: 0.4},
  {voter_id: "VOTER_016", name: "Divya Nair", age: 27, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Marketing Manager", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543216", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.85},
  {voter_id: "VOTER_017", name: "Ashok Gupta", age: 61, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Postgraduate", occupation: "Doctor (Retired)", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543217", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Informed", age_group: "60+", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.15, engagement_score: 0.6},
  {voter_id: "VOTER_018", name: "Chitrangada Roy", age: 33, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Designer", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543218", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.75},
  {voter_id: "VOTER_019", name: "Vinode Kumar", age: 25, gender: "M", caste_category: "SC", religion: "Hindu", education_level: "Graduate", occupation: "Analyst", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543219", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "First-time", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.7},
  {voter_id: "VOTER_020", name: "Meenal Singh", age: 55, gender: "F", caste_category: "General", religion: "Sikh", education_level: "Secondary", occupation: "Business Owner", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_001", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543220", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.5}
]) YIELD node WITH node
MATCH (b:Booth {booth_id: "BOOTH_001"})
MATCH (c:Constituency {constituency_id: "CONST_001"})
CREATE (node)-[:VOTES_AT]->(b)
CREATE (node)-[:BELONGS_TO_CONSTITUENCY]->(c)
RETURN COUNT(node) as booth_1_voters_created;

// Booth 2: 20 voters (continue pattern)
CALL apoc.create.nodes("Voter", [
  {voter_id: "VOTER_021", name: "Aditya Gupta", age: 32, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "IT Manager", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543221", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.85},
  {voter_id: "VOTER_022", name: "Sakshi Wagh", age: 28, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Lawyer", income_bracket: "10L+", language_preference: "Hinglish", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543222", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.15, engagement_score: 0.9},
  {voter_id: "VOTER_023", name: "Manoj Sharma", age: 41, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Secondary", occupation: "Mechanic", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543223", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.4, engagement_score: 0.4},
  {voter_id: "VOTER_024", name: "Ritika Bhat", age: 24, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Primary", occupation: "Shop Assistant", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543224", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "First-time", scheme_beneficiary_status: "Not-eligible", engagement_level: "Medium", risk_profile: "Misinformation-susceptible", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.65, engagement_score: 0.4},
  {voter_id: "VOTER_025", name: "Bhuwan Singh", age: 48, gender: "M", caste_category: "ST", religion: "Hindu", education_level: "Secondary", occupation: "Farmer", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543225", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_PM-KISAN", "SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.6},
  {voter_id: "VOTER_026", name: "Pooja Deshmukh", age: 30, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "HR Executive", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543226", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.75},
  {voter_id: "VOTER_027", name: "Murali Krishnan", age: 64, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Secondary", occupation: "Retired Teacher", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543227", has_aadhaar: false, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "60+", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.5},
  {voter_id: "VOTER_028", name: "Tanya Patel", age: 26, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Postgraduate", occupation: "Data Scientist", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543228", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.15, engagement_score: 0.9},
  {voter_id: "VOTER_029", name: "Nikhil Reddy", age: 44, gender: "M", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Sales Manager", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543229", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "High", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.7},
  {voter_id: "VOTER_030", name: "Madhuri Khan", age: 37, gender: "F", caste_category: "General", religion: "Muslim", education_level: "Graduate", occupation: "Consultant", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543230", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.8},
  {voter_id: "VOTER_031", name: "Sanjay Verma", age: 35, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Engineer", income_bracket: "10L+", language_preference: "Hinglish", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543231", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.25, engagement_score: 0.8},
  {voter_id: "VOTER_032", name: "Bindiya Ghosh", age: 50, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Secondary", occupation: "Housewife", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543232", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_PMAY"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Misinformation-susceptible", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.62, engagement_score: 0.3},
  {voter_id: "VOTER_033", name: "Rohit Bansal", age: 28, gender: "M", caste_category: "General", religion: "Sikh", education_level: "Graduate", occupation: "Photographer", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543233", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.85},
  {voter_id: "VOTER_034", name: "Jaya Swamy", age: 45, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Teacher", income_bracket: "6-10L", language_preference: "Tamil", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543234", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.22, engagement_score: 0.8},
  {voter_id: "VOTER_035", name: "Deepak Shah", age: 39, gender: "M", caste_category: "ST", religion: "Christian", education_level: "Secondary", occupation: "Driver", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543235", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.4, engagement_score: 0.5},
  {voter_id: "VOTER_036", name: "Kavya Nambiar", age: 31, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Postgraduate", occupation: "Researcher", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543236", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.18, engagement_score: 0.88},
  {voter_id: "VOTER_037", name: "Ashish Kumar", age: 62, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Retired Officer", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543237", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Informed", age_group: "60+", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.6},
  {voter_id: "VOTER_038", name: "Swati Joshi", age: 34, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Accountant", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543238", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.32, engagement_score: 0.7},
  {voter_id: "VOTER_039", name: "Manish Jena", age: 27, gender: "M", caste_category: "SC", religion: "Hindu", education_level: "Graduate", occupation: "Developer", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543239", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.28, engagement_score: 0.75},
  {voter_id: "VOTER_040", name: "Payal Mishra", age: 56, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Secondary", occupation: "Entrepreneur", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_002", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543240", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.55}
]) YIELD node WITH node
MATCH (b:Booth {booth_id: "BOOTH_002"})
MATCH (c:Constituency {constituency_id: "CONST_001"})
CREATE (node)-[:VOTES_AT]->(b)
CREATE (node)-[:BELONGS_TO_CONSTITUENCY]->(c)
RETURN COUNT(node) as booth_2_voters_created;

// Booth 3: 20 voters
CALL apoc.create.nodes("Voter", [
  {voter_id: "VOTER_041", name: "Vikram Jat", age: 33, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Software Tester", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543241", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.75},
  {voter_id: "VOTER_042", name: "Anuradha Menon", age: 29, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Journalist", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543242", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.18, engagement_score: 0.88},
  {voter_id: "VOTER_043", name: "Rajesh Nair", age: 51, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Supervisor", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543243", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.32, engagement_score: 0.6},
  {voter_id: "VOTER_044", name: "Shreya Tandon", age: 22, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Secondary", occupation: "Student", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543244", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "First-time", scheme_beneficiary_status: "Not-eligible", engagement_level: "Medium", risk_profile: "Misinformation-susceptible", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.68, engagement_score: 0.35},
  {voter_id: "VOTER_045", name: "Suresh Dalvi", age: 47, gender: "M", caste_category: "ST", religion: "Hindu", education_level: "Secondary", occupation: "Farmer", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543245", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_PM-KISAN", "SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.5},
  {voter_id: "VOTER_046", name: "Neha Sharma", age: 32, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Financial Analyst", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543246", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.85},
  {voter_id: "VOTER_047", name: "Ravi Khanduja", age: 59, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Primary", occupation: "Retired", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543247", has_aadhaar: false, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Low", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.4, engagement_score: 0.45},
  {voter_id: "VOTER_048", name: "Gauri Dandekar", age: 25, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Postgraduate", occupation: "Product Manager", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543248", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.15, engagement_score: 0.92},
  {voter_id: "VOTER_049", name: "Devendra Singh", age: 46, gender: "M", caste_category: "OBC", religion: "Hindu", education_level: "Secondary", occupation: "Electrician", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543249", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.38, engagement_score: 0.5},
  {voter_id: "VOTER_050", name: "Harini Krishnamurthy", age: 38, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Compliance Officer", income_bracket: "6-10L", language_preference: "Tamil", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543250", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.75},
  {voter_id: "VOTER_051", name: "Arun Kapadia", age: 36, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Marketing Exec", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543251", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.75},
  {voter_id: "VOTER_052", name: "Monika Kulkarni", age: 49, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Secondary", occupation: "Housewife", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543252", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_PMAY"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Misinformation-susceptible", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.58, engagement_score: 0.35},
  {voter_id: "VOTER_053", name: "Siddharth Pillai", age: 30, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "UX Designer", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543253", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.85},
  {voter_id: "VOTER_054", name: "Meera Baghel", age: 44, gender: "F", caste_category: "OBC", religion: "Christian", education_level: "Graduate", occupation: "Yoga Instructor", income_bracket: "3-6L", language_preference: "Hinglish", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543254", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "High", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.65},
  {voter_id: "VOTER_055", name: "Anand Bhatt", age: 41, gender: "M", caste_category: "ST", religion: "Hindu", education_level: "Secondary", occupation: "Construction Worker", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543255", has_aadhaar: false, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_PMAY"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Misinformation-susceptible", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.62, engagement_score: 0.3},
  {voter_id: "VOTER_056", name: "Surbhi Sengupta", age: 28, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Postgraduate", occupation: "Researcher", income_bracket: "6-10L", language_preference: "Bengali", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543256", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.85},
  {voter_id: "VOTER_057", name: "Naresh Pund", age: 63, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Secondary", occupation: "Business", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543257", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "60+", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.5},
  {voter_id: "VOTER_058", name: "Aparna Gupta", age: 35, gender: "F", caste_category: "OBC", religion: "Sikh", education_level: "Graduate", occupation: "Supply Chain Expert", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543258", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.18, engagement_score: 0.88},
  {voter_id: "VOTER_059", name: "Sameer Khan", age: 27, gender: "M", caste_category: "General", religion: "Muslim", education_level: "Graduate", occupation: "Content Writer", income_bracket: "3-6L", language_preference: "Hinglish", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543259", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.32, engagement_score: 0.7},
  {voter_id: "VOTER_060", name: "Chandrika Das", age: 54, gender: "F", caste_category: "General", religion: "Christian", education_level: "Graduate", occupation: "Accountant", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_003", constituency_id: "CONST_001", district: "Pune", state: "Maharashtra", mobile_number: "9876543260", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "High", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.7}
]) YIELD node WITH node
MATCH (b:Booth {booth_id: "BOOTH_003"})
MATCH (c:Constituency {constituency_id: "CONST_001"})
CREATE (node)-[:VOTES_AT]->(b)
CREATE (node)-[:BELONGS_TO_CONSTITUENCY]->(c)
RETURN COUNT(node) as booth_3_voters_created;

// Booth 4: 20 voters
CALL apoc.create.nodes("Voter", [
  {voter_id: "VOTER_061", name: "Abhinav Sharma", age: 34, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Project Manager", income_bracket: "10L+", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543261", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.28, engagement_score: 0.78},
  {voter_id: "VOTER_062", name: "Dimple Puri", age: 29, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Analyst", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543262", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.22, engagement_score: 0.82},
  {voter_id: "VOTER_063", name: "Lokesh Yadav", age: 50, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Secondary", occupation: "Contractor", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543263", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.42, engagement_score: 0.52},
  {voter_id: "VOTER_064", name: "Chhavi Bora", age: 23, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Graduate", occupation: "Trainee", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543264", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "First-time", scheme_beneficiary_status: "Not-eligible", engagement_level: "Medium", risk_profile: "Misinformation-susceptible", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.64, engagement_score: 0.42},
  {voter_id: "VOTER_065", name: "Harpal Gill", age: 45, gender: "M", caste_category: "ST", religion: "Sikh", education_level: "Secondary", occupation: "Farmer", income_bracket: "3-6L", language_preference: "Punjabi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543265", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_PM-KISAN", "SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.38, engagement_score: 0.55},
  {voter_id: "VOTER_066", name: "Vedavati Mishra", age: 31, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Communications Manager", income_bracket: "10L+", language_preference: "Hinglish", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543266", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.28, engagement_score: 0.76},
  {voter_id: "VOTER_067", name: "Hari Mohan", age: 67, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Primary", occupation: "Retired", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543267", has_aadhaar: false, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Low", risk_profile: "Neutral", age_group: "60+", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.42, engagement_score: 0.42},
  {voter_id: "VOTER_068", name: "Tina Menon", age: 26, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Postgraduate", occupation: "Machine Learning Engineer", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543268", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.18, engagement_score: 0.9},
  {voter_id: "VOTER_069", name: "Pushkar Singh", age: 43, gender: "M", caste_category: "OBC", religion: "Muslim", education_level: "Graduate", occupation: "HR Manager", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543269", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.72},
  {voter_id: "VOTER_070", name: "Ritika Aryan", age: 37, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Risk Manager", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543270", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.84},
  {voter_id: "VOTER_071", name: "Navin Patel", age: 32, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Operations Executive", income_bracket: "6-10L", language_preference: "Gujarati", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543271", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.28, engagement_score: 0.76},
  {voter_id: "VOTER_072", name: "Apoorva Tiwari", age: 48, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Secondary", occupation: "Domestic Help", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543272", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_PMAY"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Misinformation-susceptible", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.6, engagement_score: 0.32},
  {voter_id: "VOTER_073", name: "Rohan Saxena", age: 29, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Civil Engineer", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543273", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.28, engagement_score: 0.78},
  {voter_id: "VOTER_074", name: "Kamini Kumari", age: 46, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Librarian", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543274", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "High", risk_profile: "Informed", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.25, engagement_score: 0.78},
  {voter_id: "VOTER_075", name: "Gajendra Singh", age: 38, gender: "M", caste_category: "ST", religion: "Hindu", education_level: "Secondary", occupation: "Mason", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543275", has_aadhaar: false, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Misinformation-susceptible", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.58, engagement_score: 0.35},
  {voter_id: "VOTER_076", name: "Priyanka Malhotra", age: 30, gender: "F", caste_category: "General", religion: "Sikh", education_level: "Postgraduate", occupation: "Financial Advisor", income_bracket: "10L+", language_preference: "English", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543276", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.86},
  {voter_id: "VOTER_077", name: "Basant Kumar", age: 25, gender: "M", caste_category: "SC", religion: "Hindu", education_level: "Secondary", occupation: "Delivery Boy", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543277", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "First-time", scheme_beneficiary_status: "Not-eligible", engagement_level: "Medium", risk_profile: "Misinformation-susceptible", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.62, engagement_score: 0.38},
  {voter_id: "VOTER_078", name: "Seema Dey", age: 52, gender: "F", caste_category: "General", religion: "Christian", education_level: "Graduate", occupation: "Principal", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543278", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "High", risk_profile: "Informed", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.22, engagement_score: 0.8},
  {voter_id: "VOTER_079", name: "Qamar Khan", age: 41, gender: "M", caste_category: "General", religion: "Muslim", education_level: "Graduate", occupation: "Security Officer", income_bracket: "3-6L", language_preference: "Hinglish", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543279", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.35, engagement_score: 0.5},
  {voter_id: "VOTER_080", name: "Neelam Rao", age: 55, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Secondary", occupation: "Shopkeeper", income_bracket: "3-6L", language_preference: "Telugu", booth_id: "BOOTH_004", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543280", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.32, engagement_score: 0.56}
]) YIELD node WITH node
MATCH (b:Booth {booth_id: "BOOTH_004"})
MATCH (c:Constituency {constituency_id: "CONST_002"})
CREATE (node)-[:VOTES_AT]->(b)
CREATE (node)-[:BELONGS_TO_CONSTITUENCY]->(c)
RETURN COUNT(node) as booth_4_voters_created;

// Booth 5: 20 voters (Final booth)
CALL apoc.create.nodes("Voter", [
  {voter_id: "VOTER_081", name: "Arjun Mishra", age: 35, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Sales Executive", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543281", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.72},
  {voter_id: "VOTER_082", name: "Esha Bhattacharya", age: 27, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Content Creator", income_bracket: "3-6L", language_preference: "Bengali", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543282", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.82},
  {voter_id: "VOTER_083", name: "Mohan Lal", age: 53, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Primary", occupation: "Vendor", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543283", has_aadhaar: false, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.4, engagement_score: 0.4},
  {voter_id: "VOTER_084", name: "Disha Pant", age: 21, gender: "F", caste_category: "SC", religion: "Hindu", education_level: "Graduate", occupation: "Intern", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543284", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "First-time", scheme_beneficiary_status: "Not-eligible", engagement_level: "Medium", risk_profile: "Misinformation-susceptible", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.66, engagement_score: 0.4},
  {voter_id: "VOTER_085", name: "Udaya Shankar", age: 46, gender: "M", caste_category: "ST", religion: "Hindu", education_level: "Secondary", occupation: "Farmer", income_bracket: "3-6L", language_preference: "Kannada", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543285", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_PM-KISAN", "SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.32, engagement_score: 0.58},
  {voter_id: "VOTER_086", name: "Isha Patidar", age: 32, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Architect", income_bracket: "10L+", language_preference: "Hinglish", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543286", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.22, engagement_score: 0.82},
  {voter_id: "VOTER_087", name: "Jagdish Chopra", age: 61, gender: "M", caste_category: "General", religion: "Sikh", education_level: "Graduate", occupation: "Retired Army", income_bracket: "6-10L", language_preference: "Punjabi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543287", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "High", risk_profile: "Informed", age_group: "60+", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.75},
  {voter_id: "VOTER_088", name: "Geetika Arora", age: 24, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Software Engineer", income_bracket: "6-10L", language_preference: "Hinglish", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543288", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.18, engagement_score: 0.88},
  {voter_id: "VOTER_089", name: "Harinder Singh", age: 44, gender: "M", caste_category: "OBC", religion: "Sikh", education_level: "Secondary", occupation: "Truck Driver", income_bracket: "3-6L", language_preference: "Punjabi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543289", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.38, engagement_score: 0.48},
  {voter_id: "VOTER_090", name: "Manjiri Joshi", age: 36, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Psychiatrist", income_bracket: "10L+", language_preference: "Marathi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543290", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.84},
  {voter_id: "VOTER_091", name: "Yatendra Kumar", age: 38, gender: "M", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "Veterinarian", income_bracket: "6-10L", language_preference: "Hindi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543291", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.3, engagement_score: 0.74},
  {voter_id: "VOTER_092", name: "Priya Sharma", age: 47, gender: "F", caste_category: "SC", religion: "Buddhist", education_level: "Primary", occupation: "ASHA Worker", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543292", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_AYUSHMAN"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Active", engagement_level: "High", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.28, engagement_score: 0.72},
  {voter_id: "VOTER_093", name: "Vinay Agarwal", age: 28, gender: "M", caste_category: "General", religion: "Jain", education_level: "Postgraduate", occupation: "Statistician", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543293", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.86},
  {voter_id: "VOTER_094", name: "Manisha Sharma", age: 42, gender: "F", caste_category: "OBC", religion: "Hindu", education_level: "Graduate", occupation: "Social Worker", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543294", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Anti-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "High", risk_profile: "Informed", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.24, engagement_score: 0.78},
  {voter_id: "VOTER_095", name: "Ravi Sharma", age: 37, gender: "M", caste_category: "ST", religion: "Hindu", education_level: "Secondary", occupation: "Agriculture Laborer", income_bracket: "0-3L", language_preference: "Hindi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543295", has_aadhaar: false, government_scheme_eligibility: ["SCHEME_DBT", "SCHEME_PMAY"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Low", risk_profile: "Misinformation-susceptible", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.56, engagement_score: 0.35},
  {voter_id: "VOTER_096", name: "Sophia Das", age: 29, gender: "F", caste_category: "General", religion: "Christian", education_level: "Postgraduate", occupation: "Project Coordinator", income_bracket: "6-10L", language_preference: "English", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543296", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "26-40", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.84},
  {voter_id: "VOTER_097", name: "Iqbal Hussain", age: 26, gender: "M", caste_category: "General", religion: "Muslim", education_level: "Graduate", occupation: "Graphic Designer", income_bracket: "3-6L", language_preference: "Hinglish", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543297", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "First-time", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Neutral", age_group: "18-25", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.32, engagement_score: 0.7},
  {voter_id: "VOTER_098", name: "Nandita Bhat", age: 50, gender: "F", caste_category: "General", religion: "Hindu", education_level: "Graduate", occupation: "College Professor", income_bracket: "6-10L", language_preference: "Kannada", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543298", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Not-eligible", engagement_level: "High", risk_profile: "Informed", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.2, engagement_score: 0.82},
  {voter_id: "VOTER_099", name: "Vikas Nair", age: 41, gender: "M", caste_category: "OBC", religion: "Hindu", education_level: "Secondary", occupation: "Factory Supervisor", income_bracket: "3-6L", language_preference: "Hindi", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543299", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Undecided", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.36, engagement_score: 0.52},
  {voter_id: "VOTER_100", name: "Zara Khan", age: 58, gender: "F", caste_category: "General", religion: "Muslim", education_level: "Graduate", occupation: "Consultant", income_bracket: "6-10L", language_preference: "Urdu", booth_id: "BOOTH_005", constituency_id: "CONST_002", district: "Pune", state: "Maharashtra", mobile_number: "9876543300", has_aadhaar: true, government_scheme_eligibility: ["SCHEME_DBT"], political_leaning: "Pro-incumbent", scheme_beneficiary_status: "Eligible-not-enrolled", engagement_level: "Medium", risk_profile: "Neutral", age_group: "41-60", created_at: timestamp(), updated_at: timestamp(), risk_score: 0.32, engagement_score: 0.58}
]) YIELD node WITH node
MATCH (b:Booth {booth_id: "BOOTH_005"})
MATCH (c:Constituency {constituency_id: "CONST_002"})
CREATE (node)-[:VOTES_AT]->(b)
CREATE (node)-[:BELONGS_TO_CONSTITUENCY]->(c)
RETURN COUNT(node) as booth_5_voters_created;

// STEP 6: CREATE SCHEME ELIGIBILITY EDGES (Voters to Schemes)
// =====================================================
MATCH (v:Voter)
UNWIND v.government_scheme_eligibility as scheme_id
MATCH (s:Scheme {scheme_id: scheme_id})
CREATE (v)-[:ELIGIBLE_FOR {enrolled: false, benefit_received: 0}]->(s)
RETURN COUNT(*) as eligibility_edges_created;

// STEP 7: VERIFICATION QUERIES
// =====================================================

// Verify total voters created
MATCH (v:Voter) RETURN COUNT(v) as total_voters;

// Verify voters per booth
MATCH (v:Voter)-[:VOTES_AT]->(b:Booth)
RETURN b.booth_id, COUNT(v) as voter_count
ORDER BY b.booth_id;

// Verify booth to constituency relationships
MATCH (b:Booth)-[:IN_CONSTITUENCY]->(c:Constituency)
RETURN c.constituency_id, COUNT(b) as booth_count
ORDER BY c.constituency_id;

// Verify scheme eligibility connections
MATCH (v:Voter)-[:ELIGIBLE_FOR]->(s:Scheme)
RETURN s.scheme_id, COUNT(v) as eligible_voters
ORDER BY s.scheme_id;

// Verify data distribution
CALL {
  MATCH (v:Voter)
  RETURN 'Total Voters' as metric, COUNT(v) as count
  UNION ALL
  MATCH (v:Voter) WHERE v.political_leaning = 'Pro-incumbent'
  RETURN 'Pro-incumbent' as metric, COUNT(v) as count
  UNION ALL
  MATCH (v:Voter) WHERE v.political_leaning = 'Anti-incumbent'
  RETURN 'Anti-incumbent' as metric, COUNT(v) as count
  UNION ALL
  MATCH (v:Voter) WHERE v.political_leaning = 'Undecided'
  RETURN 'Undecided' as metric, COUNT(v) as count
  UNION ALL
  MATCH (v:Voter) WHERE v.political_leaning = 'First-time'
  RETURN 'First-time' as metric, COUNT(v) as count
}
RETURN metric, count;
