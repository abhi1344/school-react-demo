import React, { useEffect, useState } from "react";

function ContactPage() {
  const [contactJson, setContactJson] = useState(null);

  useEffect(() => {
    // Load JSON from /public/json/contact.json
    fetch("/json/contact.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load contact.json");
        return res.json();
      })
      .then((data) => setContactJson(data))
      .catch((err) => console.error(err));
  }, []);

  if (!contactJson) {
    return <div className="page contact-page">Loading...</div>;
  }

  const { sections } = contactJson;

  return (
    <div className="page contact-page">
      <h1>{sections.intro.headline}</h1>
      <p>{sections.intro.description}</p>

      <section>
        {/* Image path must be from public/images */}
        <img src={`/images/${sections.details.image}`} alt="Campus" />
        <p><strong>Address:</strong> {sections.details.address}</p>
        <p><strong>Phone:</strong> {sections.details.phone}</p>
        <p><strong>Email:</strong> {sections.details.email}</p>
      </section>

      <section>
        <h2>{sections.office_hours.title}</h2>
        <ul>
          {sections.office_hours.hours.map((h, idx) => (
            <li key={idx}>{h}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ContactPage;
