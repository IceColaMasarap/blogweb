import { useNavigate } from "react-router-dom";
import "./App.css";

function Signup() {
  const navigate = useNavigate();
  return (
    <div className="loginpage">
      <form className="loginForm" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="First Name"
          required
          className="formInput"
        />
        <input
          type="text"
          placeholder="Last Name"
          required
          className="formInput"
        />
        <input type="date" required className="formInput" />
        <input
          type="email"
          placeholder="e.g. johndoe@gmail.com"
          required
          className="formInput"
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="formInput"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          required
          className="formInput"
        />
        <button type="submit" className="formButton">
          Login
        </button>
      </form>
      <label className="registerlabel">Already have an account? </label>
      <label
        className="registerlabelnav"
        id="tologin"
        onClick={() => {
          navigate("/login");
        }}
      >
        Log in here
      </label>
    </div>
  );
}
export default Signup;
