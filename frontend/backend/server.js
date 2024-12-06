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
      [userId, hashedFirstName, lastName, dateofbirth, encryptedEmail, hashedPassword],
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



app.listen(5005, () => {
  console.log("Server running on port 5005");
});
