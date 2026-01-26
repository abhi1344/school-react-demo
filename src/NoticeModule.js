import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function NoticeModule() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  // Fetch notices from Supabase
  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from("notice")
      .select("*")
      .order("id", { ascending: false }); // newest first
    if (error) console.error(error);
    else setNotices(data || []);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Create notice
  const createNotice = async () => {
    if (!title || !message || !date) return alert("Please fill all fields");

    const { error } = await supabase
      .from("notice")
      .insert([{ title, message, date }]);
    if (error) console.error(error);
    else fetchNotices();

    setTitle("");
    setMessage("");
    setDate("");
  };

  // Delete notice
  const deleteNotice = async (id) => {
    const { error } = await supabase
      .from("notice")
      .delete()
      .eq("id", id);
    if (error) console.error(error);
    else fetchNotices();
  };

  return (
    <div className="page" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>Notice Board</h1>

      {/* Create Notice Form */}
      <section
        style={{
          padding: "24px",
          background: "#f8fafc",
          borderRadius: "16px",
          marginBottom: "32px",
        }}
      >
        <h2>Create Notice</h2>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            minHeight: "80px",
          }}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            marginBottom: "12px",
          }}
        />

        <button onClick={createNotice} className="btn-primary">
          Create Notice
        </button>
      </section>

      {/* Display Notices */}
      <section>
        <h2>Notices</h2>
        {notices.length === 0 && <p>No notices yet.</p>}

        {notices.map((n) => (
          <div
            key={n.id}
            style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "16px",
              marginBottom: "16px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              position: "relative",
            }}
          >
            <h3>{n.title}</h3>
            <p>{n.message}</p>
            <small style={{ color: "#6b7280" }}>{n.date}</small>

            {/* Erase button */}
            <button
              onClick={() => deleteNotice(n.id)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Erase
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
