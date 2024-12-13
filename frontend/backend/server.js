require("dotenv").config();
console.log("Encryption Key:", process.env.ENCRYPTION_KEY);

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const session = require("express-session");

const { v4: uuidv4 } = require("uuid"); // Import uuidv4
const multer = require("multer");

const app = express();

app.use(
  session({
    secret: "1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c", // Replace with a strong secret
    resave: false,
    saveUninitialized: true,
  })
);
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
  const isMod = "User";
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO users (id, firstname, lastname, dateofbirth, email, password, isModerator, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;

    db.query(
      sql,
      [userId, firstName, lastName, dateofbirth, email, hashedPassword, isMod],
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

// Create Post API with File Upload Support
app.post("/api/create-post", upload.single("file"), (req, res) => {
  const { userId, content, title } = req.body;
  const file = req.file ? req.file.filename : null;

  // Check if all required fields are provided
  if (!userId || !content || !title) {
    return res
      .status(400)
      .json({ message: "User ID, Title, and Content are required." });
  }

  // Validate userId exists in the users table
  const sqlValidateUser = `SELECT id FROM users WHERE id = ?`;
  db.query(sqlValidateUser, [userId], (err, results) => {
    if (err) {
      console.error("Error validating user ID:", err);
      return res.status(500).json({ message: "Error validating user ID." });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid User ID. User does not exist." });
    }

    // Proceed to create the post if userId is valid
    const postId = uuidv4();
    const postDate = new Date();
    const isFlagged = 0;
    const likeCount = 0;

    const sqlInsertPost = `
      INSERT INTO posts (id, author_id, title, content, postdate, isFlagged, like_count, imageurl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sqlInsertPost,
      [postId, userId, title, content, postDate, isFlagged, likeCount, file],
      (error, results) => {
        if (error) {
          console.error("Error inserting post:", error);
          return res.status(500).json({ message: "Error creating post." });
        }
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

    res.json(results[0]); // Send user data back to the client
  });
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
app.get("/api/usershow", (req, res) => {
  const sql = `
    SELECT 
        *
    FROM users
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
      EXISTS (SELECT 1 FROM likes WHERE likes.post_id = p.id AND likes.user_id = ?) AS liked
    FROM posts p 
    INNER JOIN users a ON p.author_id = a.id;
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Error retrieving posts." });
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

// Endpoint: Update Post
app.put("/api/updatepost2", (req, res) => {
  const { post_id, title, content } = req.body;

  const query = "UPDATE posts SET title = ?, content = ? WHERE id = ?";
  db.query(query, [title, content, post_id], (err, result) => {
    if (err) {
      console.error("Error updating post:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json({ message: "Post updated successfully" });
  });
});
// Endpoint: Update Post
app.put("/api/updateaccount", async (req, res) => {
  const { id, firstname, lastname, dateofbirth, email, password, isModerator } =
    req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "UPDATE users SET firstname = ?, lastname = ?, dateofbirth = ?, email = ?, password = ?, isModerator = ? WHERE id = ?";

    db.query(
      query,
      [
        firstname,
        lastname,
        dateofbirth,
        email,
        hashedPassword,
        isModerator,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating account:", err);
          return res.status(500).json({ error: "Database query failed" });
        }

        res.status(200).json({ message: "Account updated successfully" });
      }
    );
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Failed to hash password" });
  }
});

app.put("/api/user/:id", async (req, res) => {
  const userId = req.params.id;
  const { firstname, lastname, dateofbirth, email, password } = req.body;

  // Construct the query dynamically based on the provided fields
  const updates = [];
  const values = [];

  if (firstname) {
    updates.push("firstname = ?");
    values.push(firstname);
  }

  if (lastname) {
    updates.push("lastname = ?");
    values.push(lastname);
  }

  if (dateofbirth) {
    updates.push("dateofbirth = ?");
    values.push(dateofbirth);
  }

  if (email) {
    updates.push("email = ?");
    values.push(email);
  }

  if (password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    } catch (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: "Failed to hash password" });
    }
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
});

// Endpoint: Delete Post
app.delete("/api/deletepost2/:post_id", (req, res) => {
  const { post_id } = req.params;

  const query = "DELETE FROM posts WHERE id = ?";
  db.query(query, [post_id], (err, result) => {
    if (err) {
      console.error("Error deleting post:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  });
});

app.delete("/api/deleteaccount/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting post:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length === 0) {
      console.log("User not found:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (!isMatch) {
        console.log("Invalid password for user:", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user information in the session
      req.session.userId = user.id;
      req.session.isModerator = user.isModerator;
      console.log("Session data:", req.session);

      console.log("User authenticated successfully:", email);
      const { id, firstName, lastName, dateofbirth, isModerator } = user;
      return res.status(200).json({
        id,
        firstName,
        lastName,
        email,
        dateofbirth,
        isModerator,
        message: "Login successful",
      });
    });
  });
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
      const updatePostSql =
        "UPDATE posts SET like_count = like_count + 1 WHERE id = ?";
      db.query(addLikeSql, [userId, postId], (addErr) => {
        if (addErr) {
          console.error("Error adding like:", addErr);
          return res.status(500).json({ message: "Error adding like." });
        }

        db.query(updatePostSql, [postId], (updateErr) => {
          if (updateErr) {
            console.error("Error updating like count:", updateErr);
            return res
              .status(500)
              .json({ message: "Error updating like count." });
          }

          res
            .status(200)
            .json({ message: "Post liked.", newLikeCount: isLiked + 1 });
        });
      });
    } else if (action === "unlike" && isLiked) {
      // Remove a like
      const removeLikeSql =
        "DELETE FROM likes WHERE post_id = ? AND user_id = ?";
      const updatePostSql =
        "UPDATE posts SET like_count = like_count - 1 WHERE id = ?";
      db.query(removeLikeSql, [postId, userId], (removeErr) => {
        if (removeErr) {
          console.error("Error removing like:", removeErr);
          return res.status(500).json({ message: "Error removing like." });
        }

        db.query(updatePostSql, [postId], (updateErr) => {
          if (updateErr) {
            console.error("Error updating like count:", updateErr);
            return res
              .status(500)
              .json({ message: "Error updating like count." });
          }

          res
            .status(200)
            .json({ message: "Post unliked.", newLikeCount: isLiked - 1 });
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
    const query =
      "INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES (?, ?, ?, ?, NOW())";
    await db.query(query, [commentId, post_id, user_id, content]);
    res.status(201).json({ message: "Comment added successfully." });
  } catch (err) {
    console.error("Failed to add comment:", err);
    res.status(500).json({ error: "Failed to add comment." });
  }
});

app.get("/api/get-comments", (req, res) => {
  const { postId } = req.query;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required." });
  }

  const sql = `
    SELECT 
      c.content, 
      u.firstname, 
      u.lastname, 
      c.created_at 
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

    res.status(200).json(results);
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
  const query = `UPDATE posts SET isFlagged = true WHERE id = ?`;
  db.query(query, [postId], (err, result) => {
    // Changed 'connection' to 'db'
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

  const query = `UPDATE posts SET isFlagged = false WHERE id = ?`;
  db.query(query, [postId], (err, result) => {
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
  const query = `UPDATE posts SET isHidden = true WHERE id = ?`;
  db.query(query, [postId], (err, result) => {
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

  const query = `UPDATE posts SET isHidden = false WHERE id = ?`;
  db.query(query, [postId], (err, result) => {
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
