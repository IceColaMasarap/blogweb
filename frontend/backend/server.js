require("dotenv").config();
console.log("Encryption Key:", process.env.ENCRYPTION_KEY);

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const session = require("express-session");

const crypto = require("crypto");
const { encrypt, decrypt } = require("./crypto");

const { v4: uuidv4 } = require("uuid"); // Import uuidv4
const multer = require("multer");

const app = express();

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
  const isMod = "User"; // Default role for new users

  try {
    // Encrypt sensitive fields
    const encryptedFirstName = encrypt(firstName);
    const encryptedLastName = encrypt(lastName);
    const encryptedEmail = encrypt(email);
    const encryptedDateOfBirth = encrypt(dateofbirth);
    const encryptedIsModerator = encrypt(isMod);
    const encryptedCreatedAt = encrypt(new Date().toISOString()); // Generate current timestamp and encrypt it

    // Hash the password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const sql = `
      INSERT INTO users (id, firstname, lastname, dateofbirth, email, password, isModerator, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        userId,
        encryptedFirstName,
        encryptedLastName,
        encryptedDateOfBirth,
        encryptedEmail,
        hashedPassword,
        encryptedIsModerator,
        encryptedCreatedAt,
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

app.post("/api/create-post", upload.single("file"), (req, res) => {
  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  const { userId, content, title } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!userId || !content || !title) {
    console.error("Missing required fields");
    return res
      .status(400)
      .json({ message: "User ID, Title, and Content are required." });
  }

  const sqlValidateUser = `SELECT id FROM users WHERE id = ?`;
  db.query(sqlValidateUser, [userId], (err, results) => {
    if (err) {
      console.error("Error validating user ID:", err);
      return res.status(500).json({ message: "Error validating user ID." });
    }

    if (results.length === 0) {
      console.error("Invalid User ID");
      return res
        .status(400)
        .json({ message: "Invalid User ID. User does not exist." });
    }

    // Encrypt fields
    const encTitle = encrypt(title);
    const encContent = encrypt(content);
    const encFile = file ? encrypt(file) : null;

    const postId = uuidv4();
    const postDate = encrypt(new Date().toISOString()); // Encrypt post date
    const isFlagged = encrypt(String(0)); // Convert to string before encryption
    const likeCount = encrypt(String(0)); // Convert to string before encryption

    const isHidden = encrypt(String(0));

    const sqlInsertPost = `
      INSERT INTO posts (id, author_id, title, content, postdate, isFlagged, like_count, imageurl, isHidden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sqlInsertPost,
      [
        postId,
        userId,
        encTitle,
        encContent,
        postDate,
        isFlagged,
        likeCount,
        encFile,
        isHidden,
      ],
      (error) => {
        if (error) {
          console.error("Error inserting post:", error);
          return res.status(500).json({ message: "Error creating post." });
        }
        console.log("Post created successfully!");
        res.status(201).json({ message: "Post created successfully!", postId });
      }
    );
  });
});

app.get("/api/user/:id", (req, res) => {
  const userId = req.params.id;

  const sql =
    "SELECT firstname, lastname, created_at, dateofbirth, email FROM users WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Error retrieving user data" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming you have a decrypt function
    try {
      const user = results[0];

      // Decrypt each field
      const decryptedFirstName = decrypt(user.firstname);
      const decryptedLastName = decrypt(user.lastname);
      const decryptedEmail = decrypt(user.email);
      const decryptedDateOfBirth = decrypt(user.dateofbirth);
      const decryptedCreatedAt = decrypt(user.created_at);

      // Send decrypted user data back to the client
      res.json({
        firstname: decryptedFirstName,
        lastname: decryptedLastName,
        email: decryptedEmail,
        dateofbirth: decryptedDateOfBirth,
        created_at: decryptedCreatedAt,
      });
    } catch (decryptionError) {
      console.error("Error decrypting user data:", decryptionError.message);
      return res.status(500).json({ message: "Error decrypting user data" });
    }
  });
});

// Fetch all posts endpoint
// Fetch all posts endpoint with decryption
app.get("/api/posts", (req, res) => {
  const sql = `SELECT 
      posts.id AS post_id, 
      users.firstname, 
      users.lastname, 
      posts.postdate AS date_posted, 
      posts.content AS content, 
      posts.isFlagged AS flagged
    FROM posts
    INNER JOIN users ON posts.author_id = users.id
    ORDER BY posts.postdate DESC
  ;`;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Error retrieving posts" });
    }

    try {
      // Decrypt the data
      const decryptedResults = results.map((row) => ({
        post_id: row.post_id,
        author_name: decrypt(row.firstname) + " " + decrypt(row.lastname),
        date_posted: decrypt(row.date_posted),
        content: decrypt(row.content),
        flagged: row.flagged,
      }));

      res.status(200).json(decryptedResults);
    } catch (decryptionError) {
      console.error("Error decrypting post data:", decryptionError);
      res.status(500).json({ message: "Error processing posts" });
    }
  });
});

app.get("/api/posts2", (req, res) => {
  const sql = `
    SELECT 
        posts.id AS post_id, 
        posts.author_id,
        posts.title AS encrypted_title, 
        posts.content AS encrypted_content, 
        posts.postdate AS encrypted_postdate,
        posts.isFlagged AS encrypted_isFlagged, 
        posts.like_count AS encrypted_like_count, 
        posts.imageurl AS encrypted_imageurl,
        posts.isHidden AS encrypted_isHidden,
        users.email AS encrypted_author_email,
        users.firstname AS encrypted_author_firstname, 
        users.lastname AS encrypted_author_lastname
    FROM posts
    JOIN users ON posts.author_id = users.id
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Error retrieving posts" });
    }

    const decryptedResults = results.map((post) => {
      let decryptedPost;

      try {
        decryptedPost = {
          post_id: post.post_id,
          author_id: post.author_id,
          title: post.encrypted_title ? decrypt(post.encrypted_title) : null,
          content: post.encrypted_content
            ? decrypt(post.encrypted_content)
            : null,
          postdate: post.encrypted_postdate
            ? decrypt(post.encrypted_postdate)
            : null,
          isFlagged:
            post.encrypted_isFlagged &&
            decrypt(post.encrypted_isFlagged) === "true", // Convert to boolean
          isHidden:
            post.encrypted_isHidden &&
            decrypt(post.encrypted_isHidden) === "true", // Convert to boolean
          like_count: post.encrypted_like_count
            ? parseInt(decrypt(post.encrypted_like_count), 10)
            : 0,
          imageurl: post.encrypted_imageurl
            ? decrypt(post.encrypted_imageurl)
            : null,
          author_email: decrypt(post.encrypted_author_email),
          author_firstname: post.encrypted_author_firstname
            ? decrypt(post.encrypted_author_firstname)
            : null,
          author_lastname: post.encrypted_author_lastname
            ? decrypt(post.encrypted_author_lastname)
            : null,
        };

        // Convert decrypted postdate to ISO string
        if (decryptedPost.postdate) {
          decryptedPost.postdate = new Date(
            decryptedPost.postdate
          ).toISOString();
        }
      } catch (decryptionError) {
        console.error(
          `Decryption failed for post: ${post.post_id}`,
          decryptionError.message
        );
        decryptedPost = {
          post_id: post.post_id,
          author_id: post.author_id,
          title: null,
          content: null,
          postdate: null,
          isFlagged: false, // Default to false if decryption fails
          isHidden: false, // Default to false if decryption fails
          like_count: 0,
          imageurl: null,
          author_email: post.encrypted_author_email,
          author_firstname: null,
          author_lastname: null,
        };
      }

      return decryptedPost;
    });

    res.status(200).json(decryptedResults);
  });
});

app.get("/api/usershow", (req, res) => {
  const sql = `
    SELECT 
        *
    FROM users
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error retrieving users" });
    } else {
      try {
        // Decrypt fields for each user
        const decryptedResults = results.map((user) => ({
          id: user.id,
          firstname: decrypt(user.firstname),
          lastname: decrypt(user.lastname),
          email: decrypt(user.email),
          dateofbirth: decrypt(user.dateofbirth),
          isModerator: decrypt(user.isModerator),
          created_at: decrypt(user.created_at),
        }));

        res.status(200).json(decryptedResults);
      } catch (decryptError) {
        console.error("Error decrypting user data:", decryptError);
        res.status(500).json({ message: "Error decrypting user data" });
      }
    }
  });
});

app.get("/api/showposts", (req, res) => {
  const userId = req.query.userId; // Pass the logged-in user's ID as a query parameter

  const sql = `
    SELECT 
      p.id, 
      p.title, 
      p.content, 
      p.postdate, 
      p.isFlagged, 
      p.isHidden, 
      p.author_id, 
      p.like_count, 
      p.imageurl, 
      a.firstname, 
      a.lastname, 
      EXISTS (SELECT 1 FROM likes WHERE likes.post_id = p.id AND likes.user_id = ?) AS liked,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
    FROM posts p
    INNER JOIN users a ON p.author_id = a.id;
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Error retrieving posts." });
    }

    try {
      const decryptedResults = results.map((post) => {
        const decryptedFirstName = decrypt(post.firstname);
        const decryptedLastName = decrypt(post.lastname);
        const decTitle = decrypt(post.title);
        const decContent = decrypt(post.content);
        const decImage = post.imageurl ? decrypt(post.imageurl) : null;
        const decLikeCount = decrypt(post.like_count); // Decrypt like_count
        const decPostDate = new Date(decrypt(post.postdate)).toISOString();

        // Decrypt `isHidden` and `isFlagged`, and convert to boolean
        const decryptedIsHidden = decrypt(post.isHidden) === "true";
        const decryptedIsFlagged = decrypt(post.isFlagged) === "true";

        return {
          ...post,
          firstname: decryptedFirstName,
          lastname: decryptedLastName,
          title: decTitle,
          content: decContent,
          imageurl: decImage,
          like_count: parseInt(decLikeCount, 10), // Convert decrypted like_count to a number
          postdate: decPostDate,
          isHidden: decryptedIsHidden, // Add decrypted and converted isHidden
          isFlagged: decryptedIsFlagged, // Add decrypted and converted isFlagged
        };
      });

      res.status(200).json(decryptedResults);
    } catch (error) {
      console.error("Error decrypting post data:", error.message);
      res.status(500).json({ message: "Error decrypting post data." });
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


// Endpoint: Update Post
app.put("/api/updatepost2", (req, res) => {
  const { post_id, title, content, adminId } = req.body;

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required for logging." });
  }

  // Fetch the current post details before updating
  const getPostDetailsQuery = `
    SELECT users.email, posts.title, posts.content FROM posts 
    INNER JOIN users ON posts.author_id = users.id 
    WHERE posts.id = ?
  `;

  db.query(getPostDetailsQuery, [post_id], (postErr, postResult) => {
    if (postErr || postResult.length === 0) {
      console.error("Error fetching post details:", postErr);
      return res.status(500).json({ error: "Failed to retrieve post details." });
    }

    const authorEmail = decrypt(postResult[0].email);
    const originalTitle = decrypt(postResult[0].title);
    const originalContent = decrypt(postResult[0].content);

    const updates = [];
    const values = [];
    let logChanges = [];
    let titleChanged = false;

    // Only log title update if it's actually different
    if (title && title !== originalTitle) {
      updates.push("title = ?");
      values.push(encrypt(title));
      logChanges.push("Title updated");
      titleChanged = true;
    }

    // Only log content update if it's actually different
    if (content && content !== originalContent) {
      updates.push("content = ?");
      values.push(encrypt(content));
      logChanges.push("Content updated");
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    values.push(post_id);
    const query = `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`;

    // Proceed with updating the post
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error updating post:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      // ✅ Store timestamp as ISO string and encrypt
      const encTimestamp = encrypt(new Date().toISOString());

      // ✅ Format the log details dynamically
      const postLabel = titleChanged ? "OldTitle" : "Title";
      const logMessage = `
        [Author]: ${authorEmail}
        [${postLabel}]: ${originalTitle}
        [Changes]: ${logChanges.join(", ")}
      `.trim();

      // ✅ Insert log entry
      const logQuery = "INSERT INTO admin_logs (id, admin_id, timestamp, action_type, details) VALUES (?, ?, ?, ?, ?)";
      const logData = [
        uuidv4(),
        adminId,
        encTimestamp,
        encrypt("Updated post"),
        encrypt(logMessage)
      ];

      db.query(logQuery, logData, (logErr) => {
        if (logErr) {
          console.error("Error logging admin action:", logErr);
        }
      });

      res.status(200).json({ message: "Post updated successfully" });
    });
  });
});



// Endpoint: Update Accounts
app.put("/api/updateaccount", async (req, res) => {
  const { id, firstname, lastname, dateofbirth, email, password, isModerator, adminId } = req.body;

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required for logging." });
  }

  // Fetch existing account details before updating
  const getUserQuery = "SELECT firstname, lastname, dateofbirth, email, isModerator FROM users WHERE id = ?";

  db.query(getUserQuery, [id], (userErr, userResult) => {
    if (userErr || userResult.length === 0) {
      console.error("Error fetching user details:", userErr);
      return res.status(500).json({ error: "Failed to retrieve user details." });
    }

    const original = {
      firstname: decrypt(userResult[0].firstname),
      lastname: decrypt(userResult[0].lastname),
      dateofbirth: decrypt(userResult[0].dateofbirth),
      email: decrypt(userResult[0].email),
      isModerator: decrypt(userResult[0].isModerator),
    };

    const updates = [];
    const values = [];
    let logChanges = [];

    // Check for changes and log them
    if (firstname && firstname !== original.firstname) {
      updates.push("firstname = ?");
      values.push(encrypt(firstname));
      logChanges.push("First Name updated");
    }
    if (lastname && lastname !== original.lastname) {
      updates.push("lastname = ?");
      values.push(encrypt(lastname));
      logChanges.push("Last Name updated");
    }
    if (dateofbirth && dateofbirth !== original.dateofbirth) {
      updates.push("dateofbirth = ?");
      values.push(encrypt(dateofbirth));
      logChanges.push("Date of Birth updated");
    }
    if (email && email !== original.email) {
      updates.push("email = ?");
      values.push(encrypt(email));
      logChanges.push("Email updated");
    }
    if (isModerator && isModerator !== original.isModerator) {
      updates.push("isModerator = ?");
      values.push(encrypt(isModerator));
      logChanges.push("Account Type updated");
    }

    // Add password if it's being updated
    if (password) {
      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
      updates.push("password = ?");
      values.push(hashedPassword);
      logChanges.push("Password updated");
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No changes detected" });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    // Proceed with update
    db.query(query, values, (updateErr, result) => {
      if (updateErr) {
        console.error("Error updating account:", updateErr);
        return res.status(500).json({ error: "Database query failed" });
      }

      // ✅ Store timestamp as ISO string and encrypt
      const encTimestamp = encrypt(new Date().toISOString());

      // ✅ Fix log message format for consistency
      const logMessage = `
        [User]: ${original.email}
        [Changes]: ${logChanges.join(" , ")}
      `.trim();

      const logQuery = "INSERT INTO admin_logs (id, admin_id, timestamp, action_type, details) VALUES (?, ?, ?, ?, ?)";
      const logData = [
        uuidv4(),
        adminId,
        encTimestamp,
        encrypt("Updated account"),
        encrypt(logMessage),
      ];

      db.query(logQuery, logData, (logErr) => {
        if (logErr) {
          console.error("Error logging admin action:", logErr);
        }
      });

      res.status(200).json({ message: "Account updated successfully" });
    });
  });
});


// Endpoint: Update Account
app.put("/api/updateaccount2", async (req, res) => {
  const { id, firstname, lastname, dateofbirth, email, password, adminId } = req.body;

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required for logging." });
  }

  try {
    // Fetch current account details before updating
    const getUserQuery = "SELECT firstname, lastname, dateofbirth, email FROM admin WHERE id = ?";
    db.query(getUserQuery, [id], (err, result) => {
      if (err || result.length === 0) {
        console.error("Error fetching admin details:", err);
        return res.status(500).json({ error: "Failed to retrieve admin details." });
      }

      // Decrypt existing details
      const original = {
        firstname: decrypt(result[0].firstname),
        lastname: decrypt(result[0].lastname),
        dateofbirth: decrypt(result[0].dateofbirth),
        email: decrypt(result[0].email),
      };

      const updates = [];
      const values = [];
      let logChanges = [];

      // Check for changes and log them
      if (firstname && firstname !== original.firstname) {
        updates.push("firstname = ?");
        values.push(encrypt(firstname));
        logChanges.push("First Name updated");
      }
      if (lastname && lastname !== original.lastname) {
        updates.push("lastname = ?");
        values.push(encrypt(lastname));
        logChanges.push("Last Name updated");
      }
      if (dateofbirth && dateofbirth !== original.dateofbirth) {
        updates.push("dateofbirth = ?");
        values.push(encrypt(dateofbirth));
        logChanges.push("Date of Birth updated");
      }
      if (email && email !== original.email) {
        updates.push("email = ?");
        values.push(encrypt(email));
        logChanges.push("Email updated");
      }

      if (password) {
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        updates.push("password = ?");
        values.push(hashedPassword);
        logChanges.push("Password updated");
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No changes detected" });
      }

      values.push(id);
      const query = `UPDATE admin SET ${updates.join(", ")} WHERE id = ?`;

      // Execute update query
      db.query(query, values, (updateErr, result) => {
        if (updateErr) {
          console.error("Error updating admin account:", updateErr);
          return res.status(500).json({ error: "Failed to update admin account" });
        }

        // ✅ Store timestamp as ISO string and encrypt
        const encTimestamp = encrypt(new Date().toISOString());

        // ✅ Format log details to match other logs
        const logMessage = `
          [Admin]: ${original.email}
          [Changes]: ${logChanges.join(" , ")}
        `.trim();

        // ✅ Insert log entry
        const logQuery = "INSERT INTO admin_logs (id, admin_id, timestamp, action_type, details) VALUES (?, ?, ?, ?, ?)";
        const logData = [
          uuidv4(),
          adminId,
          encTimestamp,
          encrypt("Updated admin account"),
          encrypt(logMessage),
        ];

        db.query(logQuery, logData, (logErr) => {
          if (logErr) {
            console.error("Error logging admin action:", logErr);
          }
        });

        res.status(200).json({ message: "Admin account updated successfully" });
      });
    });
  } catch (error) {
    console.error("Error processing update:", error);
    res.status(500).json({ error: "Failed to process update" });
  }
});



app.put("/api/user/:id", async (req, res) => {
  const userId = req.params.id;
  const { firstname, lastname, dateofbirth, email, password } = req.body;

  // Construct the query dynamically based on the provided fields
  const updates = [];
  const values = [];

  try {
    // Encrypt sensitive fields
    if (firstname) {
      const encryptedFirstName = encrypt(firstname); // Encrypt firstname
      updates.push("firstname = ?");
      values.push(encryptedFirstName);
    }

    if (lastname) {
      const encryptedLastName = encrypt(lastname); // Encrypt lastname
      updates.push("lastname = ?");
      values.push(encryptedLastName);
    }

    if (dateofbirth) {
      const encryptedDateOfBirth = encrypt(dateofbirth); // Encrypt dateofbirth
      updates.push("dateofbirth = ?");
      values.push(encryptedDateOfBirth);
    }

    if (email) {
      const encryptedEmail = encrypt(email); // Encrypt email
      updates.push("email = ?");
      values.push(encryptedEmail);
    }

    if (password) {
      // Hash the password using SHA-256
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    // If no fields were provided, send an error response
    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Add userId to the values for the WHERE clause
    values.push(userId);

    // Build and execute the update query
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User updated successfully" });
    });
  } catch (err) {
    console.error("Error processing update:", err);
    return res.status(500).json({ error: "Error processing update" });
  }
});

// Endpoint: Delete Post
app.delete("/api/deletepost2/:post_id/:adminId", (req, res) => {
  const { post_id, adminId } = req.params;

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required for logging." });
  }

  // Fetch post details before deletion
  const fetchPostQuery = `
    SELECT posts.title, users.firstname, users.lastname
    FROM posts
    INNER JOIN users ON posts.author_id = users.id
    WHERE posts.id = ?`;

  db.query(fetchPostQuery, [post_id], (fetchErr, fetchResult) => {
    if (fetchErr) {
      console.error("Error fetching post details:", fetchErr);
      return res.status(500).json({ error: "Database query failed." });
    }

    if (fetchResult.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Extract decrypted post details
    const postTitle = decrypt(fetchResult[0].title);
    const authorName = `${decrypt(fetchResult[0].firstname)} ${decrypt(fetchResult[0].lastname)}`;

    // Proceed with deletion
    const deleteQuery = "DELETE FROM posts WHERE id = ?";
    db.query(deleteQuery, [post_id], (deleteErr, result) => {
      if (deleteErr) {
        console.error("Error deleting post:", deleteErr);
        return res.status(500).json({ error: "Database query failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Post not found" });
      }

      // ✅ Store timestamp as ISO string and encrypt
      const encTimestamp = encrypt(new Date().toISOString());

      // ✅ Log format: [Author]: name | [Post]: title
      const logMessage = `[Author]: ${authorName} [Title]: ${postTitle}`;

      // ✅ Insert log entry
      const logQuery = "INSERT INTO admin_logs (id, admin_id, timestamp, action_type, details) VALUES (?, ?, ?, ?, ?)";
      const logData = [
        uuidv4(),
        adminId,
        encTimestamp,
        encrypt("Deleted post"),
        encrypt(logMessage)
      ];

      db.query(logQuery, logData, (logErr) => {
        if (logErr) {
          console.error("Error logging admin action:", logErr);
        }
      });

      res.status(200).json({ message: "Post deleted successfully" });
    });
  });
});



app.delete("/api/deleteaccount/:id", (req, res) => {
  const { id } = req.params;
  const adminId = req.query.adminId; // Capture the admin who is deleting

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required for logging." });
  }

  // Fetch the account's email before deletion
  const getEmailQuery = "SELECT email FROM users WHERE id = ?";
  db.query(getEmailQuery, [id], (err, result) => {
    if (err) {
      console.error("Error fetching user email:", err);
      return res.status(500).json({ error: "Error retrieving user details." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Account not found." });
    }

    const userEmail = decrypt(result[0].email); // Decrypt email for logging

    // Delete from the 'users' table
    const deleteUserQuery = "DELETE FROM users WHERE id = ?";

    // Delete from the 'admin' table
    const deleteAdminQuery = "DELETE FROM admin WHERE id = ?";

    db.query(deleteUserQuery, [id], (err, result) => {
      if (err) {
        console.error("Error deleting from users:", err);
        return res.status(500).json({ error: "Database query failed for users" });
      }

      // Proceed to delete from admin table (if applicable)
      db.query(deleteAdminQuery, [id], (err) => {
        if (err) {
          console.error("Error deleting from admin:", err);
          return res.status(500).json({ error: "Database query failed for admin" });
        }

        // ✅ Log admin action
        const logQuery = "INSERT INTO admin_logs (id, admin_id, timestamp, action_type, details) VALUES (?, ?, ?, ?, ?)";
        const logData = [
          uuidv4(),
          adminId,
          encrypt(new Date().toISOString()),
          encrypt("Deleted Account"),
          encrypt(`Deleted account: ${userEmail}`)
        ];

        db.query(logQuery, logData, (logErr) => {
          if (logErr) {
            console.error("Error logging admin action:", logErr);
          }
        });

        res.status(200).json({ message: "Account deleted successfully" });
      });
    });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Hash the input password
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  db.query(
    "SELECT * FROM users WHERE password = ?",
    [hashedPassword],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      let matchingUser = null;

      for (const user of results) {
        try {
          const decryptedEmail = decrypt(user.email);
          if (decryptedEmail === email) {
            matchingUser = user;
            break;
          }
        } catch (error) {
          console.error("Decryption failed for:", user.email, error.message);
          continue; // Skip problematic entry
        }
      }

      if (!matchingUser) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Decrypt sensitive fields
      try {
        const decryptedFirstName = decrypt(matchingUser.firstname);
        const decryptedLastName = decrypt(matchingUser.lastname);
        const decryptedEmail = decrypt(matchingUser.email);
        const decryptedDateOfBirth = decrypt(matchingUser.dateofbirth);
        const decryptedIsModerator = decrypt(matchingUser.isModerator);
        const decryptedCreatedAt = decrypt(matchingUser.created_at);

        return res.status(200).json({
          message: "Login successful",
          user: {
            id: matchingUser.id,
            firstName: decryptedFirstName,
            lastName: decryptedLastName,
            email: decryptedEmail,
            dateofbirth: decryptedDateOfBirth,
            isModerator: decryptedIsModerator,
            created_at: decryptedCreatedAt,
          },
        });
      } catch (error) {
        console.error("Error decrypting user details:", error.message);
        return res.status(500).json({ error: "Error decrypting user details" });
      }
    }
  );
});
app.get("/api/adminshow", (req, res) => {
  const sql = `
    SELECT 
        *
    FROM admin
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error retrieving users" });
    } else {
      try {
        // Decrypt fields for each user
        const decryptedResults = results.map((user) => ({
          id: user.id,
          firstname: decrypt(user.firstname),
          lastname: decrypt(user.lastname),
          email: decrypt(user.email),
          dateofbirth: decrypt(user.dateofbirth),
          isModerator: decrypt(user.isModerator),
          created_at: decrypt(user.created_at),
        }));

        res.status(200).json(decryptedResults);
      } catch (decryptError) {
        console.error("Error decrypting user data:", decryptError);
        res.status(500).json({ message: "Error decrypting user data" });
      }
    }
  });
});
app.post("/api/adminlogin", (req, res) => {
  const { email, password } = req.body;

  // Hash the input password
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  // Query all admin records
  db.query("SELECT * FROM admin", (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length === 0) {
      console.log("No admin records found.");
      return res.status(404).json({ error: "Admin not found" });
    }

    let matchingAdmin = null;

    // Iterate through all records and compare the decrypted email
    for (const admin of results) {
      try {
        const decryptedEmail = decrypt(admin.email);
        console.log("Decrypted email:", decryptedEmail);

        if (decryptedEmail === email) {
          matchingAdmin = admin;
          break;
        }
      } catch (error) {
        console.error("Error decrypting email:", admin.email, error.message);
        continue; // Skip problematic entries
      }
    }

    if (!matchingAdmin) {
      console.log("Admin not found for email:", email);
      return res.status(404).json({ error: "Admin not found" });
    }

    // Compare hashed passwords
    if (matchingAdmin.password !== hashedPassword) {
      console.log("Invalid password for admin:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Respond with the admin's decrypted details if authentication succeeds
    try {
      const response = {
        id: matchingAdmin.id,
        firstName: decrypt(matchingAdmin.firstname),
        lastName: decrypt(matchingAdmin.lastname),
        email: decrypt(matchingAdmin.email),
        dateofbirth: decrypt(matchingAdmin.dateofbirth),
        isModerator: matchingAdmin.isModerator, // This is not encrypted
        message: "Login successful",
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error decrypting admin details:", error.message);
      return res.status(500).json({ error: "Error decrypting admin details" });
    }
  });
});

app.post("/api/adminregister", async (req, res) => {
  const { firstName, lastName, email, dateofbirth, password, adminId } = req.body;
  const userId = uuidv4();
  const isMod = "Admin";

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required for logging." });
  }

  try {
    const encryptedFirstName = encrypt(firstName);
    const encryptedLastName = encrypt(lastName);
    const encryptedEmail = encrypt(email);
    const encryptedDateOfBirth = encrypt(dateofbirth);
    const encryptedIsModerator = encrypt(isMod);
    const encryptedCreatedAt = encrypt(new Date().toISOString());
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const sql = `
      INSERT INTO admin (id, firstname, lastname, dateofbirth, email, password, isModerator, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const sql2 = `
      INSERT INTO users (id, firstname, lastname, dateofbirth, email, password, isModerator, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        userId,
        encryptedFirstName,
        encryptedLastName,
        encryptedDateOfBirth,
        encryptedEmail,
        hashedPassword,
        encryptedIsModerator,
        encryptedCreatedAt,
      ],
      (error) => {
        if (error) {
          console.error("Error inserting into admin:", error);
          return res.status(500).json({ message: "Error registering admin" });
        }

        db.query(
          sql2,
          [
            userId,
            encryptedFirstName,
            encryptedLastName,
            encryptedDateOfBirth,
            encryptedEmail,
            hashedPassword,
            encryptedIsModerator,
            encryptedCreatedAt,
          ],
          (error) => {
            if (error) {
              console.error("Error inserting into users:", error);
              return res.status(500).json({ message: "Error registering user" });
            }

            // ✅ Store timestamp as ISO string and encrypt
            const encTimestamp = encrypt(new Date().toISOString());

            // ✅ Format log details to match other logs
            const logMessage = `
              [Admin Created]: ${email}
              [Name]: ${firstName} ${lastName}
            `.trim();

            // ✅ Insert log entry
            const logQuery = "INSERT INTO admin_logs (id, admin_id, timestamp, action_type, details) VALUES (?, ?, ?, ?, ?)";
            const logData = [
              uuidv4(),
              adminId,
              encTimestamp,
              encrypt("Created admin account"),
              encrypt(logMessage),
            ];

            db.query(logQuery, logData, (logErr) => {
              if (logErr) {
                console.error("Error logging admin action:", logErr);
              }
            });

            res.status(201).json({ message: "Account created successfully!" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error processing registration:", error);
    res.status(500).json({ message: "Error processing registration" });
  }
});


app.post("/api/addpost2", upload.single("image"), (req, res) => {
  const { title, content, adminId } = req.body;
  const image = req.file ? req.file.filename : null;
  const postId = uuidv4(); // Generate post ID

  if (!adminId) {
    return res.status(400).json({ message: "Admin ID is required for logging." });
  }

  try {
    // Encrypt the post details
    const encryptedTitle = encrypt(title);
    const encryptedContent = encrypt(content);
    const encryptedImage = image ? encrypt(image) : null;
    const encryptedLikeCount = encrypt("0"); // Initial like count as "0"
    const postdate = new Date().toISOString(); // Current date in ISO format
    const encryptedPostDate = encrypt(postdate);

    const isFlagged = encrypt("0"); // Assuming "isFlagged" is initially 0
    const isHidden = encrypt("0"); // Adding the "isHidden" field with initial value of 0

    // Insert the encrypted data into the posts table
    const insertPostQuery = `
      INSERT INTO posts (id, author_id, title, content, postdate, isFlagged, like_count, imageurl, isHidden) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      insertPostQuery,
      [
        postId,
        adminId,
        encryptedTitle,
        encryptedContent,
        encryptedPostDate,
        isFlagged,
        encryptedLikeCount,
        encryptedImage,
        isHidden, // Include the encrypted "isHidden"
      ],
      (error, result) => {
        if (error) {
          console.error("Error adding post:", error);
          return res.status(500).json({ message: "Error adding post" });
        }

        // ✅ Fetch author details
        const fetchAuthorQuery = `SELECT email FROM users WHERE id = ?`;
        db.query(fetchAuthorQuery, [adminId], (authorErr, authorResult) => {
          if (authorErr || authorResult.length === 0) {
            console.error("Error fetching author details:", authorErr);
            return res.status(500).json({ message: "Error retrieving author" });
          }

          const authorEmail = decrypt(authorResult[0].email); // Decrypt email

          // ✅ Store timestamp as ISO string and encrypt
          const encTimestamp = encrypt(new Date().toISOString());

          // ✅ Format the log details
          const logMessage = `
            [Author]: ${authorEmail}
            [Title]: ${title}
          `.trim();

          // ✅ Insert log entry into admin_logs
          const logQuery = `
            INSERT INTO admin_logs (id, admin_id, timestamp, action_type, details) 
            VALUES (?, ?, ?, ?, ?)`;

          db.query(
            logQuery,
            [uuidv4(), adminId, encTimestamp, encrypt("Added post"), encrypt(logMessage)],
            (logErr) => {
              if (logErr) {
                console.error("Error logging admin action:", logErr);
              }
            }
          );

          res.status(201).json({
            message: "Post added successfully",
            postId: postId,
          });
        });
      }
    );
  } catch (error) {
    console.error("Error processing post:", error);
    res.status(500).json({ message: "Error processing post" });
  }
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

app.post("/api/like-post", (req, res) => {
  const { postId, userId, action } = req.body;

  if (!postId || !userId || !action) {
    return res
      .status(400)
      .json({ message: "Post ID, User ID, and action are required." });
  }

  const checkLikeSql = "SELECT id FROM likes WHERE post_id = ? AND user_id = ?";
  db.query(checkLikeSql, [postId, userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error." });
    }

    const isLiked = results.length > 0;

    if (action === "like" && !isLiked) {
      // Add a like
      const addLikeSql =
        "INSERT INTO likes (id, user_id, post_id, created_at) VALUES (UUID(), ?, ?, NOW())";
      const getLikeCountSql = "SELECT like_count FROM posts WHERE id = ?";
      const updatePostSql = "UPDATE posts SET like_count = ? WHERE id = ?";

      // Fetch the current encrypted like count
      db.query(getLikeCountSql, [postId], (fetchErr, fetchResults) => {
        if (fetchErr) {
          console.error("Error fetching like count:", fetchErr);
          return res
            .status(500)
            .json({ message: "Error fetching like count." });
        }

        const encryptedLikeCount = fetchResults[0].like_count;
        const decryptedLikeCount = parseInt(decrypt(encryptedLikeCount), 10);
        const newLikeCount = decryptedLikeCount + 1;
        const updatedEncryptedLikeCount = encrypt(String(newLikeCount));

        // Update the like count
        db.query(addLikeSql, [userId, postId], (addErr) => {
          if (addErr) {
            console.error("Error adding like:", addErr);
            return res.status(500).json({ message: "Error adding like." });
          }

          db.query(
            updatePostSql,
            [updatedEncryptedLikeCount, postId],
            (updateErr) => {
              if (updateErr) {
                console.error("Error updating like count:", updateErr);
                return res
                  .status(500)
                  .json({ message: "Error updating like count." });
              }

              res.status(200).json({
                message: "Post liked.",
                newLikeCount: newLikeCount, // Send back the decrypted like count
              });
            }
          );
        });
      });
    } else if (action === "unlike" && isLiked) {
      // Remove a like
      const removeLikeSql =
        "DELETE FROM likes WHERE post_id = ? AND user_id = ?";
      const getLikeCountSql = "SELECT like_count FROM posts WHERE id = ?";
      const updatePostSql = "UPDATE posts SET like_count = ? WHERE id = ?";

      // Fetch the current encrypted like count
      db.query(getLikeCountSql, [postId], (fetchErr, fetchResults) => {
        if (fetchErr) {
          console.error("Error fetching like count:", fetchErr);
          return res
            .status(500)
            .json({ message: "Error fetching like count." });
        }

        const encryptedLikeCount = fetchResults[0].like_count;
        const decryptedLikeCount = parseInt(decrypt(encryptedLikeCount), 10);
        const newLikeCount = decryptedLikeCount - 1;
        const updatedEncryptedLikeCount = encrypt(String(newLikeCount));

        // Update the like count
        db.query(removeLikeSql, [postId, userId], (removeErr) => {
          if (removeErr) {
            console.error("Error removing like:", removeErr);
            return res.status(500).json({ message: "Error removing like." });
          }

          db.query(
            updatePostSql,
            [updatedEncryptedLikeCount, postId],
            (updateErr) => {
              if (updateErr) {
                console.error("Error updating like count:", updateErr);
                return res
                  .status(500)
                  .json({ message: "Error updating like count." });
              }

              res.status(200).json({
                message: "Post unliked.",
                newLikeCount: newLikeCount, // Send back the decrypted like count
              });
            }
          );
        });
      });
    } else {
      res
        .status(400)
        .json({ message: "Invalid action or post already in desired state." });
    }
  });
});

app.post("/api/add-comment", async (req, res) => {
  const { post_id, user_id, content } = req.body;

  if (!post_id || !user_id || !content) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const commentId = uuidv4(); // Generate a unique ID for the comment
    const encContent = encrypt(content); // Encrypt the comment content
    const encIsFlagged = encrypt("0"); // Encrypt default '0' for isFlagged

    const query =
      "INSERT INTO comments (id, post_id, user_id, content, isFlagged, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    await db.query(query, [commentId, post_id, user_id, encContent, encIsFlagged]); // Insert encrypted content
    res.status(201).json({ message: "Comment added successfully." });
  } catch (err) {
    console.error("Failed to add comment:", err);
    res.status(500).json({ error: "Failed to add comment." });
  }
});


// Decrypt the commenter's name and content when fetching comments

app.get("/api/get-comments", (req, res) => {
  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required." });
  }

  const sql = `
    SELECT 
      c.id, 
      c.user_id, 
      c.content, 
      u.firstname, 
      u.lastname, 
      c.created_at,
      c.isFlagged 
    FROM comments c
    INNER JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;

  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json({ message: "Error retrieving comments." });
    }

    // Safely decrypt values
    const decryptedResults = results.map((comment) => ({
      id: comment.id,
      user_id: comment.user_id,
      content: decrypt(comment.content),
      firstname: decrypt(comment.firstname),
      lastname: decrypt(comment.lastname),
      created_at: comment.created_at,
      isFlagged: decrypt(comment.isFlagged) === "true", // Properly decrypted
    }));

    res.status(200).json(decryptedResults);
  });
});


app.listen(5005, () => {
  console.log("Server running on port 5005");
});

app.post("/api/report-post", (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  const encryptedFlagged = encrypt("true"); // Encrypt the value for isFlagged

  const query = `UPDATE posts SET isFlagged = ? WHERE id = ?`;
  db.query(query, [encryptedFlagged, postId], (err, result) => {
    if (err) {
      console.error("Error updating post:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Post flagged as reported" });
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  });
});

app.post("/api/unflag-post", (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  const encryptedFlagged = encrypt("false"); // Encrypt the value for isFlagged

  const query = `UPDATE posts SET isFlagged = ? WHERE id = ?`;
  db.query(query, [encryptedFlagged, postId], (err, result) => {
    if (err) {
      console.error("Error unflagging post:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Post unflagged successfully" });
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  });
});

app.post("/api/hide-post", (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  const encryptedHidden = encrypt("true"); // Encrypt the value for isHidden

  const query = `UPDATE posts SET isHidden = ? WHERE id = ?`;
  db.query(query, [encryptedHidden, postId], (err, result) => {
    if (err) {
      console.error("Error hiding post:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Post hidden successfully" });
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  });
});

app.post("/api/unhide-post", (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  const encryptedHidden = encrypt("false"); // Encrypt the value for isHidden

  const query = `UPDATE posts SET isHidden = ? WHERE id = ?`;
  db.query(query, [encryptedHidden, postId], (err, result) => {
    if (err) {
      console.error("Error unhiding post:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Post unhidden successfully" });
    } else {
      return res.status(404).json({ message: "Post not found" });
    }
  });
});

app.get("/api/get-comments", async (req, res) => {
  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required." });
  }

  try {
    // Fetch comments with user roles
    const comments = await getCommentsWithUserRole(postId);

    // Decrypt comment content and user details
    const decryptedResults = comments.map((comment) => ({
      id: comment.id, // Ensure ID is included
      user_id: comment.user_id, // Ensure user_id is included
      content: decrypt(comment.content), // Decrypt content
      firstname: decrypt(comment.firstname), // Decrypt first name
      lastname: decrypt(comment.lastname), // Decrypt last name
      created_at: comment.created_at, // Keep timestamp as-is
      isModerator: comment.isModerator, // Ensure the isModerator field is included
    }));

    res.status(200).json(decryptedResults);
  } catch (error) {
    console.error("Error fetching comments with roles:", error);
    res.status(500).json({ message: "Error retrieving comments." });
  }
});

app.post("/api/check-email", async (req, res) => {
  const { email } = req.body;

  try {
    const sql = `SELECT email FROM users`;
    db.query(sql, [], (err, results) => {
      if (err) {
        console.error("Error fetching emails:", err);
        return res.status(500).json({ message: "Server error" });
      }

      // Decrypt all emails and compare
      const emailTaken = results.some((row) => {
        const decryptedEmail = decrypt(row.email); // Decrypt each email from the database
        return decryptedEmail === email; // Compare with the user's email
      });

      if (emailTaken) {
        return res.status(200).json({ exists: true });
      }

      res.status(200).json({ exists: false });
    });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: "Error processing email check" });
  }
});

app.post("/api/check-email-admin", async (req, res) => {
  const { email } = req.body;

  try {
    const sql = `SELECT email FROM admin`;
    db.query(sql, [], (err, results) => {
      if (err) {
        console.error("Error fetching emails:", err);
        return res.status(500).json({ message: "Server error" });
      }

      // Decrypt all emails and compare
      const emailTaken = results.some((row) => {
        const decryptedEmail = decrypt(row.email); // Decrypt each email from the database
        return decryptedEmail === email; // Compare with the user's email
      });

      if (emailTaken) {
        return res.status(200).json({ exists: true });
      }

      res.status(200).json({ exists: false });
    });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: "Error processing email check" });
  }
});

app.put("/api/edit-comment", async (req, res) => {
  const { commentId, userId, newContent } = req.body;

  if (!commentId || !userId || !newContent || !newContent.trim()) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const encryptedContent = encrypt(newContent.trim()); // Ensure text is trimmed before encrypting

    const sql = "UPDATE comments SET content = ? WHERE id = ? AND user_id = ?";
    db.query(sql, [encryptedContent, commentId, userId], (err, result) => {
      if (err) {
        console.error("Error updating comment:", err);
        return res.status(500).json({ message: "Error updating comment." });
      }

      if (result.affectedRows === 0) {
        return res
          .status(403)
          .json({ message: "Unauthorized or comment not found." });
      }

      res.status(200).json({ message: "Comment updated successfully!" });
    });
  } catch (error) {
    console.error("Error processing comment update:", error);
    res.status(500).json({ message: "Error processing request." });
  }
});

app.delete("/api/delete-comment", async (req, res) => {
  const { commentId, userId } = req.body;

  if (!commentId || !userId) {
    return res
      .status(400)
      .json({ message: "Comment ID and User ID are required." });
  }

  try {
    // Fetch user role
    const checkUserSql = "SELECT isModerator FROM users WHERE id = ?";
    db.query(checkUserSql, [userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(403).json({ message: "Unauthorized access." });
      }

      const decryptedRole = decrypt(results[0].isModerator); // Decrypt the role
      const isModerator =
        decryptedRole === "Admin" || decryptedRole === "Moderator";

      // Allow deletion if the user is the owner OR a moderator
      const deleteSql = isModerator
        ? "DELETE FROM comments WHERE id = ?" // Moderator can delete any comment
        : "DELETE FROM comments WHERE id = ? AND user_id = ?"; // User can only delete their own comment

      const queryParams = isModerator ? [commentId] : [commentId, userId];

      db.query(deleteSql, queryParams, (delErr, result) => {
        if (delErr) {
          console.error("Error deleting comment:", delErr);
          return res.status(500).json({ message: "Error deleting comment." });
        }

        if (result.affectedRows === 0) {
          return res
            .status(403)
            .json({ message: "Unauthorized or comment not found." });
        }

        res.status(200).json({ message: "Comment deleted successfully!" });
      });
    });
  } catch (error) {
    console.error("Error processing comment deletion:", error);
    res.status(500).json({ message: "Error processing request." });
  }
});

const getCommentsWithUserRole = (postId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT comments.*, users.isModerator
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ?
      `,
      [postId],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          // Ensure isModerator is decrypted
          const formattedResults = results.map((comment) => ({
            ...comment,
            content: decrypt(comment.content), // Ensure content is decrypted
            isModerator:
              decrypt(comment.isModerator) === "Admin" ||
              decrypt(comment.isModerator) === "Moderator",
          }));
          resolve(formattedResults);
        }
      }
    );
  });
};

app.get("/api/get-comments-with-role", async (req, res) => {
  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required." });
  }

  try {
    const comments = await getCommentsWithUserRole(postId);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments with roles:", error);
    res.status(500).json({ message: "Error retrieving comments." });
  }
});

app.post("/api/flag-comment", async (req, res) => {
  const { commentId } = req.body;

  if (!commentId) {
    return res.status(400).json({ message: "Comment ID is required." });
  }

  try {
    // Query to check if the comment's author is a moderator
    const checkModeratorQuery = `
      SELECT u.isModerator 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `;

    db.query(checkModeratorQuery, [commentId], (err, results) => {
      if (err) {
        console.error("Error checking comment author:", err);
        return res.status(500).json({ message: "Error checking comment author." });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Comment not found." });
      }

      const decryptedIsModerator = decrypt(results[0].isModerator); // Decrypt moderator status

      // Prevent flagging if the comment belongs to a moderator
      if (decryptedIsModerator === "Moderator" || decryptedIsModerator === "Admin") {
        return res.status(403).json({ message: "You cannot flag a moderator's comment." });
      }

      // Encrypt the flag status as 'true'
      const encryptedFlagged = encrypt("true");

      // SQL query to update the isFlagged field for the comment
      const query = "UPDATE comments SET isFlagged = ? WHERE id = ?";

      db.query(query, [encryptedFlagged, commentId], (err, result) => {
        if (err) {
          console.error("Error flagging comment:", err);
          return res.status(500).json({ message: "Error flagging comment." });
        }

        if (result.affectedRows > 0) {
          return res.status(200).json({ message: "Comment flagged successfully." });
        } else {
          return res.status(404).json({ message: "Comment not found." });
        }
      });
    });
  } catch (error) {
    console.error("Error processing flagging request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


app.post("/api/flag-comment", (req, res) => {
  const { commentId } = req.body;

  if (!commentId) {
    return res.status(400).json({ message: "Comment ID is required." });
  }

  // Check if the comment belongs to a moderator
  const checkModQuery = "SELECT isModerator FROM comments WHERE id = ?";
  db.query(checkModQuery, [commentId], (err, results) => {
    if (err) {
      console.error("Error checking moderator status:", err);
      return res.status(500).json({ message: "Error processing request." });
    }

    if (results.length > 0 && results[0].isModerator === "true") {
      return res.status(403).json({ message: "You cannot report a moderator's comment." });
    }

    // Proceed to flag the comment
    const encryptedFlagged = encrypt("true");
    const updateQuery = "UPDATE comments SET isFlagged = ? WHERE id = ?";
    db.query(updateQuery, [encryptedFlagged, commentId], (err, result) => {
      if (err) {
        console.error("Error flagging comment:", err);
        return res.status(500).json({ message: "Error flagging comment." });
      }

      if (result.affectedRows > 0) {
        return res.status(200).json({ message: "Comment flagged successfully." });
      } else {
        return res.status(404).json({ message: "Comment not found." });
      }
    });
  });
});

app.post("/api/unflag-comment", (req, res) => {
  const { commentId } = req.body;

  if (!commentId) {
    return res.status(400).json({ message: "Comment ID is required." });
  }

  const encryptedFlagged = encrypt("false"); // Encrypt "false" for consistency

  const query = "UPDATE comments SET isFlagged = ? WHERE id = ?";
  db.query(query, [encryptedFlagged, commentId], (err, result) => {
    if (err) {
      console.error("Error unflagging comment:", err);
      return res.status(500).json({ message: "Error unflagging comment." });
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Comment unflagged successfully." });
    } else {
      return res.status(404).json({ message: "Comment not found." });
    }
  });
});

app.get("/api/adminlogs", (req, res) => {
  const sql = `
    SELECT admin_logs.id, admin_logs.admin_id, admin_logs.timestamp, admin_logs.action_type, admin_logs.details, admin.email
    FROM admin_logs
    JOIN admin ON admin_logs.admin_id = admin.id
    ORDER BY admin_logs.timestamp DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching admin logs:", error);
      return res.status(500).json({ message: "Error retrieving admin logs" });
    }

    try {
      // Decrypt all fields before sending response
      const decryptedLogs = results.map((log) => {
        let decryptedTimestamp;
        try {
          decryptedTimestamp = new Date(decrypt(log.timestamp)).toLocaleString();
        } catch (err) {
          decryptedTimestamp = "Invalid Date"; // Handle potential timestamp issues
        }

        return {
          id: log.id,
          admin_email: decrypt(log.email), // Decrypt admin email
          timestamp: decryptedTimestamp, // Fix invalid date issue
          action_type: decrypt(log.action_type),
          details: decrypt(log.details),
        };
      });

      res.status(200).json(decryptedLogs);
    } catch (decryptionError) {
      console.error("Error decrypting logs:", decryptionError);
      res.status(500).json({ message: "Error decrypting logs" });
    }
  });
});



