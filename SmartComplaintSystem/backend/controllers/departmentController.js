const Department = require('../models/Department');

exports.createDepartment = async (req, res) => {
  try {
    const { departmentName, issueTypes } = req.body;
    const dept = await Department.create({ departmentName, issueTypes });
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
