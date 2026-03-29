/**
 * GraphQL Resolvers
 * Implements all query logic with Neo4j integration
 *
 * @module graphql/resolvers
 */

import { GraphQLError } from "graphql";
import { executeQuery } from "../neo4j/driver.js";
import {
  formatVoter,
  formatBooth,
  formatConstituency,
  formatScheme,
} from "../utils/formatters.js";
import logger from "../utils/logger.js";

// Helper: Convert pagination input to Cypher SKIP/LIMIT
const getPaginationParams = (pagination) => {
  const first = pagination?.first || 20;
  const after = pagination?.after
    ? Buffer.from(pagination.after, "base64").toString("utf-8")
    : "0";
  const skip = parseInt(after) || 0;

  return {
    skip,
    limit: Math.min(first, 100), // Max 100 per query
  };
};

// Helper: Build filter WHERE clause
const buildVoterFilterWhere = (filter) => {
  if (!filter) return "";

  const conditions = [];
  if (filter.booth_id) conditions.push(`v.booth_id = '${filter.booth_id}'`);
  if (filter.constituency_id)
    conditions.push(`v.constituency_id = '${filter.constituency_id}'`);
  if (filter.political_leaning)
    conditions.push(`v.political_leaning = '${filter.political_leaning}'`);
  if (filter.engagement_level)
    conditions.push(`v.engagement_level = '${filter.engagement_level}'`);
  if (filter.risk_profile)
    conditions.push(`v.risk_profile = '${filter.risk_profile}'`);
  if (filter.age_group) conditions.push(`v.age_group = '${filter.age_group}'`);
  if (filter.language_preference)
    conditions.push(`v.language_preference = '${filter.language_preference}'`);
  if (filter.min_risk_score)
    conditions.push(`v.risk_score >= ${filter.min_risk_score}`);
  if (filter.max_risk_score)
    conditions.push(`v.risk_score <= ${filter.max_risk_score}`);
  if (filter.has_aadhaar !== undefined)
    conditions.push(`v.has_aadhaar = ${filter.has_aadhaar}`);

  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
};

// Helper: Build sort clause
const buildSortClause = (sort) => {
  if (!sort) return "ORDER BY v.name ASC";

  const order = sort.order === "DESC" ? "DESC" : "ASC";
  return `ORDER BY v.${sort.field} ${order}`;
};

// Fast local fallback so the API remains usable when Neo4j is unavailable.
const MOCK_MODE = process.env.MOCK_MODE === "true";
const NOW_ISO = new Date().toISOString();

const MOCK_BOOTHS = [
  {
    booth_id: "BOOTH_001",
    name: "Central School Booth",
    constituency_id: "CONST_001",
    address: "Ward 1, Central School",
    latitude: 28.6139,
    longitude: 77.209,
    polling_officers: 4,
    accessibility_features: ["Ramp", "Wheelchair"],
    total_registered_voters: 3,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
  {
    booth_id: "BOOTH_002",
    name: "Community Hall Booth",
    constituency_id: "CONST_001",
    address: "Ward 2, Community Hall",
    latitude: 28.615,
    longitude: 77.215,
    polling_officers: 3,
    accessibility_features: ["Ramp"],
    total_registered_voters: 2,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
];

const MOCK_VOTERS = [
  {
    voter_id: "VOTER_001",
    name: "Amit Kumar",
    age: 35,
    gender: "Male",
    caste_category: "OBC",
    religion: "Hindu",
    education_level: "Graduate",
    occupation: "Teacher",
    income_bracket: "3-6L",
    mobile_number: "9876543210",
    language_preference: "Hindi",
    booth_id: "BOOTH_001",
    constituency_id: "CONST_001",
    district: "Central",
    state: "Delhi",
    has_aadhaar: true,
    government_scheme_eligibility: ["PM-KISAN"],
    political_leaning: "Pro-incumbent",
    scheme_beneficiary_status: "Active",
    engagement_level: "High",
    risk_profile: "Informed",
    age_group: "26-40",
    risk_score: 0.21,
    engagement_score: 0.86,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    last_sentiment_update: NOW_ISO,
    eligible_schemes: [],
  },
  {
    voter_id: "VOTER_002",
    name: "Priya Singh",
    age: 29,
    gender: "Female",
    caste_category: "General",
    religion: "Hindu",
    education_level: "Postgraduate",
    occupation: "Engineer",
    income_bracket: "6-10L",
    mobile_number: "9876500002",
    language_preference: "English",
    booth_id: "BOOTH_001",
    constituency_id: "CONST_001",
    district: "Central",
    state: "Delhi",
    has_aadhaar: true,
    government_scheme_eligibility: ["AYUSHMAN"],
    political_leaning: "Undecided",
    scheme_beneficiary_status: "Eligible-not-enrolled",
    engagement_level: "Medium",
    risk_profile: "Neutral",
    age_group: "26-40",
    risk_score: 0.58,
    engagement_score: 0.62,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    last_sentiment_update: NOW_ISO,
    eligible_schemes: [],
  },
  {
    voter_id: "VOTER_003",
    name: "Ravi Verma",
    age: 41,
    gender: "Male",
    caste_category: "SC",
    religion: "Hindu",
    education_level: "Secondary",
    occupation: "Shopkeeper",
    income_bracket: "3-6L",
    mobile_number: "9876500003",
    language_preference: "Hindi",
    booth_id: "BOOTH_001",
    constituency_id: "CONST_001",
    district: "Central",
    state: "Delhi",
    has_aadhaar: true,
    government_scheme_eligibility: ["PMAY"],
    political_leaning: "Anti-incumbent",
    scheme_beneficiary_status: "Not-eligible",
    engagement_level: "Low",
    risk_profile: "Misinformation-susceptible",
    age_group: "41-60",
    risk_score: 0.77,
    engagement_score: 0.41,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    last_sentiment_update: NOW_ISO,
    eligible_schemes: [],
  },
  {
    voter_id: "VOTER_004",
    name: "Sneha Patel",
    age: 23,
    gender: "Female",
    caste_category: "OBC",
    religion: "Hindu",
    education_level: "Graduate",
    occupation: "Student",
    income_bracket: "0-3L",
    mobile_number: "9876500004",
    language_preference: "Hinglish",
    booth_id: "BOOTH_002",
    constituency_id: "CONST_001",
    district: "Central",
    state: "Delhi",
    has_aadhaar: true,
    government_scheme_eligibility: ["DBT"],
    political_leaning: "First-time",
    scheme_beneficiary_status: "Active",
    engagement_level: "High",
    risk_profile: "Neutral",
    age_group: "18-25",
    risk_score: 0.36,
    engagement_score: 0.79,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    last_sentiment_update: NOW_ISO,
    eligible_schemes: [],
  },
  {
    voter_id: "VOTER_005",
    name: "Imran Ali",
    age: 52,
    gender: "Male",
    caste_category: "General",
    religion: "Muslim",
    education_level: "Primary",
    occupation: "Driver",
    income_bracket: "0-3L",
    mobile_number: "9876500005",
    language_preference: "Regional",
    booth_id: "BOOTH_002",
    constituency_id: "CONST_001",
    district: "Central",
    state: "Delhi",
    has_aadhaar: true,
    government_scheme_eligibility: ["PM-KISAN", "DBT"],
    political_leaning: "Undecided",
    scheme_beneficiary_status: "Active",
    engagement_level: "Unreachable",
    risk_profile: "Misinformation-susceptible",
    age_group: "41-60",
    risk_score: 0.68,
    engagement_score: 0.23,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
    last_sentiment_update: NOW_ISO,
    eligible_schemes: [],
  },
];

const isDbConnectionError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("failed to connect") ||
    message.includes("neo4j") ||
    message.includes("driver not initialized") ||
    message.includes("connection")
  );
};

const useMockFallback = (error) => MOCK_MODE || isDbConnectionError(error);

const applyMockVoterFilter = (voters, filter) => {
  if (!filter) return voters;

  return voters.filter((v) => {
    if (filter.booth_id && v.booth_id !== filter.booth_id) return false;
    if (filter.constituency_id && v.constituency_id !== filter.constituency_id)
      return false;
    if (filter.district && v.district !== filter.district) return false;
    if (filter.state && v.state !== filter.state) return false;
    if (filter.political_leaning && v.political_leaning !== filter.political_leaning)
      return false;
    if (filter.engagement_level && v.engagement_level !== filter.engagement_level)
      return false;
    if (filter.risk_profile && v.risk_profile !== filter.risk_profile) return false;
    if (filter.age_group && v.age_group !== filter.age_group) return false;
    if (filter.language_preference && v.language_preference !== filter.language_preference)
      return false;
    if (filter.min_risk_score !== undefined && v.risk_score < filter.min_risk_score)
      return false;
    if (filter.max_risk_score !== undefined && v.risk_score > filter.max_risk_score)
      return false;
    if (filter.has_aadhaar !== undefined && v.has_aadhaar !== filter.has_aadhaar)
      return false;
    return true;
  });
};

const sortMockVoters = (voters, sort) => {
  const sorted = [...voters];
  const field = sort?.field || "name";
  const dir = sort?.order === "DESC" ? -1 : 1;

  sorted.sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  return sorted;
};

const toVoterConnection = (voters, pagination) => {
  const { skip, limit } = getPaginationParams(pagination);
  const slice = voters.slice(skip, skip + limit);

  return {
    edges: slice.map((node, index) => ({
      node,
      cursor: Buffer.from((skip + index).toString()).toString("base64"),
    })),
    pageInfo: {
      has_next_page: skip + limit < voters.length,
      has_previous_page: skip > 0,
      start_cursor:
        slice.length > 0 ? Buffer.from(skip.toString()).toString("base64") : null,
      end_cursor:
        slice.length > 0
          ? Buffer.from((skip + slice.length - 1).toString()).toString("base64")
          : null,
    },
    total_count: voters.length,
  };
};

const mockCount = (voters, key, values) =>
  values.map((category) => {
    const count = voters.filter((v) => v[key] === category).length;
    return {
      category,
      count,
      percentage:
        voters.length === 0 ? 0 : Number(((count * 100) / voters.length).toFixed(2)),
    };
  });

const getMockBoothStats = (booth_id) => {
  const voters = MOCK_VOTERS.filter((v) => v.booth_id === booth_id);
  const avg = (arr, key) =>
    arr.length === 0
      ? 0
      : Number((arr.reduce((acc, item) => acc + item[key], 0) / arr.length).toFixed(2));

  return {
    booth_id,
    total_voters: voters.length,
    pro_incumbent_count: voters.filter((v) => v.political_leaning === "Pro-incumbent").length,
    anti_incumbent_count: voters.filter((v) => v.political_leaning === "Anti-incumbent").length,
    undecided_count: voters.filter((v) => v.political_leaning === "Undecided").length,
    first_time_count: voters.filter((v) => v.political_leaning === "First-time").length,
    high_engagement_count: voters.filter((v) => v.engagement_level === "High").length,
    medium_engagement_count: voters.filter((v) => v.engagement_level === "Medium").length,
    low_engagement_count: voters.filter((v) => v.engagement_level === "Low").length,
    avg_risk_score: avg(voters, "risk_score"),
    avg_engagement_score: avg(voters, "engagement_score"),
    misinformation_susceptible_count: voters.filter(
      (v) => v.risk_profile === "Misinformation-susceptible",
    ).length,
    informed_count: voters.filter((v) => v.risk_profile === "Informed").length,
    neutral_count: voters.filter((v) => v.risk_profile === "Neutral").length,
  };
};

const getMockSegmentationStats = ({ booth_id, constituency_id, district }) => {
  let voters = [...MOCK_VOTERS];
  if (booth_id) voters = voters.filter((v) => v.booth_id === booth_id);
  if (constituency_id)
    voters = voters.filter((v) => v.constituency_id === constituency_id);
  if (district) voters = voters.filter((v) => v.district === district);

  return {
    by_political_leaning: mockCount(voters, "political_leaning", [
      "Pro-incumbent",
      "Anti-incumbent",
      "Undecided",
      "First-time",
    ]),
    by_engagement_level: mockCount(voters, "engagement_level", [
      "High",
      "Medium",
      "Low",
      "Unreachable",
    ]),
    by_risk_profile: mockCount(voters, "risk_profile", [
      "Misinformation-susceptible",
      "Neutral",
      "Informed",
    ]),
    by_age_group: mockCount(voters, "age_group", ["18-25", "26-40", "41-60", "60+"]),
    by_language: mockCount(voters, "language_preference", [
      "English",
      "Hindi",
      "Hinglish",
      "Regional",
    ]),
  };
};

export const resolvers = {
  Query: {
    // ===== VOTER QUERIES =====

    /**
     * Get single voter by ID
     */
    voter: async (_, { voter_id }) => {
      try {
        const query = `
          MATCH (v:Voter {voter_id: $voter_id})
          OPTIONAL MATCH (v)-[:VOTES_AT]->(b:Booth)
          OPTIONAL MATCH (v)-[:BELONGS_TO_CONSTITUENCY]->(c:Constituency)
          OPTIONAL MATCH (v)-[:ELIGIBLE_FOR]->(s:Scheme)
          RETURN v, b, c, collect(s) as schemes
        `;

        const records = await executeQuery(query, { voter_id });

        if (records.length === 0) return null;

        const record = records[0];
        return formatVoter(record.get("v"), {
          booth: record.get("b"),
          constituency: record.get("c"),
          schemes: record.get("schemes"),
        });
      } catch (error) {
        logger.error("Error fetching voter:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for voter query");
          return MOCK_VOTERS.find((v) => v.voter_id === voter_id) || null;
        }
        throw new GraphQLError(`Failed to fetch voter: ${error.message}`);
      }
    },

    /**
     * Get voters with filters, sorting, pagination
     */
    voters: async (_, { filter, sort, pagination }) => {
      try {
        const paginationParams = getPaginationParams(pagination);
        const filterWhere = buildVoterFilterWhere(filter);
        const sortClause = buildSortClause(sort);

        // Main query
        const query = `
          MATCH (v:Voter)
          ${filterWhere}
          ${sortClause}
          SKIP ${paginationParams.skip}
          LIMIT ${paginationParams.limit + 1}
          RETURN v
        `;

        const records = await executeQuery(query);

        // Check if there's a next page
        const hasNextPage = records.length > paginationParams.limit;
        const voters = records
          .slice(0, paginationParams.limit)
          .map((r) => formatVoter(r.get("v")));

        // Get total count
        const countQuery = `
          MATCH (v:Voter)
          ${filterWhere}
          RETURN COUNT(v) as total
        `;
        const countRecords = await executeQuery(countQuery);
        const totalCount = countRecords[0].get("total").toNumber();

        return {
          edges: voters.map((voter, index) => ({
            node: voter,
            cursor: Buffer.from(
              (paginationParams.skip + index).toString(),
            ).toString("base64"),
          })),
          pageInfo: {
            has_next_page: hasNextPage,
            has_previous_page: paginationParams.skip > 0,
            start_cursor:
              paginationParams.skip > 0
                ? Buffer.from(paginationParams.skip.toString()).toString(
                    "base64",
                  )
                : null,
            end_cursor: hasNextPage
              ? Buffer.from(
                  (paginationParams.skip + paginationParams.limit).toString(),
                ).toString("base64")
              : null,
          },
          total_count: totalCount,
        };
      } catch (error) {
        logger.error("Error fetching voters:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for voters query");
          const filtered = applyMockVoterFilter(MOCK_VOTERS, filter);
          const sorted = sortMockVoters(filtered, sort);
          return toVoterConnection(sorted, pagination);
        }
        throw new GraphQLError(`Failed to fetch voters: ${error.message}`);
      }
    },

    /**
     * Get voters in a specific booth
     */
    votersByBooth: async (_, { booth_id, pagination }) => {
      try {
        const paginationParams = getPaginationParams(pagination);

        const query = `
          MATCH (v:Voter)-[:VOTES_AT]->(b:Booth {booth_id: $booth_id})
          ORDER BY v.name ASC
          SKIP ${paginationParams.skip}
          LIMIT ${paginationParams.limit + 1}
          RETURN v
        `;

        const records = await executeQuery(query, { booth_id });
        const hasNextPage = records.length > paginationParams.limit;
        const voters = records
          .slice(0, paginationParams.limit)
          .map((r) => formatVoter(r.get("v")));

        const countQuery = `
          MATCH (v:Voter)-[:VOTES_AT]->(b:Booth {booth_id: $booth_id})
          RETURN COUNT(v) as total
        `;
        const countRecords = await executeQuery(countQuery, { booth_id });
        const totalCount = countRecords[0].get("total").toNumber();

        return {
          edges: voters.map((voter, index) => ({
            node: voter,
            cursor: Buffer.from(
              (paginationParams.skip + index).toString(),
            ).toString("base64"),
          })),
          pageInfo: {
            has_next_page: hasNextPage,
            has_previous_page: paginationParams.skip > 0,
            start_cursor:
              paginationParams.skip > 0
                ? Buffer.from(paginationParams.skip.toString()).toString(
                    "base64",
                  )
                : null,
            end_cursor: hasNextPage
              ? Buffer.from(
                  (paginationParams.skip + paginationParams.limit).toString(),
                ).toString("base64")
              : null,
          },
          total_count: totalCount,
        };
      } catch (error) {
        logger.error("Error fetching booth voters:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for votersByBooth query");
          const voters = MOCK_VOTERS.filter((v) => v.booth_id === booth_id);
          return toVoterConnection(sortMockVoters(voters), pagination);
        }
        throw new GraphQLError(
          `Failed to fetch booth voters: ${error.message}`,
        );
      }
    },

    /**
     * Get voters in a constituency
     */
    votersByConstituency: async (_, { constituency_id, pagination }) => {
      try {
        const paginationParams = getPaginationParams(pagination);

        const query = `
          MATCH (v:Voter)-[:BELONGS_TO_CONSTITUENCY]->(c:Constituency {constituency_id: $constituency_id})
          ORDER BY v.name ASC
          SKIP ${paginationParams.skip}
          LIMIT ${paginationParams.limit + 1}
          RETURN v
        `;

        const records = await executeQuery(query, { constituency_id });
        const hasNextPage = records.length > paginationParams.limit;
        const voters = records
          .slice(0, paginationParams.limit)
          .map((r) => formatVoter(r.get("v")));

        const countQuery = `
          MATCH (v:Voter)-[:BELONGS_TO_CONSTITUENCY]->(c:Constituency {constituency_id: $constituency_id})
          RETURN COUNT(v) as total
        `;
        const countRecords = await executeQuery(countQuery, {
          constituency_id,
        });
        const totalCount = countRecords[0].get("total").toNumber();

        return {
          edges: voters.map((voter, index) => ({
            node: voter,
            cursor: Buffer.from(
              (paginationParams.skip + index).toString(),
            ).toString("base64"),
          })),
          pageInfo: {
            has_next_page: hasNextPage,
            has_previous_page: paginationParams.skip > 0,
            start_cursor:
              paginationParams.skip > 0
                ? Buffer.from(paginationParams.skip.toString()).toString(
                    "base64",
                  )
                : null,
            end_cursor: hasNextPage
              ? Buffer.from(
                  (paginationParams.skip + paginationParams.limit).toString(),
                ).toString("base64")
              : null,
          },
          total_count: totalCount,
        };
      } catch (error) {
        logger.error("Error fetching constituency voters:", error);
        throw new GraphQLError(
          `Failed to fetch constituency voters: ${error.message}`,
        );
      }
    },

    /**
     * Get voters eligible for a scheme
     */
    votersEligibleForScheme: async (
      _,
      { scheme_id, booth_id, constituency_id, pagination },
    ) => {
      try {
        const paginationParams = getPaginationParams(pagination);

        let query = `
          MATCH (v:Voter)-[:ELIGIBLE_FOR]->(s:Scheme {scheme_id: $scheme_id})
        `;

        if (booth_id) {
          query += ` WHERE v.booth_id = '${booth_id}'`;
        } else if (constituency_id) {
          query += ` WHERE v.constituency_id = '${constituency_id}'`;
        }

        query += `
          ORDER BY v.name ASC
          SKIP ${paginationParams.skip}
          LIMIT ${paginationParams.limit + 1}
          RETURN v
        `;

        const records = await executeQuery(query, { scheme_id });
        const hasNextPage = records.length > paginationParams.limit;
        const voters = records
          .slice(0, paginationParams.limit)
          .map((r) => formatVoter(r.get("v")));

        let countQuery = `
          MATCH (v:Voter)-[:ELIGIBLE_FOR]->(s:Scheme {scheme_id: $scheme_id})
        `;

        if (booth_id) {
          countQuery += ` WHERE v.booth_id = '${booth_id}'`;
        } else if (constituency_id) {
          countQuery += ` WHERE v.constituency_id = '${constituency_id}'`;
        }

        countQuery += ` RETURN COUNT(v) as total`;

        const countRecords = await executeQuery(countQuery, { scheme_id });
        const totalCount = countRecords[0].get("total").toNumber();

        return {
          edges: voters.map((voter, index) => ({
            node: voter,
            cursor: Buffer.from(
              (paginationParams.skip + index).toString(),
            ).toString("base64"),
          })),
          pageInfo: {
            has_next_page: hasNextPage,
            has_previous_page: paginationParams.skip > 0,
            start_cursor:
              paginationParams.skip > 0
                ? Buffer.from(paginationParams.skip.toString()).toString(
                    "base64",
                  )
                : null,
            end_cursor: hasNextPage
              ? Buffer.from(
                  (paginationParams.skip + paginationParams.limit).toString(),
                ).toString("base64")
              : null,
          },
          total_count: totalCount,
        };
      } catch (error) {
        logger.error("Error fetching scheme eligible voters:", error);
        throw new GraphQLError(
          `Failed to fetch scheme eligible voters: ${error.message}`,
        );
      }
    },

    /**
     * Get high-risk voters
     */
    highRiskVoters: async (
      _,
      { booth_id, constituency_id, min_risk_score = 0.6, pagination },
    ) => {
      try {
        const paginationParams = getPaginationParams(pagination);

        let whereClause = `WHERE v.risk_score >= ${min_risk_score}`;

        if (booth_id) {
          whereClause += ` AND v.booth_id = '${booth_id}'`;
        } else if (constituency_id) {
          whereClause += ` AND v.constituency_id = '${constituency_id}'`;
        }

        const query = `
          MATCH (v:Voter)
          ${whereClause}
          ORDER BY v.risk_score DESC
          SKIP ${paginationParams.skip}
          LIMIT ${paginationParams.limit + 1}
          RETURN v
        `;

        const records = await executeQuery(query);
        const hasNextPage = records.length > paginationParams.limit;
        const voters = records
          .slice(0, paginationParams.limit)
          .map((r) => formatVoter(r.get("v")));

        const countQuery = `
          MATCH (v:Voter)
          ${whereClause}
          RETURN COUNT(v) as total
        `;

        const countRecords = await executeQuery(countQuery);
        const totalCount = countRecords[0].get("total").toNumber();

        return {
          edges: voters.map((voter, index) => ({
            node: voter,
            cursor: Buffer.from(
              (paginationParams.skip + index).toString(),
            ).toString("base64"),
          })),
          pageInfo: {
            has_next_page: hasNextPage,
            has_previous_page: paginationParams.skip > 0,
            start_cursor:
              paginationParams.skip > 0
                ? Buffer.from(paginationParams.skip.toString()).toString(
                    "base64",
                  )
                : null,
            end_cursor: hasNextPage
              ? Buffer.from(
                  (paginationParams.skip + paginationParams.limit).toString(),
                ).toString("base64")
              : null,
          },
          total_count: totalCount,
        };
      } catch (error) {
        logger.error("Error fetching high-risk voters:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for highRiskVoters query");
          let voters = MOCK_VOTERS.filter((v) => v.risk_score >= min_risk_score);
          if (booth_id) voters = voters.filter((v) => v.booth_id === booth_id);
          if (constituency_id)
            voters = voters.filter((v) => v.constituency_id === constituency_id);
          return toVoterConnection(
            sortMockVoters(voters, { field: "risk_score", order: "DESC" }),
            pagination,
          );
        }
        throw new GraphQLError(
          `Failed to fetch high-risk voters: ${error.message}`,
        );
      }
    },

    /**
     * Search voters by name
     */
    searchVoters: async (_, { query: searchQuery, pagination }) => {
      try {
        const paginationParams = getPaginationParams(pagination);
        const searchPattern = `(?iu).*${searchQuery}.*`;

        const query = `
          MATCH (v:Voter)
          WHERE v.name =~ $pattern
          ORDER BY v.name ASC
          SKIP ${paginationParams.skip}
          LIMIT ${paginationParams.limit + 1}
          RETURN v
        `;

        const records = await executeQuery(query, { pattern: searchPattern });
        const hasNextPage = records.length > paginationParams.limit;
        const voters = records
          .slice(0, paginationParams.limit)
          .map((r) => formatVoter(r.get("v")));

        const countQuery = `
          MATCH (v:Voter)
          WHERE v.name =~ $pattern
          RETURN COUNT(v) as total
        `;

        const countRecords = await executeQuery(countQuery, {
          pattern: searchPattern,
        });
        const totalCount = countRecords[0].get("total").toNumber();

        return {
          edges: voters.map((voter, index) => ({
            node: voter,
            cursor: Buffer.from(
              (paginationParams.skip + index).toString(),
            ).toString("base64"),
          })),
          pageInfo: {
            has_next_page: hasNextPage,
            has_previous_page: paginationParams.skip > 0,
            start_cursor:
              paginationParams.skip > 0
                ? Buffer.from(paginationParams.skip.toString()).toString(
                    "base64",
                  )
                : null,
            end_cursor: hasNextPage
              ? Buffer.from(
                  (paginationParams.skip + paginationParams.limit).toString(),
                ).toString("base64")
              : null,
          },
          total_count: totalCount,
        };
      } catch (error) {
        logger.error("Error searching voters:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for searchVoters query");
          const q = String(searchQuery || "").toLowerCase();
          const voters = MOCK_VOTERS.filter((v) =>
            v.name.toLowerCase().includes(q),
          );
          return toVoterConnection(sortMockVoters(voters), pagination);
        }
        throw new GraphQLError(`Failed to search voters: ${error.message}`);
      }
    },

    // ===== BOOTH QUERIES =====

    /**
     * Get single booth
     */
    booth: async (_, { booth_id }) => {
      try {
        const query = `
          MATCH (b:Booth {booth_id: $booth_id})
          OPTIONAL MATCH (b)-[:IN_CONSTITUENCY]->(c:Constituency)
          RETURN b, c
        `;

        const records = await executeQuery(query, { booth_id });

        if (records.length === 0) return null;

        const record = records[0];
        return formatBooth(record.get("b"), {
          constituency: record.get("c"),
        });
      } catch (error) {
        logger.error("Error fetching booth:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for booth query");
          return MOCK_BOOTHS.find((b) => b.booth_id === booth_id) || null;
        }
        throw new GraphQLError(`Failed to fetch booth: ${error.message}`);
      }
    },

    /**
     * Get all booths
     */
    allBooths: async () => {
      try {
        const query = `
          MATCH (b:Booth)
          OPTIONAL MATCH (b)-[:IN_CONSTITUENCY]->(c:Constituency)
          RETURN b, c
          ORDER BY b.booth_id
        `;

        const records = await executeQuery(query);
        return records.map((r) =>
          formatBooth(r.get("b"), { constituency: r.get("c") }),
        );
      } catch (error) {
        logger.error("Error fetching all booths:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for allBooths query");
          return MOCK_BOOTHS;
        }
        throw new GraphQLError(`Failed to fetch booths: ${error.message}`);
      }
    },

    /**
     * Get booths in a constituency
     */
    boothsByConstituency: async (_, { constituency_id }) => {
      try {
        const query = `
          MATCH (b:Booth)-[:IN_CONSTITUENCY]->(c:Constituency {constituency_id: $constituency_id})
          RETURN b, c
          ORDER BY b.booth_id
        `;

        const records = await executeQuery(query, { constituency_id });
        return records.map((r) =>
          formatBooth(r.get("b"), { constituency: r.get("c") }),
        );
      } catch (error) {
        logger.error("Error fetching constituency booths:", error);
        throw new GraphQLError(
          `Failed to fetch constituency booths: ${error.message}`,
        );
      }
    },

    /**
     * Get booth statistics (aggregates)
     */
    boothStats: async (_, { booth_id }) => {
      try {
        const query = `
          MATCH (v:Voter)-[:VOTES_AT]->(b:Booth {booth_id: $booth_id})
          RETURN {
            booth_id: b.booth_id,
            total_voters: COUNT(v),
            pro_incumbent_count: COUNT(CASE WHEN v.political_leaning = 'Pro-incumbent' THEN 1 END),
            anti_incumbent_count: COUNT(CASE WHEN v.political_leaning = 'Anti-incumbent' THEN 1 END),
            undecided_count: COUNT(CASE WHEN v.political_leaning = 'Undecided' THEN 1 END),
            first_time_count: COUNT(CASE WHEN v.political_leaning = 'First-time' THEN 1 END),
            high_engagement_count: COUNT(CASE WHEN v.engagement_level = 'High' THEN 1 END),
            medium_engagement_count: COUNT(CASE WHEN v.engagement_level = 'Medium' THEN 1 END),
            low_engagement_count: COUNT(CASE WHEN v.engagement_level = 'Low' THEN 1 END),
            avg_risk_score: apoc.math.round(AVG(v.risk_score), 2),
            avg_engagement_score: apoc.math.round(AVG(v.engagement_score), 2),
            misinformation_susceptible_count: COUNT(CASE WHEN v.risk_profile = 'Misinformation-susceptible' THEN 1 END),
            informed_count: COUNT(CASE WHEN v.risk_profile = 'Informed' THEN 1 END),
            neutral_count: COUNT(CASE WHEN v.risk_profile = 'Neutral' THEN 1 END)
          } as stats
        `;

        const records = await executeQuery(query, { booth_id });

        if (records.length === 0) {
          throw new GraphQLError(`Booth ${booth_id} not found`);
        }

        return records[0].get("stats");
      } catch (error) {
        logger.error("Error fetching booth stats:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for boothStats query");
          return getMockBoothStats(booth_id);
        }
        throw new GraphQLError(`Failed to fetch booth stats: ${error.message}`);
      }
    },

    // ===== CONSTITUENCY QUERIES =====

    /**
     * Get single constituency
     */
    constituency: async (_, { constituency_id }) => {
      try {
        const query = `
          MATCH (c:Constituency {constituency_id: $constituency_id})
          RETURN c
        `;

        const records = await executeQuery(query, { constituency_id });

        if (records.length === 0) return null;

        return formatConstituency(records[0].get("c"));
      } catch (error) {
        logger.error("Error fetching constituency:", error);
        throw new GraphQLError(
          `Failed to fetch constituency: ${error.message}`,
        );
      }
    },

    /**
     * Get all constituencies
     */
    allConstituencies: async () => {
      try {
        const query = `
          MATCH (c:Constituency)
          RETURN c
          ORDER BY c.constituency_id
        `;

        const records = await executeQuery(query);
        return records.map((r) => formatConstituency(r.get("c")));
      } catch (error) {
        logger.error("Error fetching constituencies:", error);
        throw new GraphQLError(
          `Failed to fetch constituencies: ${error.message}`,
        );
      }
    },

    // ===== SCHEME QUERIES =====

    /**
     * Get all schemes
     */
    schemes: async () => {
      try {
        const query = `
          MATCH (s:Scheme)
          RETURN s
          ORDER BY s.scheme_id
        `;

        const records = await executeQuery(query);
        return records.map((r) => formatScheme(r.get("s")));
      } catch (error) {
        logger.error("Error fetching schemes:", error);
        throw new GraphQLError(`Failed to fetch schemes: ${error.message}`);
      }
    },

    /**
     * Get single scheme
     */
    scheme: async (_, { scheme_id }) => {
      try {
        const query = `
          MATCH (s:Scheme {scheme_id: $scheme_id})
          RETURN s
        `;

        const records = await executeQuery(query, { scheme_id });

        if (records.length === 0) return null;

        return formatScheme(records[0].get("s"));
      } catch (error) {
        logger.error("Error fetching scheme:", error);
        throw new GraphQLError(`Failed to fetch scheme: ${error.message}`);
      }
    },

    /**
     * Get scheme beneficiary stats per booth
     */
    schemeBeneficiaryStats: async (_, { booth_id }) => {
      try {
        const query = `
          MATCH (v:Voter {booth_id: $booth_id})-[:ELIGIBLE_FOR]->(s:Scheme)
          RETURN s.scheme_id as scheme_id, s.name as scheme_name, COUNT(v) as beneficiary_count
          ORDER BY beneficiary_count DESC
        `;

        const records = await executeQuery(query, { booth_id });
        return records.map((r) => ({
          scheme_id: r.get("scheme_id"),
          scheme_name: r.get("scheme_name"),
          beneficiary_count: r.get("beneficiary_count").toNumber(),
        }));
      } catch (error) {
        logger.error("Error fetching scheme stats:", error);
        throw new GraphQLError(
          `Failed to fetch scheme stats: ${error.message}`,
        );
      }
    },

    // ===== ANALYTICS & SEGMENTATION =====

    /**
     * Get voter segmentation statistics
     */
    segmentationStats: async (_, { booth_id, constituency_id, district }) => {
      try {
        let whereClause = "";

        if (booth_id) {
          whereClause = ` WHERE v.booth_id = '${booth_id}'`;
        } else if (constituency_id) {
          whereClause = ` WHERE v.constituency_id = '${constituency_id}'`;
        } else if (district) {
          whereClause = ` WHERE v.district = '${district}'`;
        }

        const query = `
          MATCH (v:Voter)
          ${whereClause}
          WITH COUNT(v) as total
          MATCH (v:Voter)
          ${whereClause}
          RETURN {
            by_political_leaning: [
              {category: 'Pro-incumbent', count: COUNT(CASE WHEN v.political_leaning = 'Pro-incumbent' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.political_leaning = 'Pro-incumbent' THEN 1 END) / total, 2)},
              {category: 'Anti-incumbent', count: COUNT(CASE WHEN v.political_leaning = 'Anti-incumbent' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.political_leaning = 'Anti-incumbent' THEN 1 END) / total, 2)},
              {category: 'Undecided', count: COUNT(CASE WHEN v.political_leaning = 'Undecided' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.political_leaning = 'Undecided' THEN 1 END) / total, 2)},
              {category: 'First-time', count: COUNT(CASE WHEN v.political_leaning = 'First-time' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.political_leaning = 'First-time' THEN 1 END) / total, 2)}
            ],
            by_engagement_level: [
              {category: 'High', count: COUNT(CASE WHEN v.engagement_level = 'High' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.engagement_level = 'High' THEN 1 END) / total, 2)},
              {category: 'Medium', count: COUNT(CASE WHEN v.engagement_level = 'Medium' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.engagement_level = 'Medium' THEN 1 END) / total, 2)},
              {category: 'Low', count: COUNT(CASE WHEN v.engagement_level = 'Low' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.engagement_level = 'Low' THEN 1 END) / total, 2)},
              {category: 'Unreachable', count: COUNT(CASE WHEN v.engagement_level = 'Unreachable' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.engagement_level = 'Unreachable' THEN 1 END) / total, 2)}
            ],
            by_risk_profile: [
              {category: 'Misinformation-susceptible', count: COUNT(CASE WHEN v.risk_profile = 'Misinformation-susceptible' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.risk_profile = 'Misinformation-susceptible' THEN 1 END) / total, 2)},
              {category: 'Neutral', count: COUNT(CASE WHEN v.risk_profile = 'Neutral' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.risk_profile = 'Neutral' THEN 1 END) / total, 2)},
              {category: 'Informed', count: COUNT(CASE WHEN v.risk_profile = 'Informed' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.risk_profile = 'Informed' THEN 1 END) / total, 2)}
            ],
            by_age_group: [
              {category: '18-25', count: COUNT(CASE WHEN v.age_group = '18-25' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.age_group = '18-25' THEN 1 END) / total, 2)},
              {category: '26-40', count: COUNT(CASE WHEN v.age_group = '26-40' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.age_group = '26-40' THEN 1 END) / total, 2)},
              {category: '41-60', count: COUNT(CASE WHEN v.age_group = '41-60' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.age_group = '41-60' THEN 1 END) / total, 2)},
              {category: '60+', count: COUNT(CASE WHEN v.age_group = '60+' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.age_group = '60+' THEN 1 END) / total, 2)}
            ],
            by_language: [
              {category: 'English', count: COUNT(CASE WHEN v.language_preference = 'English' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.language_preference = 'English' THEN 1 END) / total, 2)},
              {category: 'Hindi', count: COUNT(CASE WHEN v.language_preference = 'Hindi' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.language_preference = 'Hindi' THEN 1 END) / total, 2)},
              {category: 'Hinglish', count: COUNT(CASE WHEN v.language_preference = 'Hinglish' THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.language_preference = 'Hinglish' THEN 1 END) / total, 2)},
              {category: 'Regional', count: COUNT(CASE WHEN v.language_preference IN ['Tamil', 'Telugu', 'Kannada', 'Punjabi', 'Bengali', 'Marathi', 'Gujarati', 'Urdu'] THEN 1 END), percentage: apoc.math.round(100.0 * COUNT(CASE WHEN v.language_preference IN ['Tamil', 'Telugu', 'Kannada', 'Punjabi', 'Bengali', 'Marathi', 'Gujarati', 'Urdu'] THEN 1 END) / total, 2)}
            ]
          } as stats
        `;

        const records = await executeQuery(query);

        if (records.length === 0) {
          throw new GraphQLError("No voters found for the specified filter");
        }

        return records[0].get("stats");
      } catch (error) {
        logger.error("Error fetching segmentation stats:", error);
        if (useMockFallback(error)) {
          logger.warn("Using mock fallback for segmentationStats query");
          return getMockSegmentationStats({ booth_id, constituency_id, district });
        }
        throw new GraphQLError(
          `Failed to fetch segmentation stats: ${error.message}`,
        );
      }
    },

    /**
     * Get voters by political leaning
     */
    votersByPoliticalLeaning: async (_, { booth_id, constituency_id }) => {
      try {
        let whereClause = "";

        if (booth_id) {
          whereClause = ` WHERE v.booth_id = '${booth_id}'`;
        } else if (constituency_id) {
          whereClause = ` WHERE v.constituency_id = '${constituency_id}'`;
        }

        const query = `
          MATCH (v:Voter)
          ${whereClause}
          RETURN v.political_leaning as category, COUNT(v) as count, 
                 apoc.math.round(100.0 * COUNT(v) / (SELECT COUNT(v2) FROM (MATCH (v2:Voter) ${whereClause} RETURN v2)) * 1.0, 2) as percentage
          ORDER BY count DESC
        `;

        const records = await executeQuery(query);
        return records.map((r) => ({
          category: r.get("category"),
          count: r.get("count").toNumber(),
          percentage: r.get("percentage"),
        }));
      } catch (error) {
        logger.error("Error fetching political leaning stats:", error);
        throw new GraphQLError(
          `Failed to fetch political leaning stats: ${error.message}`,
        );
      }
    },

    /**
     * Get voters by engagement level
     */
    votersByEngagement: async (_, { booth_id, constituency_id }) => {
      try {
        let whereClause = "";

        if (booth_id) {
          whereClause = ` WHERE v.booth_id = '${booth_id}'`;
        } else if (constituency_id) {
          whereClause = ` WHERE v.constituency_id = '${constituency_id}'`;
        }

        const query = `
          MATCH (v:Voter)
          ${whereClause}
          RETURN v.engagement_level as category, COUNT(v) as count,
                 apoc.math.round(100.0 * COUNT(v) / (SELECT COUNT(v2) FROM (MATCH (v2:Voter) ${whereClause} RETURN v2)) * 1.0, 2) as percentage
          ORDER BY count DESC
        `;

        const records = await executeQuery(query);
        return records.map((r) => ({
          category: r.get("category"),
          count: r.get("count").toNumber(),
          percentage: r.get("percentage"),
        }));
      } catch (error) {
        logger.error("Error fetching engagement stats:", error);
        throw new GraphQLError(
          `Failed to fetch engagement stats: ${error.message}`,
        );
      }
    },

    // ===== GEOGRAPHIC QUERIES =====

    /**
     * Get state information
     */
    state: async (_, { state_id }) => {
      try {
        const query = `
          MATCH (s:State {state_id: $state_id})
          RETURN s
        `;

        const records = await executeQuery(query, { state_id });

        if (records.length === 0) return null;

        const state = records[0].get("s").properties;
        return {
          state_id: state.state_id,
          name: state.name,
          total_districts: state.total_districts,
          created_at: state.created_at.toString(),
        };
      } catch (error) {
        logger.error("Error fetching state:", error);
        throw new GraphQLError(`Failed to fetch state: ${error.message}`);
      }
    },

    /**
     * Get all states
     */
    allStates: async () => {
      try {
        const query = `
          MATCH (s:State)
          RETURN s
          ORDER BY s.state_id
        `;

        const records = await executeQuery(query);
        return records.map((r) => {
          const state = r.get("s").properties;
          return {
            state_id: state.state_id,
            name: state.name,
            total_districts: state.total_districts,
            created_at: state.created_at.toString(),
          };
        });
      } catch (error) {
        logger.error("Error fetching states:", error);
        throw new GraphQLError(`Failed to fetch states: ${error.message}`);
      }
    },

    /**
     * Get district information
     */
    district: async (_, { district_id }) => {
      try {
        const query = `
          MATCH (d:District {district_id: $district_id})
          RETURN d
        `;

        const records = await executeQuery(query, { district_id });

        if (records.length === 0) return null;

        const district = records[0].get("d").properties;
        return {
          district_id: district.district_id,
          name: district.name,
          state: district.state,
          total_constituencies: district.total_constituencies,
          total_booths: district.total_booths,
          created_at: district.created_at.toString(),
        };
      } catch (error) {
        logger.error("Error fetching district:", error);
        throw new GraphQLError(`Failed to fetch district: ${error.message}`);
      }
    },

    // ===== HEALTH CHECK =====

    /**
     * Check Neo4j database health
     */
    health: async () => {
      try {
        const query = "RETURN 1 as test";
        await executeQuery(query);

        return {
          status: "healthy",
          database: "neo4j",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        logger.error("Health check failed:", error);
        if (useMockFallback(error)) {
          return {
            status: "degraded",
            database: "mock",
            timestamp: new Date().toISOString(),
          };
        }
        throw new GraphQLError(`Database unhealthy: ${error.message}`);
      }
    },
  },
};
