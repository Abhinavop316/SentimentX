/**
 * Data Formatters
 * Convert Neo4j records to GraphQL-compatible objects
 *
 * @module utils/formatters
 */

/**
 * Format Voter node from Neo4j
 */
export const formatVoter = (voterNode, relations = {}) => {
  if (!voterNode) return null;

  const props = voterNode.properties;

  return {
    voter_id: props.voter_id,
    name: props.name,
    age: props.age,
    gender: props.gender,
    caste_category: props.caste_category,
    religion: props.religion,
    education_level: props.education_level,
    occupation: props.occupation,
    income_bracket: props.income_bracket,
    mobile_number: props.mobile_number,
    language_preference: props.language_preference,
    booth_id: props.booth_id,
    constituency_id: props.constituency_id,
    district: props.district,
    state: props.state,
    has_aadhaar: props.has_aadhaar,
    government_scheme_eligibility: props.government_scheme_eligibility || [],
    political_leaning: props.political_leaning,
    scheme_beneficiary_status: props.scheme_beneficiary_status,
    engagement_level: props.engagement_level,
    risk_profile: props.risk_profile,
    age_group: props.age_group,
    risk_score: props.risk_score,
    engagement_score: props.engagement_score,
    created_at: props.created_at?.toString() || new Date().toISOString(),
    updated_at: props.updated_at?.toString() || new Date().toISOString(),
    last_sentiment_update: props.last_sentiment_update?.toString() || null,
    booth: relations.booth ? formatBooth(relations.booth) : null,
    constituency: relations.constituency
      ? formatConstituency(relations.constituency)
      : null,
    eligible_schemes: (relations.schemes || []).map((s) => formatScheme(s)),
  };
};

/**
 * Format Booth node from Neo4j
 */
export const formatBooth = (boothNode, relations = {}) => {
  if (!boothNode) return null;

  const props = boothNode.properties;

  return {
    booth_id: props.booth_id,
    name: props.name,
    constituency_id: props.constituency_id,
    address: props.address,
    latitude: props.latitude,
    longitude: props.longitude,
    polling_officers: props.polling_officers,
    accessibility_features: props.accessibility_features || [],
    total_registered_voters: props.total_registered_voters,
    created_at: props.created_at?.toString() || new Date().toISOString(),
    updated_at: props.updated_at?.toString() || new Date().toISOString(),
    constituency: relations.constituency
      ? formatConstituency(relations.constituency)
      : null,
    voters: (relations.voters || []).map((v) => formatVoter(v)),
    statistics: relations.statistics || null,
  };
};

/**
 * Format Constituency node from Neo4j
 */
export const formatConstituency = (constNode, relations = {}) => {
  if (!constNode) return null;

  const props = constNode.properties;

  return {
    constituency_id: props.constituency_id,
    name: props.name,
    state: props.state,
    district: props.district,
    total_booths: props.total_booths,
    total_voters: props.total_voters,
    created_at: props.created_at?.toString() || new Date().toISOString(),
    booths: (relations.booths || []).map((b) => formatBooth(b)),
    voters: (relations.voters || []).map((v) => formatVoter(v)),
  };
};

/**
 * Format Scheme node from Neo4j
 */
export const formatScheme = (schemeNode) => {
  if (!schemeNode) return null;

  const props = schemeNode.properties;

  return {
    scheme_id: props.scheme_id,
    name: props.name,
    description: props.description,
    scheme_type: props.scheme_type,
    eligibility_criteria: props.eligibility_criteria,
    annual_benefit: props.annual_benefit,
    created_at: props.created_at?.toString() || new Date().toISOString(),
  };
};

/**
 * Format District node from Neo4j
 */
export const formatDistrict = (districtNode, relations = {}) => {
  if (!districtNode) return null;

  const props = districtNode.properties;

  return {
    district_id: props.district_id,
    name: props.name,
    state: props.state,
    total_constituencies: props.total_constituencies,
    total_booths: props.total_booths,
    created_at: props.created_at?.toString() || new Date().toISOString(),
    constituencies: (relations.constituencies || []).map((c) =>
      formatConstituency(c),
    ),
  };
};

/**
 * Format State node from Neo4j
 */
export const formatState = (stateNode, relations = {}) => {
  if (!stateNode) return null;

  const props = stateNode.properties;

  return {
    state_id: props.state_id,
    name: props.name,
    total_districts: props.total_districts,
    created_at: props.created_at?.toString() || new Date().toISOString(),
    districts: (relations.districts || []).map((d) => formatDistrict(d)),
  };
};

export default {
  formatVoter,
  formatBooth,
  formatConstituency,
  formatScheme,
  formatDistrict,
  formatState,
};
