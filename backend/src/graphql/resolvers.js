const { default: mongoose } = require("mongoose");
const Diagram = require("../models/Diagram");

const resolvers = {
  Query: {
    // ✅ Fetch all diagrams (Only pagination)
    getAllDiagrams: async (_, { page = 1, limit = 10 }) => {
      try {
        console.log("Fetching diagrams with page:", page, "and limit:", limit);
    
        const total = await DiagramType.countDocuments();
        console.log("Total diagrams:", total);
    
        const diagrams = await DiagramType.find()
          .sort({ created_at: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
    
        console.log("Fetched diagrams:", diagrams);
    
        return {
          diagrams,
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        };
      } catch (error) {
        console.error("❌ Error in getAllDiagrams resolver:", error.message);
        console.error("❌ Stack trace:", error.stack);
        throw new Error("Error fetching diagrams");
      }
    },

    // ✅ Fetch a single diagram by ID
    getDiagramById: async (_, { id }) => {
      try {
        return await Diagram.findById(id).populate("diagrams");
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
