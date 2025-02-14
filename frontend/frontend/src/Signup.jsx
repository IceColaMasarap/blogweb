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
  const [emailError, setEmailError] = useState(""); // For email availability feedback
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // 🚀 Redirect if user is already logged in (except admin)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const isModerator = localStorage.getItem("isModerator");

    if (userId && isModerator !== "Admin") {
      navigate("/home"); // Redirect regular users to home
    }
  }, [navigate]); // Runs only when component mounts


  const handleFirstNameChange = (e) => {
    const input = e.target.value;
    const regex = /^[A-Za-z\s]*$/; // Only letters and spaces

    if (regex.test(input)) {
      setFirstName(input);
    } else {
      setError("First name can only contain letters and spaces.");
    }
  };

  const handleLastNameChange = (e) => {
    const input = e.target.value;
    const regex = /^[A-Za-z\s]*$/; // Only letters and spaces

    if (regex.test(input)) {
      setLastName(input);
    } else {
      setError("Last name can only contain letters and spaces.");
    }
  };



  const handleEmailChange = async (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setEmailError(""); // Clear any previous error message

    if (inputEmail) {
      try {
        const response = await axios.post("http://localhost:5005/api/check-email", { email: inputEmail });
        if (response.data.exists) {
          setEmailError("This email is already registered.");
        }
      } catch (err) {
        console.error("Error checking email:", err);
        setEmailError("Error checking email availability.");
      }
    }
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
    const formattedDate = today.toISOString().split("T")[0];
    setMaxDate(formattedDate);
  }, []);

  return (
    <div className="containerr">
      {/* Left Section */}
      <div className="left-sectionr">
        <div className="logo-containerr">
          <div className="logor">
            <img
              src={TS}
              alt="Tsaaritsa"
              className="logo-imager"
            />
          </div>
          <h1 className="brand-titler">Tsaaritsa.</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-sectionr">
        <h1 className="main-headingr">Everyone’s cup</h1>
        <h1 className="main-headingr">of tea 🍃</h1>

        <p className="sub-headingr">Join Today.</p>
        <form className="formr" onSubmit={handleSubmit}>
          <div className="form-rowr">
            <input
              type="text"
              placeholder="First Name"
              className="input"
              value={firstName}
              onChange={handleFirstNameChange}
            />

            <input
              type="text"
              placeholder="Last Name"
              className="input"
              value={lastName}
              onChange={handleLastNameChange}
            />
            <div className="input-container">
              <label className="bdaylabel">Birthdate</label>
              <input
                type="date"
                className="inputDate"
                max={maxDate}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </div>
          <input
            type="email"
            placeholder="Email Address"
            className="input"
            onChange={handleEmailChange}
          />
          <div className="form-rowr">
            <input
              type="password"
              placeholder="Password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="input"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="buttonr" disabled={!!emailError}>
            Register
          </button>
          {emailError && <p className="errormsg" style={{ color: "red" }}>{emailError}</p>}
          {error && <p className="errormsg" style={{ color: "red" }}>{error}</p>}
          {successMessage && <p className="errormsg" style={{ color: "#15bc11" }}>{successMessage}</p>}
          <div className="linkers">
            <label className="linklabel1">Already have an account? </label>
            <label
              className="linklabel2"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Login here
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
