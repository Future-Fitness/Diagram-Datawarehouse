// services/diagramSearchService.js
const Diagram = require('../models/Diagram');

/**
 * Service for handling Atlas Search queries on the Diagram collection
 */
class DiagramSearchService {
  /**
   * Search diagrams by text query
   * @param {string} query - The search query text
   * @param {Object} options - Search options
   * @param {number} options.limit - Maximum number of results (default: 20)
   * @param {number} options.skip - Number of results to skip (for pagination)
   * @param {string[]} options.subjects - Filter by specific subjects
   * @param {string} options.quality - Filter by quality rating
   * @returns {Promise<Array>} - Search results
   */
  async searchDiagrams(query, options = {}) {
    const {
      limit = 20,
      skip = 0,
      subjects,
      quality,
      sourceType,
      dateFrom,
      dateTo,
      format
    } = options;

    // Build the search pipeline
    const searchPipeline = [];

    // Main search stage
    const searchStage = {
      $search: {
        "compound": {
          "should": [
            {
              "text": {
                "query": query,
                "path": "title",
                "score": { "boost": { "value": 3 } }
              }
            },
            {
              "text": {
                "query": query,
                "path": "extracted_text",
                "score": { "boost": { "value": 2 } }
              }
            },
            {
              "text": {
                "query": query,
                "path": "notes"
              }
            },
            {
              "text": {
                "query": query,
                "path": "author"
              }
            },
            {
              "text": {
                "query": query,
                "path": "tags"
              }
            }
          ]
        }
      }
    };

    searchPipeline.push(searchStage);

    // Add filters if provided
    const matchFilters = {};
    
    if (subjects && subjects.length > 0) {
      matchFilters.subjects = { $in: subjects };
    }
    
    if (quality) {
      matchFilters.quality_rating = quality;
    }
    
    if (sourceType) {
      matchFilters.sourceType = sourceType;
    }
    
    if (format) {
      matchFilters["file_info.format"] = format;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      matchFilters.upload_date = {};
      if (dateFrom) {
        matchFilters.upload_date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        matchFilters.upload_date.$lte = new Date(dateTo);
      }
    }
    
    // Add match stage if there are filters
    if (Object.keys(matchFilters).length > 0) {
      searchPipeline.push({ $match: matchFilters });
    }

    // Add projection stage
    searchPipeline.push({
      $project: {
        _id: 1,
        title: 1,
        image_url: 1,
        filename: 1,
        subjects: 1,
        tags: 1,
        quality_rating: 1,
        sourceType: 1,
        sub_category: 1,
        upload_date: 1,
        searchScore: { $meta: "searchScore" }
      }
    });

    // Add sort stage
    searchPipeline.push({
      $sort: { searchScore: -1 }
    });

    // Add pagination
    searchPipeline.push({ $skip: skip });
    searchPipeline.push({ $limit: limit });

    // Execute search
    const results = await Diagram.aggregate(searchPipeline);
    
    // Get total count with the same filters
    const countPipeline = [...searchPipeline];
    // Remove pagination and projection for counting
    countPipeline.splice(countPipeline.length - 3, 3);
    countPipeline.push({ $count: "total" });
    
    const countResult = await Diagram.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      results,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + results.length < total
      }
    };
  }

  /**
   * Advanced search with more complex query options
   * @param {Object} searchParams - Complex search parameters
   * @returns {Promise<Array>} - Search results
   */
  async advancedSearch(searchParams) {
    const {
      textQuery,
      subjects,
      tags,
      quality,
      minQualityScore,
      dateRange,
      format,
      limit = 20,
      skip = 0,
      sortBy = "searchScore"
    } = searchParams;

    // Build compound search query
    const mustClauses = [];
    const shouldClauses = [];
    const mustNotClauses = [];

    // Text search
    if (textQuery) {
      shouldClauses.push(
        {
          "text": {
            "query": textQuery,
            "path": "title",
            "score": { "boost": { "value": 3 } }
          }
        },
        {
          "text": {
            "query": textQuery,
            "path": "extracted_text",
            "score": { "boost": { "value": 2 } }
          }
        },
        {
          "text": {
            "query": textQuery,
            "path": "notes"
          }
        }
      );
    }

    // Subject filter
    if (subjects && subjects.length > 0) {
      mustClauses.push({
        "text": {
          "query": subjects,
          "path": "subjects"
        }
      });
    }

    // Tags filter
    if (tags && tags.length > 0) {
      mustClauses.push({
        "text": {
          "query": tags,
          "path": "tags"
        }
      });
    }

    // Build search pipeline
    const searchPipeline = [];

    // Only add search stage if we have search conditions
    if (mustClauses.length > 0 || shouldClauses.length > 0 || mustNotClauses.length > 0) {
      const searchStage = {
        $search: {
          "compound": {}
        }
      };

      if (mustClauses.length > 0) {
        searchStage.$search.compound.must = mustClauses;
      }

      if (shouldClauses.length > 0) {
        searchStage.$search.compound.should = shouldClauses;
      }

      if (mustNotClauses.length > 0) {
        searchStage.$search.compound.mustNot = mustNotClauses;
      }

      searchPipeline.push(searchStage);
    }

    // Add additional filters
    const matchFilters = {};

    if (quality) {
      matchFilters.quality_rating = quality;
    }

    if (minQualityScore) {
      matchFilters['quality_scores.overall_quality'] = { $gte: minQualityScore };
    }

    if (format) {
      matchFilters['file_info.format'] = format;
    }

    if (dateRange) {
      matchFilters.upload_date = {};
      if (dateRange.from) {
        matchFilters.upload_date.$gte = new Date(dateRange.from);
      }
      if (dateRange.to) {
        matchFilters.upload_date.$lte = new Date(dateRange.to);
      }
    }

    if (Object.keys(matchFilters).length > 0) {
      searchPipeline.push({ $match: matchFilters });
    }

    // Add projection
    searchPipeline.push({
      $project: {
        _id: 1,
        title: 1,
        image_url: 1,
        filename: 1,
        subjects: 1,
        tags: 1,
        sub_category: 1,
        sourceType: 1,
        quality_rating: 1,
        upload_date: 1,
        searchScore: { $meta: "searchScore" },
        quality_scores: 1
      }
    });

    // Add sorting
    const sortStage = {};
    if (sortBy === "searchScore" && (mustClauses.length > 0 || shouldClauses.length > 0)) {
      sortStage.$sort = { searchScore: -1 };
    } else if (sortBy === "date") {
      sortStage.$sort = { upload_date: -1 };
    } else if (sortBy === "quality") {
      sortStage.$sort = { "quality_scores.overall_quality": -1 };
    } else {
      sortStage.$sort = { title: 1 };
    }
    searchPipeline.push(sortStage);

    // Add pagination
    searchPipeline.push({ $skip: skip });
    searchPipeline.push({ $limit: limit });

    // Execute search
    const results = await Diagram.aggregate(searchPipeline);
    
    // Get total count
    const countPipeline = [...searchPipeline];
    // Remove pagination and projection for counting
    countPipeline.splice(countPipeline.length - 3, 3);
    countPipeline.push({ $count: "total" });
    
    const countResult = await Diagram.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      results,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + results.length < total
      }
    };
  }

  /**
   * Get autocomplete suggestions for diagram search
   * @param {string} prefix - The prefix to get suggestions for
   * @param {number} limit - Maximum number of suggestions
   * @returns {Promise<Array>} - Autocomplete suggestions
   */
  async getAutocompleteSuggestions(prefix, limit = 5) {
    if (!prefix || prefix.length < 2) {
      return [];
    }

    const pipeline = [
      {
        $search: {
          "autocomplete": {
            "query": prefix,
            "path": "title",
            "fuzzy": {
              "maxEdits": 1
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          image_url: 1,
          score: { $meta: "searchScore" }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      }
    ];

    return await Diagram.aggregate(pipeline);
  }

  /**
   * Find similar diagrams based on content
   * @param {string} diagramId - ID of the source diagram
   * @param {number} limit - Maximum number of similar diagrams to return
   * @returns {Promise<Array>} - Similar diagrams
   */
  async findSimilarDiagrams(diagramId, limit = 5) {
    // First, get the source diagram
    const sourceDiagram = await Diagram.findById(diagramId);
    
    if (!sourceDiagram) {
      throw new Error("Diagram not found");
    }

    // Build search query based on source diagram attributes
    const pipeline = [
      {
        $search: {
          "compound": {
            "should": [
              {
                "text": {
                  "query": sourceDiagram.title,
                  "path": "title"
                }
              },
              {
                "text": {
                  "query": sourceDiagram.subjects.join(" "),
                  "path": "subjects"
                }
              },
              {
                "text": {
                  "query": sourceDiagram.extracted_text || "",
                  "path": "extracted_text"
                }
              }
            ]
          }
        }
      },
      {
        $match: {
          _id: { $ne: sourceDiagram._id }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          image_url: 1,
          subjects: 1,
          tags: 1,
          quality_rating: 1,
          score: { $meta: "searchScore" }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      }
    ];

    return await Diagram.aggregate(pipeline);
  }
}

module.exports = new DiagramSearchService();