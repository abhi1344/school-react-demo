
import React, { useEffect, useState } from "react";

function AboutPage() {
  const [aboutJson, setAboutJson] = useState(null);

  useEffect(() => {
    fetch("/json/about.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load about.json");
        return res.json();
      })
      .then((data) => setAboutJson(data))
      .catch((err) => console.error(err));
  }, []);

  if (!aboutJson) {
    return <div className="page about-page">Loading...</div>;
  }

  const { sections } = aboutJson;return (
    <div className="page about-page">
      <h1>{sections.intro.headline}</h1>
      <p>{sections.intro.description}</p>

      <section>
        <h2>{sections.mission.title}</h2>
        <img src={sections.mission.image} alt="Mission" />
        <p>{sections.mission.content}</p>
      </section>

      <section>
        <h2>{sections.vision.title}</h2>
        <img src={sections.vision.image} alt="Vision" />
        <p>{sections.vision.content}</p>
      </section>

      <section>
        <h2>{sections.values.title}</h2>
        <img src={sections.values.image} alt="Values" />
        <ul>
          {sections.values.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AboutPage;
