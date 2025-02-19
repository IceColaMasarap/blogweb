import TS from "./assets/tsaaritsa.png";
import "./Login.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for previous attempt count and cooldown
    const storedAttempts = parseInt(localStorage.getItem("attemptCount")) || 0;
    const cooldownStart = parseInt(localStorage.getItem("cooldownStart"));

    setAttemptCount(storedAttempts);

    // Check if cooldown is still active
    if (cooldownStart) {
      const now = Date.now();
      const elapsed = now - cooldownStart;
      if (elapsed < 10000) {
        setCooldown(true);
        setError("Too many failed attempts. Please try again in 10 seconds.");

        // Set a timer for the remaining cooldown time
        const remainingCooldown = 10000 - elapsed;
        const timer = setTimeout(() => {
          resetCooldown();
        }, remainingCooldown);

        return () => clearTimeout(timer);
      } else {
        resetCooldown(); // Reset if cooldown has expired
      }
    }
  }, []);

  const resetCooldown = () => {
    setAttemptCount(0);
    setCooldown(false);
    setError("");
    localStorage.removeItem("attemptCount");
    localStorage.removeItem("cooldownStart");
  };

  useEffect(() => {
    if (attemptCount >= 5) {
      setCooldown(true);
      setError("Too many failed attempts. Please try again in 10 seconds.");
      localStorage.setItem("cooldownStart", Date.now().toString());

      // Start a 10-second cooldown
      const timer = setTimeout(() => {
        resetCooldown();
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [attemptCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown) return;

    setError("");

    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5005/api/login", {
        email,
        password,
      });

      const data = response.data;

      if (data.error) {
        setError("Invalid credentials, please try again.");
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        localStorage.setItem("attemptCount", newAttemptCount.toString());
      } else {
        localStorage.setItem("userId", data.user.id);
        if (data.user.isModerator !== undefined) {
          localStorage.setItem("isModerator", data.user.isModerator.toString());
        }

        if (data.user.isModerator === "Admin") {
          setError("An error occurred during login.");
        } else {
          if (data.user.email === "admin@gmail.com") {
            navigate("/adminpage/");
          } else {
            navigate("/home");
          }
        }
      }
    } catch (err) {
      setError("An error occurred during login");
      console.log("Error logging in:", err);
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      localStorage.setItem("attemptCount", newAttemptCount.toString());
    }
  };

  return (
    <div className="container">
      <div className="left-sectionl">
        <div className="logo-container">
          <div className="logo">
            <img src={TS} alt="Tsaaritsa" className="logo-image" />
          </div>
          <h1 className="brand-titler">Tsaaritsa.</h1>
        </div>
      </div>

      <div className="right-sectionl">
        <h1 className="main-headingr">Everyone’s cup</h1>
        <h1 className="main-headingr">of tea 🍃</h1>
        <p className="sub-headingr">Welcome back!</p>
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="buttonr" disabled={cooldown}>
            Login
          </button>
          {error && (
            <p className="errormsg" style={{ color: "red" }}>
              {error}
            </p>
          )}
          <div className="linkers">
            <label className="linklabel1">No account yet? </label>
            <label
              className="linklabel2"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Signup here.
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
