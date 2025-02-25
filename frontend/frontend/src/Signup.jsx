import { useNavigate } from "react-router-dom";
import "./Signup.css";
import TS from "./assets/tsaaritsa.png";
import axios from "axios";
import { useState, useEffect } from "react";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateofbirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const isModerator = localStorage.getItem("isModerator");

    if (userId && isModerator !== "Admin") {
      navigate("/home");
    }
  }, [navigate]);

  // ✅ Password Strength Checker
  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      return "Too short";
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[\W_]/.test(password);

    const strength = hasUpperCase + hasLowerCase + hasNumber + hasSpecialChar;

    if (strength === 4) return "Strong ✅";
    if (strength === 3) return "Moderate ⚠️";
    return "Weak ❌";
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!firstName || !lastName || !dateofbirth || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (emailError) {
      setError("Please use a different email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength === "Too short" || passwordStrength === "Weak ❌") {
      setError("Password is too weak! Please use a stronger password.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5005/api/register", {
        firstName,
        lastName,
        email,
        dateofbirth,
        password,
      });
      setSuccessMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Error occurred during registration");
      console.log(err);
    }
  };

  useEffect(() => {
    const today = new Date();
    setMaxDate(today.toISOString().split("T")[0]);
  }, []);

  return (
    <div className="containerr">
      <div className="left-sectionr">
        <div className="logo-containerr">
          <div className="logor">
            <img src={TS} alt="Tsaaritsa" className="logo-imager" />
          </div>
          <h1 className="brand-titler">Tsaaritsa.</h1>
        </div>
      </div>

      <div className="right-sectionr">
        <h1 className="main-headingr">Everyone’s cup</h1>
        <h1 className="main-headingr">of tea 🍃</h1>

        <p className="sub-headingr">Join Today.</p>
        <form className="formr" onSubmit={handleSubmit}>
          <div className="form-rowr">
            <input type="text" placeholder="First Name" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last Name" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <div className="input-container">
              <label className="bdaylabel">Birthdate</label>
              <input type="date" className="inputDate" max={maxDate} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
          </div>
          <input type="email" placeholder="Email Address" className="input" onChange={(e) => setEmail(e.target.value)} />

          <div className="form-rowr">
            <input type="password" placeholder="Password" className="input" onChange={handlePasswordChange} />
            <input type="password" placeholder="Confirm Password" className="input" onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          {/* 🚀 Display password strength feedback */}
          {password && <p className={`password-strength ${passwordStrength.includes("Weak") ? "weak" : passwordStrength.includes("Moderate") ? "moderate" : "strong"}`}>{passwordStrength}</p>}

          <button type="submit" className="buttonr" disabled={!!emailError || passwordStrength.includes("Weak")}>
            Register
          </button>

          {emailError && <p className="errormsg" style={{ color: "red" }}>{emailError}</p>}
          {error && <p className="errormsg" style={{ color: "red" }}>{error}</p>}
          {successMessage && <p className="errormsg" style={{ color: "#15bc11" }}>{successMessage}</p>}

          <div className="linkers">
            <label className="linklabel1">Already have an account? </label>
            <label className="linklabel2" style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
              Login here
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
