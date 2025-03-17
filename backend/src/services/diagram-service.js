const diagramType = require("../models/DiagramType");

async function createDiagramType(name, description, category) {
  try {
    const Diagram = {
      name,
      description,
      category,
    };
    console.log(Diagram);
    const newDaigram = await diagramType.create(Diagram);
    // return Diagram;
    return newDaigram;
  } catch (error) {
    console.log(error);
    throw new Error("Error in creating Diagram Type");
  }
}

async function getAllDiagramsType() {
  try {
    const diagrams = await diagramType.find({});
    return diagrams;
  } catch (error) {
    console.log(error);
    throw new Error("Error in getting Diagram Type");
  }
}
module.exports = {
  createDiagramType,
  getAllDiagramsType,
};
