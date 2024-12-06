import { useNavigate } from "react-router-dom";
import "./App.css";

function Login() {
  const navigate = useNavigate();
  return (
    <div className="loginpage">
      <form className="loginForm" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="e.g. johndoe@gmail.com"
          required
          className="formInput"
        />
        <input
          type="password"
          placeholder="e.g. johndoe123"
          required
          className="formInput"
        />
        <button type="submit" className="formButton">
          Login
        </button>
      </form>
      <label className="registerlabel">No account yet? </label>
      <label
        className="registerlabelnav"
        id="tologin"
        onClick={() => {
          navigate("/");
        }}
      >
        Sign up here
      </label>
    </div>
  );
}

export default Login;
