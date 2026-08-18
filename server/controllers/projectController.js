const Project = require("../models/project.model");
const User = require("../models/User.model");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { isEmpty } = require('lodash')

const { JWT_TOKEN_EXPIRY_DATE } = require("../utils/constants");

module.exports.addProject = async (req, res, next) => {
  try {
    const tokenwithBear = req.headers.authorization;
    const token = tokenwithBear.replace('Bearer ', ''); 
     if (!token) {
      return res.status(400).json({ errors: "Invalid User" });
    }
    console.log('req.body: ', req.body);
    const {  title, chatgpttype, projectAIKey } = req.body;
     if (validator.isEmpty(title)) {
      return res.json({
        errors: "title is required.",
        status: false,
      });
    }
    if (validator.isEmpty(chatgpttype)) {
      return res.json({
        errors: "chatGPT'model is required.",
        status: false,
      });
    }
    const payload = jwt.verify(token, process.env.HASHING_SECRET_KEY, {
      expiresIn: JWT_TOKEN_EXPIRY_DATE
    });
    const user = await User.findById(payload.id);
    if (!user) {
      throw new Error("Invalid User");
    }
    const userid = user._id;
    const projectCheck = await Project.findOne({ title,userid });
    if (projectCheck)
      return res.json({ errors: "project already existed", status: false });
    
    const last4Digit = !isEmpty(projectAIKey) ?  projectAIKey.slice(-4) : "";
    console.log(res.json.errors )
    const project = await Project.create({
      userid,
      title,
      chatgpttype: chatgpttype || "",
      projectOpenAI: { last4Digit, key: projectAIKey || "" }
    });
    return res.json({ status: true, project });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getProjects = async (req, res, next) => {
  try {
     const token = req.headers.authorization; 

    // Check if token is provided
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token not provided" });
    }

    // Extract user ID from the token
    const tokenWithoutBearer = token.replace('Bearer ', ''); // Remove 'Bearer ' from the token
    const decodedToken = jwt.verify(tokenWithoutBearer, process.env.HASHING_SECRET_KEY, {
      expiresIn: JWT_TOKEN_EXPIRY_DATE
    });
    const userid = decodedToken.id;

    const projects = await Project.find({ userid}).sort({ date: -1 });
    
    return res.json(projects);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    return res.json(project);
  } catch (e) {
    throw e;
  }
};

module.exports.project_update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    // console.log("id", id);
    const project = await Project.findByIdAndUpdate(id, req.body);
    // console.log("updateProject", project);
    return res.json({ project });
  } catch (e) {
    throw e;
  }
};

module.exports.project_delete = (req, res) => {
  Project.findById(req.params.id, function (err, project) {
    if (!project) {
      res.status(404).send("Project not found");
    } else {
      Project.findByIdAndRemove(req.params.id)
        .then(function () {
          res.status(200).json("project deleted");
        })
        .catch(function (err) {
          res.status(400).send("project delete failed.");
        });
    }
  });
};
