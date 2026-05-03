import Project from "../models/project.model.js";
import Group from "../models/group.model.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, groupId } = req.body;

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }
    }

    const project = await Project.create({
      name,
      description,
      ...(groupId ? { group: groupId } : {}),
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "teamLead") {
      filter.group = req.user.group;
    }

    const projects = await Project.find(filter)
      .populate("group", "name teamLead")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("group", "name teamLead");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, groupId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: "Group not found" });
      }
      project.group = groupId;
    }

    if (name !== undefined)        project.name        = name;
    if (description !== undefined) project.description = description;

    await project.save();

    const updated = await Project.findById(project._id).populate("group", "name teamLead");
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await project.deleteOne();
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};