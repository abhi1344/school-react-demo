import React from "react";
import dashboardData from "../data/adminDashboard.json";

function AdminDashboard() {
  const handleCardClick = (action) => {
    alert(`Clicked on: ${action}`); // Placeholder for actual navigation
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-cards">
        {dashboardData.cards.map((card, idx) => (
          <div
            key={idx}
            className="dashboard-card"
            onClick={() => handleCardClick(card.action)}
          >
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
