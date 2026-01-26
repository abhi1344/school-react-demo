import React, { useState } from "react";


function Navbar({ setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = (page) => {
    setPage(page);
    setMenuOpen(false); // close menu on mobile after click
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">SchoolName</div>

        {/* Hamburger for mobile */}
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <button onClick={() => handleClick("home")}>Home</button>
          <button onClick={() => handleClick("notice")}>Notice</button>
          <button onClick={() => handleClick("about")}>About</button>
          <button onClick={() => handleClick("contact")}>Contact</button>
                    <button onClick={() => handleClick("panels")}>Panels</button>
          <button className="btn-primary apply-btn" onClick={() => handleClick("apply")}>
            Apply Now
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
