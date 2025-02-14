import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Posts from "./Posts";
import Accounts from "./Accounts";
import AdminAccount from "./AdminAccounts";

import "./App.css";

function AdminEnd() {
  return (
    <div className="rootcontent">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/adminaccounts" element={<AdminAccount />} />
      </Routes>
    </div>
  );
}

export default AdminEnd;
