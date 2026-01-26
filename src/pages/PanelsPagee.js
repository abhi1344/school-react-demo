function PanelsPagee({ setPage }) {
  return (
    <div className="panels-page">
      <h1>Choose Your Panel</h1>

      <div className="panels-grid">
        <button
          className="panel-card"
          onClick={() => setPage("admin")}
        >
          <h2>Admin Panel</h2>
          <p>Manage users, classes, notices</p>
        </button>

        <button className="panel-card" disabled>
          <h2>Teacher Panel</h2>
          <p>Coming soon</p>
        </button>

        <button className="panel-card" disabled>
          <h2>Student Panel</h2>
          <p>Coming soon</p>
        </button>
      </div>
    </div>
  );
}

export default PanelsPagee;
