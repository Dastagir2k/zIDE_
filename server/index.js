const express = require("express");
const cors = require("cors");
const Axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const multer = require("multer");
const Code = require("./models/CodeSchema.model.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 50,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err.message));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
console.log(process.env.GEMINI_URL);

// Set up multer for file upload with a file filter
const storage = multer.memoryStorage(); // Use memory storage to keep file content in memory

// File filter to accept only .js, .py, .html, .txt, .java, .jsx files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.js', '.py', '.html', '.txt', '.java', '.jsx'];
  const fileExtension = file.originalname.split('.').pop().toLowerCase();

  if (allowedExtensions.includes(`.${fileExtension}`)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only code files (.js, .py, .html, .txt, .java, .jsx) are allowed'), false); // Reject the file
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter 
});

// File Content Processing Endpoint
app.post("/fileContent", async (req, res) => {
  const fileContent = req.query.data; // Extract file content from query parameter

  if (!fileContent) {
      return res.status(400).json({ error: "No content provided in the request" });
  }

  const prompt = `Optimize the following code and include comments for readability:\n\n${fileContent}\n\nProvide the improved code only with comments included.`;

  try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      if (!model) {
          console.error("Model initialization failed.");
          return res.status(500).json({ error: "Model not available." });
      }

      const result = await model.generateContent(prompt);

      if (!result || !result.response) {
          console.error("Invalid response from model.");
          return res.status(500).json({ error: "Error generating optimized code." });
      }

      const optimizedCode = result.response.text();
      console.log("Optimized Code:", optimizedCode);

      res.status(200).send( optimizedCode );
  } catch (error) {
      console.error("Error optimizing code:", error.message);
      res.status(500).json({ error: "Error optimizing code" });
  }
});

// Optimize code endpoint
app.post("/optimize", async (req, res) => {
    const userCode = req.body.code;
    const prompt = `Optimize the following code and include comments for readability:\n\n${userCode}\n\nProvide the improved code only with comments included.`;
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        if (!model) {
            console.error("Model initialization failed.");
            return res.status(500).json({ error: "Model not available." });
        }

        const result = await model.generateContent(prompt);

        if (!result || !result.response) {
            console.error("Invalid response from model.");
            return res.status(500).json({ error: "Error generating optimized code." });
        }

        const optimizedCode = result.response.text();
        console.log("Optimized Code:", optimizedCode);

        res.status(200).json({ code: optimizedCode });
    } catch (error) {
        console.error("Error optimizing code:", error.message);
        res.status(500).json({ error: "Error optimizing code" });
    }
});

// Health Check Endpoint
app.get("/", (req, res) => {
    res.status(200).send("Server is running!");
});

// Compile Code Endpoint
app.post("/compile", async (req, res) => {
    let code = req.body.code;
    let language = req.body.language;
    let input = req.body.input;
    let userId = req.body.userId; // Ensure userId is sent in the request body

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    console.log("Received language:", language);

    let languageMap = {
        "c": { language: "c", version: "10.2.0" },
        "cpp": { language: "c++", version: "10.2.0" },
        "python": { language: "python", version: "3.10.0" },
        "java": { language: "java", version: "15.0.2" },
        "javascript": { language: "javascript", version: "18.15.0" }
    };

    if (!languageMap[language]) {
        res.send(language)
        return res.status(400).send({ error: "Unsupported language" });
    }

    let data = {
        "language": languageMap[language].language,
        "version": languageMap[language].version,
        "files": [
            {
                "name": "main",
                "content": code
            }
        ],
        "stdin": input
    };

    let config = {
        method: 'post',
        url: 'https://emkc.org/api/v2/piston/execute',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    Axios(config)
    .then(async (response) => {
        console.log("API Response:", response.data);
        if (response.data.run.stdout) {
            res.json({ output: response.data.run.stdout });
            
            // Save the successfully compiled code to the database
            Code.create({ userId, code, language }).catch(console.error);
            console.log("data saved in db ");
        } else if (response.data.run.stderr) {
            res.json({ error: response.data.run.stderr });
        } else {
            res.status(500).json({ error: "Unexpected response format" });
        }
    })
    .catch((error) => {
        console.error("Error during code execution:", error.message);
        res.status(500).json({ error: "Internal server error or connection issue" });
    });
});

// get the code using user'id
app.get("/getcode", async (req, res) => {
    const userId = req.query.userId;
  
    try {
      // Fetch the code snippets for the user
      const response = await Code.find({ userId: userId });
  
      if (response.length === 0) {
        return res.status(404).send({ error: "No code found for this user" });
      }
  
      // Get the last code snippet and its language
      const lastCode = response[response.length - 1].code;
      const language = response[response.length - 1].language;  // Fetch language from the database
  
      // Slice the code to 1000 characters if it exceeds that length
      const slicedCode = lastCode.slice(0, 2500); // Slice the code to 1000 characters
  
      // Send the sliced code along with language and other metadata
      res.status(200).send({
        _id: response[response.length - 1]._id,
        userId: response[response.length - 1].userId,
        code: slicedCode,
        language: language,  // Dynamically include the language
        createdAt: response[response.length - 1].createdAt,
        updatedAt: response[response.length - 1].updatedAt,
        __v: response[response.length - 1].__v,
      });
  
    } catch (error) {
      console.error("Error fetching code:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });
  
  

// get all the code of the user
app.get("/getallcode", async (req, res) => {
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const perPage = parseInt(req.query.perPage) || 10; // Default to 10 codes per page
  
    if (!userId) {
      return res.status(400).send({ error: "UserId is required" });
    }
  
    try {
      // Count total codes for the user
      const totalCodes = await Code.countDocuments({ userId });
  
      if (totalCodes === 0) {
        return res.status(404).send({ error: "No code snippets found for this user" });
      }
  
      // Calculate pagination details
      const totalPages = Math.ceil(totalCodes / perPage);
  
      // Prevent requesting a page that doesn't exist
      if (page > totalPages) {
        return res.status(400).send({ error: "Page number exceeds total pages" });
      }
  
      const skip = (page - 1) * perPage;
  
      // Fetch codes for the current page
      const codes = await Code.find({ userId })
        .skip(skip)
        .limit(perPage)
        .select("code");
  
      // Prepare the response
      const response = {
        data: codes.map((item) => {
            // Trim code to 1000 characters if it exceeds
            return item.code.length > 1000 ? item.code.slice(0, 2000) : item.code;
          }),
        pagination: {
          page,
          perPage,
          totalPages,
          totalCodes,
        },
      };
  
      res.status(200).send(response);
    } catch (error) {
      console.error("Error fetching codes:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });
  
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
