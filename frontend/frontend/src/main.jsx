import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UserEnd from "./UserEnd.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserEnd />
  </StrictMode>
);
