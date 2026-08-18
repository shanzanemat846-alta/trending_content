/* IMPORTS */
require("dotenv").config();

const dotenv = require('dotenv')
const schedule = require('node-schedule');

dotenv.config({ path: `.env.${process.env.CB}` })

const express = require("express");
// For parsing the body of the request
const bodyParser = require("body-parser");
// For interacting with the mongoDb
const mongoose = require("mongoose");
// For allowing cross origin requests
const cors = require("cors");
// For securing the app by setting up various headers
const helmet = require("helmet");
// For logging the requests
const morgan = require("morgan");

const multer = require("multer");

const path = require("path");
const fs = require('fs');

const  {
  createCampaignIndexes,
  createCaptionIndexes,
  createCommentIndexes,
  createCreditHistoryIndexes,
  createInvoiceIndexes,
  createProjectIndexes,
  createPromptIndexes,
  createStoreIndexes,
  createThreadIndexes,
  createUserIndexes,
  createUserSubscriptionIndexes
} = require('./models/all-index');

const authRoutes = require("./routes/auth");
const campaignRoutes = require("./routes/campaign.js");
const promptRoutes = require("./routes/prompt.js");
const projectRoutes = require("./routes/project.js");
const threadRoutes = require("./routes/thread.js");
const chatgptRoute = require("./routes/chatgpt.js");
const storeRoute = require("./routes/store.js");
const userRoute = require("./routes/user.js");
const scripts = require("./routes/scripts");
const admin = require("./routes/admin.js");
const subscription = require("./routes/subscription.js");
const invoice = require("./routes/invoice.js");
const openAIModel = require("./routes/open-ai-model.js")

const Store = require("./models/store.model");

const { FormatFileSize, HandleFreeCredits } = require("./utils/helpers");

const { MAX_FILE_SIZE } = require("./utils/constants");

/* CONFIGURATION */
const app = express();

app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    console.warn('Request timed out');
    res.status(503).json({ message: 'Server timeout' });
  });
  next();
});

// Parses incoming requests with JSON payloads
app.use(express.json());
app.use(helmet());
// Allows us to make the cross origin sharing requests
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// Logs the requests
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Enable CORS middleware
const host = process.env.NEXT_PUBLIC_HOST_API;
app.use(
  cors({
    Origin: `${host}`,
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
    credentials: true
  })
);
/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/prompt", promptRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/thread", threadRoutes);
app.use("/api/chatgpt", chatgptRoute);
app.use("/api/store", storeRoute);
app.use("/api/user", userRoute);
app.use("/api/script", scripts);
app.use("/api/admin", admin);
app.use("/api/subscription", subscription);
app.use("/api/invoice", invoice);
app.use("/api/open-ai-model", openAIModel)

app.get("/", async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Welcome to the MOCK DATA API for the ADMIN DASHBOARD"
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// file uploading 
// Step 1: Define the fileRenamer function

const fileRenamer = (filename) => {
  const queHoraEs = Date.now();
  const regex = /[\s_-]/gi;
  const fileTemp = filename.replace(regex, ".");
  let arrTemp = [fileTemp.split(".")];
  return `${arrTemp[0]
    .slice(0, arrTemp[0].length - 1)
    .join("_")}${queHoraEs}.${arrTemp[0].pop()}`;
};

// Step 2: Define the storage configuration for multer

const storage = multer.diskStorage({
  destination: path.join(__dirname, "./images"),
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, fileRenamer(file.originalname));
  },
});

// Step 3: Create the multer middleware

const upload1 = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}).single("file");

// Step 4: Define the route handler for file upload

app.post("/api/file/:id", async (req, res, next) => {
  upload1(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const fileSize = FormatFileSize(MAX_FILE_SIZE);
        return res.status(413).json({
          message: `File too large. Maximum size allowed is ${fileSize} MB.`,
        });
      }
      return res.status(400).json({
        message: `Multer error: ${err.message}`,
      });
    } else if (err) {
      return res.status(500).json({
        message: `An error occurred during file upload: ${err.message}`,
      });
    }

    try {
      const { id } = req.params;
      const store = await Store.findById(id);

      if (!store) {
        return res.status(404).json({
          message: "Store not found.",
        });
      }

      store.localImage = req.file.filename;
      await store.save();

      return res.json(store);
    } catch (e) {
      return res.status(500).json({
        message: `Server error: ${e.message}`,
      });
    }
  });
});

// Step 5: Serve static files

app.use("/", express.static(path.join(__dirname, "./images")));


app.get("/api/content-images/:id/:imageName", (req, res) => {
  try {
    const { id, imageName } = req.params;
    const imagePath = path.join(__dirname, 'images', 'content-images', id, imageName);

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).send('Image not found');
    }
  } catch(error) {
    res.status(404).send(error.message || 'Error occurs in fetching content images!');
  }
});

// image get:
app.get("/api/file/:id", async (req, res) => {
  const { id } = req.params;
  const store = await Store.findById(id);

  if (!store) {
    return res.status(404).send("Store not found");
  }
  const filepath = store.localImage;
  console.log("filepath", filepath);
  if (!filepath) {
    return res.status(404).send("Image not found");
  }
  const absolutePath = path.join(__dirname, 'images', filepath);
  res.sendFile(absolutePath);
  console.log("res sendFile", absolutePath);
})


/* ENVIRONMENT VARIABLES */
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

/* MONGODB SETUP */
mongoose.set("strictQuery", true);
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log(err);
  });

/* DB INDEXES */
mongoose.connection.once("open", async () => {
  console.log("Successfully connected to the database");

  // Create indexes here
  await createCampaignIndexes();
  await createCaptionIndexes();
  await createCommentIndexes();
  await createCreditHistoryIndexes();
  await createInvoiceIndexes();
  await createProjectIndexes();
  await createPromptIndexes();
  await createStoreIndexes();
  await createThreadIndexes();
  await createUserIndexes();
  await createUserSubscriptionIndexes();
});

/* SERVER SETUP */
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

schedule.scheduleJob('59 23 * * *', async () => {
  try {
      console.log('Running handleFreeCredits at:', new Date().toLocaleTimeString());
      await HandleFreeCredits();
      console.log('handleFreeCredits executed successfully');
  } catch (error) {
      console.error('Error executing handleFreeCredits:', error);
  }
});
// connect bitbucket
