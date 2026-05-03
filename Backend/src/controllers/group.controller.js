import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const group = await Group.create({ name, createdBy: req.user._id });
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("teamLead", "username email")
      .populate("members", "username email");
    res.status(200).json({ success: true, data: groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignTeamLead = async (req, res) => {
  try {
    const { teamLeadId } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const user = await User.findById(teamLeadId);
    if (!user || user.role !== "teamLead") {
      return res.status(400).json({ success: false, message: "Invalid team lead" });
    }

    group.teamLead = teamLeadId;
    await group.save();

    user.group = group._id;
    await user.save();

    res.status(200).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { members } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (members.includes(group.createdBy.toString())) {
      return res.status(400).json({ success: false, message: "Creator cannot be a member" });
    }

    const users = await User.find({ _id: { $in: members } });
    if (users.length !== members.length) {
      return res.status(400).json({ success: false, message: "Some users not found" });
    }

    const updatedMembers = [
      ...new Set([
        ...group.members.map(id => id.toString()),
        ...members
      ])
    ];

    group.members = updatedMembers;
    await group.save();

    await User.updateMany({ _id: { $in: members } }, { group: group._id });

    res.status(200).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { name } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (name !== undefined) group.name = name;
    await group.save();

    const updated = await Group.findById(group._id)
      .populate("teamLead", "username email")
      .populate("members", "username email");

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Unlink users from this group
    await User.updateMany({ group: group._id }, { $unset: { group: 1 } });

    await group.deleteOne();
    res.status(200).json({ success: true, message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};