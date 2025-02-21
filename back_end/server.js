require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const {spawn}=require('child_process')
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());


mongoose.connect(process.env.MONGO_URI||"mongodb+srv://peecharasisir:Sisirsavir%4005@ocr.xtfg4.mongodb.net/ocr?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Failed", err));


const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

const upload = multer({ dest: "uploads/" });

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid Username or Password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Username or Password" });

    console.log(user);
    
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log(username,password);
    
    res.json({ message: "Login Successful" });
  } catch (err) {
    console.log(username,password);
    
    res.status(500).json({ message: "Server Error" });
  }
});


app.post("/signup", async (req, res) => {
  const { username, password,name } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword,name:name });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Dashboard route (Protected)
app.get('/dashboard', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        User.findById(decoded.id).then(user => {
            res.json({ username: user.username });
        });
    });
});
app.post("/generate-plan", (req, res) => {
  const { subject, days, hours } = req.body;

  // Spawn Python process with arguments
  const pythonProcess = spawn("python3", ["/Users/kbhuvan/Documents/ALLPROJECTS/StudentSystem/back_end/study_plan.py", subject, days, hours]);

  let result = "";
  pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
      if (code === 0) {
          res.json({ studyPlan: result.trim() });
      } else {
          res.status(500).json({ error: "Failed to generate study plan." });
      }
  });
});


app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const scriptPath = path.join(__dirname, "backend", "app.py"); // Ensure correct path

  const pythonProcess = spawn("python3", [scriptPath, filePath]);

  let result = "";
  pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
      fs.unlinkSync(filePath);
      if (code === 0) {
          res.json({ message: "PDF processed successfully" });
      } else {
          res.status(500).json({ error: "Failed to process PDF" });
      }
  });
});

app.post("/chat", (req, res) => {
  const { question } = req.body;
  if (!question) {
      return res.status(400).json({ error: "No question provided" });
  }

  const scriptPath = path.join(__dirname, "backend", "app.py"); // Ensure correct path
  const pythonProcess = spawn("python3", [scriptPath, question]);

  let result = "";
  pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
      if (code === 0) {
          res.json({ response: result.trim() });
      } else {
          res.status(500).json({ error: "Failed to get response" });
      }
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
