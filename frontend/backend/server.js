const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid"); // Import uuidv4

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

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email, dateofbirth, password } = req.body;
  const userId = uuidv4();

  try {
    // Hash the password and first name
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedFirstName = await bcrypt.hash(firstName, 10);

    const sql = `INSERT INTO users (id, firstname, lastname, dateofbirth, email, password, isModerator, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`;

    db.query(
    
      sql,
   
      [userId, hashedFirstName, lastName, dateofbirth, email, hashedPassword],
   
      (error, results) => {
          if (error) {
            console.error("Error inserting user:", error);
            res.status(500).json({ message: "Error registering user" });
          } else {
            res.status(201).json({ message: "Account created successfully!" });
      }
    }
  );
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
      }
    );
  } catch (error) {
    console.error("Error hashing data:", error);
    res.status(500).json({ message: "Error processing registration" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      console.log("User not found:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    console.log("User found:", user.id);

    const passwordMatch = await bcrypt.compare(password, user.password); // Hash comparison
    if (!passwordMatch) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("User authenticated successfully:", email);
    const { id, firstName, lastName, email, dateofbirth, isModerator } = user;
    return res.status(200).json({ id, firstName, lastName, email, dateofbirth, isModerator });
  });
});


app.listen(5005, () => {
  console.log("Server running on port 5005");
});
