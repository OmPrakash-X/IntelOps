import Project from "../models/project.model.js";
import Group from "../models/group.model.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, groupId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    const project = await Project.create({
      name,
      description,
      group: groupId,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: project
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "teamLead") {
      filter.group = req.user.group;
    }

    const projects = await Project.find(filter)
      .populate("group", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("group", "name");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};