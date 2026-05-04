import User from "../models/user.model.js";

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, group} = req.body;
    const creatorRole = req.user.role;

    const rolePermissions = {
      admin: ["teamMember", "bugger", "teamLead"],
      teamLead: ["teamMember"]
    };


    if (!rolePermissions[creatorRole]) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to create users"
      });
    }

  
    if (!rolePermissions[creatorRole].includes(role)) {
      return res.status(403).json({
        success: false,
        message: `${creatorRole} cannot create ${role}`
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      createdBy: req.user._id,
      group: group || null
    });

    res.status(201).json({
      success: true,
      data: user
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const currentUser = req.user;

    let filter = {};

    if (currentUser.role === "admin") {
      if (role) {
        filter.role = role;
      }
    }
    
    else if (currentUser.role === "teamLead") {
      filter.group = currentUser.group;
      filter.createdBy = currentUser._id;
      filter.role = "teamMember";
    }

    else {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};