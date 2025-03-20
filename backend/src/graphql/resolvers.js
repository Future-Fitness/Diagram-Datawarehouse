const Diagram = require("../models/Diagram");

const resolvers = {
  Query: {
    // ✅ Fetch all diagrams (Only pagination)
    getAllDiagrams: async (_, { page = 1, limit = 10 }) => {
      try {
        const total = await Diagram.countDocuments();
        const totalPages = Math.ceil(total / limit);

        const diagrams = await Diagram.find()
          .sort({ created_at: -1 }) // Sort by newest first
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("subjectId");
          
          

        return {
          diagrams,
          total,
          totalPages,
          currentPage: page,
        };
      } catch (error) {
        throw new Error("Error fetching diagrams");
      }
    },

    // ✅ Fetch a single diagram by ID
    getDiagramById: async (_, { id }) => {
      try {
        return await Diagram.findById(id);
      } catch (error) {
        throw new Error("Error fetching diagram");
      }
    },
    // fetch all images with subject type
    getAllDiagramsBySubjectType: async (_, { subjectId, page, limit }) => {
      try {
        limit = limit || 10;
        page = page || 1;
        const total = await Diagram.countDocuments({ subjectId });
        const totalPages = Math.ceil(total / limit);
        const diagrams = await Diagram.find({ subjectId })
          .sort({ created_at: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("subjectId");
        return {
          diagrams,
          total,
          totalPages,
          currentPage: page,
        };
      } catch (error) {
        console.log(error);
        throw new Error("Error fetching diagrams");
      }
    },
  },
};

module.exports = resolvers;
