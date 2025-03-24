// controllers/diagramSearchController.js
const diagramSearchService = require('../repositories/diagramSearchService');

/**
 * Controller for handling diagram search requests
 */
class DiagramSearchController {
  /**
   * Search diagrams by query text
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchDiagrams(req, res) {
    try {
      const { query, limit, page, subjects, quality, sourceType, dateFrom, dateTo, format } = req.query;
      
      // Calculate skip for pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 20;
      const skip = (pageNumber - 1) * pageSize;
      
      // Parse subjects array if provided
      const parsedSubjects = subjects ? JSON.parse(subjects) : undefined;
      
      const results = await diagramSearchService.searchDiagrams(query, {
        limit: pageSize,
        skip,
        subjects: parsedSubjects,
        quality,
        sourceType,
        dateFrom,
        dateTo,
        format
      });
      
      return res.status(200).json(results);
    } catch (error) {
      console.error('Error searching diagrams:', error);
      return res.status(500).json({ error: 'Failed to search diagrams' });
    }
  }
  
  /**
   * Advanced search with more complex filtering options
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async advancedSearch(req, res) {
    try {
      // Extract search parameters from request body
      const {
        textQuery,
        subjects,
        tags,
        quality,
        minQualityScore,
        dateRange,
        format,
        limit,
        page,
        sortBy
      } = req.body;
      
      // Calculate skip for pagination
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 20;
      const skip = (pageNumber - 1) * pageSize;
      
      const results = await diagramSearchService.advancedSearch({
        textQuery,
        subjects,
        tags,
        quality,
        minQualityScore,
        dateRange,
        format,
        limit: pageSize,
        skip,
        sortBy
      });
      
      return res.status(200).json(results);
    } catch (error) {
      console.error('Error in advanced search:', error);
      return res.status(500).json({ error: 'Failed to perform advanced search' });
    }
  }
  
  /**
   * Get autocomplete suggestions for diagram search
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAutocompleteSuggestions(req, res) {
    try {
      const { prefix, limit } = req.query;
      
      const suggestions = await diagramSearchService.getAutocompleteSuggestions(
        prefix,
        parseInt(limit) || 5
      );
      
      return res.status(200).json(suggestions);
    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error);
      return res.status(500).json({ error: 'Failed to get suggestions' });
    }
  }
  
  /**
   * Find similar diagrams based on a source diagram
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async findSimilarDiagrams(req, res) {
    try {
      const { diagramId } = req.params;
      const { limit } = req.query;
      
      const similarDiagrams = await diagramSearchService.findSimilarDiagrams(
        diagramId,
        parseInt(limit) || 5
      );
      
      return res.status(200).json(similarDiagrams);
    } catch (error) {
      console.error('Error finding similar diagrams:', error);
      return res.status(500).json({ error: 'Failed to find similar diagrams' });
    }
  }
}

module.exports = new DiagramSearchController();