// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import "./Navbar.css"
export default function Navbar({ onToggleTheme }) {
  const [isHacker, setIsHacker] = useState(true);

  // useEffect(() => {
  //   onToggleTheme(isHacker ? "hacker" : "normal");
  // }, [isHacker, onToggleTheme]);

  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid",
        borderColor: isHacker ? "#00ff00" : "#ccc",
        background: isHacker ? "#000" : "#f9f9f9",
        color: isHacker ? "#00ff00" : "#333",
      }}
    >
     
      <div style={{ fontSize: "1.5rem" }}>💻</div>

     
      <h1
        style={{
          fontFamily: "Courier New, monospace",
          textShadow: isHacker ? "0 0 10px #00ff00" : "none",
        }}
      >
        Mint-Token
      </h1>

     
      <label className="switch">
        <input
          type="checkbox"
          checked={isHacker}
          onChange={() => setIsHacker((prev) => !prev)}
        />
        <span className="slider round"></span>
      </label>
    </nav>
  );
}
