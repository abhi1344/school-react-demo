import React, { useEffect, useState } from "react";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetch("/json/adminDashboard.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load adminDashboard.json");
        return res.json();
      })
      .then((data) => setDashboardData(data))
      .catch((err) => console.error(err));
  }, []);

  const handleCardClick = (action) => {
    alert(`Clicked on: ${action}`); // placeholder
  };

  if (!dashboardData) {
    return <div className="admin-dashboard">Loading...</div>;
  }

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
