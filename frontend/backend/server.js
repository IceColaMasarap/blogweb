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

    console.log("User authenticated successfully:", user.email);
    const { id, firstName, lastName, email, dateofbirth, isModerator } = user;
    return res.status(200).json({ id, firstName, lastName, email, dateofbirth, isModerator });
  });
});


app.listen(5005, () => {
  console.log("Server running on port 5005");
});
