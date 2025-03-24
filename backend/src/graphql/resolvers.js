const { default: mongoose } = require("mongoose");
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
          .populate("subjectId")

          
          

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
    getAllDiagramsBySubjectType: async (_, { subjectId, page = 1, limit = 10 }) => {
      try {
        // ✅ Ensure subjectId is converted to ObjectId
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
          throw new Error("Invalid subjectId format");
        }

        const total = await Diagram.countDocuments({ subjectId });
        const totalPages = Math.ceil(total / limit);

        const diagrams = await Diagram.find({ subjectId: new mongoose.Types.ObjectId(subjectId) })
          .sort({ created_at: -1 }) // ✅ Fixed field name
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("subjectId")


        return {
          diagrams,
          total,
          totalPages,
          currentPage: page,
        };
      } catch (error) {
        console.error("❌ Error fetching diagrams by subject:", error.message);
        throw new Error("Error fetching diagrams by subject");
      }
    },
  },
};
module.exports = resolvers;
