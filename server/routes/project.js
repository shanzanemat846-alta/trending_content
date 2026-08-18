const {
  addProject,
  getProjects,
  project_delete,
  getProject,
  project_update,
} = require("../controllers/projectController");

const { UpdateProject, GetProject } = require("../controllers/project");

const { CatchResponse, TryResponse } = require('../utils/helpers');

const AuthenticateToken = require('../middleware/auth-token');

const router = require("express").Router();

const { ENDPOINTS } = require('../utils/constants');

router.get("/pull", getProjects);
router.get("/:id", getProject);
router.post("/", addProject);
router.patch("/:id", project_update);
router.delete("/:id", project_delete);

router.post(ENDPOINTS.PROJECT.UPDATE_PROJECT, AuthenticateToken, async (req, res) => {
  try {
    const { updateParams, action } = req.body;
    const { projectId } = req.params;

    const response = await UpdateProject({
      projectId, updateParams, action
    });

    const { message } = response;
   
    TryResponse({
      res,
      message
    });
  } catch (err) {
    console.log('err : ', err);
    CatchResponse({
      res,
      err
    });
  }
});

router.get(ENDPOINTS.PROJECT.GET_PROJECT, AuthenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const response = await GetProject({
      projectId
    });

    const { message, project } = response;
   
    TryResponse({
      res,
      message,
      data: {
        project
      }
    });
  } catch (err) {
    console.log('err : ', err);
    CatchResponse({
      res,
      err
    });
  }
});

module.exports = router;
