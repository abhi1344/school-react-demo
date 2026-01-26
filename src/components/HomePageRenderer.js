import React, { useState, useEffect } from "react";

const HomeRenderer = ({ json }) => {
  const [width, setWidth] = useState(window.innerWidth);
  const [heroIndex, setHeroIndex] = useState(0);

  // Track window width
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // Hero carousel autoplay
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % json.sections.hero.slides.length);
    }, 5000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, [json.sections.hero.slides.length]);

  const getLayout = (section) => {
    if (width < 768) return section.mobile_layout;
    if (width < 1440) return section.tablet_layout || section.desktop_layout;
    return section.desktop_layout;
  };

  // Render Hero
  const renderHero = (hero) => {
    const slide = hero.slides[heroIndex];
    const layout = getLayout(hero);
  
    const isMobile = width < 768;
    const heroBg = isMobile
      ? slide.background_image.responsive.mobile
      : slide.background_image.responsive.desktop;
  
    return (
      <section
        style={{
          height: layout.height,
          display: "flex",
          alignItems: "center",
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(0,0,0,0.55) 0%,
              rgba(0,0,0,0.35) 45%,
              rgba(0,0,0,0.15) 65%,
              rgba(0,0,0,0) 100%
            ),
            url(${heroBg || slide.background_image.fallback})
          `,
          backgroundSize: width < 768 ? "contain" : "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: width < 768 ? "center" : "center 60%",
          backgroundColor: "#000",
          position: "relative",
          transition: "background-image 0.8s ease-in-out",
        }}
      >
        {/* Content Wrapper */}
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: isMobile ? "2rem" : "0 4rem",
          }}
        >
          <div
            style={{
              maxWidth: "620px",
              color: "#fff",
              animation: "fadeUp 0.9s ease both",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "1.25rem",
              }}
            >
              {slide.headline}
            </h1>
  
            <p
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.7,
                opacity: 0.95,
                marginBottom: "2.25rem",
              }}
            >
              {slide.subtext}
            </p>
  
            {/* Hero CTA */}
            <button
              style={{
                padding: "0.85rem 2.25rem",
                background: "#FF7F50",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              Explore Our School
            </button>
          </div>
        </div>
  
        {/* Bottom transition fade */}
        <div
  style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: width < 768 ? "120px" : "80px",
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #F3F4F6 100%)",
    pointerEvents: "none",
  }}
/>
     </section>
    );
  };
  

  // Render About School
  const renderAboutSchool = (about) => {
    const isMobile = width < 768;
  
    return (
      <section
        style={{
          position: "relative",
          background: "#F3F4F6",
          padding: isMobile ? "3.5rem 1.5rem" : "4.5rem 3rem"
        }}
      >
        {/* Top fade */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "90px",
            background:
              "linear-gradient(to bottom, rgba(243,244,246,0) 0%, #F3F4F6 100%)",
            pointerEvents: "none",
          }}
        />
  
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "4rem",
            alignItems: "stretch", // 🔑 equal height columns
          }}
        >
          {/* TEXT CARD */}
          <div
            style={{
              flex: 1.1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
                padding: isMobile ? "2.25rem" : "2.75rem",
              borderRadius: "22px",
              boxShadow:
                "0 22px 50px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                marginBottom: "0.75rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: json.design_system.colors.primary,
              }}
            >
              Who We Are
            </span>
  
            <h2
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3rem)",
                fontWeight: 700,
                marginBottom: "1.25rem",
                color: "#111827",
              }}
            >
              About Our School
            </h2>
  
            <p
              style={{
                fontSize: "1.12rem",
                lineHeight: 1.75,
                color: "#374151",
                marginBottom: "2.25rem",
              }}
            >
              Our school blends academic excellence with strong character building,
              preparing students for a rapidly evolving world. We cultivate an
              environment where curiosity, confidence, and critical thinking grow
              naturally through innovative teaching and meaningful mentorship.
            </p>
  
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 2rem 0",
                display: "grid",
                gap: ".75rem",
              }}
            >
              {about.highlights.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "1.05rem",
                    fontWeight: 500,
                    color: "#1F2937",
                    padding: "0.7rem 1rem",
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      background: json.design_system.colors.primary,
                      borderRadius: "50%",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
  
            <button
              style={{
                alignSelf: "flex-start",
                padding: "0.9rem 2.2rem",
                background: json.design_system.colors.primary,
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
              }}
            >
              Discover Our Approach
            </button>
          </div>
  
          {/* IMAGE */}
          <div
            style={{
              flex: 0.9,
              display: "flex",
            }}
          >
            <img
              src={about.supporting_visual.placeholder}
              alt={about.supporting_visual.description}
              style={{
                width: "100%",
                height: "100%", // 🔑 matches text height
                objectFit: "cover",
                borderRadius: "22px",
                border: "6px solid #FFFFFF",
                boxShadow: "0 24px 48px rgba(0,0,0,0.16)",
              }}
            />
          </div>
        </div>
      </section>
    );
  };
  
      // Render Highlights


// Render Highlights
const renderHighlights = (highlights) => {
  const layout = getLayout(highlights);
  const columns = layout.columns ?? (width < 768 ? 1 : width < 1440 ? 2 : 3);

  return (
    <section
    style={{
      width: "100%",            // make sure section itself spans entire viewport
      background: "#EEF2F9",    // light grey like About section
      padding: width < 768 ? "3rem 1.5rem" : "5rem 0",  // horizontal padding 0
      boxSizing: "border-box",
    }}
  >
    {/* Header */}
    <div
  style={{
    maxWidth: "1200px",
    margin: "0 auto",
    paddingBottom: "4.5rem", // ⬅️ THIS IS THE FIX
    textAlign: "center",
  }}
>


      <span
        style={{
          display: "inline-block",
          fontSize: highlights.section_intro.text_style?.eyebrow_fontSize || "0.9rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#FF7F50",
          marginBottom: "0.5rem"
        }}
      >
        {highlights.section_intro.eyebrow}
      </span>
  
      <h2
        style={{
          fontSize: highlights.section_intro.text_style?.headline_fontSize || "2.6rem",
          fontWeight: 700,
          margin: "0.5rem 0 1rem",
          color: highlights.section_intro.text_style?.headline_color || "#111827",
        }}
      >
        {highlights.section_intro.headline}
      </h2>
  
      <p
        style={{
          maxWidth: "650px",
          margin: "0 auto 2rem",
          fontSize: highlights.section_intro.text_style?.description_fontSize || "1.1rem",
          lineHeight: 1.75,
          color: highlights.section_intro.text_style?.description_color || "#374151",
        }}
      >
        {highlights.section_intro.description}
      </p>
      {highlights.section_intro.cta && (
  <button
    style={{
      padding: "0.9rem 2.4rem",
      borderRadius: "999px",
      border: "none",
      background: "linear-gradient(135deg, #FF7F50 0%, #FF9A73 100%)",
      color: "#FFFFFF",
      fontWeight: 600,
      fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 14px 30px rgba(255,127,80,0.35)",
      transition: "all 0.25s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow =
        "0 18px 38px rgba(255,127,80,0.45)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow =
        "0 14px 30px rgba(255,127,80,0.35)";
    }}
    onClick={() => (window.location.href = "/about")}
  >
    {highlights.section_intro.cta.label}
  </button>
)}

    </div>
  
    {/* Cards */}
    <div
  style={{
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: "32px",
  }}
>

      {highlights.items?.map((item) => (
        <div
          key={item.title}
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 22px 48px rgba(0,0,0,0.08)",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <div
            style={{
              height: "4px",
              background: json.design_system.colors.primary,
            }}
          />
          <img
            src={item.visual?.placeholder || ""}
            alt={item.visual?.description || ""}
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
            }}
          />
          <div style={{ padding: "1.8rem" }}>
            <h3 style={{ fontSize: "1.35rem", marginBottom: "0.7rem", color: "#111827" }}>
              {item.title}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: 1.65, color: "#374151" }}>
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
  
  );
};

// Render CTA
const renderCTA = (cta) => {
  const layout = getLayout(cta) || {};
  const padding = layout.padding || "48px";

  return (
    <section
    style={{
      maxWidth: "1200px",
      margin: "1rem auto",
      padding: width < 768 ? "3rem 1.5rem" : "4rem 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
  
      background: `
        linear-gradient(
          135deg,
          rgba(255,127,80,0.10) 0%,
          rgba(255,255,255,0.85) 45%,
          rgba(255,255,255,0.95) 100%
        ),
        url(${cta.background_image?.placeholder})
      `,
      backgroundSize: "cover",
      backgroundPosition: "center",
  
      borderRadius: "28px",
      boxShadow:
        "0 30px 60px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
  
      animation: "fadeInUp 1s ease forwards",
    }}
        >
       <h2
  style={{
    fontSize: "clamp(2.6rem, 5vw, 3.4rem)",
    fontWeight: 800,
    color: "#111827",
    marginBottom: "1rem",
    lineHeight: 1.15,
  }}
>
  {cta.headline}
</h2>

<p
  style={{
    maxWidth: "720px",
    fontSize: "1.2rem",
    lineHeight: 1.75,
    color: "#374151",
    marginBottom: "2.5rem",
  }}
>
  {cta.subtext}
</p>
    
      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
        {cta.buttons?.map((btn) => (
          <button
            key={btn.label}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: btn.type === "primary" ? "#FF7F50" : "#fff",
              color: btn.type === "primary" ? "#fff" : "#FF7F50",
              border: btn.type === "primary" ? "none" : "2px solid #FF7F50",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            onClick={() => {
              if (btn.action === "navigate_to_admissions")
                window.location.href = "/admissions";
              else if (btn.action === "navigate_to_contact")
                window.location.href = "/contact";
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </section>
  );
};

  return (
    <main className="page-home">
      {renderHero(json.sections.hero)}
      {renderAboutSchool(json.sections.about_school)}
      {renderHighlights(json.sections.highlights)}
      {renderCTA(json.sections.cta)}
    </main>
  );
};

export default HomeRenderer;
