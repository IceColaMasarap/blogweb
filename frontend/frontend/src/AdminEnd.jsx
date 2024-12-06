import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import AnotherComponent from "./Posts"; // Example for another route
import Accounts from "./Accounts";
import Login from "./Login";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="rootcontent">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/posts" element={<AnotherComponent />} />
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
