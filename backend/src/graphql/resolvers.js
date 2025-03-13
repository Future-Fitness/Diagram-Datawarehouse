const Diagram = require("../models/Diagram");

const resolvers = {
  Query: {
    // ✅ Fetch all diagrams with pagination
    getAllDiagrams: async (_, { page = 1, limit = 10 }) => {
      try {
        const total = await Diagram.countDocuments();
        const totalPages = Math.ceil(total / limit);

        const diagrams = await Diagram.find({ image_url: { $exists: true } })
          .sort({ created_at: -1 }) // Sort by newest
          .skip((page - 1) * limit)
          .limit(limit);

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
        const diagram = await Diagram.findById(id);
        if (!diagram) throw new Error("Diagram not found");
        return diagram;
      } catch (error) {
        throw new Error("Error retrieving diagram");
      }
    },
  },

  Mutation: {
    // ✅ Add a new diagram with validation
    // addDiagram: async (_, { input }) => {
    //   try {
    //     if (!input.image_url || !input.title || !input.category || !input.subjectId || !input.diagramTypeId) {
    //       throw new Error("Required fields are missing!");
    //     }

    //     const newDiagram = new Diagram(input);
    //     await newDiagram.save();
    //     return newDiagram;
    //   } catch (error) {
    //     throw new Error("Error adding diagram");
    //   }
    // },

    // ✅ Delete a diagram by ID
    // deleteDiagram: async (_, { id }) => {
    //   try {
    //     const deleted = await Diagram.findByIdAndDelete(id);
    //     if (!deleted) throw new Error("Diagram not found");
    //     return "Diagram deleted successfully!";
    //   } catch (error) {
    //     throw new Error("Error deleting diagram");
    //   }
    // },
  },
};

module.exports = resolvers;
