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
  const { firstName, lastName, email, dateofbirth, password, created_at } = req.body;
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO users (id, firstname, lastname, dateofbirth, email, password, isModerator, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`;

  db.query(sql, [userId, firstName, lastName, dateofbirth, email, hashedPassword], (error, results) => {
    if (error) {
      console.error("Error inserting user:", error);
      res.status(500).json({ message: "Error registering user" });
    } else {
      res.status(201).json({ message: "Account created successfully!" });
    }
  });
});

app.listen(5005, () => {
  console.log("Server running on port 5005");
});
