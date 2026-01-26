import React from "react";
import contactJson from "./data/contact.json";

function ContactPage() {
  const { sections } = contactJson;

  return (
    <div className="page contact-page">
      <h1>{sections.intro.headline}</h1>
      <p>{sections.intro.description}</p>

      <section>
        <img src={sections.details.image} alt="Campus" />
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
