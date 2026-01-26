import React from "react";
import aboutJson from "../data/about.json";

function AboutPage() {
  const { sections } = aboutJson;

  return (
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
