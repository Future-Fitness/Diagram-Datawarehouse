const subjectService = require("../services/subjects-service");

const createSubjectType = async (req, res) => {
  const { name, description } = req.body;
  try {
    const subject = await subjectService.createSubjectType(name, description,   category);
    return res.status(200).json({
      message: "subject created",
      success: true,
      subject, // returns the created subject type
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to create Subject Type" });
  }
};

const getAllSubjectType = async (req, res) => {
  try {
    const subjectTypes = await subjectService.getAllSubjectType();
    return res.status(200).json({
      message: "subject fetched",
      success: true,
      subjectTypes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed getting Subject Type" });
  }
};

module.exports = {
  createSubjectType,
  getAllSubjectType,
};