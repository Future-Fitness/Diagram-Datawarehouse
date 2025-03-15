const subjectType = require("../models/SubjectSchema");

async function createSubjectType(name, description) {
  try {
    const subject = {
      name,
      description,
    };
    const newSubject = await subjectType.create(subject);
    return newSubject;
  } catch (error) {
    console.log(error);
    throw new Error("Errir in creating Subject type ");
  }
}

async function getAllSubjectType() {
  try {
    const Subjects = await subjectType.find({});
    return Subjects;
  } catch (error) {
    console.log(error);
    throw new Error("Errir in creating Subject type ");
  }
}

module.exports = {
  createSubjectType,
  getAllSubjectType,
};
