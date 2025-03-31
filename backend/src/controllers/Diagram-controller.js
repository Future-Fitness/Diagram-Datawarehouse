const diagramService = require("../services/diagram-service");

const createDiagramType = async (req, res) => {
  const { name, description, category } = req.body;
  try {
    const diagramType = await diagramService.createDiagramType(
      name,
      description,
      category
    );
    return res.status(200).json({
      message: "diagram created",
      success: true,
      subject: diagramType, // returns the created diagram type as "subject"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to create Diagram Type" });
  }
};

const getAllDiagramsType = async (req, res) => {
  try {
    const diagramTypes = await diagramService.getAllDiagramsType();
    return res.status(200).json({
      message: "diagram feteched",
      success: true,
      diagramTypes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed getting Diagram Type" });
  }
};

module.exports = {
  createDiagramType,
  getAllDiagramsType,
};