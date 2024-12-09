require("dotenv").config();
console.log("Encryption Key:", process.env.ENCRYPTION_KEY);
const { encrypt, decrypt } = require("./crypto");

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();

const { v4: uuidv4 } = require("uuid"); // Import uuidv4
const multer = require("multer");

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the folder to store uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Create a unique file name
  },
});

const upload = multer({ storage: storage }); // Initialize multer with the storage configuration

const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blogdb",
});

db.connect((err) => {
  if (err) {
    console.log("Database connection error:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users", async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Ensure database results are valid
    if (!results || results.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    // Decrypt emails and find matching user
    let user = null;
    try {
      user = results.find((row) => {
        const decryptedEmail = decrypt(row.email);
        console.log("Decrypted Email:", decryptedEmail); // Debug log
        return decryptedEmail === email;
      });
    } catch (error) {
      console.error("Error decrypting email:", error);
      return res.status(500).json({ error: "Decryption error" });
    }

    // If no matching user is found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // If login is successful
    return res.status(200).json({
      message: "User authenticated successfully!",
      user: { id: user.id, firstName: user.firstname, lastName: user.lastname },
    });
  });
});

app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email, dateofbirth, password } = req.body;
  const userId = uuidv4();

  try {
    // Encrypt the email
    const encryptedEmail = encrypt(email);
    console.log("Encrypted Email:", encryptedEmail);

    // Hash the first name
    const hashedFirstName = await bcrypt.hash(firstName, 10);
    console.log("Hashed First Name:", hashedFirstName);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (id, firstname, lastname, dateofbirth, email, password, isModerator, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`;

    db.query(
      sql,
      [
        userId,
        hashedFirstName,
        lastName,
        dateofbirth,
        encryptedEmail,
        hashedPassword,
      ],
      (error, results) => {
        if (error) {
          console.error("Error inserting user:", error);
          res.status(500).json({ message: "Error registering user" });
        } else {
          res.status(201).json({ message: "Account created successfully!" });
        }
      }
    );
  } catch (error) {
    console.error("Error processing registration:", error);
    res.status(500).json({ message: "Error processing registration" });
  }
});

// Fetch all posts endpoint
app.get("/api/posts", (req, res) => {
  const sql = `
    SELECT 
      posts.id AS post_id, 
      CONCAT(users.firstname, ' ', users.lastname) AS author_name, 
      posts.postdate AS date_posted, 
      posts.content AS content, 
      posts.isFlagged AS flagged
    FROM posts
    INNER JOIN users ON posts.author_id = users.id
    ORDER BY posts.postdate DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Error retrieving posts" });
    } else {
      res.status(200).json(results);
    }
  });
});
app.get("/api/posts2", (req, res) => {
  const sql = `
    SELECT 
        posts.id AS post_id, 
        users.firstname AS author_firstname, 
        users.lastname AS author_lastname, 
        posts.title, 
        posts.content, 
        posts.postdate, 
        posts.isFlagged, 
        posts.like_count, 
        users.email AS author_email
    FROM posts
    JOIN users ON posts.author_id = users.id
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Error retrieving posts" });
    } else {
      res.status(200).json(results);
    }
  });
});
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS totalUsers,
      SUM(isModerator = 1) AS totalModerators
    FROM users;
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Error retrieving user stats" });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Use Promise wrapper to handle the database query
    const results = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    });

    if (results.length === 0) {
      console.log("User not found:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    console.log("User found:", user.id);

    // Compare the password asynchronously
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("User authenticated successfully:", email);
    const { id, firstName, lastName, dateofbirth, isModerator } = user;
    return res
      .status(200)
      .json({ id, firstName, lastName, email, dateofbirth, isModerator });
  } catch (err) {
    console.error("Error processing login:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/addpost2", upload.single("image"), (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.filename : null;
  const id = uuidv4();
  const aid = "2800b395-3f24-4f2d-b710-b9d69fbb1918"; // Ensure this exists in users table

  db.query(
    `INSERT INTO posts (id, author_id, title, content, postdate, isFlagged, like_count, imageurl) VALUES (?, ?, ?, ?, NOW(), 0, 0, ?)`,
    [id, aid, title, content, image],
    (error, result) => {
      if (error) {
        console.error("Error adding post:", error);
        return res.status(500).json({ message: "Error adding post" });
      }
      res
        .status(201)
        .json({ message: "Post added successfully", postId: result.insertId });
    }
  );
});

app.post("/api/addpost", (req, res) => {
  const { title, content, imageUrl } = req.body;
  const id = uuidv4();
  const firstname = "Admin";
  const lastname = "Page";
  const email = "sean@gmail.com";
  // Query to get the user id from the users table using email
  const userQuery = "SELECT id FROM users WHERE email = ?";

  db.query(userQuery, [email], (err, results) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error finding user", error: err });
    }
    console.log("Email provided:", email);
    console.log("Query Results:", results);
    if (results.length === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    const authorId = results[0].id; // Get the author id from the users table

    // Insert the post with the retrieved author_id
    const query = `INSERT INTO posts (id, author_id, title, content, postdate, isFlagged, like_count, image_url) 
                   VALUES (?, ?, ?, ?, NOW(), 0, 0, ?)`;

    db.query(query, [id, authorId, title, content, imageUrl], (err, result) => {
      if (err) {
        res.status(500).send({ message: "Error inserting post", error: err });
      } else {
        res.status(200).send({ message: "Post added successfully" });
      }
    });
  });
});

app.listen(5005, () => {
  console.log("Server running on port 5005");
});
