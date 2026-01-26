import React, { useState } from "react";
import HomePage from "./pages/Home";  // matches your file
import NoticeModule from "./NoticeModule";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import Navbar from "./Navbar";
import PanelsPagee from "./pages/PanelsPagee"; 
import AdminDashboard from "./pages/AdminDashboard";
function App() {
  const [page, setPage] = useState("home");

  return (
    <div>
      <Navbar setPage={setPage} />

      {page === "home" && <HomePage />}
      {page === "notice" && <NoticeModule />}
      {page === "about" && <AboutPage />}
      {page === "contact" && <ContactPage />}
      {page === "panels" && <PanelsPagee setPage={setPage} />}
      {page === "admin" && <AdminDashboard />}
    </div>
  );
}

export default App;
